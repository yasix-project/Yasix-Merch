import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { studentService } from "../../api/studentService";

export const studentKeys = {
  all: ["students"],
  list: (search) => ["students", search],
};

export function useStudents({ search = "", enabled = true } = {}) {
  return useQuery({
    queryKey: studentKeys.list(search),
    queryFn: async () => {
      const response = await studentService.getAll({ search });
      return response.data;
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useStudentMutations() {
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: ({ id, data }) =>
      id ? studentService.update(id, data) : studentService.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: studentKeys.all }),
  });

  const remove = useMutation({
    mutationFn: (id) => studentService.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: studentKeys.all }),
  });

  const bulkRemove = useMutation({
    mutationFn: async (ids) => {
      const results = await Promise.allSettled(
        ids.map((id) => studentService.delete(id)),
      );

      return results.reduce((failedIds, result, index) => {
        if (result.status === "rejected") {
          failedIds.push(ids[index]);
        }
        return failedIds;
      }, []);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: studentKeys.all }),
  });

  return { save, remove, bulkRemove };
}
