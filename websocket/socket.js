var ws = require('node-ws');

var instance = new ws();

instance.listen(process.env.wsport);