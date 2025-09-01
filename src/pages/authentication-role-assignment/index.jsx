import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingHeader from './components/BrandingHeader';
import LoginForm from './components/LoginForm';
import SecurityStatus from './components/SecurityStatus';
import RoleConfirmation from './components/RoleConfirmation';
import Icon from '../../components/AppIcon';

const AuthenticationRoleAssignment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('login'); // 'login', 'confirmation'
  const [isLoading, setIsLoading] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  // Session timeout management
  useEffect(() => {
    if (authenticatedUser) {
      // Set session timeout for 30 minutes
      const timeout = setTimeout(() => {
        setShowTimeoutWarning(true);
        // Auto logout after warning
        setTimeout(() => {
          handleLogout();
        }, 60000); // 1 minute warning
      }, 29 * 60 * 1000); // 29 minutes

      setSessionTimeout(timeout);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [authenticatedUser]);

  // Handle login submission
  const handleLogin = async (formData) => {
    setIsLoading(true);
    
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const userSession = {
        username: formData?.username,
        role: formData?.role,
        loginTime: new Date(),
        rememberDevice: formData?.rememberDevice,
        sessionId: 'WBM-' + Math.random()?.toString(36)?.substr(2, 9)?.toUpperCase()
      };

      setAuthenticatedUser(userSession);
      setCurrentStep('confirmation');
      
      // Store session if remember device is checked
      if (formData?.rememberDevice) {
        localStorage.setItem('wbm_session', JSON.stringify(userSession));
      }
      
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle role confirmation and redirect
  const handleProceed = (redirectPath) => {
    navigate(redirectPath);
  };

  // Handle logout
  const handleLogout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    localStorage.removeItem('wbm_session');
    setAuthenticatedUser(null);
    setCurrentStep('login');
    setShowTimeoutWarning(false);
  };

  // Check for existing session on component mount
  useEffect(() => {
    const savedSession = localStorage.getItem('wbm_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const timeDiff = now - loginTime;
        
        // Check if session is still valid (30 days for remembered devices)
        if (timeDiff < 30 * 24 * 60 * 60 * 1000) {
          setAuthenticatedUser(session);
          setCurrentStep('confirmation');
        } else {
          localStorage.removeItem('wbm_session');
        }
      } catch (error) {
        localStorage.removeItem('wbm_session');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Session Timeout Warning */}
      {showTimeoutWarning && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-warning text-warning-foreground rounded-lg shadow-lg border border-warning/20 max-w-sm">
          <div className="flex items-start space-x-3">
            <Icon name="Clock" size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Session Expiring</h4>
              <p className="text-xs mt-1">Your session will expire in 1 minute due to inactivity.</p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {currentStep === 'login' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Branding and Security */}
              <div className="space-y-8">
                <BrandingHeader />
                <div className="hidden lg:block">
                  <SecurityStatus />
                </div>
              </div>

              {/* Right Column - Login Form */}
              <div className="lg:pt-16">
                <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Sign In to Your Account
                    </h2>
                    <p className="text-muted-foreground">
                      Enter your credentials to access the messaging system
                    </p>
                  </div>
                  
                  <LoginForm onLogin={handleLogin} isLoading={isLoading} />
                </div>

                {/* Mobile Security Status */}
                <div className="lg:hidden mt-8">
                  <SecurityStatus />
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Welcome, {authenticatedUser?.username}
                  </h2>
                  <p className="text-muted-foreground">
                    Please review your access permissions and continue to your dashboard
                  </p>
                </div>
                
                <RoleConfirmation
                  userRole={authenticatedUser?.role}
                  onProceed={handleProceed}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>WhatsApp Bulk Messenger v2.1.0</span>
              <div className="w-px h-4 bg-border"></div>
              <span>System Status: Online</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthenticationRoleAssignment;