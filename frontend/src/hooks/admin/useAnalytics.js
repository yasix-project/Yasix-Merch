import { useQuery } from "@tanstack/react-query";

import { analyticsService } from "../../api/analyticsService";

export const analyticsKeys = {
  dashboard: (filterParams) => ["analytics", "dashboard", filterParams],
  sales: (filterParams) => ["analytics", "sales", filterParams],
};

export function useAnalytics(filterParams = "7days", { enabled = true } = {}) {
  const dashboard = useQuery({
    queryKey: analyticsKeys.dashboard(filterParams),
    queryFn: async () => {
      const response = await analyticsService.getDashboardMetrics(filterParams);
      return response.data?.data || null;
    },
    enabled,
  });

  const sales = useQuery({
    queryKey: analyticsKeys.sales(filterParams),
    queryFn: async () => {
      const response = await analyticsService.getSalesReport(filterParams);
      return response.data?.data || null;
    },
    enabled,
  });

  return { dashboard, sales };
}
