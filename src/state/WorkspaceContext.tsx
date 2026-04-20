import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { createInitialWorkspaceState, createSeedProject, toPersistedWorkspace } from "../data/seed";
import { clearWorkspaceState, loadWorkspaceState, saveWorkspaceState } from "../lib/workspaceStorage";
import type { ArticleProject, WorkspaceContextValue, WorkspaceState } from "../types";

type WorkspaceAction =
  | { type: "createProject"; payload: { project: ArticleProject } }
  | { type: "selectProject"; payload: { projectId: string } }
  | {
      type: "updateProjectMeta";
      payload: {
        projectId: string;
        patch: Partial<Pick<ArticleProject, "title" | "summary" | "sourceType" | "sourceUrl">>;
      };
    }
  | { type: "updateProjectTags"; payload: { projectId: string; tags: string[] } }
  | { type: "save"; payload: { savedAt: string } }
  | { type: "reset"; payload: { state: WorkspaceState } };

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "createProject":
      return {
        ...state,
        currentProjectId: action.payload.project.id,
        projects: [action.payload.project, ...state.projects],
      };
    case "selectProject":
      return {
        ...state,
        currentProjectId: action.payload.projectId,
      };
    case "updateProjectMeta":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.projectId
            ? {
                ...project,
                ...action.payload.patch,
                updatedAt: new Date().toISOString(),
              }
            : project,
        ),
      };
    case "updateProjectTags":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.projectId
            ? {
                ...project,
                tags: action.payload.tags,
                updatedAt: new Date().toISOString(),
              }
            : project,
        ),
      };
    case "save":
      return {
        ...state,
        lastSavedAt: action.payload.savedAt,
      };
    case "reset":
      return action.payload.state;
    default:
      return state;
  }
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

type WorkspaceProviderProps = {
  children: ReactNode;
};

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, loadWorkspaceState);

  const value = useMemo<WorkspaceContextValue>(() => {
    const currentProject = state.projects.find(
      (project) => project.id === state.currentProjectId,
    );

    return {
      ...state,
      currentProject,
      createProject: () => {
        const templateId = state.templates[0]?.id ?? "magazine-editorial";
        dispatch({ type: "createProject", payload: { project: createSeedProject(templateId) } });
      },
      selectProject: (projectId) => {
        dispatch({ type: "selectProject", payload: { projectId } });
      },
      updateProjectMeta: (patch) => {
        if (!currentProject) {
          return;
        }

        dispatch({
          type: "updateProjectMeta",
          payload: { projectId: currentProject.id, patch },
        });
      },
      updateProjectTags: (tags) => {
        if (!currentProject) {
          return;
        }

        dispatch({
          type: "updateProjectTags",
          payload: { projectId: currentProject.id, tags },
        });
      },
      saveWorkspace: () => {
        const savedAt = new Date().toISOString();
        const snapshot = toPersistedWorkspace({ ...state, lastSavedAt: savedAt });

        saveWorkspaceState(snapshot);
        dispatch({ type: "save", payload: { savedAt } });
      },
      resetWorkspace: () => {
        clearWorkspaceState();
        dispatch({ type: "reset", payload: { state: createInitialWorkspaceState() } });
      },
    };
  }, [state]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }

  return context;
}
