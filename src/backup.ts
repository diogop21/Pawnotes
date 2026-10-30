import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { photoDataUri, restorePhoto } from './photo';
import { HomeInfo, normalizeHome, normalizePet, Pet } from './types';

// A backup is one JSON file with every pet (photos included) and the home info.
// Save it somewhere safe (email, cloud drive) and restore it on a new phone.

type BackupFile = {
  app: 'pawnotes';
  version: 1;
  exportedAt: string;
  home: HomeInfo;
  pets: (Pet & { photoData: string | null })[];
};

export type Restored = { pets: Pet[]; home: HomeInfo; exportedAt: string };

function fileName(): string {
  return `PawNotes-backup-${new Date().toISOString().slice(0, 10)}.json`;
}

export async function exportBackup(pets: Pet[], home: HomeInfo): Promise<void> {
  const backup: BackupFile = {
    app: 'pawnotes',
    version: 1,
    exportedAt: new Date().toISOString(),
    home,
    pets: await Promise.all(
      pets.map(async (p) => ({ ...p, photoUri: null, photoData: await photoDataUri(p.photoUri) })),
    ),
  };
  const json = JSON.stringify(backup);

  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName();
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return;
  }

  const file = new File(Paths.cache, fileName());
  file.create({ overwrite: true });
  await file.write(json);
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Save your PawNotes backup',
  });
}

// Lets the user pick a backup file and reads it.
// Returns null if they cancelled; throws if the file isn't a PawNotes backup.
export async function readBackup(): Promise<{ backup: BackupFile } | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];

  let text: string;
  if (Platform.OS === 'web') {
    text = asset.file ? await asset.file.text() : await (await fetch(asset.uri)).text();
  } else {
    text = await new File(asset.uri).text();
  }

  const parsed = JSON.parse(text) as Partial<BackupFile>;
  if (parsed.app !== 'pawnotes' || !Array.isArray(parsed.pets)) {
    throw new Error('Not a PawNotes backup');
  }
  return { backup: parsed as BackupFile };
}

// Turns a backup into pets and home info for this device, saving the photos again.
export async function unpackBackup(backup: BackupFile): Promise<Restored> {
  const pets = await Promise.all(
    backup.pets.map(async ({ photoData, ...p }) => {
      const pet = normalizePet(p);
      pet.photoUri = photoData ? await restorePhoto(pet.id, photoData) : null;
      return pet;
    }),
  );
  return { pets, home: normalizeHome(backup.home), exportedAt: backup.exportedAt };
}
