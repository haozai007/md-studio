import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI苏坡爱豆 MD Studio",
  description: "Markdown 转公众号排版预览器",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
