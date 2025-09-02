import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from './ui/Button';
import Icon from './AppIcon';

const Navbar = () => {
  const { user, signOut, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const [userRole, setUserRole] = useState('moderator');
  const [userCompany, setUserCompany] = useState('oasis_outfit');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const { data } = await supabase
          .from('moderators')
          .select('role, company')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setUserRole(data.role);
          setUserCompany(data.company || 'oasis_outfit');
        }
      }
    };
    fetchUserData();
  }, [user]);
  
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  

  
  const navItems = [
    ...(userRole === 'moderator' ? [
      userCompany === 'zizii_island' 
        ? { path: '/birthday-dashboard', label: 'Birthday', icon: 'Gift' }
        : { path: '/moderator-dashboard', label: 'Dashboard', icon: 'BarChart3' }
    ] : []),
    ...(isAdmin ? [
      { path: '/admin-dashboard', label: 'Admin', icon: 'Shield' },
      { path: '/admin-upload', label: 'Upload', icon: 'Upload' },
      { path: '/admin-assign', label: 'Assign', icon: 'Users' },
      { path: '/birthday-dashboard', label: 'Birthday', icon: 'Gift' },
    ] : [])
  ];

  const isActive = (path) => location.pathname === path;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated || loading) return null;

  return (
    <nav className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <Icon name="MessageCircle" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                <span className="hidden sm:block">WhatsApp Manager</span>
                <span className="block sm:hidden">WA Manager</span>
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block font-medium">Communication Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200'
                }`}
              >
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* User Info - Desktop */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user?.email?.split('@')[0]}
                </div>
                <div className="text-xs text-gray-500">
                  {userRole === 'superadmin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Moderator'} • {userCompany === 'zizii_island' ? 'Zizii Island' : 'Oasis Outfit'}
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <Icon name="User" size={18} className="text-white" />
              </div>
            </div>

            {/* Sign Out - Desktop */}
            <button
              onClick={handleSignOut}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-lg transition-all duration-200"
            >
              <Icon name="LogOut" size={16} />
              <span>Sign Out</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 transition-all duration-200"
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
          <div className="px-4 py-3 space-y-1">
            {/* Mobile Navigation Items */}
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200'
                }`}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </button>
            ))}
            
            {/* Mobile User Info */}
            <div className="pt-3 mt-3 border-t border-gray-200">
              <div className="flex items-center space-x-3 px-3 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <Icon name="User" size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.email?.split('@')[0]}
                  </div>
                  <div className="text-xs text-gray-500">
                    {userRole === 'superadmin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Moderator'}
                  </div>
                  <div className="text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {userCompany === 'zizii_island' ? 'Zizii Island' : 'Oasis Outfit'}
                  </div>
                </div>
              </div>
              
              {/* Mobile Sign Out */}
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 mt-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-lg transition-all duration-200 shadow-sm"
              >
                <Icon name="LogOut" size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;