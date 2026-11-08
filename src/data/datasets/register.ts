import { datasetRegistry } from "../DatasetRegistry";
import { worldDataset } from "../world";

datasetRegistry.register({
  id: "world-countries-110m",
  name: "World Countries 110m",
  level: "world",
  resolution: 1,
  source: "Natural Earth via world-atlas",
  features: worldDataset.features,
  coverage: ["world"],
});
