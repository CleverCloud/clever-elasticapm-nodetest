'use strict';

const Stream = require('stream');

function goodTransform (callback) {

  const module = class extends Stream.Transform {

    constructor (config) {
      super({ objectMode: true });
    }

    _transform (data, enc, next) {
      const newData = callback(data);
      return next(null, newData);
    }
  };

  return { module };
}

module.exports = goodTransform;
