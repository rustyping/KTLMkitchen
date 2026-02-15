const sqlite3 = require('sqlite3').verbose();
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, './ktlm_kitchen.db');
const excelPath = path.join(__dirname, './menu.xlsx');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to database');
  initializeDatabase();
});

function loadMenuFromExcel() {
  if (!fs.existsSync(excelPath)) {
    console.error('menu.xlsx not found. Creating template...');
    require('./create-menu.js');
    process.exit(1);
  }

  try {
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const menu = XLSX.utils.sheet_to_json(sheet);
    return menu;
  } catch (err) {
    console.error('Error reading menu.xlsx:', err);
    process.exit(1);
  }
}

function initializeDatabase() {
  // Load menu items from Excel file
  const sampleMenu = loadMenuFromExcel();

  db.serialize(() => {
    // First, create the menu_items table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      available BOOLEAN DEFAULT 1,
      manual_price BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        return;
      }

      // Check if items already exist
      db.get('SELECT COUNT(*) as count FROM menu_items', (err, row) => {
        if (row && row.count > 0) {
          console.log(`Database already contains ${row.count} menu items.`);
          db.close();
          process.exit(0);
        }

        // Insert sample items
        const stmt = db.prepare(`INSERT INTO menu_items (name, description, price, category, manual_price) VALUES (?, ?, ?, ?, ?)`);

        sampleMenu.forEach(item => {
          // Check if price is marked with * for manual entry
          let price = item.price;
          let isManualPrice = 0;
          
          if (typeof price === 'string' && price.includes('*')) {
            isManualPrice = 1;
            price = 0; // Default price for manual items
          } else {
            price = parseFloat(price);
          }
          
          stmt.run([item.name, item.description, price, item.category, isManualPrice]);
        });

        // Wait for all inserts to complete before closing
        stmt.finalize((err) => {
          if (err) {
            console.error('Error finalizing statement:', err);
            db.close();
            process.exit(1);
          }

          db.all('SELECT COUNT(*) as count FROM menu_items', (err, rows) => {
            if (err) {
              console.error('Error counting items:', err);
            } else {
              console.log(`✓ Database initialized with ${rows[0].count} menu items`);
            }
            db.close();
            process.exit(0);
          });
        });
      });
    });
  });
}
