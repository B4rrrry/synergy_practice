export type Note = {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  createdAt: string;
  updatedAt: string;
};

export type NotePayload = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;

export type NoteFilters = {
  query?: string;
  date?: string;
  time?: string;
};
