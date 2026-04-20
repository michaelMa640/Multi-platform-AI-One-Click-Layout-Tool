import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { AppView } from "../../types";

type AppShellProps = {
  children: ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
};

export function AppShell({
  children,
  currentView,
  onNavigate,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar currentView={currentView} onNavigate={onNavigate} />
      <div className="app-main">
        <Topbar currentView={currentView} />
        <main className="page-frame">{children}</main>
      </div>
    </div>
  );
}
