'use strict';

function isHaProxyClosedConnectionError (data) {
  return (data.event === 'log' && data.error && data.error.code === 'ECONNRESET');
}

function isTelegrafPing ({ event, headers }) {
  return (event === 'response' && headers['x-clevercloud-monitoring'] === 'telegraf');
}

function removeId (data) {
  return { ...data, id: null };
}

function revealForwardedInstance (data) {

  if (data.event !== 'response') {
    return data;
  }

  const forwardedProto = data.headers['x-forwarded-proto'];
  const proto = forwardedProto || 'http';

  const [host, hostPort] = data.headers.host.split(':');

  const forwardedPort = (forwardedProto === 'https') ? '443' : null;
  const port = hostPort || forwardedPort || '80';

  const instance = `${proto}://${host}:${port}`;

  return { ...data, instance };
}

module.exports = {
  isHaProxyClosedConnectionError,
  isTelegrafPing,
  removeId,
  revealForwardedInstance,
};
