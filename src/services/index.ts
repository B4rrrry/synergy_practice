import { fileStorage } from './fileStorage';
import { sqliteStorage } from './sqliteStorage';
import { NotesStorage, StorageMode } from './storageTypes';

export function getStorage(mode: StorageMode): NotesStorage {
  return mode === 'sqlite' ? sqliteStorage : fileStorage;
}
