import React from 'react';
import { Sidebar } from './Sidebar';
import { UserProfile } from '../../types';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: UserProfile;
  applicationsCount?: number;
  vaultCount?: number;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

/**
 * MobileNav re-exports the unified responsive Sidebar drawer
 * to prevent duplicate navigation configurations.
 */
export const MobileNav: React.FC<MobileNavProps> = (props) => {
  return <Sidebar {...props} />;
};
