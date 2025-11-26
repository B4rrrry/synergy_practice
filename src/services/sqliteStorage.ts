import * as SQLite from 'expo-sqlite';
import { nanoid } from 'nanoid/non-secure';
import { NotesStorage } from './storageTypes';
import { Note, NoteFilters, NotePayload } from '../types/note';

const DB_NAME = 'notes.db';
let db: SQLite.SQLiteDatabase | null = null;

// Ленивая инициализация подключения к базе SQLite и создание таблицы.
async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        noteDate TEXT NOT NULL,
        noteTime TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
  }
  return db;
}

// Преобразуем строку результата запроса в типизированную заметку.
const mapRow = (row: any): Note => ({
  id: row.id,
  title: row.title,
  content: row.content ?? '',
  date: row.noteDate,
  time: row.noteTime,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const sqliteStorage: NotesStorage = {
  async init() {
    await getDb();
  },
  async list() {
    // Получаем все заметки, отсортированные по дате обновления.
    const database = await getDb();
    const rows = await database.getAllAsync('SELECT * FROM notes ORDER BY updatedAt DESC;');
    return rows.map(mapRow);
  },
  async get(id) {
    // Берём одну заметку по идентификатору.
    const database = await getDb();
    const row = await database.getFirstAsync('SELECT * FROM notes WHERE id = ?;', [id]);
    return row ? mapRow(row) : null;
  },
  async upsert(id, payload) {
    // Обновляем или создаём заметку, возвращая актуальную версию.
    const database = await getDb();
    const now = new Date().toISOString();
    const noteId = id ?? nanoid();
    if (id) {
      await database.runAsync(
        `UPDATE notes
         SET title = ?, content = ?, noteDate = ?, noteTime = ?, updatedAt = ?
         WHERE id = ?;`,
        [payload.title, payload.content, payload.date, payload.time, now, noteId],
      );
      const updated = await this.get(noteId);
      if (!updated) throw new Error('Note not found after update');
      return updated;
    }
    await database.runAsync(
      `INSERT INTO notes (id, title, content, noteDate, noteTime, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [noteId, payload.title, payload.content, payload.date, payload.time, now, now],
    );
    const created = await this.get(noteId);
    if (!created) throw new Error('Note was not persisted');
    return created;
  },
  async remove(id) {
    // Удаляем заметку по идентификатору.
    const database = await getDb();
    await database.runAsync('DELETE FROM notes WHERE id = ?;', [id]);
  },
  async search(filters) {
    // Формируем SQL-запрос с произвольной комбинацией фильтров.
    const database = await getDb();
    const conditions: string[] = [];
    const params: any[] = [];
    if (filters.query) {
      conditions.push('(title LIKE ? OR content LIKE ?)');
      const pattern = `%${filters.query}%`;
      params.push(pattern, pattern);
    }
    if (filters.date) {
      conditions.push('noteDate = ?');
      params.push(filters.date);
    }
    if (filters.time) {
      conditions.push('noteTime = ?');
      params.push(filters.time);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await database.getAllAsync(
      `SELECT * FROM notes ${where} ORDER BY updatedAt DESC;`,
      params,
    );
    return rows.map(mapRow);
  },
  async exportAll() {
    // Используется при миграции данных между стораджами.
    return this.list();
  },
  async importMany(notes) {
    // Импортирует массив заметок в транзакции, чтобы сохранить согласованность.
    const database = await getDb();
    await database.execAsync('BEGIN TRANSACTION;');
    try {
      for (const note of notes) {
        await database.runAsync(
          `INSERT OR REPLACE INTO notes (id, title, content, noteDate, noteTime, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [note.id, note.title, note.content, note.date, note.time, note.createdAt, note.updatedAt],
        );
      }
      await database.execAsync('COMMIT;');
    } catch (error) {
      await database.execAsync('ROLLBACK;');
      throw error;
    }
  },
};
