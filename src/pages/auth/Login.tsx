
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, BadgeInfo, Info, Lock, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      // Navigation is handled in the login function
    } catch (error) {
      // Error handling is done in the login function
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = () => {
    setEmail('admin@example.com');
    setPassword('password');
  };

  const handleUserLogin = () => {
    setEmail('user@example.com');
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your WhatsApp Platform account
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !email || !password}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center w-full">
              <Link to="/pricing" className="font-medium text-primary hover:text-primary-dark">
                Don't have an account? View pricing plans
              </Link>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                Demo Accounts 
                <Badge variant="outline" className="ml-2">Testing Only</Badge>
              </AlertTitle>
              <AlertDescription className="mt-2">
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={handleAdminLogin} className="justify-start">
                    <BadgeInfo className="h-4 w-4 mr-2" />
                    Admin User (with analytics access)
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleUserLogin} className="justify-start">
                    <BadgeInfo className="h-4 w-4 mr-2" />
                    Regular User
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
