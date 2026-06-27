import 'dotenv/config';
import { connectToDatabase } from '../src/lib/mongodb';
import User from '../src/models/User';
import Will from '../src/models/Will';

// Rest of your seed code...

async function seed() {
  try {
    await connectToDatabase();

    // Clear existing data (optional - uncomment if needed)
    // await User.deleteMany({});
    // await Will.deleteMany({});

    // Create demo user
    let user = await User.findOne({ email: 'demo@example.com' });
    
    if (!user) {
      user = await User.create({
        email: 'demo@example.com',
        password: 'Demo123!', // Will be hashed by pre-save hook
        name: 'Demo User',
      });
      console.log('✅ Demo user created');
    } else {
      console.log('✅ Demo user already exists');
    }

    // Check if sample will exists
    const existingWill = await Will.findOne({ 
      userId: user._id,
      status: 'completed' 
    });

    if (!existingWill) {
      // Create sample completed will
      const sampleWill = {
        userId: user._id,
        testator: {
          fullName: 'John Doe',
          age: 45,
          address: '123 Main St, Mumbai, Maharashtra 400001',
          isSoundMind: true,
        },
        assets: [
          {
            name: 'House in Pune',
            type: 'property',
            description: '3 BHK house in Kothrud, Pune',
            value: 5000000,
          },
          {
            name: 'Savings Account',
            type: 'bank_account',
            description: 'HDFC Bank Savings Account #12345',
            value: 300000,
          },
          {
            name: 'Gold Jewelry',
            type: 'jewelry',
            description: 'Gold necklace and earrings',
            value: 200000,
          },
        ],
        beneficiaries: [
          {
            name: 'Jane Doe',
            relationship: 'Wife',
            age: 42,
            isMinor: false,
            shares: [
              { assetId: null, percentage: 50 },
            ],
          },
          {
            name: 'Alice Doe',
            relationship: 'Daughter',
            age: 16,
            isMinor: true,
            shares: [
              { assetId: null, percentage: 50 },
            ],
          },
        ],
        executor: {
          name: 'Robert Smith',
          relationship: 'Brother',
          address: '456 Oak St, Mumbai, Maharashtra',
        },
        guardian: {
          name: 'Sarah Smith',
          relationship: 'Sister-in-law',
          address: '789 Pine St, Mumbai, Maharashtra',
        },
        witnesses: [
          { 
            name: 'Mark Johnson', 
            address: '321 Elm St, Mumbai', 
            isBeneficiary: false,
          },
          { 
            name: 'Lisa Brown', 
            address: '654 Cedar St, Mumbai', 
            isBeneficiary: false,
          },
        ],
        status: 'completed',
        completion: {
          testatorComplete: true,
          assetsComplete: true,
          beneficiariesComplete: true,
          executorComplete: true,
          guardianComplete: true,
          witnessesComplete: true,
          signatureComplete: true,
        },
        signature: {
          date: new Date(),
          place: 'Mumbai',
          testatorSigned: true,
          witnessesSigned: true,
        },
        conversation: [
          {
            role: 'assistant',
            content: "Hello! I'm here to help you create your will. Could you please tell me your full name?",
            timestamp: new Date(),
          },
          {
            role: 'user',
            content: "My name is John Doe",
            timestamp: new Date(),
          },
        ],
      };

      await Will.create(sampleWill);
      console.log('✅ Sample completed will created');
    } else {
      console.log('✅ Sample will already exists');
    }

    console.log('\n📋 Demo Credentials:');
    console.log('📧 Email: demo@example.com');
    console.log('🔑 Password: Demo123!');
    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();