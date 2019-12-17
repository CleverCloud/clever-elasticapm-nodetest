'use strict';

const statuses = require('statuses');
const apm = require('elastic-apm-node').start()

module.exports = {
  name: 'status-codes.routes',
  async register (server, options) {

    server.route([

      {
        method: '*',
        path: '/{any*}',
        async handler (request, h) {
          return {}
        },
      },

      {
        method: '*',
        path: '/status-codes/{statusCode}',
        async handler (request, h) {

          const statusCodeStr = request.params.statusCode;
          const statusCode = Number(statusCodeStr);
          const responseStatusCode = (statuses.STATUS_CODES[statusCode] == null)
            ? 400
            : statusCode;

          const responseMessage = (statuses.STATUS_CODES[statusCode] == null)
            ? 'statusCode must be a valid HTTP status code number'
            : `${statusCode}: ${statuses.STATUS_CODES[statusCode]}`;

          const resp = statuses.empty[responseStatusCode]
            ? h.response()
            : h.response(responseMessage);

          resp.code(responseStatusCode);

          if (statuses.redirect[responseStatusCode]) {
            resp.header('Location', '/');
          }

          return resp;
        },
      },

    ]);
  },
};
