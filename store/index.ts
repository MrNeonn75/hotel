export * from './favoritesStore';
export * from './historyStore';
export * from './profileStore';

import { useProfileStore } from './profileStore';

// Alias for backward compatibility
export const useAppStore = useProfileStore;
