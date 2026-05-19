// 📍 Ruta: src/services/social-videos.service.ts

import { supabase } from "../lib/supabase";

export type SocialVideo = {
  id: string;
  platform: string;
  title: string;
  video_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export async function getActiveSocialVideos(): Promise<SocialVideo[]> {
  const { data, error } = await supabase
    .from("social_videos")
    .select("id, platform, title, video_url, is_active, sort_order, created_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading social videos:", error);
    return [];
  }

  return (data ?? []) as SocialVideo[];
}
