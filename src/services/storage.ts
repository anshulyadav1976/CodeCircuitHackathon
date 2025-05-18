import localforage from 'localforage';
// Import Zustand stores
import { useCardStore, useDeckStore, useStatsStore, useUIStore } from '../store'; // Assuming store/index.ts is implicitly found

// Configure localforage
localforage.config({
  name: 'flashcard-app-zustand', // Potentially update name to reflect new structure
  version: 1.0,
  storeName: 'flashcard_app_storage', // Main storeName for the app
  description: 'Storage for flashcard application data'
});

// Generic CRUD operations
export async function getItem<T>(store: LocalForage, key: string): Promise<T | null> {
  try {
    return await store.getItem<T>(key);
  } catch (error) {
    console.error('Error getting item', error);
    return null;
  }
}

export async function setItem<T>(store: LocalForage, key: string, value: T): Promise<T | null> {
  try {
    return await store.setItem<T>(key, value);
  } catch (error) {
    console.error('Error setting item', error);
    return null;
  }
}

export async function removeItem(store: LocalForage, key: string): Promise<void> {
  try {
    await store.removeItem(key);
  } catch (error) {
    console.error('Error removing item', error);
  }
}

export async function getAllItems<T>(store: LocalForage): Promise<Record<string, T>> {
  try {
    const keys = await store.keys();
    const items: Record<string, T> = {};
    
    for (const key of keys) {
      const item = await store.getItem<T>(key);
      if (item) {
        items[key] = item;
      }
    }
    
    return items;
  } catch (error) {
    console.error('Error getting all items', error);
    return {};
  }
}

// Import/Export functions
export async function exportData(): Promise<string> {
  try {
    // Get the full state from each Zustand store
    const cardStoreState = useCardStore.getState();
    const deckStoreState = useDeckStore.getState();
    const statsStoreState = useStatsStore.getState();
    const uiStoreState = useUIStore.getState();
    
    const exportObject = {
      cardStoreFullState: cardStoreState,
      deckStoreFullState: deckStoreState,
      statsStoreFullState: statsStoreState,
      uiStoreFullState: uiStoreState,
      exportDate: new Date().toISOString(),
      version: 2 // New version for this export structure
    };
    
    return JSON.stringify(exportObject, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
}

export async function importData(jsonString: string): Promise<void> {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.version || data.version !== 2) {
      throw new Error('Incompatible data version or old format. Please export data again from the latest version.');
    }
    
    // Replace the entire state of each store
    // The `true` argument to setState is often used in older Zustand versions to signify replacement.
    // For modern Zustand (v4+), setState merges by default. 
    // To replace, you'd typically do: set(() => newState)
    // However, the persist middleware might rehydrate based on the new state structure anyway.
    // Let's use the typical setState which merges, but since we provide full state, it should effectively replace.
    // Or, if persist rehydration is smart, just setting the new state should be enough.
    // A safer way if setState merges is to ensure the persist middleware clears old keys if the structure changes drastically,
    // or to manually clear localForage for the store keys before setting new state if needed.

    // For Zustand v4+, setState merges. To fully replace, the persist middleware
    // should handle rehydration from the new structure correctly when the app reloads
    // after import, or we might need a more specific rehydration strategy.
    // A common pattern for full replacement with persist is to update the state,
    // and the persist middleware will then write that complete new state.

    if (data.cardStoreFullState) {
      useCardStore.setState(data.cardStoreFullState, true); // `true` for replace (might depend on Zustand version / middleware)
    }
    if (data.deckStoreFullState) {
      useDeckStore.setState(data.deckStoreFullState, true);
    }
    if (data.statsStoreFullState) {
      useStatsStore.setState(data.statsStoreFullState, true);
    }
    if (data.uiStoreFullState) {
      // Be careful with UI store, as some parts might not be desirable to fully overwrite (e.g. transient state)
      // For preferences, this is fine.
      useUIStore.setState(data.uiStoreFullState, true);
    }

    // Important: The application will likely need to be reloaded or components re-rendered
    // for all parts of the UI to reflect the new imported state, especially if using selectors
    // that don't automatically pick up direct setState replacements without new object identities for the top-level state.
    // The Settings.tsx page already does window.location.reload(); after import, which is good.

  } catch (error) {
    console.error('Error importing data:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to import data: ${error.message}`);
    } else {
        throw new Error('Failed to import data due to an unknown error.');
    }
  }
}
