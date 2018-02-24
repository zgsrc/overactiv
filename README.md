# Overactiv
[Hyperactiv](https://github.com/zgsrc/hyperactiv) over [WebSocket](https://github.com/websockets/ws) + RPC

    npm install https://github.com/zgsrc/overactiv
    
# Node.js Server

```javascript
const WebSocket = require('ws');
const overactiv = require('overactiv').server;
const wss = overactiv(new WebSocket.Server({ port: 8080 }));
const liveObject = wss.host({ });
```

# Node.js Client

```javascript
const WebSocket = require('ws');
const overactiv = require('overactiv').client;
const remoteObject = overactiv(new WebSocket("ws://localhost:8080"));
```

# Browser Client

```html
<html>
    <head>
        <script src="./node_modules/overactiv/browser.js"></script>
    </head>
    <body onload="overactiv('ws://localhost:8080', window.remoteObject = { })">
    
    </body>
</html>
```