import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID is required' }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwjvjjplu';
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.warn('CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET missing in environment variables');
      return NextResponse.json(
        { 
          error: 'Cloudinary API credentials missing. Please set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your .env or .env.local file.' 
        },
        { status: 500 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const strToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.result === 'ok') {
      return NextResponse.json({ 
        success: true, 
        message: 'Image deleted permanently from Cloudinary', 
        result: data.result 
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: data.result || 'Failed to delete image from Cloudinary', 
          result: data 
        },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error('Cloudinary destroy error:', err);
    return NextResponse.json({ error: err.message || 'Server error deleting image' }, { status: 500 });
  }
}
