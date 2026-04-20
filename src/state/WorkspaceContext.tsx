import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { createInitialWorkspaceState, createSeedProject, toPersistedWorkspace } from "../data/seed";
import { clearWorkspaceState, loadWorkspaceState, saveWorkspaceState } from "../lib/workspaceStorage";
import type { ArticleProject, ArticleSection, TemplateDefinition, TemplateStatus, WorkspaceContextValue, WorkspaceState } from "../types";

type WorkspaceAction =
  | { type: "createProject"; payload: { project: ArticleProject } }
  | { type: "importProject"; payload: { project: ArticleProject } }
  | { type: "selectProject"; payload: { projectId: string } }
  | {
      type: "updateProjectMeta";
      payload: {
        projectId: string;
        patch: Partial<Pick<ArticleProject, "title" | "summary" | "sourceType" | "sourceUrl">>;
      };
    }
  | { type: "updateProjectTags"; payload: { projectId: string; tags: string[] } }
  | { type: "updateProjectTemplate"; payload: { projectId: string; templateId: string } }
  | { type: "updateTemplateStatus"; payload: { templateId: string; status: TemplateStatus } }
  | { type: "duplicateTemplate"; payload: { template: TemplateDefinition } }
  | {
      type: "updateProjectSection";
      payload: {
        projectId: string;
        sectionId: string;
        patch: Partial<Pick<ArticleSection, "type" | "heading" | "body" | "points">>;
      };
    }
  | {
      type: "applyProjectDraft";
      payload: {
        projectId: string;
        patch: Pick<ArticleProject, "title" | "summary" | "tags" | "sections">;
      };
    }
  | { type: "addProjectSection"; payload: { projectId: string; section: ArticleSection } }
  | { type: "removeProjectSection"; payload: { projectId: string; sectionId: string } }
  | { type: "moveProjectSection"; payload: { projectId: string; sectionId: string; direction: "up" | "down" } }
  | { type: "save"; payload: { savedAt: string } }
  | { type: "reset"; payload: { state: WorkspaceState } };

function patchProject(
  state: WorkspaceState,
  projectId: string,
  patcher: (project: ArticleProject) => ArticleProject,
) {
  return {
    ...state,
    projects: state.projects.map((project) => (project.id === projectId ? patcher(project) : project)),
  };
}

function patchTemplates(
  state: WorkspaceState,
  patcher: (templates: TemplateDefinition[]) => TemplateDefinition[],
) {
  return {
    ...state,
    templates: patcher(state.templates),
  };
}

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "createProject":
    case "importProject":
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
      return patchProject(state, action.payload.projectId, (project) => ({
        ...project,
        ...action.payload.patch,
        updatedAt: new Date().toISOString(),
      }));
    case "updateProjectTags":
      return patchProject(state, action.payload.projectId, (project) => ({
        ...project,
        tags: action.payload.tags,
        updatedAt: new Date().toISOString(),
      }));
    case "updateProjectTemplate":
      return patchProject(state, action.payload.projectId, (project) => ({
        ...project,
        styleTemplateId: action.payload.templateId,
        updatedAt: new Date().toISOString(),
      }));
    case "updateTemplateStatus":
      return patchTemplates(state, (templates) =>
        templates.map((template) =>
          template.id === action.payload.templateId
            ? {
                ...template,
                status: action.payload.status,
                updatedAt: new Date().toISOString(),
              }
            : template,
        ),
      );
    case "duplicateTemplate":
      return patchTemplates(state, (templates) => [action.payload.template, ...templates]);
    case "updateProjectSection":
      return patchProject(state, action.payload.projectId, (project) => ({
        ...project,
        sections: project.sections.map((section) =>
          section.id === action.payload.sectionId
            ? {
                ...section,
                ...action.payload.patch,
              }
            : section,
        ),
        updatedAt: new Date().toISOString(),
      }));
    case "applyProjectDraft":
      return patchProject(state, action.payload.projectId, (project) => ({
        ...project,
        ...action.payload.patch,
        updatedAt: new Date().toISOString(),
      }));
    case "addProjectSection":
      return patchProject(state, action.payload.projectId, (project) => ({
        ...project,
        sections: [...project.sections, action.payload.section],
        updatedAt: new Date().toISOString(),
      }));
    case "removeProjectSection":
      return patchProject(state, action.payload.projectId, (project) => ({
        ...project,
        sections: project.sections.filter((section) => section.id !== action.payload.sectionId),
        updatedAt: new Date().toISOString(),
      }));
    case "moveProjectSection":
      return patchProject(state, action.payload.projectId, (project) => {
        const index = project.sections.findIndex((section) => section.id === action.payload.sectionId);

        if (index === -1) {
          return project;
        }

        const targetIndex = action.payload.direction === "up" ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= project.sections.length) {
          return project;
        }

        const sections = [...project.sections];
        const [moved] = sections.splice(index, 1);
        sections.splice(targetIndex, 0, moved);

        return {
          ...project,
          sections,
          updatedAt: new Date().toISOString(),
        };
      });
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
      importProject: (project) => {
        dispatch({ type: "importProject", payload: { project } });
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
      updateProjectTemplate: (templateId) => {
        if (!currentProject) {
          return;
        }

        dispatch({
          type: "updateProjectTemplate",
          payload: { projectId: currentProject.id, templateId },
        });
      },
      updateTemplateStatus: (templateId, status) => {
        dispatch({
          type: "updateTemplateStatus",
          payload: { templateId, status },
        });
      },
      duplicateTemplate: (templateId) => {
        const template = state.templates.find((item) => item.id === templateId);

        if (!template) {
          return;
        }

        dispatch({
          type: "duplicateTemplate",
          payload: {
            template: {
              ...template,
              id: crypto.randomUUID(),
              name: `${template.name} 副本`,
              kind: "variant",
              status: "draft",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },
      updateProjectSection: (sectionId, patch) => {
        if (!currentProject) {
          return;
        }

        dispatch({
          type: "updateProjectSection",
          payload: { projectId: currentProject.id, sectionId, patch },
        });
      },
      applyProjectDraft: (patch) => {
        if (!currentProject) {
          return;
        }

        dispatch({
          type: "applyProjectDraft",
          payload: { projectId: currentProject.id, patch },
        });
      },
      addProjectSection: () => {
        if (!currentProject) {
          return;
        }

        dispatch({
          type: "addProjectSection",
          payload: {
            projectId: currentProject.id,
            section: {
              id: crypto.randomUUID(),
              type: "content",
              heading: `新增章节 ${currentProject.sections.length + 1}`,
              body: "在这里继续补充正文内容。",
              points: [],
            },
          },
        });
      },
      removeProjectSection: (sectionId) => {
        if (!currentProject) {
          return;
        }

        dispatch({
          type: "removeProjectSection",
          payload: { projectId: currentProject.id, sectionId },
        });
      },
      moveProjectSection: (sectionId, direction) => {
        if (!currentProject) {
          return;
        }

        dispatch({
          type: "moveProjectSection",
          payload: { projectId: currentProject.id, sectionId, direction },
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
