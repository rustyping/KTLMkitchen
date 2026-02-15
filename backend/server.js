const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, '../database/ktlm_kitchen.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Menu items table
    db.run(`CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      available BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending',
      total_amount REAL,
      cash_amount REAL,
      change_amount REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Order items table (line items)
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      notes TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    )`);

    // Payments table
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )`);

    console.log('Database tables initialized');
  });
}

// API Routes

// Helper function to load menu from Excel
function loadMenuFromExcel() {
  try {
    const excelPath = path.join(__dirname, '../database/menu.xlsx');
    if (!fs.existsSync(excelPath)) {
      return [];
    }
    
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const menu = XLSX.utils.sheet_to_json(sheet);
    
    // Add ID and parse prices
    return menu.map((item, index) => {
      let price = item.price;
      let isManualPrice = false;
      
      if (typeof price === 'string' && price.includes('*')) {
        isManualPrice = true;
        price = 0;
      } else {
        price = parseFloat(price) || 0;
      }
      
      return {
        id: index + 1,
        name: item.name,
        description: item.description,
        price: price,
        category: item.category,
        manual_price: isManualPrice
      };
    });
  } catch (error) {
    console.error('Error loading menu from Excel:', error);
    return [];
  }
}

// GET all menu items
app.get('/api/menu', (req, res) => {
  const menu = loadMenuFromExcel();
  res.json(menu);
});

// GET menu items by category
app.get('/api/menu/:category', (req, res) => {
  const { category } = req.params;
  const menu = loadMenuFromExcel();
  const filtered = menu.filter(item => item.category === category);
  res.json(filtered);
});

// POST create new order
app.post('/api/orders', (req, res) => {
  const { items, total_amount, cash_amount, change_amount } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  // Load menu to get item names
  const menu = loadMenuFromExcel();
  const menuMap = {};
  menu.forEach(item => {
    menuMap[item.id] = item.name;
  });

  const orderNumber = 'ORD-' + Date.now();
  
  console.log('Creating order:', { orderNumber, total_amount, cash_amount, change_amount, itemCount: items.length });

  db.run('INSERT INTO orders (order_number, status, total_amount, cash_amount, change_amount) VALUES (?, ?, ?, ?, ?)',
    [orderNumber, 'completed', total_amount || 0, cash_amount || 0, change_amount || 0],
    function(err) {
      if (err) {
        console.error('Error inserting order:', err);
        res.status(500).json({ error: 'Failed to create order: ' + err.message });
        return;
      }

      const orderId = this.lastID;
      console.log('Order inserted with ID:', orderId);
      
      let itemsProcessed = 0;
      let insertError = false;

      items.forEach((item, index) => {
        const subtotal = item.quantity * item.price;
        const itemName = menuMap[item.id] || item.name || 'Item';
        console.log(`Inserting item ${index + 1}:`, { orderId, menuItemId: item.id, name: itemName, quantity: item.quantity, price: item.price });

        db.run(`INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal, notes) 
                VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, item.id, item.quantity, item.price, subtotal, itemName],
          (err) => {
            if (err) {
              console.error('Error inserting order item:', err);
              insertError = true;
            }
            
            itemsProcessed++;
            if (itemsProcessed === items.length) {
              if (insertError) {
                res.status(500).json({ error: 'Failed to insert order items' });
              } else {
                console.log('Order complete:', orderId);
                res.status(201).json({
                  id: orderId,
                  order_number: orderNumber,
                  total_amount: total_amount,
                  cash_amount: cash_amount,
                  change_amount: change_amount,
                  status: 'completed'
                });
              }
            }
          }
        );
      });
    }
  );
});

// GET all orders
app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET order details
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    db.all('SELECT id, order_id, quantity, unit_price, subtotal, notes AS name FROM order_items WHERE order_id = ?',
      [id],
      (err, items) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ ...order, items });
      }
    );
  });
});

// UPDATE order status
app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, status });
  });
});

// POST payment
app.post('/api/payments', (req, res) => {
  const { order_id, amount, payment_method } = req.body;

  db.run('INSERT INTO payments (order_id, amount, payment_method, status) VALUES (?, ?, ?, ?)',
    [order_id, amount, payment_method, 'completed'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
        ['completed', order_id],
        (err) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(201).json({
            id: this.lastID,
            order_id,
            amount,
            payment_method,
            status: 'completed'
          });
        }
      );
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend API is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`KTLM Kitchen POS Backend running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
