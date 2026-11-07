import { UserProfile } from '../types';

export const currentUser: UserProfile = {
  name: 'Alex Rivera',
  email: 'alex.rivera@mit.edu',
  country: 'United States',
  state: 'Massachusetts',
  educationLevel: 'Undergraduate',
  university: 'Massachusetts Institute of Technology',
  degree: 'B.S. Computer Science & AI',
  currentAcademicYear: 'Junior',
  gpa: 3.92,
  annualFamilyIncome: 65000,
  fieldOfStudy: 'Computer Science & AI',
  relevantAchievements: [
    'First-Generation College Student in STEM',
    'Published arXiv preprint on Quantum Error Mitigation',
    'Undergraduate Robotics Lab Researcher',
    'Open-Source Contributor (450+ GitHub Commits)',
    "Dean's Academic Honors List (2024–2026)"
  ],
  role: 'Undergraduate Scholar',
  handle: '@arivera_cs',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  institution: 'Massachusetts Institute of Technology',
  major: 'Artificial Intelligence & Systems',
  profileCompletion: 92,
  totalAwarded: '$47,500',
  activeApplicationsCount: 4,
};

export const defaultStudentProfile: UserProfile = { ...currentUser };
