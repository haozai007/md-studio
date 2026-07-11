# MD Studio

一个面向微信公众号创作者的 Markdown 排版工具。左侧编辑 Markdown，中间实时预览，右侧调整主题与排版参数，然后复制富文本 HTML 到公众号编辑器。

## 更新说明

- 2026-07-12 — 新增主题注册表、四套详细版面模块、主题级渲染器，以及可在样式面板中跨主题混搭的标题、导读、目录、H2、引用、图片和作者区模块。

## Features

- Markdown 实时预览
- 桌面与 iPhone 风格手机预览
- 多款主题、标题样式和强调样式
- 字号、行距、字间距、字重与颜色调整
- 复制微信公众号富文本 HTML
- 导出独立 HTML 文件
- 自动识别教程、清单、观点分析与随笔文章
- 智能推荐主题、生成引言卡、精选目录和章节编号
- 关键词建议逐项采用，不改写原始 Markdown
- 公众号兼容性与排版质量实时检查
- 安全 HTML 渲染、URL 白名单与复制前阻断

## 排版管线

预览、检查、复制与导出共用同一份编译结果：

```text
Markdown → 文章结构分析 → 智能排版计划 → 微信组件渲染 → 安全校验
```

- 原始 HTML 默认作为普通文字转义，不会直接执行。
- 代码块按行转换为公众号稳定组件，不依赖 `<pre>`。
- 图片使用移动端自适应样式，并过滤危险地址。
- 文字节点使用 `<span leaf="">` 包裹，降低粘贴后样式丢失的风险。
- 兼容性错误会阻止复制和导出；排版质量建议不会阻止操作。

## Getting Started

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## Build

```bash
npm run build
npm run start
```

## Notes

- 复制功能需要 HTTPS 或 localhost 环境。
- 微信公众号编辑器可能过滤部分 HTML 与 CSS，最终效果以公众号后台预览为准。
- 字体使用系统字体栈。不同设备可能自动降级为可用字体。

## Update Notes

- 2026-07-11 — Upgraded MD Studio with smart article analysis, theme recommendations, WeChat-compatible rendering, keyword suggestions, author blocks, and live quality/compatibility checks.

## License

[MIT](LICENSE)
