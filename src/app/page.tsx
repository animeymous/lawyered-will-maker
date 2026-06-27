'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, FileText, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center"
      >
        {/* Left Side - Brand */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block"
        >
          <div className="space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 leading-tight">
              Plan Your<br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Legacy</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Create a legally valid will with AI assistance. Protect your loved ones and secure their future.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>100% Legal</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>PDF Export</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                {isLogin ? 'Welcome Back' : 'Create Your Account'}
              </CardTitle>
              <CardDescription>
                {isLogin ? 'Sign in to continue planning' : 'Start securing your family\'s future today'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
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
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">
                    {isLogin ? 'New user?' : 'Already a user?'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-full text-sm text-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                {isLogin ? (
                  <span>Don't have an account? <span className="font-medium text-blue-600 hover:underline">Sign Up</span></span>
                ) : (
                  <span>Already have an account? <span className="font-medium text-blue-600 hover:underline">Sign In</span></span>
                )}
              </button>
            </CardContent>

            <CardFooter className="flex justify-center border-t p-4 bg-gray-50/50">
              <p className="text-xs text-gray-400">
                Demo: <span className="font-mono text-gray-600">demo@example.com</span> / <span className="font-mono text-gray-600">Demo123!</span>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}