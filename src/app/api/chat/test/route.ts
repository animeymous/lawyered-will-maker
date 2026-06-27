import { NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini';

export async function GET() {
  try {
    const result = await geminiModel.generateContent(
      "You are a legal assistant. Briefly explain what a will is in one sentence."
    );
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({ 
      success: true, 
      message: "Gemini is working!",
      response: text 
    });
  } catch (error) {
    console.error('Gemini test error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Gemini' },
      { status: 500 }
    );
  }
}