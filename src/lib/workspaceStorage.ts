import { createInitialWorkspaceState } from "../data/seed";
import type { PersistedWorkspace, WorkspaceState } from "../types";

const STORAGE_KEY = "wechat-layout-tool/workspace";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadWorkspaceState(): WorkspaceState {
  if (!canUseStorage()) {
    return createInitialWorkspaceState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return createInitialWorkspaceState();
  }

  try {
    const parsed = JSON.parse(raw) as PersistedWorkspace;

    if (parsed.version !== 1 || parsed.projects.length === 0) {
      return createInitialWorkspaceState();
    }

    return {
      currentProjectId: parsed.currentProjectId,
      projects: parsed.projects,
      templates: parsed.templates,
      hydrated: true,
      lastSavedAt: parsed.lastSavedAt,
    };
  } catch {
    return createInitialWorkspaceState();
  }
}

export function saveWorkspaceState(workspace: PersistedWorkspace) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

export function clearWorkspaceState() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
