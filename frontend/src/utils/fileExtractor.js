import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using unpkg CDN for guaranteed compatibility
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`;
}

/**
 * Extract clean text from various uploaded file types
 * (.pdf, .pptx, .ppt, .docx, .doc, .txt, .md, .csv, .json, code files)
 */
export async function extractTextFromFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();

  // 1. PDF Files (.pdf)
  if (extension === 'pdf' || file.type === 'application/pdf') {
    return await readPdfDocument(file);
  }

  // 2. PowerPoint Presentations (.pptx)
  if (extension === 'pptx' || file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    return await readPptxDocument(file);
  }

  // 3. Word Documents (.docx)
  if (extension === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return await readDocxDocument(file);
  }

  // 4. Plain text, Markdown & Code files
  const textExtensions = [
    'txt', 'md', 'markdown', 'json', 'csv', 'tsv', 'js', 'jsx', 'ts', 'tsx',
    'py', 'html', 'css', 'scss', 'c', 'cpp', 'h', 'java', 'rb', 'go',
    'rs', 'php', 'sql', 'xml', 'yaml', 'yml', 'log', 'ini', 'conf'
  ];

  if (textExtensions.includes(extension) || file.type.startsWith('text/')) {
    return await readAsPlainText(file);
  }

  // 5. Fallback for legacy binary formats (.doc, .ppt, etc.) or unknown
  try {
    const raw = await readAsPlainText(file);
    if (raw && raw.trim().length > 0 && !hasHighBinaryRatio(raw)) {
      return raw;
    }
  } catch (e) {
    // ignore
  }

  // Try zip reader for unknown openxml or binary container
  try {
    const zipText = await readGenericZipXml(file);
    if (zipText && zipText.trim().length > 20) {
      return zipText;
    }
  } catch (e) {
    // ignore
  }

  throw new Error(`Could not parse text from .${extension} file. Please ensure it contains readable text.`);
}

/**
 * PDF Text Extractor using PDF.js
 */
async function readPdfDocument(file) {
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true
    });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    let fullText = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Group items by line height position for natural reading flow
      let pageLines = [];
      let currentY = null;
      let currentLine = [];

      for (const item of textContent.items) {
        if (!item.str) continue;

        // Check vertical position change
        const y = Math.round(item.transform[5]);
        if (currentY !== null && Math.abs(y - currentY) > 5) {
          pageLines.push(currentLine.join(' '));
          currentLine = [];
        }
        currentY = y;
        currentLine.push(item.str);
      }

      if (currentLine.length > 0) {
        pageLines.push(currentLine.join(' '));
      }

      const pageText = pageLines.join('\n').trim();
      if (pageText) {
        fullText.push(`[Slide / Page ${i}]\n${pageText}`);
      }
    }

    const result = fullText.join('\n\n').trim();
    if (result.length > 10) {
      return result;
    }
  } catch (err) {
    console.warn('PDF.js parsing failed, attempting fallback stream reader:', err);
  }

  // Fallback PDF text reader if PDF.js worker hit CORS / network issue
  return await readPdfFallback(arrayBuffer, file.name);
}

/**
 * Fallback PDF Reader when web worker is unavailable
 */
async function readPdfFallback(arrayBuffer, fileName) {
  const decoder = new TextDecoder('latin1');
  const rawString = decoder.decode(arrayBuffer);
  
  const textChunks = [];
  const regexTj = /\(([\s\S]*?)\)\s*Tj/g;
  const regexTJ = /\[([\s\S]*?)\]\s*TJ/g;

  let match;
  while ((match = regexTj.exec(rawString)) !== null) {
    const clean = match[1].replace(/\\\( /g, '(').replace(/\\\)/g, ')').replace(/\\n/g, '\n').trim();
    if (clean.length > 1) textChunks.push(clean);
  }

  while ((match = regexTJ.exec(rawString)) !== null) {
    const innerMatches = match[1].match(/\(([\s\S]*?)\)/g);
    if (innerMatches) {
      const innerStr = innerMatches.map(m => m.slice(1, -1)).join('');
      if (innerStr.trim().length > 1) textChunks.push(innerStr.trim());
    }
  }

  const extracted = textChunks.join(' ').replace(/\s+/g, ' ').trim();
  if (extracted.length > 20) {
    return `[Document: ${fileName}]\n${extracted}`;
  }

  return `[Attached Document: ${fileName}]\n(Note: Text extraction limited. For optimal results, copy and paste text directly into the notes field.)`;
}

/**
 * PowerPoint (.pptx) Text Extractor using JSZip
 */
async function readPptxDocument(file) {
  const zip = await JSZip.loadAsync(file);
  
  // Find all slide XML files inside ppt/slides/
  const slideFiles = Object.keys(zip.files)
    .filter((filename) => /^ppt\/slides\/slide\d+\.xml$/i.test(filename))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0], 10);
      const numB = parseInt(b.match(/\d+/)[0], 10);
      return numA - numB;
    });

  if (slideFiles.length === 0) {
    throw new Error('No slides found in .pptx presentation file.');
  }

  const slidesText = [];

  for (let idx = 0; idx < slideFiles.length; idx++) {
    const slideFileName = slideFiles[idx];
    const xmlContent = await zip.files[slideFileName].async('string');

    // Extract all text elements inside <a:t>text</a:t>
    const matches = xmlContent.match(/<a:t[^>]*>(.*?)<\/a:t>/g);
    if (matches && matches.length > 0) {
      const slideText = matches
        .map((m) => m.replace(/<[^>]+>/g, '').trim())
        .filter((t) => t.length > 0)
        .join(' ');

      if (slideText.trim().length > 0) {
        slidesText.push(`[Slide ${idx + 1}]\n${slideText}`);
      }
    }
  }

  // Also check speaker notes inside ppt/notesSlides/
  const noteFiles = Object.keys(zip.files)
    .filter((filename) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/i.test(filename));

  for (const noteFile of noteFiles) {
    const xmlContent = await zip.files[noteFile].async('string');
    const matches = xmlContent.match(/<a:t[^>]*>(.*?)<\/a:t>/g);
    if (matches && matches.length > 0) {
      const noteText = matches
        .map((m) => m.replace(/<[^>]+>/g, '').trim())
        .filter((t) => t.length > 0)
        .join(' ');
      if (noteText.trim().length > 0) {
        slidesText.push(`[Speaker Notes]\n${noteText}`);
      }
    }
  }

  const combined = slidesText.join('\n\n').trim();
  if (combined.length > 0) {
    return combined;
  }

  throw new Error('Could not extract text from presentation slides.');
}

/**
 * Word (.docx) Text Extractor using JSZip
 */
async function readDocxDocument(file) {
  const zip = await JSZip.loadAsync(file);
  
  if (!zip.files['word/document.xml']) {
    throw new Error('Invalid .docx file: word/document.xml not found.');
  }

  const xmlContent = await zip.files['word/document.xml'].async('string');

  // Replace paragraph endings with newlines
  const formattedXml = xmlContent.replace(/<\/w:p>/g, '\n');
  const matches = formattedXml.match(/<w:t[^>]*>(.*?)<\/w:t>|\n/g);

  if (!matches) {
    throw new Error('No text content found in .docx document.');
  }

  let textResult = '';
  for (const match of matches) {
    if (match === '\n') {
      textResult += '\n';
    } else {
      const clean = match.replace(/<[^>]+>/g, '');
      textResult += clean;
    }
  }

  const result = textResult.replace(/\n\s*\n/g, '\n\n').trim();
  if (result.length > 0) {
    return result;
  }

  throw new Error('Extracted text from .docx was empty.');
}

/**
 * Read Plain Text file
 */
function readAsPlainText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result || '');
    reader.onerror = () => reject(new Error('Failed to read text file.'));
    reader.readAsText(file);
  });
}

/**
 * Generic OpenXML / Zip container extractor
 */
async function readGenericZipXml(file) {
  const zip = await JSZip.loadAsync(file);
  const textParts = [];

  for (const filename of Object.keys(zip.files)) {
    if (filename.endsWith('.xml') && !filename.includes('[Content_Types]')) {
      const xml = await zip.files[filename].async('string');
      const matches = xml.match(/>([^<]{2,})</g);
      if (matches) {
        const words = matches.map((m) => m.slice(1, -1).trim()).filter((w) => w.length > 1);
        if (words.length > 5) {
          textParts.push(words.join(' '));
        }
      }
    }
  }

  return textParts.join('\n\n');
}

/**
 * Check if text has high binary/control character ratio
 */
function hasHighBinaryRatio(str) {
  if (!str || str.length === 0) return true;
  let binaryCount = 0;
  const sampleLength = Math.min(str.length, 500);
  for (let i = 0; i < sampleLength; i++) {
    const code = str.charCodeAt(i);
    if ((code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 65533) {
      binaryCount++;
    }
  }
  return binaryCount / sampleLength > 0.15;
}

/**
 * Format bytes to readable size string
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
