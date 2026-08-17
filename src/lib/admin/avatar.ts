import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Resolves an avatar value that is either an absolute URL or a storage path. */
export function useAvatarUrl(value: string | null | undefined) {
  const isPath = Boolean(value) && !/^https?:\/\//i.test(value ?? "") && !value?.startsWith("data:");
  const { data } = useQuery({
    queryKey: ["admin", "avatar", value],
    enabled: isPath,
    staleTime: 30 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("avatars")
        .createSignedUrl(value as string, 60 * 60);
      if (error) return null;
      return data.signedUrl;
    },
  });
  if (!value) return null;
  return isPath ? (data ?? null) : value;
}

export async function uploadAvatar(userId: string, file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  if (file.size > 3 * 1024 * 1024) throw new Error("Image must be smaller than 3MB");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}
