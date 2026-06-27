'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchWill();
    }
  }, [id]);

  const fetchWill = async () => {
    try {
      const res = await fetch(`/api/will/${id}`);
      if (!res.ok) {
        console.error('Failed to fetch will');
        setLoadingPage(false);
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

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

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
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
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
      a.download = 'will.pdf';
      a.click();
    }
  };

  const getCompletionPercentage = () => {
    if (!completion) return 0;
    const values = Object.values(completion);
    const completed = values.filter(v => v === true).length;
    return Math.round((completed / values.length) * 100);
  };

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading your will...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg flex-1 flex flex-col">
          <div className="p-4 border-b bg-blue-50 rounded-t-lg">
            <h2 className="text-lg font-semibold">AI Will Assistant</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Progress: {getCompletionPercentage()}%</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {status}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[400px]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 p-3 rounded-lg">
                  <span className="animate-pulse">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your answer..."
                className="flex-1 p-2 border rounded focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={downloadPDF}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Download PDF
        </button>
      </div>

      {/* Preview Section */}
      <div className="w-96 bg-white p-4 border-l overflow-y-auto hidden lg:block">
        <h3 className="font-bold mb-4">Will Preview</h3>
        {willData && (
          <div className="space-y-3 text-sm">
            <div className="border-b pb-2">
              <p className="font-semibold">Testator</p>
              <p>{willData.testator?.fullName || 'Not provided'}</p>
              <p className="text-gray-600">{willData.testator?.address || ''}</p>
            </div>

            <div className="border-b pb-2">
              <p className="font-semibold">Assets ({willData.assets?.length || 0})</p>
              {willData.assets?.map((a: any, i: number) => (
                <p key={i} className="text-gray-600">• {a.name}</p>
              ))}
            </div>

            <div className="border-b pb-2">
              <p className="font-semibold">Beneficiaries ({willData.beneficiaries?.length || 0})</p>
              {willData.beneficiaries?.map((b: any, i: number) => (
                <p key={i} className="text-gray-600">• {b.name} ({b.relationship})</p>
              ))}
            </div>

            <div>
              <p className="font-semibold">Completion</p>
              {completion && Object.entries(completion).map(([key, val]) => (
                <p key={key} className="text-gray-600">
                  {key}: {val ? '✅' : '❌'}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}