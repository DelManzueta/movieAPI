const http = require('http');
url = require('url');

http.createServer((request, response) => {
    let requestUrl = url.parse(request.url, true);
    if (requestUrl.pathname == '/documentation.html') {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('Documentation on the book club API .\n');
    } else {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('Welcome to my book club! \n');
    }
}).listen(8080);


console.log('My first Node test server is running on Port 8080.');