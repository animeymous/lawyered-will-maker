import { NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(ip: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now();
  const key = ip;

  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { success: true };
  }

  if (store[key].count >= limit) {
    return {
      success: false,
      resetTime: store[key].resetTime,
    };
  }

  store[key].count++;
  return { success: true };
}