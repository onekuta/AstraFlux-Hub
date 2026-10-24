import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = '请选择',
  disabled = false,
  className = '',
  dropdownClassName = '',
  width = 'w-36',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // 点击外部自动关闭
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div 
      ref={containerRef} 
      className={`relative inline-block text-left select-none ${width} ${className}`}
    >
      {/* 触发按钮 */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-150 cursor-pointer ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-[var(--text-tertiary)] ml-1.5 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-500' : ''
          }`} 
        />
      </button>

      {/* 下拉悬浮菜单 */}
      {isOpen && !disabled && (
        <div 
          className={`absolute right-0 mt-1.5 w-full min-w-[140px] z-50 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl shadow-black/10 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${dropdownClassName}`}
          style={{ backdropFilter: 'blur(8px)' }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <div className="flex flex-col">
                  <span>{opt.label}</span>
                  {opt.subLabel && (
                    <span className="text-[10px] text-[var(--text-tertiary)] font-normal">{opt.subLabel}</span>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
