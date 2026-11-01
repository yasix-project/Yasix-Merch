import { useQuery } from "@tanstack/react-query";

import { analyticsService } from "../../api/analyticsService";

export const analyticsKeys = {
  dashboard: ["analytics", "dashboard"],
  sales: (dateFilter) => ["analytics", "sales", dateFilter],
};

export function useAnalytics(dateFilter, { enabled = true } = {}) {
  const dashboard = useQuery({
    queryKey: analyticsKeys.dashboard,
    queryFn: async () => {
      const response = await analyticsService.getDashboardMetrics();
      return response.data?.data || null;
    },
    enabled,
  });

  const sales = useQuery({
    queryKey: analyticsKeys.sales(dateFilter),
    queryFn: async () => {
      const response = await analyticsService.getSalesReport(dateFilter);
      return response.data?.data || null;
    },
    enabled,
  });

  return { dashboard, sales };
}
