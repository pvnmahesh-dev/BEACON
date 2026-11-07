import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { defaultStudentProfile } from '../data/userData';
import { useToast } from '../components/ui/Toast';

const STORAGE_KEY = 'beacon_student_profile';

export interface ProfileValidationErrors {
  name?: string;
  email?: string;
  country?: string;
  state?: string;
  university?: string;
  degree?: string;
  gpa?: string;
  annualFamilyIncome?: string;
  fieldOfStudy?: string;
}

export function useStudentProfile() {
  const { showToast } = useToast();

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.name) {
          return {
            ...defaultStudentProfile,
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse student profile from localStorage', e);
    }
    return defaultStudentProfile;
  });

  const [validationErrors, setValidationErrors] = useState<ProfileValidationErrors>({});

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to persist student profile to localStorage', e);
    }
  }, [profile]);

  // Dynamic profile completion percentage calculator
  const calculateCompletion = (p: UserProfile): number => {
    let score = 0;
    const weights: { key: keyof UserProfile; pts: number }[] = [
      { key: 'name', pts: 10 },
      { key: 'email', pts: 10 },
      { key: 'country', pts: 10 },
      { key: 'state', pts: 5 },
      { key: 'educationLevel', pts: 10 },
      { key: 'university', pts: 10 },
      { key: 'degree', pts: 10 },
      { key: 'gpa', pts: 15 },
      { key: 'fieldOfStudy', pts: 10 },
      { key: 'annualFamilyIncome', pts: 5 },
      { key: 'relevantAchievements', pts: 5 },
    ];

    weights.forEach(({ key, pts }) => {
      const val = p[key];
      if (Array.isArray(val) ? val.length > 0 : val !== undefined && val !== null && val !== '') {
        score += pts;
      }
    });

    return Math.min(100, score);
  };

  const validate = (data: Partial<UserProfile>): { isValid: boolean; errors: ProfileValidationErrors } => {
    const errors: ProfileValidationErrors = {};

    if (data.name !== undefined && !data.name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (data.email !== undefined) {
      if (!data.email.trim()) {
        errors.email = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please enter a valid academic or personal email.';
      }
    }

    if (data.gpa !== undefined && data.gpa !== null) {
      const gpaNum = Number(data.gpa);
      if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
        errors.gpa = 'GPA must be between 0.00 and 4.00.';
      }
    }

    if (data.annualFamilyIncome !== undefined && data.annualFamilyIncome !== null) {
      const incNum = Number(data.annualFamilyIncome);
      if (isNaN(incNum) || incNum < 0) {
        errors.annualFamilyIncome = 'Income must be a valid non-negative number.';
      }
    }

    if (data.university !== undefined && !data.university.trim()) {
      errors.university = 'University or institution name is required.';
    }

    if (data.degree !== undefined && !data.degree.trim()) {
      errors.degree = 'Degree or program name is required.';
    }

    if (data.fieldOfStudy !== undefined && !data.fieldOfStudy.trim()) {
      errors.fieldOfStudy = 'Field of study is required.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const updateProfile = useCallback(
    (newFields: Partial<UserProfile>): boolean => {
      const validation = validate(newFields);
      setValidationErrors(validation.errors);

      if (!validation.isValid) {
        showToast('Please resolve the validation errors before saving.', 'warning');
        return false;
      }

      setProfile((prev) => {
        const merged: UserProfile = {
          ...prev,
          ...newFields,
          // keep legacy fields in sync
          institution: newFields.university || prev.university,
          major: newFields.fieldOfStudy || prev.fieldOfStudy,
        };
        merged.profileCompletion = calculateCompletion(merged);
        return merged;
      });

      showToast('Profile updated! Match scores and recommendations recomputed.', 'success');
      return true;
    },
    [showToast]
  );

  const resetProfile = useCallback(() => {
    setProfile(defaultStudentProfile);
    setValidationErrors({});
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStudentProfile));
    } catch (e) {
      console.warn('Failed to reset student profile in localStorage', e);
    }
    showToast('Reset profile to default demonstration scholar (Alex Rivera, MIT).', 'info');
  }, [showToast]);

  return {
    profile,
    updateProfile,
    resetProfile,
    validationErrors,
    validate,
  };
}

