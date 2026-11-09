import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { newId } from '../types';
import { colors, fonts, radius, size, space } from '../theme';
import BigButton from './BigButton';

export type RowField<T> = {
  key: keyof T & string;
  label: string;
  placeholder: string;
};

type Props<T extends { id: string }> = {
  title: string;
  itemName: string;
  items: T[];
  fields: RowField<T>[];
  makeEmpty: () => Omit<T, 'id'>;
  onChange: (items: T[]) => void;
};

// An editable list (feedings, walks, meds, quirks...) with add and remove buttons.
export default function RowList<T extends { id: string }>({
  title,
  itemName,
  items,
  fields,
  makeEmpty,
  onChange,
}: Props<T>) {
  const update = (id: string, key: keyof T, value: string) =>
    onChange(items.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  const remove = (id: string) => onChange(items.filter((item) => item.id !== id));
  const add = () => onChange([...items, { ...makeEmpty(), id: newId() } as T]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {items.map((item, index) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.rowHeader}>
            <Text style={styles.rowName}>
              {itemName} {index + 1}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${itemName.toLowerCase()} ${index + 1}`}
              onPress={() => remove(item.id)}
              hitSlop={8}
              style={({ pressed }) => [styles.remove, pressed && styles.removePressed]}
            >
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
          {fields.map((field) => (
            <TextInput
              key={field.key}
              accessibilityLabel={`${itemName} ${index + 1} ${field.label}`}
              value={String(item[field.key] ?? '')}
              onChangeText={(text) => update(item.id, field.key, text)}
              placeholder={field.placeholder}
              placeholderTextColor={colors.inkSoft}
              style={styles.input}
            />
          ))}
        </View>
      ))}
      <BigButton label={`Add ${itemName.toLowerCase()}`} variant="secondary" onPress={add} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  title: { fontFamily: fonts.heading, fontSize: size.heading, color: colors.ink },
  row: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.sm,
  },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowName: { fontFamily: fonts.bodyBold, fontSize: size.small, color: colors.inkSoft },
  remove: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space.sm, borderRadius: radius.sm },
  removePressed: { backgroundColor: colors.alertTint },
  removeText: { fontFamily: fonts.bodyBold, fontSize: size.small, color: colors.alert },
  input: {
    backgroundColor: colors.page,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: size.body,
    color: colors.ink,
    minHeight: 54,
  },
});
