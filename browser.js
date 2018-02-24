window.overactiv = (url, obj, debug) => {
    const id = 1, 
          cbs = { },
          ws = new WebSocket(url || 'ws://localhost:8080'),
          update = hyperactiv.handlers.write(obj);
    
    ws.addEventListener('message', msg => {
        msg = JSON.parse(msg.data);
        if (debug) console.debug(msg);
        if (msg.type == 'sync') {
            if (typeof obj === 'function') obj = obj(msg.value);
            else Object.assign(obj, msg.value);
            msg.methods.forEach(keys => update(keys, async () => {
                ws.send('call', { keys: keys, args: arguments, request: id });
                return cbs[id++] = new Promise();
            }));
        }
        else if (msg.type == 'update') {
            update(msg.keys, msg.value);
        }
        else if (msg.type == 'response') {
            cbs[msg.request].resolve(msg.result);
            delete cbs[msg.request];
        }
        else console.warn('Unrecognized message ' + (msg.type || msg));
    });
    
    ws.addEventListener('open', () => ws.send('sync'));
};