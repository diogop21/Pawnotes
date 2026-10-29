import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyPet, Pet } from './types';

// All data lives on the phone under this one key.
const STORAGE_KEY = 'pawnotes.pets.v1';

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
    const pets = (parsed as Partial<Pet>[]).map((p) => ({ ...emptyPet(), ...p }) as Pet);
    return { ok: true, pets, recovered: false };
  } catch (e) {
    // The saved data is damaged. Keep a copy under another key before starting fresh,
    // so it can still be recovered later.
    console.warn('Saved pets are damaged, keeping a backup', e);
    try {
      await AsyncStorage.setItem(`${STORAGE_KEY}.damaged-${Date.now()}`, raw);
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
