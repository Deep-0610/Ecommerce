const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET);
        res.status(201).json({ token, user: { id: this.lastID, username, email } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

// Products routes
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM products';
  let params = [];

  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }

  if (search) {
    query += category ? ' AND' : ' WHERE';
    query += ' (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(row);
  });
});

// Cart routes
app.get('/api/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(`
    SELECT c.id, c.quantity, c.added_at, p.id as product_id, p.name, p.price, p.image_url
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/cart', authenticateToken, (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Product ID and quantity are required' });
  }

  db.run(
    'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
    [userId, productId, quantity],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.put('/api/cart/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  if (!quantity) {
    return res.status(400).json({ error: 'Quantity is required' });
  }

  db.run(
    'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
    [quantity, id, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
      res.json({ message: 'Cart updated' });
    }
  );
});

app.delete('/api/cart/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.run(
    'DELETE FROM cart WHERE id = ? AND user_id = ?',
    [id, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
      res.json({ message: 'Item removed from cart' });
    }
  );
});

// Orders routes
app.post('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Get cart items
  db.all(`
    SELECT c.product_id, c.quantity, p.price
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `, [userId], (err, cartItems) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    db.run(
      'INSERT INTO orders (user_id, total) VALUES (?, ?)',
      [userId, total],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        const orderId = this.lastID;

        // Insert order items
        const stmt = db.prepare(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `);

        cartItems.forEach(item => {
          stmt.run(orderId, item.product_id, item.quantity, item.price);
        });

        stmt.finalize();

        // Clear cart
        db.run('DELETE FROM cart WHERE user_id = ?', [userId], (err) => {
          if (err) {
            console.error('Error clearing cart:', err);
          }
        });

        res.status(201).json({ id: orderId, total, status: 'pending' });
      }
    );
  });
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(`
    SELECT o.id, o.total, o.status, o.created_at,
           GROUP_CONCAT(oi.quantity || 'x ' || p.name) as items
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// DB Viewer route
app.get('/api/db-view', (req, res) => {
  const tables = ['users', 'products', 'cart', 'orders', 'order_items'];
  const result = {};

  let completed = 0;

  tables.forEach(table => {
    db.all(`SELECT * FROM ${table}`, (err, rows) => {
      if (err) {
        console.error(`Error querying ${table}:`, err);
        result[table] = [];
      } else {
        result[table] = rows;
      }

      completed++;
      if (completed === tables.length) {
        res.json(result);
      }
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
