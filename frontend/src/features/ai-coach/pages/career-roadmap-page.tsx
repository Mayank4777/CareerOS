import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useSavedJobs } from "@/features/jobs/hooks/use-jobs";
import { useRoadmaps, useRoadmapDetail } from "../hooks/use-ai-coach";
import { RoadmapHeader } from "../components/roadmap-header";
import { RoadmapTimeline } from "../components/roadmap-timeline";
import { GenerateRoadmapCard } from "../components/generate-roadmap-card";

export function CareerRoadmapPage() {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState<boolean>(false);

  // Queries
  const {
    data: roadmaps,
    isLoading: isLoadingRoadmaps,
    isError: isRoadmapsError,
    error: roadmapsError,
    refetch: refetchRoadmaps,
  } = useRoadmaps();

  const { data: savedJobs } = useSavedJobs({});

  // Auto-select initial roadmap when roadmaps load
  useEffect(() => {
    if (roadmaps && roadmaps.length > 0 && !selectedRoadmapId) {
      setSelectedRoadmapId(roadmaps[0].id);
    }
  }, [roadmaps, selectedRoadmapId]);

  // Fetch details of selected roadmap
  const {
    data: activeRoadmap,
    isLoading: isLoadingDetail,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useRoadmapDetail(selectedRoadmapId);

  // Match target saved job record if available
  const targetSavedJob = savedJobs?.find((j) => j.id === activeRoadmap?.target_job);

  const handleGeneratedSuccess = (newRoadmap: { id: string }) => {
    setSelectedRoadmapId(newRoadmap.id);
    setShowGenerateForm(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Career Roadmap"
          description="Structured step-by-step progression milestones targeting your selected career opportunities."
        />

        {roadmaps && roadmaps.length > 0 && !showGenerateForm && (
          <Button
            onClick={() => setShowGenerateForm(true)}
            variant="primary"
            size="sm"
            className="self-start sm:self-auto flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Roadmap</span>
          </Button>
        )}
      </div>

      {/* Loading State for initial fetch */}
      {isLoadingRoadmaps && (
        <LoadingState label="Fetching your career roadmaps..." />
      )}

      {/* Error State for roadmaps fetch */}
      {isRoadmapsError && !isLoadingRoadmaps && (
        <ErrorState
          title="Failed to Load Roadmaps"
          description={
            roadmapsError instanceof Error
              ? roadmapsError.message
              : "Unable to retrieve your career roadmaps. Please try again."
          }
          onRetry={() => void refetchRoadmaps()}
        />
      )}

      {/* Case 1: Show Generate Form if requested or if no roadmaps exist */}
      {!isLoadingRoadmaps && !isRoadmapsError && (showGenerateForm || !roadmaps || roadmaps.length === 0) && (
        <div className="space-y-6">
          <GenerateRoadmapCard
            onSuccess={handleGeneratedSuccess}
            onCancel={roadmaps && roadmaps.length > 0 ? () => setShowGenerateForm(false) : undefined}
            isStandalone={!roadmaps || roadmaps.length === 0}
          />
        </div>
      )}

      {/* Case 2: Display active roadmap when roadmaps exist and generate form is hidden */}
      {!isLoadingRoadmaps && !isRoadmapsError && !showGenerateForm && roadmaps && roadmaps.length > 0 && (
        <div className="space-y-6">
          {isLoadingDetail && (
            <LoadingState label="Loading roadmap details..." />
          )}

          {isDetailError && !isLoadingDetail && (
            <ErrorState
              title="Roadmap Details Unavailable"
              description={
                detailError instanceof Error
                  ? detailError.message
                  : "Could not load details for the selected roadmap."
              }
              onRetry={() => void refetchDetail()}
            />
          )}

          {activeRoadmap && !isLoadingDetail && (
            <>
              {/* Header Card */}
              <RoadmapHeader
                roadmap={activeRoadmap}
                allRoadmaps={roadmaps}
                targetSavedJob={targetSavedJob}
                onSelectRoadmap={(id) => setSelectedRoadmapId(id)}
                onNewRoadmapClick={() => setShowGenerateForm(true)}
              />

              {/* Vertical Timeline Visualizer */}
              <RoadmapTimeline
                roadmapId={activeRoadmap.id}
                phases={activeRoadmap.phases || []}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
