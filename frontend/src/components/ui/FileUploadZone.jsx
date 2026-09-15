import React, { useState, useRef } from 'react';
import { extractTextFromFile, formatFileSize } from '../../utils/fileExtractor';
import {
  UploadCloud,
  FileText,
  FileCode,
  FileCheck,
  X,
  Trash2,
  AlertCircle,
  File,
  Plus
} from 'lucide-react';

export function FileUploadZone({ onFilesExtracted, onTopicSuggested, className = '' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging false if leaving drop container
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setUploadError(null);

    const droppedFiles = Array.from(e.dataTransfer?.files || []);
    if (droppedFiles.length > 0) {
      await processFiles(droppedFiles);
    }
  };

  const handleFileSelect = async (e) => {
    setUploadError(null);
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      await processFiles(selectedFiles);
    }
    // Reset file input value so re-selecting same file triggers change
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = async (newRawFiles) => {
    setIsProcessing(true);
    const processedEntries = [];
    let suggestedTopic = '';

    for (const rawFile of newRawFiles) {
      const fileId = `${rawFile.name}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

      // Derive clean topic title from first valid file name if needed
      if (!suggestedTopic) {
        const nameWithoutExt = rawFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        suggestedTopic = nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1);
      }

      try {
        const textContent = await extractTextFromFile(rawFile);
        processedEntries.push({
          id: fileId,
          name: rawFile.name,
          size: rawFile.size,
          type: rawFile.type,
          content: textContent,
          status: 'success',
          error: null
        });
      } catch (err) {
        console.error(`Error reading ${rawFile.name}:`, err);
        processedEntries.push({
          id: fileId,
          name: rawFile.name,
          size: rawFile.size,
          type: rawFile.type,
          content: '',
          status: 'error',
          error: err.message || 'Could not parse file'
        });
      }
    }

    const updatedFileList = [...fileList, ...processedEntries];
    setFileList(updatedFileList);
    notifyParent(updatedFileList, suggestedTopic);
    setIsProcessing(false);
  };

  const removeFile = (idToRemove) => {
    const updated = fileList.filter((f) => f.id !== idToRemove);
    setFileList(updated);
    notifyParent(updated, null);
  };

  const clearAllFiles = () => {
    setFileList([]);
    notifyParent([], null);
  };

  const notifyParent = (files, suggestedTopic) => {
    const validFiles = files.filter((f) => f.status === 'success' && f.content);
    if (validFiles.length === 0) {
      onFilesExtracted('');
      return;
    }

    // Format text from multiple files into clean markdown blocks
    const formattedBlocks = validFiles.map((file) => {
      if (validFiles.length === 1) return file.content;
      return `--- DOCUMENT: ${file.name} ---\n${file.content}`;
    });

    const combinedText = formattedBlocks.join('\n\n');
    onFilesExtracted(combinedText);

    if (suggestedTopic && onTopicSuggested) {
      onTopicSuggested(suggestedTopic);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['js', 'py', 'ts', 'jsx', 'tsx', 'html', 'css', 'json'].includes(ext)) {
      return <FileCode className="w-4 h-4 text-[#172B3A]" />;
    }
    if (['txt', 'md', 'doc', 'docx', 'pdf'].includes(ext)) {
      return <FileText className="w-4 h-4 text-[#172B3A]" />;
    }
    return <File className="w-4 h-4 text-[#172B3A]" />;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept=".txt,.md,.markdown,.json,.csv,.pdf,.pptx,.ppt,.doc,.docx,.js,.jsx,.ts,.tsx,.py,.html,.css"
      />

      {/* DRAG & DROP ZONE */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-all duration-200 select-none ${
          isDragging
            ? 'border-[#172B3A] bg-[#EAE5D9] scale-[1.01] shadow-md'
            : 'border-[#172B3A]/30 bg-[#FAF8F4] hover:border-[#172B3A] hover:bg-[#F5F1E8]'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          <div
            className={`p-3 rounded-full border-2 border-[#172B3A] transition-transform duration-200 ${
              isDragging ? 'bg-[#172B3A] text-[#F5F1E8] scale-110' : 'bg-[#F5F1E8] text-[#172B3A]'
            }`}
          >
            <UploadCloud className={`w-6 h-6 ${isDragging ? 'animate-bounce' : ''}`} />
          </div>

          <div>
            <p className="text-sm font-bold text-[#172B3A] font-display">
              {isDragging ? 'Drop your files here!' : 'Drag & drop your files here'}
            </p>
            <p className="text-xs text-[#172B3A]/60 mt-0.5">
              or <span className="font-bold underline text-[#172B3A]">browse files</span> from your computer
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {['.PDF', '.PPTX', '.DOCX', '.TXT', '.MD', '.PY', '.JS', '.CSV'].map((ext) => (
              <span
                key={ext}
                className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded border border-[#172B3A]/20 bg-[#FAF8F4] text-[#172B3A]/70"
              >
                {ext}
              </span>
            ))}
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 border border-[#172B3A] rounded bg-[#FAF8F4] text-xs text-[#172B3A] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* ATTACHED FILES LIST */}
      {fileList.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]/80 font-mono flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5" />
              Attached Files ({fileList.length})
            </span>

            <button
              type="button"
              onClick={clearAllFiles}
              className="text-xs font-semibold text-[#172B3A]/70 hover:text-[#172B3A] flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {fileList.map((file) => (
              <div
                key={file.id}
                className={`p-2.5 rounded-md border flex items-center justify-between text-xs transition-colors ${
                  file.status === 'error'
                    ? 'border-red-500/50 bg-red-50 text-red-900'
                    : 'border-[#172B3A]/20 bg-[#FAF8F4] text-[#172B3A]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {getFileIcon(file.name)}
                  <span className="font-semibold truncate font-display">{file.name}</span>
                  <span className="font-mono text-[10px] text-[#172B3A]/50 shrink-0">
                    ({formatFileSize(file.size)})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {file.status === 'success' && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-[#172B3A] text-[#F5F1E8]">
                      READ
                    </span>
                  )}
                  {file.status === 'error' && (
                    <span className="text-[10px] font-bold text-red-600">FAILED</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="p-1 hover:bg-[#172B3A]/10 rounded text-[#172B3A]"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploadZone;
