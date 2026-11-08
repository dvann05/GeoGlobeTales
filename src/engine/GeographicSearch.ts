import {
  geographicDataManager,
} from "./GeographicDataManager";

export function searchMultipleRegions(names: string[]) {
  return names.map((name) => ({
    query: name,
    ...geographicDataManager.search(name),
  }));
}
