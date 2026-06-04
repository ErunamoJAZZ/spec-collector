import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load from root .env if not loaded yet
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config(); // Also try local

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials are required');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
