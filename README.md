# Will Maker - AI-Powered Legacy Planning

A full-stack application that helps users create legally valid wills through an AI-powered conversational interface. Built with Next.js, MongoDB, and Google Gemini AI.

## 🚀 Live Demo

**URL:** https://lawyered-will-maker.vercel.app/

**Demo Credentials:**
- Email: demo@example.com
- Password: Demo123!

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [AI Interview Flow](#ai-interview-flow)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **User Authentication** - Signup and login with JWT-based authentication
- **AI-Powered Interview** - Conversational AI that guides users through will creation
- **Structured Data Extraction** - Automatically extracts will data from natural language responses
- **Real-time Progress Tracking** - Visual progress indicator showing completion status
- **PDF Generation** - Download professionally formatted will documents
- **Validation Rules** - Ensures legal compliance with automatic validation
- **Dashboard** - Manage multiple wills, track status, and continue where you left off
- **Responsive Design** - Works on desktop, tablet, and mobile devices

### Technical Features
- 🔒 Secure authentication with httpOnly cookies
- 🗄️ MongoDB with flexible schema for half-completed wills
- 🤖 Google Gemini AI integration with cost optimization
- ⚡ Rate limiting to prevent abuse
- 📊 Comprehensive error handling and logging
- 🎨 Modern UI with Shadcn components and Tailwind CSS
- 📱 Fully responsive design

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Component library
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### AI Integration
- **Google Gemini API** - AI model for conversation and data extraction
- **Model:** gemini-1.5-flash-lite (cost-optimized)

### Deployment
- **Vercel** - Hosting and deployment
- **MongoDB Atlas** - Cloud database

## 🔧 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

1. **Clone the repository**
   ```bash
   git clone https://github.com/animeymous/lawyered-will-maker.git
   cd lawyered-will-maker
2. npm install
3. cp .env.example .env.local
4. npm run seed
5. npm run dev
6. Create Environment Variables
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_key_at_least_32_characters

# Google Gemini API Key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Application URL (for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000

7. Getting API Keys
- MongoDB Atlas: Sign up at MongoDB Atlas

- Google Gemini: Get API key from Google AI Studio

- JWT Secret: Generate using openssl rand -base64 32 or a similar tool