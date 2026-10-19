import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';

/**
 * 内联数字参数编辑胶囊 (100% 对齐截图 2 media_1791918862206_a808dbc8.png)
 *
 * 交互：
 *   1. 默认展示为带单位的数值胶囊 + 微型铅笔图标；
 *   2. 点击后原地切换为蓝色边框聚焦输入框，自动全选文本；
 *   3. 支持直接键盘键入数字；
 *   4. 按 Enter 或失去焦点 (onBlur) 提交，自动 clamp 在 [min, max] 范围；
 *   5. 按 ESC 键取消并恢复原值。
 */
export default function InlineNumberBadge({
  value = 0,
  onChange,
  min = 0.001,
  max = 2.0,
  precision = 3,
  unit = 'mm',
  disabled = false,
  badgeClass = 'text-emerald-600 bg-emerald-50 border-emerald-200',
  title = '点击直接输入数字设定参数',
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const formatVal = (v) => Number(v).toFixed(precision);

  const startEdit = (e) => {
    if (disabled) return;
    e.stopPropagation();
    setText(formatVal(value));
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commit = () => {
    setIsEditing(false);
    const parsed = parseFloat(text);
    if (isNaN(parsed)) return;

    // 进行上下限 clamp 约束
    const clamped = Math.min(max, Math.max(min, parsed));
    const rounded = Number(clamped.toFixed(precision));
    if (onChange && rounded !== value) {
      onChange(rounded);
    }
  };

  const cancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div 
        className="inline-flex items-center space-x-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commit();
            } else if (e.key === 'Escape') {
              cancel();
            }
          }}
          onBlur={commit}
          className="w-16 px-1.5 py-0.5 text-xs font-mono text-center font-bold text-[var(--text-primary)] bg-white dark:bg-zinc-800 border-2 border-blue-400 dark:border-blue-500 rounded-md shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
        />
        <span className="text-[11px] font-mono text-[var(--text-tertiary)]">{unit}</span>
      </div>
    );
  }

  return (
    <div
      onClick={startEdit}
      title={disabled ? '请先开启快速触发 (RT)' : title}
      className={`group inline-flex items-center space-x-1 px-2 py-0.5 rounded border font-mono text-xs font-bold select-none shrink-0 transition ${
        disabled
          ? 'opacity-40 cursor-not-allowed border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-[var(--text-disabled)]'
          : `cursor-pointer hover:border-blue-400 hover:shadow-2xs ${badgeClass}`
      }`}
    >
      <span>{formatVal(value)} {unit}</span>
      {!disabled && (
        <Pencil className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 group-hover:text-blue-500 transition shrink-0" />
      )}
    </div>
  );
}
