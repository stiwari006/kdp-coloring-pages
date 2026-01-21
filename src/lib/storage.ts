import { supabase } from './supabase';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string = 'image/png'
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return data.path;
}

/**
 * Upload PNG to Supabase Storage (convenience function)
 */
export async function uploadImage(
  bucket: string,
  path: string,
  buffer: Buffer
): Promise<string> {
  return uploadFile(bucket, path, buffer, 'image/png');
}

/**
 * Create signed URL for download
 */
export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Create ZIP file from PNG buffers
 */
export async function createZip(pages: Array<{ number: number; buffer: Buffer }>): Promise<Buffer> {
  const zip = new JSZip();

  for (const page of pages) {
    zip.file(`coloring-page-${page.number.toString().padStart(3, '0')}.png`, page.buffer);
  }

  return Buffer.from(await zip.generateAsync({ type: 'nodebuffer' }));
}

/**
 * Create KDP-ready PDF from PNG buffers
 */
export async function createPDF(
  pages: Array<{ number: number; buffer: Buffer }>,
  bookSize: { width: number; height: number }
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  for (const page of pages) {
    // Create PDF page with exact dimensions
    const pdfPage = pdfDoc.addPage([bookSize.width, bookSize.height]);

    // Embed PNG image
    const pngImage = await pdfDoc.embedPng(page.buffer);
    pdfPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: bookSize.width,
      height: bookSize.height,
    });
  }

  return Buffer.from(await pdfDoc.save());
}
