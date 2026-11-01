import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { voucherService } from "../../api/voucherService";

export const voucherKeys = {
  all: ["vouchers"],
  list: () => ["vouchers"],
};

export function useVouchers({ enabled = true } = {}) {
  return useQuery({
    queryKey: voucherKeys.list(),
    queryFn: async () => {
      const response = await voucherService.getAll();
      return Array.isArray(response.data?.data)
        ? response.data.data
        : response.data || [];
    },
    enabled,
  });
}

export function useVoucherMutations() {
  const queryClient = useQueryClient();
  const invalidateVouchers = () =>
    queryClient.invalidateQueries({ queryKey: voucherKeys.all });

  const save = useMutation({
    mutationFn: ({ id, data }) =>
      id ? voucherService.update(id, data) : voucherService.create(data),
    onSuccess: invalidateVouchers,
  });

  const remove = useMutation({
    mutationFn: (id) => voucherService.delete(id),
    onSuccess: invalidateVouchers,
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, currentStatus }) =>
      voucherService.toggleActive(id, currentStatus),
    onSuccess: invalidateVouchers,
  });

  const bulkDeactivate = useMutation({
    mutationFn: async (ids) =>
      Promise.all(
        ids.map((id) => voucherService.update(id, { isActive: false })),
      ),
    onSuccess: invalidateVouchers,
  });

  const bulkActivate = useMutation({
    mutationFn: async (ids) =>
      Promise.all(
        ids.map((id) => voucherService.update(id, { isActive: true })),
      ),
    onSuccess: invalidateVouchers,
  });

  const bulkRemove = useMutation({
    mutationFn: async (ids) => {
      const results = await Promise.allSettled(
        ids.map((id) => voucherService.delete(id)),
      );

      return results.reduce((failedIds, result, index) => {
        if (result.status === "rejected") {
          failedIds.push(ids[index]);
        }
        return failedIds;
      }, []);
    },
    onSuccess: invalidateVouchers,
  });

  return {
    save,
    remove,
    bulkRemove,
    toggleStatus,
    bulkActivate,
    bulkDeactivate,
  };
}
