const {observe, container} = require('hyperactiv'),
      handlers = require('hyperactiv/handlers').handlers;

function send(socket, obj) {
    socket.send(JSON.stringify(obj));
}

function findRemoteMethods(obj, stack, methods) {
    if (!stack) stack = [ ];
    if (!methods) methods = [ ];
    if (typeof obj === 'object') {
        if (obj.__remoteMethods) {
            if (!Array.isArray(obj.__remoteMethods)) obj.__remoteMethods = [ obj.__remoteMethods ];
            obj.__remoteMethods.forEach(method => {
                stack.push(method);
                methods.push(stack.slice(0));
                stack.pop();
            });
        }
        
        Object.keys(obj).forEach(key => {
            stack.push(key);
            findRemoteMethods(obj[key], stack, methods);
            stack.pop();
        })
    }
    
    return methods;
}

exports.host = function host(wss) {
    wss.host = () => {
        const obj = container((keys, value, old) => {
            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    send(client, { type: 'update', keys: keys, value: value, old: old });
                }
            })
        })
        
        wss.on('connection', socket => {
            socket.on('error', err => null);
            
            socket.on('message', async message => {
                if (message == 'sync') {
                    send(socket, { type: 'sync', state: obj, methods: findRemoteMethods(obj) });
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