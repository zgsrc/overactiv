# Overactiv
Hyperactiv over WebSocket

    npm install https://github.com/zgsrc/overactiv
    
# Server

```javascript
const WebSocket = require('ws');
const overactiv = require('overactiv');

const wss = overactive(new WebSocket.Server({ port: 8080 }));
const liveObject = wss.host({ });
```

# Client

```html
<html>
    <head>
        <script src="./node_modules/overactiv/browser.js"></script>
    </head>
    <body onload="overactiv('ws://localhost:8080', window.remoteObject = { })">
    
    </body>
</html>
```