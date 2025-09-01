import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = ({ onLogin, isLoading }) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberDevice: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Use Supabase authentication
      const result = await signIn(formData?.email, formData?.password);
      
      if (result?.success) {
        // Store device preference if remember is checked
        if (formData?.rememberDevice) {
          localStorage.setItem('wbm_remember_device', 'true');
        }
        
        // Navigate to appropriate dashboard based on user role/metadata
        const userRole = result?.user?.user_metadata?.role || 'moderator';
        
        switch (userRole) {
          case 'admin': navigate('/analytics-reporting-dashboard');
            break;
          case 'manager': navigate('/real-time-progress-monitoring');
            break;
          case 'moderator':
          default:
            navigate('/message-status-tracking');
            break;
        }
      } else {
        setErrors({ 
          submit: result?.error || 'Authentication failed. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        submit: 'An unexpected error occurred. Please try again.' 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email Address
        </label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            value={formData?.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            className={`w-full pl-10 ${errors?.email ? 'border-red-500 focus:border-red-500' : ''}`}
            disabled={isLoading}
            autoComplete="email"
          />
          <Icon 
            name="Mail" 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
          />
        </div>
        {errors?.email && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <Icon name="AlertCircle" size={14} />
            {errors?.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData?.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            className={`w-full pl-10 pr-10 ${errors?.password ? 'border-red-500 focus:border-red-500' : ''}`}
            disabled={isLoading}
            autoComplete="current-password"
          />
          <Icon 
            name="Lock" 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
          </button>
        </div>
        {errors?.password && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <Icon name="AlertCircle" size={14} />
            {errors?.password}
          </p>
        )}
      </div>

      {/* Remember Device */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberDevice"
            name="rememberDevice"
            checked={formData?.rememberDevice}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <label htmlFor="rememberDevice" className="text-sm text-muted-foreground">
            Remember this device
          </label>
        </div>
        
        <button
          type="button"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
          disabled={isLoading}
          onClick={() => {
            // Navigate to forgot password page or show modal
            console.log('Forgot password clicked');
          }}
        >
          Forgot password?
        </button>
      </div>

      {/* Submit Error */}
      {errors?.submit && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <Icon name="AlertTriangle" size={16} />
            {errors?.submit}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        iconName={isLoading ? 'Loader2' : 'LogIn'}
        iconPosition="left"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>

      {/* Demo Credentials Helper */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <Icon name="Info" size={16} />
          Demo Credentials
        </h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Admin:</strong> admin@example.com / password123</p>
          <p><strong>Manager:</strong> manager@example.com / password123</p>
          <p><strong>Moderator:</strong> moderator@example.com / password123</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Note: Create these users in your Supabase dashboard or use the signup feature
        </p>
      </div>
    </form>
  );
};

export default LoginForm;