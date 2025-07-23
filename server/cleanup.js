const mongoose = require('mongoose');

async function cleanDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/travel-app');
    console.log('Connected to MongoDB');
    
    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully');
    
    await mongoose.connection.close();
    console.log('Connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanDatabase(); 