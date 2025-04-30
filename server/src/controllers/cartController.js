import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import mongoose from 'mongoose';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private (Member)
export const getCart = async (req, res) => {
  try {
    // Find the user's cart, create if it doesn't exist
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: [],
        total: 0
      });
      await cart.save();
    }

    // Populate product details
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price image stock category description'
    });

    return successResponse(res, 200, 'Cart retrieved successfully', populatedCart);
  } catch (error) {
    console.error('Get cart error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private (Member)
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate productId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse(res, 400, 'Valid product ID is required');
    }

    // Validate quantity
    if (quantity <= 0) {
      return errorResponse(res, 400, 'Quantity must be greater than 0');
    }

    // Check if product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    if (product.stock < quantity) {
      return errorResponse(res, 400, 'Not enough stock available');
    }

    // Find user's cart or create a new one
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: [],
        total: 0
      });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists in cart, update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        productId,
        quantity
      });
    }

    // Calculate new total
    await cart.calculateTotal();
    await cart.save();

    // Return the updated cart with product details
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price image stock category description'
    });

    return successResponse(res, 200, 'Item added to cart successfully', updatedCart);
  } catch (error) {
    console.error('Add to cart error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private (Member)
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse(res, 400, 'Invalid product ID');
    }

    // Validate quantity
    if (quantity <= 0) {
      return errorResponse(res, 400, 'Quantity must be greater than 0');
    }

    // Check if product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    if (product.stock < quantity) {
      return errorResponse(res, 400, 'Not enough stock available');
    }

    // Find user's cart
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return errorResponse(res, 404, 'Cart not found');
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return errorResponse(res, 404, 'Item not found in cart');
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    // Calculate new total
    await cart.calculateTotal();
    await cart.save();

    // Return the updated cart with product details
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price image stock category description'
    });

    return successResponse(res, 200, 'Cart item updated successfully', updatedCart);
  } catch (error) {
    console.error('Update cart item error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private (Member)
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse(res, 400, 'Invalid product ID');
    }

    // Find user's cart
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return errorResponse(res, 404, 'Cart not found');
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return errorResponse(res, 404, 'Item not found in cart');
    }

    // Remove item
    cart.items.splice(itemIndex, 1);

    // Calculate new total
    await cart.calculateTotal();
    await cart.save();

    // Return the updated cart
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price image stock category description'
    });

    return successResponse(res, 200, 'Item removed from cart successfully', updatedCart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private (Member)
export const clearCart = async (req, res) => {
  try {
    // Find user's cart
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return errorResponse(res, 404, 'Cart not found');
    }

    // Clear items and reset total
    cart.items = [];
    cart.total = 0;
    await cart.save();

    return successResponse(res, 200, 'Cart cleared successfully', cart);
  } catch (error) {
    console.error('Clear cart error:', error);
    return errorResponse(res, 500, 'Server error');
  }
}; 