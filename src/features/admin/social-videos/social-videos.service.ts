// 📍 Ruta: src/features/admin/social-videos/social-videos.service.ts

import { supabase } from "../../../lib/supabase";

export type AdminSocialVideo = {
  id: string;
  platform: string;
  title: string;
  video_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type SocialVideoFormData = {
  id?: string;
  title: string;
  video_url: string;
  is_active: boolean;
  sort_order: string;
};

export function createEmptySocialVideoForm(): SocialVideoFormData {
  return {
    title: "",
    video_url: "",
    is_active: true,
    sort_order: "1",
  };
}

export function socialVideoToForm(
  video: AdminSocialVideo,
): SocialVideoFormData {
  return {
    id: video.id,
    title: video.title,
    video_url: video.video_url,
    is_active: video.is_active,
    sort_order: String(video.sort_order ?? 1),
  };
}

export async function getAdminSocialVideos(): Promise<AdminSocialVideo[]> {
  const { data, error } = await supabase
    .from("social_videos")
    .select("id, platform, title, video_url, is_active, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading social videos:", error);
    throw new Error("No se pudieron cargar los videos.");
  }

  return (data ?? []) as AdminSocialVideo[];
}

export async function saveAdminSocialVideo(form: SocialVideoFormData) {
  const title = form.title.trim();
  const videoUrl = form.video_url.trim();

  if (!title) {
    throw new Error("El título es requerido.");
  }

  if (!videoUrl) {
    throw new Error("El link de TikTok es requerido.");
  }

  if (!videoUrl.includes("tiktok.com")) {
    throw new Error("El link debe ser de TikTok.");
  }

  const payload = {
    platform: "tiktok",
    title,
    video_url: videoUrl,
    is_active: form.is_active,
    sort_order: Number(form.sort_order || 1),
  };

  if (form.id) {
    const { error } = await supabase
      .from("social_videos")
      .update(payload)
      .eq("id", form.id);

    if (error) {
      console.error("Error updating social video:", error);
      throw new Error("No se pudo actualizar el video.");
    }

    return true;
  }

  const { error } = await supabase.from("social_videos").insert(payload);

  if (error) {
    console.error("Error creating social video:", error);
    throw new Error("No se pudo crear el video.");
  }

  return true;
}

export async function deleteAdminSocialVideo(id: string) {
  const { error } = await supabase.from("social_videos").delete().eq("id", id);

  if (error) {
    console.error("Error deleting social video:", error);
    throw new Error("No se pudo eliminar el video.");
  }

  return true;
}
