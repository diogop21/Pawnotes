import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, size, space } from '../theme';

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
    <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel={label}>
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
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && (selected ? styles.chipSelectedPressed : styles.chipPressed),
              ]}
            >
              <Text style={styles.chipText}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  label: { fontFamily: fonts.bodyBold, fontSize: size.small, color: colors.inkSoft },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    minHeight: 50,
    paddingHorizontal: space.md,
    borderRadius: radius.round,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipPressed: { borderColor: colors.inkSoft },
  chipSelected: { backgroundColor: colors.marigold, borderColor: colors.marigold },
  chipSelectedPressed: { backgroundColor: colors.marigoldDeep, borderColor: colors.marigoldDeep },
  chipText: { fontFamily: fonts.bodyBold, fontSize: size.body, color: colors.ink },
});
