import React from "react";
import { Composition } from "remotion";

const MainVideo: React.FC = () => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#071827",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "Arial",
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 800 }}>
        GEOGLOBETALES
      </div>
      <div style={{ fontSize: 28, marginTop: 20 }}>
        Geographic Region Reveal Studio
      </div>
    </div>
  );
};

export const Root: React.FC = () => {
  return (
    <Composition
      id="GeoGlobeTales"
      component={MainVideo}
      durationInFrames={240}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
