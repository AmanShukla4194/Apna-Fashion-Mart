const { CognitoJwtVerifier } = require('aws-jwt-verify');

let verifier;

function getVerifier() {
  if (!verifier) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      tokenUse: 'id',
      clientId: process.env.COGNITO_CLIENT_ID,
    });
  }
  return verifier;
}

async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    const payload = await getVerifier().verify(token);
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload['custom:role'] || 'customer',
    };
  } catch {
    return null;
  }
}

function requireAuth(user) {
  if (!user) throw { statusCode: 401, message: 'Unauthorized' };
}

function requireRole(user, ...roles) {
  requireAuth(user);
  if (!roles.includes(user.role)) throw { statusCode: 403, message: 'Forbidden' };
}

module.exports = { verifyToken, requireAuth, requireRole };
