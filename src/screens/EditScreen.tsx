import { useEffect, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BigButton from '../components/BigButton';
import Field from '../components/Field';
import Header from '../components/Header';
import PetTag from '../components/PetTag';
import RowList from '../components/RowList';
import { useDialogs } from '../dialogs';
import { deletePetPhoto, pickPetPhoto } from '../photo';
import { colors, fonts, radius, size, space } from '../theme';
import { Contact, Feeding, Medication, Pet, Quirk, SectionKey, Walk } from '../types';

const TITLES: Record<SectionKey, string> = {
  profile: 'Profile',
  routine: 'Daily routine',
  quirks: 'Quirks & rules',
  health: 'Meds & health',
  contacts: 'Emergency contacts',
};

type Props = {
  pet: Pet;
  section: SectionKey;
  isNew: boolean;
  onSave: (pet: Pet) => Promise<void>;
  onCancel: () => void;
};

// Edits one section of a pet. Changes are only kept when you tap Save.
export default function EditScreen({ pet, section, isNew, onSave, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  const { notify, confirm } = useDialogs();
  const [draft, setDraft] = useState<Pet>(pet);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Pet>(key: K, value: Pet[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setContact = (key: 'owner' | 'backup' | 'emergencyVet', field: keyof Contact, value: string) =>
    setDraft((d) => ({ ...d, [key]: { ...d[key], [field]: value } }));

  const choosePhoto = async () => {
    try {
      const uri = await pickPetPhoto(draft.id);
      if (!uri) return;
      // Replacing a photo picked earlier in this same edit? Clean the unused one up.
      if (draft.photoUri !== pet.photoUri) deletePetPhoto(draft.photoUri);
      set('photoUri', uri);
    } catch {
      notify('Could not open photos', 'Please allow PawNotes to access your photos and try again.');
    }
  };

  const cancel = async () => {
    const changed = JSON.stringify(draft) !== JSON.stringify(pet);
    if (changed && !(await confirm('Discard changes?', 'What you typed here has not been saved.', 'Discard'))) return;
    // Throw away a photo that was picked but never saved.
    if (draft.photoUri !== pet.photoUri) deletePetPhoto(draft.photoUri);
    onCancel();
  };

  // Android hardware back button works like Cancel, so it also asks before throwing away changes.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      cancel();
      return true;
    });
    return () => sub.remove();
  });

  const save = async () => {
    if (section === 'profile' && !draft.name.trim()) {
      notify('Name needed', 'Please give your pet a name before saving.');
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header title={isNew ? 'Add your pet' : TITLES[section]} onBack={cancel} backLabel="Cancel" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {section === 'profile' && (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={draft.photoUri ? 'Change photo' : 'Add a photo'}
                onPress={choosePhoto}
                style={({ pressed }) => [styles.photoBtn, pressed && styles.photoPressed]}
              >
                <PetTag photoUri={draft.photoUri} name={draft.name} size={120} />
                <Text style={styles.photoText}>{draft.photoUri ? 'Change photo' : 'Add a photo'}</Text>
              </Pressable>
              <Field label="Name (needed)" value={draft.name} onChangeText={(t) => set('name', t)} placeholder="e.g. Biscuit" />
              <Field label="Breed" value={draft.breed} onChangeText={(t) => set('breed', t)} placeholder="e.g. Golden Retriever" />
              <Field label="Age" value={draft.age} onChangeText={(t) => set('age', t)} placeholder="e.g. 4 years" />
              <Field
                label="Microchip number"
                value={draft.microchip}
                onChangeText={(t) => set('microchip', t)}
                placeholder="e.g. 985112003456789"
                autoCapitalize="none"
              />
            </>
          )}

          {section === 'routine' && (
            <>
              <RowList<Feeding>
                title="Feeding"
                itemName="Meal"
                items={draft.feedings}
                onChange={(v) => set('feedings', v)}
                makeEmpty={() => ({ time: '', amount: '' })}
                fields={[
                  { key: 'time', label: 'Time', placeholder: 'Time (e.g. 7:30 AM)' },
                  { key: 'amount', label: 'Amount', placeholder: 'Amount (e.g. 1 cup dry food)' },
                ]}
              />
              <RowList<Walk>
                title="Walks"
                itemName="Walk"
                items={draft.walks}
                onChange={(v) => set('walks', v)}
                makeEmpty={() => ({ time: '', note: '' })}
                fields={[
                  { key: 'time', label: 'Time', placeholder: 'Time (e.g. 8:00 AM)' },
                  { key: 'note', label: 'Note', placeholder: 'Note (e.g. 20 min, around the block)' },
                ]}
              />
              <Field
                label="Potty notes"
                value={draft.pottyNotes}
                onChangeText={(t) => set('pottyNotes', t)}
                placeholder="e.g. Goes out every 4 hours. Uses the back corner of the yard."
                multiline
              />
            </>
          )}

          {section === 'quirks' && (
            <RowList<Quirk>
              title="Quirks & house rules"
              itemName="Rule"
              items={draft.quirks}
              onChange={(v) => set('quirks', v)}
              makeEmpty={() => ({ text: '' })}
              fields={[{ key: 'text', label: 'Quirk or rule', placeholder: 'e.g. Scared of the vacuum' }]}
            />
          )}

          {section === 'health' && (
            <>
              <RowList<Medication>
                title="Medications"
                itemName="Medication"
                items={draft.meds}
                onChange={(v) => set('meds', v)}
                makeEmpty={() => ({ name: '', time: '', dose: '' })}
                fields={[
                  { key: 'name', label: 'Medication', placeholder: 'Medication (e.g. Apoquel)' },
                  { key: 'dose', label: 'Dose', placeholder: 'Dose (e.g. 1 tablet, 16 mg)' },
                  { key: 'time', label: 'Time', placeholder: 'Time (e.g. 8:00 AM with food)' },
                ]}
              />
              <View style={styles.group}>
                <Text style={styles.groupTitle} accessibilityRole="header">
                  Vet & allergies
                </Text>
                <Field label="Vet name" value={draft.vetName} onChangeText={(t) => set('vetName', t)} placeholder="e.g. Dr. Lee, Happy Paws Clinic" />
                <Field
                  label="Vet phone"
                  value={draft.vetPhone}
                  onChangeText={(t) => set('vetPhone', t)}
                  placeholder="e.g. 555-123-4567"
                  keyboardType="phone-pad"
                />
                <Field
                  label="Allergies"
                  value={draft.allergies}
                  onChangeText={(t) => set('allergies', t)}
                  placeholder="e.g. Chicken, bee stings"
                  multiline
                />
              </View>
            </>
          )}

          {section === 'contacts' &&
            (
              [
                ['owner', 'Owner', 'e.g. Sam Rivera'],
                ['backup', 'Backup person', 'e.g. Alex (neighbor)'],
                ['emergencyVet', 'Emergency vet', 'e.g. 24/7 Animal Hospital'],
              ] as const
            ).map(([key, title, namePlaceholder]) => (
              <View key={key} style={styles.group}>
                <Text style={styles.groupTitle} accessibilityRole="header">
                  {title}
                </Text>
                <Field
                  label="Name"
                  value={draft[key].name}
                  onChangeText={(t) => setContact(key, 'name', t)}
                  placeholder={namePlaceholder}
                />
                <Field
                  label="Phone"
                  value={draft[key].phone}
                  onChangeText={(t) => setContact(key, 'phone', t)}
                  placeholder="e.g. 555-987-6543"
                  keyboardType="phone-pad"
                />
              </View>
            ))}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
          <BigButton label="Cancel" variant="secondary" onPress={cancel} style={styles.footerBtn} />
          <BigButton label={isNew ? 'Create sheet' : 'Save'} onPress={save} disabled={saving} style={styles.footerBtn} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  flex: { flex: 1 },
  content: { paddingHorizontal: space.md, paddingTop: space.sm, paddingBottom: space.xl, gap: space.lg },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    alignSelf: 'flex-start',
    paddingRight: space.md,
    borderRadius: radius.md,
  },
  photoPressed: { backgroundColor: colors.line },
  photoText: { fontFamily: fonts.bodyBold, fontSize: size.body, color: colors.ink, textDecorationLine: 'underline' },
  group: { gap: space.md },
  groupTitle: { fontFamily: fonts.heading, fontSize: size.heading, color: colors.ink },
  footer: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.md,
    paddingTop: space.md,
    backgroundColor: colors.page,
  },
  footerBtn: { flex: 1 },
});
