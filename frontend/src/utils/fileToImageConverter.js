// Utility to convert supported non-image files (PDF, Excel, Word) into a JPEG DataURL + Blob
// Uses pdfjs-dist, xlsx, mammoth, and html2canvas (loaded lazily)
// If the file is already an image type handled elsewhere (jpg/png/gif/webp), we reject early.
// Size limit enforced. Export: convertFileToImage(file) -> { dataUrl, blob, width, height, note }

import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth/mammoth.browser';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

const MAX_FILE_SIZE_MB = 8; // hard limit
const BYTES_PER_MB = 1024 * 1024;

const IMAGE_MIME_REGEX = /^image\/(jpeg|png|jpg|gif|bmp|webp)$/i;
const SUPPORTED_MIME = {
  pdf: ['application/pdf'],
  excel: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  word: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

function isImageFile(file) {
  return IMAGE_MIME_REGEX.test(file.type);
}

function exceedsSizeLimit(file) {
  return file.size > MAX_FILE_SIZE_MB * BYTES_PER_MB;
}

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

export async function convertFileToImage(file) {
  // ---------- Guard Clauses ----------
  if (!file) throw new Error('No file provided');

  if (isImageFile(file)) {
    throw new Error('This image type is already supported natively.');
  }

  if (exceedsSizeLimit(file)) {
    throw new Error(`File is larger than ${MAX_FILE_SIZE_MB} MB.`);
  }

  const nameLC = file.name.toLowerCase();

  // ---------- Dispatch by type ----------
  if (nameLC.endsWith('.pdf') || file.type === 'application/pdf') {
    return handlePDF(file);
  }

  if (nameLC.endsWith('.xls') || nameLC.endsWith('.xlsx') || SUPPORTED_MIME.excel.includes(file.type)) {
    return handleExcel(file);
  }

  if (nameLC.endsWith('.doc') || nameLC.endsWith('.docx') || SUPPORTED_MIME.word.includes(file.type)) {
    return handleWord(file);
  }

  // Anything else → reject
  throw new Error('Unsupported file type. Allowed: PDF, Excel (.xls/.xlsx), Word (.doc/.docx)');
}

// ---------- Implementation helpers ----------
async function handlePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdfDoc.getPage(1); // only first page allowed

  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;

  return canvasToResult(canvas, `${file.name}-page1.jpg`, 'PDF page 1');
}

async function handleExcel(file) {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetHtml = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]]);
  const html = wrapHtml(sheetHtml, 'Excel Preview');
  return renderHtmlToCanvas(html, `${file.name}-sheet1.jpg`, 'Excel first sheet');
}

async function handleWord(file) {
  const arrayBuffer = await file.arrayBuffer();
  const { value: htmlBody } = await mammoth.convertToHtml({ arrayBuffer });
  const html = wrapHtml(htmlBody, 'Word Preview');
  return renderHtmlToCanvas(html, `${file.name}.jpg`, 'Word content');
}

function wrapHtml(bodyInner, title = '') {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>body{font-family:Arial, sans-serif; padding:24px;}</style></head><body>${bodyInner}</body></html>`;
}

async function renderHtmlToCanvas(htmlString, outName, note) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  document.body.appendChild(iframe);
  iframe.srcdoc = htmlString;

  // Wait for load
  await new Promise(res => (iframe.onload = res));

  const canvas = await html2canvas(iframe.contentDocument.body, { backgroundColor: '#fff', scale: 2 });
  document.body.removeChild(iframe);
  return canvasToResult(canvas, outName, note);
}

function canvasToResult(canvas, defaultName, note) {
  return new Promise(res => {
    canvas.toBlob(blob => {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      res({ dataUrl, blob, width: canvas.width, height: canvas.height, note, filename: defaultName });
    }, 'image/jpeg', 0.9);
  });
} 