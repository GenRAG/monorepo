export interface ProjectPreview {
  id: string
  name: string
}

export interface WorkspacePreview {
  id: string
  name: string
  projects: ProjectPreview[]
}
