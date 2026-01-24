import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth/admin-guard';
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from '@/lib/security/rate-limit';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`upload:post:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB' 
      }, { status: 400 });
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `candidate_${timestamp}_${randomStr}.${extension}`;
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'candidates');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return the public URL
    const photoUrl = `/uploads/candidates/${filename}`;

    return NextResponse.json({ 
      success: true, 
      photo_url: photoUrl,
      filename 
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// Delete an uploaded file
export async function DELETE(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`upload:delete:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    if (sanitizedFilename !== filename || filename.includes('..')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', 'candidates', sanitizedFilename);

    // Check if file exists and delete
    if (existsSync(filePath)) {
      await unlink(filePath);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
