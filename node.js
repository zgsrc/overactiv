const observe = require('hyperactiv').observe,
      handlers = require('hyperactiv/handlers').handlers;

function stripMethods(obj, stack, list) {
    if (!obj || typeof obj !== 'object' || obj instanceof Date || Array.isArray(obj)) return;
    
    stack = stack || [ ];
    list = list || [ ];
    
    let props = Object.getOwnPropertyNames(obj);
    let name = Object.getPrototypeOf(obj).constructor.name;
    if (["Array", "Object", "Date", "Boolean", "Number", "String"].indexOf(name) < 0) {
        props.push(...Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).filter(p => p != "constructor" && p != "toString"));
    }
    else props = [ ];
    
    props.forEach(prop => {
        stack.push(prop);
        if (typeof obj[prop] === 'function') list.push(stack.slice(0));
        stack.pop();
    });
    
    Object.keys(obj).forEach(prop => {
        stack.push(prop);
        if (typeof obj[prop] == 'object') stripMethods(obj[prop], stack, list);
        stack.pop();
    });
    
    return list;
}

function send(socket, obj) {
    socket.send(JSON.stringify(obj));
}

exports.host = function host(wss) {
    wss.host = (obj, options) => {
        obj = obj || { };
        
        wss.on('connection', socket => {
            socket.on('error', err => null);
            
            socket.on('message', async message => {
                if (message == 'sync') {
                    send(socket, { type: 'sync', state: obj, methods: stripMethods(obj) });
                }
                else {
                    message = JSON.parse(message);
                    if (message.type && message.type == 'call') {
                        let cxt = obj, result = null;
                        message.keys.forEach(key => cxt = cxt[key]);
                        try { result = await cxt(...message.args); }
                        catch (ex) { result = ex; }
                        send(socket, { type: 'response', result: result, request: message.request });
                    }
                }
            });
        });
        
        let opts = { 
            bind: true,
            deep: true,
            batch: true,
            handler: (keys, value) => {
                wss.clients.forEach(client => {
                    if (client.readyState === 1) {
                        send(client, { type: 'update', keys: keys, value: value });
                    }
                })
            }
        };
        
        Object.assign(opts, options || { });
        obj = observe(obj, opts);
        return obj;
    };
    
    return wss;
}

const id = 1, cbs = { };
exports.open = function open(ws, obj) {
    const update = handlers.write(obj);
    ws.on('message', msg => {
        msg = JSON.parse(msg);
        if (msg.type == 'sync') {
            if (obj && typeof obj === 'function') {
                obj = observe(obj(msg.value), { deep: true, batch: true });
            }
            else {
                if (obj == null) obj = observe(msg.value, { deep: true, batch: true });
                else Object.assign(obj, msg.value);
            }
            
            msg.methods.forEach(keys => update(keys, async () => {
                let promise = cbs[id] = new Promise();
                send(ws, { type: 'call', keys: keys, args: arguments, request: id++ });
                return promise;
            }));
        }
        else if (msg.type == 'update') {
            update(msg.keys, msg.value);
        }
        else if (msg.type == 'response') {
            cbs[msg.request].resolve(msg.result);
            delete cbs[msg.request];
        }
    });
    
    ws.on('open', () => ws.send('sync'));
    return obj;
}