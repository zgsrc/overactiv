window.overactiv = (url, obj) => {
    const socket = new WebSocket(url || 'ws://localhost:8080');
    socket.addEventListener('message', msg => {
        if (msg.type == 'sync') {
            if (typeof obj === 'function') {
                obj(msg.value)
            }
            else {
                Object.assign(obj, msg.value);
            }
        }
        else if (msg.type == 'update') {
            update(msg.path, msg.value);
        }
        else {
            console.warn('Unrecognized message ' + (msg.type || msg));
        }
    });
    
    socket.addEventListener('open', () => {
        socket.send('sync');
    });
    
    return obj;
};