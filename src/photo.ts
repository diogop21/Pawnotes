import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

// Largest side of a photo kept in a web browser. Browser storage is small,
// so the photo is shrunk and saved inside the pet's data instead of as a file.
const WEB_PHOTO_SIZE = 600;

export class CameraPermissionError extends Error {}

// Opens the camera or the camera roll so the user can take or choose a square photo.
// Returns the photo's location, or null if they cancelled.
export async function pickPetPhoto(petId: string, source: 'camera' | 'library'): Promise<string | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  };
  if (source === 'camera' && Platform.OS !== 'web') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new CameraPermissionError();
  }
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets?.length) return null;
  const pickedUri = result.assets[0].uri;

  // A browser's picked photo is a temporary link that stops working after a reload.
  if (Platform.OS === 'web') return shrinkForWeb(pickedUri);

  // The picker hands back a temporary file that the phone may clean up later.
  // Copy it into the app's own folder so the photo sticks around.
  try {
    const destination = new File(Paths.document, `pet-${petId}-${Date.now()}.jpg`);
    await new File(pickedUri).copy(destination);
    return destination.uri;
  } catch (e) {
    console.warn('Could not copy photo, using original location', e);
    return pickedUri;
  }
}

// Web only: draws the photo smaller and returns it as a "data:" link that can be saved.
function shrinkForWeb(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, WEB_PHOTO_SIZE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('No canvas'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = uri;
  });
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

// The photo as a self-contained "data:" link, for the printable card and backups.
export async function photoDataUri(uri: string | null): Promise<string | null> {
  if (!uri) return null;
  if (uri.startsWith('data:')) return uri;
  if (Platform.OS === 'web') return null;
  try {
    const file = new File(resolvePhotoUri(uri)!);
    if (!file.exists) return null;
    return `data:image/jpeg;base64,${await file.base64()}`;
  } catch (e) {
    console.warn('Could not read photo', e);
    return null;
  }
}

// Turns a "data:" photo from a backup back into a photo this device can show.
export async function restorePhoto(petId: string, dataUri: string): Promise<string | null> {
  if (Platform.OS === 'web') return dataUri;
  const base64 = dataUri.split(',')[1];
  if (!base64) return null;
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const file = new File(Paths.document, `pet-${petId}-${Date.now()}.jpg`);
    file.create({ overwrite: true });
    await file.write(bytes);
    return file.uri;
  } catch (e) {
    console.warn('Could not restore photo', e);
    return null;
  }
}
