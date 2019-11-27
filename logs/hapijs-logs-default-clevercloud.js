'use strict';

const Good = require('@hapi/good');
const goodReject = require('./good-reject.js');
const goodTransform = require('./good-transform.js');
const { isHaProxyClosedConnectionError, isTelegrafPing, removeId, revealForwardedInstance } = require('./good-clevercloud');

module.exports = {
  plugin: Good,
  options: {
    // we don't really need ops since we have metrics
    ops: false,
    // we'll need the request headers to reject and transform the response events
    includes: { request: ['headers'] },
    reporters: {
      console: [

        // Clever cloud apps are proxified behind HAProxy servers
        // In order to check if apps are up, those HAProxy open TCP connections regularly
        // Those TCP connections are closed abruptly to save time but trigger errors
        // We reject those errors from the logs
        goodReject(isHaProxyClosedConnectionError),

        // Clever cloud apps are monitored every minute with an HTTP GET on /
        // We reject those requests from the logs
        goodReject(isTelegrafPing),

        // By default good-console prints an id (a long string) for each line of logs
        // We don't need those verbose details
        goodTransform(removeId),

        // By default good-console prints the protocol+host+port of the request
        // This is useless when the app is behind a proxy
        // Here we try to use x-forwarded-* headers to display the original request
        goodTransform(revealForwardedInstance),

        goodTransform((e) => {
          return { ...e, query: null };
        }),

        // Transform object to formatted strings
        { module: '@hapi/good-console' },

        // Writes to stdout
        'stdout',
      ],
    },
  },
};
