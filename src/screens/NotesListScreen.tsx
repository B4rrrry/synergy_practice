import React, { useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useNotes } from '../providers/NotesProvider';
import { NoteCard } from '../components/NoteCard';
import { NoteFilters } from '../types/note';
import { todayDate } from '../utils/datetime';

type Props = NativeStackScreenProps<RootStackParamList, 'NotesList'>;

export default function NotesListScreen({ navigation }: Props) {
  const { notes, loading, deleteNote, search, resetSearch } = useNotes();
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Text style={styles.link} onPress={() => navigation.navigate('Settings')}>
          Настройки
        </Text>
      ),
    });
  }, [navigation]);

  const applyFilters = async () => {
    const filters: NoteFilters = {};
    if (query.trim()) filters.query = query.trim();
    if (date.trim()) filters.date = date.trim();
    if (time.trim()) filters.time = time.trim();
    await search(filters);
  };

  const clearFilters = async () => {
    setQuery('');
    setDate('');
    setTime('');
    await resetSearch();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filters}>
        <TextInput
          placeholder="Поиск по заголовку или содержанию"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
        <TextInput placeholder={todayDate()} value={date} onChangeText={setDate} style={styles.input} />
        <TextInput placeholder="ЧЧ:ММ" value={time} onChangeText={setTime} style={styles.input} />
        <View style={styles.actions}>
          <Text style={styles.link} onPress={applyFilters}>
            Найти
          </Text>
          <Text style={[styles.link, styles.actionSecondary]} onPress={clearFilters}>
            Сброс
          </Text>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onPress={() => navigation.navigate('EditNote', { note: item })}
              onDelete={() => deleteNote(item.id)}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Заметки не найдены</Text>}
          contentContainerStyle={notes.length === 0 ? styles.emptyContainer : undefined}
        />
      )}
      <Text style={styles.fab} onPress={() => navigation.navigate('EditNote')}>
        +
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16, position: 'relative' },
  filters: { marginBottom: 12 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  actionSecondary: { marginLeft: 16 },
  link: { color: '#2563eb', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 32 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    backgroundColor: '#2563eb',
    color: '#fff',
    borderRadius: 28,
    fontSize: 36,
    lineHeight: 56,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
});
