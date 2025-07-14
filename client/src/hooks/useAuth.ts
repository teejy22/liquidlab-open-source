import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout");
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout,
  };
}