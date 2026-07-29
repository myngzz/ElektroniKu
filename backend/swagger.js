const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ElektroniKu API',
      version: '1.0.0',
      description: `
# ElektroniKu - API Katalog Produk Elektronik

API lengkap untuk platform e-commerce katalog produk elektronik dengan fitur AI.

## Fitur Utama
- 🛍️ Manajemen produk & kategori
- 🔐 Autentikasi JWT (user & admin)
- 🤖 AI: Assistant, Auto-deskripsi, Perbandingan, Smart Search, Review Summarizer
- 📸 Upload gambar ke MinIO
- ⭐ Review & rating
- 🛒 Keranjang & wishlist
- 📊 Dashboard admin

## Autentikasi
Gunakan endpoint \`POST /api/auth/login\` untuk mendapatkan token JWT.
Masukkan token ke header Authorization: \`Bearer <token>\`
      `,
      contact: {
        name: 'ElektroniKu Team',
        email: 'admin@elektroniku.id',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? 'https://api.elektroniku.id' : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan token JWT Anda di sini',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '664f1b2c3d4e5f6a7b8c9d0e' },
            name: { type: 'string', example: 'Samsung Galaxy S24 Ultra' },
            brand: { type: 'string', example: 'Samsung' },
            category: { type: 'string', example: '664f1b2c3d4e5f6a7b8c9d0a' },
            price: { type: 'number', example: 18999000 },
            originalPrice: { type: 'number', example: 21999000 },
            stock: { type: 'integer', example: 50 },
            images: { type: 'array', items: { type: 'string' }, example: ['http://localhost:9000/products/sample.jpg'] },
            specifications: {
              type: 'object',
              additionalProperties: true,
              example: { RAM: '12GB', Storage: '256GB', Baterai: '5000mAh', Layar: '6.8 inch Dynamic AMOLED' },
            },
            description: { type: 'string', example: 'Smartphone flagship Samsung terbaru...' },
            avgRating: { type: 'number', example: 4.7 },
            reviewCount: { type: 'integer', example: 128 },
            isActive: { type: 'boolean', example: true },
          },
        },
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Smartphone' },
            slug: { type: 'string', example: 'smartphone' },
            description: { type: 'string' },
            icon: { type: 'string', example: '📱' },
            specFields: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  label: { type: 'string' },
                  unit: { type: 'string' },
                  type: { type: 'string' },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Budi Santoso' },
            email: { type: 'string', example: 'budi@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            product: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', example: 'Produk sangat bagus, pengiriman cepat!' },
            images: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Terjadi kesalahan pada server' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            pages: { type: 'integer', example: 10 },
            limit: { type: 'integer', example: 10 },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autentikasi & manajemen akun' },
      { name: 'Products', description: 'CRUD produk elektronik' },
      { name: 'Categories', description: 'Manajemen kategori produk' },
      { name: 'Upload', description: 'Upload gambar ke MinIO' },
      { name: 'AI', description: 'Fitur kecerdasan buatan (Ollama)' },
      { name: 'Reviews', description: 'Rating & ulasan produk' },
      { name: 'Cart', description: 'Keranjang belanja' },
      { name: 'Wishlist', description: 'Wishlist produk favorit' },
      { name: 'Admin', description: 'Dashboard & manajemen admin' },
    ],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
