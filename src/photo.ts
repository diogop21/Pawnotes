import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

// Opens the camera roll so the user can choose a square photo.
// Returns the photo's location, or null if they cancelled.
export async function pickPetPhoto(petId: string): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (result.canceled || !result.assets?.length) return null;
  const pickedUri = result.assets[0].uri;

  // The picker hands back a temporary file that the phone may clean up later.
  // Copy it into the app's own folder so the photo sticks around.
  if (Platform.OS === 'web') return pickedUri;
  try {
    const destination = new File(Paths.document, `pet-${petId}-${Date.now()}.jpg`);
    await new File(pickedUri).copy(destination);
    return destination.uri;
  } catch (e) {
    console.warn('Could not copy photo, using original location', e);
    return pickedUri;
  }
}

// Our own photo copies are named "pet-....jpg" and live in the app's documents folder.
function ownPhotoName(uri: string): string | null {
  const name = uri.split('/').pop() ?? '';
  return name.startsWith('pet-') ? name : null;
}

// iOS can move the app's folder when the app updates, so rebuild the
// photo's location from its file name instead of trusting the saved path.
export function resolvePhotoUri(uri: string | null): string | null {
  if (!uri || Platform.OS === 'web') return uri;
  const name = ownPhotoName(uri);
  if (!name) return uri;
  try {
    return new File(Paths.document, name).uri;
  } catch {
    return uri;
  }
}

// Removes an old photo we previously copied into the app's folder.
export function deletePetPhoto(uri: string | null): void {
  if (!uri || Platform.OS === 'web' || !ownPhotoName(uri)) return;
  try {
    const file = new File(resolvePhotoUri(uri)!);
    if (file.exists) file.delete();
  } catch (e) {
    console.warn('Could not delete old photo', e);
  }
}
