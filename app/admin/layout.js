// app/admin/layout.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeProvider } from '@/app/context/ThemeContext';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Public paths that don't require authentication
  const publicPaths = ['/admin/login', '/admin/register'];
  const isPublicPath = publicPaths.includes(pathname);

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('adminAuthenticated');
      const adminUser = localStorage.getItem('adminUser');
      
      // If on public path, no need to check auth
      if (isPublicPath) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Check if authenticated
      if (adminAuth === 'true' || adminUser) {
        setIsAuthenticated(true);
      } else {
        // Not authenticated, redirect to login
        router.push('/admin/login');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, isPublicPath, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block p-3 bg-blue-600 rounded-full mb-4 animate-pulse">
            <i className="fas fa-spinner fa-spin text-white text-2xl"></i>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If on public path (login/register), render without sidebar
  if (isPublicPath) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  // If not authenticated and not on public path, don't render anything (redirecting)
  if (!isAuthenticated && !isPublicPath) {
    return null;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Admin Header */}
        <header className="bg-white dark:bg-gray-800 shadow-md fixed top-0 left-0 right-0 z-30">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
              >
                <i className="fas fa-bars text-gray-600 dark:text-gray-300"></i>
              </button>
              <div className="ml-4 flex items-center">
                <div className="p-2 bg-blue-600 rounded-lg mr-3">
                  <i className="fas fa-cog text-white"></i>
                </div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                  Admin Panel
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                <i className="fas fa-bell text-gray-600 dark:text-gray-300"></i>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {JSON.parse(localStorage.getItem('adminUser') || '{}')?.username?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {JSON.parse(localStorage.getItem('adminUser') || '{}')?.username || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {JSON.parse(localStorage.getItem('adminUser') || '{}')?.email || 'admin@example.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Sidebar */}
        <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 z-20 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}>
          <div className="h-full overflow-y-auto">
            <nav className="p-4">
              <AdminNavItem 
                href="/admin/dashboard" 
                icon="dashboard" 
                label="Dashboard" 
                sidebarOpen={sidebarOpen}
              />
              <AdminNavItem 
                href="/admin/dropdowns" 
                icon="bars" 
                label="Dropdown Menus" 
                sidebarOpen={sidebarOpen}
              />
              <AdminNavItem 
                href="/admin/programmes" 
                icon="calendar-alt" 
                label="Programmes" 
                sidebarOpen={sidebarOpen}
              />
              <AdminNavItem 
                href="/admin/events" 
                icon="calendar-check" 
                label="Events" 
                sidebarOpen={sidebarOpen}
              />
              <AdminNavItem 
                href="/admin/gallery" 
                icon="images" 
                label="Gallery" 
                sidebarOpen={sidebarOpen}
              />
              <AdminNavItem 
                href="/admin/users" 
                icon="users" 
                label="Users" 
                sidebarOpen={sidebarOpen}
              />
              <AdminNavItem 
                href="/admin/settings" 
                icon="cog" 
                label="Settings" 
                sidebarOpen={sidebarOpen}
              />
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
                <button
                  onClick={() => {
                    localStorage.removeItem('adminAuthenticated');
                    localStorage.removeItem('adminUser');
                    router.push('/admin/login');
                  }}
                  className="w-full flex items-center p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <i className="fas fa-sign-out-alt w-6"></i>
                  {sidebarOpen && <span className="ml-3">Logout</span>}
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

// Admin Navigation Item Component
function AdminNavItem({ href, icon, label, sidebarOpen }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center p-3 mb-1 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <i className={`fas fa-${icon} w-6 text-lg`}></i>
      {sidebarOpen && <span className="ml-3 text-sm font-medium">{label}</span>}
    </Link>
  );
}