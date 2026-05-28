// Cognito Post Confirmation Lambda trigger.
// Fires after a user confirms their email. Creates the user row in the DB.
const { query } = require('./db');

exports.handler = async (event) => {
  if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') return event;

  const { userAttributes } = event.request;
  const cognitoSub = userAttributes.sub;
  const email = userAttributes.email;
  const fullName = userAttributes.name || email.split('@')[0];
  const phone = userAttributes.phone_number || null;

  try {
    await query(
      `INSERT INTO users (cognito_sub, email, full_name, phone, role)
       VALUES ($1, $2, $3, $4, 'customer')
       ON CONFLICT (cognito_sub) DO NOTHING`,
      [cognitoSub, email, fullName, phone]
    );
    console.log(`DB user created for cognito_sub: ${cognitoSub}`);
  } catch (err) {
    // Log but don't throw — Cognito confirmation should still succeed.
    // The profile endpoint auto-creates the row on first login as a safety net.
    console.error('Failed to insert user into DB:', err);
  }

  return event;
};
