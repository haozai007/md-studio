import type { ThemeName } from "./themeConfig";

export type ArticleType = "tutorial" | "listicle" | "analysis" | "essay";
export type ArticleTypeChoice = "auto" | ArticleType;
export type Confidence = "low" | "medium" | "high";
export type IssueSeverity = "error" | "warning" | "info";

export interface ArticleHeading {
  id: string;
  level: number;
  text: string;
  line: number;
  isConclusion: boolean;
}

export interface KeywordCandidate {
  id: string;
  phrase: string;
  paragraphIndex: number;
  line: number;
  score: number;
  reason: string;
}

export interface CheckIssue {
  id: string;
  category: "compatibility" | "quality";
  severity: IssueSeverity;
  message: string;
  suggestion?: string;
  line?: number;
}

export interface ThemeRecommendation {
  theme: ThemeName;
  score: number;
  confidence: Confidence;
  reasons: string[];
}

export interface ArticleAnalysis {
  title: string;
  intro: string | null;
  headings: ArticleHeading[];
  toc: ArticleHeading[];
  articleType: ArticleType;
  confidence: Confidence;
  classificationScores: Record<ArticleType, number>;
  classificationReasons: string[];
  recommendation: ThemeRecommendation;
  keywordCandidates: KeywordCandidate[];
  qualityIssues: CheckIssue[];
  stats: {
    characters: number;
    paragraphs: number;
    sections: number;
    listItems: number;
    codeBlocks: number;
    images: number;
    tables: number;
    quotes: number;
  };
}

export interface SmartFormattingSettings {
  enabled: boolean;
  articleType: ArticleTypeChoice;
  numberSections: boolean;
  showIntro: boolean;
  showToc: boolean;
  highlightKeywords: boolean;
  showSignature: boolean;
  authorName: string;
  authorBio: string;
}

export const defaultSmartFormatting: SmartFormattingSettings = {
  enabled: true,
  articleType: "auto",
  numberSections: true,
  showIntro: true,
  showToc: true,
  highlightKeywords: true,
  showSignature: false,
  authorName: "",
  authorBio: "",
};

export const articleTypeLabels: Record<ArticleType, string> = {
  tutorial: "教程/指南",
  listicle: "清单/盘点",
  analysis: "观点/分析",
  essay: "随笔/故事",
};

export const confidenceLabels: Record<Confidence, string> = {
  low: "低",
  medium: "中",
  high: "高",
};
