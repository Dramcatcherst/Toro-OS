import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TORO",
    short_name: "TORO",
    description: "Portal privado para coordinar operación, herramientas y evidencia autorizada.",
    start_url: "/portal",
    display: "standalone",
    background_color: "#010511",
    theme_color: "#052456",
    lang: "es-CR",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
