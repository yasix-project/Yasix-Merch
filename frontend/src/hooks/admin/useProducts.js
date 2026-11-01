import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { productService } from "../../api/productService";

export const productKeys = {
  all: ["products"],
  list: () => ["products"],
};

export function useProducts({ enabled = true } = {}) {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: async () => {
      const response = await productService.getAll();
      return Array.isArray(response.data?.data)
        ? response.data.data
        : response.data || [];
    },
    enabled,
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();
  const invalidateProducts = () =>
    queryClient.invalidateQueries({ queryKey: productKeys.all });

  const save = useMutation({
    mutationFn: ({ id, data }) =>
      id ? productService.update(id, data) : productService.create(data),
    onSuccess: invalidateProducts,
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }) =>
      productService.update(id, { isActive: isActive === false }),
    onSuccess: invalidateProducts,
  });

  const remove = useMutation({
    mutationFn: (id) => productService.delete(id),
    onSuccess: invalidateProducts,
  });

  const bulkDeactivate = useMutation({
    mutationFn: async (ids) =>
      Promise.all(
        ids.map((id) => productService.update(id, { isActive: false })),
      ),
    onSuccess: invalidateProducts,
  });

  const bulkActivate = useMutation({
    mutationFn: async (ids) =>
      Promise.all(
        ids.map((id) => productService.update(id, { isActive: true })),
      ),
    onSuccess: invalidateProducts,
  });

  const bulkRemove = useMutation({
    mutationFn: async (ids) => {
      const results = await Promise.allSettled(
        ids.map((id) => productService.delete(id)),
      );

      return results.reduce((failedIds, result, index) => {
        if (result.status === "rejected") {
          failedIds.push(ids[index]);
        }
        return failedIds;
      }, []);
    },
    onSuccess: invalidateProducts,
  });

  return {
    save,
    toggleActive,
    remove,
    bulkDeactivate,
    bulkActivate,
    bulkRemove,
  };
}
