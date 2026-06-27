import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Will from '@/models/Will';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Await the params Promise
    const { id } = await context.params;
    
    console.log('Fetching will with ID:', id);
    console.log('For user ID:', user._id);
    
    const will = await Will.findOne({
      _id: id,
      userId: user._id,
    });

    if (!will) {
      console.log('Will not found');
      return NextResponse.json(
        { error: 'Will not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ will });
  } catch (error) {
    console.error('Get will error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}