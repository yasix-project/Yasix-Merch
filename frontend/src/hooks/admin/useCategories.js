import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { categoryService } from "../../api/categoryService";

export const categoryKeys = {
  all: ["categories"],
  list: () => ["categories"],
};

export function useCategories({ enabled = true } = {}) {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: async () => {
      const response = await categoryService.getAll();
      return Array.isArray(response.data?.data)
        ? response.data.data
        : response.data || [];
    },
    enabled,
  });
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();
  const invalidateCategories = () =>
    queryClient.invalidateQueries({ queryKey: categoryKeys.all });

  const save = useMutation({
    mutationFn: ({ id, data }) =>
      id ? categoryService.update(id, data) : categoryService.create(data),
    onSuccess: invalidateCategories,
  });

  const remove = useMutation({
    mutationFn: (id) => categoryService.delete(id),
    onSuccess: invalidateCategories,
  });

  const bulkRemove = useMutation({
    mutationFn: async (ids) => {
      const results = await Promise.allSettled(
        ids.map((id) => categoryService.delete(id)),
      );

      return results.reduce((failedIds, result, index) => {
        if (result.status === "rejected") {
          failedIds.push(ids[index]);
        }
        return failedIds;
      }, []);
    },
    onSuccess: invalidateCategories,
  });

  return { save, remove, bulkRemove };
}
