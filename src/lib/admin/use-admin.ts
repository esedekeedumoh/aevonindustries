import { useQuery } from "@tanstack/react-query";
import { adminSessionQueryOptions } from "./api";
import { can, type ModuleKey } from "./rbac";

export function useAdmin() {
  const { data: session, isLoading } = useQuery(adminSessionQueryOptions);
  const roles = session?.roles ?? [];
  return {
    session,
    roles,
    isLoading,
    canView: (m: ModuleKey) => can(roles, m, "view"),
    canManage: (m: ModuleKey) => can(roles, m, "manage"),
  };
}
