import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import mongoose from 'mongoose';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (SuperAdmin)
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, description, image, isFeatured } = req.body;

    // SuperAdmin authorization is handled in route middleware

    // Create product
    const product = new Product({
      name,
      category,
      price,
      stock,
      description,
      image: image || 'default-product.jpg',
      isFeatured: isFeatured || false,
      createdBy: req.user.id
    });

    const savedProduct = await product.save();

    return successResponse(res, 201, 'Product created successfully', savedProduct);
  } catch (error) {
    console.error('Create product error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      isFeatured, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query object
    const query = {};

    // Apply filters if provided
    if (category) {
      query.category = category;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        query.price.$lte = Number(maxPrice);
      }
    }
    
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination values
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Set up sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination and sorting
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    return successResponse(res, 200, 'Products retrieved successfully', {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const limitNum = parseInt(limit, 10);

    const products = await Product.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limitNum);

    return successResponse(res, 200, 'Featured products retrieved successfully', products);
  } catch (error) {
    console.error('Get featured products error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get a product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid product ID');
    }

    const product = await Product.findById(id);

    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    return successResponse(res, 200, 'Product retrieved successfully', product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (SuperAdmin)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, description, image, isFeatured } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid product ID');
    }

    // SuperAdmin authorization is handled in route middleware

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    // Update product fields
    product.name = name || product.name;
    product.category = category || product.category;
    product.price = price !== undefined ? price : product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    product.description = description || product.description;
    product.image = image || product.image;
    product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;

    const updatedProduct = await product.save();

    return successResponse(res, 200, 'Product updated successfully', updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (SuperAdmin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid product ID');
    }

    // SuperAdmin authorization is handled in route middleware

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    await product.deleteOne();

    return successResponse(res, 200, 'Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Add a product rating & review
// @route   POST /api/products/:id/ratings
// @access  Private (Member)
export const addProductRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid product ID');
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, 400, 'Rating must be between 1 and 5');
    }

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    // Check if user has already rated this product
    const existingRatingIndex = product.ratings.findIndex(
      r => r.userId.toString() === userId
    );

    if (existingRatingIndex >= 0) {
      // Update existing rating
      product.ratings[existingRatingIndex].rating = rating;
      product.ratings[existingRatingIndex].review = review || '';
      product.ratings[existingRatingIndex].date = new Date();
    } else {
      // Add new rating
      product.ratings.push({
        userId,
        rating,
        review: review || '',
        date: new Date()
      });
    }

    // Save product (pre-save hook will recalculate average rating)
    await product.save();

    return successResponse(res, 200, 'Product rating added successfully', {
      averageRating: product.averageRating,
      ratingsCount: product.ratings.length
    });
  } catch (error) {
    console.error('Add product rating error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Get product ratings
// @route   GET /api/products/:id/ratings
// @access  Public
export const getProductRatings = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid product ID');
    }

    // Check if product exists
    const product = await Product.findById(id).populate('ratings.userId', 'name');
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    return successResponse(res, 200, 'Product ratings retrieved successfully', {
      averageRating: product.averageRating,
      ratingsCount: product.ratings.length,
      ratings: product.ratings
    });
  } catch (error) {
    console.error('Get product ratings error:', error);
    return errorResponse(res, 500, 'Server error');
  }
}; 