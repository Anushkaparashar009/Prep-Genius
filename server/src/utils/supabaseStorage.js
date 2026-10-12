import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''
).trim();

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn('⚠️ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.warn('⚠️ Supabase credentials missing in environment variables. Storage will be disabled.');
}

/**
 * Uploads a resume buffer to Supabase Storage bucket
 * Returns public URL or empty string if disabled
 */
export const uploadResumeToSupabase = async (fileBuffer, originalName, mimeType) => {
  if (!supabase) {
    console.warn('⚠️ Storage skipped: Supabase is not configured.');
    return '';
  }

  try {
    const bucket = process.env.SUPABASE_BUCKET || 'resumes';
    const cleanFileName = `${Date.now()}-${originalName.replace(/\s+/g, '_')}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(cleanFileName, fileBuffer, {
        contentType: mimeType || 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      return '';
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(cleanFileName);

    return publicUrlData?.publicUrl || '';
  } catch (err) {
    console.warn('Supabase upload exception:', err.message);
    return '';
  }
};