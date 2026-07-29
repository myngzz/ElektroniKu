const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { minioClient, BUCKET_NAME, getFileUrl } = require('../config/minio');
const logger = require('./logger.service');

// Multer: simpan di memory, bukan disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF.'));
    }
  },
});

/**
 * Upload file ke MinIO
 * @param {Buffer} fileBuffer - Buffer file
 * @param {string} originalName - Nama file asli
 * @param {string} mimeType - MIME type file
 * @param {string} folder - Subfolder di bucket (opsional)
 * @returns {Promise<{fileName: string, url: string}>}
 */
const uploadToMinio = async (fileBuffer, originalName, mimeType, folder = '') => {
  const ext = originalName.split('.').pop().toLowerCase();
  const fileName = folder
    ? `${folder}/${uuidv4()}.${ext}`
    : `${uuidv4()}.${ext}`;

  const metaData = {
    'Content-Type': mimeType,
    'x-amz-acl': 'public-read',
  };

  await minioClient.putObject(BUCKET_NAME, fileName, fileBuffer, fileBuffer.length, metaData);
  const url = getFileUrl(fileName);

  logger.info(`File diupload ke MinIO: ${fileName}`);
  return { fileName, url };
};

/**
 * Hapus file dari MinIO
 * @param {string} fileName - Nama file di bucket
 */
const deleteFromMinio = async (fileName) => {
  try {
    await minioClient.removeObject(BUCKET_NAME, fileName);
    logger.info(`File dihapus dari MinIO: ${fileName}`);
  } catch (error) {
    logger.error(`Gagal hapus file MinIO: ${error.message}`);
  }
};

module.exports = { upload, uploadToMinio, deleteFromMinio };
