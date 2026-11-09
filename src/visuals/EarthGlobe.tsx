import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useLoader } from "@react-three/fiber";
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  CatmullRomCurve3,
  Float32BufferAttribute,
  LineBasicMaterial,
  MeshBasicMaterial,
  SphereGeometry,
  TextureLoader,
  TubeGeometry,
  Vector3,
} from "three";
import {
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

import { worldDataset } from "../data/world";

const DEG = Math.PI / 180;
const RADIUS = 1.43;

const FOCUS_LONGITUDES = [
  25, 105, 118, 118, 120, 130, 118, 118,
];

const FOCUS_LATITUDES = [
  0, -2, -4, -2, -4, -3, -2, -2,
];

function geographicPoint(
  longitude: number,
  latitude: number,
  radius = RADIUS,
) {
  const lon = longitude * DEG;
  const lat = latitude * DEG;

  return new Vector3(
    -radius * Math.cos(lat) * Math.sin(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.cos(lon),
  );
}

function createCountryBorders() {
  const positions: number[] = [];

  const addRing = (ring: number[][]) => {
    for (let i = 1; i < ring.length; i++) {
      const previous = ring[i - 1];
      const current = ring[i];

      if (Math.abs(current[0] - previous[0]) > 180) {
        continue;
      }

      const a = geographicPoint(previous[0], previous[1], 1.445);
      const b = geographicPoint(current[0], current[1], 1.445);

      positions.push(
        a.x, a.y, a.z,
        b.x, b.y, b.z,
      );
    }
  };

  for (const feature of worldDataset.features) {
    const geometry = feature.geometry;
    if (!geometry) continue;

    if (geometry.type === "Polygon") {
      for (const ring of geometry.coordinates) {
        addRing(ring as number[][]);
      }
    }

    if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates) {
        for (const ring of polygon) {
          addRing(ring as number[][]);
        }
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new Float32BufferAttribute(positions, 3),
  );

  return geometry;
}

function createGraticule() {
  const positions: number[] = [];

  for (let latitude = -75; latitude <= 75; latitude += 15) {
    for (let longitude = -180; longitude < 180; longitude += 3) {
      const a = geographicPoint(longitude, latitude, 1.438);
      const b = geographicPoint(longitude + 3, latitude, 1.438);

      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }

  for (let longitude = -180; longitude < 180; longitude += 30) {
    for (let latitude = -87; latitude < 87; latitude += 3) {
      const a = geographicPoint(longitude, latitude, 1.438);
      const b = geographicPoint(longitude, latitude + 3, 1.438);

      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new Float32BufferAttribute(positions, 3),
  );

  return geometry;
}

const ROUTE_COORDINATES = [
  [
    [95, 5],
    [106, -6],
    [118, -3],
    [130, -4],
  ],
  [
    [106, -6],
    [120, -2],
    [132, -5],
    [140, -2],
  ],
] as const;

const EarthScene: React.FC<{
  sceneIndex: number;
  localFrame: number;
  sceneDuration: number;
  zoom: number;
}> = ({ sceneIndex, localFrame, sceneDuration, zoom }) => {
  const frame = useCurrentFrame();

  const texture = useLoader(
    TextureLoader,
    staticFile("images/earth/earth-blue-marble.jpg"),
  );

  const countryBorders = useMemo(
    () => createCountryBorders(),
    [],
  );

  const graticule = useMemo(
    () => createGraticule(),
    [],
  );

  const routes = useMemo(() => {
    return ROUTE_COORDINATES.map((coordinates) => {
      const points = coordinates.map((coordinate, index) => {
        const elevation =
          1.465 +
          Math.sin(
            (index / (coordinates.length - 1)) * Math.PI,
          ) * 0.10;

        return geographicPoint(
          coordinate[0],
          coordinate[1],
          elevation,
        );
      });

      const curve = new CatmullRomCurve3(points);

      return {
        curve,
        geometry: new TubeGeometry(
          curve,
          100,
          0.006,
          8,
          false,
        ),
        glowGeometry: new TubeGeometry(
          curve,
          100,
          0.018,
          8,
          false,
        ),
      };
    });
  }, []);

  const index = Math.min(
    FOCUS_LONGITUDES.length - 1,
    Math.max(0, sceneIndex),
  );

  const previousIndex = Math.max(0, index - 1);

  const longitude = interpolate(
    localFrame,
    [0, Math.max(1, sceneDuration)],
    [
      FOCUS_LONGITUDES[previousIndex],
      FOCUS_LONGITUDES[index],
    ],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const latitude = interpolate(
    localFrame,
    [0, Math.max(1, sceneDuration)],
    [
      FOCUS_LATITUDES[previousIndex],
      FOCUS_LATITUDES[index],
    ],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const globeScale = interpolate(
    zoom,
    [1.1, 2.25],
    [0.98, 1.20],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <>
      <ambientLight intensity={0.48} />

      <directionalLight
        position={[-4, 3, 5]}
        intensity={2.0}
      />

      <pointLight
        position={[3, -2, -3]}
        intensity={0.7}
        color="#278BFF"
      />

      <group
        rotation={[
          -latitude * DEG,
          longitude * DEG,
          0,
        ]}
        scale={globeScale}
      >
        {/* BUMI */}
        <mesh>
          <sphereGeometry args={[RADIUS, 128, 128]} />
          <meshStandardMaterial
            map={texture}
            roughness={1}
            metalness={0}
          />
        </mesh>

        {/* ATMOSFER */}
        <mesh>
          <sphereGeometry args={[1.485, 96, 96]} />
          <meshBasicMaterial
            color="#48B9FF"
            transparent
            opacity={0.13}
            blending={AdditiveBlending}
            side={BackSide}
            depthWrite={false}
          />
        </mesh>

        {/* GARIS KOORDINAT */}
        <lineSegments geometry={graticule}>
          <lineBasicMaterial
            color="#8DD9FF"
            transparent
            opacity={0.16}
          />
        </lineSegments>

        {/* BATAS NEGARA NATURAL EARTH */}
        <lineSegments geometry={countryBorders}>
          <lineBasicMaterial
            color="#D7EEFF"
            transparent
            opacity={0.52}
          />
        </lineSegments>

        {/* JALUR GEOGRAFIS */}
        {routes.map((route, index) => {
          const progress = (
            (frame / 135 + index * 0.34) % 1
          );

          const position = route.curve
            .getPointAt(progress)
            .toArray();

          return (
            <group key={index}>
              <mesh geometry={route.glowGeometry}>
                <meshBasicMaterial
                  color="#00A9FF"
                  transparent
                  opacity={0.22}
                  blending={AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>

              <mesh geometry={route.geometry}>
                <meshBasicMaterial
                  color="#62E5FF"
                />
              </mesh>

              {/* TITIK CAHAYA BERGERAK */}
              <mesh position={position}>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshBasicMaterial
                  color="#FFFFFF"
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    </>
  );
};

export const EarthGlobe: React.FC<{
  width: number;
  height: number;
  sceneIndex: number;
  localFrame: number;
  sceneDuration: number;
  zoom: number;
}> = (props) => {
  return (
    <ThreeCanvas
      width={props.width}
      height={props.height}
      camera={{
        position: [0, 0, 5.8],
        fov: 36,
      }}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
      }}
    >
      <EarthScene {...props} />
    </ThreeCanvas>
  );
};
