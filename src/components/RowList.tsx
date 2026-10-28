import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { newId } from '../types';
import { colors, font, radius, space } from '../theme';
import BigButton from './BigButton';

export type RowField<T> = {
  key: keyof T & string;
  label: string;
  placeholder: string;
};

type Props<T extends { id: string }> = {
  title: string;
  items: T[];
  fields: RowField<T>[];
  makeEmpty: () => Omit<T, 'id'>;
  addLabel: string;
  onChange: (items: T[]) => void;
};

// An editable list (feedings, walks, meds, quirks...) with add and remove buttons.
export default function RowList<T extends { id: string }>({
  title,
  items,
  fields,
  makeEmpty,
  addLabel,
  onChange,
}: Props<T>) {
  const update = (id: string, key: keyof T, value: string) =>
    onChange(items.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  const remove = (id: string) => onChange(items.filter((item) => item.id !== id));
  const add = () => onChange([...items, { ...makeEmpty(), id: newId() } as T]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {items.length === 0 && <Text style={styles.empty}>Nothing added yet.</Text>}
      {items.map((item, index) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.rowHeader}>
            <Text style={styles.rowNumber}>#{index + 1}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove item ${index + 1}`}
              onPress={() => remove(item.id)}
              hitSlop={12}
              style={styles.removeBtn}
            >
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
          {fields.map((field) => (
            <TextInput
              key={field.key}
              accessibilityLabel={field.label}
              value={String(item[field.key] ?? '')}
              onChangeText={(text) => update(item.id, field.key, text)}
              placeholder={field.placeholder}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          ))}
        </View>
      ))}
      <BigButton label={`+ ${addLabel}`} variant="secondary" onPress={add} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space.lg },
  title: { fontSize: font.large, fontWeight: '800', color: colors.text, marginBottom: space.sm },
  empty: { fontSize: font.body, color: colors.textMuted, marginBottom: space.md },
  row: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: space.md,
    marginBottom: space.md,
  },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
  rowNumber: { fontSize: font.small, fontWeight: '700', color: colors.textMuted },
  removeBtn: { paddingVertical: space.xs, paddingHorizontal: space.sm },
  removeText: { fontSize: font.small, fontWeight: '700', color: colors.danger },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontSize: font.body,
    color: colors.text,
    minHeight: 52,
    marginBottom: space.sm,
  },
});
