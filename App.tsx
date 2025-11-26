import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NotesProvider } from './src/providers/NotesProvider';
import NotesListScreen from './src/screens/NotesListScreen';
import EditNoteScreen from './src/screens/EditNoteScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { Note } from './src/types/note';

export type RootStackParamList = {
  NotesList: undefined;
  EditNote: { note?: Note } | undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NotesProvider>
      <NavigationContainer theme={DefaultTheme}>
        <Stack.Navigator>
          <Stack.Screen
            name="NotesList"
            component={NotesListScreen}
            options={{ title: 'Заметки организации' }}
          />
          <Stack.Screen
            name="EditNote"
            component={EditNoteScreen}
            options={({ route }) => ({
              title: route.params?.note ? 'Редактирование' : 'Новая заметка',
            })}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Настройки' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NotesProvider>
  );
}
