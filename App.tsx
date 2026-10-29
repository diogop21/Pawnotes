import { StatusBar } from 'expo-status-bar';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DialogProvider } from './src/dialogs';
import { deletePetPhoto } from './src/photo';
import EditScreen from './src/screens/EditScreen';
import HomeScreen, { MAX_PETS } from './src/screens/HomeScreen';
import PetScreen from './src/screens/PetScreen';
import { loadPets, savePets } from './src/storage';
import { colors } from './src/theme';
import { emptyPet, Pet, SectionKey } from './src/types';

// Which screen is showing. Kept as simple state (no navigation library)
// so the app runs the same in Expo Go and on Expo Snack.
type Route =
  | { name: 'home' }
  | { name: 'pet'; petId: string }
  | { name: 'edit'; petId: string; section: SectionKey }
  | { name: 'new'; draft: Pet };

export default function App() {
  const [pets, setPets] = useState<Pet[] | null>(null);
  const [route, setRoute] = useState<Route>({ name: 'home' });

  useEffect(() => {
    loadPets().then(setPets);
  }, []);

  const updatePets = useCallback((next: Pet[]) => {
    setPets(next);
    savePets(next);
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

  if (!pets) {
    return (
      <View style={styles.loading}>
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
        onSave={(pet) => {
          updatePets([...pets, pet]);
          setRoute({ name: 'pet', petId: pet.id });
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
        onOpenPet={(petId) => setRoute({ name: 'pet', petId })}
        onAddPet={() => {
          if (pets.length < MAX_PETS) setRoute({ name: 'new', draft: emptyPet() });
        }}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <DialogProvider>
        <StatusBar style="light" />
        {screen}
      </DialogProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
