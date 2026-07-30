const Minio = require('minio');
const fs = require('fs');

const minio = new Minio.Client({
  endPoint: 'minio', port: 9000, useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});

const BUCKET = 'products';

async function upload(localPath, minioName) {
  const buf = fs.readFileSync(localPath);
  await minio.putObject(BUCKET, minioName, buf, buf.length, { 'Content-Type': 'image/jpeg' });
  console.log(`Uploaded ${minioName} (${(buf.length/1024).toFixed(1)}KB)`);
}

async function main() {
  await upload('/tmp/google-pixel-9-1.jpg', 'google-pixel-9-1.jpg');
  await upload('/tmp/google-pixel-9-pro-xl-1.jpg', 'google-pixel-9-pro-xl-1.jpg');
  console.log('Done!');
}

main().catch(console.error);
