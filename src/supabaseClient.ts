declare const chrome: any;
import { createClient } from '@supabase/supabase-js'


// This is the custom storage adapter for Chrome extensions
const chromeStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const data = await chrome.storage.local.get(key);
    return data[key] || null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await chrome.storage.local.set({ [key]: value });
  },
  removeItem: async (key: string): Promise<void> => {
    await chrome.storage.local.remove(key);
  },
};

const supabaseUrl = 'https://onclhgfbzevcyylczncr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uY2xoZ2ZiemV2Y3l5bGN6bmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Njg0MTUsImV4cCI6MjA3MjI0NDQxNX0.Ct9LqXiqAA3eKR8fuzATLzfCT6J31t9AjwO2JVxvM40'

// We now initialize the client with our custom storage adapter
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: chromeStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})