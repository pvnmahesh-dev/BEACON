import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  ShieldCheck,
  Download,
  Share2,
  Calendar,
  Building2,
  Tag,
  Paperclip,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers
} from 'lucide-react';
import { VaultDocument } from '../../types';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface DocumentPreviewModalProps {
  document: VaultDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onAttachToApplication?: (doc: VaultDocument) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  onAttachToApplication,
}) => {
  const { showToast } = useToast();

  if (!doc) return null;

  const handleDownload = () => {
    showToast(`Downloading document "${doc.fileName}" from local vault...`, 'success');
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Academic Transcripts':
        return 'text-[#253044] bg-[#e9fff5] border-[#252b3a]';
      case 'Recommendation Letters':
        return 'text-[#6434df] bg-[#f1ebff] border-[#252b3a]';
      case 'Personal Statements':
        return 'text-[#253044] bg-[#9bf1cd] border-[#252b3a]';
      case 'Resume/CV':
        return 'text-[#253044] bg-[#ffd05b] border-[#252b3a]';
      case 'Financial Documents':
        return 'text-[#253044] bg-[#fffdf5] border-[#252b3a]';
      case 'Identification':
        return 'text-[#253044] bg-white border-[#252b3a]';
      case 'Certificates':
        return 'text-[#253044] bg-[#ff78c5] border-[#252b3a]';
      default:
        return 'text-[#253044] bg-[#fffdf5] border-[#252b3a]';
    }
  };

  const renderStatusBadge = () => {
    switch (doc.verificationStatus) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#9bf1cd] text-[#253044] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#253044] stroke-[2.5]" />
            <span>Verified Credential</span>
          </span>
        );
      case 'Pending Verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffd05b] text-[#253044] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
            <Clock className="w-3.5 h-3.5 text-[#253044] stroke-[2.5]" />
            <span>Pending Verification</span>
          </span>
        );
      case 'Uploaded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f1ebff] text-[#6434df] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
            <span>Uploaded Local File</span>
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ff78c5] text-[#253044] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
            <span>Expired Credential</span>
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#253044]/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-3xl bg-white border-[3px] border-[#252b3a] rounded-[20px] shadow-[8px_8px_0px_#252b3a] overflow-hidden z-10 my-6 max-h-[92vh] flex flex-col font-reading"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b-[2.5px] border-[#252b3a] bg-[#fffdf5] flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border-[1.5px] ${getCategoryColor(doc.category)}`}>
                    {doc.category.toUpperCase()}
                  </span>

                  {renderStatusBadge()}

                  <span className="text-xs font-mono font-bold text-[#253044]/80 px-2 py-0.5 rounded-full bg-white border-[1.5px] border-[#252b3a]">
                    {doc.fileSize}
                  </span>
                </div>

                <h3 className="text-xl font-display font-bold text-[#253044] tracking-tight">
                  {doc.title}
                </h3>

                <p className="text-xs font-reading text-[#253044]/80 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#6434df] stroke-[2.5]" />
                  <span className="font-mono text-[#6434df] font-bold">{doc.fileName}</span>
                  <span>• Uploaded: {doc.uploadDate}</span>
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-[12px] bg-white text-[#253044] hover:bg-[#ff78c5] border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a] transition-all cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Document Content Simulation Viewer */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-white">
              {/* Verification Seal Banner */}
              <div className="p-4 rounded-[14px] bg-[#e9fff5] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-[10px] bg-white border-[1.5px] border-[#252b3a] flex items-center justify-center text-[#253044] shrink-0 shadow-[1.5px_1.5px_0px_#252b3a]">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="font-display font-bold text-[#253044] text-sm">Digital Record & Issuer Attestation</div>
                  <p className="text-[#253044]/80 font-reading mt-0.5 leading-relaxed">
                    {doc.verificationIssuer || 'Verified by institutional authority and recorded in BEACON Document Vault.'}
                  </p>
                </div>
              </div>

              {/* Simulated Paper / Document View */}
              <div className="p-6 sm:p-8 rounded-[17px] bg-[#fffdf5] border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] space-y-4 text-xs text-[#253044] leading-relaxed">
                <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#252b3a] text-[#253044]/70 font-mono text-[11px] font-bold">
                  <span>DOCUMENT PREVIEW MODE [SECURE VAULT]</span>
                  <span>RECORD: #{doc.id.toUpperCase()}</span>
                </div>

                <div className="space-y-1">
                  <div className="text-base font-display font-bold text-[#253044] uppercase">
                    {doc.title}
                  </div>
                  <div className="text-[11px] font-mono text-[#6434df] font-bold">
                    File Reference: {doc.fileName} ({doc.fileSize})
                  </div>
                </div>

                <div className="p-4 rounded-[12px] bg-white border-[2px] border-[#252b3a] text-[11px] space-y-2 shadow-[2px_2px_0px_#252b3a]">
                  <div className="font-bold text-[#253044] uppercase tracking-wider text-[10px]">
                    Document Summary & Content Abstract
                  </div>
                  <p className="text-[#253044]/80 leading-relaxed font-reading">
                    {doc.description || 'Verified copy preserved in your browser Document Vault for automated application bundling.'}
                  </p>
                </div>

                {/* Simulated Metadata Table */}
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-[10px] bg-white border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
                    <span className="text-[#253044]/70 text-[10px] font-bold">Linked Applications</span>
                    <div className="font-display font-bold text-[#6434df] mt-0.5 text-sm">
                      {doc.linkedApplicationIds.length} Active Scholarships
                    </div>
                  </div>
                  <div className="p-3 rounded-[10px] bg-white border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
                    <span className="text-[#253044]/70 text-[10px] font-bold">Last Modified</span>
                    <div className="font-bold text-[#253044] mt-0.5 text-sm">
                      {doc.lastModified}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {doc.tags.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-[8px] bg-[#f1ebff] text-[#6434df] text-[10px] font-bold border-[1.5px] border-[#252b3a]">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 bg-[#fffdf5] border-t-[2.5px] border-[#252b3a] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs font-bold text-[#253044] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#6434df] stroke-[2.5]" />
                <span>Browser-Isolated Local Storage (Zero Cloud Transmission)</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {onAttachToApplication && (
                  <button
                    onClick={() => {
                      onAttachToApplication(doc);
                      onClose();
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-[12px] bg-[#f1ebff] hover:bg-[#6434df] text-[#6434df] hover:text-white border-[2px] border-[#252b3a] text-xs font-bold flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#252b3a] transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4 stroke-[2.5]" />
                    <span>Attach to Application</span>
                  </button>
                )}

                <button
                  onClick={handleDownload}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-[12px] bg-white hover:bg-[#fffdf5] text-[#253044] text-xs font-bold border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Download File</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-white text-xs font-bold border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
