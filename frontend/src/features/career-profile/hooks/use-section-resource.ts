import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/components/ui/toast";
import { createSectionService } from "@/features/career-profile/services/section";
import type { SectionModuleConfig, SectionRecord } from "@/features/career-profile/types/section";

export function useSectionResource<TRecord extends SectionRecord>(config: SectionModuleConfig) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const service = createSectionService<TRecord>({ apiRoot: config.apiRoot, fields: config.fields });

  const recordQuery = useQuery({
    queryKey: config.queryKey,
    queryFn: service.fetchRecords,
  });

  const createMutation = useMutation({
    mutationFn: service.createRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast.success(`${config.singularLabel} added`, `Your new ${config.singularLabel.toLowerCase()} is ready to use.`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      recordId,
      payload,
    }: {
      recordId: string;
      payload: Record<string, unknown>;
    }) => service.updateRecord(recordId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast.success(`${config.singularLabel} updated`, "Your changes were saved.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: service.deleteRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast.success(`${config.singularLabel} deleted`, "The record was removed from your profile.");
    },
  });

  return {
    recordQuery,
    createRecord: createMutation.mutateAsync,
    updateRecord: updateMutation.mutateAsync,
    deleteRecord: deleteMutation.mutateAsync,
    isCreatingRecord: createMutation.isPending,
    isUpdatingRecord: updateMutation.isPending,
    isDeletingRecord: deleteMutation.isPending,
  };
}
