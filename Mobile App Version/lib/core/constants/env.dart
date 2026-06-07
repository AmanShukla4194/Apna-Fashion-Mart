class Env {
  // AWS API Gateway base URL
  static const apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'https://709m6g0t8a.execute-api.ap-south-1.amazonaws.com',
  );

  // AWS Cognito
  static const cognitoUserPoolId = String.fromEnvironment(
    'COGNITO_USER_POOL_ID',
    defaultValue: 'ap-south-1_3HoR7ATA9',
  );
  static const cognitoClientId = String.fromEnvironment(
    'COGNITO_CLIENT_ID',
    defaultValue: '2p1qrpgnb70skct4ea6o3ompnd',
  );
  static const cognitoRegion = 'ap-south-1';

  // Third-party keys
  static const razorpayKeyId = String.fromEnvironment(
    'RAZORPAY_KEY_ID',
    defaultValue: 'rzp_live_SyiWZAqZIT1tbS',
  );
  static const googleMapsApiKey = String.fromEnvironment(
    'GOOGLE_MAPS_API_KEY',
    defaultValue: '',
  );
  static const anthropicApiKey = String.fromEnvironment(
    'ANTHROPIC_API_KEY',
    defaultValue: '',
  );
}
