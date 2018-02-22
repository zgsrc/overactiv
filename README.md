# Overactiv
Hyperactiv over WebSocket

    npm install https://github.com/zgsrc/overactiv
    
# Server

```javascript
const overactiv = require('overactiv');

const wss = overactive.createServer();
overactive.extendServer(wss);

const liveObject = overactive.host({ });
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