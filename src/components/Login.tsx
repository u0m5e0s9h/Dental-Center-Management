import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = login(email, password);
    
    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome to the Dental Center Dashboard",
      });
      if (email === 'admin@entnt.in') {
        window.location.href = '/';
      } else {
        window.location.href = '/my-appointments';
      }
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 to-pink-200 p-4">
      <Card className="w-full max-w-md shadow-xl bg-pink-50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-extrabold text-pink-700">
            ENTNT Dental Center
          </CardTitle>
          <CardDescription className="text-lg text-pink-600">
            Welcome to the Management Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-pink-700 font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-200 focus:scale-105 border-pink-300 focus:ring-pink-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-pink-700 font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all duration-200 focus:scale-105 border-pink-300 focus:ring-pink-400"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-pink-100 rounded-lg text-sm text-pink-700">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <div className="space-y-1">
              <p><strong>Admin:</strong> admin@entnt.in / admin123</p>
              <p><strong>Patient:</strong> john@entnt.in / patient123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
