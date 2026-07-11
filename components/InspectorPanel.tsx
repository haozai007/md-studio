"use client";

import React from "react";
import {
  ArticleAnalysis,
  articleTypeLabels,
  confidenceLabels,
  SmartFormattingSettings,
} from "@/lib/articleTypes";
import { StyleSettings, themePresets } from "@/lib/themeConfig";
import { ValidationReport } from "@/lib/wechatValidator";
import StylePanel from "./StylePanel";

export type InspectorTab = "smart" | "style" | "checks";

interface InspectorPanelProps {
  activeTab: InspectorTab;
  onTabChange: (tab: InspectorTab) => void;
  analysis: ArticleAnalysis;
  validation: ValidationReport;
  smart: SmartFormattingSettings;
  onSmartChange: (settings: SmartFormattingSettings) => void;
  settings: StyleSettings;
  onSettingsChange: (settings: StyleSettings) => void;
  acceptedKeywordIds: Set<string>;
  onKeywordToggle: (id: string, accepted: boolean) => void;
  onSetAllKeywords: (accepted: boolean) => void;
  onApplyRecommendedTheme: () => void;
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-start justify-between gap-3 ${disabled ? "opacity-45" : "cursor-pointer"}`}>
      <span>
        <span className="block text-sm text-ink/75">{label}</span>
        {description && <span className="block mt-0.5 text-[11px] leading-relaxed text-ink/35">{description}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 accent-ink"
      />
    </label>
  );
}

function SmartTab({
  analysis,
  smart,
  onSmartChange,
  settings,
  acceptedKeywordIds,
  onKeywordToggle,
  onSetAllKeywords,
  onApplyRecommendedTheme,
}: Omit<InspectorPanelProps, "activeTab" | "onTabChange" | "validation" | "onSettingsChange">) {
  const update = (patch: Partial<SmartFormattingSettings>) => onSmartChange({ ...smart, ...patch });
  const recommended = themePresets[analysis.recommendation.theme];
  const acceptedCount = analysis.keywordCandidates.filter((item) => acceptedKeywordIds.has(item.id)).length;

  return (
    <div className="p-4 space-y-5">
      <section className="rounded-lg border border-warm-200 bg-warm-100/60 p-3">
        <Toggle
          label="自动排版"
          description="只改变预览和导出，不修改左侧 Markdown"
          checked={smart.enabled}
          onChange={(enabled) => update({ enabled })}
        />
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/40">文章类型</h3>
          <span className="text-[10px] rounded-full bg-ink/5 px-2 py-0.5 text-ink/45">
            置信度 {confidenceLabels[analysis.confidence]}
          </span>
        </div>
        <select
          value={smart.articleType}
          onChange={(event) => update({ articleType: event.target.value as SmartFormattingSettings["articleType"] })}
          disabled={!smart.enabled}
          className="w-full rounded-md border border-warm-200 bg-white px-3 py-2 text-sm text-ink/70 outline-none focus:border-ink/30"
        >
          <option value="auto">自动（{articleTypeLabels[analysis.articleType]}）</option>
          {Object.entries(articleTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <p className="text-[11px] leading-relaxed text-ink/35">
          {analysis.classificationReasons.join("；")}
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/40">推荐主题</h3>
        <div className="rounded-lg border border-warm-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: recommended.primaryColor }} />
            <span className="text-sm font-medium text-ink/75">{recommended.label}</span>
            <span className="ml-auto text-[10px] text-ink/35">匹配 {analysis.recommendation.score}</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink/35">
            {analysis.recommendation.reasons.join("；")}
          </p>
          <button
            onClick={onApplyRecommendedTheme}
            disabled={settings.theme === analysis.recommendation.theme}
            className="mt-3 w-full rounded-md border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/65 transition-colors hover:bg-ink/5 disabled:cursor-default disabled:opacity-40"
          >
            {settings.theme === analysis.recommendation.theme ? "正在使用" : "应用推荐主题"}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/40">结构增强</h3>
        <Toggle label="章节自动编号" checked={smart.numberSections} onChange={(numberSections) => update({ numberSections })} disabled={!smart.enabled} />
        <Toggle
          label="开头引言卡"
          description={analysis.intro ? "已识别开头引用" : "未识别到开头引用"}
          checked={smart.showIntro}
          onChange={(showIntro) => update({ showIntro })}
          disabled={!smart.enabled || !analysis.intro}
        />
        <Toggle
          label="精选目录"
          description={`已选 ${analysis.toc.length} 个核心章节`}
          checked={smart.showToc}
          onChange={(showToc) => update({ showToc })}
          disabled={!smart.enabled || analysis.toc.length === 0}
        />
        <Toggle
          label="关键词下划线"
          description="仅应用已采用的关键词建议"
          checked={smart.highlightKeywords}
          onChange={(highlightKeywords) => update({ highlightKeywords })}
          disabled={!smart.enabled}
        />
        <Toggle label="文章末尾作者区" checked={smart.showSignature} onChange={(showSignature) => update({ showSignature })} disabled={!smart.enabled} />
        {smart.showSignature && (
          <div className="space-y-2 pl-2">
            <input
              value={smart.authorName}
              onChange={(event) => update({ authorName: event.target.value })}
              placeholder="作者名"
              className="w-full rounded-md border border-warm-200 px-3 py-2 text-xs outline-none focus:border-ink/30"
            />
            <input
              value={smart.authorBio}
              onChange={(event) => update({ authorBio: event.target.value })}
              placeholder="一句话简介"
              className="w-full rounded-md border border-warm-200 px-3 py-2 text-xs outline-none focus:border-ink/30"
            />
          </div>
        )}
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/40">关键词建议</h3>
          <span className="text-[10px] text-ink/35">已采用 {acceptedCount}/{analysis.keywordCandidates.length}</span>
        </div>
        {analysis.keywordCandidates.length ? (
          <>
            <div className="flex gap-2 text-[11px]">
              <button onClick={() => onSetAllKeywords(true)} className="text-ink/55 hover:text-ink">全部采用</button>
              <span className="text-ink/20">·</span>
              <button onClick={() => onSetAllKeywords(false)} className="text-ink/55 hover:text-ink">全部忽略</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.keywordCandidates.slice(0, 18).map((candidate) => {
                const accepted = acceptedKeywordIds.has(candidate.id);
                return (
                  <button
                    key={candidate.id}
                    title={`${candidate.reason} · 第 ${candidate.line} 行`}
                    onClick={() => onKeywordToggle(candidate.id, !accepted)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                      accepted
                        ? "border-ink/20 bg-ink/5 text-ink/70"
                        : "border-warm-200 bg-white text-ink/30 line-through"
                    }`}
                  >
                    {candidate.phrase}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-xs text-ink/35">暂未找到足够明确的关键词，不会为了数量强行标记。</p>
        )}
      </section>
    </div>
  );
}

function ChecksTab({ analysis, validation }: Pick<InspectorPanelProps, "analysis" | "validation">) {
  const issues = [...validation.issues, ...analysis.qualityIssues];
  const errors = issues.filter((issue) => issue.severity === "error").length;
  const warnings = issues.filter((issue) => issue.severity === "warning").length;
  return (
    <div className="p-4 space-y-4">
      <section className={`rounded-lg border p-3 ${errors ? "border-red-200 bg-red-50" : warnings ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
        <p className="text-sm font-medium text-ink/75">
          {errors ? `${errors} 项错误阻止复制` : warnings ? `${warnings} 项建议检查` : "公众号兼容检查通过"}
        </p>
        <p className="mt-1 text-[11px] text-ink/40">
          {validation.stats.leafCount} 个文字节点已使用 leaf 兼容包裹
        </p>
      </section>

      {issues.length === 0 ? (
        <p className="py-8 text-center text-xs text-ink/35">没有发现兼容性或排版质量问题。</p>
      ) : (
        <div className="space-y-2">
          {issues.map((issue) => (
            <article key={issue.id} className="rounded-md border border-warm-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  issue.severity === "error"
                    ? "bg-red-100 text-red-700"
                    : issue.severity === "warning"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-sky-100 text-sky-700"
                }`}>
                  {issue.severity === "error" ? "错误" : issue.severity === "warning" ? "提醒" : "建议"}
                </span>
                <span className="text-[10px] text-ink/30">{issue.category === "compatibility" ? "公众号兼容" : "排版质量"}</span>
                {issue.line && <span className="ml-auto text-[10px] text-ink/30">第 {issue.line} 行</span>}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink/70">{issue.message}</p>
              {issue.suggestion && <p className="mt-1 text-[11px] leading-relaxed text-ink/35">{issue.suggestion}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InspectorPanel(props: InspectorPanelProps) {
  const issueCount = props.validation.issues.length + props.analysis.qualityIssues.length;
  const tabs: { id: InspectorTab; label: string }[] = [
    { id: "smart", label: "智能排版" },
    { id: "style", label: "样式" },
    { id: "checks", label: `检查${issueCount ? ` ${issueCount}` : ""}` },
  ];
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-warm-200 px-3 pt-3">
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink/40">排版助手</span>
          <span className={`h-2 w-2 rounded-full ${props.smart.enabled ? "bg-emerald-500" : "bg-ink/20"}`} />
        </div>
        <div className="grid grid-cols-3 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => props.onTabChange(tab.id)}
              className={`border-b-2 px-1 pb-2 text-xs transition-colors ${
                props.activeTab === tab.id ? "border-ink text-ink/80" : "border-transparent text-ink/35 hover:text-ink/55"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {props.activeTab === "smart" && <SmartTab {...props} />}
        {props.activeTab === "style" && <StylePanel embedded settings={props.settings} onChange={props.onSettingsChange} />}
        {props.activeTab === "checks" && <ChecksTab analysis={props.analysis} validation={props.validation} />}
      </div>
    </div>
  );
}
