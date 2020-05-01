//Configuration variables
const port = process.env.PORT || '8080';
const ip = process.env.IP || 'localhost'; //'192.168.0.2';

const client_id_base = 'http://' + ip + ':' + port;

module.exports = {
  port,
  ip,
  client_id_base,
};
