export interface ResumeVersion {
  id: string;
  versionNumber: string;
  title: string;
  createdAt: string;
  author: string;
  commitMessage: string;
  tags: string[];
  isCurrent: boolean;
  sectionsCount: number;
  changesSummary: {
    added: number;
    modified: number;
    removed: number;
  };
}

export interface VersionDiff {
  sectionName: string;
  type: "added" | "modified" | "unchanged" | "removed";
  oldContent?: string;
  newContent?: string;
}
