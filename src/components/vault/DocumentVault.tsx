import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderArchive,
  Upload,
  Search,
  Filter,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Trash2,
  Edit3,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Eye,
  Tag,
  Paperclip,
  Check,
  X,
  FileCheck2,
  Database
} from 'lucide-react';
import {
  VaultDocument,
  VaultDocumentCategory,
  VerificationStatus,
  ApplicationRecord
} from '../../types';
import { useDocumentVault } from '../../hooks/useDocumentVault';
import { useApplications } from '../../hooks/useApplications';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { UploadDocumentModal } from './UploadDocumentModal';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { RenameDocumentModal } from './RenameDocumentModal';
import { AttachToApplicationModal } from './AttachToApplicationModal';

interface DocumentVaultProps {
  onBackToDashboard?: () => void;
  onNavigateToApplications?: () => void;
  externalApplicationsState?: ReturnType<typeof useApplications>;
  externalVaultState?: ReturnType<typeof useDocumentVault>;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  onBackToDashboard,
  onNavigateToApplications,
  externalApplicationsState,
  externalVaultState,
}) => {
  const internalVault = useDocumentVault();
  const internalApps = useApplications();

  const {
    documents,
    addDocument,
    renameDocument,
    updateDocument,
    deleteDocument,
    linkDocumentToApplication,
    unlinkDocumentFromApplication,
    downloadDocument,
    vaultStats,
  } = externalVaultState || internalVault;

  const {
    applications,
    updateDocumentStatus: updateAppChecklistItem,
  } = externalApplicationsState || internalApps;

  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | VaultDocumentCategory>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | VerificationStatus>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const [renamingDoc, setRenamingDoc] = useState<VaultDocument | null>(null);
  const [attachingDoc, setAttachingDoc] = useState<VaultDocument | null>(null);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<VaultDocument | null>(null);

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

  const statuses: VerificationStatus[] = [
    'Uploaded',
    'Pending Verification',
    'Verified',
    'Expired',
  ];

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Category filter
      if (selectedCategory !== 'All' && doc.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'All' && doc.verificationStatus !== selectedStatus) {
        return false;
      }
      // Search query (title, filename, tags, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchFile = doc.fileName.toLowerCase().includes(q);
        const matchDesc = doc.description?.toLowerCase().includes(q);
        const matchTags = doc.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchFile && !matchDesc && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [documents, selectedCategory, selectedStatus, searchQuery]);

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#9bf1cd] text-[#253044] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
            <CheckCircle2 className="w-3 h-3 text-[#253044] stroke-[2.5]" />
            <span>Verified</span>
          </span>
        );
      case 'Pending Verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffd05b] text-[#253044] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
            <Clock className="w-3 h-3 text-[#253044] stroke-[2.5]" />
            <span>Pending</span>
          </span>
        );
      case 'Uploaded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f1ebff] text-[#6434df] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
            <Upload className="w-3 h-3 text-[#6434df] stroke-[2.5]" />
            <span>Uploaded</span>
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff78c5] text-[#253044] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
            <AlertTriangle className="w-3 h-3 text-[#253044] stroke-[2.5]" />
            <span>Expired</span>
          </span>
        );
    }
  };

  const getCategoryColor = (cat: VaultDocumentCategory) => {
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

  const handleLinkApplicationChecklist = (
    docId: string,
    appId: string,
    checklistDocId?: string
  ) => {
    linkDocumentToApplication(docId, appId);
    const targetDoc = documents.find((d) => d.id === docId);

    // If specific checklist item selected, update it; otherwise find best matching item by category
    if (targetDoc) {
      const targetApp = applications.find((a) => a.id === appId);
      if (targetApp) {
        let targetItemId = checklistDocId;
        if (!targetItemId) {
          // Auto-map category to checklist item
          const matchItem = targetApp.documents.find(
            (d) =>
              (targetDoc.category === 'Academic Transcripts' && d.category === 'transcript') ||
              (targetDoc.category === 'Recommendation Letters' && d.category === 'recommendation') ||
              (targetDoc.category === 'Personal Statements' && d.category === 'essay') ||
              (targetDoc.category === 'Resume/CV' && d.category === 'resume') ||
              (targetDoc.category === 'Identification' && d.category === 'id') ||
              (targetDoc.category === 'Financial Documents' && d.category === 'income')
          );
          if (matchItem) {
            targetItemId = matchItem.id;
          }
        }

        if (targetItemId) {
          updateAppChecklistItem(appId, targetItemId, 'ready', targetDoc.fileName);
        }
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmDoc) {
      await deleteDocument(deleteConfirmDoc.id);
      showToast(`Removed "${deleteConfirmDoc.fileName}" from Document Vault.`, 'info');
      setDeleteConfirmDoc(null);
    }
  };

  return (
    <div className="space-y-6 font-reading">
      {/* Top Banner with Storage Metric */}
      <div className="rounded-[17px] p-6 sm:p-8 bg-white border-[2.5px] border-[#252b3a] relative overflow-hidden shadow-[6px_6px_0px_#6434df]">
        <div className="absolute top-3 right-8 w-16 h-16 rounded-full bg-[#ffd05b]/40 border-[2px] border-[#252b3a] pointer-events-none -rotate-6" />
        <div className="absolute -bottom-4 right-28 w-14 h-14 bg-[#9bf1cd]/50 border-[2px] border-[#252b3a] rotate-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#ffd05b] text-[#253044] border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]">
              <FolderArchive className="w-3.5 h-3.5 text-[#6434df]" />
              <span>BEACON Client-Side Document Vault</span>
              <span className="w-2 h-2 rounded-full bg-[#6434df] animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-[#253044] tracking-tight">
              Centralized <span className="text-[#6434df]">Document Vault</span>
            </h1>

            <p className="text-sm font-reading text-[#596174] max-w-2xl leading-relaxed">
              Store and manage official transcripts, recommendation letters, personal statements, and credentials. Reuse verified documents across multiple applications via browser IndexedDB.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-white text-xs sm:text-sm font-bold border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#252b3a] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Upload Document</span>
            </button>

            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-4 py-2.5 rounded-[12px] bg-white hover:bg-[#fffdf5] border-[2.5px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] text-xs sm:text-sm font-bold text-[#253044] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                ← Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* METRICS ROW WITH INDEXEDDB STORAGE GAUGE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Stored Documents */}
        <div className="p-5 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#253044]/70">
            <span>Total Vault Records</span>
            <div className="w-7 h-7 rounded-[8px] bg-[#f1ebff] border-[1.5px] border-[#252b3a] flex items-center justify-center text-[#6434df] shadow-[1.5px_1.5px_0px_#252b3a]">
              <FileText className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-display text-[#253044] mt-2">
            {vaultStats.totalCount} Documents
          </div>
          <p className="text-[11px] font-reading font-semibold text-[#6434df] mt-1">
            Across 8 categorized folders
          </p>
        </div>

        {/* Metric 2: Verified Credentials */}
        <div className="p-5 rounded-[17px] bg-[#9bf1cd] border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#253044]">
            <span>Verified Credentials</span>
            <div className="w-7 h-7 rounded-[8px] bg-white border-[1.5px] border-[#252b3a] flex items-center justify-center text-[#253044] shadow-[1.5px_1.5px_0px_#252b3a]">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-display text-[#253044] mt-2">
            {vaultStats.verifiedCount} Verified
          </div>
          <p className="text-[11px] font-reading font-bold text-[#253044]/80 mt-1">
            {vaultStats.pendingCount} pending verification
          </p>
        </div>

        {/* Metric 3: IndexedDB Storage Used */}
        <div className="p-5 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#253044]/70">
            <span>IndexedDB Storage</span>
            <div className="w-7 h-7 rounded-[8px] bg-[#ffd05b] border-[1.5px] border-[#252b3a] flex items-center justify-center text-[#253044] shadow-[1.5px_1.5px_0px_#252b3a]">
              <Database className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-display text-[#6434df] mt-2">
            {vaultStats.usedMB} MB / {vaultStats.capacityMB} MB
          </div>
          <div className="w-full h-2 bg-[#fffdf5] rounded-full border-[1.5px] border-[#252b3a] overflow-hidden mt-2">
            <div
              className="h-full bg-[#6434df] rounded-full"
              style={{ width: `${vaultStats.usedPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Multi-Application Reuse */}
        <div className="p-5 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#253044]/70">
            <span>Application Attachments</span>
            <div className="w-7 h-7 rounded-[8px] bg-[#ff78c5] border-[1.5px] border-[#252b3a] flex items-center justify-center text-[#253044] shadow-[1.5px_1.5px_0px_#252b3a]">
              <Layers className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-display text-[#253044] mt-2">
            {documents.reduce((acc, d) => acc + d.linkedApplicationIds.length, 0)} Bindings
          </div>
          <p className="text-[11px] font-reading font-semibold text-[#253044]/70 mt-1">
            Zero duplicate byte storage
          </p>
        </div>
      </div>

      {/* SECURITY NOTICE BANNER (FEATURE 9) */}
      <div className="p-4 rounded-[17px] bg-[#f1ebff] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#253044]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-white text-[#6434df] border-[1.5px] border-[#252b3a] flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#252b3a]">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-display font-bold text-[#253044] text-xs">
              Client-Side Local Storage (IndexedDB Sandbox)
            </div>
            <p className="text-[11px] font-reading text-[#253044]/80">
              All uploaded files are stored strictly inside your browser's IndexedDB engine. No files are transmitted to any cloud servers.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-[#253044] bg-[#9bf1cd] px-3 py-1 rounded-full border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] whitespace-nowrap self-start sm:self-auto">
          ISOLATED LOCAL STORAGE
        </span>
      </div>

      {/* FILTER, SEARCH & VIEW SWITCHER BAR */}
      <div className="p-4 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-[4px_4px_0px_#252b3a]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#596174] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, filename, tags, or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-[12px] bg-[#ffffff] border-[2px] border-[#252b3a] text-xs font-reading text-[#253044] placeholder-[#596174] outline-none focus:ring-2 focus:ring-[#6434df] shadow-[2px_2px_0px_#252b3a] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#253044]/60 hover:text-[#253044]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Verification Status Filter & View Mode Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 rounded-[12px] bg-white border-[2px] border-[#252b3a] text-xs font-bold text-[#253044] outline-none shadow-[2px_2px_0px_#252b3a] cursor-pointer"
          >
            <option value="All">All Verification Statuses</option>
            {statuses.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-[12px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-[9px] font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#6434df] text-white border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]'
                  : 'text-[#253044] hover:bg-[#f1ebff]'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-[9px] font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#6434df] text-white border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]'
                  : 'text-[#253044] hover:bg-[#f1ebff]'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3.5 py-1.5 rounded-[12px] font-bold whitespace-nowrap transition-all border-[2px] border-[#252b3a] cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-[#6434df] text-white shadow-[2px_2px_0px_#252b3a]'
              : 'bg-white text-[#253044] hover:bg-[#f1ebff]'
          }`}
        >
          All Categories ({documents.length})
        </button>

        {categories.map((cat) => {
          const count = vaultStats.categoryCounts[cat] || 0;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-[12px] font-bold whitespace-nowrap transition-all border-[2px] border-[#252b3a] cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-[#6434df] text-white shadow-[2px_2px_0px_#252b3a]'
                  : 'bg-white text-[#253044] hover:bg-[#f1ebff]'
              }`}
            >
              <span>{cat}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${
                selectedCategory === cat
                  ? 'bg-white text-[#6434df] border-white'
                  : 'bg-[#fffdf5] text-[#253044] border-[#252b3a]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MAIN VIEW 1: GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const linkedApps = applications.filter((a) => doc.linkedApplicationIds.includes(a.id));

            return (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] hover:shadow-[6px_6px_0px_#6434df] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Status & Category Row */}
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border-[1.5px] ${getCategoryColor(
                        doc.category
                      )}`}
                    >
                      {doc.category}
                    </span>

                    {getStatusBadge(doc.verificationStatus)}
                  </div>

                  {/* Title & File Name */}
                  <div>
                    <h3
                      onClick={() => setPreviewDoc(doc)}
                      className="font-display font-bold text-sm text-[#253044] group-hover:text-[#6434df] transition-colors cursor-pointer line-clamp-1"
                      title={doc.title}
                    >
                      {doc.title}
                    </h3>
                    <p className="text-[11px] font-mono text-[#6434df] font-bold mt-0.5 truncate">
                      {doc.fileName} ({doc.fileSize})
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs font-reading text-[#253044]/80 line-clamp-2 leading-relaxed">
                    {doc.description || 'Verified local credential copy.'}
                  </p>

                  {/* Issuer & Modification Date */}
                  <div className="text-[10px] font-reading text-[#253044]/70 space-y-0.5 pt-1">
                    <div className="truncate">
                      <span className="font-bold text-[#253044]">Issuer:</span> {doc.verificationIssuer || 'Self-verified'}
                    </div>
                    <div>
                      <span className="font-bold text-[#253044]">Last Modified:</span> {doc.lastModified}
                    </div>
                  </div>

                  {/* Linked Applications Badge Bar (Feature 4) */}
                  <div className="p-3 rounded-[12px] bg-[#fffdf5] border-[1.5px] border-[#252b3a] space-y-1.5 shadow-[2px_2px_0px_#252b3a]">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#253044] font-bold flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#6434df] stroke-[2.5]" />
                        <span>Attached to {linkedApps.length} Applications</span>
                      </span>
                      <button
                        onClick={() => setAttachingDoc(doc)}
                        className="text-[10px] font-bold text-[#6434df] hover:text-[#5527cb] cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>

                    {linkedApps.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {linkedApps.slice(0, 2).map((app) => (
                          <span
                            key={app.id}
                            className="px-2 py-0.5 rounded-[6px] bg-white text-[#253044] text-[10px] font-bold border-[1px] border-[#252b3a] truncate max-w-[150px]"
                            title={app.scholarshipName}
                          >
                            {app.scholarshipName}
                          </span>
                        ))}
                        {linkedApps.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded-[6px] bg-[#ffd05b] text-[#253044] font-bold border-[1px] border-[#252b3a] text-[10px]">
                            +{linkedApps.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#253044]/60 italic font-reading">
                        Not linked to any application yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="pt-3.5 border-t-[1.5px] border-[#252b3a]/20 flex items-center justify-between mt-3 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 rounded-[8px] text-[#253044] hover:bg-[#fffdf5] border border-transparent hover:border-[#252b3a] transition-all cursor-pointer"
                      title="Preview Document"
                    >
                      <Eye className="w-4 h-4 stroke-[2]" />
                    </button>
                    <button
                      onClick={() => downloadDocument(doc)}
                      className="p-1.5 rounded-[8px] text-[#253044] hover:bg-[#fffdf5] border border-transparent hover:border-[#252b3a] transition-all cursor-pointer"
                      title="Download File"
                    >
                      <Download className="w-4 h-4 stroke-[2]" />
                    </button>
                    <button
                      onClick={() => setRenamingDoc(doc)}
                      className="p-1.5 rounded-[8px] text-[#253044] hover:bg-[#fffdf5] border border-transparent hover:border-[#252b3a] transition-all cursor-pointer"
                      title="Rename Document"
                    >
                      <Edit3 className="w-4 h-4 stroke-[2]" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmDoc(doc)}
                      className="p-1.5 rounded-[8px] text-[#253044] hover:text-[#ff78c5] hover:bg-[#fffdf5] border border-transparent hover:border-[#252b3a] transition-all cursor-pointer"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>

                  <button
                    onClick={() => setAttachingDoc(doc)}
                    className="px-3 py-1 rounded-[8px] bg-[#f1ebff] hover:bg-[#6434df] text-[#6434df] hover:text-white border-[1.5px] border-[#252b3a] text-[11px] font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_#252b3a] transition-all cursor-pointer"
                  >
                    <Layers className="w-3 h-3 stroke-[2.5]" />
                    <span>Attach</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MAIN VIEW 2: TABLE LIST VIEW */}
      {viewMode === 'table' && (
        <div className="rounded-[17px] bg-white border-[2.5px] border-[#252b3a] overflow-hidden shadow-[5px_5px_0px_#252b3a]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-reading">
              <thead className="bg-[#fffdf5] text-[#253044] uppercase text-[10px] font-bold tracking-wider border-b-[2.5px] border-[#252b3a]">
                <tr>
                  <th className="p-4">Document Title & File</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Linked Applications</th>
                  <th className="p-4">Last Modified</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-[#252b3a]/20 text-[#253044]">
                {filteredDocuments.map((doc) => {
                  const linkedApps = applications.filter((a) => doc.linkedApplicationIds.includes(a.id));

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-[#f1ebff]/50 transition-colors cursor-pointer"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      {/* Title & File */}
                      <td className="p-4 max-w-xs">
                        <div className="font-display font-bold text-[#253044] text-sm hover:text-[#6434df] transition-colors">
                          {doc.title}
                        </div>
                        <div className="text-[#253044]/70 text-[11px] font-mono">{doc.fileName}</div>
                      </td>

                      {/* Category */}
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border-[1.5px] ${getCategoryColor(
                            doc.category
                          )}`}
                        >
                          {doc.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(doc.verificationStatus)}
                      </td>

                      {/* Size */}
                      <td className="p-4 text-[#253044] font-mono font-bold text-[11px] whitespace-nowrap">
                        {doc.fileSize}
                      </td>

                      {/* Linked Applications */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setAttachingDoc(doc)}
                          className="px-2.5 py-0.5 rounded-[8px] bg-[#fffdf5] hover:bg-white text-[#6434df] text-[10px] font-bold border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Layers className="w-3 h-3 stroke-[2.5]" />
                          <span>{linkedApps.length} Linked</span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-[#253044]/70 text-xs whitespace-nowrap font-medium">
                        {doc.lastModified}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 rounded-[8px] text-[#253044] hover:bg-[#fffdf5] border border-transparent hover:border-[#252b3a]"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadDocument(doc)}
                            className="p-1.5 rounded-[8px] text-[#253044] hover:bg-[#fffdf5] border border-transparent hover:border-[#252b3a]"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRenamingDoc(doc)}
                            className="p-1.5 rounded-[8px] text-[#253044] hover:bg-[#fffdf5] border border-transparent hover:border-[#252b3a]"
                            title="Rename"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmDoc(doc)}
                            className="p-1.5 rounded-[8px] text-[#253044] hover:text-[#ff78c5] hover:bg-[#fffdf5] border border-transparent hover:border-[#252b3a]"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {filteredDocuments.length === 0 && (
        <div className="p-12 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] text-center space-y-4 shadow-[5px_5px_0px_#252b3a]">
          <div className="w-16 h-16 rounded-[14px] bg-[#ffd05b] border-[2.5px] border-[#252b3a] flex items-center justify-center mx-auto text-[#253044] shadow-[3px_3px_0px_#252b3a]">
            <FolderArchive className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h3 className="font-display font-bold text-xl text-[#253044]">
            No Documents Found
          </h3>

          <p className="text-sm font-reading text-[#253044]/70 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
              ? 'No documents matched your current search and filter selections.'
              : 'Your document vault is empty. Upload your first transcript, resume, or recommendation letter.'}
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedStatus('All');
                }}
                className="px-4 py-2 rounded-[12px] bg-white hover:bg-[#fffdf5] border-[2px] border-[#252b3a] text-xs font-bold text-[#253044] shadow-[2px_2px_0px_#252b3a] transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            )}

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-xs font-bold text-white border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] cursor-pointer"
            >
              Upload Document
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: UPLOAD DOCUMENT */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        applications={applications}
        onUploadDocument={async (file, meta) => {
          const newDoc = await addDocument(file, meta);
          if (meta.initialApplicationId) {
            handleLinkApplicationChecklist(
              newDoc.id,
              meta.initialApplicationId,
              meta.targetChecklistItemId
            );
          }
        }}
      />

      {/* MODAL 2: DOCUMENT PREVIEW */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        onAttachToApplication={(doc) => {
          setAttachingDoc(doc);
        }}
      />

      {/* MODAL 3: RENAME DOCUMENT */}
      <RenameDocumentModal
        document={renamingDoc}
        isOpen={!!renamingDoc}
        onClose={() => setRenamingDoc(null)}
        onRename={(id, newTitle, newFileName) => {
          renameDocument(id, newTitle, newFileName);
        }}
      />

      {/* MODAL 4: ATTACH TO MULTIPLE APPLICATIONS */}
      <AttachToApplicationModal
        document={attachingDoc}
        isOpen={!!attachingDoc}
        onClose={() => setAttachingDoc(null)}
        applications={applications}
        onLinkToApplication={handleLinkApplicationChecklist}
        onUnlinkFromApplication={(docId, appId) => {
          unlinkDocumentFromApplication(docId, appId);
        }}
      />

      {/* CONFIRMATION MODAL FOR DELETE */}
      <AnimatePresence>
        {deleteConfirmDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmDoc(null)}
              className="fixed inset-0 bg-[#253044]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white border-[3px] border-[#252b3a] rounded-[17px] shadow-[8px_8px_0px_#252b3a] p-6 space-y-4 z-10"
            >
              <div className="flex items-center gap-3 text-[#253044]">
                <div className="w-10 h-10 rounded-[10px] bg-[#ff78c5] border-[2px] border-[#252b3a] flex items-center justify-center shadow-[2px_2px_0px_#252b3a]">
                  <Trash2 className="w-5 h-5 text-[#253044] stroke-[2.5]" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#253044]">
                  Delete Vault Document?
                </h3>
              </div>

              <div className="space-y-2 text-xs font-reading text-[#253044]/80 leading-relaxed">
                <p>
                  Are you sure you want to delete <span className="font-bold text-[#253044]">"{deleteConfirmDoc.title}"</span>?
                </p>
                {deleteConfirmDoc.linkedApplicationIds.length > 0 && (
                  <div className="p-3 rounded-[12px] bg-[#ffd05b]/30 border-[1.5px] border-[#252b3a] text-[#253044]">
                    <p className="font-bold">
                      Notice: This document is currently linked to {deleteConfirmDoc.linkedApplicationIds.length} scholarship applications.
                    </p>
                  </div>
                )}
                <p>
                  This file will be permanently removed from your browser's IndexedDB storage.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t-[2px] border-[#252b3a]/20">
                <button
                  onClick={() => setDeleteConfirmDoc(null)}
                  className="px-4 py-2 rounded-[12px] text-xs font-bold text-[#253044] hover:bg-[#fffdf5] border-[2px] border-transparent hover:border-[#252b3a]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-[12px] bg-[#ff78c5] hover:bg-[#ff5bb8] text-[#253044] text-xs font-bold border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a]"
                >
                  Yes, Delete File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
