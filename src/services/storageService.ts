import { supabase } from '../config/supabase';

// Ensure you have a public bucket named 'chat-files' in Supabase Storage.
// Dashboard: Storage -> New bucket -> Name: chat-files -> Public: enabled

function sanitizeForPath(name: string): string {
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\.-]/g, '')
    .slice(-180); // keep tail to avoid overly long names
}

export async function uploadChatFile(conversationId: string, file: File): Promise<{ url: string; path: string; }> {
  if (!conversationId) {
    throw new Error('Upload failed: Missing conversation id');
  }

  const safeConv = sanitizeForPath(conversationId);
  const safeName = sanitizeForPath(file.name || 'file');
  const fileExt = safeName.includes('.') ? safeName.split('.').pop() : undefined;
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}${fileExt ? '.' + fileExt : ''}`;
  const filePath = `${safeConv}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('chat-files')
    .upload(filePath, file, {
      upsert: true, // avoid name collisions causing 409 errors
      cacheControl: '3600',
      contentType: file.type || 'application/octet-stream',
    });

  if (uploadError) {
    // Provide clear, actionable error messages
    const msg = uploadError.message || 'Unknown error';
    if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('policy')) {
      throw new Error('Upload failed: Storage policy blocked the request. Ensure authenticated insert policy exists for bucket "chat-files".');
    }
    throw new Error(`Upload failed: ${msg}`);
  }

  const { data } = supabase.storage.from('chat-files').getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error('Upload succeeded but public URL could not be generated. Make sure the bucket is public or a signed URL is used.');
  }

  return { url: data.publicUrl, path: filePath };
}
