import { AWSProfile } from '../layouts/pages/aws/types/awsTypes';

export interface StorageService {
  loadFromLocalStorage: () => any;
  saveToLocalStorage: (state: any) => void;
}

export interface AWSProfileStorageService extends StorageService {
  loadFromLocalStorage: () => AWSProfile[];
  saveToLocalStorage: (state: AWSProfile[]) => void;
}

export class AWSProfileStorageServiceImpl implements AWSProfileStorageService {
  readonly storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  loadFromLocalStorage = (): AWSProfile[] => {
    try {
      const stateStr = localStorage.getItem(this.storageKey);
      return stateStr ? JSON.parse(stateStr) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  saveToLocalStorage = (state: AWSProfile[]): void => {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  };
}

export const awsProfileStorageService: AWSProfileStorageService =
  new AWSProfileStorageServiceImpl('profiles');
