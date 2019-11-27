'use strict';

const config = require('./config/config.js');
const forceHttps = require('hapi-require-https');
const Hapi = require('@hapi/hapi');
const logsToConsole = require('./logs/hapijs-logs-default-clevercloud.js');
const statusCodes = require('./status-codes.js');

const security = {
  hsts: {
    maxAge: 42 * 24 * 60 * 60,
    includeSubDomains: true,
  },
  xframe: 'deny',
  xss: true,
  referrer: 'same-origin',
};

async function createServer () {

  const isProduction = config.get('NODE_ENV') === 'production';

  const server = Hapi.server({
    port: config.get('PORT'),
    routes: { security },
  });

  if (isProduction) {
    await server.register(forceHttps);
  }

  await server.register([
    logsToConsole,
    statusCodes,
  ]);

  return server;
}

module.exports = { createServer };
