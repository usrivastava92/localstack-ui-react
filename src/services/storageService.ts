export interface StorageService {
  loadFromLocalStorage: () => any,
  saveToLocalStorage: (state: any) => void
}

export class LocalStorageService implements StorageService {
  storageKey: string

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  loadFromLocalStorage = (): any => {
    try {
      const stateStr = localStorage.getItem(this.storageKey);
      return stateStr ? JSON.parse(stateStr) : [];
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  saveToLocalStorage = (state: any): void => {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  }
}

export let profileStorageService: LocalStorageService = new LocalStorageService("profiles");


