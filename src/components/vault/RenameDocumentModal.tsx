import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, FileText } from 'lucide-react';
import { VaultDocument } from '../../types';
import { useToast } from '../ui/Toast';

interface RenameDocumentModalProps {
  document: VaultDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (id: string, newTitle: string, newFileName?: string) => void;
}

export const RenameDocumentModal: React.FC<RenameDocumentModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  onRename,
}) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState(doc?.title || '');
  const [fileName, setFileName] = useState(doc?.fileName || '');

  React.useEffect(() => {
    if (doc) {
      setTitle(doc.title);
      setFileName(doc.fileName);
    }
  }, [doc]);

  if (!isOpen || !doc) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Document title cannot be empty.', 'warning');
      return;
    }

    onRename(doc.id, title.trim(), fileName.trim() || undefined);
    showToast(`Renamed document to "${title.trim()}"`, 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className="relative w-full max-w-md bg-white border-[3px] border-[#252b3a] rounded-[17px] shadow-[8px_8px_0px_#252b3a] overflow-hidden z-10 p-6 space-y-4 text-xs font-reading"
        >
          <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#252b3a]">
            <h3 className="font-display font-bold text-base text-[#253044] flex items-center gap-2">
              <div className="w-7 h-7 rounded-[8px] bg-[#ffd05b] border-[1.5px] border-[#252b3a] flex items-center justify-center shadow-[1.5px_1.5px_0px_#252b3a]">
                <Edit3 className="w-4 h-4 stroke-[2.5] text-[#253044]" />
              </div>
              <span>Rename Vault Document</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-[8px] text-[#253044] hover:bg-[#ff78c5] border border-transparent hover:border-[#252b3a] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[#253044] font-bold block">
                Display Title:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document display title"
                className="w-full p-2.5 rounded-[12px] bg-[#ffffff] border-[2px] border-[#252b3a] text-[#253044] font-bold outline-none focus:ring-2 focus:ring-[#6434df] shadow-[2px_2px_0px_#252b3a]"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#253044] font-bold block">
                File Name:
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-[#596174] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. Official_Transcript_2026.pdf"
                  className="w-full pl-9 pr-3 py-2.5 rounded-[12px] bg-[#ffffff] border-[2px] border-[#252b3a] text-[#253044] outline-none focus:ring-2 focus:ring-[#6434df] font-mono text-[11px] shadow-[2px_2px_0px_#252b3a]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t-[2px] border-[#252b3a]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[12px] text-[#253044] hover:bg-[#fffdf5] font-bold border-[2px] border-transparent hover:border-[#252b3a]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-white font-bold border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
