'use strict';

const convict = require('convict');

const conf = convict({
  NODE_ENV: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  PORT: {
    doc: 'The port on which the server is running',
    format: Number,
    default: '8080',
    required: true,
    env: 'PORT',
  },
  REDIS_HOST: {
    doc: 'Host to access redis instance',
    format: String,
    required: true,
    default: null,
    env: 'REDIS_HOST',
  },
  REDIS_PORT: {
    doc: 'Port to access redis instance',
    format: Number,
    required: true,
    default: null,
    env: 'REDIS_PORT',
  },
  REDIS_PASSWORD: {
    doc: 'Password to access redis instance',
    format: String,
    required: true,
    default: null,
    env: 'REDIS_PASSWORD',
  },
});

module.exports = conf;
