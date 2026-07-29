const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama produk wajib diisi'],
      trim: true,
      maxlength: [200, 'Nama produk maksimal 200 karakter'],
      index: 'text',
    },
    brand: {
      type: String,
      required: [true, 'Brand wajib diisi'],
      trim: true,
      maxlength: [100, 'Brand maksimal 100 karakter'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Kategori wajib dipilih'],
    },
    price: {
      type: Number,
      required: [true, 'Harga wajib diisi'],
      min: [0, 'Harga tidak boleh negatif'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Harga original tidak boleh negatif'],
    },
    stock: {
      type: Number,
      required: [true, 'Stok wajib diisi'],
      min: [0, 'Stok tidak boleh negatif'],
      default: 0,
    },
    // Gambar produk (URL MinIO) - multi gambar
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    // Spesifikasi teknis dinamis (key-value)
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    description: {
      type: String,
      maxlength: [5000, 'Deskripsi maksimal 5000 karakter'],
    },
    // Deskripsi yang dibuat AI
    aiGeneratedDescription: {
      type: String,
      maxlength: [5000, 'Deskripsi AI maksimal 5000 karakter'],
    },
    // Rating rata-rata (dihitung otomatis)
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    // SEO
    metaTitle: String,
    metaDescription: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ avgRating: -1 });
productSchema.index({ createdAt: -1 });

// Virtual: diskon persentase
productSchema.virtual('discountPercent').get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual: apakah stok tersedia
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

module.exports = mongoose.model('Product', productSchema);
