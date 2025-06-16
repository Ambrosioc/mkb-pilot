'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@minimals.cc');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error('Erreur de connexion: ' + error.message);
    } else {
      toast.success('Connexion réussie !');
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Hi, Welcome back
            </h1>
            <p className="text-gray-600 text-lg">
              More effectively with optimized workflows.
            </p>
          </div>
          
          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Dashboard mockup */}
            <div className="bg-gray-100 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-mkb-blue rounded-lg p-4 flex-1">
                    <div className="w-8 h-8 bg-white/20 rounded mb-2"></div>
                    <div className="h-2 bg-white/30 rounded mb-1"></div>
                    <div className="h-2 bg-white/20 rounded w-2/3"></div>
                  </div>
                  <div className="bg-mkb-yellow rounded-lg p-4 flex-1">
                    <div className="w-8 h-8 bg-white/20 rounded mb-2"></div>
                    <div className="h-2 bg-white/30 rounded mb-1"></div>
                    <div className="h-2 bg-white/20 rounded w-2/3"></div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 border-4 border-mkb-blue border-t-transparent rounded-full relative">
                      <div className="absolute inset-2 bg-mkb-yellow rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 w-12 h-12 bg-mkb-blue rounded-lg shadow-lg flex items-center justify-center"
            >
              <div className="w-6 h-6 bg-white rounded"></div>
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -bottom-4 -left-4 w-10 h-10 bg-mkb-yellow rounded-full shadow-lg"
            ></motion.div>
          </motion.div>
          
          {/* Bottom icons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center gap-4 mt-8 text-gray-400"
          >
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs">⚡</span>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs">🔒</span>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs">⚠️</span>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs">🛡️</span>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs">⚙️</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <Card className="border-0 shadow-none">
            <CardHeader className="text-left pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Sign in to your account
              </CardTitle>
              <CardDescription className="text-gray-600">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-mkb-blue hover:text-mkb-blue/80 font-medium"
                >
                  Get started
                </Link>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Votre adresse mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-gray-300 focus:border-mkb-blue focus:ring-mkb-blue"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-gray-600 hover:text-mkb-blue"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pr-12 border-gray-300 focus:border-mkb-blue focus:ring-mkb-blue"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Propulsé par{' '}
              <a 
                href="https://acdinnovservices.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-mkb-blue font-semibold hover:text-mkb-blue/80 transition-colors"
              >
                acdinnovservices
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}