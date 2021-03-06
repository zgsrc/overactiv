const fs = require('fs');
const repl = require('repl');
const path = require('path');

const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const overactiv = require('../index').server;

const app = express();

app.get("/", (req, res) => res.sendFile(path.resolve("./example/example.html")))
app.get("/hyperactiv.js", (req, res) => res.sendFile(path.resolve("./node_modules/hyperactiv/dist/index.js")))
app.get("/hyperactiv.handlers.js", (req, res) => res.sendFile(path.resolve("./node_modules/hyperactiv/handlers/index.js")))
app.get("/browser.js", (req, res) => res.sendFile(path.resolve("./browser.js")))

const server = http.createServer(app);
const wss = overactiv(new WebSocket.Server({ server }));

class MyClass {
    constructor() {
        this.value = "This is an initial value";
    }
    someMethod() {
        this.value = "This has been set!";
    }
    someOtherMethod() {
        this.value = "This has been set by the other method!";
    }
}

const remoteObject = wss.host(new MyClass());

const terminal = repl.start("> ");
terminal.context.remoteObject = remoteObject;
terminal.on('exit', () => process.exit(0));

server.listen(8080);