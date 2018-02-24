window.overactiv = (url, obj) => {
    const id = 1, 
          cbs = { },
          ws = new WebSocket(url || 'ws://localhost:8080'),
          update = handlers.write(obj);
    
    ws.addEventListener('message', msg => {
        if (msg.type == 'sync') {
            if (typeof obj === 'function') obj = obj(msg.value);
            else Object.assign(obj, msg.value);
            
            list.forEach(keys => update(keys, async () => {
                ws.send('call', { keys: keys, args: arguments, request: id });
                return cbs[id++] = new Promise();
            }));
        }
        else if (msg.type == 'update') update(msg.path, msg.value);
        else console.warn('Unrecognized message ' + (msg.type || msg));
    });
    
    ws.addEventListener('open', () => ws.send('sync'));
};