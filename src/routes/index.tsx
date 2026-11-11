import { createFileRoute } from "@tanstack/react-router";
import { SimpegApp } from "@/components/simpeg-app";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SIMPEG-Monitoring Bapperida Lombok Barat" },
      {
        name: "description",
        content:
          "Ruang kerja administrasi kepegawaian Bapperida Lombok Barat untuk pemantauan ASN, kenaikan pangkat, KGB, KP4, dan simulasi TPP.",
      },
      { property: "og:title", content: "SIMPEG-Monitoring Bapperida Lombok Barat" },
      {
        property: "og:description",
        content:
          "Pemantauan kepegawaian, keluarga, dan perencanaan penghasilan Bapperida Lombok Barat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return <SimpegApp />;
}
