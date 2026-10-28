import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, space } from '../theme';

type Props = {
  title: string;
  onBack?: () => void;
};

// The colored bar at the top of each screen, with an optional Back button.
export default function Header({ title, onBack }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
      {onBack ? (
        <Pressable accessibilityRole="button" onPress={onBack} hitSlop={16} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
      ) : null}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.primary,
    paddingHorizontal: space.md,
    paddingBottom: space.md,
  },
  back: { alignSelf: 'flex-start', paddingVertical: space.xs, marginBottom: space.xs },
  backText: { color: colors.white, fontSize: font.body, fontWeight: '700' },
  title: { color: colors.white, fontSize: font.title, fontWeight: '800' },
});
