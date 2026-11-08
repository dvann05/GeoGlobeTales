import React from "react";
import {
  geoNaturalEarth1,
  geoMercator,
  geoOrthographic,
  geoPath,
} from "d3-geo";
import { useCurrentFrame, interpolate } from "remotion";
import type { FeatureCollection } from "geojson";

export type MapProjection =
  | "naturalEarth"
  | "mercator"
  | "orthographic";

type Props = {
  data: FeatureCollection;
  width?: number;
  height?: number;
  projection?: MapProjection;
  highlightIds?: Array<string | number>;
  highlightNames?: string[];
  highlightColor?: string;
  landColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  animate?: boolean;
  borderWidth?: number;
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const GeographicMap: React.FC<Props> = ({
  data,
  width = 1080,
  height = 1350,
  projection: projectionType = "naturalEarth",
  highlightIds = [],
  highlightNames = [],
  highlightColor = "#F07A1E",
  landColor = "#526B78",
  borderColor = "#B9CBD5",
  backgroundColor = "#071827",
  animate = true,
  borderWidth = 1,
}) => {
  const frame = useCurrentFrame();

  const projections = {
    naturalEarth: geoNaturalEarth1(),
    mercator: geoMercator(),
    orthographic: geoOrthographic(),
  };

  const projection = projections[projectionType].fitExtent(
    [[20, 20], [width - 20, height - 20]],
    data
  );

  const pathGenerator = geoPath().projection(projection);

  const reveal = animate
    ? interpolate(frame, [0, 30], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <svg width={width} height={height}
      viewBox={`0 0 ${width} ${height}`}>
      <rect width={width} height={height}
        fill={backgroundColor} />

      {data.features.map((item, index) => {
        const properties = item.properties ?? {};
        const id = String(item.id ?? properties.id ?? index);

        const names = Object.values(properties)
          .filter((value): value is string =>
            typeof value === "string"
          )
          .map(normalize);

        const selected =
          highlightIds.map(String).includes(id) ||
          highlightNames.some((name) =>
            names.includes(normalize(name))
          );

        return (
          <path
            key={`${id}-${index}`}
            d={pathGenerator(item) ?? ""}
            fill={selected ? highlightColor : landColor}
            fillOpacity={selected ? reveal : 1}
            stroke={borderColor}
            strokeWidth={borderWidth}
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
};
