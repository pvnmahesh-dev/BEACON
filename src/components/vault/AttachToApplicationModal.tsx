import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Layers,
  CheckCircle2,
  Plus,
  Unlink,
  ExternalLink,
  FileText,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';
import { VaultDocument, ApplicationRecord } from '../../types';
import { useToast } from '../ui/Toast';

interface AttachToApplicationModalProps {
  document: VaultDocument | null;
  isOpen: boolean;
  onClose: () => void;
  applications: ApplicationRecord[];
  onLinkToApplication: (docId: string, appId: string, checklistDocId?: string) => void;
  onUnlinkFromApplication: (docId: string, appId: string) => void;
}

export const AttachToApplicationModal: React.FC<AttachToApplicationModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  applications,
  onLinkToApplication,
  onUnlinkFromApplication,
}) => {
  const { showToast } = useToast();
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [targetChecklistDocId, setTargetChecklistDocId] = useState<string>('');

  if (!isOpen || !doc) return null;

  const handleAttach = (appId: string, checklistDocId?: string) => {
    onLinkToApplication(doc.id, appId, checklistDocId);
    const targetApp = applications.find((a) => a.id === appId);
    showToast(
      `Attached "${doc.fileName}" to "${targetApp?.scholarshipName || 'application'}"!`,
      'success'
    );
  };

  const handleUnlink = (appId: string) => {
    onUnlinkFromApplication(doc.id, appId);
    const targetApp = applications.find((a) => a.id === appId);
    showToast(
      `Unlinked from "${targetApp?.scholarshipName || 'application'}".`,
      'info'
    );
  };

  // Find linked applications
  const linkedApps = applications.filter((a) => doc.linkedApplicationIds.includes(a.id));
  const unlinkedApps = applications.filter((a) => !doc.linkedApplicationIds.includes(a.id));

  const activeSelectedApp = applications.find((a) => a.id === selectedAppId);

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
          className="relative w-full max-w-xl bg-white border-[3px] border-[#252b3a] rounded-[20px] shadow-[8px_8px_0px_#252b3a] overflow-hidden z-10 p-6 space-y-5 text-xs font-reading"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#252b3a]">
            <div>
              <h3 className="font-display font-bold text-base text-[#253044] flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-[#ffd05b] border-[1.5px] border-[#252b3a] flex items-center justify-center shadow-[1.5px_1.5px_0px_#252b3a]">
                  <Layers className="w-4 h-4 stroke-[2.5] text-[#253044]" />
                </div>
                <span>Multi-Application Reuse & Binding</span>
              </h3>
              <p className="text-[11px] font-reading text-[#253044]/70 mt-0.5">
                Link this single stored file across multiple scholarship submissions without duplicating bytes.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-[8px] text-[#253044] hover:bg-[#ff78c5] border border-transparent hover:border-[#252b3a] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Document Snapshot */}
          <div className="p-3.5 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] flex items-center justify-between gap-3 shadow-[2px_2px_0px_#252b3a]">
            <div className="space-y-0.5">
              <div className="font-display font-bold text-[#253044] text-sm">
                {doc.title}
              </div>
              <div className="text-[#6434df] text-[11px] font-mono font-bold">
                {doc.fileName} • {doc.fileSize}
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f1ebff] text-[#6434df] border-[1.5px] border-[#252b3a]">
              {doc.category}
            </span>
          </div>

          {/* Currently Linked Applications Section */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-[#253044] text-[10px] flex items-center justify-between">
              <span>Currently Attached Applications ({linkedApps.length})</span>
            </h4>

            {linkedApps.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {linkedApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-[12px] bg-[#fffdf5] border-[1.5px] border-[#252b3a] flex items-center justify-between gap-3 shadow-[1.5px_1.5px_0px_#252b3a]"
                  >
                    <div>
                      <div className="font-display font-bold text-[#253044]">
                        {app.scholarshipName}
                      </div>
                      <div className="text-[#253044]/70 font-bold text-[10px]">
                        {app.provider} • Status: {app.status} • {app.fundingFormatted}
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnlink(app.id)}
                      className="px-2.5 py-1 rounded-[8px] bg-white hover:bg-[#ff78c5] text-[#253044] border-[1.5px] border-[#252b3a] text-[11px] font-bold flex items-center gap-1 shadow-[1px_1px_0px_#252b3a] transition-colors cursor-pointer"
                    >
                      <Unlink className="w-3 h-3 stroke-[2.5]" />
                      <span>Unlink</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-[12px] border-[2px] border-dashed border-[#252b3a]/30 text-center text-[#253044]/60 font-reading text-[11px]">
                This document is not currently attached to any active applications.
              </div>
            )}
          </div>

          {/* Attach to Another Application Form */}
          {unlinkedApps.length > 0 && (
            <div className="p-3.5 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] space-y-3 shadow-[2px_2px_0px_#252b3a]">
              <h4 className="font-bold text-[#253044] text-xs flex items-center gap-1.5 font-display">
                <Plus className="w-3.5 h-3.5 text-[#6434df] stroke-[3]" />
                <span>Attach to New Application Checklist</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#253044] font-bold block mb-1">
                    Select Target Application:
                  </label>
                  <select
                    value={selectedAppId}
                    onChange={(e) => {
                      setSelectedAppId(e.target.value);
                      setTargetChecklistDocId('');
                    }}
                    className="w-full p-2 rounded-[10px] bg-white border-[1.5px] border-[#252b3a] text-[#253044] font-bold outline-none focus:ring-2 focus:ring-[#6434df] text-xs cursor-pointer"
                  >
                    <option value="">Choose Application...</option>
                    {unlinkedApps.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.scholarshipName} ({app.status})
                      </option>
                    ))}
                  </select>
                </div>

                {activeSelectedApp && (
                  <div>
                    <label className="text-[10px] text-[#253044] font-bold block mb-1">
                      Target Checklist Requirement:
                    </label>
                    <select
                      value={targetChecklistDocId}
                      onChange={(e) => setTargetChecklistDocId(e.target.value)}
                      className="w-full p-2 rounded-[10px] bg-white border-[1.5px] border-[#252b3a] text-[#253044] font-bold outline-none focus:ring-2 focus:ring-[#6434df] text-xs cursor-pointer"
                    >
                      <option value="">Auto-map by category</option>
                      {activeSelectedApp.documents.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.status.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedAppId && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      handleAttach(selectedAppId, targetChecklistDocId || undefined);
                      setSelectedAppId('');
                      setTargetChecklistDocId('');
                    }}
                    className="px-4 py-2 rounded-[10px] bg-[#6434df] hover:bg-[#5228bf] text-white font-bold text-xs border-[1.5px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Confirm Attachment & Mark Ready</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end pt-2 border-t-[2px] border-[#252b3a]">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-white text-xs font-bold border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a] cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
