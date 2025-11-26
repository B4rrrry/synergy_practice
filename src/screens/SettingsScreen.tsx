import React from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useNotes } from '../providers/NotesProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({}: Props) {
  const { storageMode, setStorageMode, refresh } = useNotes();

  const onChangeMode = async (mode: 'sqlite' | 'file') => {
    if (mode === storageMode) return;
    Alert.alert(
      'Переключение хранилища',
      'Все заметки будут перенесены в новое хранилище. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Перенести',
          style: 'default',
          onPress: async () => {
            await setStorageMode(mode);
            await refresh();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.sectionTitle}>Выбор хранилища</Text>
      <View style={styles.card}>
        <Text style={styles.label}>
          Текущее: <Text style={styles.bold}>{storageMode === 'sqlite' ? 'SQLite' : 'Файлы'}</Text>
        </Text>
        <Text style={styles.button} onPress={() => onChangeMode('sqlite')}>
          Использовать SQLite
        </Text>
        <Text style={styles.button} onPress={() => onChangeMode('file')}>
          Использовать файловую систему
        </Text>
      </View>
      <Text style={styles.sectionTitle}>ВАЖНО!</Text>
      <View style={styles.card}>
        <Text style={styles.tip}>
          • Переключение между хранилищами автоматически переносит все заметки.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#111827' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  label: { marginBottom: 12, color: '#374151' },
  bold: { fontWeight: '700' },
  button: {
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 12,
  },
  tip: { color: '#4b5563', marginBottom: 8, lineHeight: 18 },
});
