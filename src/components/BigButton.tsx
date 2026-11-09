import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, fonts, radius, size, space } from '../theme';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  // Smaller text and padding, for two buttons side by side on a phone.
  compact?: boolean;
  style?: ViewStyle;
};

// A large, thumb-friendly button.
export default function BigButton({ label, onPress, variant = 'primary', disabled, compact, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        box[variant],
        compact && styles.compact,
        pressed && pressedBox[variant],
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text numberOfLines={1} style={[styles.label, compact && styles.compactLabel, text[variant]]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 60,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  compact: { minHeight: 52, paddingHorizontal: space.sm },
  disabled: { opacity: 0.5 },
  label: { fontFamily: fonts.bodyBold, fontSize: size.body },
  compactLabel: { fontSize: size.small },
});

const box = StyleSheet.create({
  primary: { backgroundColor: colors.marigold, borderColor: colors.marigold },
  secondary: { backgroundColor: colors.paper, borderColor: colors.line },
  danger: { backgroundColor: 'transparent', borderColor: colors.alert },
});

const pressedBox = StyleSheet.create({
  primary: { backgroundColor: colors.marigoldDeep, borderColor: colors.marigoldDeep },
  secondary: { borderColor: colors.inkSoft },
  danger: { backgroundColor: colors.alertTint },
});

const text = StyleSheet.create({
  primary: { color: colors.ink },
  secondary: { color: colors.ink },
  danger: { color: colors.alert },
});
