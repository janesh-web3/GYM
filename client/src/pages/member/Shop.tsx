import { useState } from 'react';
import { 
  ShoppingCart, 
  Star, 
  Search,
  Filter,
  Plus,
  Minus
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  description: string;
}

const Shop = () => {
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Protein Powder',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1599059813009-79740a0eb0c2',
      rating: 4.5,
      category: 'Supplements',
      description: 'High-quality whey protein for muscle recovery'
    },
    {
      id: '2',
      name: 'Resistance Bands',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1599059813009-79740a0eb0c2',
      rating: 4.2,
      category: 'Equipment',
      description: 'Set of 5 resistance bands for home workouts'
    },
    {
      id: '3',
      name: 'Gym Bag',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1599059813009-79740a0eb0c2',
      rating: 4.8,
      category: 'Accessories',
      description: 'Spacious gym bag with multiple compartments'
    },
    {
      id: '4',
      name: 'Pre-Workout',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1599059813009-79740a0eb0c2',
      rating: 4.3,
      category: 'Supplements',
      description: 'Energy-boosting pre-workout formula'
    }
  ]);

  const [cart, setCart] = useState<{ [key: string]: number }>({});

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gym Shop</h1>
          <p className="text-gray-500">Browse and purchase fitness products</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

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
                <span className="text-lg font-bold text-gray-900">${product.price}</span>
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
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

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
                  <span className="text-gray-900">${(product?.price || 0) * quantity}</span>
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