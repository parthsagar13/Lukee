import fs from 'fs';
import path from 'path';
import { list, put } from '@vercel/blob';

export type ImageFolder = 'products' | 'banner' | 'subcategories';

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN) || Boolean(process.env.VERCEL);
}

function localDir(folder: ImageFolder): string {
  return path.join(process.cwd(), 'public', folder);
}

function publicUrl(folder: ImageFolder, filename: string): string {
  return `/${folder}/${filename}`;
}

/**
 * Persist an uploaded image.
 * - Local/dev: write under public/<folder>/
 * - Vercel/production: upload to Vercel Blob (requires BLOB_READ_WRITE_TOKEN)
 */
export async function saveUploadedImage(opts: {
  folder: ImageFolder;
  filename: string;
  buffer: Buffer;
  contentType?: string;
}): Promise<string> {
  const ext = path.extname(opts.filename).toLowerCase();
  const contentType = opts.contentType || MIME_BY_EXT[ext] || 'application/octet-stream';

  if (useBlobStorage()) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error(
        'Image uploads on Vercel require BLOB_READ_WRITE_TOKEN. Create a Blob store in the Vercel project and add the token to Environment Variables.'
      );
    }

    const blob = await put(`${opts.folder}/${opts.filename}`, opts.buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  const dir = localDir(opts.folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, opts.filename), opts.buffer);
  return publicUrl(opts.folder, opts.filename);
}

/** List product library images from Blob or local public/products. */
export async function listProductLibraryImages(
  allowedExt: Set<string>
): Promise<string[]> {
  if (useBlobStorage()) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return [];
    }
    const urls: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({
        prefix: 'products/',
        cursor,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      for (const blob of page.blobs) {
        const name = blob.pathname.split('/').pop() || '';
        const ext = path.extname(name).toLowerCase();
        if (!allowedExt.has(ext)) continue;
        if (/\(\d+\)/.test(name)) continue;
        urls.push(blob.url);
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return urls.sort((a, b) => a.localeCompare(b));
  }

  const dir = localDir('products');
  fs.mkdirSync(dir, { recursive: true });
  return fs
    .readdirSync(dir)
    .filter((file) => allowedExt.has(path.extname(file).toLowerCase()))
    .filter((file) => !/\(\d+\)/.test(file))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => publicUrl('products', file));
}
