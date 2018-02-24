window.overactiv = (url, obj) => {
    const socket = new WebSocket(url || 'ws://localhost:8080');
    
    obj = obj || observe({ }, { deep: true, batch: true });
    
    socket.addEventListener('message', msg => {
        if (msg.type == 'sync') Object.assign(obj, msg.value);
        else if (msg.type == 'update') update(msg.path, msg.value);
        else console.log('Unrecognized message ' + (msg.type || msg));
    });
    
    socket.addEventListener('open', () => {
        socket.send('sync');
    });
    
    return obj;
};