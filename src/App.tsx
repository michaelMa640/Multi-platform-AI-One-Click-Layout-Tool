import { useState } from "react";
import type { JSX } from "react";
import { AppShell } from "./components/layout/AppShell";
import { ExportsPage } from "./pages/ExportsPage";
import { ReviewPage } from "./pages/ReviewPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import type { AppView } from "./types";

const pageMap: Record<AppView, JSX.Element> = {
  workspace: <WorkspacePage />,
  templates: <TemplatesPage />,
  review: <ReviewPage />,
  exports: <ExportsPage />,
  settings: <SettingsPage />,
};

function App() {
  const [view, setView] = useState<AppView>("workspace");

  return (
    <AppShell currentView={view} onNavigate={setView}>
      {pageMap[view]}
    </AppShell>
  );
}

export default App;
