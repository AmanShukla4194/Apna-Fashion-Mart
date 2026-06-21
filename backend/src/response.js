const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Requested-With',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

function ok(data, statusCode = 200) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS },
    body: JSON.stringify(data),
  };
}

function error(statusCode, message) {
  return ok({ error: message }, statusCode);
}

function options() {
  return {
    statusCode: 200,
    headers: { ...CORS },
    body: '',
  };
}

module.exports = { ok, error, options };
