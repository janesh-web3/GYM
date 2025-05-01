import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import DynamicSidebar from '../components/DynamicSidebar';
import DynamicHeader from '../components/DynamicHeader';
import { useAuth } from '../context/AuthContext';

interface AppLayoutProps {
  children?: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Only show sidebar for authenticated users */}
      {isAuthenticated && user && <DynamicSidebar>  </DynamicSidebar>}
      
      <div className="flex-1 flex flex-col">
        <DynamicHeader />
        
        <main className={`flex-1 ${isAuthenticated ? 'pt-16' : ''} transition-all duration-300`}>
          <div className={`2xl:container mx-auto px-4 py-6 max-w-full`}>
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout; 