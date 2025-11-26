import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useNotes } from '../providers/NotesProvider';
import { NotePayload } from '../types/note';
import { currentTime, todayDate } from '../utils/datetime';

type Props = NativeStackScreenProps<RootStackParamList, 'EditNote'>;

const emptyForm = (): NotePayload => ({
  title: '',
  content: '',
  date: todayDate(),
  time: currentTime(),
});

export default function EditNoteScreen({ navigation, route }: Props) {
  const { createNote, updateNote } = useNotes();
  const [form, setForm] = useState<NotePayload>(emptyForm());

  useEffect(() => {
    if (route.params?.note) {
      const { title, content, date, time } = route.params.note;
      setForm({ title, content, date, time });
    } else {
      setForm(emptyForm());
    }
  }, [route.params?.note]);

  const onSave = async () => {
    if (!form.title.trim()) {
      Alert.alert('Пустой заголовок', 'Введите заголовок заметки');
      return;
    }
    const payload: NotePayload = {
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
      date: form.date.trim(),
      time: form.time.trim(),
    };
    if (route.params?.note) {
      await updateNote(route.params.note.id, payload);
    } else {
      await createNote(payload);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Заголовок</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={(text) => setForm((prev) => ({ ...prev, title: text }))}
          placeholder="Напр., Совещание 12.05"
        />
        <View style={styles.row}>
          <View style={[styles.col, styles.colSpacer]}>
            <Text style={styles.label}>Дата</Text>
            <TextInput
              style={styles.input}
              value={form.date}
              onChangeText={(value) => setForm((prev) => ({ ...prev, date: value }))}
              placeholder="ГГГГ-ММ-ДД"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Время</Text>
            <TextInput
              style={styles.input}
              value={form.time}
              onChangeText={(value) => setForm((prev) => ({ ...prev, time: value }))}
              placeholder="ЧЧ:ММ"
            />
          </View>
        </View>
        <Text style={styles.label}>Содержание</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={form.content}
          onChangeText={(text) => setForm((prev) => ({ ...prev, content: text }))}
          placeholder="Кратко фиксируйте решения, поручения и т. д."
          multiline
          numberOfLines={10}
        />
        <Text style={styles.save} onPress={onSave}>
          Сохранить
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  form: { padding: 16 },
  label: { fontWeight: '600', marginBottom: 6, color: '#374151' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  multiline: { height: 180, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  col: { flex: 1 },
  colSpacer: { marginRight: 12 },
  save: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    fontWeight: '600',
    fontSize: 16,
  },
});
