const mongoose = require('mongoose');
const Product = require('../models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unsh-fashion', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateCategories = async () => {
  try {
    console.log('Starting category update...');
    
    // Update old category values to new ones
    const updateResult = await Product.updateMany(
      { category: { $in: ['male', 'female', 'kids'] } },
      [
        {
          $set: {
            category: {
              $switch: {
                branches: [
                  { case: { $eq: ['$category', 'male'] }, then: 'boy' },
                  { case: { $eq: ['$category', 'female'] }, then: 'women' },
                  { case: { $eq: ['$category', 'kids'] }, then: 'girl' }
                ],
                default: 'women'
              }
            }
          }
        }
      ]
    );
    
    console.log('Category update completed:', updateResult);
    
    // Verify the update
    const products = await Product.find({});
    console.log('Current products with categories:');
    products.forEach(product => {
      console.log(`- ${product.name}: ${product.category}`);
    });
    
    console.log('Category update script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating categories:', error);
    process.exit(1);
  }
};

updateCategories();
