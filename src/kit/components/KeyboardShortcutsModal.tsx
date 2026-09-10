import React from 'react';
import { Keyboard, X } from 'lucide-react';
import type { DeckSection } from '../sections';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Number-key jumps are listed from the deck's actual sections. */
  sections?: DeckSection[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  sections = [],
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '→ or Space', desc: 'Advance to next slide' },
    { key: '←', desc: 'Return to previous slide' },
    ...sections.slice(0, 9).map((section, idx) => ({
      key: String(idx + 1),
      desc: `Jump to Part ${section.number}: ${section.title}`,
    })),
    { key: 'Home / End', desc: 'Jump to first / last slide' },
    { key: 'P', desc: 'Toggle presentation mode' },
    { key: 'Esc', desc: 'Close dialogs & overlays' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-[#F5F2ED] border border-[#1A1A1A]/20 rounded-sm w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white rounded-sm border border-[#1A1A1A]/10">
              <Keyboard className="w-4 h-4 text-[#E67E22]" />
            </div>
            <h2 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-[#4A4A4A] hover:text-[#1A1A1A] bg-white hover:bg-[#E2DDD5] border border-[#1A1A1A]/15 shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 p-2.5 rounded-sm bg-white border border-[#1A1A1A]/10 shadow-xs"
            >
              <span className="text-[#333333] font-medium">{s.desc}</span>
              <kbd className="px-2 py-0.5 bg-[#ECE8E1] text-[#1A1A1A] rounded-sm font-mono font-bold border border-[#1A1A1A]/15 text-[11px] shrink-0">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
