import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeInfo, normalizeHome, normalizePet, Pet } from './types';

// All data lives on the phone under these keys.
const STORAGE_KEY = 'pawnotes.pets.v1';
const HOME_KEY = 'pawnotes.home.v1';

export async function loadPets(): Promise<Pet[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<Pet>[];
    return parsed.map((p) => {
      const pet = normalizePet(p);
      // In a web browser an old chosen photo may be a temporary link that stops working after a reload.
      if (pet.photoUri?.startsWith('blob:')) pet.photoUri = null;
      return pet;
    });
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

export async function loadHome(): Promise<HomeInfo> {
  try {
    const raw = await AsyncStorage.getItem(HOME_KEY);
    return normalizeHome(raw ? (JSON.parse(raw) as Partial<HomeInfo>) : null);
  } catch (e) {
    console.warn('Could not load home info', e);
    return normalizeHome(null);
  }
}

export async function saveHome(home: HomeInfo): Promise<void> {
  try {
    await AsyncStorage.setItem(HOME_KEY, JSON.stringify(home));
  } catch (e) {
    console.warn('Could not save home info', e);
  }
}
