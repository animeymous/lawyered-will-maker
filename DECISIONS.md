# Technical Decisions - Will Maker

## 1. Next.js Full-Stack Approach
**Choice:** Used Next.js App Router with API routes instead of separate NestJS backend.

**Alternatives:** 
- Separate NestJS + Next.js
- Express + React

**Why:** 
- Single codebase for frontend and backend
- Easier deployment on Vercel
- Type safety across the stack
- Faster development with shared types
- Auto-generated API documentation via TypeScript

## 2. MongoDB Schema Design
**Choice:** Used embedded documents for assets, beneficiaries, and witnesses.

**Alternatives:**
- Fully normalized with separate collections
- Hybrid approach

**Why:**
- Wills are read-heavy once created
- Embedded documents reduce joins
- Works well with half-completed wills
- Easier to version the entire will
- Better performance for the main use case

## 3. AI Conversation Management
**Choice:** Store full conversation history but only send last 10 messages to Gemini.

**Alternatives:**
- Send entire conversation history each time
- Maintain conversation summary
- No history tracking

**Why:**
- Saves API costs (Gemini charges per token)
- Reduces latency
- Maintains context for the AI
- Full history stored for audit/compliance

## 4. Authentication Strategy
**Choice:** JWT stored in httpOnly cookies.

**Alternatives:**
- JWT in localStorage
- Session-based with Redis
- OAuth providers

**Why:**
- HttpOnly prevents XSS attacks
- Automatic cookie handling by browser
- Stateless - no session storage needed
- Works well with Next.js API routes
- Easy to implement logout by clearing cookie

## 5. PDF Generation
**Choice:** Client-side PDF generation with jsPDF.

**Alternatives:**
- Server-side PDF generation (puppeteer)
- Third-party API (DocuSign, PDF.co)
- HTML to PDF conversion

**Why:**
- No server load for PDF generation
- Faster response time
- Works offline
- No external dependencies
- Customizable and free

## 6. Gemini API Integration
**Choice:** Used gemini-1.5-flash-lite with retry logic.

**Alternatives:**
- OpenAI GPT-3.5/4
- Claude API
- Local LLM

**Why:**
- Generous free tier
- Good performance for structured data extraction
- Multi-language support
- Faster responses than larger models
- Lower cost for production

---

## Trade-offs & Lessons

### Trade-off: MongoDB vs PostgreSQL
- Chose MongoDB for flexibility with half-completed wills
- Sacrificed strict schema for easier iteration
- PostgreSQL would be better for complex queries

### Trade-off: AI Cost vs Accuracy
- Using flash-lite saves money but may miss some details
- Can upgrade to pro version later if needed
- Added data extraction to validate AI output

### Trade-off: Client-side vs Server-side PDF
- Server-side would be more consistent
- Client-side is cheaper and faster
- Added fallback for error handling

### Trade-off: Demo vs Production
- Skipped email verification for speed
- Skipped deployment for focus on functionality
- Added sample data for testing
- Clear separation of concerns for future scaling