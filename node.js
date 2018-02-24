const { observe, handlers: { write, debug, all } } = require('hyperactive');

function stripMethods(obj, stack, list) {
    stack = stack || [ ];
    list = list || [ ];
    obj.getOwnPropertyNames().forEach(prop => {
        stack.push(prop);
        if (typeof obj[prop] === 'function') list.push(stack.slice(0));
        else if (typeof obj[prop] === 'object') stripMethods(obj, stack, list);
        stack.pop();
    });
    
    return list;
}

exports.host = function host(wss) {
    wss.host = (obj, options) => {
        obj = obj || { };
        
        wss.on('connection', socket => {
            socket.on('sync', message => {
                socket.send({ type: 'sync', state: socket.send(obj), methods: stripMethods(obj) });
            });
            
            socket.on('call', async message => {
                let cxt = obj, result = null;
                message.keys.forEach(key => cxt = cxt[key]);
                try { result = await cxt(...message.args); }
                catch (ex) { result = ex; }
                socket.send({ type: 'response', result: result, request: message.request });
            });
        });
        
        let opts = { 
            deep: true, 
            handler: function(path, value) {
                let msg = { type: 'update', path: path, value: value };
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) client.send(msg);
                });
            }
        };
        
        Object.assign(opts, options || { });
        return observe(obj, opts);
    };
    
    return wss;
}

const id = 1, cbs = { };
exports.open = function open(ws, obj) {
    const update = handlers.write(obj);
    ws.on('message', msg => {
        if (msg.type == 'sync') {
            if (obj && typeof obj === 'function') {
                obj = observe(obj(msg.value), { deep: true, batch: true });
            }
            else {
                if (obj == null) obj = observe(msg.value, { deep: true, batch: true });
                else Object.assign(obj, msg.value);
            }
            
            list.forEach(keys => update(keys, async () => {
                let promise = cbs[id] = new Promise();
                ws.send('call', { keys: keys, args: arguments, request: id++ });
                return promise;
            }));
        }
        else if (msg.type == 'update') {
            update(msg.path, msg.value);
        }
        else if (msg.type == 'response') {
            cbs[msg.request].resolve(msg.result);
        }
    });
    
    ws.on('open', () => ws.send('sync'));
    return obj;
}