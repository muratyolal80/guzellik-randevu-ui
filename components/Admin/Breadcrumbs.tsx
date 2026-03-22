'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <nav className="flex items-center space-x-2 text-slate-400 font-medium text-xs mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <Link 
                href="/admin" 
                className="hover:text-primary transition-colors flex items-center gap-1.5 group"
            >
                <Home className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>Panel</span>
            </Link>
            
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    {item.href ? (
                        <Link 
                            href={item.href} 
                            className="hover:text-primary transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-slate-600 font-bold">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};
