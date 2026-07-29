const Minio = require('minio');
const logger = require('../services/logger.service');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'products';

const initMinio = async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      logger.info(`MinIO bucket '${BUCKET_NAME}' berhasil dibuat.`);

      // Set bucket policy untuk public read
      const policy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      });
      await minioClient.setBucketPolicy(BUCKET_NAME, policy);
      logger.info(`Kebijakan bucket '${BUCKET_NAME}' diatur ke public-read.`);
    } else {
      logger.info(`MinIO bucket '${BUCKET_NAME}' sudah ada.`);
    }
  } catch (error) {
    logger.error(`Gagal menginisialisasi MinIO: ${error.message}`);
    throw error;
  }
};

const getFileUrl = (fileName) => {
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const host = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  return `${protocol}://${host}:${port}/${BUCKET_NAME}/${fileName}`;
};

module.exports = { minioClient, BUCKET_NAME, initMinio, getFileUrl };
