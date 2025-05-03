require("http").Server.prototype.getConnections = (cb) => cb(null, 0);
