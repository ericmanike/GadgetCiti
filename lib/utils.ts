import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount);
}
 

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const pathWithoutVersion = parts[1].replace(/^v\d+\//, '');
    const lastDotIndex = pathWithoutVersion.lastIndexOf('.');
    if (lastDotIndex === -1) return pathWithoutVersion;
    return pathWithoutVersion.substring(0, lastDotIndex);
  } catch {
    return null;
  }
}

export async function deleteCloudinaryImage(publicIdOrUrl: string): Promise<{ success: boolean; message?: string }> {
  try {
    const publicId = publicIdOrUrl.startsWith('http')
      ? getCloudinaryPublicId(publicIdOrUrl)
      : publicIdOrUrl;

    if (!publicId) {
      return { success: false, message: 'Invalid Public ID or URL' };
    }

    const res = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to request image deletion' };
  }
}
