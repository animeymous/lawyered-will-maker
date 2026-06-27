# Incident Response - AI Forgetting and Slow Responses

## Scenario
Users report that the AI "forgets" answers given 10 minutes ago, and response times have slowed to 12 seconds.

## Investigation Steps

### Phase 1: Identify Root Cause

1. **Check AI Response Times**
   ```bash
   # Check API logs for response times
   grep "POST /api/chat" logs/next.log | awk '{print $NF}'