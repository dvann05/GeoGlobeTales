import type { ProjectConfig } from "../../engine/timeline";

export const templateProject: ProjectConfig = {
  id: "new-geography-video",
  title: "New Geography Video",
  description: "Reusable starting template for a GeoGlobeTales project.",
  fps: 30,
  width: 1080,
  height: 1920,
  scenes: [
    {
      id: "opening",
      name: "Opening",
      durationSeconds: 5,
      layers: [
        {
          id: "opening-title",
          type: "text",
          text: "JUDUL VIDEO",
          x: 540,
          y: 850,
          fontSize: 76,
          color: "#172033",
          textAlign: "center",
        },
      ],
    },
    {
      id: "main-story",
      name: "Main Story",
      durationSeconds: 10,
      layers: [],
    },
    {
      id: "closing",
      name: "Closing",
      durationSeconds: 5,
      layers: [
        {
          id: "closing-title",
          type: "text",
          text: "PENUTUP",
          x: 540,
          y: 900,
          fontSize: 64,
          color: "#172033",
          textAlign: "center",
        },
      ],
    },
  ],
};
