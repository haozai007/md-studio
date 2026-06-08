"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";

export interface MarkdownEditorHandle {
  insertText: (text: string) => void;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor({ value, onChange }, ref) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        insertText: (text: string) => {
          const textarea = textareaRef.current;
          const start = textarea?.selectionStart ?? value.length;
          const end = textarea?.selectionEnd ?? value.length;
          const nextValue = value.slice(0, start) + text + value.slice(end);

          onChange(nextValue);

          window.requestAnimationFrame(() => {
            textarea?.focus();
            const cursor = start + text.length;
            textarea?.setSelectionRange(cursor, cursor);
          });
        },
      }),
      [onChange, value]
    );

    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-warm-200 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink/40">
            Markdown 编辑
          </span>
        </div>
        <textarea
          ref={textareaRef}
          className="flex-1 w-full resize-none bg-transparent p-4 text-sm text-ink/80 leading-relaxed focus:outline-none font-mono placeholder:text-ink/20"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="在此输入 Markdown..."
          spellCheck={false}
        />
      </div>
    );
  }
);

export default MarkdownEditor;
