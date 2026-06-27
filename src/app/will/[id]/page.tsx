'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Send,
  ArrowLeft,
  Download,
  User,
  Bot,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Home,
  Wallet,
  Users,
  UserCheck,
  Shield,
  PenTool,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface Completion {
  testatorComplete: boolean;
  assetsComplete: boolean;
  beneficiariesComplete: boolean;
  executorComplete: boolean;
  guardianComplete: boolean;
  witnessesComplete: boolean;
  signatureComplete: boolean;
}

export default function WillPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [status, setStatus] = useState('');
  const [willData, setWillData] = useState<any>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      fetchWill();
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchWill = async () => {
    try {
      const res = await fetch(`/api/will/${id}`);
      if (!res.ok) {
        router.push('/dashboard');
        return;
      }
      const data = await res.json();
      setMessages(data.will.conversation || []);
      setCompletion(data.will.completion);
      setStatus(data.will.status);
      setWillData(data.will);
    } catch (error) {
      console.error('Error fetching will:', error);
    } finally {
      setLoadingPage(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ willId: id, message: userMessage }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        setCompletion(data.completion);
        setStatus(data.status);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
          },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Network error. Please check your connection.',
        },
      ]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const downloadPDF = async () => {
    try {
      const res = await fetch('/api/will/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ willId: id }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `will-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const getCompletionPercentage = () => {
    if (!completion) return 0;
    const values = Object.values(completion);
    const completed = values.filter(v => v === true).length;
    return Math.round((completed / values.length) * 100);
  };

  const getCompletionItems = () => {
    if (!completion) return [];
    const labels: Record<keyof Completion, string> = {
      testatorComplete: 'Your Details',
      assetsComplete: 'Assets',
      beneficiariesComplete: 'Beneficiaries',
      executorComplete: 'Executor',
      guardianComplete: 'Guardian',
      witnessesComplete: 'Witnesses',
      signatureComplete: 'Signature',
    };
    return Object.entries(completion).map(([key, value]) => ({
      label: labels[key as keyof Completion] || key,
      complete: value,
      key,
    }));
  };

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your will...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {willData?.testator?.fullName || 'New Will'}
                </p>
                <Badge className={status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                  {status?.replace('_', ' ') || 'Draft'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={downloadPDF}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-180px)] flex flex-col shadow-lg border-0">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    AI Assistant
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Progress value={getCompletionPercentage()} className="w-24" />
                    <span className="text-xs font-medium">
                      {getCompletionPercentage()}%
                    </span>
                  </div>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] flex gap-3 ${
                          msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <Avatar className="w-8 h-8 mt-1">
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              <Bot className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {msg.role === 'user' && (
                          <Avatar className="w-8 h-8 mt-1">
                            <AvatarFallback className="bg-indigo-100 text-indigo-700">
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                              : 'bg-white border shadow-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.content}
                          </p>
                          {msg.timestamp && (
                            <p className="text-xs opacity-60 mt-1">
                              {format(new Date(msg.timestamp), 'h:mm a')}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border shadow-sm px-4 py-3 rounded-2xl">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                          <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <CardContent className="pt-3 border-t">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    disabled={loading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview/Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {getCompletionItems().map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm">{item.label}</span>
                    {item.complete ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Done
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Pending
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {willData?.testator?.fullName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Testator</span>
                    <span className="font-medium">{willData.testator.fullName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assets</span>
                  <span className="font-medium">{willData?.assets?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Beneficiaries</span>
                  <span className="font-medium">{willData?.beneficiaries?.length || 0}</span>
                </div>
                {willData?.executor?.name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Executor</span>
                    <span className="font-medium">{willData.executor.name}</span>
                  </div>
                )}
                <Separator />
                <Button
                  onClick={downloadPDF}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}