import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, NoteFilters, NotePayload } from '../types/note';
import { StorageMode } from '../services/storageTypes';
import { getStorage } from '../services';

type NotesContextValue = {
  notes: Note[];
  loading: boolean;
  storageMode: StorageMode;
  setStorageMode(mode: StorageMode): Promise<void>;
  createNote(payload: NotePayload): Promise<void>;
  updateNote(id: string, payload: NotePayload): Promise<void>;
  deleteNote(id: string): Promise<void>;
  refresh(filters?: NoteFilters): Promise<void>;
  search(filters: NoteFilters): Promise<void>;
  resetSearch(): Promise<void>;
};

// Контекст, предоставляющий данные и операции с заметками на уровне всего приложения.
const NotesContext = createContext<NotesContextValue | undefined>(undefined);

const STORAGE_MODE_KEY = 'NotesDeskStorageMode';

// Сохраняем выбранный тип хранилища между запусками приложения.
async function rememberStorageMode(mode: StorageMode) {
  await AsyncStorage.setItem(STORAGE_MODE_KEY, mode);
}

// Читаем ранее сохранённый тип хранилища; по умолчанию используем SQLite.
async function readStorageMode(): Promise<StorageMode> {
  const stored = await AsyncStorage.getItem(STORAGE_MODE_KEY);
  return stored === 'file' ? 'file' : 'sqlite';
}

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [storageMode, setStorageModeState] = useState<StorageMode>('sqlite');
  const [loading, setLoading] = useState(false);
  const storage = useMemo(() => getStorage(storageMode), [storageMode]);

  // Загружаем список заметок из текущего хранилища, с учётом фильтров поиска.
  const loadNotes = useCallback(
    async (filters?: NoteFilters) => {
      setLoading(true);
      try {
        await storage.init();
        const data = filters ? await storage.search(filters) : await storage.list();
        setNotes(data);
      } catch (error) {
        console.error(error);
        Alert.alert('Ошибка', 'Не удалось загрузить заметки.');
      } finally {
        setLoading(false);
      }
    },
    [storage],
  );

  // Переключаемся между SQLite и файловой системой, перенося все заметки.
  const switchStorage = useCallback(
    async (mode: StorageMode) => {
      if (mode === storageMode) return;
      try {
        const newStorage = getStorage(mode);
        await newStorage.init();
        const backup = await storage.exportAll();
        await newStorage.importMany(backup);
        setStorageModeState(mode);
        await rememberStorageMode(mode);
        setNotes(await newStorage.list());
      } catch (error) {
        console.error(error);
        Alert.alert('Ошибка', 'Не удалось переключить хранилище.');
        throw error;
      }
    },
    [storage, storageMode],
  );

  // Создаём новую заметку через выбранное хранилище и перезагружаем список.
  const createNote = useCallback(
    async (payload: NotePayload) => {
      await storage.upsert(null, payload);
      await loadNotes();
    },
    [storage, loadNotes],
  );

  // Обновляем существующую заметку и перезагружаем список.
  const updateNote = useCallback(
    async (id: string, payload: NotePayload) => {
      await storage.upsert(id, payload);
      await loadNotes();
    },
    [storage, loadNotes],
  );

  // Удаляем заметку и обновляем список.
  const deleteNote = useCallback(
    async (id: string) => {
      await storage.remove(id);
      await loadNotes();
    },
    [storage, loadNotes],
  );

  // Выполняем поиск по заданным фильтрам.
  const search = useCallback(
    async (filters: NoteFilters) => {
      await loadNotes(filters);
    },
    [loadNotes],
  );

  // Сбрасываем фильтры и показываем полный список.
  const resetSearch = useCallback(async () => loadNotes(), [loadNotes]);

  // При первом запуске читаем режим хранилища и загружаем заметки.
  useEffect(() => {
    (async () => {
      try {
        const mode = await readStorageMode();
        setStorageModeState(mode);
        await getStorage(mode).init();
        await loadNotes();
      } catch (error) {
        console.error(error);
        Alert.alert('Ошибка', 'Не удалось инициализировать приложение.');
      }
    })();
  }, [loadNotes]);

  const value: NotesContextValue = {
    notes,
    loading,
    storageMode,
    setStorageMode: switchStorage,
    createNote,
    updateNote,
    deleteNote,
    refresh: loadNotes,
    search,
    resetSearch,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within NotesProvider');
  }
  return context;
};
