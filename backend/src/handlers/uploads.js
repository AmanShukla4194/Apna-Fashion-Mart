const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { requireAuth } = require('../auth');
const { ok, error } = require('../response');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });
const BUCKET = process.env.S3_BUCKET_NAME;
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;

const ALLOWED_FOLDERS = ['products', 'avatars', 'shops', 'reviews'];
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

async function handle(ctx) {
  const { method, user, body } = ctx;

  if (method !== 'POST') return error(405, 'Method not allowed');
  requireAuth(user);

  const { folder, filename, contentType } = body;

  if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
    return error(400, `folder must be one of: ${ALLOWED_FOLDERS.join(', ')}`);
  }
  if (!filename) return error(400, 'filename is required');
  if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
    return error(400, `contentType must be one of: ${ALLOWED_TYPES.join(', ')}`);
  }

  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  // Pre-signed URL lets the client upload directly to S3 (valid 5 minutes)
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const publicUrl = `${CLOUDFRONT_URL}/${key}`;

  return ok({ uploadUrl, publicUrl, key, expiresIn: 300 });
}

module.exports = { handle };
