import React, { useState, useEffect, Fragment } from 'react';
import { 
  ShoppingCart, 
  Star, 
  Search,
  Filter,
  Plus,
  Minus,
  Loader,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { showError } from '../../utils/toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  description: string;
  stock?: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 8,
    pages: 0
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const categoryFilter = selectedCategory ? `&category=${selectedCategory}` : '';
      const searchFilter = searchTerm ? `&search=${searchTerm}` : '';
      
      const response = await fetch(
        `/api/products?page=${pagination.page}&limit=${pagination.limit}${categoryFilter}${searchFilter}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Format products to match our interface
        const formattedProducts: Product[] = data.data.products.map((product: any) => ({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image || 'https://images.unsplash.com/photo-1599059813009-79740a0eb0c2',
          rating: product.rating || 4.0,
          category: product.category,
          description: product.description,
          stock: product.stock
        }));
        
        setProducts(formattedProducts);
        setPagination(data.data.pagination);
        
        // Extract unique categories
        if (products.length === 0) {
          const uniqueCategories = Array.from(
            new Set(formattedProducts.map(p => p.category))
          ).filter(Boolean);
          
          setCategories(uniqueCategories as string[]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    fetchProducts();
  };

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const cartTotal = Object.entries(cart).reduce((total, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return total + (product?.price || 0) * quantity;
  }, 0);

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gym Shop</h1>
          <p className="text-gray-500">Browse and purchase fitness products</p>
        </div>
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <button type="submit" className="sr-only">Search</button>
          </form>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow p-6">
          <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">No Products Found</h2>
          <p className="text-gray-500 mt-2">Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-500">{product.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  {cart[product.id] ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-gray-900">{cart[product.id]}</span>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product.id)}
                      className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      disabled={!product.stock || product.stock <= 0}
                    >
                      {!product.stock || product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`p-2 rounded-md ${
                pagination.page === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(page => 
                // Show current page, first, last, and pages around current
                page === 1 || 
                page === pagination.pages || 
                (page >= pagination.page - 1 && page <= pagination.page + 1)
              )
              .map((page, i, array) => (
                <Fragment key={page}>
                  {i > 0 && array[i - 1] !== page - 1 && (
                    <span className="px-2 py-1 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => changePage(page)}
                    className={`px-3 py-1 rounded-md ${
                      pagination.page === page
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                </Fragment>
              ))}
            
            <button
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className={`p-2 rounded-md ${
                pagination.page === pagination.pages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </nav>
        </div>
      )}

      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-0 right-0 w-full md:w-96 bg-white shadow-lg rounded-t-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Shopping Cart</h3>
            <span className="text-sm text-gray-500">{Object.values(cart).reduce((a, b) => a + b, 0)} items</span>
          </div>
          <div className="space-y-2 mb-4">
            {Object.entries(cart).map(([productId, quantity]) => {
              const product = products.find(p => p.id === productId);
              return (
                <div key={productId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-900">{product?.name}</span>
                    <span className="text-gray-500 mx-2">x</span>
                    <span className="text-gray-900">{quantity}</span>
                  </div>
                  <span className="text-gray-900">${((product?.price || 0) * quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center border-t pt-4">
            <span className="font-medium text-gray-900">Total</span>
            <span className="font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Shop; 