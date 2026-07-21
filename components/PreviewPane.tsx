"use client";

import React, { useRef, useState, useEffect, forwardRef, useCallback } from "react";
import { RenderResult } from "@/lib/renderMarkdown";
import { StyleSettings } from "@/lib/themeConfig";

interface PreviewPaneProps {
  result: RenderResult;
  settings: StyleSettings;
  isMobile: boolean;
  onToggleMobile: () => void;
  onVisibleSourceLineChange?: (line: number) => void;
}

/* ─── Inline SVG icons for status bar ─── */

function SignalBars() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" className="fill-white/90">
      <rect x="0" y="6" width="2.5" height="4" rx="0.5" />
      <rect x="4" y="4" width="2.5" height="6" rx="0.5" />
      <rect x="8" y="2" width="2.5" height="8" rx="0.5" />
      <rect x="12" y="0" width="2.5" height="10" rx="0.5" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" className="fill-none">
      <circle cx="7" cy="8.5" r="1.5" fill="white" className="fill-white/90" />
      <path d="M4.5 6.5a3.5 3.5 0 0 1 5 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" className="stroke-white/90" />
      <path d="M2 4a7 7 0 0 1 10 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" className="stroke-white/90" />
      <path d="M0 1.5a10 10 0 0 1 14 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" className="stroke-white/90" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="22" height="10" viewBox="0 0 22 10" className="fill-none">
      <rect x="0" y="0" width="19" height="10" rx="2.5" stroke="white" strokeWidth="1" className="stroke-white/80" />
      <rect x="2" y="2" width="14" height="6" rx="1" fill="white" className="fill-white/80" />
      <rect x="20" y="3" width="2" height="4" rx="1" fill="white" className="fill-white/80" />
    </svg>
  );
}

/* ─── Side button decorations ─── */

function SideButtons() {
  const btnBase =
    "absolute w-[3px] pointer-events-none";
  const gradientLeft = {
    background: "linear-gradient(to right, #555 0%, #3a3a3c 40%, #2a2a2c 100%)",
  };
  const gradientRight = {
    background: "linear-gradient(to left, #555 0%, #3a3a3c 40%, #2a2a2c 100%)",
  };
  return (
    <>
      {/* Left: mute switch */}
      <div
        className={`${btnBase} -left-[3px] top-[130px] h-[22px] rounded-l-sm`}
        style={gradientLeft}
      />
      {/* Left: volume up */}
      <div
        className={`${btnBase} -left-[3px] top-[168px] h-[36px] rounded-l-md`}
        style={gradientLeft}
      />
      {/* Left: volume down */}
      <div
        className={`${btnBase} -left-[3px] top-[214px] h-[36px] rounded-l-md`}
        style={gradientLeft}
      />
      {/* Right: power / side button */}
      <div
        className={`${btnBase} -right-[3px] top-[168px] h-[48px] rounded-r-md`}
        style={gradientRight}
      />
    </>
  );
}

/* ─── Main component ─── */

const SCREEN_W = 375;
const SCREEN_H = 812;
const FRAME_PADDING = 8;
const FRAME_W = SCREEN_W + FRAME_PADDING * 2; // 391

const PreviewPane = forwardRef<HTMLDivElement, PreviewPaneProps>(
  function PreviewPane({ result, settings, isMobile, onToggleMobile, onVisibleSourceLineChange }, ref) {
    const html = result.html;

    const scalerParentRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const scrollFrameRef = useRef<number | null>(null);
    const lastSourceLineRef = useRef<number | null>(null);
    const [phoneScale, setPhoneScale] = useState(1);

    const setContentRef = useCallback(
      (node: HTMLDivElement | null) => {
        contentRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const syncEditorToPreview = useCallback(
      (scrollContainer: HTMLDivElement) => {
        if (scrollFrameRef.current !== null) return;
        scrollFrameRef.current = window.requestAnimationFrame(() => {
          scrollFrameRef.current = null;
          const root = contentRef.current;
          if (!root) return;
          const markers = root.querySelectorAll<HTMLElement>("[data-source-line]");
          if (!markers.length) return;

          const containerRect = scrollContainer.getBoundingClientRect();
          const probeY = containerRect.top + containerRect.height * 0.22;
          let active = markers[0];
          for (let index = 0; index < markers.length; index++) {
            const marker = markers[index];
            if (marker.getBoundingClientRect().top <= probeY) active = marker;
            else break;
          }

          const line = Number(active.dataset.sourceLine);
          if (!Number.isFinite(line) || line === lastSourceLineRef.current) return;
          lastSourceLineRef.current = line;
          onVisibleSourceLineChange?.(line);
        });
      },
      [onVisibleSourceLineChange]
    );

    useEffect(() => {
      if (!isMobile) return;
      const el = scalerParentRef.current;
      if (!el) return;
      const observer = new ResizeObserver(([entry]) => {
        const w = entry.contentRect.width;
        // Reserve 48px for p-6 horizontal padding
        setPhoneScale(Math.min(1, (w - 48) / FRAME_W));
      });
      observer.observe(el);
      return () => observer.disconnect();
    }, [isMobile]);

    useEffect(() => {
      return () => {
        if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
      };
    }, []);

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-warm-200 shrink-0 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink/40">
            公众号预览
          </span>
          <button
            onClick={onToggleMobile}
            className={`text-xs font-medium px-3 py-1 rounded-md border transition-colors ${
              isMobile
                ? "bg-ink/5 border-ink/20 text-ink"
                : "border-warm-200 text-ink/40 hover:text-ink/60"
            }`}
          >
            {isMobile ? "桌面预览" : "手机预览"}
          </button>
        </div>

        {/* Content */}
        <div
          ref={scalerParentRef}
          onScroll={(event) => {
            if (!isMobile) syncEditorToPreview(event.currentTarget);
          }}
          className="flex-1 overflow-auto bg-[#E8E8E0] p-6 flex justify-center items-start"
        >
          {!result.validation.valid ? (
            <div className="w-full max-w-xl rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800">
              <p className="font-semibold mb-2">预览已被安全检查阻止</p>
              <p className="text-red-700/80">
                {result.validation.errors[0]?.message || "生成内容包含不安全 HTML。"}
              </p>
            </div>
          ) : isMobile ? (
            <div
              className="shrink-0"
              style={{
                transform: `scale(${phoneScale})`,
                transformOrigin: "top center",
                marginBottom: phoneScale < 1 ? `${(phoneScale - 1) * SCREEN_H}px` : undefined,
                transition: "transform 0.15s ease-out",
              }}
            >
              {/* ── Outer frame ── */}
              <div
                className="relative"
                style={{
                  width: FRAME_W,
                  padding: FRAME_PADDING,
                  borderRadius: 52,
                  background:
                    "linear-gradient(160deg, #3d3d40 0%, #2a2a2c 25%, #1c1c1e 50%, #2a2a2c 75%, #3d3d40 100%)",
                  boxShadow:
                    "0 0 0 0.5px rgba(255,255,255,0.08) inset, 0 0 0 1px rgba(0,0,0,0.4), 0 25px 70px rgba(0,0,0,0.45)",
                }}
              >
                <SideButtons />

                {/* ── Screen ── */}
                <div
                  className="relative bg-black overflow-hidden"
                  style={{
                    width: SCREEN_W,
                    height: SCREEN_H,
                    borderRadius: 44,
                  }}
                >
                  {/* ── Dynamic Island ── */}
                  <div
                    className="absolute top-[10px] left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none"
                    style={{
                      width: 100,
                      height: 28,
                      borderRadius: 20,
                      background: "#0a0a0a",
                      boxShadow: "0 0 0 0.5px rgba(255,255,255,0.08) inset",
                    }}
                  />

                  {/* ── Status bar ── */}
                  <div className="h-[54px] bg-black flex items-end justify-between px-6 pb-2 pointer-events-none select-none relative z-10">
                    <span className="text-white/85 text-[13px] font-semibold tracking-tight leading-none ml-1">
                      9:41
                    </span>
                    <div className="flex items-center gap-1.5 mr-1">
                      <SignalBars />
                      <WifiIcon />
                      <BatteryIcon />
                    </div>
                  </div>

                  {/* ── Scrollable content ── */}
                  <div
                    className="overflow-auto [&::-webkit-scrollbar]:hidden"
                    onScroll={(event) => syncEditorToPreview(event.currentTarget)}
                    style={{
                      height: SCREEN_H - 54,
                      scrollbarWidth: "none",
                    }}
                  >
                    <div
                      ref={setContentRef}
                      className="mx-auto"
                      style={{
                        maxWidth: `${settings.contentWidth}px`,
                        padding: "8px 0 20px 0",
                      }}
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  </div>

                  {/* ── Home Indicator ── */}
                  <div
                    className="absolute bottom-[7px] left-1/2 -translate-x-1/2 pointer-events-none select-none z-20"
                    style={{
                      width: 120,
                      height: 4,
                      borderRadius: 3,
                      background: "rgba(255,255,255,0.35)",
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Desktop preview */
            <div
              ref={setContentRef}
              className="bg-white shadow-sm mx-auto"
              style={{ maxWidth: `${settings.contentWidth}px` }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </div>
    );
  }
);

export default PreviewPane;
