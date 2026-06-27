'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  LogOut,
  Sparkles,
  Shield,
  Users,
  Wallet,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [wills, setWills] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setUser(data.user);
      
      // Fetch user's wills
      const willsRes = await fetch('/api/will/list');
      if (willsRes.ok) {
        const willsData = await willsRes.json();
        setWills(willsData.wills || []);
      }
      
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const createWill = async () => {
    const res = await fetch('/api/will/create', { method: 'POST' });
    const data = await res.json();
    if (data.willId) {
      router.push(`/will/${data.willId}`);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'ready_for_review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'ready_for_review':
        return <Clock className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Will Maker
              </h1>
              <p className="text-xs text-muted-foreground">Legacy Planning</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:flex gap-1">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </Badge>
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 border-2 border-blue-100">
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700">
                  {getInitials(user?.name || 'User')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                document.cookie = 'token=; Max-Age=0; path=/';
                router.push('/');
              }}
              className="text-muted-foreground hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">Welcome back, {user?.name} 👋</h2>
              <p className="text-muted-foreground mt-1">
                Create and manage your will with AI assistance
              </p>
            </div>
            <Button
              onClick={createWill}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Will
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{wills.length}</p>
                <p className="text-xs text-muted-foreground">Total Wills</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {wills.filter((w) => w.status === 'completed').length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {wills.filter((w) => w.status === 'draft' || w.status === 'in_progress').length}
                </p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-muted-foreground">Legal Compliance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Wills */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Your Wills
            </CardTitle>
            <CardDescription>Manage your existing wills or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            {wills.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No wills yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start creating your will with our AI assistant
                </p>
                <Button onClick={createWill} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Will
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {wills.map((will, index) => (
                  <motion.div
                    key={will._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/will/${will._id}`)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {will.testator?.fullName || 'Unnamed Will'}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {new Date(will.updatedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <Badge className={getStatusColor(will.status)}>
                            {getStatusIcon(will.status)}
                            <span className="ml-1 capitalize">
                              {will.status.replace('_', ' ')}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm">
                          {will.assets?.length || 0} Assets
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {will.beneficiaries?.length || 0} Beneficiaries
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="group-hover:bg-blue-50 group-hover:text-blue-600"
                      >
                        {will.status === 'completed' ? 'View' : 'Continue'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}