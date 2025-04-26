const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', message: 'Server is running' }));
});

const port = 3001;
server.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});
