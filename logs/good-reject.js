'use strict';

const Stream = require('stream');

function goodReject (callback) {

  const module = class extends Stream.Transform {

    constructor (config) {
      super({ objectMode: true });
    }

    _transform (data, enc, next) {
      const shouldBeRejected = callback(data);
      return shouldBeRejected
        ? next(null)
        : next(null, data);
    }
  };

  return { module };
}

module.exports = goodReject;
