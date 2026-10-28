import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, font, radius, space } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
};

// A large, thumb-friendly button.
export default function BigButton({ label, onPress, variant = 'primary', disabled, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, variant !== 'primary' && styles[`${variant}Label`]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 58,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primarySoft },
  danger: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.danger },
  ghost: { backgroundColor: 'transparent' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
  label: { color: colors.white, fontSize: font.large, fontWeight: '700' },
  secondaryLabel: { color: colors.primaryDark },
  dangerLabel: { color: colors.danger },
  ghostLabel: { color: colors.primaryDark },
});
