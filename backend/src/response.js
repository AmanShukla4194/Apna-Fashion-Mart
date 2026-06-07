function ok(data, statusCode = 200) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

function error(statusCode, message) {
  return ok({ error: message }, statusCode);
}

function options() {
  return ok({});
}

module.exports = { ok, error, options };
