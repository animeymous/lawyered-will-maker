'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Home,
  TrendingUp,
  ArrowRight,
  Calendar,
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
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'ready_for_review':
        return 'bg-amber-100 text-amber-700 border-amber-200';
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

  const completedCount = wills.filter((w) => w.status === 'completed').length;
  const inProgressCount = wills.filter((w) => w.status === 'draft' || w.status === 'in_progress').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Will Maker</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:flex gap-1 text-xs">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </Badge>
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 border-2 border-blue-100">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                  {getInitials(user?.name || 'User')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                document.cookie = 'token=; Max-Age=0; path=/';
                router.push('/');
              }}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
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
              <h2 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name} 👋</h2>
              <p className="text-gray-500 mt-1">
                {wills.length === 0 
                  ? 'Start creating your first will today' 
                  : `You have ${wills.length} will${wills.length > 1 ? 's' : ''} in your account`
                }
              </p>
            </div>
            <Button
              onClick={createWill}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Will
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{wills.length}</p>
                <p className="text-xs text-gray-500">Total Wills</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{completedCount}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{inProgressCount}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">✓</p>
                <p className="text-xs text-gray-500">All Legal</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Download Will</p>
                <p className="text-xs text-gray-500">Export as PDF</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Beneficiaries</p>
                <p className="text-xs text-gray-500">Manage inheritance</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <Wallet className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Assets</p>
                <p className="text-xs text-gray-500">Add or update</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Wills */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <FileText className="w-5 h-5 text-blue-600" />
              Your Wills
            </CardTitle>
            <CardDescription>View and manage all your wills</CardDescription>
          </CardHeader>
          <CardContent>
            {wills.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No wills yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Start creating your will with our AI assistant
                </p>
                <Button onClick={createWill} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
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
                    transition={{ delay: index * 0.08 }}
                    className="flex items-center justify-between p-4 bg-white border rounded-xl hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
                    onClick={() => router.push(`/will/${will._id}`)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {will.testator?.fullName || 'Unnamed Will'}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(will.updatedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <Badge className={`${getStatusColor(will.status)} border`}>
                            {getStatusIcon(will.status)}
                            <span className="ml-1 capitalize text-xs">
                              {will.status.replace('_', ' ')}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm text-gray-600">
                          {will.assets?.length || 0} Assets
                        </p>
                        <p className="text-xs text-gray-400">
                          {will.beneficiaries?.length || 0} Beneficiaries
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        {will.status === 'completed' ? 'View' : 'Continue'}
                        <ArrowRight className="w-3 h-3 ml-1" />
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