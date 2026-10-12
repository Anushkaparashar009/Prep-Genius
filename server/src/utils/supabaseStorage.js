import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  ''
).trim();
const BUCKET_NAME = (process.env.SUPABASE_BUCKET || 'resumes').trim();

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
} else {
  console.warn('[Supabase] Warning: Missing SUPABASE_URL or SUPABASE_KEY in server/.env');
}

/**
 * Ensures the bucket exists; attempts auto-creation if using a service role key.
 */
const ensureBucketExists = async () => {
  if (!supabase) return false;
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn(`[Supabase] Could not list buckets: ${error.message}`);
      return false;
    }

    const exists = buckets.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      console.log(`[Supabase] Bucket "${BUCKET_NAME}" not found in project. Attempting to create it...`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
      });
      if (createError) {
        console.error(`[Supabase] Failed to auto-create bucket "${BUCKET_NAME}":`, createError.message);
        return false;
      }
      console.log(`[Supabase] Successfully created public bucket: "${BUCKET_NAME}"`);
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Error checking bucket existence:', err.message);
    return false;
  }
};

export const uploadResumeToSupabase = async (fileBuffer, originalName, mimeType = 'application/pdf') => {
  if (!supabase) {
    console.warn('[Supabase] Skipping upload: Supabase client not initialized.');
    return '';
  }

  try {
    // Check or create bucket
    await ensureBucketExists();

    const cleanName = (originalName || 'resume.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${cleanName}`;
    const filePath = `uploads/${fileName}`;

    console.log(`[Supabase] Uploading to bucket: "${BUCKET_NAME}", path: "${filePath}"`);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`Supabase storage upload error (${BUCKET_NAME}):`, uploadError.message);
      return '';
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return data?.publicUrl || '';
  } catch (error) {
    console.error('[Supabase] Unexpected upload error:', error.message);
    return '';
  }
};