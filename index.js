const http = require('http');
const sIO = require('socket.io');
const fs = require('fs');

class Server {
  constructor(port, host) {

    this._sockets = {};

    this._app = http.createServer((...args) => this._handler(...args));
    this._io = sIO(this._app, {path: '/socket.io/'});

    this._app.listen(port, host);
    this._io.on('connection', (...args) => this._socketConnection(...args));
  }
  _handler(req, res) {
    const file = req.url.slice(1);
    console.log('REQ:', file);
    fs.readFile(file, (err, data) => {
      if (err) {
        console.log(err);
        res.writeHead(404);
        res.end('404');
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  }
  _socketConnection(socket) {
    console.log('   CONNECT', socket.id);
    this._sockets[socket.id] = socket;

    socket.on('disconnect', (reason) => {
      console.log('DISCONNECT', socket.id, reason);
      delete this._sockets[socket.id];
    });
  }
  exit() {
    if (this._app) this._app.close();
    if (this._io) this._io.close();
    process.exit(-1);
  }
}

if (require.main === module) {
  console.log('Started via CLI, booting up...');
  const server = new Server(process.argv[2], process.argv[3]);

  process.on('SIGINT', server.exit);
  process.on('SIGTERM', server.exit);
}
module.exports = Server;