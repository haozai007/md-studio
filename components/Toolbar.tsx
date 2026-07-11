"use client";

import React from "react";

interface ToolbarProps {
  onInsertImage: () => void;
  onCopy: () => void;
  onExport: () => void;
  onReset: () => void;
  copied: boolean;
  isMobile: boolean;
  onToggleMobile: () => void;
  errorCount: number;
  issueCount: number;
  onOpenChecks: () => void;
}

export default function Toolbar({
  onInsertImage,
  onCopy,
  onExport,
  onReset,
  copied,
  isMobile,
  onToggleMobile,
  errorCount,
  issueCount,
  onOpenChecks,
}: ToolbarProps) {
  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-warm-200 bg-white/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold tracking-tight text-ink">
          AI苏坡爱豆
        </span>
        <span className="text-sm text-ink/50 font-medium tracking-wide">
          MD Studio
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onInsertImage}
          className="px-4 py-1.5 text-sm font-medium rounded-md border border-warm-200 text-ink/70 hover:border-ink/20 hover:text-ink transition-colors bg-white"
        >
          插入图片
        </button>
        <button
          onClick={onToggleMobile}
          className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
            isMobile
              ? "bg-ink/5 border-ink/20 text-ink"
              : "border-warm-200 text-ink/50 hover:text-ink/70 hover:border-ink/20"
          }`}
        >
          {isMobile ? "桌面预览" : "手机预览"}
        </button>
        <button
          onClick={onOpenChecks}
          className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
            errorCount
              ? "border-red-200 bg-red-50 text-red-700"
              : issueCount
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {errorCount ? `${errorCount} 项错误` : issueCount ? `${issueCount} 项提醒` : "检查通过"}
        </button>
        <button
          onClick={onCopy}
          className={`px-4 py-1.5 text-sm font-medium rounded-md border transition-all duration-200 ${
            copied
              ? "bg-brand/20 border-brand text-ink"
              : "bg-white border-warm-200 text-ink/70 hover:border-ink/20 hover:text-ink"
          }`}
        >
          {copied ? "已复制 ✓" : "复制公众号 HTML"}
        </button>
        <button
          onClick={onExport}
          className="px-4 py-1.5 text-sm font-medium rounded-md border border-warm-200 text-ink/70 hover:border-ink/20 hover:text-ink transition-colors bg-white"
        >
          导出 HTML
        </button>
        <button
          onClick={onReset}
          className="px-4 py-1.5 text-sm font-medium rounded-md border border-warm-200 text-ink/50 hover:border-ink/20 hover:text-ink transition-colors bg-white"
        >
          重置样式
        </button>
      </div>
    </header>
  );
}
