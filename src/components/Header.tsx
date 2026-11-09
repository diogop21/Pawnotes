import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, size, space } from '../theme';

type Props = {
  title?: string;
  onBack?: () => void;
  backLabel?: string;
};

// Top of each screen: a round Back button and the screen's title.
export default function Header({ title, onBack, backLabel = 'Back' }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + space.sm }]}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          onPress={onBack}
          hitSlop={8}
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
          <Text style={styles.backText}>{backLabel}</Text>
        </Pressable>
      ) : null}
      {title ? (
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingHorizontal: space.md, paddingBottom: space.sm, gap: space.md, backgroundColor: colors.page },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: 48,
    paddingLeft: space.sm,
    paddingRight: space.md,
    borderRadius: radius.round,
    backgroundColor: colors.paper,
  },
  backPressed: { backgroundColor: colors.line },
  backText: { fontFamily: fonts.bodyBold, fontSize: size.body, color: colors.ink, marginLeft: 2 },
  title: { fontFamily: fonts.display, fontSize: size.title, color: colors.ink, lineHeight: 38 },
});
