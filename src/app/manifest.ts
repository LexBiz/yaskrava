import type {MetadataRoute} from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yaskrava",
    short_name: "Yaskrava",
    description: "Auto leasing & financing platform",
    start_url: "/",
    display: "standalone",
    background_color: "#1a0d00",
    theme_color: "#FF7918",
    icons: [
      {
        src: "/apple-touch-icon.png",
        sizes: "1188x1188",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "1188x1188",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
