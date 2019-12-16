'use strict';

const redis = require('redis');
const { promisify } = require('util');
const statuses = require('statuses');

const config = require('./config/config.js');

const { APP_ID } = process.env;

const redisClient = redis.createClient({
  host: config.get('REDIS_HOST'),
  port: config.get('REDIS_PORT'),
  password: config.get('REDIS_PASSWORD'),
});

const expireAsync = promisify(redisClient.expire).bind(redisClient);
const hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);
const hincrbyAsync = promisify(redisClient.hincrby).bind(redisClient);
const keysAsync = promisify(redisClient.keys).bind(redisClient);
const llenAsync = promisify(redisClient.llen).bind(redisClient);
const rpushAsync = promisify(redisClient.rpush).bind(redisClient);

function mapObject (obj, mapCallback) {
  return Object.fromEntries(Object.entries(obj).map(mapCallback));
}

async function recordResponse (statusCode, xTestScheduler = 'outside') {

  // YYYY-MM-DDT-HH
  const date = new Date().toISOString().slice(0, 13);
  const redisKey = `${APP_ID}_${xTestScheduler}_${date}`;

  console.log({ redisKey });

  // Expire in 25 hours
  await expireAsync(redisKey, 60 * 60 * 25);

  // Increment status code count for current hour
  await hincrbyAsync(redisKey, statusCode, 1);
}

module.exports = {
  name: 'status-codes.routes',
  async register (server, options) {

    server.route([

      {
        method: '*',
        path: '/{any*}',
        async handler (request, h) {

          await recordResponse(200);

          const keys = await keysAsync(`${APP_ID}_*`);
          const counts = {};
          for (let k of keys) {
            const rawCountsForHour = await hgetallAsync(k);
            counts[k] = mapObject(rawCountsForHour, ([statusCode, countStr]) => [statusCode, Number(countStr)]);
            counts[k]['TOTAL'] = Object.values(counts[k]).reduce((a, b) => a + b, 0);
          }

          // COMPUTE TOTAL
          counts[`${APP_ID}_ALL`] = Object
            .values(counts)
            .reduce((result, item) => {
              Object.entries(item).forEach(([code, count]) => {
                if (result[code] == null) {
                  result[code] = 0;
                }
                result[code] += count;
              });
              return result;
            }, {});

          return h.response(counts);
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

          await recordResponse(responseStatusCode, 'ALL');
          if (request.headers['x-test-scheduler'] != null) {
            await recordResponse(responseStatusCode, request.headers['x-test-scheduler']);
          }

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
