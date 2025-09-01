import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [company, setCompany] = useState('oasis_outfit');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = isSignup ? await signUp(email, password, company) : await signIn(email, password);
      if (result.success) {
        if (isSignup) {
          alert('Account created successfully! Redirecting to dashboard...');
          // Redirect to dashboard after signup
          setTimeout(async () => {
            const { data: moderatorData } = await supabase
              .from('moderators')
              .select('company')
              .eq('user_id', result.user.id)
              .single();
            
            const userCompany = moderatorData?.company || 'oasis_outfit';
            if (userCompany === 'zizii_island') {
              navigate('/birthday-dashboard');
            } else {
              navigate('/moderator-dashboard');
            }
          }, 500);
        } else {
          // For login, redirect based on company
          setTimeout(async () => {
            const { data: moderatorData } = await supabase
              .from('moderators')
              .select('company')
              .eq('user_id', result.user.id)
              .single();
            
            const userCompany = moderatorData?.company || 'oasis_outfit';
            if (userCompany === 'zizii_island') {
              navigate('/birthday-dashboard');
            } else {
              navigate('/moderator-dashboard');
            }
          }, 100);
        }
      } else {
        alert((isSignup ? 'Signup' : 'Login') + ' failed: ' + result.error);
      }
    } catch (error) {
      alert((isSignup ? 'Signup' : 'Login') + ' error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background flex items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {isSignup ? 'Create Account' : 'Moderator Login'}
            </h1>
            <p className="text-muted-foreground">
              {isSignup ? 'Create a new moderator account' : 'Sign in to access your dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company
                </label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="oasis_outfit">Oasis Outfit (Bulk Messaging)</option>
                  <option value="zizii_island">Zizii Island (Birthday Wishes)</option>
                </select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={!email || !password}
            >
              {loading ? (isSignup ? 'Creating Account...' : 'Signing in...') : (isSignup ? 'Create Account' : 'Sign In')}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-sm text-primary hover:underline"
              >
                {isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium text-foreground mb-2">Instructions:</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Create account with bonna@gmail.com</p>
              <p>• Use any password you want</p>
              <p>• After signup, sign in to access dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;