import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyPet, Pet } from './types';

// All data lives on the phone under this one key.
const STORAGE_KEY = 'pawnotes.pets.v1';

export async function loadPets(): Promise<Pet[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<Pet>[];
    // Fill in any missing fields so older saved data keeps working.
    return parsed.map((p) => ({ ...emptyPet(), ...p }) as Pet);
  } catch (e) {
    console.warn('Could not load pets', e);
    return [];
  }
}

export async function savePets(pets: Pet[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
  } catch (e) {
    console.warn('Could not save pets', e);
  }
}
