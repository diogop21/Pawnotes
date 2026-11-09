import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeInfo, normalizeHome, normalizePet, Pet } from './types';

// All data lives on the phone under these keys.
const STORAGE_KEY = 'pawnotes.pets.v1';
const HOME_KEY = 'pawnotes.home.v1';

// "ok: false" means we could not read what's saved. The app must not save over it then,
// or the user's pets would be lost for good.
export type LoadResult = { ok: true; pets: Pet[]; recovered: boolean } | { ok: false };

export async function loadPets(): Promise<LoadResult> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not load pets', e);
    return { ok: false };
  }
  if (!raw) return { ok: true, pets: [], recovered: false };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Saved pets are not a list');
    // Fill in any missing fields so older saved data keeps working.
    const pets = (parsed as Partial<Pet>[]).map((p) => {
      const pet = normalizePet(p);
      // In a web browser an old chosen photo may be a temporary link that stops working after a reload.
      if (pet.photoUri?.startsWith('blob:')) pet.photoUri = null;
      return pet;
    });
    return { ok: true, pets, recovered: false };
  } catch (e) {
    // The saved data is damaged. Keep a copy under another key before starting fresh,
    // so it can still be recovered later.
    console.warn('Saved pets are damaged, keeping a backup', e);
    try {
      await AsyncStorage.setItem(`${STORAGE_KEY}.damaged-${Date.now()}`, raw);
      // The copy is safe, so clear the damaged data. Otherwise the warning shows on every launch.
      await AsyncStorage.removeItem(STORAGE_KEY);
      return { ok: true, pets: [], recovered: true };
    } catch (backupError) {
      console.warn('Could not back up damaged pets', backupError);
      return { ok: false };
    }
  }
}

// Returns false if the pets could not be saved (for example, storage is full).
export async function savePets(pets: Pet[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    return true;
  } catch (e) {
    console.warn('Could not save pets', e);
    return false;
  }
}

// Returns null if the home info could not be read, so the app won't save over it.
// Damaged home info is kept under another key and replaced with an empty one.
export async function loadHome(): Promise<HomeInfo | null> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(HOME_KEY);
  } catch (e) {
    console.warn('Could not load home info', e);
    return null;
  }
  if (!raw) return normalizeHome(null);
  try {
    return normalizeHome(JSON.parse(raw) as Partial<HomeInfo>);
  } catch (e) {
    console.warn('Saved home info is damaged, keeping a backup', e);
    try {
      await AsyncStorage.setItem(`${HOME_KEY}.damaged-${Date.now()}`, raw);
      await AsyncStorage.removeItem(HOME_KEY);
      return normalizeHome(null);
    } catch {
      return null;
    }
  }
}

// Returns false if the home info could not be saved.
export async function saveHome(home: HomeInfo): Promise<boolean> {
  try {
    await AsyncStorage.setItem(HOME_KEY, JSON.stringify(home));
    return true;
  } catch (e) {
    console.warn('Could not save home info', e);
    return false;
  }
}
