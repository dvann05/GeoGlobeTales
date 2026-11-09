import { geographicDataManager } from "./GeographicDataManager";

export function searchMultipleRegions(names: string[]) {
  return names.map((name) => ({
    ...geographicDataManager.search(name),
    query: name,
  }));
}
