'use client';

import React, { useState } from 'react';
import { X, Palette, Plus, SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/components/toastProvider';

interface ProductColorSelectorProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
}

export default function ProductColorSelector({ selectedColors, onChange }: ProductColorSelectorProps) {
  const { showToast } = useToast();
  const [dialogColorHex, setDialogColorHex] = useState('#f97316');

  const removeColor = (colorName: string) => {
    onChange(selectedColors.filter(c => c !== colorName));
  };

  const handleColorDialogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hexVal = e.target.value;
    setDialogColorHex(hexVal);
  };

  const handleAddDialogColor = () => {
    const formattedName = `Color ${dialogColorHex.toUpperCase()}`;
    
    if (selectedColors.includes(formattedName)) {
      showToast('Color is already added.', 'info');
      return;
    }

    if (selectedColors.length >= 3) {
      showToast('Maximum 3 colors allowed for frontend variant preview.', 'info');
      return;
    }

    onChange([...selectedColors, formattedName]);
  };

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div>
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="size-4 text-orange-500" />
            Product Colors (Select up to 3)
          </label>
        </div>
    
      </div>

      {/* Select from Color Dialog Picker */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
          <SlidersHorizontal className="size-3.5 text-orange-500" />
          Select From Color Dialog / Picker
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center gap-2 border border-slate-200 rounded-xl p-2 bg-slate-50">
            <input
              type="color"
              value={dialogColorHex}
              onChange={handleColorDialogChange}
              disabled={selectedColors.length >= 3}
              className="w-9 h-9 rounded-lg cursor-pointer border-0 bg-transparent p-0 overflow-hidden disabled:opacity-40"
              title="Click to open color dialog picker"
            />
            <span className="text-xs font-mono font-bold text-slate-700 uppercase pr-1">
              {dialogColorHex}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddDialogColor}
            disabled={selectedColors.length >= 3}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="size-3.5 text-orange-400" />
            Add Selected Color From Dialog
          </button>
        </div>
      </div>

      {/* Selected Colors Preview Cards */}
      {selectedColors.length > 0 && (
        <div className="pt-2 border-t border-slate-200/80 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
            Frontend Variant Preview ({selectedColors.length} active)
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedColors.map((col, idx) => {
              const hexMatch = col.match(/#(?:[0-9a-fA-F]{3}){1,2}/);
              const colorHex = hexMatch ? hexMatch[0] : '#94a3b8';

              return (
                <div
                  key={col}
                  className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs text-xs font-bold text-slate-800"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                    style={{ backgroundColor: colorHex }}
                  />
                  <span>{col}</span>
                  <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeColor(col)}
                    className="p-0.5 text-slate-400 hover:text-red-500 rounded-full transition cursor-pointer ml-1"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
