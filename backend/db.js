const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database path
const dbPath = path.join(__dirname, 'ecommerce.db');

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Cart table
  db.run(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    )
  `);

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Order items table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    )
  `);

  // Populate products with Amazon-like data
  const sampleProducts = [
    { name: 'iPhone 15 Pro', description: 'Latest Apple smartphone with advanced features', price: 999.99, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', stock: 50 },
    { name: 'MacBook Air M3', description: 'Powerful laptop for professionals', price: 1299.99, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400', stock: 30 },
    { name: 'The Great Gatsby', description: 'Classic novel by F. Scott Fitzgerald', price: 10.99, category: 'Books', image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', stock: 100 },
    { name: 'Nike Air Max', description: 'Comfortable running shoes', price: 129.99, category: 'Clothing', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', stock: 75 },
    { name: 'Samsung 4K TV', description: 'Ultra HD television with smart features', price: 799.99, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', stock: 20 },
    { name: 'Harry Potter Series', description: 'Complete set of fantasy novels', price: 49.99, category: 'Books', image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', stock: 60 },
    { name: 'Levi\'s Jeans', description: 'Classic denim jeans', price: 59.99, category: 'Clothing', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', stock: 80 },
    { name: 'Sony Headphones', description: 'Noise-cancelling wireless headphones', price: 299.99, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', stock: 40 },
    { name: 'To Kill a Mockingbird', description: 'Award-winning novel by Harper Lee', price: 12.99, category: 'Books', image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', stock: 90 },
    { name: 'Adidas Sneakers', description: 'Stylish and comfortable sneakers', price: 89.99, category: 'Clothing', image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400', stock: 65 }
  ];

  // Insert or update sample products
  sampleProducts.forEach(product => {
    db.run(`
      INSERT OR REPLACE INTO products (name, description, price, category, image_url, stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [product.name, product.description, product.price, product.category, product.image_url, product.stock]);
  });

  console.log('Database schema created and sample data inserted.');
});

module.exports = db;
