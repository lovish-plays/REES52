import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth';
import { isTeacherRole } from '@/lib/auth/roles';
import { hasSupabaseEnv } from '@/lib/supabaseConfig';
import { createClient } from '@/lib/supabaseServer';

const IMAGE_BUCKET = 'content-images';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_SCOPES = new Set(['courses', 'projects', 'project-diagrams', 'ebook-covers', 'products']);
const EXTENSIONS_BY_MIME = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isTeacherRole(user.role)) {
      return NextResponse.json({ error: 'Admin access is required to upload images.' }, { status: 403 });
    }

    if (!hasSupabaseEnv) {
      return NextResponse.json({ error: 'Image storage is not configured yet.' }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const scope = formData.get('scope');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Choose an image to upload.' }, { status: 400 });
    }
    if (typeof scope !== 'string' || !ALLOWED_SCOPES.has(scope)) {
      return NextResponse.json({ error: 'This image destination is not allowed.' }, { status: 400 });
    }
    if (!EXTENSIONS_BY_MIME.has(file.type)) {
      return NextResponse.json({ error: 'Use a JPG, PNG, WebP, or GIF image.' }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'The image must be smaller than 5 MB.' }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasValidImageSignature(bytes, file.type)) {
      return NextResponse.json({ error: 'The selected file is not a valid image.' }, { status: 400 });
    }

    const extension = EXTENSIONS_BY_MIME.get(file.type);
    const objectPath = `${scope}/${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const supabase = await createClient();
    const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(objectPath, bytes, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'The image could not be uploaded.' },
        { status: 400 },
      );
    }

    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(objectPath);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'The image could not be uploaded.' },
      { status: 500 },
    );
  }
}

function hasValidImageSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return bytes.length >= png.length && png.every((value, index) => bytes[index] === value);
  }
  if (mimeType === 'image/gif') {
    const header = String.fromCharCode(...bytes.slice(0, 6));
    return header === 'GIF87a' || header === 'GIF89a';
  }
  if (mimeType === 'image/webp') {
    const riff = String.fromCharCode(...bytes.slice(0, 4));
    const webp = String.fromCharCode(...bytes.slice(8, 12));
    return bytes.length >= 12 && riff === 'RIFF' && webp === 'WEBP';
  }
  return false;
}
