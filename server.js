const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        console.log("Connected to the SQLite database.");
        
        db.serialize(() => {
            // Users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                role TEXT
            )`);
            
            // Products table
            db.run(`CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                description TEXT,
                price REAL
            )`);
            
            // Clear existing data
            db.run(`DELETE FROM users`);
            db.run(`DELETE FROM products`);
            
            // Insert dummy data
            const stmtUsers = db.prepare(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`);
            stmtUsers.run('admin', 'SuperSecretAdminPassword123!', 'admin');
            stmtUsers.run('john', 'john123', 'user');
            stmtUsers.run('guest', 'guest', 'guest');
            stmtUsers.finalize();

            const stmtProducts = db.prepare(`INSERT INTO products (name, description, price) VALUES (?, ?, ?)`);
            stmtProducts.run('Gaming Laptop', 'High performance laptop with RTX 4090', 2500.00);
            stmtProducts.run('Wireless Mouse', 'Ergonomic wireless mouse with 10k DPI', 85.00);
            stmtProducts.run('Mechanical Keyboard', 'RGB mechanical keyboard with cherry mx', 150.00);
            stmtProducts.finalize();
        });
    }
});

// --- VULNERABLE ENDPOINTS ---

// VULNERABLE: Product Search (GET)
// Try: /api/vulnerable/products?search=' OR 1=1 -- 
app.get('/api/vulnerable/products', (req, res) => {
    const search = req.query.search || '';
    const query = `SELECT * FROM products WHERE name LIKE '%${search}%'`;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message, query });
            return;
        }
        res.json({ data: rows, query });
    });
});

// VULNERABLE: Login (POST)
// Try JSON: { "username": "admin' -- ", "password": "any" }
app.post('/api/vulnerable/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    db.get(query, [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message, query });
            return;
        }
        if (row) {
            res.json({ success: true, message: `Welcome ${row.username}! Role: ${row.role}`, query });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials', query });
        }
    });
});


// --- SECURE ENDPOINTS ---

app.get('/api/secure/products', (req, res) => {
    const search = req.query.search || '';
    const query = `SELECT * FROM products WHERE name LIKE ?`;
    
    db.all(query, [`%${search}%`], (err, rows) => {
        if (err) {
            res.status(500).json({ error: "Database error" }); 
            return;
        }
        res.json({ data: rows });
    });
});

app.post('/api/secure/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    
    db.get(query, [username, password], (err, row) => {
        if (err) {
            res.status(500).json({ error: "Database error" });
            return;
        }
        if (row) {
            res.json({ success: true, message: `Welcome ${row.username}! Role: ${row.role}` });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

app.listen(port, () => {
    console.log(`Uninjectable listening at http://localhost:${port}`);
});
