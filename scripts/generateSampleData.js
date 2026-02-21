#!/usr/bin/env bun

/**
 * Generate Sample Data SQL Script
 * Creates SQL statements for products, customers, and sales data
 */

// Sample data definitions
const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Food & Beverage',
  'Health & Beauty'
];

const PRODUCT_NAMES = {
  'Electronics': [
    'Wireless Headphones', 'Smart Watch', 'USB-C Cable', 'Bluetooth Speaker',
    'Laptop Stand', 'Wireless Mouse', 'Keyboard', 'Phone Case',
    'Screen Protector', 'Power Bank', 'Webcam', 'HDMI Cable'
  ],
  'Clothing': [
    'T-Shirt', 'Jeans', 'Hoodie', 'Sneakers', 'Jacket',
    'Dress Shirt', 'Shorts', 'Socks', 'Hat', 'Scarf', 'Belt', 'Sunglasses'
  ],
  'Home & Garden': [
    'Coffee Maker', 'Throw Pillow', 'Wall Clock', 'Plant Pot',
    'Candle Set', 'Picture Frame', 'Bath Towel', 'Kitchen Knife',
    'Cutting Board', 'Storage Box', 'LED Bulb', 'Door Mat'
  ],
  'Sports & Outdoors': [
    'Yoga Mat', 'Water Bottle', 'Dumbbell Set', 'Camping Tent',
    'Hiking Backpack', 'Running Shoes', 'Bicycle Helmet', 'Sports Watch',
    'Jump Rope', 'Resistance Bands', 'Foam Roller', 'Camping Chair'
  ],
  'Books': [
    'Fiction Novel', 'Cookbook', 'Self-Help Book', 'Biography',
    'Science Fiction', 'Mystery Thriller', 'Poetry Collection', 'Travel Guide',
    'History Book', 'Business Book', 'Art Book', 'Children\'s Book'
  ],
  'Toys & Games': [
    'Board Game', 'Puzzle', 'Action Figure', 'Building Blocks',
    'Stuffed Animal', 'Playing Cards', 'RC Car', 'Art Supplies',
    'Educational Toy', 'Outdoor Game', 'Doll', 'Science Kit'
  ],
  'Food & Beverage': [
    'Coffee Beans', 'Green Tea', 'Chocolate Bar', 'Protein Powder',
    'Olive Oil', 'Honey', 'Snack Mix', 'Energy Drink',
    'Pasta', 'Hot Sauce', 'Granola Bars', 'Vitamin Water'
  ],
  'Health & Beauty': [
    'Face Cream', 'Shampoo', 'Body Lotion', 'Lip Balm',
    'Hand Sanitizer', 'Vitamins', 'Face Mask', 'Deodorant',
    'Toothpaste', 'Soap', 'Nail Polish', 'Hair Brush'
  ]
};

const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Indianapolis',
  'Charlotte', 'San Francisco', 'Seattle', 'Denver', 'Boston'
];

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  const num = Math.random() * (max - min) + min;
  return Number(num.toFixed(decimals));
}

function randomChoice(array) {
  return array[randomInt(0, array.length - 1)];
}

function randomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function escapeString(str) {
  return str.replace(/'/g, "''");
}

function generateProducts(count = 80) {
  const products = [];
  let productId = 1;

  for (const category of CATEGORIES) {
    const categoryProducts = PRODUCT_NAMES[category];
    const productsPerCategory = Math.floor(count / CATEGORIES.length);

    for (let i = 0; i < productsPerCategory && productId <= count; i++) {
      const name = categoryProducts[i % categoryProducts.length];
      const price = randomFloat(5, 200);
      const stock = randomInt(0, 500);

      products.push({
        id: productId++,
        name: `${name}`,
        category,
        price,
        stock
      });
    }
  }

  return products;
}

function generateCustomers(count = 150) {
  const customers = [];

  for (let i = 1; i <= count; i++) {
    const firstName = randomChoice(FIRST_NAMES);
    const lastName = randomChoice(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`;
    const city = randomChoice(CITIES);
    const totalOrders = randomInt(1, 50);

    customers.push({
      id: i,
      name,
      email,
      city,
      total_orders: totalOrders
    });
  }

  return customers;
}

function generateSales(products, customers, count = 800) {
  const sales = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');

  for (let i = 1; i <= count; i++) {
    const product = randomChoice(products);
    const customer = randomChoice(customers);
    const date = randomDate(startDate, endDate);
    const quantity = randomInt(1, 10);
    const amount = randomFloat(product.price * quantity * 0.9, product.price * quantity * 1.1);

    sales.push({
      id: i,
      date,
      product_id: product.id,
      customer_id: customer.id,
      quantity,
      amount
    });
  }

  // Sort by date
  sales.sort((a, b) => new Date(a.date) - new Date(b.date));

  return sales;
}

async function generateSQL() {
  console.log('🚀 Generating sample data...\n');

  // Generate sample data
  const products = generateProducts(80);
  const customers = generateCustomers(150);
  const sales = generateSales(products, customers, 800);

  console.log(`   ✓ Generated ${products.length} products`);
  console.log(`   ✓ Generated ${customers.length} customers`);
  console.log(`   ✓ Generated ${sales.length} sales transactions\n`);

  console.log('📝 Creating SQL file...');

  let sql = `-- Sample Database for vDash
-- Generated: ${new Date().toISOString()}

-- Create Products Table
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name VARCHAR,
  category VARCHAR,
  price DECIMAL(10, 2),
  stock INTEGER
);

-- Create Customers Table
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name VARCHAR,
  email VARCHAR,
  city VARCHAR,
  total_orders INTEGER
);

-- Create Sales Table
CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  date DATE,
  product_id INTEGER,
  customer_id INTEGER,
  quantity INTEGER,
  amount DECIMAL(10, 2)
);

-- Insert Products
`;

  for (const product of products) {
    sql += `INSERT INTO products VALUES (${product.id}, '${escapeString(product.name)}', '${product.category}', ${product.price}, ${product.stock});\n`;
  }

  sql += '\n-- Insert Customers\n';
  for (const customer of customers) {
    sql += `INSERT INTO customers VALUES (${customer.id}, '${escapeString(customer.name)}', '${customer.email}', '${customer.city}', ${customer.total_orders});\n`;
  }

  sql += '\n-- Insert Sales\n';
  for (const sale of sales) {
    sql += `INSERT INTO sales VALUES (${sale.id}, '${sale.date}', ${sale.product_id}, ${sale.customer_id}, ${sale.quantity}, ${sale.amount});\n`;
  }

  // Write SQL file
  const fs = await import('fs');
  fs.writeFileSync('sample-data.sql', sql);

  console.log('   ✓ SQL file created: sample-data.sql\n');

  console.log('✅ Sample data generation complete!\n');
  console.log('📊 Data Summary:');
  console.log(`   • Products: ${products.length}`);
  console.log(`   • Customers: ${customers.length}`);
  console.log(`   • Sales: ${sales.length}`);
  console.log(`   • Date Range: 2024-01-01 to 2024-12-31\n`);

  console.log('📦 To create the DuckDB database, run:');
  console.log('   duckdb sample-data.duckdb < sample-data.sql\n');
  console.log('   Or if you don\'t have DuckDB CLI installed:');
  console.log('   bun run create-db\n');
}

generateSQL().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
