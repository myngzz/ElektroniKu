// MongoDB initialization script
// Runs when container starts for the first time

db = db.getSiblingDB('elektroniku');

// Create collections with schema validation
db.createCollection('users');
db.createCollection('products');
db.createCollection('categories');
db.createCollection('reviews');
db.createCollection('carts');
db.createCollection('wishlists');
db.createCollection('orders');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.products.createIndex({ name: 'text', description: 'text' });
db.products.createIndex({ category: 1 });
db.products.createIndex({ brand: 1 });
db.products.createIndex({ price: 1 });
db.reviews.createIndex({ product: 1, user: 1 }, { unique: true });
db.carts.createIndex({ user: 1 }, { unique: true });
db.wishlists.createIndex({ user: 1 }, { unique: true });
db.orders.createIndex({ user: 1 });

print('ElektroniKu database initialized successfully!');
