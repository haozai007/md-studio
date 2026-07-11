import React from "react";

interface AppShellProps {
  toolbar: React.ReactNode;
  editor: React.ReactNode;
  preview: React.ReactNode;
  stylePanel: React.ReactNode;
}

export default function AppShell({
  toolbar,
  editor,
  preview,
  stylePanel,
}: AppShellProps) {
  return (
    <div className="h-screen flex flex-col bg-warm-100">
      {toolbar}
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-[320px] shrink-0 border-r border-warm-200 bg-white flex flex-col">
          {editor}
        </aside>
        <main className="flex-1 flex flex-col min-w-0">{preview}</main>
        <aside className="w-[320px] shrink-0 border-l border-warm-200 bg-white flex flex-col">
          {stylePanel}
        </aside>
      </div>
    </div>
  );
}
