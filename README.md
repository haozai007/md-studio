# MD Studio

一个面向微信公众号创作者的 Markdown 排版工具。左侧编辑 Markdown，中间实时预览，右侧调整主题与排版参数，然后复制富文本 HTML 到公众号编辑器。

## Features

- Markdown 实时预览
- 桌面与 iPhone 风格手机预览
- 多款主题、标题样式和强调样式
- 字号、行距、字间距、字重与颜色调整
- 复制微信公众号富文本 HTML
- 导出独立 HTML 文件

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

## License

[MIT](LICENSE)

