import { StatusBar } from 'expo-status-bar';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { exportBackup, readBackup, unpackBackup } from './src/backup';
import BigButton from './src/components/BigButton';
import { DialogProvider, useDialogs } from './src/dialogs';
import { deletePetPhoto } from './src/photo';
import EditScreen from './src/screens/EditScreen';
import HomeInfoScreen from './src/screens/HomeInfoScreen';
import HomeScreen from './src/screens/HomeScreen';
import PetScreen from './src/screens/PetScreen';
import { loadHome, loadPets, saveHome, savePets } from './src/storage';
import { colors, font, space } from './src/theme';
import { emptyPet, HomeInfo, Pet, SectionKey } from './src/types';

// Which screen is showing. Kept as simple state (no navigation library)
// so the app runs the same in Expo Go and on Expo Snack.
type Route =
  | { name: 'home' }
  | { name: 'home-info' }
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
  const { notify, confirm } = useDialogs();
  const [pets, setPets] = useState<Pet[] | null>(null);
  const [home, setHome] = useState<HomeInfo | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [route, setRoute] = useState<Route>({ name: 'home' });

  const load = useCallback(() => {
    setLoadFailed(false);
    Promise.all([loadPets(), loadHome()]).then(([result, savedHome]) => {
      if (!result.ok || !savedHome) {
        setLoadFailed(true);
        return;
      }
      setPets(result.pets);
      setHome(savedHome);
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

  const updateHome = useCallback(
    async (next: HomeInfo) => {
      if (!(await saveHome(next))) {
        notify('Could not save', 'PawNotes could not save the home details on this device. Please try again.');
        return false;
      }
      setHome(next);
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
      if (route.name === 'home' || route.name === 'edit' || route.name === 'new' || route.name === 'home-info') return false;
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

  if (!pets || !home) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const backup = async () => {
    try {
      await exportBackup(pets, home);
    } catch (e) {
      console.warn('Backup failed', e);
      notify('Could not make a backup', 'Something went wrong saving the backup file. Please try again.');
    }
  };

  const restore = async () => {
    try {
      const picked = await readBackup();
      if (!picked) return;
      const { backup: file } = picked;
      const date = new Date(file.exportedAt).toLocaleDateString();
      const count = file.pets.length;
      const ok = await confirm(
        'Restore this backup?',
        `It has ${count} ${count === 1 ? 'pet' : 'pets'} and was made on ${date}. It replaces all pets and home details on this device.`,
        'Restore',
      );
      if (!ok) return;
      const restored = await unpackBackup(file);
      // Only remove the old photos once the restored pets are safely saved.
      if (!(await updatePets(restored.pets))) {
        restored.pets.forEach((p) => deletePetPhoto(p.photoUri));
        return;
      }
      pets.forEach((p) => deletePetPhoto(p.photoUri));
      if (!(await updateHome(restored.home))) return;
      notify('Backup restored', 'Your pets and home details are back.');
    } catch (e) {
      console.warn('Restore failed', e);
      notify('Could not restore', 'That file is not a PawNotes backup, or it could not be read.');
    }
  };

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
  } else if (route.name === 'home-info') {
    screen = (
      <HomeInfoScreen
        home={home}
        onCancel={goBack}
        onSave={async (next) => {
          if (await updateHome(next)) goBack();
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
        home={home}
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
        home={home}
        onOpenPet={(petId) => setRoute({ name: 'pet', petId })}
        onAddPet={() => setRoute({ name: 'new', draft: emptyPet() })}
        onEditHome={() => setRoute({ name: 'home-info' })}
        onBackup={backup}
        onRestore={restore}
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
