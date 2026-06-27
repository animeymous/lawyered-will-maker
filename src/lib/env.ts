export function validateEnv() {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'GOOGLE_GEMINI_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate MongoDB URI format
  const mongoUri = process.env.MONGODB_URI!;
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('❌ MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }

  // Validate JWT secret length
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    console.warn('⚠️ JWT_SECRET should be at least 32 characters long');
  }

  // Validate Gemini API key
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY!;
  if (!geminiKey.startsWith('AI')) {
    console.warn('⚠️ GOOGLE_GEMINI_API_KEY format looks incorrect');
  }

  console.log('✅ Environment validation passed');
}