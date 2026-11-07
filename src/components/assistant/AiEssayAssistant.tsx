import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  Sparkles,
  BookOpen,
  Copy,
  Download,
  FolderArchive,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Compass,
  FileText,
  RotateCcw,
  Plus,
  Trash2,
  Sliders,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Save,
  Check,
  Building2,
  Clock,
  Target,
  X
} from 'lucide-react';
import {
  EssayDraft,
  EssayPrompt,
  EssayTone,
  EssayCritiqueFactor,
  ApplicationRecord
} from '../../types';
import { useEssayAssistant } from '../../hooks/useEssayAssistant';
import { useDocumentVault } from '../../hooks/useDocumentVault';
import { useApplications } from '../../hooks/useApplications';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface AiEssayAssistantProps {
  onBackToDashboard?: () => void;
  onNavigateToVault?: () => void;
  onNavigateToApplications?: () => void;
  externalApplicationsState?: ReturnType<typeof useApplications>;
  externalVaultState?: ReturnType<typeof useDocumentVault>;
}

export const AiEssayAssistant: React.FC<AiEssayAssistantProps> = ({
  onBackToDashboard,
  onNavigateToVault,
  onNavigateToApplications,
  externalApplicationsState,
  externalVaultState,
}) => {
  const internalVault = useDocumentVault();
  const internalApps = useApplications();

  const vault = externalVaultState || internalVault;
  const apps = externalApplicationsState || internalApps;

  const {
    drafts,
    activeDraft,
    activePrompt,
    activeDraftId,
    setActiveDraftId,
    critiqueResult,
    createDraft,
    updateContent,
    updateDraftMeta,
    switchPrompt,
    deleteDraft,
    availablePrompts,
  } = useEssayAssistant();

  const { showToast } = useToast();

  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isNewDraftModalOpen, setIsNewDraftModalOpen] = useState(false);
  const [isSaveVaultModalOpen, setIsSaveVaultModalOpen] = useState(false);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // New Draft modal state
  const [newDraftTitle, setNewDraftTitle] = useState('');
  const [newDraftPromptId, setNewDraftPromptId] = useState(availablePrompts[0]?.id || '');
  const [newDraftTone, setNewDraftTone] = useState<EssayTone>('Academic');

  // Save to Vault state
  const [saveVaultTitle, setSaveVaultTitle] = useState('');
  const [saveVaultAppId, setSaveVaultAppId] = useState('');

  const tones: EssayTone[] = ['Academic', 'Persuasive', 'Visionary', 'Storytelling'];

  const getToneDescription = (t: EssayTone) => {
    switch (t) {
      case 'Academic':
        return 'Rigorous, theoretical depth, methodological precision.';
      case 'Persuasive':
        return 'Assertive problem-solving, urgency, and leadership impact.';
      case 'Visionary':
        return 'Long-range scientific trajectory, frontier curiosity.';
      case 'Storytelling':
        return 'Overcoming adversity, team collaboration, personal growth.';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 88) return 'text-[#253044] border-[#252b3a] bg-[#9bf1cd]';
    if (score >= 75) return 'text-[#253044] border-[#252b3a] bg-[#e9fff5]';
    if (score >= 60) return 'text-[#253044] border-[#252b3a] bg-[#ffd05b]';
    return 'text-[#253044] border-[#252b3a] bg-[#ff78c5]';
  };

  const getScoreBarFill = (score: number) => {
    if (score >= 85) return 'bg-[#9bf1cd]';
    if (score >= 70) return 'bg-[#6434df]';
    if (score >= 50) return 'bg-[#ffd05b]';
    return 'bg-[#ff78c5]';
  };

  const handleCopy = () => {
    if (!activeDraft?.content) return;
    navigator.clipboard.writeText(activeDraft.content);
    setIsCopied(true);
    showToast('Essay content copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = (format: 'md' | 'txt') => {
    if (!activeDraft?.content) return;
    const blob = new Blob([activeDraft.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDraft.title.replace(/\s+/g, '_')}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(`Exported essay draft as .${format}`, 'success');
  };

  const handleInsertBlueprint = () => {
    if (!activePrompt?.suggestedOutline) return;
    const outlineText = activePrompt.suggestedOutline
      .map(
        (sec: { section: string; targetWords: number; focus: string }) =>
          `### ${sec.section}\n[Target: ~${sec.targetWords} words]\n*Focus: ${sec.focus}*\n\nDraft here...\n`
      )
      .join('\n');

    const combined = activeDraft?.content
      ? `${activeDraft.content}\n\n---\n## Outline Blueprint:\n\n${outlineText}`
      : outlineText;

    updateContent(combined);
    showToast('Suggested 4-section blueprint appended to editor!', 'info');
  };

  const handleOpenSaveToVault = () => {
    if (!activeDraft) return;
    setSaveVaultTitle(activeDraft.title);
    setSaveVaultAppId(activeDraft.scholarshipId ? `app-${activeDraft.scholarshipId}` : '');
    setIsSaveVaultModalOpen(true);
  };

  const handleConfirmSaveToVault = async () => {
    if (!activeDraft) return;
    const cleanTitle = saveVaultTitle.trim() || activeDraft.title;
    const fileName = `${cleanTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    const essayBlob = new Blob(
      [
        `==================================================\nBEACON VERIFIED ESSAY & PERSONAL STATEMENT\n==================================================\nTITLE: ${cleanTitle}\nSCHOLARSHIP TARGET: ${activeDraft.targetScholarshipTitle}\nPROMPT: ${activeDraft.promptText}\nTONE PROFILE: ${activeDraft.tone}\nWORD COUNT: ${critiqueResult.wordCount} words\nEVALUATION SCORE: ${critiqueResult.overallScore}% (${critiqueResult.strengthLabel})\nDATE GENERATED: ${new Date().toLocaleDateString()}\n==================================================\n\n${activeDraft.content}\n\n==================================================\nEND OF ESSAY REPLICA\n==================================================`,
      ],
      { type: 'application/pdf' }
    );

    const file = new File([essayBlob], fileName, { type: 'application/pdf' });

    try {
      const newDoc = await vault.addDocument(file, {
        title: cleanTitle,
        category: 'Personal Statements',
        verificationStatus: 'Verified',
        verificationIssuer: 'BEACON AI Writing Assistant Checked',
        tags: [activeDraft.tone, `${critiqueResult.wordCount} Words`, 'Personal Statement'],
        description: `Verified scholarship statement for ${activeDraft.targetScholarshipTitle}. Scored ${critiqueResult.overallScore}% (${critiqueResult.strengthLabel}).`,
        initialApplicationId: saveVaultAppId || undefined,
      });

      if (saveVaultAppId) {
        const targetApp = apps.applications.find((a) => a.id === saveVaultAppId);
        if (targetApp) {
          const essayDocItem = targetApp.documents.find((d) => d.category === 'essay');
          if (essayDocItem) {
            apps.updateDocumentStatus(saveVaultAppId, essayDocItem.id, 'ready', fileName);
          }
        }
      }

      updateDraftMeta({ savedToVault: true });
      setIsSaveVaultModalOpen(false);
      showToast(
        `Saved "${cleanTitle}" to Document Vault and attached to application checklist!`,
        'success'
      );
    } catch (err) {
      showToast('Failed to save essay to Document Vault.', 'warning');
    }
  };

  const handleCreateNewDraftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = availablePrompts.find((p: EssayPrompt) => p.id === newDraftPromptId) || availablePrompts[0];
    createDraft(prompt, newDraftTitle.trim() || undefined, newDraftTone);
    setIsNewDraftModalOpen(false);
    showToast(`Created draft "${newDraftTitle.trim() || prompt.scholarshipTitle}"`, 'success');
  };

  if (!activeDraft) {
    return (
      <div className="p-12 text-center text-[#253044]">
        No active essay drafts found.
      </div>
    );
  }

  const wordPercent = Math.min(
    100,
    Math.round((critiqueResult.wordCount / (activeDraft.targetWordCount || 600)) * 100)
  );

  return (
    <div className="space-y-6 font-reading">
      {/* Top Banner */}
      <div className="rounded-[17px] p-6 sm:p-8 bg-white border-[2.5px] border-[#252b3a] relative overflow-hidden shadow-[6px_6px_0px_#6434df]">
        <div className="absolute top-3 right-8 w-16 h-16 rounded-full bg-[#ffd05b]/40 border-[2px] border-[#252b3a] pointer-events-none -rotate-6" />
        <div className="absolute -bottom-4 right-28 w-14 h-14 bg-[#9bf1cd]/50 border-[2px] border-[#252b3a] rotate-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#ffd05b] text-[#253044] border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]">
              <PenTool className="w-3.5 h-3.5 text-[#6434df]" />
              <span>BEACON AI Writing Studio</span>
              <span className="w-2 h-2 rounded-full bg-[#6434df] animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-[#253044] tracking-tight">
              AI Scholarship <span className="text-[#6434df]">Essay Assistant</span>
            </h1>

            <p className="text-sm font-reading text-[#596174] max-w-2xl leading-relaxed">
              Draft, structure, and critique scholarship personal statements tailored to sponsor prompts with transparent evaluation metrics and one-click vault export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsNewDraftModalOpen(true)}
              className="px-4 py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-white text-xs sm:text-sm font-bold border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#252b3a] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Draft</span>
            </button>

            <button
              onClick={handleOpenSaveToVault}
              className="px-4 py-2.5 rounded-[12px] bg-white hover:bg-[#f1ebff] border-[2.5px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] text-[#253044] text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <FolderArchive className="w-4 h-4 text-[#6434df] stroke-[2.5]" />
              <span>Save to Vault</span>
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

      {/* DRAFT SWITCHER & PROMPT CONTEXT BAR */}
      <div className="p-4 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-[4px_4px_0px_#252b3a]">
        {/* Draft Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[#253044]/70 font-bold uppercase tracking-wider text-[10px] shrink-0">
            Active Drafts:
          </span>
          {drafts.map((d: EssayDraft) => (
            <button
              key={d.id}
              onClick={() => setActiveDraftId(d.id)}
              className={`px-3.5 py-1.5 rounded-[12px] font-bold whitespace-nowrap transition-all border-[2px] border-[#252b3a] cursor-pointer flex items-center gap-1.5 ${
                activeDraftId === d.id
                  ? 'bg-[#6434df] text-white shadow-[2px_2px_0px_#252b3a]'
                  : 'bg-[#fffdf5] text-[#253044] hover:bg-[#f1ebff]'
              }`}
            >
              <span>{d.title}</span>
              {d.savedToVault && (
                <span className="w-2 h-2 rounded-full bg-[#9bf1cd] border-[1px] border-[#252b3a]" title="Saved to Vault" />
              )}
            </button>
          ))}
        </div>

        {/* Tone Selector Pills */}
        <div className="flex items-center gap-1.5 self-start lg:self-auto text-xs">
          <span className="text-[#253044]/70 font-bold uppercase tracking-wider text-[10px] shrink-0">
            Tone:
          </span>
          {tones.map((t) => (
            <button
              key={t}
              onClick={() => updateDraftMeta({ tone: t })}
              className={`px-3 py-1 rounded-[10px] font-bold transition-all border-[1.5px] border-[#252b3a] cursor-pointer ${
                activeDraft.tone === t
                  ? 'bg-[#ffd05b] text-[#253044] shadow-[1.5px_1.5px_0px_#252b3a]'
                  : 'bg-[#fffdf5] text-[#253044] hover:bg-[#f1ebff]'
              }`}
              title={getToneDescription(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SCHOLARSHIP PROMPT INSPECTOR STRIP */}
      <div className="p-5 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffd05b] text-[#253044] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
              Prompt Target
            </span>
            <span className="font-display font-bold text-[#253044] text-sm">
              {activeDraft.targetScholarshipTitle}
            </span>
            <span className="text-[11px] font-reading font-semibold text-[#253044]/70">({activePrompt.provider})</span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsPromptModalOpen(true)}
              className="text-xs font-bold text-[#6434df] hover:text-[#5527cb] flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Switch Prompt</span>
            </button>
            <span className="text-[#253044]/40">•</span>
            <button
              onClick={() => setShowBlueprint(!showBlueprint)}
              className="text-xs font-bold text-[#253044] hover:text-[#6434df] flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{showBlueprint ? 'Hide Blueprint' : 'View Suggested Blueprint'}</span>
            </button>
          </div>
        </div>

        <p className="text-xs font-reading text-[#253044] italic leading-relaxed bg-[#fffdf5] p-3.5 rounded-[12px] border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]">
          "{activeDraft.promptText}"
        </p>

        {/* Expandable Blueprint */}
        {showBlueprint && activePrompt.suggestedOutline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 border-t-[1.5px] border-[#252b3a]/20 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#253044]">
                Recommended 4-Part Structure Blueprint:
              </span>
              <button
                onClick={handleInsertBlueprint}
                className="px-3 py-1 rounded-[8px] bg-[#f1ebff] hover:bg-[#6434df] text-[#6434df] hover:text-white text-[11px] font-bold border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>Insert Blueprint into Editor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {activePrompt.suggestedOutline.map((sec: { section: string; targetWords: number; focus: string }, idx: number) => (
                <div key={idx} className="p-3 rounded-[12px] bg-[#fffdf5] border-[1.5px] border-[#252b3a] space-y-1 shadow-[1.5px_1.5px_0px_#252b3a]">
                  <div className="font-display font-bold text-xs text-[#6434df]">
                    {sec.section}
                  </div>
                  <p className="text-[10px] font-reading text-[#253044]/80 leading-snug">{sec.focus}</p>
                  <span className="text-[10px] font-mono font-bold text-[#253044]/60">
                    Target: ~{sec.targetWords} words
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* 2-COLUMN MAIN WORKSPACE: STUDIO (LEFT) & CRITIQUE ENGINE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: WRITING STUDIO (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[5px_5px_0px_#252b3a] space-y-4">
            {/* Title & Stats Ribbon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-[2px] border-[#252b3a]">
              <input
                type="text"
                value={activeDraft.title}
                onChange={(e) => updateDraftMeta({ title: e.target.value })}
                placeholder="Draft Title..."
                className="font-display font-bold text-lg text-[#253044] bg-transparent outline-none border-b-2 border-transparent focus:border-[#6434df] transition-colors flex-1"
              />

              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1 rounded-[8px] bg-[#fffdf5] text-[#6434df] font-mono border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
                  {critiqueResult.wordCount} / {activeDraft.targetWordCount} words
                </span>
                <span className="px-3 py-1 rounded-[8px] bg-[#fffdf5] text-[#253044]/70 font-mono text-[11px] border-[1.5px] border-[#252b3a]">
                  {critiqueResult.readingTimeMinutes} min read
                </span>
              </div>
            </div>

            {/* Word Count Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-[#253044]/70">Word Count Target Compliance</span>
                <span className="text-[#6434df] font-mono">
                  {wordPercent}% of {activeDraft.targetWordCount} words
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#fffdf5] rounded-full border-[1.5px] border-[#252b3a] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    wordPercent > 115
                      ? 'bg-[#ff78c5]'
                      : wordPercent >= 80
                      ? 'bg-[#9bf1cd]'
                      : 'bg-[#6434df]'
                  }`}
                  style={{ width: `${Math.min(100, wordPercent)}%` }}
                />
              </div>
            </div>

            {/* Main Textarea */}
            <div className="relative">
              <textarea
                rows={16}
                value={activeDraft.content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="Write or paste your scholarship personal statement here..."
                className="w-full p-4 rounded-[14px] bg-[#ffffff] border-[2px] border-[#252b3a] focus:ring-2 focus:ring-[#6434df] text-[#253044] font-reading text-sm leading-relaxed outline-none resize-y min-h-[360px] transition-all shadow-[2px_2px_0px_#252b3a] selection:bg-[#f1ebff] selection:text-[#6434df]"
              />
            </div>

            {/* Editor Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-[10px] bg-white hover:bg-[#fffdf5] text-[#253044] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 stroke-[2.5] text-[#6434df]" /> : <Copy className="w-3.5 h-3.5 stroke-[2]" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => handleDownload('md')}
                  className="px-3 py-1.5 rounded-[10px] bg-white hover:bg-[#fffdf5] text-[#253044] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2]" />
                  <span>.MD</span>
                </button>

                <button
                  onClick={() => handleDownload('txt')}
                  className="px-3 py-1.5 rounded-[10px] bg-white hover:bg-[#fffdf5] text-[#253044] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2]" />
                  <span>.TXT</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenSaveToVault}
                  className="px-4 py-2 rounded-[10px] bg-[#6434df] hover:bg-[#5228bf] text-white font-bold border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] flex items-center gap-1.5 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <FolderArchive className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save to Vault & Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETERMINISTIC CRITIQUE PANEL (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 sm:p-6 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[5px_5px_0px_#252b3a] space-y-5">
            {/* Header & Overall Score */}
            <div className="flex items-center justify-between pb-4 border-b-[2px] border-[#252b3a]">
              <div>
                <h3 className="font-display font-bold text-base text-[#253044] flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-[#ffd05b] border-[1.5px] border-[#252b3a] flex items-center justify-center shadow-[1.5px_1.5px_0px_#252b3a]">
                    <Sparkles className="w-4 h-4 stroke-[2.5] text-[#253044]" />
                  </div>
                  <span>Rubric Evaluation & Critique</span>
                </h3>
                <p className="text-xs font-reading text-[#253044]/70 mt-0.5">
                  Deterministic 4-dimension essay strength index.
                </p>
              </div>

              {/* Big Score Badge */}
              <div
                className={`px-3.5 py-1.5 rounded-[12px] border-[2px] border-[#252b3a] text-center font-display font-extrabold shadow-[2px_2px_0px_#252b3a] ${getScoreColor(
                  critiqueResult.overallScore
                )}`}
              >
                <div className="text-xl leading-none">{critiqueResult.overallScore}%</div>
                <span className="text-[10px] font-reading font-bold uppercase tracking-wider block mt-0.5">
                  {critiqueResult.strengthLabel}
                </span>
              </div>
            </div>

            {/* 4 Rubric Factor Breakdowns */}
            <div className="space-y-3">
              {critiqueResult.factors.map((f: EssayCritiqueFactor, idx: number) => (
                <div key={idx} className="p-3.5 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] space-y-2 text-xs shadow-[2px_2px_0px_#252b3a]">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-[#253044]">
                      {f.name}
                    </span>
                    <span className="font-mono font-bold text-[#6434df]">
                      {f.score}/100
                    </span>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full h-2 bg-white rounded-full border-[1px] border-[#252b3a] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getScoreBarFill(f.score)}`}
                      style={{ width: `${f.score}%` }}
                    />
                  </div>

                  <p className="text-[11px] font-reading text-[#253044]/80 leading-relaxed">
                    {f.feedback}
                  </p>

                  <div className="text-[10px] text-[#6434df] font-bold flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-[#6434df] stroke-[3] shrink-0" />
                    <span>{f.actionItem}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Identified Strengths */}
            {critiqueResult.strengths.length > 0 && (
              <div className="space-y-2 pt-2 border-t-[1.5px] border-[#252b3a]/20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#253044] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#253044] stroke-[2.5]" />
                  <span>Verified Essay Strengths</span>
                </span>
                <ul className="space-y-1.5 text-xs text-[#253044]">
                  {critiqueResult.strengths.map((str: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 bg-[#e9fff5] p-2.5 rounded-[10px] border-[1.5px] border-[#252b3a] shadow-[1px_1px_0px_#252b3a]">
                      <span className="text-[#253044] font-bold">•</span>
                      <span className="text-[11px] font-reading font-semibold leading-relaxed">{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actionable Recommendations */}
            {critiqueResult.recommendations.length > 0 && (
              <div className="space-y-2 pt-2 border-t-[1.5px] border-[#252b3a]/20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#253044] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#253044] stroke-[2.5]" />
                  <span>Actionable Improvements</span>
                </span>
                <ul className="space-y-1.5 text-xs text-[#253044]">
                  {critiqueResult.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 bg-[#ffd05b]/20 p-2.5 rounded-[10px] border-[1.5px] border-[#252b3a] shadow-[1px_1px_0px_#252b3a]">
                      <span className="text-[#253044] font-bold">•</span>
                      <span className="text-[11px] font-reading font-semibold leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: SWITCH SCHOLARSHIP PROMPT */}
      <AnimatePresence>
        {isPromptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPromptModalOpen(false)}
              className="fixed inset-0 bg-[#253044]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white border-[3px] border-[#252b3a] rounded-[20px] shadow-[8px_8px_0px_#252b3a] p-6 space-y-4 z-10 text-xs font-reading"
            >
              <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#252b3a]">
                <h3 className="font-display font-bold text-base text-[#253044] flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-[#ffd05b] border-[1.5px] border-[#252b3a] flex items-center justify-center shadow-[1.5px_1.5px_0px_#252b3a]">
                    <Compass className="w-4 h-4 stroke-[2.5] text-[#253044]" />
                  </div>
                  <span>Select Target Scholarship Essay Prompt</span>
                </h3>
                <button
                  onClick={() => setIsPromptModalOpen(false)}
                  className="p-1 rounded-[8px] text-[#253044] hover:bg-[#ff78c5] border border-transparent hover:border-[#252b3a] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {availablePrompts.map((p: EssayPrompt) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      switchPrompt(p);
                      setIsPromptModalOpen(false);
                      showToast(`Switched prompt to "${p.scholarshipTitle}"`, 'info');
                    }}
                    className={`p-4 rounded-[14px] border-[2px] border-[#252b3a] transition-all cursor-pointer space-y-2 shadow-[2px_2px_0px_#252b3a] ${
                      activePrompt.id === p.id
                        ? 'bg-[#f1ebff] shadow-[4px_4px_0px_#6434df]'
                        : 'bg-[#fffdf5] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-display font-bold text-[#253044] text-sm">
                          {p.scholarshipTitle}
                        </h4>
                        <p className="text-[11px] font-reading text-[#253044]/70">{p.provider}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-[#6434df] border-[1.5px] border-[#252b3a]">
                        {p.targetWordCount} words
                      </span>
                    </div>

                    <p className="text-xs font-reading text-[#253044] leading-relaxed italic">
                      "{p.promptText}"
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: NEW ESSAY DRAFT WIZARD */}
      <AnimatePresence>
        {isNewDraftModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewDraftModalOpen(false)}
              className="fixed inset-0 bg-[#253044]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white border-[3px] border-[#252b3a] rounded-[20px] shadow-[8px_8px_0px_#252b3a] p-6 space-y-4 z-10 text-xs font-reading"
            >
              <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#252b3a]">
                <h3 className="font-display font-bold text-base text-[#253044] flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-[#ffd05b] border-[1.5px] border-[#252b3a] flex items-center justify-center shadow-[1.5px_1.5px_0px_#252b3a]">
                    <Plus className="w-4 h-4 stroke-[3] text-[#253044]" />
                  </div>
                  <span>Create New Essay Draft</span>
                </h3>
                <button
                  onClick={() => setIsNewDraftModalOpen(false)}
                  className="p-1 rounded-[8px] text-[#253044] hover:bg-[#ff78c5] border border-transparent hover:border-[#252b3a] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewDraftSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[#253044] font-bold block">
                    Draft Title:
                  </label>
                  <input
                    type="text"
                    value={newDraftTitle}
                    onChange={(e) => setNewDraftTitle(e.target.value)}
                    placeholder="e.g. DeepMind Research Proposal v1"
                    className="w-full p-2.5 rounded-[12px] bg-[#ffffff] border-[2px] border-[#252b3a] text-[#253044] font-bold outline-none focus:ring-2 focus:ring-[#6434df] shadow-[2px_2px_0px_#252b3a]"
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#253044] font-bold block">
                    Target Opportunity Prompt:
                  </label>
                  <select
                    value={newDraftPromptId}
                    onChange={(e) => setNewDraftPromptId(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#ffffff] border-[2px] border-[#252b3a] text-[#253044] font-bold outline-none focus:ring-2 focus:ring-[#6434df] shadow-[2px_2px_0px_#252b3a] cursor-pointer"
                  >
                    {availablePrompts.map((p: EssayPrompt) => (
                      <option key={p.id} value={p.id} className="bg-white">
                        {p.scholarshipTitle} (~{p.targetWordCount} words)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#253044] font-bold block">
                    Tone Profile:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {tones.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewDraftTone(t)}
                        className={`p-2.5 rounded-[12px] text-xs font-bold border-[2px] border-[#252b3a] transition-all cursor-pointer ${
                          newDraftTone === t
                            ? 'bg-[#6434df] text-white shadow-[2px_2px_0px_#252b3a]'
                            : 'bg-[#fffdf5] text-[#253044] hover:bg-[#f1ebff]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t-[2px] border-[#252b3a]">
                  <button
                    type="button"
                    onClick={() => setIsNewDraftModalOpen(false)}
                    className="px-4 py-2 rounded-[12px] text-[#253044] hover:bg-[#fffdf5] font-bold border-[2px] border-transparent hover:border-[#252b3a]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-white font-bold border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] cursor-pointer"
                  >
                    Start Writing
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: SAVE TO DOCUMENT VAULT & LINK TO APPLICATION */}
      <AnimatePresence>
        {isSaveVaultModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSaveVaultModalOpen(false)}
              className="fixed inset-0 bg-[#253044]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white border-[3px] border-[#252b3a] rounded-[20px] shadow-[8px_8px_0px_#252b3a] p-6 space-y-4 z-10 text-xs font-reading"
            >
              <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#252b3a]">
                <h3 className="font-display font-bold text-base text-[#253044] flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-[#ffd05b] border-[1.5px] border-[#252b3a] flex items-center justify-center shadow-[1.5px_1.5px_0px_#252b3a]">
                    <FolderArchive className="w-4 h-4 stroke-[2.5] text-[#253044]" />
                  </div>
                  <span>Save Essay to Document Vault</span>
                </h3>
                <button
                  onClick={() => setIsSaveVaultModalOpen(false)}
                  className="p-1 rounded-[8px] text-[#253044] hover:bg-[#ff78c5] border border-transparent hover:border-[#252b3a] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] space-y-1 shadow-[2px_2px_0px_#252b3a]">
                  <div className="font-display font-bold text-[#253044] text-sm">
                    {activeDraft.title}
                  </div>
                  <div className="text-[#6434df] font-bold text-[11px]">
                    {critiqueResult.wordCount} words • Score: {critiqueResult.overallScore}% ({critiqueResult.strengthLabel})
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#253044] font-bold block">
                    Vault Document Title:
                  </label>
                  <input
                    type="text"
                    value={saveVaultTitle}
                    onChange={(e) => setSaveVaultTitle(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#ffffff] border-[2px] border-[#252b3a] text-[#253044] font-bold outline-none focus:ring-2 focus:ring-[#6434df] shadow-[2px_2px_0px_#252b3a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#253044] font-bold block">
                    Link Directly to Application Checklist:
                  </label>
                  <select
                    value={saveVaultAppId}
                    onChange={(e) => setSaveVaultAppId(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#ffffff] border-[2px] border-[#252b3a] text-[#253044] font-bold outline-none focus:ring-2 focus:ring-[#6434df] shadow-[2px_2px_0px_#252b3a] cursor-pointer"
                  >
                    <option value="">Do not attach (Vault only)</option>
                    {apps.applications.map((app) => (
                      <option key={app.id} value={app.id} className="bg-white">
                        {app.scholarshipName} ({app.status})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#253044]/70 font-semibold mt-1">
                    Linking will mark the target application's Personal Statement requirement as READY.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t-[2px] border-[#252b3a]">
                  <button
                    type="button"
                    onClick={() => setIsSaveVaultModalOpen(false)}
                    className="px-4 py-2 rounded-[12px] text-[#253044] hover:bg-[#fffdf5] font-bold border-[2px] border-transparent hover:border-[#252b3a]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSaveToVault}
                    className="px-5 py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-white font-bold border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] cursor-pointer"
                  >
                    Confirm & Save to Vault
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
