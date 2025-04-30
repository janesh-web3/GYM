import { useState } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';

const Topbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">Gym Owner Dashboard</h2>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <User size={20} className="text-primary-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">John Doe</span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  // Handle logout
                  setIsMenuOpen(false);
                }}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar; 