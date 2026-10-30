import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BigButton from '../components/BigButton';
import Choice from '../components/Choice';
import Field from '../components/Field';
import Header from '../components/Header';
import { colors, font, space } from '../theme';
import { HomeInfo } from '../types';

type Props = {
  home: HomeInfo;
  onSave: (home: HomeInfo) => void;
  onCancel: () => void;
};

// Edits the home & visit details shared by all pets. Changes are only kept when you tap Save.
export default function HomeInfoScreen({ home, onSave, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<HomeInfo>(home);
  const set = <K extends keyof HomeInfo>(key: K, value: HomeInfo[K]) => setDraft((d) => ({ ...d, [key]: value }));

  return (
    <View style={styles.screen}>
      <Header title="Home & visit" onBack={onCancel} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.groupTitle}>🧳 This visit</Text>
          <Field label="Away from" value={draft.tripStart} onChangeText={(t) => set('tripStart', t)} placeholder="e.g. Fri 14 Nov, 6 PM" />
          <Field label="Back on" value={draft.tripEnd} onChangeText={(t) => set('tripEnd', t)} placeholder="e.g. Sun 23 Nov, around noon" />
          <Field
            label="Updates I'd like"
            value={draft.updates}
            onChangeText={(t) => set('updates', t)}
            placeholder="e.g. A photo each evening on WhatsApp. I'm 5 hours ahead."
            multiline
          />

          <Text style={styles.groupTitle}>🏠 Home</Text>
          <Field label="Address" value={draft.address} onChangeText={(t) => set('address', t)} placeholder="e.g. 8 Elm Road, Flat 2" multiline />
          <Field
            label="Getting in"
            value={draft.entry}
            onChangeText={(t) => set('entry', t)}
            placeholder="e.g. Spare key in the lockbox by the back door"
            multiline
          />
          <Field label="Door / lockbox code" value={draft.doorCode} onChangeText={(t) => set('doorCode', t)} autoCapitalize="none" />
          <Field label="Alarm code" value={draft.alarmCode} onChangeText={(t) => set('alarmCode', t)} autoCapitalize="none" />
          <Field label="Wi-Fi name" value={draft.wifiName} onChangeText={(t) => set('wifiName', t)} autoCapitalize="none" />
          <Field label="Wi-Fi password" value={draft.wifiPassword} onChangeText={(t) => set('wifiPassword', t)} autoCapitalize="none" />
          <Choice
            label="Include the codes and Wi-Fi password when sharing?"
            options={['Yes', 'No']}
            value={draft.shareCodes ? 'Yes' : 'No'}
            onChange={(v) => set('shareCodes', v === 'Yes')}
          />
          <Text style={styles.hint}>
            If you choose No, the shared text says the codes will be sent separately, so you can send them another way.
          </Text>

          <Field
            label="Where things are"
            value={draft.supplies}
            onChangeText={(t) => set('supplies', t)}
            placeholder="e.g. Food in the pantry, leash on the hook by the door, poop bags in the drawer"
            multiline
          />
          <Field
            label="Around the house"
            value={draft.houseNotes}
            onChangeText={(t) => set('houseNotes', t)}
            placeholder="e.g. Bins go out Tuesday night. Please water the plants."
            multiline
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
          <BigButton label="Cancel" variant="secondary" onPress={onCancel} style={styles.footerBtn} />
          <BigButton label="Save" onPress={() => onSave(draft)} style={styles.footerBtn} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: space.md, paddingBottom: space.xl },
  groupTitle: { fontSize: font.large, fontWeight: '800', color: colors.text, marginBottom: space.sm, marginTop: space.sm },
  hint: { fontSize: font.small, color: colors.textMuted, marginTop: -space.sm, marginBottom: space.md, lineHeight: 22 },
  footer: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.md,
    paddingTop: space.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBtn: { flex: 1 },
});
