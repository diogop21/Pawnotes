import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, font, radius, space } from '../theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
};

// A labelled text box with big, readable text.
export default function Field({ label, multiline, ...inputProps }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        multiline={multiline}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space.md },
  label: { fontSize: font.small, fontWeight: '700', color: colors.textMuted, marginBottom: space.xs },
  input: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    fontSize: font.body,
    color: colors.text,
    minHeight: 56,
  },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
});
