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

  if (!isAuthenticated || loading) return null;

  return (
    <nav className="bg-card border-b border-border px-3 sm:px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-2">
          <Icon name="MessageCircle" size={20} className="text-primary" />
          <h1 className="text-base sm:text-lg font-semibold text-foreground">
            <span className="hidden sm:block">WhatsApp Manager</span>
            <span className="block sm:hidden">WA Manager</span>
          </h1>
        </div>
        
        {/* Navigation Items - Mobile Horizontal Scroll */}
        <div className="flex items-center space-x-1 overflow-x-auto flex-1 mx-4">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate(item.path)}
              className="flex items-center space-x-1 whitespace-nowrap flex-shrink-0"
            >
              <Icon name={item.icon} size={14} />
              <span className="text-xs sm:text-sm">
                {item.label === 'Dashboard' ? (
                  <>
                    <span className="hidden sm:block">Dashboard</span>
                    <span className="block sm:hidden">Home</span>
                  </>
                ) : item.label === 'Admin' ? (
                  <>
                    <span className="hidden sm:block">Admin</span>
                    <span className="block sm:hidden">Admin</span>
                  </>
                ) : item.label === 'Upload' ? (
                  <>
                    <span className="hidden sm:block">Upload</span>
                    <span className="block sm:hidden">Upload</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:block">{item.label}</span>
                    <span className="block sm:hidden">{item.label.slice(0, 6)}</span>
                  </>
                )}
              </span>
            </Button>
          ))}
        </div>

        {/* User Info and Sign Out */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="User" size={12} className="text-primary" />
            </div>
            <div className="block">
              <div className="text-xs font-medium text-foreground truncate max-w-20 sm:max-w-24">
                {user?.email?.split('@')[0]}
              </div>
              <div className="text-xs text-muted-foreground truncate max-w-20 sm:max-w-32">
                {userRole === 'superadmin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Moderator'}
              </div>
              <div className="text-xs text-blue-600 truncate max-w-20 sm:max-w-32">
                {userCompany === 'zizii_island' ? 'Zizii Island' : 'Oasis Outfit'}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center space-x-1"
          >
            <Icon name="LogOut" size={14} />
            <span className="hidden sm:block text-xs sm:text-sm">Sign Out</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;