import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import type { Education, EducationFormValues } from "@/features/career-profile/types/education";
import {
  createEducation,
  deleteEducation,
  fetchEducations,
  updateEducation,
} from "@/features/career-profile/services/education";

const EDUCATIONS_QUERY_KEY = ["career-profile", "educations"] as const;

export function useEducations() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const educationQuery = useQuery({
    queryKey: EDUCATIONS_QUERY_KEY,
    queryFn: fetchEducations,
  });

  const createMutation = useMutation({
    mutationFn: createEducation,
    onSuccess: (savedEducation) => {
      queryClient.setQueryData<Education[]>(EDUCATIONS_QUERY_KEY, (current = []) =>
        sortEducations([...current, savedEducation])
      );
      toast.success("Education added", "Your new education record is ready to use.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      educationId,
      payload,
    }: {
      educationId: string;
      payload: EducationFormValues;
    }) => updateEducation({ educationId, payload }),
    onSuccess: (savedEducation) => {
      queryClient.setQueryData<Education[]>(EDUCATIONS_QUERY_KEY, (current = []) =>
        sortEducations(current.map((record) => (record.id === savedEducation.id ? savedEducation : record)))
      );
      toast.success("Education updated", "Your changes were saved.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEducation,
    onSuccess: (_, educationId) => {
      queryClient.setQueryData<Education[]>(EDUCATIONS_QUERY_KEY, (current = []) =>
        current.filter((record) => record.id !== educationId)
      );
      toast.success("Education deleted", "The record was removed from your profile.");
    },
  });

  return {
    educationQuery,
    createEducation: createMutation.mutateAsync,
    updateEducation: updateMutation.mutateAsync,
    deleteEducation: deleteMutation.mutateAsync,
    isCreatingEducation: createMutation.isPending,
    isUpdatingEducation: updateMutation.isPending,
    isDeletingEducation: deleteMutation.isPending,
  };
}

function sortEducations(educations: Education[]) {
  return [...educations].sort((left, right) =>
    right.endDate.localeCompare(left.endDate) ||
    right.startDate.localeCompare(left.startDate) ||
    left.institution.localeCompare(right.institution)
  );
}
