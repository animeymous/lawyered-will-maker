import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Will Maker - AI-Powered Legacy Planning",
  description: "Create your will with the help of AI assistant",
};

// Validate environment variables on startup
try {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'GOOGLE_GEMINI_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    if (process.env.NODE_ENV === 'development') {
      console.error('Please fix your .env file');
    }
  } else {
    console.log('✅ Environment variables loaded successfully');
  }
} catch (error) {
  console.error('❌ Environment validation failed:', error);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}