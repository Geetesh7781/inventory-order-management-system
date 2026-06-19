const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Inventory Order Management API is running");
});

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      sku VARCHAR(50) UNIQUE NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      total_amount NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Tables created");
};

// Products
app.post("/products", async (req, res) => {
  try {
    const { name, sku, price, stock } = req.body;
    const result = await pool.query(
      "INSERT INTO products (name, sku, price, stock) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, sku, price, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/products", async (req, res) => {
  const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
  res.json(result.rows);
});

app.delete("/products/:id", async (req, res) => {
  await pool.query("DELETE FROM products WHERE id=$1", [req.params.id]);
  res.json({ message: "Product deleted" });
});

// Customers
app.post("/customers", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const result = await pool.query(
      "INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
      [name, email, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/customers", async (req, res) => {
  const result = await pool.query("SELECT * FROM customers ORDER BY id DESC");
  res.json(result.rows);
});

// Orders
app.post("/orders", async (req, res) => {
  try {
    const { customer_id, product_id, quantity } = req.body;

    const productResult = await pool.query("SELECT * FROM products WHERE id=$1", [
      product_id,
    ]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = productResult.rows[0];

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    const total_amount = Number(product.price) * Number(quantity);

    const orderResult = await pool.query(
      "INSERT INTO orders (customer_id, product_id, quantity, total_amount) VALUES ($1, $2, $3, $4) RETURNING *",
      [customer_id, product_id, quantity, total_amount]
    );

    await pool.query("UPDATE products SET stock = stock - $1 WHERE id=$2", [
      quantity,
      product_id,
    ]);

    res.status(201).json(orderResult.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/orders", async (req, res) => {
  const result = await pool.query(`
    SELECT orders.id, customers.name AS customer_name, products.name AS product_name,
    orders.quantity, orders.total_amount, orders.created_at
    FROM orders
    JOIN customers ON orders.customer_id = customers.id
    JOIN products ON orders.product_id = products.id
    ORDER BY orders.id DESC
  `);
  res.json(result.rows);
});

const PORT = process.env.PORT || 5000;

createTables().then(() => {
  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });
});