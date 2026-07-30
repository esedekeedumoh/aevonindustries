import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "./rbac";

export type AdminProfile = {
  id: string;
  full_name: string;
  email: string;
  job_title: string | null;
  department: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: string;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
};

export type AdminSession = {
  userId: string;
  email: string;
  profile: AdminProfile | null;
  roles: AppRole[];
};

export const adminSessionQueryOptions = queryOptions({
  queryKey: ["admin", "session"],
  staleTime: 30_000,
  queryFn: async (): Promise<AdminSession | null> => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const [{ data: profile }, { data: roleRows }] = await Promise.all([
      supabase.from("admin_profiles").select("*").eq("id", data.user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", data.user.id),
    ]);
    return {
      userId: data.user.id,
      email: data.user.email ?? "",
      profile: (profile as AdminProfile | null) ?? null,
      roles: ((roleRows ?? []) as { role: AppRole }[]).map((r) => r.role),
    };
  },
});

export async function logActivity(input: {
  action: string;
  module: string;
  details?: Record<string, unknown>;
  status?: "success" | "failed";
}) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("activity_logs").insert({
    user_id: data.user.id,
    user_email: data.user.email ?? "",
    action: input.action,
    module: input.module,
    details: (input.details ?? {}) as never,
    status: input.status ?? "success",
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
  });
}

const list = <T,>(key: string, table: string, order: string, asc = true) =>
  queryOptions({
    queryKey: ["admin", key],
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await supabase
        .from(table as never)
        .select("*")
        .order(order, { ascending: asc });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  long_description: string | null;
  platform: string | null;
  status: string;
  version: string | null;
  website_url: string | null;
  download_url: string | null;
  docs_url: string | null;
  video_url: string | null;
  logo_url: string | null;
  images: string[];
  release_date: string | null;
  featured: boolean;
  archived: boolean;
  tags: string[];
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: string | null;
  tags: string[];
  author: string | null;
  status: string;
  comments_enabled: boolean;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  department: string | null;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  x_url: string | null;
  github_url: string | null;
  email: string | null;
  featured: boolean;
  sort_order: number;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
};

export type Subscriber = { id: string; email: string; created_at: string };

export type ActivityLog = {
  id: string;
  user_email: string | null;
  action: string;
  module: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  status: string;
  created_at: string;
};

export const adminProductsQuery = list<AdminProduct>("products", "products", "sort_order");
export const adminCategoriesQuery = list<Category>("categories", "categories", "sort_order");
export const adminBlogQuery = list<BlogPost>("blog", "blog_posts", "created_at", false);
export const adminTeamQuery = list<TeamMember>("team", "team_members", "sort_order");
export const adminMessagesQuery = list<ContactMessage>("messages", "contact_messages", "created_at", false);
export const adminSubscribersQuery = list<Subscriber>("subscribers", "newsletter_subscribers", "created_at", false);
export const adminActivityQuery = list<ActivityLog>("activity", "activity_logs", "created_at", false);
export const adminAdminsQuery = list<AdminProfile>("admins", "admin_profiles", "created_at", false);

export const adminRolesQuery = queryOptions({
  queryKey: ["admin", "roles"],
  queryFn: async () => {
    const { data, error } = await supabase.from("user_roles").select("user_id, role");
    if (error) throw error;
    return (data ?? []) as { user_id: string; role: AppRole }[];
  },
});

export const siteSettingsQuery = queryOptions({
  queryKey: ["admin", "settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) throw error;
    return (data ?? []) as { key: string; value: Record<string, unknown> }[];
  },
});
