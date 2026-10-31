import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, space } from '../theme';

type Props = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

// A row of big tappable answers (e.g. Yes / No / Sometimes).
// Tapping the chosen answer again clears it.
export default function Choice({ label, options, value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${label}: ${option}`}
              onPress={() => onChange(selected ? '' : option)}
              style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space.md },
  label: { fontSize: font.small, fontWeight: '700', color: colors.textMuted, marginBottom: space.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    minHeight: 48,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { opacity: 0.75 },
  chipText: { fontSize: font.body, fontWeight: '700', color: colors.text },
  chipTextSelected: { color: colors.white },
});
