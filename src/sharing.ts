import { useCallback } from 'react';
import { Share } from 'react-native';
import { shareCard as makeCard } from './card';
import { useDialogs } from './dialogs';
import { buildShareText, petName } from './shareText';
import { HomeInfo, Pet } from './types';

// Share actions used by the Home and Pet screens, with friendly messages when something fails.
export function useSharing() {
  const { notify, showText } = useDialogs();

  const shareText = useCallback(
    async (pets: Pet[], home: HomeInfo) => {
      const message = buildShareText(pets, home);
      try {
        await Share.share({ message, title: `PawNotes for ${pets.map(petName).join(' & ')}` });
      } catch {
        // No share sheet (e.g. a desktop browser): show the text so it can be copied instead.
        showText('Copy and send to your sitter', message);
      }
    },
    [showText],
  );

  const shareCard = useCallback(
    async (pets: Pet[], home: HomeInfo) => {
      try {
        await makeCard(pets, home);
      } catch (e) {
        console.warn('Could not make card', e);
        notify('Could not make the card', 'Something went wrong making the PDF. Please try again.');
      }
    },
    [notify],
  );

  return { shareText, shareCard };
}
