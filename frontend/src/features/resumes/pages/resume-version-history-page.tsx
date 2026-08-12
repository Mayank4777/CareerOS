import { useEffect, useState } from "react";
import {
  Clock,
  FileDiff,
  History,
  Plus,
  RotateCcw,
  Sparkles,
  Tag,
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
import {
  useCreateVersion,
  useRestoreVersion,
  useResumes,
  useResumeVersions,
} from "../hooks/use-resumes";

export function ResumeVersionHistoryPage() {
  const toast = useToast();
  const resumesQuery = useResumes();
  const resumes = resumesQuery.data ?? [];
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");

  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const versionsQuery = useResumeVersions(selectedResumeId);
  const versions = versionsQuery.data ?? [];

  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newVersionTitle, setNewVersionTitle] = useState("");
  const [newCommitMsg, setNewCommitMsg] = useState("");

  const createVersionMutation = useCreateVersion(selectedResumeId);
  const restoreVersionMutation = useRestoreVersion(selectedResumeId);

  useEffect(() => {
    if (versions.length > 0) {
      setSelectedVersion(versions[0]);
    } else {
      setSelectedVersion(null);
    }
  }, [versions]);

  const handleRestore = (ver: any) => {
    restoreVersionMutation.mutate(ver.id, {
      onSuccess: () => {
        setRestoreTarget(null);
        toast.success(`Restored Version ${ver.version_number}`, `Active draft reverted to "${ver.title}".`);
      },
      onError: (err: any) => {
        toast.error("Restore Failed", err.message || "Could not restore version.");
      },
    });
  };

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionTitle.trim() || !selectedResumeId) return;

    createVersionMutation.mutate(
      {
        title: newVersionTitle.trim(),
        commit_message: newCommitMsg.trim() || "Manual snapshot saved.",
        tags: ["Snapshot"],
      },
      {
        onSuccess: (newVer) => {
          setIsCreateModalOpen(false);
          setNewVersionTitle("");
          setNewCommitMsg("");
          setSelectedVersion(newVer);
          toast.success("Snapshot Saved", `Version "${newVer.version_number}" added to timeline.`);
        },
        onError: (err: any) => {
          toast.error("Snapshot Failed", err.message || "Could not save version.");
        },
      }
    );
  };

  if (resumesQuery.isLoading) {
    return <div className="p-8 text-center text-sm text-secondary">Loading resume timeline...</div>;
  }

  if (resumes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <PageHeader
          title="Resume Version History & Diff Timeline"
          description="Track draft revisions, restore past snapshots, and inspect visual section changes."
        />
        <Card className="p-8 border-border/80">
          <p className="text-sm text-secondary">No resumes found in your workspace.</p>
          <p className="text-xs text-secondary/80 mt-1">Generate your first resume from your Career Profile to start version tracking.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Resume Version History & Diff Timeline"
        description="Track draft revisions, restore past snapshots, and inspect visual section changes."
        actions={
          <div className="flex items-center gap-3">
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-surface text-xs font-semibold text-primary focus:outline-none"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>

            <Button variant="gradient" size="sm" onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Save Version Snapshot
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Version Timeline Drawer */}
        <Card className="p-5 space-y-4 border-border/80 bg-card/80 lg:col-span-1">
          <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-border/60 pb-3">
            <History className="w-4 h-4 text-indigo-400" /> Revision Timeline ({versions.length})
          </h3>

          {versions.length === 0 ? (
            <p className="text-xs text-secondary py-4">No version snapshots saved for this resume yet.</p>
          ) : (
            <div className="relative border-l border-indigo-500/30 ml-3 space-y-6 py-2">
              {versions.map((ver: any, index: number) => {
                const isSelected = selectedVersion?.id === ver.id;
                const isCurrent = index === 0;
                return (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedVersion(ver)}
                    className="relative pl-6 cursor-pointer group transition-all"
                  >
                    {/* Timeline Dot */}
                    <span
                      className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                        isCurrent
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
                          <span className="font-mono text-xs font-bold text-indigo-400">{ver.version_number}</span>
                          {isCurrent && (
                            <Badge tone="success" className="text-[10px]">
                              Active Draft
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-secondary font-medium">
                          {new Date(ver.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-primary mt-1.5 line-clamp-1">{ver.title}</h4>
                      <p className="text-[11px] text-secondary mt-1 line-clamp-2">{ver.commit_message || "Snapshot saved"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Version Inspector & Diff Viewer */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedVersion ? (
            <Card className="p-8 text-center border-border">
              <p className="text-sm text-secondary">No version snapshot selected.</p>
            </Card>
          ) : (
            <Card className="p-6 border-indigo-500/30 bg-card/90 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-indigo-400">{selectedVersion.version_number}</span>
                    <h3 className="text-base font-bold text-primary">{selectedVersion.title}</h3>
                  </div>
                  <p className="text-xs text-secondary mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Saved on {new Date(selectedVersion.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRestoreTarget(selectedVersion)}
                    disabled={restoreVersionMutation.isPending}
                    className="flex items-center gap-1.5 border-indigo-500/30"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                    {restoreVersionMutation.isPending ? "Restoring..." : "Restore This Version"}
                  </Button>
                </div>
              </div>

              {/* Commit Message & Tag Badges */}
              <div className="p-3.5 rounded-xl bg-surface/70 border border-border/60 space-y-2">
                <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider block">
                  Commit & Revision Notes
                </span>
                <p className="text-xs text-primary font-medium">{selectedVersion.commit_message || "Manual snapshot saved."}</p>

                {selectedVersion.tags && selectedVersion.tags.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <Tag className="w-3 h-3 text-secondary" />
                    {selectedVersion.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-hover text-secondary font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Snapshot Content Summary */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-primary flex items-center gap-2">
                  <FileDiff className="w-4 h-4 text-indigo-400" /> Snapshot Section Content
                </h4>

                <div className="p-4 rounded-xl bg-surface/60 border border-border/60 space-y-2 text-xs">
                  <p className="font-semibold text-primary">
                    Summary: <span className="font-normal text-secondary">{selectedVersion.snapshot_data?.summary || "No summary"}</span>
                  </p>
                  <p className="font-semibold text-primary">
                    Sections Included:{" "}
                    <span className="font-normal text-secondary">
                      {selectedVersion.snapshot_data?.sections?.map((s: any) => s.title).join(", ") || "None"}
                    </span>
                  </p>
                </div>
              </div>
            </Card>
          )}
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
                required
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
              <Button type="submit" variant="gradient" disabled={createVersionMutation.isPending}>
                {createVersionMutation.isPending ? "Saving..." : "Save Snapshot"}
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
            ? `Are you sure you want to restore version ${restoreTarget.version_number} ("${restoreTarget.title}")? This will replace your active draft.`
            : "Restore selected resume version?"
        }
        confirmLabel={restoreVersionMutation.isPending ? "Restoring..." : "Restore Version"}
      />
    </div>
  );
}
