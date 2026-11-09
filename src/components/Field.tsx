import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radius, size, space } from '../theme';

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
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={colors.inkSoft}
        style={[styles.input, multiline && styles.multiline, focused && styles.focused]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  label: { fontFamily: fonts.bodyBold, fontSize: size.small, color: colors.inkSoft },
  input: {
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: size.body,
    color: colors.ink,
    minHeight: 58,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  focused: { borderColor: colors.marigoldDeep },
});
