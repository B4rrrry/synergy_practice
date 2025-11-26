import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Note } from '../types/note';
import { formatDate, formatTime } from '../utils/datetime';

type Props = {
  note: Note;
  onPress(): void;
  onDelete(): void;
};

export const NoteCard: React.FC<Props> = ({ note, onPress, onDelete }) => (
  <Pressable onPress={onPress} style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.title}>{note.title}</Text>
      <Pressable onPress={onDelete} style={styles.delete}>
        <Text style={styles.deleteText}>×</Text>
      </Pressable>
    </View>
    <Text style={styles.meta}>
      {formatDate(note.date)} · {formatTime(note.time)}
    </Text>
    <Text numberOfLines={3} style={styles.content}>
      {note.content}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 12, color: '#111827' },
  meta: { color: '#6b7280', marginTop: 4, marginBottom: 8, fontSize: 13 },
  content: { color: '#1f2937', fontSize: 14, lineHeight: 18 },
  delete: { paddingHorizontal: 8, paddingVertical: 4 },
  deleteText: { fontSize: 22, color: '#ef4444', fontWeight: '600' },
});
