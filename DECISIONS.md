# Technical Decisions - Will Maker

## 1. Next.js Full-Stack Approach

**Choice:** Used Next.js App Router with API routes instead of separate NestJS backend.

**Alternatives Considered:**
- Separate NestJS + Next.js
- Express + React

**Why This Choice:**
- Single codebase for frontend and backend
- Easier deployment on Vercel
- Type safety across the stack
- Faster development with shared types
- Auto-generated API documentation via TypeScript

**Trade-offs:**
- Less separation of concerns
- API routes are serverless (cold starts possible)
- Harder to scale backend independently

---

## 2. MongoDB Schema Design

**Choice:** Used embedded documents for assets, beneficiaries, and witnesses.

**Alternatives Considered:**
- Fully normalized with separate collections
- Hybrid approach

**Why This Choice:**
- Wills are read-heavy once created
- Embedded documents reduce joins
- Works well with half-completed wills
- Easier to version the entire will
- Better performance for the main use case

**Trade-offs:**
- Document size can grow large
- Harder to query across documents
- Duplication if data needs to be shared

---

## 3. AI Conversation Management

**Choice:** Store full conversation history but only send last 10 messages to Gemini.

**Alternatives Considered:**
- Send entire conversation history each time
- Maintain conversation summary
- No history tracking

**Why This Choice:**
- Saves API costs (Gemini charges per token)
- Reduces latency
- Maintains context for the AI
- Full history stored for audit/compliance

**Trade-offs:**
- May lose context from older messages
- Summary approach would be better for very long conversations
- Need to handle conversation overflow gracefully

---

## 4. Authentication Strategy

**Choice:** JWT stored in httpOnly cookies.

**Alternatives Considered:**
- JWT in localStorage
- Session-based with Redis
- OAuth providers

**Why This Choice:**
- HttpOnly prevents XSS attacks
- Automatic cookie handling by browser
- Stateless - no session storage needed
- Works well with Next.js API routes
- Easy to implement logout by clearing cookie

**Trade-offs:**
- CSRF protection needed (we use SameSite=Lax)
- Cannot access token from JavaScript
- JWT size grows with claims

---

## 5. PDF Generation

**Choice:** Client-side PDF generation with jsPDF.

**Alternatives Considered:**
- Server-side PDF generation (puppeteer)
- Third-party API (DocuSign, PDF.co)
- HTML to PDF conversion

**Why This Choice:**
- No server load for PDF generation
- Faster response time
- Works offline
- No external dependencies
- Customizable and free

**Trade-offs:**
- Client-side generation depends on browser
- Less consistent formatting across browsers
- Limited styling options compared to HTML

---

## 6. Google Gemini Integration

**Choice:** Used gemini-1.5-flash-lite with retry logic.

**Alternatives Considered:**
- OpenAI GPT-3.5/4
- Claude API
- Local LLM

**Why This Choice:**
- Generous free tier
- Good performance for structured data extraction
- Multi-language support
- Faster responses than larger models
- Lower cost for production

**Trade-offs:**
- Rate limits are strict (20 requests/day)
- Less accurate than GPT-4 for complex cases
- Google's API has occasional throttling

---

## 7. Frontend UI Framework

**Choice:** Shadcn UI with Tailwind CSS.

**Alternatives Considered:**
- Material-UI
- Chakra UI
- Custom CSS

**Why This Choice:**
- Modern, professional design
- Fully customizable
- Excellent developer experience
- Component-based architecture
- Accessibility built-in

**Trade-offs:**
- Learning curve for Shadcn patterns
- More setup time than pre-built frameworks
- Need to install components individually

---

## Summary of Key Decisions

| Decision | Choice | Primary Reason |
|----------|--------|----------------|
| Stack | Next.js Full-Stack | Single codebase, Vercel deployment |
| Database | MongoDB | Flexible schema, half-completed wills |
| AI | Gemini | Free tier, good performance |
| Auth | JWT in httpOnly cookies | Security, stateless |
| PDF | jsPDF (client-side) | No server load, free |
| UI | Shadcn + Tailwind | Professional design, customizable |
| AI Memory | Last 10 messages | Cost optimization, performance |

## Lessons Learned

1. **Always optimize AI calls** - Every token costs money and time
2. **Embedded documents work well** for read-heavy, hierarchical data
3. **Client-side PDF generation** is underrated for simple documents
4. **Cookie-based auth** is simpler and more secure than localStorage
5. **Shadcn components** significantly improve UI quality with minimal effort