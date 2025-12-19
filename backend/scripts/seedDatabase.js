/**
 * Database Seeding Script
 * Seeds the MongoDB database with real Indian fashion products
 * 
 * Usage: node scripts/seedDatabase.js
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
const { indianFashionProducts } = require('../data/indianProducts');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vijeth:2006@wtlab.9b3zqxr.mongodb.net/vf_tryon_db?retryWrites=true&w=majority';

console.log('🌱 Starting database seeding...\n');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Clear existing products
    console.log('🗑️  Clearing existing products...');
    const deleteResult = await Product.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing products\n`);

    // Insert new products
    console.log('📦 Inserting new products...');
    const insertResult = await Product.insertMany(indianFashionProducts);
    console.log(`✅ Inserted ${insertResult.length} products\n`);

    // Display summary
    console.log('📊 Seeding Summary:');
    console.log('==================');
    
    const categories = {};
    insertResult.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = [];
      }
      categories[product.category].push(product.name);
    });

    Object.keys(categories).forEach(category => {
      console.log(`\n${category}:`);
      categories[category].forEach(name => {
        console.log(`  - ${name}`);
      });
    });

    // Display statistics
    console.log('\n\n📈 Statistics:');
    console.log('==============');
    console.log(`Total Products: ${insertResult.length}`);
    console.log(`Total Categories: ${Object.keys(categories).length}`);
    
    const totalStock = insertResult.reduce((sum, product) => sum + product.totalStock, 0);
    console.log(`Total Stock Items: ${totalStock}`);
    
    const avgPrice = insertResult.reduce((sum, product) => sum + product.price.selling, 0) / insertResult.length;
    console.log(`Average Price: ₹${Math.round(avgPrice)}`);

    const featured = insertResult.filter(p => p.featured).length;
    console.log(`Featured Products: ${featured}`);
    
    const bestsellers = insertResult.filter(p => p.bestseller).length;
    console.log(`Bestsellers: ${bestsellers}`);

    console.log('\n✅ Database seeding completed successfully! 🎉');
    
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');
    process.exit(0);
  }
}

// Run the seeder
seedDatabase();
