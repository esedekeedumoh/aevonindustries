import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  platform: string | null;
  status: string;
  website_url: string | null;
  logo_url: string | null;
  images: string[];
  release_date: string | null;
  featured: boolean;
  tags: string[];
  sort_order: number;
};

export const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Product[];
  },
});
