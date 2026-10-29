import { StatusBar } from 'expo-status-bar';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BigButton from './src/components/BigButton';
import { DialogProvider, useDialogs } from './src/dialogs';
import { deletePetPhoto } from './src/photo';
import EditScreen from './src/screens/EditScreen';
import HomeScreen, { MAX_PETS } from './src/screens/HomeScreen';
import PetScreen from './src/screens/PetScreen';
import { loadPets, savePets } from './src/storage';
import { colors, font, space } from './src/theme';
import { emptyPet, Pet, SectionKey } from './src/types';

// Which screen is showing. Kept as simple state (no navigation library)
// so the app runs the same in Expo Go and on Expo Snack.
type Route =
  | { name: 'home' }
  | { name: 'pet'; petId: string }
  | { name: 'edit'; petId: string; section: SectionKey }
  | { name: 'new'; draft: Pet };

export default function App() {
  return (
    <SafeAreaProvider>
      <DialogProvider>
        <StatusBar style="light" />
        <PawNotes />
      </DialogProvider>
    </SafeAreaProvider>
  );
}

function PawNotes() {
  const { notify } = useDialogs();
  const [pets, setPets] = useState<Pet[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [route, setRoute] = useState<Route>({ name: 'home' });

  const load = useCallback(() => {
    setLoadFailed(false);
    loadPets().then((result) => {
      if (!result.ok) {
        setLoadFailed(true);
        return;
      }
      setPets(result.pets);
      if (result.recovered) {
        notify(
          'Saved data could not be read',
          'PawNotes found damaged data on this device and kept a backup copy of it. You are starting with an empty list.',
        );
      }
    });
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  // Saves first and only updates the screen if that worked, so nothing looks saved when it isn't.
  const updatePets = useCallback(
    async (next: Pet[]) => {
      if (!(await savePets(next))) {
        notify(
          'Could not save',
          'PawNotes could not save your changes on this device. If you added a photo, try a smaller one or free up some space, then try again.',
        );
        return false;
      }
      setPets(next);
      return true;
    },
    [notify],
  );

  const goBack = useCallback(() => {
    if (route.name === 'edit') setRoute({ name: 'pet', petId: route.petId });
    else if (route.name !== 'home') setRoute({ name: 'home' });
  }, [route]);

  // Android hardware back button goes back one screen instead of closing the app.
  // Edit screens handle it themselves so they can ask before throwing away changes.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.name === 'home' || route.name === 'edit' || route.name === 'new') return false;
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [route, goBack]);

  if (loadFailed) {
    return (
      <View style={[styles.center, styles.failed]}>
        <Text style={styles.failedTitle}>Could not open your pets</Text>
        <Text style={styles.failedText}>
          PawNotes could not read its saved data. Nothing has been changed. Please try again.
        </Text>
        <BigButton label="Try again" onPress={load} />
      </View>
    );
  }

  if (!pets) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const findPet = (id: string) => pets.find((p) => p.id === id);
  let screen: ReactNode;

  if (route.name === 'new') {
    screen = (
      <EditScreen
        pet={route.draft}
        section="profile"
        isNew
        onCancel={() => setRoute({ name: 'home' })}
        onSave={async (pet) => {
          if (await updatePets([...pets, pet])) setRoute({ name: 'pet', petId: pet.id });
        }}
      />
    );
  } else if (route.name === 'edit' && findPet(route.petId)) {
    const original = findPet(route.petId)!;
    screen = (
      <EditScreen
        key={`${route.petId}-${route.section}`}
        pet={original}
        section={route.section}
        isNew={false}
        onCancel={goBack}
        onSave={async (updated) => {
          if (!(await updatePets(pets.map((p) => (p.id === updated.id ? updated : p))))) return;
          if (original.photoUri !== updated.photoUri) deletePetPhoto(original.photoUri);
          goBack();
        }}
      />
    );
  } else if (route.name === 'pet' && findPet(route.petId)) {
    const pet = findPet(route.petId)!;
    screen = (
      <PetScreen
        pet={pet}
        onBack={() => setRoute({ name: 'home' })}
        onEdit={(section) => setRoute({ name: 'edit', petId: pet.id, section })}
        onDelete={async () => {
          if (!(await updatePets(pets.filter((p) => p.id !== pet.id)))) return;
          deletePetPhoto(pet.photoUri);
          setRoute({ name: 'home' });
        }}
      />
    );
  } else {
    screen = (
      <HomeScreen
        pets={pets}
        onOpenPet={(petId) => setRoute({ name: 'pet', petId })}
        onAddPet={() => {
          if (pets.length < MAX_PETS) setRoute({ name: 'new', draft: emptyPet() });
        }}
      />
    );
  }

  return screen;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  failed: { padding: space.lg, gap: space.md },
  failedTitle: { fontSize: font.large, fontWeight: '800', color: colors.text, textAlign: 'center' },
  failedText: { fontSize: font.body, color: colors.textMuted, textAlign: 'center', lineHeight: 26 },
});
