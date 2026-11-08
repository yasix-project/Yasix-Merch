import { useQuery } from "@tanstack/react-query";

import { analyticsService } from "../../api/analyticsService";

export const analyticsKeys = {
  dashboard: (dateFilter) => ["analytics", "dashboard", dateFilter],
  sales: (dateFilter) => ["analytics", "sales", dateFilter],
};

export function useAnalytics(dateFilter = "7days", { enabled = true } = {}) {
  const dashboard = useQuery({
    queryKey: analyticsKeys.dashboard(dateFilter),
    queryFn: async () => {
      const response = await analyticsService.getDashboardMetrics(dateFilter);
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
