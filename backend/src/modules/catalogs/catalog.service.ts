import { catalogRepository } from './catalog.repository';

export const catalogService = {
  listAssetTypes: () => catalogRepository.findAssetTypes(),
  listLocations: () => catalogRepository.findLocations(),
};