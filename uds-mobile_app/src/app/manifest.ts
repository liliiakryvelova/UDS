import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Ukraine Defense Support Events — Volunteer App",
    short_name: "Ukraine Defense Support Events",
    description: "Discover UDS events and find your next way to help.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#f3f7fc",
    theme_color: "#1859a9",
    categories: ["lifestyle", "social"],
    icons: [
      { src: "/app-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
