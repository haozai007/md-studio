"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";

export interface MarkdownEditorHandle {
  insertText: (text: string) => void;
  scrollToSourceLine: (line: number) => void;
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
        scrollToSourceLine: (line: number) => {
          const textarea = textareaRef.current;
          if (!textarea) return;

          let lineStart = 0;
          for (let currentLine = 1; currentLine < line; currentLine++) {
            const newline = value.indexOf("\n", lineStart);
            if (newline < 0) {
              lineStart = value.length;
              break;
            }
            lineStart = newline + 1;
          }

          const styles = window.getComputedStyle(textarea);
          const mirror = document.createElement("div");
          Object.assign(mirror.style, {
            position: "fixed",
            visibility: "hidden",
            pointerEvents: "none",
            left: "-10000px",
            top: "0",
            boxSizing: styles.boxSizing,
            width: `${textarea.offsetWidth}px`,
            padding: styles.padding,
            border: styles.border,
            font: styles.font,
            letterSpacing: styles.letterSpacing,
            lineHeight: styles.lineHeight,
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            wordBreak: styles.wordBreak,
          });
          mirror.appendChild(document.createTextNode(value.slice(0, lineStart)));
          const marker = document.createElement("span");
          marker.textContent = "\u200b";
          mirror.appendChild(marker);
          document.body.appendChild(mirror);

          const maxScroll = Math.max(0, textarea.scrollHeight - textarea.clientHeight);
          const targetScroll = Math.max(
            0,
            Math.min(maxScroll, marker.offsetTop - textarea.clientHeight * 0.2)
          );
          textarea.scrollTop = targetScroll;
          document.body.removeChild(mirror);
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
