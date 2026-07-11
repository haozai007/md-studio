"use client";

import React from "react";
import {
  StyleSettings,
  ThemeName,
  BoldStyle,
  applyThemePreset,
} from "@/lib/themeConfig";
import { FontFamily, FontWeight, fontOptions } from "@/lib/fonts";
import { listThemes } from "@/lib/themes/registry";
import { listModuleVariants, themeModuleLabels } from "@/lib/themes/modules";
import type { ThemeModuleName } from "@/lib/themes/types";

interface StylePanelProps {
  settings: StyleSettings;
  onChange: (settings: StyleSettings) => void;
  embedded?: boolean;
}

function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs text-ink/50">{label}</label>
        <span className="text-xs font-medium text-ink/70 tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-warm-200 rounded-full appearance-none cursor-pointer accent-brand
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-ink [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  );
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-ink/50">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-ink/50">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded-md border border-warm-200 cursor-pointer p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
        />
      </div>
    </div>
  );
}

const boldStyleOptions: { value: BoldStyle; label: string }[] = [
  { value: "bold-only", label: "仅加粗" },
  { value: "primary-color", label: "主色文字" },
  { value: "highlight", label: "荧光底纹" },
  { value: "underline", label: "下划线强调" },
];

export default function StylePanel({ settings, onChange, embedded = false }: StylePanelProps) {
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [modulesOpen, setModulesOpen] = React.useState(true);

  const update = (patch: Partial<StyleSettings>) =>
    onChange({ ...settings, ...patch });

  const handleThemeChange = (theme: ThemeName) => {
    onChange(applyThemePreset(settings, theme));
  };

  const updateModuleVariant = (module: ThemeModuleName, variant: string) => {
    update({ moduleVariants: { ...settings.moduleVariants, [module]: variant } });
  };

  return (
    <div className="flex flex-col h-full">
      {!embedded && (
        <div className="px-4 py-3 border-b border-warm-200 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink/40">
            样式设置
          </span>
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Theme selector */}
        <div className="space-y-2">
          <label className="text-xs text-ink/50">主题选择</label>
          <div className="space-y-1.5">
            {listThemes().map(
              (preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleThemeChange(preset.name)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all border ${
                    settings.theme === preset.name
                      ? "border-ink/20 bg-ink/5 text-ink font-medium"
                      : "border-transparent text-ink/50 hover:bg-warm-200/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: preset.primaryColor }}
                    />
                    <span>{preset.label}</span>
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        <hr className="border-warm-200" />

        {/* Theme modules */}
        <div>
          <button
            onClick={() => setModulesOpen(!modulesOpen)}
            className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink/40 hover:text-ink/60 transition-colors"
          >
            <span>版面模块</span>
            <span className="text-xs transition-transform" style={{ transform: modulesOpen ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
          </button>
          {modulesOpen && (
            <div className="mt-4 space-y-3">
              {(Object.keys(themeModuleLabels) as ThemeModuleName[]).map((module) => {
                const theme = listThemes().find((item) => item.name === settings.theme)!;
                const current = settings.moduleVariants[module] || theme.modules[module].variant;
                return (
                  <label key={module} className="block space-y-1.5">
                    <span className="text-xs text-ink/50">{themeModuleLabels[module]}</span>
                    <select
                      value={current}
                      onChange={(event) => updateModuleVariant(module, event.target.value)}
                      className="w-full rounded-md border border-warm-200 bg-white px-2.5 py-2 text-xs text-ink/70 outline-none focus:border-ink/30"
                    >
                      {listModuleVariants(module).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                );
              })}
              {Object.keys(settings.moduleVariants).length > 0 && (
                <button
                  onClick={() => update({ moduleVariants: {} })}
                  className="w-full rounded-md border border-warm-200 px-3 py-2 text-xs text-ink/50 hover:bg-warm-200/50"
                >
                  恢复当前主题默认模块
                </button>
              )}
            </div>
          )}
        </div>

        <hr className="border-warm-200" />

        {/* Colors */}
        <div className="space-y-3">
          <ColorControl
            label="主色"
            value={settings.primaryColor}
            onChange={(v) => update({ primaryColor: v })}
          />
          <ColorControl
            label="背景色"
            value={settings.backgroundColor}
            onChange={(v) => update({ backgroundColor: v })}
          />
          <ColorControl
            label="文字色"
            value={settings.textColor}
            onChange={(v) => update({ textColor: v })}
          />
        </div>

        <hr className="border-warm-200" />

        {/* Font family */}
        <div className="space-y-2">
          <label className="text-xs text-ink/50">正文字体</label>
          <div className="space-y-1.5">
            {(Object.entries(fontOptions) as [FontFamily, typeof fontOptions[FontFamily]][]).map(
              ([key, opt]) => (
                <button
                  key={key}
                  onClick={() => update({ fontFamily: key })}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all border ${
                    settings.fontFamily === key
                      ? "border-ink/20 bg-ink/5 text-ink font-medium"
                      : "border-transparent text-ink/50 hover:bg-warm-200/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt.label}</span>
                    <span className="text-[10px] text-ink/30 font-normal">
                      {opt.categoryLabel}
                    </span>
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        <div className="space-y-4">
          <SliderControl
            label="字间距"
            value={settings.letterSpacing}
            min={0}
            max={2}
            step={0.05}
            unit="px"
            onChange={(v) => update({ letterSpacing: v })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-ink/50">字重</label>
          <div className="flex gap-1.5">
            {(["300", "400"] as FontWeight[]).map((w) => (
              <button
                key={w}
                onClick={() => update({ fontWeight: w })}
                className={`flex-1 px-2.5 py-1.5 rounded-md text-xs transition-all border ${
                  settings.fontWeight === w
                    ? "border-ink/20 bg-ink/5 text-ink font-medium"
                    : "border-transparent text-ink/50 hover:bg-warm-200/50"
                }`}
              >
                {w === "300" ? "Light" : "Regular"}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-warm-200" />

        {/* Bold Style */}
        <div className="space-y-2">
          <label className="text-xs text-ink/50">强调样式</label>
          <div className="grid grid-cols-2 gap-1.5">
            {boldStyleOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update({ boldStyle: opt.value })}
                className={`text-left px-2.5 py-1.5 rounded-md text-xs transition-all border ${
                  settings.boldStyle === opt.value
                    ? "border-ink/20 bg-ink/5 text-ink font-medium"
                    : "border-transparent text-ink/50 hover:bg-warm-200/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-warm-200" />

        {/* Basic sliders */}
        <div className="space-y-4">
          <SliderControl
            label="正文字号"
            value={settings.fontSize}
            min={13}
            max={22}
            unit="px"
            onChange={(v) => update({ fontSize: v })}
          />
          <SliderControl
            label="行距"
            value={settings.lineHeight}
            min={1.3}
            max={2.5}
            step={0.05}
            onChange={(v) => update({ lineHeight: v })}
          />
          <SliderControl
            label="标题字号"
            value={settings.headingFontSize}
            min={18}
            max={36}
            unit="px"
            onChange={(v) => update({ headingFontSize: v })}
          />
          <SliderControl
            label="圆角"
            value={settings.borderRadius}
            min={0}
            max={24}
            unit="px"
            onChange={(v) => update({ borderRadius: v })}
          />
          <SliderControl
            label="内容宽度"
            value={settings.contentWidth}
            min={360}
            max={720}
            step={10}
            unit="px"
            onChange={(v) => update({ contentWidth: v })}
          />
        </div>

        <hr className="border-warm-200" />

        {/* Advanced: reading rhythm */}
        <div>
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink/40 hover:text-ink/60 transition-colors"
          >
            <span>高级设置</span>
            <span className="text-xs transition-transform" style={{ transform: advancedOpen ? "rotate(90deg)" : "rotate(0deg)" }}>
              ›
            </span>
          </button>
          {advancedOpen && (
            <div className="mt-4 space-y-4">
              <SliderControl
                label="段落间距"
                value={settings.paragraphSpacing}
                min={0.2}
                max={2.0}
                step={0.05}
                unit="em"
                onChange={(v) => update({ paragraphSpacing: v })}
              />
              <SliderControl
                label="章节间距"
                value={settings.sectionSpacing}
                min={0.5}
                max={3.5}
                step={0.1}
                unit="em"
                onChange={(v) => update({ sectionSpacing: v })}
              />
              <SliderControl
                label="列表缩进"
                value={settings.listIndent}
                min={0.5}
                max={2.5}
                step={0.05}
                unit="em"
                onChange={(v) => update({ listIndent: v })}
              />
              <SliderControl
                label="列表项间距"
                value={settings.listItemSpacing}
                min={0}
                max={0.8}
                step={0.05}
                unit="em"
                onChange={(v) => update({ listItemSpacing: v })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
