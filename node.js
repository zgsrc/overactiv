const { computed, observe, dispose, handlers: { write } } = require('hyperactive');

function host(wss) {
    wss.host = (obj, options) => {
        obj = obj || { };
        
        wss.on('connection', socket => {
            socket.on('sync', message => ({ type: 'sync', state: socket.send(obj) }));
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

exports.host = host;

function open(ws, obj) {
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
        }
        else if (msg.type == 'update') {
            update(msg.path, msg.value);
        }
    });
    
    ws.on('open', () => ws.send('sync'));
    return obj;
}

exports.open = open;