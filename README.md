# Overactiv
[Hyperactiv](https://github.com/elbywan/hyperactiv) over [WebSocket](https://github.com/websockets/ws) + RPC

    npm install overactiv
    
# Plain WebSockets

```javascript
const WebSocket = require('ws');
const overactiv = require('overactiv').server;
const wss = overactiv(new WebSocket.Server({ port: 8080 }));

const remoteObject = wss.host({ });
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
```

# Node WebSocket Client

```javascript
const WebSocket = require('ws');
const overactiv = require('overactiv').client;
const remoteObject = overactiv(new WebSocket("ws://localhost:8080"));

remoteObject.someMethod();
remoteObject.value === "This has been set!";
```

# Browser WebSocket Client

```html
<html>
    <head>
        <script src="https://unpkg.com/hyperactiv" ></script>
        <script src="https://unpkg.com/hyperactiv/handlers/index.js" ></script>
        <script src="https://unpkg.com/overactiv/browser.js"></script>
    </head>
    <body onload="overactiv('ws://localhost:8080', window.remoteObject = { })">
        Check developer console for "remoteObject"
    </body>
</html>
```