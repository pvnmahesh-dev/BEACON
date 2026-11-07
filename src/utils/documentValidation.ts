/**
 * BEACON Document Vault — File Validation & Security Engine
 *
 * Implements layered client-side defense-in-depth:
 * 1. Extension allowlist check
 * 2. File size constraints (15 MB maximum, > 0 bytes)
 * 3. MIME type allowlist and extension-to-MIME alignment
 * 4. Dangerous/Executable MIME rejection
 * 5. Binary magic-byte file signature verification
 *
 * Security Note:
 * Client-side browser checks provide immediate user feedback and defense-in-depth.
 * In a production architecture with remote servers, server-side validation and
 * sandboxed antivirus scanning remain necessary.
 */

export const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'] as const;
export type AllowedExtension = typeof ALLOWED_EXTENSIONS[number];

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB limit

/**
 * Expected MIME types mapped by file extension
 */
export const ALLOWED_MIME_BY_EXTENSION: Record<AllowedExtension, string[]> = {
  pdf: ['application/pdf'],
  png: ['image/png'],
  jpg: ['image/jpeg', 'image/pjpeg', 'image/jpg'],
  jpeg: ['image/jpeg', 'image/pjpeg', 'image/jpg'],
  doc: [
    'application/msword',
    'application/vnd.ms-word',
    'application/x-msword',
  ],
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip', // Some legacy platforms classify OOXML packages as zip
    'application/x-zip-compressed',
  ],
};

/**
 * High-risk / executable MIME types to reject immediately regardless of extension
 */
const FORBIDDEN_MIME_PATTERNS = [
  /^application\/x-msdownload/i,
  /^application\/x-executable/i,
  /^application\/x-sh/i,
  /^application\/x-bat/i,
  /^application\/x-msdos-program/i,
  /^application\/javascript/i,
  /^application\/x-javascript/i,
  /^text\/javascript/i,
  /^text\/html/i,
  /^image\/svg\+xml/i, // Potential stored XSS vector if parsed directly
  /^application\/x-php/i,
];

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  detectedExtension?: string;
  sanitizedTitle?: string;
}

/**
 * Inspect magic bytes from the first 16 bytes of the file
 */
export async function verifyFileSignature(
  file: File | Blob,
  extension: AllowedExtension
): Promise<{ matches: boolean; reason?: string }> {
  try {
    const slice = file.slice(0, 16);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    switch (extension) {
      case 'pdf': {
        // PDF specification: File must start with `%PDF-` (0x25, 0x50, 0x44, 0x46, 0x2D)
        const isPdf =
          bytes.length >= 5 &&
          bytes[0] === 0x25 &&
          bytes[1] === 0x50 &&
          bytes[2] === 0x44 &&
          bytes[3] === 0x46 &&
          bytes[4] === 0x2d;

        return {
          matches: isPdf,
          reason: isPdf
            ? undefined
            : 'File header does not match the standard PDF binary signature (%PDF-).',
        };
      }

      case 'png': {
        // PNG specification: 8-byte signature: 0x89 50 4E 47 0D 0A 1A 0A
        const isPng =
          bytes.length >= 8 &&
          bytes[0] === 0x89 &&
          bytes[1] === 0x50 &&
          bytes[2] === 0x4e &&
          bytes[3] === 0x47 &&
          bytes[4] === 0x0d &&
          bytes[5] === 0x0a &&
          bytes[6] === 0x1a &&
          bytes[7] === 0x0a;

        return {
          matches: isPng,
          reason: isPng
            ? undefined
            : 'File header does not match the standard PNG binary signature.',
        };
      }

      case 'jpg':
      case 'jpeg': {
        // JPEG specification: Starts with SOI marker 0xFF 0xD8 0xFF
        const isJpeg =
          bytes.length >= 3 &&
          bytes[0] === 0xff &&
          bytes[1] === 0xd8 &&
          bytes[2] === 0xff;

        return {
          matches: isJpeg,
          reason: isJpeg
            ? undefined
            : 'File header does not match the standard JPEG SOI marker (0xFFD8FF).',
        };
      }

      case 'doc': {
        // Microsoft Word 97-2003 Compound File Binary Format (CFBF) header:
        // 0xD0 0xCF 0x11 0xE0 0xA1 0xB1 0x1A 0xE1
        const isDoc =
          bytes.length >= 8 &&
          bytes[0] === 0xd0 &&
          bytes[1] === 0xcf &&
          bytes[2] === 0x11 &&
          bytes[3] === 0xe0 &&
          bytes[4] === 0xa1 &&
          bytes[5] === 0xb1 &&
          bytes[6] === 0x1a &&
          bytes[7] === 0xe1;

        return {
          matches: isDoc,
          reason: isDoc
            ? undefined
            : 'File header does not match Microsoft Word binary document signature (OLE CFBF).',
        };
      }

      case 'docx': {
        // Office Open XML (DOCX) is a ZIP package starting with local file header:
        // 0x50 0x4B 0x03 0x04 ('PK\x03\x04')
        const isZipContainer =
          bytes.length >= 4 &&
          bytes[0] === 0x50 &&
          bytes[1] === 0x4b &&
          bytes[2] === 0x03 &&
          bytes[3] === 0x04;

        return {
          matches: isZipContainer,
          reason: isZipContainer
            ? undefined
            : 'File header does not match Office Open XML archive signature (PK ZIP container). Note: Full XML schema validation is deferred to backend ingestion.',
        };
      }

      default:
        return { matches: false, reason: 'Unsupported file extension.' };
    }
  } catch (err) {
    console.error('Error reading file signature buffer:', err);
    return {
      matches: false,
      reason: 'Failed to inspect file binary header.',
    };
  }
}

/**
 * Validate a candidate file against all security layers
 */
export async function validateDocumentFile(file: File): Promise<FileValidationResult> {
  // Layer 1: Check for null or missing file
  if (!file || !file.name) {
    return {
      isValid: false,
      error: 'Please select a valid document file to upload.',
    };
  }

  // Layer 2: Reject zero-byte files
  if (file.size <= 0) {
    return {
      isValid: false,
      error: 'The selected file is empty (0 bytes). Please upload a valid document.',
    };
  }

  // Layer 3: Enforce maximum file size (15 MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size (${sizeMb} MB) exceeds the 15 MB limit. Please compress or select a smaller document.`,
    };
  }

  // Layer 4: Validate extension against allowlist
  const rawExt = file.name.split('.').pop()?.toLowerCase() || '';
  if (!rawExt || !ALLOWED_EXTENSIONS.includes(rawExt as AllowedExtension)) {
    return {
      isValid: false,
      detectedExtension: rawExt,
      error: `Invalid file format ".${rawExt || 'unknown'}". Supported formats are PDF, DOC, DOCX, PNG, and JPG.`,
    };
  }
  const extension = rawExt as AllowedExtension;

  // Layer 5: Detect high-risk / executable MIME types
  const mime = file.type ? file.type.toLowerCase().trim() : '';
  if (mime) {
    for (const pattern of FORBIDDEN_MIME_PATTERNS) {
      if (pattern.test(mime)) {
        return {
          isValid: false,
          detectedExtension: extension,
          error: `High-risk file type detected (${mime}). Executable and script files are strictly blocked for security.`,
        };
      }
    }
  }

  // Layer 6: MIME type alignment check (if MIME is provided by browser)
  if (mime && mime !== 'application/octet-stream') {
    const allowedMimes = ALLOWED_MIME_BY_EXTENSION[extension];
    if (allowedMimes && !allowedMimes.includes(mime)) {
      return {
        isValid: false,
        detectedExtension: extension,
        error: `Mismatched file format: the extension ".${extension}" does not match its detected content type ("${mime}").`,
      };
    }
  }

  // Layer 7: Binary signature (magic bytes) verification
  const sigResult = await verifyFileSignature(file, extension);
  if (!sigResult.matches) {
    return {
      isValid: false,
      detectedExtension: extension,
      error: sigResult.reason || 'File content signature does not match the declared file format.',
    };
  }

  // Generate safe sanitized display title suggestion
  const cleanTitle = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]/g, ' ')
    .replace(/[<>:"/\\|?*]/g, '')
    .trim();

  return {
    isValid: true,
    detectedExtension: extension,
    sanitizedTitle: cleanTitle,
  };
}

