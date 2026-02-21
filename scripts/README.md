# Sample Database Generation Scripts

This directory contains scripts to generate sample data for testing vDash.

## Methods to Create Sample Database

### Method 1: Browser-Based Generator (Recommended)

The easiest way to create a sample database:

1. Start the development server:
   ```bash
   bun run dev
   ```

2. Open the database creator in your browser:
   ```
   http://localhost:5173/create-database.html
   ```

3. Click the "Create Database" button

4. The database file `sample-data.duckdb` will be automatically downloaded

5. Drag and drop this file into the vDash application

### Method 2: Generate SQL File

Generate a SQL file that can be imported:

```bash
# Generate sample-data.sql file
bun run generate-sql

# Then use DuckDB CLI to create database (if installed)
duckdb sample-data.duckdb < sample-data.sql
```

## Sample Data Included

The generated database contains:

### Products Table (80 products)
- **Columns**: id, name, category, price, stock
- **Categories**: Electronics, Clothing, Home & Garden, Sports & Outdoors, Books, Toys & Games, Food & Beverage, Health & Beauty
- **Price Range**: $5 - $200
- **Stock Range**: 0 - 500 units

### Customers Table (150 customers)
- **Columns**: id, name, email, city, total_orders
- **Cities**: Major US cities (New York, Los Angeles, Chicago, etc.)
- **Order Range**: 1 - 50 orders per customer

### Sales Table (800 transactions)
- **Columns**: id, date, product_id, customer_id, quantity, amount
- **Date Range**: January 1, 2024 - December 31, 2024
- **Quantity Range**: 1 - 10 items per transaction
- **Relationships**: Foreign keys to products and customers

## Database Schema

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name VARCHAR,
  category VARCHAR,
  price DECIMAL(10, 2),
  stock INTEGER
);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name VARCHAR,
  email VARCHAR,
  city VARCHAR,
  total_orders INTEGER
);

CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  date DATE,
  product_id INTEGER,
  customer_id INTEGER,
  quantity INTEGER,
  amount DECIMAL(10, 2)
);
```

## Using the Sample Database

Once created:

1. Start the vDash application:
   ```bash
   bun run dev
   ```

2. Drag and drop the `sample-data.duckdb` file onto the application

3. Explore the pre-configured views:
   - **Tables**: Sales Transactions, Products, Customers
   - **Charts**: Revenue Trend, Sales by Category, Top Products

## Notes

- All data is randomly generated for demonstration purposes
- The HTML-based generator works entirely in the browser using DuckDB WASM
- No server or backend required
- The generated database is approximately 100KB in size
