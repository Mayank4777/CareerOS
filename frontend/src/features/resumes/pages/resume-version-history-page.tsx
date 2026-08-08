import { useState } from "react";
import {
  GitCommit,
  Clock,
  History,
  RotateCcw,
  Plus,
  CheckCircle2,
  FileDiff,
  Tag,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ModalShell } from "@/components/ui/modal-shell";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/toast";
import type { ResumeVersion, VersionDiff } from "../types/version-history";

const initialVersions: ResumeVersion[] = [
  {
    id: "v-3",
    versionNumber: "v1.2",
    title: "Senior Frontend Lead (AI Audit Applied)",
    createdAt: "2026-08-07T18:45:00Z",
    author: "User Account",
    commitMessage: "Applied ATS recommendations: added GraphQL and quantified bullet metrics.",
    tags: ["Current Active", "ATS 88%"],
    isCurrent: true,
    sectionsCount: 8,
    changesSummary: { added: 4, modified: 3, removed: 1 },
  },
  {
    id: "v-2",
    versionNumber: "v1.1",
    title: "Tailored for Stripe Frontend Lead",
    createdAt: "2026-08-05T14:20:00Z",
    author: "User Account",
    commitMessage: "Emphasized React architecture and high scale state management.",
    tags: ["Stripe Application"],
    isCurrent: false,
    sectionsCount: 7,
    changesSummary: { added: 2, modified: 5, removed: 0 },
  },
  {
    id: "v-1",
    versionNumber: "v1.0",
    title: "Master Profile Resume Baseline",
    createdAt: "2026-08-01T09:00:00Z",
    author: "System Auto-Sync",
    commitMessage: "Initial baseline version synced from Career Profile records.",
    tags: ["Baseline"],
    isCurrent: false,
    sectionsCount: 7,
    changesSummary: { added: 7, modified: 0, removed: 0 },
  },
];

const mockDiffs: VersionDiff[] = [
  {
    sectionName: "Experience - Lead Engineer",
    type: "modified",
    oldContent: "Responsible for frontend app development.",
    newContent: "Architected micro-frontend React architecture scaling to 250k daily active users.",
  },
  {
    sectionName: "Technical Skills",
    type: "added",
    newContent: "Added GraphQL, Next.js 14, Web Vitals, and Docker containerization.",
  },
  {
    sectionName: "Education & Certifications",
    type: "unchanged",
    oldContent: "B.S. Computer Science",
    newContent: "B.S. Computer Science",
  },
];

export function ResumeVersionHistoryPage() {
  const toast = useToast();
  const [versions, setVersions] = useState<ResumeVersion[]>(initialVersions);
  const [selectedVersion, setSelectedVersion] = useState<ResumeVersion>(initialVersions[0]);
  const [compareTarget, setCompareTarget] = useState<ResumeVersion | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<ResumeVersion | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newVersionTitle, setNewVersionTitle] = useState("");
  const [newCommitMsg, setNewCommitMsg] = useState("");

  const handleRestore = (ver: ResumeVersion) => {
    setVersions((prev) =>
      prev.map((v) => ({
        ...v,
        isCurrent: v.id === ver.id,
      }))
    );
    setSelectedVersion({ ...ver, isCurrent: true });
    setRestoreTarget(null);
    toast.success(`Restored Version ${ver.versionNumber}`, `Active draft reverted to "${ver.title}".`);
  };

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionTitle.trim()) return;

    const nextVerNumber = `v1.${versions.length}`;
    const newVer: ResumeVersion = {
      id: `v-${Date.now()}`,
      versionNumber: nextVerNumber,
      title: newVersionTitle.trim(),
      createdAt: new Date().toISOString(),
      author: "User Account",
      commitMessage: newCommitMsg.trim() || "Manual snapshot saved.",
      tags: ["Snapshot"],
      isCurrent: true,
      sectionsCount: 8,
      changesSummary: { added: 1, modified: 2, removed: 0 },
    };

    setVersions((prev) => [newVer, ...prev.map((v) => ({ ...v, isCurrent: false }))]);
    setSelectedVersion(newVer);
    setIsCreateModalOpen(false);
    setNewVersionTitle("");
    setNewCommitMsg("");
    toast.success(`Created Snapshot ${nextVerNumber}`, "New version saved to timeline.");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Resume Version History & Diff Timeline"
        description="Track draft revisions, restore past snapshots, and inspect visual diffs."
        actions={
          <Button variant="gradient" size="sm" onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Save Version Snapshot
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Version Timeline Drawer */}
        <Card className="p-5 space-y-4 border-border/80 bg-card/80 lg:col-span-1">
          <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-border/60 pb-3">
            <History className="w-4 h-4 text-indigo-400" /> Revision Timeline
          </h3>

          <div className="relative border-l border-indigo-500/30 ml-3 space-y-6 py-2">
            {versions.map((ver) => {
              const isSelected = selectedVersion.id === ver.id;
              return (
                <div
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver)}
                  className={`relative pl-6 cursor-pointer group transition-all`}
                >
                  {/* Timeline Dot */}
                  <span
                    className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                      ver.isCurrent
                        ? "bg-indigo-500 border-indigo-300 ring-4 ring-indigo-500/20"
                        : isSelected
                        ? "bg-surface border-indigo-400"
                        : "bg-surface border-border group-hover:border-indigo-400"
                    }`}
                  />

                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? "border-indigo-500/50 bg-indigo-500/10 shadow-md shadow-indigo-500/5"
                        : "border-border/60 bg-surface/50 hover:border-border hover:bg-hover/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400">{ver.versionNumber}</span>
                        {ver.isCurrent && (
                          <Badge tone="success" className="text-[10px]">
                            Active
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-secondary font-medium">
                        {new Date(ver.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-primary mt-1.5 line-clamp-1">{ver.title}</h4>
                    <p className="text-[11px] text-secondary mt-1 line-clamp-2">{ver.commitMessage}</p>

                    <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-border/40 text-[10px]">
                      <span className="text-emerald-400 font-medium">+{ver.changesSummary.added} / ~{ver.changesSummary.modified}</span>
                      <span className="text-secondary font-mono">{ver.author}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Version Inspector & Diff Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-indigo-500/30 bg-card/90 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-indigo-400">{selectedVersion.versionNumber}</span>
                  <h3 className="text-base font-bold text-primary">{selectedVersion.title}</h3>
                  {selectedVersion.isCurrent && <Badge tone="success">Active Draft</Badge>}
                </div>
                <p className="text-xs text-secondary mt-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Saved on {new Date(selectedVersion.createdAt).toLocaleString()} by {selectedVersion.author}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!selectedVersion.isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRestoreTarget(selectedVersion)}
                    className="flex items-center gap-1.5 border-indigo-500/30"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400" /> Restore This Version
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCompareTarget(selectedVersion)}
                  className="flex items-center gap-1.5"
                >
                  <FileDiff className="w-3.5 h-3.5" /> Compare Diffs
                </Button>
              </div>
            </div>

            {/* Commit Message & Tag Badges */}
            <div className="p-3.5 rounded-xl bg-surface/70 border border-border/60 space-y-2">
              <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider block">
                Commit & Revision Notes
              </span>
              <p className="text-xs text-primary font-medium">{selectedVersion.commitMessage}</p>

              <div className="flex items-center gap-2 pt-1">
                <Tag className="w-3 h-3 text-secondary" />
                {selectedVersion.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-hover text-secondary font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Version Diff Visualizer */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-primary flex items-center gap-2">
                <FileDiff className="w-4 h-4 text-indigo-400" /> Section Changes & Diffs vs Current Draft
              </h4>

              <div className="space-y-3">
                {mockDiffs.map((diff, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-surface/60 border border-border/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-primary">{diff.sectionName}</span>
                      <Badge
                        tone={
                          diff.type === "added"
                            ? "success"
                            : diff.type === "modified"
                            ? "warning"
                            : "neutral"
                        }
                        className="capitalize text-[10px]"
                      >
                        {diff.type}
                      </Badge>
                    </div>

                    {diff.type === "modified" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[11px]">
                          - {diff.oldContent}
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                          + {diff.newContent}
                        </div>
                      </div>
                    )}

                    {diff.type === "added" && (
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                        + {diff.newContent}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Save Snapshot Modal */}
      <ModalShell open={isCreateModalOpen} titleId="create-version-modal" panelClassName="max-w-md p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 id="create-version-modal" className="text-base font-bold text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Save Version Snapshot
            </h3>
            <button onClick={() => setIsCreateModalOpen(false)} className="text-xs text-secondary hover:text-primary">
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateSnapshot} className="space-y-4">
            <FormField label="Snapshot Title" htmlFor="version-title" required>
              <Input
                id="version-title"
                placeholder="e.g. Tailored for Lead Tech Application"
                value={newVersionTitle}
                onChange={(e) => setNewVersionTitle(e.target.value)}
              />
            </FormField>

            <FormField label="Revision Notes / Commit Message" htmlFor="version-notes">
              <Input
                id="version-notes"
                placeholder="Key changes made in this revision..."
                value={newCommitMsg}
                onChange={(e) => setNewCommitMsg(e.target.value)}
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-3 border-t border-border/60">
              <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient">
                Save Snapshot
              </Button>
            </div>
          </form>
        </div>
      </ModalShell>

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        open={restoreTarget !== null}
        onCancel={() => setRestoreTarget(null)}
        onConfirm={() => {
          if (restoreTarget) handleRestore(restoreTarget);
        }}
        title="Restore Resume Version?"
        description={
          restoreTarget
            ? `Are you sure you want to restore version ${restoreTarget.versionNumber} ("${restoreTarget.title}")? This will replace your active draft.`
            : "Restore selected resume version?"
        }
        confirmLabel="Restore Version"
      />
    </div>
  );
}
