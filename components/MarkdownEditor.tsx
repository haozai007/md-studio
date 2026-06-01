"use client";

import React from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({
  value,
  onChange,
}: MarkdownEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-warm-200 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/40">
          Markdown 编辑
        </span>
      </div>
      <textarea
        className="flex-1 w-full resize-none bg-transparent p-4 text-sm text-ink/80 leading-relaxed focus:outline-none font-mono placeholder:text-ink/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="在此输入 Markdown..."
        spellCheck={false}
      />
    </div>
  );
}
