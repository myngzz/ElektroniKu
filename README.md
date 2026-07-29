# ElektroniKu 🔌

Katalog produk elektronik lengkap dengan fitur AI berbasis **Next.js** + **Express.js** + **MongoDB** + **Ollama**.

## ✨ Fitur Utama

- 📦 **Katalog Produk** — Filter, sort, pagination, pencarian teks lengkap
- 🤖 **AI Assistant** — Chat natural dengan produk elektronik (Ollama llama3)
- ⚖️ **AI Perbandingan Produk** — Analisis mendalam 2-3 produk sekaligus
- 🔍 **AI Smart Search** — Pencarian dengan bahasa natural
- 📝 **AI Review Summarizer** — Ringkasan otomatis ulasan pengguna
- 🛒 **E-commerce Lengkap** — Cart, Wishlist, Orders, Checkout
- 🔐 **Auth JWT** — Role user & admin, ekspirasi 7 hari
- 📤 **Upload Gambar** — MinIO object storage
- 🌙 **Dark Mode** — Toggle tema terang/gelap
- 📊 **Admin Dashboard** — Statistik lengkap, manajemen produk/pesanan/pengguna

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS 4 |
| Backend | Express.js, Node.js |
| Database | MongoDB 7.0 + Redis 7.2 |
| AI | Ollama (llama3) |
| Storage | MinIO |
| Auth | JWT + bcryptjs |
| Infrastructure | Docker Compose, Nginx |

## 🚀 Quick Start

### Prasyarat
- Docker & Docker Compose v2+
- Node.js 20+ (untuk development lokal)

### Jalankan dengan Docker

```bash
git clone https://github.com/yourusername/ElektroniKu.git
cd ElektroniKu
cp .env.example .env   # sesuaikan jika perlu
docker compose up --build
```

Akses aplikasi:
- **Frontend**: http://localhost (via Nginx)
- **Backend API**: http://localhost/api
- **Swagger UI**: http://localhost:5000/api-docs
- **MinIO Console**: http://localhost:9001

### Seed Data

```bash
docker compose exec backend node seed.js
```

Akun default setelah seed:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@elektroniku.id | admin123 |
| User | user@test.com | user123 |

### Development Lokal

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (terminal lain)
cd frontend && npm install && npm run dev
```

## 📁 Struktur Proyek

```
ElektroniKu/
├── backend/               # Express.js API
│   ├── config/            # DB, MinIO, Redis
│   ├── controllers/       # Business logic
│   ├── middlewares/       # Auth, error, rate limiter
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes (dengan Swagger JSDoc)
│   ├── services/          # Ollama, cache, upload, logger
│   ├── seed.js            # Data awal
│   └── server.js          # Entry point
├── frontend/              # Next.js App Router
│   └── src/
│       ├── app/           # Pages & layouts
│       ├── components/    # UI components
│       ├── hooks/         # Custom hooks
│       ├── lib/           # API client, auth utils
│       └── types/         # TypeScript interfaces
├── nginx/nginx.conf        # Reverse proxy config
├── docker-compose.yml
└── .env
```

## 🔌 API Endpoints

| Group | Endpoint |
|-------|----------|
| Auth | POST /api/auth/register, /login, GET /me |
| Products | GET/POST /api/products, GET/PUT/DELETE /api/products/:id |
| Categories | CRUD /api/categories |
| AI | POST /api/ai/assistant, /compare, /smart-search, /summarize-reviews, /generate-description |
| Cart | GET/POST/PUT/DELETE /api/cart |
| Wishlist | GET/POST/DELETE /api/wishlist |
| Orders | GET/POST /api/orders |
| Upload | POST /api/upload |
| Admin | GET /api/admin/dashboard, /orders, /users |

Dokumentasi lengkap: **http://localhost:5000/api-docs**

## 🔧 Environment Variables

### Root `.env`
```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=admin123
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
REDIS_PASSWORD=redis123
JWT_SECRET=your-super-secret-key-change-in-production
OLLAMA_BASE_URL=https://your-ollama-endpoint/api/generate
```

### Backend `backend/.env`
Salin dari `backend/.env.example` dan sesuaikan.

### Frontend `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=ElektroniKu
NEXT_PUBLIC_MINIO_URL=http://localhost:9000/products
```

## 📜 License

MIT © 2024 ElektroniKu
