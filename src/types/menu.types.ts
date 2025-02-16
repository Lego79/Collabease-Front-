// src/types/menu.types.ts
import { ReactNode } from 'react';

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  path: string;
  subItems?: MenuItem[];
  isExpanded?: boolean;
}