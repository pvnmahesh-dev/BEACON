import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  Tag,
  ShieldCheck,
  Building2,
  FolderArchive,
  Layers,
  Sparkles
} from 'lucide-react';
import { VaultDocumentCategory, ApplicationRecord } from '../../types';
import { useToast } from '../ui/Toast';
import {
  validateDocumentFile,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from '../../utils/documentValidation';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadDocument: (
    file: File,
    meta: {
      title: string;
      category: VaultDocumentCategory;
      description?: string;
      tags?: string[];
      initialApplicationId?: string;
      targetChecklistItemId?: string;
    }
  ) => Promise<void>;
  applications: ApplicationRecord[];
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onUploadDocument,
  applications,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [category, setCategory] = useState<VaultDocumentCategory>('Academic Transcripts');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedAppId, setSelectedAppId] = useState('');
  const [selectedChecklistDocId, setSelectedChecklistDocId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const categories: VaultDocumentCategory[] = [
    'Academic Transcripts',
    'Identification',
    'Recommendation Letters',
    'Personal Statements',
    'Resume/CV',
    'Financial Documents',
    'Certificates',
    'Other',
  ];

  if (!isOpen) return null;

  const validateAndSetFile = async (file: File): Promise<boolean> => {
    setValidationError(null);

    const result = await validateDocumentFile(file);
    if (!result.isValid) {
      const errorMsg = result.error || 'Invalid file format or content signature.';
      setValidationError(errorMsg);
      showToast(errorMsg, 'warning');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return false;
    }

    setSelectedFile(file);
    if (!docTitle && result.sanitizedTitle) {
      setDocTitle(result.sanitizedTitle);
    }
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError('Please select or drag a valid file to upload.');
      return;
    }

    // Defensive re-validation before committing to storage
    const recheck = await validateDocumentFile(selectedFile);
    if (!recheck.isValid) {
      setValidationError(recheck.error || 'File validation failed.');
      showToast(recheck.error || 'File validation failed.', 'warning');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // Animate progress simulation
    setUploadProgress(15);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 15;
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    try {
      await onUploadDocument(selectedFile, {
        title: docTitle.trim() || selectedFile.name,
        category,
        description: description.trim(),
        tags: tags.length > 0 ? tags : [category],
        initialApplicationId: selectedAppId || undefined,
        targetChecklistItemId: selectedChecklistDocId || undefined,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        showToast(
          `Document "${docTitle || selectedFile.name}" saved to local IndexedDB vault!`,
          'success'
        );
        onClose();
      }, 400);
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(null);
      showToast('Failed to store document in IndexedDB.', 'warning');
    }
  };

  // Find checklist documents for selected application
  const selectedApp = applications.find((a) => a.id === selectedAppId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#253044]/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white border-[3px] border-[#252b3a] rounded-[20px] shadow-[8px_8px_0px_#252b3a] overflow-hidden z-10 p-6 space-y-4 font-reading"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#252b3a]">
            <h3 className="font-display font-bold text-lg text-[#253044] flex items-center gap-2">
              <div className="w-8 h-8 rounded-[10px] bg-[#ffd05b] border-[1.5px] border-[#252b3a] flex items-center justify-center shadow-[1.5px_1.5px_0px_#252b3a]">
                <Upload className="w-4 h-4 stroke-[2.5] text-[#253044]" />
              </div>
              <span>Upload Document to Local Vault</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[10px] text-[#253044] hover:bg-[#ff78c5] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-reading">
            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-[2.5px] border-dashed rounded-[17px] text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 shadow-[2px_2px_0px_#252b3a] ${
                isDragging
                  ? 'border-[#6434df] bg-[#f1ebff] scale-[1.01]'
                  : selectedFile
                  ? 'border-[#252b3a] bg-[#e9fff5]'
                  : 'border-[#252b3a] hover:bg-[#fffdf5] bg-[#fffdf5]/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-[14px] bg-white border-[2px] border-[#252b3a] flex items-center justify-center text-[#253044] shadow-[2px_2px_0px_#252b3a]">
                {selectedFile ? (
                  <CheckCircle2 className="w-6 h-6 text-[#253044] stroke-[2.5]" />
                ) : (
                  <Upload className="w-6 h-6 text-[#6434df] stroke-[2.5]" />
                )}
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <div className="font-display font-bold text-[#253044] text-sm">
                    {selectedFile.name}
                  </div>
                  <div className="text-[#253044]/70 font-bold text-[11px]">
                    Size: {(selectedFile.size / 1024).toFixed(0)} KB • Click or drop to replace
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="font-display font-bold text-[#253044] text-sm">
                    Drag and drop file here, or <span className="text-[#6434df] font-bold">browse</span>
                  </div>
                  <p className="text-[11px] font-reading text-[#596174]">
                    Supports PDF, DOC, DOCX, PNG, and JPG (Up to 15 MB)
                  </p>
                </div>
              )}
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div
                role="alert"
                aria-live="polite"
                className="p-3 rounded-[12px] bg-[#ff78c5]/20 border-[1.5px] border-[#252b3a] text-[#253044] font-bold text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-[#253044]" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Document Title & Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#253044] font-bold block">
                  Document Title:
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Official MIT Transcript 2026"
                  required
                  className="w-full p-2.5 rounded-[12px] bg-[#ffffff] border-[2px] border-[#252b3a] text-[#253044] font-bold outline-none focus:ring-2 focus:ring-[#6434df] shadow-[2px_2px_0px_#252b3a]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#253044] font-bold block">
                  Category:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VaultDocumentCategory)}
                  className="w-full p-2.5 rounded-[12px] bg-[#ffffff] border-[2px] border-[#252b3a] text-[#253044] font-bold outline-none focus:ring-2 focus:ring-[#6434df] shadow-[2px_2px_0px_#252b3a] cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Application Checklist Integration (Feature 8) */}
            <div className="p-3.5 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] space-y-2.5 shadow-[2px_2px_0px_#252b3a]">
              <div className="flex items-center justify-between text-[#253044] font-bold">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#6434df] stroke-[2.5]" />
                  <span>Attach Immediately to Application (Optional)</span>
                </span>
                <span className="text-[10px] text-[#253044]/60 font-semibold">Reuses single stored file</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={selectedAppId}
                  onChange={(e) => {
                    setSelectedAppId(e.target.value);
                    setSelectedChecklistDocId('');
                  }}
                  className="w-full p-2 rounded-[10px] bg-white border-[1.5px] border-[#252b3a] text-[#253044] font-bold outline-none focus:ring-2 focus:ring-[#6434df] text-xs cursor-pointer"
                >
                  <option value="">None (Vault only)</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.scholarshipName}
                    </option>
                  ))}
                </select>

                {selectedApp && (
                  <select
                    value={selectedChecklistDocId}
                    onChange={(e) => setSelectedChecklistDocId(e.target.value)}
                    className="w-full p-2 rounded-[10px] bg-white border-[1.5px] border-[#252b3a] text-[#253044] font-bold outline-none focus:ring-2 focus:ring-[#6434df] text-xs cursor-pointer"
                  >
                    <option value="">Select Checklist Item</option>
                    {selectedApp.documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.status.toUpperCase()})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Description & Tags */}
            <div className="space-y-1">
              <label className="text-[#253044] font-bold block">
                Tags (comma separated):
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Fall 2026, Registrar Seal, GPA 3.92"
                className="w-full p-2.5 rounded-[12px] bg-[#fffdf5] border-[2px] border-[#252b3a] text-[#253044] outline-none focus:ring-2 focus:ring-[#6434df] text-xs shadow-[2px_2px_0px_#252b3a]"
              />
            </div>

            {/* Security Notice */}
            <div className="p-3 rounded-[12px] bg-[#f1ebff] border-[1.5px] border-[#252b3a] flex items-start gap-2.5 text-[11px] text-[#253044] shadow-[1.5px_1.5px_0px_#252b3a]">
              <ShieldCheck className="w-4 h-4 text-[#6434df] shrink-0 mt-0.5 stroke-[2.5]" />
              <p>
                <strong>Security Guarantee:</strong> This file is saved directly into your local browser's IndexedDB engine. It is never uploaded to any remote web server or third-party cloud.
              </p>
            </div>

            {/* Progress Bar (during upload) */}
            {uploadProgress !== null && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-[#253044]">
                  <span>Securing in IndexedDB storage...</span>
                  <span className="text-[#6434df]">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#fffdf5] rounded-full border-[1.5px] border-[#252b3a] overflow-hidden">
                  <div
                    className="h-full bg-[#6434df] rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t-[2px] border-[#252b3a]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[12px] text-xs font-bold text-[#253044] hover:bg-[#fffdf5] border-[2px] border-transparent hover:border-[#252b3a]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedFile || uploadProgress !== null}
                className="px-5 py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-white text-xs font-bold border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                Save to IndexedDB Vault
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
