window.overactiv = (url, obj) => {
    const socket = new WebSocket(url || 'ws://localhost:8080');
    obj = obj || { };
    socket.addEventListener('open', () => socket.send('sync'));
    socket.addEventListener('message', msg => {
        if (msg.type == 'sync') Object.assign(obj, msg.value);
        else if (msg.type == 'update') update(msg.path, msg.value);
    });    
    
    return obj;
};