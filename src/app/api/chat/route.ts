import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Will from '@/models/Will';
import { verifyAuth } from '@/lib/auth';
import { geminiModel, WILL_INTERVIEW_SYSTEM_PROMPT } from '@/lib/gemini';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = rateLimit(ip, 10, 60000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }
    // Verify user is authenticated
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { willId, message } = await request.json();

    if (!willId || !message) {
      return NextResponse.json(
        { error: 'Missing willId or message' },
        { status: 400 }
      );
    }

    // Get or create will
    let will = await Will.findById(willId);
    if (!will) {
      // Create new will if doesn't exist
      will = await Will.create({
        userId: user._id,
        status: 'draft',
        conversation: [],
      });
    }

    // Build conversation history for Gemini
    const conversationHistory = will.conversation || [];
    const messages = [
      { role: 'system', content: WILL_INTERVIEW_SYSTEM_PROMPT },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Prepare prompt for Gemini
    let prompt = `System: ${WILL_INTERVIEW_SYSTEM_PROMPT}\n\n`;
    prompt += `Current collected data:\n`;
    prompt += `- Testator: ${JSON.stringify(will.testator, null, 2)}\n`;
    prompt += `- Assets: ${JSON.stringify(will.assets, null, 2)}\n`;
    prompt += `- Beneficiaries: ${JSON.stringify(will.beneficiaries, null, 2)}\n`;
    prompt += `- Executor: ${JSON.stringify(will.executor, null, 2)}\n`;
    prompt += `- Guardian: ${JSON.stringify(will.guardian, null, 2)}\n`;
    prompt += `- Witnesses: ${JSON.stringify(will.witnesses, null, 2)}\n\n`;
    prompt += `Conversation history:\n`;
    
    conversationHistory.forEach((msg: any) => {
      prompt += `${msg.role}: ${msg.content}\n`;
    });
    
    prompt += `User: ${message}\n`;
    prompt += `Assistant: `;

    // Get response from Gemini
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Save user message
    will.conversation.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Save AI response
    will.conversation.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    // Extract structured data from the conversation
    await extractAndUpdateWillData(will);

    // Update completion status
    await updateCompletionStatus(will);

    await will.save();

    return NextResponse.json({
      success: true,
      message: aiResponse,
      willId: will._id,
      completion: will.completion,
      status: will.status,
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Function to extract structured data using Gemini
async function extractAndUpdateWillData(will: any) {
  try {
    // Get all conversation
    const conversation = will.conversation || [];
    const fullConversation = conversation.map((msg: any) => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    // Create extraction prompt
    const extractionPrompt = `
    Based on this conversation, extract the following structured data for a will.
    Return ONLY valid JSON, no other text.
    
    Conversation:
    ${fullConversation}
    
    Extract:
    {
      "testator": {
        "fullName": "string or null",
        "age": "number or null",
        "address": "string or null",
        "isSoundMind": "boolean or null"
      },
      "assets": [
        {
          "name": "string",
          "type": "property|bank_account|jewelry|vehicle|cash|other",
          "description": "string or null",
          "value": "number or null"
        }
      ],
      "beneficiaries": [
        {
          "name": "string",
          "relationship": "string",
          "age": "number or null",
          "isMinor": "boolean",
          "shares": [
            {
              "assetId": "null (for now)",
              "percentage": "number (0-100)"
            }
          ]
        }
      ],
      "executor": {
        "name": "string or null",
        "relationship": "string or null",
        "address": "string or null"
      },
      "guardian": {
        "name": "string or null",
        "relationship": "string or null",
        "address": "string or null"
      },
      "witnesses": [
        {
          "name": "string",
          "address": "string or null",
          "isBeneficiary": "boolean"
        }
      ]
    }
    
    If information is not mentioned, use null or empty arrays.
    Only include information explicitly mentioned in the conversation.
    `;

    const result = await geminiModel.generateContent(extractionPrompt);
    const response = await result.response;
    let extractedData = response.text();
    
    // Clean the response (remove markdown code blocks if present)
    extractedData = extractedData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const data = JSON.parse(extractedData);
    
    // Update will with extracted data
    if (data.testator) {
      will.testator = { ...will.testator, ...data.testator };
    }
    
    if (data.assets && data.assets.length > 0) {
      // Merge with existing assets to avoid duplicates
      const existingAssetNames = will.assets.map((a: any) => a.name);
      const newAssets = data.assets.filter((a: any) => 
        !existingAssetNames.includes(a.name)
      );
      will.assets = [...will.assets, ...newAssets];
    }
    
    if (data.beneficiaries && data.beneficiaries.length > 0) {
      const existingBeneficiaryNames = will.beneficiaries.map((b: any) => b.name);
      const newBeneficiaries = data.beneficiaries.filter((b: any) => 
        !existingBeneficiaryNames.includes(b.name)
      );
      will.beneficiaries = [...will.beneficiaries, ...newBeneficiaries];
    }
    
    if (data.executor) {
      will.executor = { ...will.executor, ...data.executor };
    }
    
    if (data.guardian) {
      will.guardian = { ...will.guardian, ...data.guardian };
    }
    
    if (data.witnesses && data.witnesses.length > 0) {
      const existingWitnessNames = will.witnesses.map((w: any) => w.name);
      const newWitnesses = data.witnesses.filter((w: any) => 
        !existingWitnessNames.includes(w.name)
      );
      will.witnesses = [...will.witnesses, ...newWitnesses];
    }
    
    await will.save();
    return data;
    
  } catch (error) {
    console.error('Error extracting data:', error);
    // Don't fail the whole request if extraction fails
    return null;
  }
}

// Function to update completion status
async function updateCompletionStatus(will: any) {
  const completion = {
    testatorComplete: !!(will.testator?.fullName && will.testator?.age && will.testator?.address),
    assetsComplete: will.assets && will.assets.length > 0,
    beneficiariesComplete: will.beneficiaries && will.beneficiaries.length > 0,
    executorComplete: !!(will.executor?.name),
    guardianComplete: !!(will.guardian?.name),
    witnessesComplete: will.witnesses && will.witnesses.length >= 2,
    signatureComplete: !!(will.signature?.date && will.signature?.place),
  };
  
  will.completion = completion;
  
  // Check if all required fields are complete
  const allComplete = Object.values(completion).every(v => v === true);
  if (allComplete && will.status === 'draft') {
    will.status = 'ready_for_review';
  }
  
  await will.save();
}