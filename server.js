const http = require('http'),
    { response } = require('express'),
    { includes } = require('lodash'),
    fs = require('fs'),
    url = require('url'),
    hostname = '127.0.0.1',
    port = 3000,
    server = http.createServer((req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Hello World');
        let addr = request.url,
            q = url.parse(addr, true),
            filePath = '';
        if (q.pathname.includes('documentation')) {
            filePath = (__dirname + '/documentation.html');
        } else {
            filePath = 'index.html';
        }
        fs.readFile('./log.txt', 'utf-8', (err, data) => {
            if (err) { throw err; };
            console.log('data: ', data);
        });
        fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Add to log.');
            }
        });
        let qdata = q.query;
        console.log(qdata.page);
    });

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});