import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1
      }
    }
  ],
  total: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
cartSchema.index({ userId: 1 });

// Method to calculate cart total - will be called whenever the cart is modified
cartSchema.methods.calculateTotal = async function() {
  let total = 0;
  const Product = mongoose.model('Product');
  
  if (this.items.length === 0) {
    this.total = 0;
    return this.total;
  }
  
  // Get product prices from the Product collection to ensure accuracy
  const productIds = this.items.map(item => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  
  // Create a map of product IDs to prices for efficient lookup
  const priceMap = {};
  products.forEach(product => {
    priceMap[product._id.toString()] = product.price;
  });
  
  // Calculate total using actual product prices
  this.items.forEach(item => {
    const productPrice = priceMap[item.productId.toString()];
    if (productPrice) {
      total += productPrice * item.quantity;
    }
  });
  
  this.total = total;
  return this.total;
};

// Clear cart items
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.total = 0;
  return this.save();
};

// Add item to cart
cartSchema.methods.addItem = function(productId, quantity = 1) {
  const itemIndex = this.items.findIndex(
    item => item.productId.toString() === productId.toString()
  );
  
  if (itemIndex > -1) {
    // Item exists, update quantity
    this.items[itemIndex].quantity += quantity;
  } else {
    // Add new item
    this.items.push({ productId, quantity });
  }
  
  return this;
};

// Remove item from cart
cartSchema.methods.removeItem = function(productId) {
  const itemIndex = this.items.findIndex(
    item => item.productId.toString() === productId.toString()
  );
  
  if (itemIndex > -1) {
    this.items.splice(itemIndex, 1);
  }
  
  return this;
};

// Update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
  const itemIndex = this.items.findIndex(
    item => item.productId.toString() === productId.toString()
  );
  
  if (itemIndex > -1 && quantity > 0) {
    this.items[itemIndex].quantity = quantity;
  } else if (itemIndex > -1 && quantity <= 0) {
    // Remove item if quantity is 0 or negative
    this.items.splice(itemIndex, 1);
  }
  
  return this;
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart; 