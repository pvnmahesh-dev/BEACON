import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Building2,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Edit3,
  Save,
  Plus,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileWarning,
  Circle,
  ArrowRight
} from 'lucide-react';
import {
  ApplicationRecord,
  ApplicationStatus,
  DocumentChecklistStatus,
  ApplicationDocument,
} from '../../types';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface ApplicationDetailModalProps {
  application: ApplicationRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateApplication: (id: string, updates: Partial<ApplicationRecord>) => void;
  onChangeStatus: (id: string, newStatus: ApplicationStatus) => void;
  onUpdateDocumentStatus: (
    appId: string,
    docId: string,
    status: DocumentChecklistStatus,
    fileName?: string
  ) => void;
  onAddCustomDocument: (appId: string, name: string) => void;
  onDeleteCustomDocument: (appId: string, docId: string) => void;
  onUpdateMilestone: (appId: string, milestoneId: string, completed: boolean) => void;
  onDeleteApplication: (id: string) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  isOpen,
  onClose,
  onUpdateApplication,
  onChangeStatus,
  onUpdateDocumentStatus,
  onAddCustomDocument,
  onDeleteCustomDocument,
  onUpdateMilestone,
  onDeleteApplication,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'vault' | 'timeline'>('overview');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [isEditingSubmissionDate, setIsEditingSubmissionDate] = useState(false);
  const [editedSubmissionDate, setEditedSubmissionDate] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Sync state when application opens
  React.useEffect(() => {
    if (application) {
      setEditedNotes(application.personalNotes || '');
      setEditedSubmissionDate(application.submissionDate || '');
      setIsEditingNotes(false);
      setIsEditingSubmissionDate(false);
      setIsAddingDoc(false);
      setIsDeleteConfirmOpen(false);
    }
  }, [application]);

  if (!application) return null;

  const statuses: ApplicationStatus[] = [
    'Saved',
    'Applying',
    'Submitted',
    'Under Review',
    'Awarded',
    'Rejected',
  ];

  const getStatusBadgeVariant = (status: ApplicationStatus) => {
    switch (status) {
      case 'Awarded':
        return 'bg-[#9bf1cd] text-[#253044] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      case 'Under Review':
        return 'bg-[#6434df] text-white border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      case 'Submitted':
        return 'bg-[#e9fff5] text-[#253044] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      case 'Applying':
        return 'bg-[#f1ebff] text-[#6434df] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      case 'Saved':
        return 'bg-[#ffd05b] text-[#253044] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      case 'Rejected':
        return 'bg-[#ff78c5] text-[#253044] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      default:
        return 'bg-[#fffdf5] text-[#253044] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
    }
  };

  const handleSaveNotes = () => {
    onUpdateApplication(application.id, { personalNotes: editedNotes });
    setIsEditingNotes(false);
    showToast('Personal notes saved successfully!', 'success');
  };

  const handleSaveSubmissionDate = () => {
    onUpdateApplication(application.id, { submissionDate: editedSubmissionDate });
    setIsEditingSubmissionDate(false);
    showToast('Submission date updated!', 'success');
  };

  const handleCreateCustomDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    onAddCustomDocument(application.id, newDocName.trim());
    setNewDocName('');
    setIsAddingDoc(false);
    showToast(`Added custom document requirement "${newDocName.trim()}"`, 'success');
  };

  const handleDeleteAppConfirmed = () => {
    onDeleteApplication(application.id);
    setIsDeleteConfirmOpen(false);
    onClose();
    showToast(`Application for "${application.scholarshipName}" removed.`, 'info');
  };

  // Document status counts
  const readyDocs = application.documents.filter((d) => d.status === 'ready').length;
  const pendingDocs = application.documents.filter((d) => d.status === 'pending').length;
  const missingDocs = application.documents.filter((d) => d.status === 'missing').length;

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
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="relative w-full max-w-4xl bg-white border-[3px] border-[#252b3a] rounded-[20px] shadow-[8px_8px_0px_#252b3a] overflow-hidden z-10 my-6 max-h-[92vh] flex flex-col font-reading"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b-[2.5px] border-[#252b3a] bg-[#fffdf5] flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Dropdown Picker */}
                  <div className="relative inline-flex items-center">
                    <select
                      value={application.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as ApplicationStatus;
                        onChangeStatus(application.id, newStatus);
                        showToast(`Status updated to ${newStatus}`, 'success');
                      }}
                      className={`text-xs font-bold px-3 py-1 rounded-full border-[2px] border-[#252b3a] cursor-pointer outline-none transition-all ${getStatusBadgeVariant(
                        application.status
                      )}`}
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st} className="bg-white text-[#253044]">
                          Status: {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {application.category && (
                    <Badge variant="cyan">{application.category}</Badge>
                  )}

                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white text-[#253044] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
                    ID: {application.scholarshipId}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold font-display text-[#253044] tracking-tight leading-snug">
                  {application.scholarshipName}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-[#253044]/80">
                  <span className="flex items-center gap-1.5 text-[#253044]">
                    <Building2 className="w-4 h-4 text-[#6434df] stroke-[2.5]" />
                    <span>{application.provider}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[#6434df] font-bold font-display text-sm">
                    <DollarSign className="w-4 h-4 stroke-[2.5]" />
                    <span>{application.fundingFormatted}</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ffd05b] text-[#253044] border-[1.5px] border-[#252b3a]">
                    <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Deadline: {application.deadline}</span>
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-[12px] bg-white text-[#253044] hover:bg-[#ff78c5] border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a] transition-all cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Progress Bar Header Strip */}
            <div className="px-6 py-3 bg-[#fffdf5] border-b-[2.5px] border-[#252b3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#253044]/80">
                  Dossier Readiness:
                </span>
                <span className="font-display font-extrabold text-sm text-[#6434df]">
                  {application.progressPercentage}%
                </span>
                <div className="w-40 h-2.5 bg-white rounded-full border-[1.5px] border-[#252b3a] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      application.status === 'Awarded'
                        ? 'bg-[#9bf1cd]'
                        : application.status === 'Rejected'
                        ? 'bg-[#ff78c5]'
                        : 'bg-[#6434df]'
                    }`}
                    style={{ width: `${application.progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-[12px] border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-xs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1 rounded-[8px] font-bold transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-[#6434df] text-white border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]'
                      : 'text-[#253044] hover:bg-[#f1ebff]'
                  }`}
                >
                  Overview & Notes
                </button>
                <button
                  onClick={() => setActiveTab('vault')}
                  className={`px-3 py-1 rounded-[8px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'vault'
                      ? 'bg-[#6434df] text-white border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]'
                      : 'text-[#253044] hover:bg-[#f1ebff]'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Document Vault ({readyDocs}/{application.documents.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1 rounded-[8px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'timeline'
                      ? 'bg-[#6434df] text-white border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]'
                      : 'text-[#253044] hover:bg-[#f1ebff]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Timeline</span>
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 bg-white">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* 4 Stats overview cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a]">
                      <span className="text-[11px] font-bold text-[#253044]/70">Target Funding</span>
                      <div className="text-xl font-display font-extrabold text-[#6434df] mt-0.5">
                        {application.fundingFormatted}
                      </div>
                      <span className="text-[10px] text-[#253044]/60 font-semibold">Non-repayable grant</span>
                    </div>

                    <div className="p-3.5 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a]">
                      <span className="text-[11px] font-bold text-[#253044]/70">Application Status</span>
                      <div className="text-base font-display font-bold text-[#253044] mt-1">
                        {application.status}
                      </div>
                      <span className="text-[10px] text-[#6434df] font-bold">Verified record</span>
                    </div>

                    <div className="p-3.5 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a]">
                      <span className="text-[11px] font-bold text-[#253044]/70">Final Deadline</span>
                      <div className="text-sm font-display font-bold text-[#253044] mt-1">
                        {application.deadline}
                      </div>
                      <span className="text-[10px] text-[#253044]/60 font-semibold">Portal cutoff date</span>
                    </div>

                    <div className="p-3.5 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a]">
                      <span className="text-[11px] font-bold text-[#253044]/70">Submission Date</span>
                      <div className="text-sm font-display font-bold text-[#253044] mt-1">
                        {application.submissionDate || 'Not yet submitted'}
                      </div>
                      <button
                        onClick={() => setIsEditingSubmissionDate(!isEditingSubmissionDate)}
                        className="text-[10px] font-bold text-[#6434df] hover:text-[#5527cb] flex items-center gap-1 mt-0.5 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit date</span>
                      </button>
                    </div>
                  </div>

                  {/* Submission Date Editor */}
                  {isEditingSubmissionDate && (
                    <div className="p-4 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] flex items-center gap-3">
                      <input
                        type="text"
                        value={editedSubmissionDate}
                        onChange={(e) => setEditedSubmissionDate(e.target.value)}
                        placeholder="e.g. Nov 15, 2026"
                        className="flex-1 p-2 rounded-[10px] bg-white border-[2px] border-[#252b3a] text-xs font-reading text-[#253044] outline-none focus:ring-2 focus:ring-[#6434df]"
                      />
                      <button
                        onClick={handleSaveSubmissionDate}
                        className="px-3.5 py-2 rounded-[10px] bg-[#6434df] hover:bg-[#5228bf] text-white text-xs font-bold border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a] cursor-pointer"
                      >
                        Save Date
                      </button>
                    </div>
                  )}

                  {/* Personal Notes Section */}
                  <div className="p-5 rounded-[17px] bg-[#fffdf5] border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#253044] flex items-center gap-2">
                        <Edit3 className="w-3.5 h-3.5 text-[#6434df]" />
                        <span>Student Personal Application Notes & Strategy</span>
                      </h4>
                      {!isEditingNotes ? (
                        <button
                          onClick={() => setIsEditingNotes(true)}
                          className="px-3 py-1 rounded-[10px] bg-white text-xs font-bold text-[#6434df] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] hover:bg-[#f1ebff] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Notes</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleSaveNotes}
                          className="px-3 py-1 rounded-[10px] bg-[#6434df] hover:bg-[#5228bf] text-xs text-white font-bold border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save Notes</span>
                        </button>
                      )}
                    </div>

                    {!isEditingNotes ? (
                      <p className="text-xs font-reading text-[#253044]/80 leading-relaxed bg-white p-3.5 rounded-[12px] border-[2px] border-[#252b3a] min-h-[60px] whitespace-pre-wrap shadow-[2px_2px_0px_#252b3a]">
                        {application.personalNotes || 'No notes added yet. Record deadlines, committee contacts, or essay ideas.'}
                      </p>
                    ) : (
                      <textarea
                        rows={4}
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        placeholder="Write personal strategy, advisor contacts, or submission checklist items..."
                        className="w-full p-3 rounded-[12px] bg-white border-[2px] border-[#252b3a] text-xs font-reading text-[#253044] outline-none focus:ring-2 focus:ring-[#6434df] leading-relaxed resize-none shadow-[2px_2px_0px_#252b3a]"
                      />
                    )}
                  </div>

                  {/* Quick Vault & Timeline Snapshot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Vault quick card */}
                    <div className="p-4 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#253044] flex items-center gap-1.5">
                          <FileCheck2 className="w-4 h-4 text-[#6434df] stroke-[2.5]" />
                          <span>Document Vault Status</span>
                        </span>
                        <button
                          onClick={() => setActiveTab('vault')}
                          className="text-[11px] font-bold text-[#6434df] hover:text-[#5527cb] flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="px-2 py-0.5 rounded-[8px] bg-[#9bf1cd] text-[#253044] border-[1.5px] border-[#252b3a]">
                          {readyDocs} Ready
                        </span>
                        <span className="px-2 py-0.5 rounded-[8px] bg-[#ffd05b] text-[#253044] border-[1.5px] border-[#252b3a]">
                          {pendingDocs} Pending
                        </span>
                        {missingDocs > 0 && (
                          <span className="px-2 py-0.5 rounded-[8px] bg-[#ff78c5] text-[#253044] border-[1.5px] border-[#252b3a]">
                            {missingDocs} Missing
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-reading text-[#253044]/70">
                        All standard dossier materials (transcripts, letters, resume, essay) tracked and persisted.
                      </p>
                    </div>

                    {/* Timeline quick card */}
                    <div className="p-4 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#253044] flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#6434df] stroke-[2.5]" />
                          <span>Milestone Progression</span>
                        </span>
                        <button
                          onClick={() => setActiveTab('timeline')}
                          className="text-[11px] font-bold text-[#6434df] hover:text-[#5527cb] flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>View Timeline</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-xs font-bold text-[#253044]">
                        {application.timeline.filter((t) => t.completed).length} of{' '}
                        {application.timeline.length} milestones completed
                      </div>

                      <div className="w-full h-2 bg-white rounded-full border-[1.5px] border-[#252b3a] overflow-hidden">
                        <div
                          className="h-full bg-[#6434df] rounded-full"
                          style={{
                            width: `${(application.timeline.filter((t) => t.completed).length / application.timeline.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DOCUMENT VAULT CHECKLIST */}
              {activeTab === 'vault' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a]">
                    <div>
                      <h4 className="text-sm font-bold text-[#253044] font-display flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#6434df]" />
                        <span>Document Checklist & Verification Vault</span>
                      </h4>
                      <p className="text-xs font-reading text-[#253044]/70 mt-0.5">
                        Mark documents as Ready, Pending, or Missing. Changes persist automatically and dynamically recalculate progress.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddingDoc(true)}
                      className="px-3.5 py-1.5 rounded-[10px] bg-[#f1ebff] hover:bg-[#6434df] text-[#6434df] hover:text-white text-xs font-bold border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a] flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add Custom Document</span>
                    </button>
                  </div>

                  {/* Add Custom Document Input */}
                  {isAddingDoc && (
                    <form
                      onSubmit={handleCreateCustomDoc}
                      className="p-3.5 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        placeholder="Document title (e.g. Portfolio PDF, Dean Endorsement, Financial Form)"
                        className="flex-1 p-2 rounded-[10px] bg-white border-[2px] border-[#252b3a] text-xs font-reading text-[#253044] outline-none focus:ring-2 focus:ring-[#6434df]"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-[10px] bg-[#6434df] hover:bg-[#5228bf] text-white text-xs font-bold border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a] cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingDoc(false)}
                        className="px-3 py-2 rounded-[10px] text-[#253044] hover:bg-white text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </form>
                  )}

                  {/* Document List */}
                  <div className="space-y-3">
                    {application.documents.map((doc) => {
                      return (
                        <div
                          key={doc.id}
                          className="p-4 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-sm text-[#253044]">
                                {doc.name}
                              </span>
                              {doc.required && (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#ff78c5] text-[#253044] border-[1.5px] border-[#252b3a]">
                                  Required
                                </span>
                              )}
                              {doc.category === 'other' && (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#ffd05b] text-[#253044] border-[1.5px] border-[#252b3a]">
                                  Custom
                                </span>
                              )}
                            </div>

                            {doc.fileName ? (
                              <div className="flex items-center gap-2 text-[11px] font-reading font-semibold text-[#253044]/80">
                                <FileText className="w-3.5 h-3.5 text-[#6434df]" />
                                <span className="font-mono text-[#6434df] font-bold">{doc.fileName}</span>
                                {doc.fileSize && <span>({doc.fileSize})</span>}
                                {doc.lastUpdated && <span>• {doc.lastUpdated}</span>}
                              </div>
                            ) : (
                              <p className="text-[11px] font-reading text-[#253044]/60 italic">
                                {doc.notes || 'No file attached yet.'}
                              </p>
                            )}
                          </div>

                          {/* Status Select Buttons */}
                          <div className="flex items-center gap-1.5 self-start sm:self-auto">
                            <button
                              onClick={() => onUpdateDocumentStatus(application.id, doc.id, 'ready')}
                              className={`px-3 py-1 rounded-[10px] text-xs font-bold border-[2px] border-[#252b3a] transition-all cursor-pointer ${
                                doc.status === 'ready'
                                  ? 'bg-[#9bf1cd] text-[#253044] shadow-[2px_2px_0px_#252b3a]'
                                  : 'bg-white text-[#253044] hover:bg-[#e9fff5]'
                              }`}
                            >
                              Ready
                            </button>
                            <button
                              onClick={() => onUpdateDocumentStatus(application.id, doc.id, 'pending')}
                              className={`px-3 py-1 rounded-[10px] text-xs font-bold border-[2px] border-[#252b3a] transition-all cursor-pointer ${
                                doc.status === 'pending'
                                  ? 'bg-[#ffd05b] text-[#253044] shadow-[2px_2px_0px_#252b3a]'
                                  : 'bg-white text-[#253044] hover:bg-[#fffdf5]'
                              }`}
                            >
                              Pending
                            </button>
                            <button
                              onClick={() => onUpdateDocumentStatus(application.id, doc.id, 'missing')}
                              className={`px-3 py-1 rounded-[10px] text-xs font-bold border-[2px] border-[#252b3a] transition-all cursor-pointer ${
                                doc.status === 'missing'
                                  ? 'bg-[#ff78c5] text-[#253044] shadow-[2px_2px_0px_#252b3a]'
                                  : 'bg-white text-[#253044] hover:bg-[#fffdf5]'
                              }`}
                            >
                              Missing
                            </button>

                            {doc.category === 'other' && (
                              <button
                                onClick={() => onDeleteCustomDocument(application.id, doc.id)}
                                className="p-1.5 rounded-[8px] text-[#253044]/60 hover:text-[#253044] hover:bg-[#ff78c5] border border-transparent hover:border-[#252b3a] transition-colors ml-1"
                                title="Remove custom document requirement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: APPLICATION TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a]">
                    <h4 className="text-sm font-bold text-[#253044] font-display flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#6434df]" />
                      <span>Chronological Application Lifecycle</span>
                    </h4>
                    <p className="text-xs font-reading text-[#253044]/70 mt-0.5">
                      Track the key milestones from creation to committee decision. Click any milestone circle to toggle its completion state.
                    </p>
                  </div>

                  <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-1 before:bg-[#252b3a]">
                    {application.timeline.map((step) => {
                      return (
                        <div key={step.id} className="relative group">
                          {/* Circle dot marker */}
                          <button
                            onClick={() => onUpdateMilestone(application.id, step.id, !step.completed)}
                            className={`absolute -left-6 sm:-left-8 top-1 w-7 h-7 rounded-full border-[2.5px] border-[#252b3a] flex items-center justify-center transition-all cursor-pointer shadow-[2px_2px_0px_#252b3a] ${
                              step.completed
                                ? 'bg-[#9bf1cd] text-[#253044]'
                                : 'bg-white text-[#253044]/40 hover:bg-[#ffd05b]'
                            }`}
                            title="Click to toggle milestone completion"
                          >
                            {step.completed ? (
                              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <Circle className="w-2.5 h-2.5 fill-current" />
                            )}
                          </button>

                          {/* Event Card */}
                          <div
                            onClick={() => onUpdateMilestone(application.id, step.id, !step.completed)}
                            className={`p-4 rounded-[14px] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] transition-all cursor-pointer ${
                              step.completed
                                ? 'bg-[#fffdf5] hover:bg-[#f1ebff]'
                                : 'bg-white hover:bg-[#fffdf5]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h5
                                className={`text-sm font-display font-bold ${
                                  step.completed ? 'text-[#253044]' : 'text-[#253044]/70'
                                }`}
                              >
                                {step.title}
                              </h5>
                              <span className="text-xs font-mono font-bold text-[#6434df]">
                                {step.date || 'Pending'}
                              </span>
                            </div>

                            {step.notes && (
                              <p className="text-xs font-reading text-[#253044]/80 mt-1">
                                {step.notes}
                              </p>
                            )}

                            <div className="mt-2 text-[11px] text-[#253044]/70 font-reading flex items-center gap-1 font-bold">
                              <span>Status:</span>
                              <span
                                className={`px-2 py-0.5 rounded-full border-[1.5px] border-[#252b3a] ${
                                  step.completed ? 'bg-[#9bf1cd] text-[#253044]' : 'bg-[#ffd05b] text-[#253044]'
                                }`}
                              >
                                {step.completed ? 'Completed' : 'Action Required / In Progress'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-6 bg-[#fffdf5] border-t-[2.5px] border-[#252b3a] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              {/* Delete application action with confirmation */}
              {!isDeleteConfirmOpen ? (
                <button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="text-xs font-bold text-[#ff78c5] hover:text-[#253044] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Remove from Tracker</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-[12px] bg-[#ff78c5]/30 border-[2px] border-[#252b3a]">
                  <span className="text-xs font-bold text-[#253044]">Confirm delete?</span>
                  <button
                    onClick={handleDeleteAppConfirmed}
                    className="px-2.5 py-1 rounded-[8px] bg-[#ff78c5] hover:bg-[#ff5bb8] text-[#253044] text-xs font-bold border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] cursor-pointer"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="px-2 py-1 rounded-[8px] text-[#253044] hover:bg-white text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {application.portalUrl && (
                  <a
                    href={application.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-[12px] bg-white hover:bg-[#f1ebff] border-[2px] border-[#252b3a] text-xs font-bold text-[#253044] shadow-[2px_2px_0px_#252b3a] flex items-center gap-1.5 transition-colors"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-white text-xs font-bold border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
