import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Will from '@/models/Will';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Check if user already has a draft will
    const existingWill = await Will.findOne({
      userId: user._id,
      status: { $in: ['draft', 'in_progress'] },
    });

    if (existingWill) {
      return NextResponse.json({
        willId: existingWill._id,
        message: 'Existing draft found',
        initialMessage: existingWill.conversation?.[0]?.content || "Hello! I'm here to help you create your will. Could you please tell me your full name?",
      });
    }

    // Create new will with initial message
    const will = await Will.create({
      userId: user._id,
      status: 'draft',
      conversation: [{
        role: 'assistant',
        content: "Hello! I'm here to help you create your will. Could you please tell me your full name?",
        timestamp: new Date(),
      }],
    });

    return NextResponse.json({
      willId: will._id,
      message: 'Will created successfully',
      initialMessage: will.conversation[0].content,
    });

  } catch (error) {
    console.error('Create will error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}