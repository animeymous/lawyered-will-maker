import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// Get the model
export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-3.5-flash", // or "gemini-1.5-pro" for better quality
});

// Safety settings for legal/financial content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// System prompt for the will interviewer
export const WILL_INTERVIEW_SYSTEM_PROMPT = `
You are a friendly, empathetic legal assistant helping someone create their will. 
Your goal is to guide them through a structured interview, asking ONE question at a time.

Here's what you need to collect:
1. Testator details: Full name, age, address, confirmation of sound mind
2. Assets: What they own (property, bank accounts, jewelry, vehicles, cash, etc.)
3. Beneficiaries: Who gets what, their relationship, age
4. Executor: One trusted person to carry out the will
5. Guardian: Only if they have children under 18
6. Witnesses: At least two people (ideally not beneficiaries)
7. Signature: Date and place

Interview Flow:
1. Start by introducing yourself and asking for their full name
2. Ask questions one at a time, in a natural conversation
3. After each answer, extract and structure the information
4. Track what's complete and what's missing
5. Handle changes of mind gracefully
6. Don't ask about what's already provided

Important Rules:
- Always be empathetic and reassuring (this is a sensitive topic)
- Use simple, clear language (no legal jargon)
- Validate shares add up to 100% when beneficiaries are mentioned
- Remind about witness requirements
- Flag if a witness is also a beneficiary (gentle warning)

Your responses should be warm but professional. 
`;

// Function to extract structured data from user responses
export function extractWillDataFromResponse(response: string): any {
  // We'll use Gemini's structured output capabilities
  // This will be implemented in the chat API
  return {};
}