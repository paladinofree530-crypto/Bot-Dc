const VIDEO_DOMAINS = [
  "youtube.com",
  "youtu.be",
  "medal.tv",
  "streamable.com",
  "drive.google.com",
  "cdn.discordapp.com",
  "media.discordapp.net"
];

function extractUrls(text = "") {
  const regex = /(https?:\/\/[^\s]+)/gi;
  return text.match(regex) || [];
}

function classifyUrl(url) {
  const lower = url.toLowerCase();
  const matched = VIDEO_DOMAINS.find((d) => lower.includes(d));
  if (matched) return { url, type: "external_video_or_media", provider: matched };
  return { url, type: "link", provider: "unknown" };
}

function classifyAttachment(att) {
  const type = att.contentType || "unknown";
  if (type.startsWith("image/")) return "image_attachment";
  if (type.startsWith("video/")) return "video_attachment";
  if (type.startsWith("audio/")) return "audio_attachment";
  return "file_attachment";
}

module.exports = { extractUrls, classifyUrl, classifyAttachment };
