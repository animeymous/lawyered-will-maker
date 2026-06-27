'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}! 👋</h1>
            <p className="text-gray-500">Create your will with our AI assistant</p>
          </div>
          <Button
            onClick={() => {
              document.cookie = 'token=; Max-Age=0; path=/';
              router.push('/');
            }}
            variant="secondary"
          >
            Logout
          </Button>
        </div>

        <Card className="mb-6">
          <CardBody className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold mb-2">Start Your Will</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Answer a few simple questions and our AI will help you create a legally valid will.
            </p>
            <Button onClick={createWill} variant="primary" className="px-8 py-3 text-lg">
              Start New Will
            </Button>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="font-semibold">AI-Powered</h3>
              <p className="text-sm text-gray-500">Natural conversation</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl mb-2">📄</div>
              <h3 className="font-semibold">PDF Generation</h3>
              <p className="text-sm text-gray-500">Download anytime</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl mb-2">💾</div>
              <h3 className="font-semibold">Save & Resume</h3>
              <p className="text-sm text-gray-500">Pick up where you left off</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}