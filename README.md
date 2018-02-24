# Overactiv
[Hyperactiv](https://github.com/zgsrc/hyperactiv) over [WebSocket](https://github.com/websockets/ws) + RPC

    npm install https://github.com/zgsrc/overactiv
    
# Plain Websockets

```javascript
const WebSocket = require('ws');
const overactiv = require('overactiv').server;
const wss = overactiv(new WebSocket.Server({ port: 8080 }));
const liveObject = wss.host({ });
```

# Express Server

```javascript
const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const overactiv = require('overactiv').server;

const app = express();
const server = http.createServer(app);
const wss = overactiv(new WebSocket.Server({ server }));

server.listen(8080);

const remoteObject = wss.host({ });

```

# Websocket Client

```javascript
const WebSocket = require('ws');
const overactiv = require('overactiv').client;
const remoteObject = overactiv(new WebSocket("ws://localhost:8080"));
```

# Browser Client

```html
<html>
    <head>
        <script src="hyperactiv.js"></script>    
        <script src="overactiv.js"></script>
    </head>
    <body onload="overactiv('ws://localhost:8080', window.remoteObject = { })">
        Check developer console for "remoteObject"
    </body>
</html>
```