const net = require('net');
const getPort = async (port = 0) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
};

module.exports = getPort().then(port => {
  console.log(port);
  return port;
});