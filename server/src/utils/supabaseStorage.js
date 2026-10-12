import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials missing from .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads a file buffer to Supabase Storage
 */
export const uploadResumeToSupabase = async (
  fileBuffer,
  originalName,
  mimeType = 'application/pdf'
) => {
  const uniqueId = crypto.randomBytes(6).toString('hex');
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `resumes/${uniqueId}-${safeName}`;

  // Matching your exact bucket name from dashboard: "Resume"
  const { error: uploadError } = await supabase.storage
    .from('Resume')
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    console.error('Supabase Upload Error:', uploadError);
    throw new Error(`Failed to upload resume to storage: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('Resume').getPublicUrl(filePath);
  return data.publicUrl;
};