import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Shared empty-list state (CLAUDE.md UI standard: no blank lists). */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
      <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <p className="text-base font-bold text-text-main">{title}</p>
      {description && <p className="mt-1 text-sm text-text-secondary max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
