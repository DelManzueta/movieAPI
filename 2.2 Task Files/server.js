const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});


const url = require('url');
let addr = 'http://localhost:8080/index.html?page=documentation';
let q = url.parse(addr, true);

console.log(q.host);
console.log(q.pathname);
console.log(q.search);

let qdata = q.query;
console.log(qdata.page);

const fs = require('fs');

fs.readFile('./log.txt', 'utf-8', (err, data) => {
    if (err) { throw err; }
    console.log('data: ', data);
});