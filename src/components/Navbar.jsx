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
    <nav className="bg-card border-b border-border">
      <div className="px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <Icon name="MessageCircle" size={20} className="text-primary" />
            <h1 className="text-base sm:text-lg font-semibold text-foreground">
              <span className="hidden sm:block">WhatsApp Manager</span>
              <span className="block sm:hidden">WA Manager</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex items-center space-x-2"
              >
                <Icon name={item.icon} size={16} />
                <span className="text-sm">{item.label}</span>
              </Button>
            ))}
          </div>

          {/* Mobile Menu Button & User Info */}
          <div className="flex items-center space-x-2">
            {/* User Info - Desktop */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="User" size={16} className="text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {user?.email?.split('@')[0]}
                </div>
                <div className="text-xs text-muted-foreground">
                  {userRole === 'superadmin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Moderator'}
                </div>
                <div className="text-xs text-blue-600">
                  {userCompany === 'zizii_island' ? 'Zizii Island' : 'Oasis Outfit'}
                </div>
              </div>
            </div>

            {/* Sign Out - Desktop */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="hidden sm:flex items-center space-x-2"
            >
              <Icon name="LogOut" size={16} />
              <span>Sign Out</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-3 py-2 space-y-1">
            {/* Mobile Navigation Items */}
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start flex items-center space-x-3"
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </Button>
            ))}
            
            {/* Mobile User Info */}
            <div className="pt-2 mt-2 border-t border-border">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} className="text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {user?.email?.split('@')[0]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {userRole === 'superadmin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Moderator'}
                  </div>
                  <div className="text-xs text-blue-600">
                    {userCompany === 'zizii_island' ? 'Zizii Island' : 'Oasis Outfit'}
                  </div>
                </div>
              </div>
              
              {/* Mobile Sign Out */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start flex items-center space-x-3 mt-2"
              >
                <Icon name="LogOut" size={18} />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;