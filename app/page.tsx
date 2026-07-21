"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import AppShell from "@/components/AppShell";
import Toolbar from "@/components/Toolbar";
import MarkdownEditor, { MarkdownEditorHandle } from "@/components/MarkdownEditor";
import PreviewPane from "@/components/PreviewPane";
import InspectorPanel, { InspectorTab } from "@/components/InspectorPanel";
import { StyleSettings, applyThemePreset, getDefaultSettings } from "@/lib/themeConfig";
import { compileWechatArticle, wrapExportHTML } from "@/lib/renderMarkdown";
import { analyzeArticle } from "@/lib/articleAnalysis";
import { defaultSmartFormatting, SmartFormattingSettings } from "@/lib/articleTypes";

const defaultMarkdown = `# AI苏坡爱豆 MD Studio

欢迎使用 **MD Studio**，一款专为公众号创作者打造的 Markdown 排版工具。

## 为什么选择 MD Studio？

写公众号最头疼的就是**排版**。MD Studio 让你专注于内容创作，排版交给我们。

### 核心特性

- **实时预览**：左侧书写，中间即时查看效果
- **多款主题**：一键切换苏坡极简、AI项目风、设计案例风
- **一键复制**：复制后直接粘贴到公众号编辑器
- **样式定制**：主色、字号、行距、圆角随心调

---

## 引用与思考

> 好的工具应该像空气一样，让你感受不到它的存在，却又离不开它。
>
> — *MD Studio 团队*

行内代码示例：使用 \`markdown-it\` 解析 Markdown，\`Tailwind CSS\` 负责整体样式。

### 代码块示例

\`\`\`javascript
function greet(name) {
  return \`你好，\${name}！欢迎使用 MD Studio。\`;
}

const config = {
  theme: "supo-minimal",
  primaryColor: "#A8FF2F",
  fontSize: 15,
};

console.log(greet("创作者"));
\`\`\`

---

## 图文排版

公众号文章的**图片**和**文字**搭配非常重要。一张好图能让文章增色不少：

![创意工作空间](https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800)

图片下方可以添加*说明文字*，帮助读者理解图片内容。

---

## 结构化写作

### 写作流程

1. 确定主题和受众
2. 收集素材和参考资料
3. 撰写初稿
4. 使用 MD Studio 排版
5. 预览并调整样式细节
6. 一键复制到公众号后台

### 推荐工具链

- **MD Studio** — Markdown 排版利器
- **Notion** — 灵感收集与大纲
- **Unsplash** — 高质量免费图片
- **Excalidraw** — 手绘风格图表
- **DeepL** — 翻译润色助手

---

## 结语

> 写作出品，排版无忧。

开始你的创作之旅吧 🚀
`;

export default function Home() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [settings, setSettings] = useState<StyleSettings>(getDefaultSettings());
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [smartSettings, setSmartSettings] = useState<SmartFormattingSettings>(defaultSmartFormatting);
  const [acceptedKeywordIds, setAcceptedKeywordIds] = useState<Set<string>>(() => new Set());
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("smart");
  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MarkdownEditorHandle>(null);

  const analysis = useMemo(() => analyzeArticle(markdown), [markdown]);
  const activeKeywordIds = useMemo(
    () => analysis.keywordCandidates.filter((item) => acceptedKeywordIds.has(item.id)).map((item) => item.id),
    [acceptedKeywordIds, analysis.keywordCandidates]
  );
  const renderResult = useMemo(
    () =>
      compileWechatArticle(markdown, settings, "export", {
        smart: smartSettings,
        analysis,
        acceptedKeywordIds: activeKeywordIds,
      }),
    [activeKeywordIds, analysis, markdown, settings, smartSettings]
  );
  const previewResult = useMemo(
    () =>
      compileWechatArticle(markdown, settings, "preview", {
        smart: smartSettings,
        analysis,
        acceptedKeywordIds: activeKeywordIds,
        includeSourceMap: true,
      }),
    [activeKeywordIds, analysis, markdown, settings, smartSettings]
  );

  const handleCopy = useCallback(async () => {
    if (!renderResult.validation.valid) {
      setInspectorTab("checks");
      window.alert(renderResult.validation.errors[0]?.message || "公众号兼容检查未通过，暂未复制。");
      return;
    }
    const html = renderResult.html;
    const plainText = renderResult.plainText;
    try {
      const clipboardItem = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plainText], { type: "text/plain" }),
      });
      await navigator.clipboard.write([clipboardItem]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support ClipboardItem
      const container = document.createElement("div");
      container.innerHTML = html;
      container.style.position = "fixed";
      container.style.left = "-9999px";
      document.body.appendChild(container);
      const range = document.createRange();
      range.selectNodeContents(container);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      document.execCommand("copy");
      selection?.removeAllRanges();
      document.body.removeChild(container);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [renderResult]);

  const handleExport = useCallback(() => {
    if (!renderResult.validation.valid) {
      setInspectorTab("checks");
      window.alert(renderResult.validation.errors[0]?.message || "公众号兼容检查未通过，暂未导出。");
      return;
    }
    const fullHTML = wrapExportHTML(renderResult.html, settings);
    const blob = new Blob([fullHTML], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "md-studio-export.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [renderResult, settings]);

  const handleReset = useCallback(() => {
    setSettings(getDefaultSettings());
  }, []);

  const handleInsertImage = useCallback(() => {
    const url = window.prompt("请输入图片 URL（https://...）");
    if (!url?.trim()) return;

    const alt = window.prompt("请输入图片描述（可选）") || "";
    const imageMarkdown = `![${alt.trim()}](${url.trim()})`;
    editorRef.current?.insertText(`\n\n${imageMarkdown}\n\n`);
  }, []);

  const handleKeywordToggle = useCallback((id: string, accepted: boolean) => {
    setAcceptedKeywordIds((current) => {
      const next = new Set(current);
      if (accepted) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSetAllKeywords = useCallback(
    (accepted: boolean) => {
      setAcceptedKeywordIds(accepted ? new Set(analysis.keywordCandidates.map((item) => item.id)) : new Set());
    },
    [analysis.keywordCandidates]
  );

  const handleApplyRecommendedTheme = useCallback(() => {
    setSettings((current) => applyThemePreset(current, analysis.recommendation.theme));
  }, [analysis.recommendation.theme]);

  const totalIssues = renderResult.validation.issues.length + analysis.qualityIssues.length;

  return (
    <AppShell
      toolbar={
        <Toolbar
          onInsertImage={handleInsertImage}
          onCopy={handleCopy}
          onExport={handleExport}
          onReset={handleReset}
          copied={copied}
          isMobile={isMobile}
          onToggleMobile={() => setIsMobile(!isMobile)}
          errorCount={renderResult.validation.errors.length}
          issueCount={totalIssues}
          onOpenChecks={() => setInspectorTab("checks")}
        />
      }
      editor={
        <MarkdownEditor
          ref={editorRef}
          value={markdown}
          onChange={setMarkdown}
        />
      }
      preview={
        <PreviewPane
          ref={previewRef}
          result={previewResult}
          settings={settings}
          isMobile={isMobile}
          onToggleMobile={() => setIsMobile(!isMobile)}
          onVisibleSourceLineChange={(line) => editorRef.current?.scrollToSourceLine(line)}
        />
      }
      stylePanel={
        <InspectorPanel
          activeTab={inspectorTab}
          onTabChange={setInspectorTab}
          analysis={analysis}
          validation={renderResult.validation}
          smart={smartSettings}
          onSmartChange={setSmartSettings}
          settings={settings}
          onSettingsChange={setSettings}
          acceptedKeywordIds={acceptedKeywordIds}
          onKeywordToggle={handleKeywordToggle}
          onSetAllKeywords={handleSetAllKeywords}
          onApplyRecommendedTheme={handleApplyRecommendedTheme}
        />
      }
    />
  );
}
