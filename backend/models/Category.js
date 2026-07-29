const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama kategori wajib diisi'],
      trim: true,
      maxlength: [100, 'Nama kategori maksimal 100 karakter'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Deskripsi maksimal 500 karakter'],
    },
    icon: {
      type: String,
      default: '📦',
    },
    image: {
      type: String,
    },
    // Daftar field spesifikasi yang relevan untuk kategori ini
    specFields: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        unit: { type: String },
        type: {
          type: String,
          enum: ['text', 'number', 'boolean', 'select'],
          default: 'text',
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug dari nama jika tidak disediakan
categorySchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
