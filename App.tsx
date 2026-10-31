import { StatusBar } from 'expo-status-bar';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { exportBackup, readBackup, unpackBackup } from './src/backup';
import { DialogProvider, useDialogs } from './src/dialogs';
import { deletePetPhoto } from './src/photo';
import EditScreen from './src/screens/EditScreen';
import HomeInfoScreen from './src/screens/HomeInfoScreen';
import HomeScreen from './src/screens/HomeScreen';
import PetScreen from './src/screens/PetScreen';
import { loadHome, loadPets, saveHome, savePets } from './src/storage';
import { colors } from './src/theme';
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
  const [route, setRoute] = useState<Route>({ name: 'home' });

  useEffect(() => {
    loadPets().then(setPets);
    loadHome().then(setHome);
  }, []);

  const updatePets = useCallback((next: Pet[]) => {
    setPets(next);
    savePets(next);
  }, []);

  const updateHome = useCallback((next: HomeInfo) => {
    setHome(next);
    saveHome(next);
  }, []);

  const goBack = useCallback(() => {
    if (route.name === 'edit') setRoute({ name: 'pet', petId: route.petId });
    else if (route.name !== 'home') setRoute({ name: 'home' });
  }, [route]);

  // Android hardware back button goes back one screen instead of closing the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.name === 'home') return false;
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [route, goBack]);

  if (!pets || !home) {
    return (
      <View style={styles.loading}>
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
      pets.forEach((p) => deletePetPhoto(p.photoUri));
      updatePets(restored.pets);
      updateHome(restored.home);
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
        onSave={(pet) => {
          updatePets([...pets, pet]);
          setRoute({ name: 'pet', petId: pet.id });
        }}
      />
    );
  } else if (route.name === 'home-info') {
    screen = (
      <HomeInfoScreen
        home={home}
        onCancel={goBack}
        onSave={(next) => {
          updateHome(next);
          goBack();
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
        onSave={(updated) => {
          if (original.photoUri !== updated.photoUri) deletePetPhoto(original.photoUri);
          updatePets(pets.map((p) => (p.id === updated.id ? updated : p)));
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
        onDelete={() => {
          deletePetPhoto(pet.photoUri);
          updatePets(pets.filter((p) => p.id !== pet.id));
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
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
