'use client';

import React, { useEffect } from 'react';

interface LegalConsentModalProps {
    open: boolean;
    title: string;
    /** Markdown-light text — supports headings (#, ##), tables, bullets, **bold** */
    content: string;
    onClose: () => void;
}

/**
 * Aydınlatma Metni / TEİ İzni gibi yasal metinleri okunaklı bir modal içinde gösterir.
 * - ESC tuşu ile kapanır
 * - Backdrop tıklamasıyla kapanır
 * - İçerik scroll edilebilir, mobile-friendly
 */
export default function LegalConsentModal({ open, title, content, onClose }: LegalConsentModalProps) {
    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white rounded-t-2xl z-10">
                    <h2 className="text-lg sm:text-xl font-black text-text-main truncate pr-2">{title}</h2>
                    <button
                        onClick={onClose}
                        className="shrink-0 size-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-text-secondary hover:text-text-main transition-colors"
                        aria-label="Kapat"
                    >
                        <span className="material-symbols-outlined text-[22px]">close</span>
                    </button>
                </header>

                <div className="overflow-y-auto px-6 py-5 text-sm leading-relaxed text-text-secondary">
                    <FormattedLegalText content={content} />
                </div>

                <footer className="px-6 py-4 border-t border-border bg-gray-50/50 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        Anladım, Kapat
                    </button>
                </footer>
            </div>
        </div>
    );
}

/**
 * Markdown-light renderer.
 * Sadece bizim yasal metnimizdeki sözdizimini destekler:
 * # Ana başlık, ## Alt başlık, **kalın**, listeler (-, ✓, a-i)), tablo (| | |), ---, paragraf.
 */
function FormattedLegalText({ content }: { content: string }) {
    const lines = content.split('\n');
    const blocks: React.ReactElement[] = [];
    let i = 0;
    let key = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Boş satır
        if (!line.trim()) {
            i++;
            continue;
        }

        // Yatay çizgi
        if (line.trim() === '---') {
            blocks.push(<hr key={key++} className="my-4 border-border" />);
            i++;
            continue;
        }

        // Başlıklar
        if (line.startsWith('# ')) {
            blocks.push(
                <h3 key={key++} className="text-lg sm:text-xl font-black text-text-main mt-2 mb-3">
                    {renderInline(line.slice(2))}
                </h3>
            );
            i++;
            continue;
        }
        if (line.startsWith('## ')) {
            blocks.push(
                <h4 key={key++} className="text-base font-bold text-text-main mt-5 mb-2">
                    {renderInline(line.slice(3))}
                </h4>
            );
            i++;
            continue;
        }

        // Tablo: | col | col |
        if (line.trim().startsWith('|')) {
            const tableLines: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                tableLines.push(lines[i]);
                i++;
            }
            if (tableLines.length >= 2) {
                blocks.push(<RenderTable key={key++} rows={tableLines} />);
            }
            continue;
        }

        // Liste maddeleri
        if (/^\s*(-|✓|✗|[a-z]\))\s/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\s*(-|✓|✗|[a-z]\))\s/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*(-|✓|✗|[a-z]\))\s/, ''));
                i++;
            }
            blocks.push(
                <ul key={key++} className="list-disc pl-5 space-y-1.5 my-2">
                    {items.map((it, idx) => (
                        <li key={idx}>{renderInline(it)}</li>
                    ))}
                </ul>
            );
            continue;
        }

        // Numaralı liste
        if (/^\d+\.\s/.test(line.trim())) {
            const items: string[] = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^\d+\.\s/, ''));
                i++;
            }
            blocks.push(
                <ol key={key++} className="list-decimal pl-5 space-y-1.5 my-2">
                    {items.map((it, idx) => (
                        <li key={idx}>{renderInline(it)}</li>
                    ))}
                </ol>
            );
            continue;
        }

        // Normal paragraf
        blocks.push(
            <p key={key++} className="my-2">
                {renderInline(line)}
            </p>
        );
        i++;
    }

    return <>{blocks}</>;
}

/** Inline `**bold**` desteği */
function renderInline(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) {
            return <strong key={i} className="font-bold text-text-main">{p.slice(2, -2)}</strong>;
        }
        return p;
    });
}

function RenderTable({ rows }: { rows: string[] }) {
    // İlk satır header, ikinci satır ayraç (örn |---|---|), kalanı body
    const parsed = rows
        .map(r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
    if (parsed.length < 2) return null;
    const isSeparator = (cells: string[]) => cells.every(c => /^-+$/.test(c.replace(/[\s:]/g, '')));
    let header: string[] = [];
    let body: string[][] = [];
    if (isSeparator(parsed[1])) {
        header = parsed[0];
        body = parsed.slice(2);
    } else {
        body = parsed;
    }

    return (
        <div className="my-3 overflow-x-auto">
            <table className="w-full border border-border rounded-lg text-xs sm:text-sm">
                {header.length > 0 && (
                    <thead className="bg-gray-50">
                        <tr>
                            {header.map((h, i) => (
                                <th key={i} className="px-3 py-2 border-b border-border text-left font-bold text-text-main">
                                    {renderInline(h)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody>
                    {body.map((row, ri) => (
                        <tr key={ri} className="border-b border-border last:border-b-0">
                            {row.map((cell, ci) => (
                                <td key={ci} className="px-3 py-2 align-top">
                                    {renderInline(cell)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
