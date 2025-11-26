import * as FileSystem from 'expo-file-system/legacy';
import { nanoid } from 'nanoid/non-secure';
import { Note, NoteFilters, NotePayload } from '../types/note';
import { NotesStorage } from './storageTypes';

const BASE_DIR =
  FileSystem.documentDirectory ??
  FileSystem.cacheDirectory ??
  (() => {
    throw new Error('File storage is not supported on this platform.');
  })();

const FILE_PATH = `${BASE_DIR}notes.json`;

// Создаём файл-хранилище, если он ещё не существует.
async function ensureFile(): Promise<void> {
  const info = await FileSystem.getInfoAsync(FILE_PATH);
  if (!info.exists) {
    await FileSystem.writeAsStringAsync(FILE_PATH, JSON.stringify([]));
  }
}

// Читаем весь JSON и десериализуем список заметок.
async function readNotes(): Promise<Note[]> {
  await ensureFile();
  const contents = await FileSystem.readAsStringAsync(FILE_PATH);
  return JSON.parse(contents) as Note[];
}

// Перезаписываем файл новым массивом заметок.
async function writeNotes(notes: Note[]): Promise<void> {
  await FileSystem.writeAsStringAsync(FILE_PATH, JSON.stringify(notes));
}

export const fileStorage: NotesStorage = {
  async init() {
    await ensureFile();
  },
  async list() {
    // Возвращаем заметки, отсортированные по обновлению.
    const notes = await readNotes();
    return notes.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  },
  async get(id) {
    // Находим заметку по идентификатору.
    const notes = await readNotes();
    return notes.find((n) => n.id === id) ?? null;
  },
  async upsert(id, payload) {
    // Обновляем существующую заметку или создаём новую.
    const now = new Date().toISOString();
    const notes = await readNotes();
    if (id) {
      const index = notes.findIndex((n) => n.id === id);
      if (index === -1) {
        throw new Error('Note not found');
      }
      const updated: Note = {
        ...notes[index],
        ...payload,
        updatedAt: now,
      };
      notes[index] = updated;
      await writeNotes(notes);
      return updated;
    }
    const note: Note = {
      id: nanoid(),
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    notes.push(note);
    await writeNotes(notes);
    return note;
  },
  async remove(id) {
    const notes = await readNotes();
    const filtered = notes.filter((n) => n.id !== id);
    await writeNotes(filtered);
  },
  async search(filters) {
    // Фильтруем массив заметок в памяти по переданным критериям.
    const notes = await readNotes();
    return notes
      .filter((note) => {
        const matchesQuery = filters.query
          ? note.title.toLowerCase().includes(filters.query.toLowerCase()) ||
            note.content.toLowerCase().includes(filters.query.toLowerCase())
          : true;
        const matchesDate = filters.date ? note.date === filters.date : true;
        const matchesTime = filters.time ? note.time === filters.time : true;
        return matchesQuery && matchesDate && matchesTime;
      })
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  },
  async exportAll() {
    // Используется при миграции данных между стораджами.
    return readNotes();
  },
  async importMany(notes) {
    // Полностью заменяет локальный файл переданным набором заметок.
    await writeNotes(notes);
  },
};
