const WebSocket = require('ws');
const { write } = require('hyperactive');

function createServer(options) {
    if (options == null) options = 8080;
    if (Number.isInteger(options)) return new WebSocket.Server({ port: options });
    else return new WebSocket.Server({ options });
}

exports.createServer = createServer;

function extendServer(wss) {
    wss.host = (obj, options) => {
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
}

exports.extendServer = extendServer;

function open(url, obj) {
    const ws = new WebSocket(url || "ws://localhost:8080");
    obj = obj || { };

    const update = write(obj);
    ws.on('open', () => ws.send('sync'));
    ws.on('message', msg => {
        if (msg.type == 'sync') Object.assign(obj, msg.value);
        else if (msg.type == 'update') update(msg.path, msg.value);
    });
}

exports.open = open;