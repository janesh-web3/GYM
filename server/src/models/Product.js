import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['Supplements', 'Equipment', 'Clothing', 'Accessories', 'Other'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be greater than or equal to 0']
  },
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Stock must be greater than or equal to 0'],
    default: 0
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  image: {
    type: String,
    default: 'default-product.jpg'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  ratings: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      review: {
        type: String,
        trim: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  averageRating: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });

// Virtual for URL
productSchema.virtual('url').get(function() {
  return `/products/${this._id}`;
});

// Calculate average rating before saving
productSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    const totalRatings = this.ratings.reduce((sum, item) => sum + item.rating, 0);
    this.averageRating = totalRatings / this.ratings.length;
  } else {
    this.averageRating = 0;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product; 