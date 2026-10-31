import { Image, StyleSheet, Text, View } from 'react-native';
import { resolvePhotoUri } from '../photo';
import { colors } from '../theme';

// Round pet photo, or a paw emoji when there is no photo yet.
export default function PetAvatar({ uri, size }: { uri: string | null; size: number }) {
  const shape = { width: size, height: size, borderRadius: size / 2 };
  const source = resolvePhotoUri(uri);
  if (source) return <Image source={{ uri: source }} style={[styles.base, shape]} />;
  return (
    <View style={[styles.base, styles.placeholder, shape]}>
      <Text style={{ fontSize: size * 0.45 }}>🐾</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.primarySoft },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
});
