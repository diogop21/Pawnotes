import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Image, StyleSheet, Text, View } from 'react-native';
import { resolvePhotoUri } from '../photo';
import { colors, fonts } from '../theme';

type Props = {
  photoUri: string | null;
  name: string;
  size: number;
};

// The pet's ID tag: a marigold disc on a split ring, holding the photo,
// or the pet's initial "engraved" on it when there is no photo yet.
export default function PetTag({ photoUri, name, size }: Props) {
  const source = resolvePhotoUri(photoUri);
  const ring = Math.round(size * 0.2);
  const hole = Math.round(size * 0.07);
  const rim = Math.max(6, Math.round(size * 0.06));
  const inner = size - rim * 2;
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <View style={{ width: size, height: size + ring * 0.55, alignItems: 'center' }} accessibilityElementsHidden>
      <View
        style={[
          styles.ring,
          { width: ring, height: ring, borderRadius: ring / 2, borderWidth: Math.max(3, Math.round(size * 0.025)) },
        ]}
      />
      <View
        style={[
          styles.disc,
          { width: size, height: size, borderRadius: size / 2, marginTop: -ring * 0.45, padding: rim },
        ]}
      >
        {source ? (
          <Image source={{ uri: source }} style={{ width: inner, height: inner, borderRadius: inner / 2 }} />
        ) : (
          <View style={[styles.blank, { width: inner, height: inner, borderRadius: inner / 2 }]}>
            {initial ? (
              <Text style={[styles.initial, { fontSize: inner * 0.5, lineHeight: inner * 0.62 }]}>{initial}</Text>
            ) : (
              <FontAwesome5 name="paw" size={inner * 0.38} color={colors.ink} />
            )}
          </View>
        )}
        <View
          style={[
            styles.hole,
            { width: hole, height: hole, borderRadius: hole / 2, top: Math.max(2, (rim - hole) / 2) },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { borderColor: colors.inkSoft, backgroundColor: 'transparent', zIndex: 2 },
  disc: { backgroundColor: colors.marigold, alignItems: 'center', justifyContent: 'center' },
  blank: { backgroundColor: colors.marigold, alignItems: 'center', justifyContent: 'center' },
  initial: { fontFamily: fonts.display, color: colors.ink, textAlign: 'center' },
  hole: { position: 'absolute', backgroundColor: colors.page, alignSelf: 'center' },
});
