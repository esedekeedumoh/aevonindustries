export type AppRole =
  | "super_admin"
  | "administrator"
  | "editor"
  | "content_manager"
  | "marketing_manager"
  | "support_manager"
  | "viewer";

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  administrator: "Administrator",
  editor: "Editor",
  content_manager: "Content Manager",
  marketing_manager: "Marketing Manager",
  support_manager: "Support Manager",
  viewer: "Viewer",
};

export const ALL_ROLES = Object.keys(ROLE_LABELS) as AppRole[];

export type ModuleKey =
  | "dashboard"
  | "products"
  | "categories"
  | "blog"
  | "media"
  | "team"
  | "careers"
  | "messages"
  | "subscribers"
  | "analytics"
  | "admins"
  | "settings"
  | "activity"
  | "backup"
  | "security";

type Perm = "view" | "manage";

const ALL_MODULES: ModuleKey[] = [
  "dashboard",
  "products",
  "categories",
  "blog",
  "media",
  "team",
  "careers",
  "messages",
  "subscribers",
  "analytics",
  "admins",
  "settings",
  "activity",
  "backup",
  "security",
];

/** module -> permissions granted, per role. */
export const ROLE_PERMISSIONS: Record<AppRole, Partial<Record<ModuleKey, Perm[]>>> = {
  super_admin: Object.fromEntries(ALL_MODULES.map((m) => [m, ["view", "manage"]])),
  administrator: Object.fromEntries(
    ALL_MODULES.filter((m) => m !== "backup").map((m) => [m, ["view", "manage"]]),
  ),
  editor: {
    dashboard: ["view"],
    products: ["view", "manage"],
    categories: ["view", "manage"],
    blog: ["view", "manage"],
    media: ["view", "manage"],
    team: ["view", "manage"],
    analytics: ["view"],
    activity: ["view"],
  },
  content_manager: {
    dashboard: ["view"],
    blog: ["view", "manage"],
    media: ["view", "manage"],
    products: ["view"],
    categories: ["view", "manage"],
    team: ["view", "manage"],
    analytics: ["view"],
  },
  marketing_manager: {
    dashboard: ["view"],
    blog: ["view", "manage"],
    subscribers: ["view", "manage"],
    messages: ["view", "manage"],
    analytics: ["view"],
    products: ["view"],
  },
  support_manager: {
    dashboard: ["view"],
    messages: ["view", "manage"],
    subscribers: ["view"],
    careers: ["view", "manage"],
    analytics: ["view"],
  },
  viewer: Object.fromEntries(ALL_MODULES.map((m) => [m, ["view"] as Perm[]])),
};

export function can(roles: AppRole[], module: ModuleKey, perm: Perm = "view"): boolean {
  return roles.some((role) => ROLE_PERMISSIONS[role]?.[module]?.includes(perm));
}

export function highestRole(roles: AppRole[]): AppRole | null {
  for (const role of ALL_ROLES) if (roles.includes(role)) return role;
  return null;
}
