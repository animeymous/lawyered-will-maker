import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Will from '@/models/Will';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const wills = await Will.find({
      userId: user._id,
    })
    .sort({ updatedAt: -1 })
    .select('testator.fullName status assets beneficiaries updatedAt createdAt');

    return NextResponse.json({ 
      wills,
      count: wills.length 
    });
  } catch (error) {
    console.error('Get wills error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}