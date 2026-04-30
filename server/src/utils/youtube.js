export const extractYouTubeVideoId = (value = "") => {
  const input = String(value || "").trim();
  if (!input) return "";

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/i,
    /(?:youtu\.be\/)([\w-]{11})/i,
    /(?:youtube\.com\/embed\/)([\w-]{11})/i,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/i
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return "";
};

export const buildYouTubeEmbedUrl = (videoId = "") =>
  videoId ? `https://www.youtube.com/embed/${videoId}` : "";

export const buildYouTubeWatchUrl = (videoId = "") =>
  videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";

export const buildYouTubeThumbnailUrl = (videoId = "") =>
  videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
