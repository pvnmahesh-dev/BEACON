import React, { useState, useMemo } from 'react';
import {
  User,
  GraduationCap,
  Award,
  DollarSign,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Plus,
  X,
  Edit3,
  ArrowRight
} from 'lucide-react';
import { UserProfile, EducationLevel } from '../../types';
import { ProfileValidationErrors } from '../../hooks/useStudentProfile';
import { rawScholarshipsData, getComputedScholarships } from '../../data/scholarshipDatabase';
import { useToast } from '../ui/Toast';

interface StudentProfilePageProps {
  profile: UserProfile;
  onUpdateProfile: (newFields: Partial<UserProfile>) => boolean;
  onResetProfile: () => void;
  validationErrors: ProfileValidationErrors;
  onBackToDashboard?: () => void;
  onNavigateToDiscover?: () => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  profile,
  onUpdateProfile,
  onResetProfile,
  validationErrors,
  onNavigateToDiscover,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [newAchievement, setNewAchievement] = useState<string>('');
  const { showToast } = useToast();

  // Keep local form in sync with profile prop when not dirty
  React.useEffect(() => {
    setFormData(profile);
  }, [profile]);

  // Live simulation of how current form inputs affect scholarship eligibility
  const simulatedMatches = useMemo(() => {
    return getComputedScholarships(formData);
  }, [formData]);

  const eligibleCount = simulatedMatches.filter((s) => s.eligibilityStatus === 'eligible').length;
  const potentialCount = simulatedMatches.filter((s) => s.eligibilityStatus === 'potentially_eligible').length;
  const disqualifiedCount = simulatedMatches.filter((s) => s.eligibilityStatus === 'not_eligible').length;
  const totalEligibleFunding = simulatedMatches
    .filter((s) => s.eligibilityStatus === 'eligible')
    .reduce((sum, s) => sum + s.awardAmount, 0);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddAchievement = () => {
    if (!newAchievement.trim()) return;
    setFormData((prev) => ({
      ...prev,
      relevantAchievements: [...prev.relevantAchievements, newAchievement.trim()],
    }));
    setNewAchievement('');
  };

  const handleRemoveAchievement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      relevantAchievements: prev.relevantAchievements.filter((_, i) => i !== index),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUpdateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const educationLevels: EducationLevel[] = ['Undergraduate', 'Graduate', 'Doctorate', 'High School'];
  const academicYears = [
    'Freshman',
    'Sophomore',
    'Junior',
    'Senior',
    'Master Year 1',
    'Master Year 2',
    'PhD Candidate',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-[17px] p-6 sm:p-8 bg-white border-[2.5px] border-[#252b3a] shadow-[6px_6px_0px_#6434df] relative overflow-hidden">
        {/* Geometric accent */}
        <div className="absolute top-4 right-8 w-8 h-8 rounded-full bg-[#ff78c5] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] hidden sm:block pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-heading font-black bg-[#ffd05b] text-[#253044] border-2 border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>BEACON Profile & Academic Dossier</span>
              <span className="w-2 h-2 rounded-full bg-[#253044]" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-[#253044] tracking-tight">
              Student Profile & <span className="text-[#6434df]">Eligibility Engine</span>
            </h1>

            <p className="text-sm text-[#596174] font-medium max-w-2xl leading-relaxed">
              Manage your academic credentials, residency, and financial parameters. Updates immediately recompute deterministic match scores across the entire scholarship database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5527cb] text-white text-xs sm:text-sm font-heading font-bold border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a] hover:-translate-y-0.5 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-[#ffd05b]" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-[12px] bg-[#9bf1cd] hover:bg-[#8be5be] text-[#253044] text-xs sm:text-sm font-heading font-black border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a] hover:-translate-y-0.5 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Save Profile Changes</span>
              </button>
            )}

            <button
              onClick={onResetProfile}
              className="px-4 py-2.5 rounded-[12px] bg-white hover:bg-[#fffdf5] border-2 border-[#252b3a] text-xs sm:text-sm font-heading font-bold text-[#253044] shadow-[3px_3px_0px_#252b3a] hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Reset profile back to default demonstration student"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#253044]" />
              <span>Reset Demo Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Real-Time Eligibility Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Profile Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="p-6 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] space-y-6">
            {/* Header row with avatar and profile completion */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#252b3a]">
              <div className="flex items-center gap-4">
                <img
                  src={formData.avatar || profile.avatar}
                  alt={formData.name}
                  className="w-16 h-16 rounded-[14px] object-cover border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-heading font-black text-[#253044]">
                      {formData.name || 'Scholar Profile'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-heading font-black bg-[#9bf1cd] text-[#253044] border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a]">
                      {formData.educationLevel}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#596174] mt-0.5">
                    {formData.university} • {formData.degree}
                  </p>
                </div>
              </div>

              {/* Profile Completion Tag */}
              <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#fffdf5] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a]">
                <div className="text-right">
                  <span className="text-[10px] text-[#596174] block font-black uppercase">Profile Completeness</span>
                  <span className="text-sm font-heading font-black text-[#6434df]">
                    {formData.profileCompletion ?? profile.profileCompletion}% Complete
                  </span>
                </div>
                <div className="w-10 h-10 rounded-[10px] bg-[#6434df] border-2 border-[#252b3a] flex items-center justify-center text-white font-heading font-black text-xs shadow-[1.5px_1.5px_0px_#252b3a]">
                  {formData.profileCompletion ?? profile.profileCompletion}%
                </div>
              </div>
            </div>

            {/* Section 1: Personal & Geographic Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#596174] flex items-center gap-2">
                <User className="w-4 h-4 text-[#6434df] stroke-[2.5]" />
                Personal & Residency Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold text-[#253044]">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className={`w-full p-2.5 rounded-[12px] text-xs font-medium border-2 outline-none transition-all ${validationErrors.name ? 'border-red-500 bg-red-50' : 'border-[#252b3a] bg-[#ffffff] focus:border-[#6434df]'
                      } ${!isEditing ? 'text-[#596174] cursor-not-allowed bg-white border-[#252b3a]/40 shadow-none' : 'text-[#253044] shadow-[2px_2px_0px_#252b3a]'}`}
                  />
                  {validationErrors.name && (
                    <span className="text-[11px] text-red-600 font-bold block">{validationErrors.name}</span>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold text-[#253044]">
                    Academic / Personal Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="e.g. alex.rivera@berkeley.edu"
                    className={`w-full p-2.5 rounded-[12px] text-xs font-medium border-2 outline-none transition-all ${validationErrors.email ? 'border-red-500 bg-red-50' : 'border-[#252b3a] bg-[#ffffff] focus:border-[#6434df]'
                      } ${!isEditing ? 'text-[#596174] cursor-not-allowed bg-white border-[#252b3a]/40 shadow-none' : 'text-[#253044] shadow-[2px_2px_0px_#252b3a]'}`}
                  />
                  {validationErrors.email && (
                    <span className="text-[11px] text-red-600 font-bold block">{validationErrors.email}</span>
                  )}
                </div>

                {/* Country of Residency */}
                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold text-[#253044]">
                    Country of Residency <span className="text-red-500">*</span>
                  </label>
                  <select
                    disabled={!isEditing}
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={`w-full p-2.5 rounded-[12px] text-xs font-medium border-2 border-[#252b3a] outline-none ${!isEditing ? 'text-[#596174] cursor-not-allowed bg-white border-[#252b3a]/40' : 'text-[#253044] bg-[#ffffff] shadow-[2px_2px_0px_#252b3a] focus:border-[#6434df]'
                      }`}
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                    <option value="India">India</option>
                    <option value="Global">Other (International)</option>
                  </select>
                </div>

                {/* State / Province */}
                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold text-[#253044]">
                    State / Province / Region
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="e.g. California"
                    className={`w-full p-2.5 rounded-[12px] text-xs font-medium border-2 border-[#252b3a] outline-none ${!isEditing ? 'text-[#596174] cursor-not-allowed bg-white border-[#252b3a]/40' : 'text-[#253044] bg-[#ffffff] shadow-[2px_2px_0px_#252b3a] focus:border-[#6434df]'
                      }`}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Academic Standing & Institution */}
            <div className="space-y-4 pt-4 border-t-2 border-[#252b3a]">
              <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#596174] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#6434df] stroke-[2.5]" />
                Academic Standing & Institution
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Education Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold text-[#253044]">
                    Education Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    disabled={!isEditing}
                    value={formData.educationLevel}
                    onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                    className={`w-full p-2.5 rounded-[12px] text-xs font-medium border-2 border-[#252b3a] outline-none ${!isEditing ? 'text-[#596174] cursor-not-allowed bg-white border-[#252b3a]/40' : 'text-[#253044] bg-[#ffffff] shadow-[2px_2px_0px_#252b3a] focus:border-[#6434df]'
                      }`}
                  >
                    {educationLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                {/* University / Institution */}
                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold text-[#253044]">
                    University / College / School <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.university}
                    onChange={(e) => handleInputChange('university', e.target.value)}
                    placeholder="e.g. UC Berkeley"
                    className={`w-full p-2.5 rounded-[12px] text-xs font-medium border-2 outline-none transition-all ${validationErrors.university ? 'border-red-500 bg-red-50' : 'border-[#252b3a] bg-[#ffffff] focus:border-[#6434df]'
                      } ${!isEditing ? 'text-[#596174] cursor-not-allowed bg-white border-[#252b3a]/40 shadow-none' : 'text-[#253044] shadow-[2px_2px_0px_#252b3a]'}`}
                  />
                  {validationErrors.university && (
                    <span className="text-[11px] text-red-600 font-bold block">{validationErrors.university}</span>
                  )}
                </div>

                {/* Degree Program */}
                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold text-[#253044]">
                    Degree Program <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.degree}
                    onChange={(e) => handleInputChange('degree', e.target.value)}
                    placeholder="e.g. B.S. in Electrical Engineering & Computer Sciences"
                    className={`w-full p-2.5 rounded-[12px] text-xs font-medium border-2 outline-none transition-all ${validationErrors.degree ? 'border-red-500 bg-red-50' : 'border-[#252b3a] bg-[#ffffff] focus:border-[#6434df]'
                      } ${!isEditing ? 'text-[#596174] cursor-not-allowed bg-white border-[#252b3a]/40 shadow-none' : 'text-[#253044] shadow-[2px_2px_0px_#252b3a]'}`}
                  />
                  {validationErrors.degree && (
                    <span className="text-[11px] text-red-600 font-bold block">{validationErrors.degree}</span>
                  )}
                </div>

                {/* Current Academic Year */}
                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold text-[#253044]">
                    Current Academic Year
                  </label>
                  <select
                    disabled={!isEditing}
                    value={formData.currentAcademicYear || 'Junior'}
                    onChange={(e) => handleInputChange('currentAcademicYear', e.target.value)}
                    className={`w-full p-2.5 rounded-[12px] text-xs font-medium border-2 border-[#252b3a] outline-none ${!isEditing ? 'text-[#596174] cursor-not-allowed bg-white border-[#252b3a]/40' : 'text-[#253044] bg-[#ffffff] shadow-[2px_2px_0px_#252b3a] focus:border-[#6434df]'
                      }`}
                  >
                    {academicYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field of Study */}
                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold text-[#253044]">
                    Field of Study / Discipline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.fieldOfStudy}
                    onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                    placeholder="e.g. Engineering & Technology"
                    className={`w-full p-2.5 rounded-[12px] text-xs font-medium border-2 outline-none transition-all ${validationErrors.fieldOfStudy ? 'border-red-500 bg-red-50' : 'border-[#252b3a] bg-[#ffffff] focus:border-[#6434df]'
                      } ${!isEditing ? 'text-[#596174] cursor-not-allowed bg-white border-[#252b3a]/40 shadow-none' : 'text-[#253044] shadow-[2px_2px_0px_#252b3a]'}`}
                  />
                  {validationErrors.fieldOfStudy && (
                    <span className="text-[11px] text-red-600 font-bold block">{validationErrors.fieldOfStudy}</span>
                  )}
                </div>

                {/* Cumulative GPA (0.0 - 4.0) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-heading font-bold text-[#253044]">
                      Cumulative GPA (4.0 Scale) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-[#6434df] font-mono font-bold">Max: 4.00</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    disabled={!isEditing}
                    value={formData.gpa ?? ''}
                    onChange={(e) => handleInputChange('gpa', parseFloat(e.target.value))}
                    placeholder="3.85"
                    className={`w-full p-2.5 rounded-[12px] text-xs font-mono font-bold border-2 outline-none ${validationErrors.gpa ? 'border-red-500 bg-red-50' : 'border-[#252b3a] bg-[#ffffff] focus:border-[#6434df]'
                      } ${!isEditing ? 'text-[#596174] cursor-not-allowed bg-white border-[#252b3a]/40 shadow-none' : 'text-[#253044] shadow-[2px_2px_0px_#252b3a]'}`}
                  />
                  {validationErrors.gpa && (
                    <span className="text-[11px] text-red-600 font-bold block">{validationErrors.gpa}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Financial Criteria & Need-Based Ceiling */}
            <div className="space-y-4 pt-4 border-t-2 border-[#252b3a]">
              <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#596174] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#9bf1cd] stroke-[#253044] stroke-[2.5]" />
                Financial Need Parameters (For Need-Based Grants)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold text-[#253044]">
                    Annual Family Income (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#596174] font-bold text-xs">$</span>
                    <input
                      type="number"
                      step="1000"
                      disabled={!isEditing}
                      value={formData.annualFamilyIncome ?? ''}
                      onChange={(e) => handleInputChange('annualFamilyIncome', parseInt(e.target.value, 10))}
                      placeholder="58000"
                      className={`w-full pl-8 pr-3 py-2.5 rounded-[12px] text-xs font-mono font-bold border-2 border-[#252b3a] outline-none ${!isEditing ? 'text-[#596174] cursor-not-allowed bg-white border-[#252b3a]/40 shadow-none' : 'text-[#253044] bg-[#ffffff] shadow-[2px_2px_0px_#252b3a] focus:border-[#6434df]'
                        }`}
                    />
                  </div>
                  <span className="text-[11px] text-[#596174] font-semibold block">
                    Used to evaluate need ceilings (e.g. First-Gen STEM fund ceiling: $80,000).
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4: Relevant Achievements & Highlights */}
            <div className="space-y-4 pt-4 border-t-2 border-[#252b3a]">
              <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#596174] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#ffd05b] stroke-[#253044] stroke-[2.5]" />
                Relevant Achievements & Profile Highlights
              </h3>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.relevantAchievements?.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[#fffdf5] border-2 border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] text-xs font-heading font-bold text-[#253044]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#253044] fill-[#9bf1cd]" />
                      <span>{item}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAchievement(idx)}
                          className="ml-1 text-[#596174] hover:text-red-500 cursor-pointer"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAchievement();
                        }
                      }}
                      placeholder="Add an achievement (e.g. First-Gen, Dean's List, Research Fellow)..."
                      className="flex-1 p-2.5 rounded-[12px] bg-[#ffffff] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-xs text-[#253044] font-medium outline-none focus:border-[#6434df]"
                    />
                    <button
                      type="button"
                      onClick={handleAddAchievement}
                      className="px-4 py-2.5 rounded-[12px] bg-[#ffd05b] text-[#253044] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-xs font-heading font-black flex items-center gap-1 cursor-pointer hover:-translate-y-0.5"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Form Footer Action Bar */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-6 border-t-2 border-[#252b3a]">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 rounded-[12px] bg-white border-2 border-[#252b3a] text-xs font-heading font-bold text-[#253044] shadow-[2px_2px_0px_#252b3a] hover:bg-[#fffdf5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5527cb] text-white text-xs font-heading font-bold border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a] flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
                >
                  <Save className="w-4 h-4 text-[#ffd05b]" />
                  <span>Save & Recalculate Matches</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Live Eligibility Intelligence Impact Preview (1 col) */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="p-5 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[5px_5px_0px_#6434df] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#252b3a]">
              <span className="font-heading font-black text-xs uppercase tracking-wider text-[#6434df] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#6434df]" />
                Live Eligibility Impact
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#9bf1cd] border border-[#252b3a]" />
            </div>

            <p className="text-xs text-[#253044]/80 font-medium leading-relaxed">
              Real-time calculation showing how your credentials qualify against all {rawScholarshipsData.length} records.
            </p>

            {/* Impact Metric Cards */}
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-[14px] bg-[#e9fff5] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#253044]/70 block">Fully Eligible</span>
                  <span className="text-xl font-heading font-black text-[#253044]">
                    {eligibleCount} Opportunities
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#253044]/60 block">Total Potential</span>
                  <span className="text-sm font-heading font-black text-[#6434df]">
                    ${totalEligibleFunding.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-[14px] bg-[#fffdf5] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#253044]/70 block">Potentially Eligible</span>
                  <span className="text-lg font-heading font-black text-[#253044]">
                    {potentialCount} Borderline
                  </span>
                </div>
                <span className="text-[10px] text-[#253044]/80 font-semibold max-w-[120px] text-right">
                  Near GPA/income cutoff
                </span>
              </div>

              <div className="p-3.5 rounded-[14px] bg-[#ff78c5]/15 border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#253044]/70 block">Disqualified</span>
                  <span className="text-lg font-heading font-black text-[#253044]">
                    {disqualifiedCount} Excluded
                  </span>
                </div>
                <span className="text-[10px] text-[#253044]/80 font-semibold max-w-[120px] text-right">
                  Failed mandatory rules
                </span>
              </div>
            </div>

            {/* Explanatory Note */}
            <div className="p-3 rounded-[12px] bg-[#f1ebff] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-[11px] text-[#253044] font-medium leading-relaxed">
              <strong>Transparent Match Engine:</strong> If a mandatory requirement fails (such as GPA or residency), BEACON flags it as <em>Disqualified</em> rather than masking the blocker with a high overall score.
            </div>

            {onNavigateToDiscover && (
              <button
                onClick={onNavigateToDiscover}
                className="w-full py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5527cb] text-white border-2 border-[#252b3a] shadow-[2.5px_2.5px_0px_#252b3a] text-xs font-heading font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
              >
                <span>View Filtered Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#ffd05b]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
