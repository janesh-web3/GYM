import { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Package
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: 'supplements' | 'equipment' | 'apparel' | 'accessories';
  image: string;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Whey Protein Powder',
    description: 'High-quality protein powder for muscle recovery',
    price: 49.99,
    stock: 150,
    category: 'supplements',
    image: 'https://via.placeholder.com/150'
  },
  {
    id: '2',
    name: 'Resistance Bands Set',
    description: 'Set of 5 resistance bands for strength training',
    price: 29.99,
    stock: 75,
    category: 'equipment',
    image: 'https://via.placeholder.com/150'
  },
  {
    id: '3',
    name: 'Gym Tank Top',
    description: 'Breathable and comfortable workout tank top',
    price: 24.99,
    stock: 200,
    category: 'apparel',
    image: 'https://via.placeholder.com/150'
  },
  {
    id: '4',
    name: 'Gym Bag',
    description: 'Spacious gym bag with multiple compartments',
    price: 39.99,
    stock: 50,
    category: 'accessories',
    image: 'https://via.placeholder.com/150'
  }
];

const ProductListing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getCategoryColor = (category: Product['category']) => {
    switch (category) {
      case 'supplements':
        return 'bg-blue-100 text-blue-800';
      case 'equipment':
        return 'bg-green-100 text-green-800';
      case 'apparel':
        return 'bg-purple-100 text-purple-800';
      case 'accessories':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Product Listing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage gym-related products available on the platform
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            <option value="supplements">Supplements</option>
            <option value="equipment">Equipment</option>
            <option value="apparel">Apparel</option>
            <option value="accessories">Accessories</option>
          </select>
          <Filter className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                    product.category
                  )}`}
                >
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {product.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {product.stock} in stock
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-500 hover:text-gray-700">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">Add New Product</h2>
              <form className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Stock
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="supplements">Supplements</option>
                    <option value="equipment">Equipment</option>
                    <option value="apparel">Apparel</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Image
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListing; 