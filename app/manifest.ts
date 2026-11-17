import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Smart Bus",
    short_name: "Smart Bus",
    description: "Know whether your bus is really coming.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6f9",
    theme_color: "#12315e",
    icons: [{ src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" }],
  };
}
