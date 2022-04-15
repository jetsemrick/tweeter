const http = require('http');

const requestListener = function (req, res) 
{
  res.writeHead(200);
}

const server = http.createServer(requestListener);
server.listen(8080);