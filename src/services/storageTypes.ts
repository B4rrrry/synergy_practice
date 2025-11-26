import { Note, NoteFilters, NotePayload } from '../types/note';

export type StorageMode = 'sqlite' | 'file';

export interface NotesStorage {
  init(): Promise<void>;
  list(): Promise<Note[]>;
  get(id: string): Promise<Note | null>;
  upsert(id: string | null, payload: NotePayload): Promise<Note>;
  remove(id: string): Promise<void>;
  search(filters: NoteFilters): Promise<Note[]>;
  exportAll(): Promise<Note[]>;
  importMany(notes: Note[]): Promise<void>;
}
