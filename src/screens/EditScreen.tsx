import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BigButton from '../components/BigButton';
import Choice from '../components/Choice';
import Field from '../components/Field';
import Header from '../components/Header';
import PetAvatar from '../components/PetAvatar';
import RowList from '../components/RowList';
import { useDialogs } from '../dialogs';
import { deletePetPhoto, pickPetPhoto } from '../photo';
import { colors, font, space } from '../theme';
import { Contact, Feeding, Medication, Pet, Quirk, SectionKey, Walk } from '../types';

const TITLES: Record<SectionKey, string> = {
  profile: 'Profile',
  routine: 'Daily routine',
  behavior: 'Behaviour',
  quirks: 'Quirks & rules',
  health: 'Meds & health',
  contacts: 'Emergency contacts',
};

type Props = {
  pet: Pet;
  section: SectionKey;
  isNew: boolean;
  onSave: (pet: Pet) => void;
  onCancel: () => void;
};

// Edits one section of a pet. Changes are only kept when you tap Save.
export default function EditScreen({ pet, section, isNew, onSave, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  const { notify } = useDialogs();
  const [draft, setDraft] = useState<Pet>(pet);
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

  const cancel = () => {
    // Throw away a photo that was picked but never saved.
    if (draft.photoUri !== pet.photoUri) deletePetPhoto(draft.photoUri);
    onCancel();
  };

  const save = () => {
    if (section === 'profile' && !draft.name.trim()) {
      notify('Name needed', 'Please give your pet a name before saving.');
      return;
    }
    onSave(draft);
  };

  return (
    <View style={styles.screen}>
      <Header title={isNew ? 'Add a pet' : `Edit ${TITLES[section].toLowerCase()}`} onBack={cancel} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {section === 'profile' && (
            <>
              <Pressable accessibilityRole="button" onPress={choosePhoto} style={styles.photoBtn}>
                <PetAvatar uri={draft.photoUri} size={140} />
                <Text style={styles.photoText}>{draft.photoUri ? 'Change photo' : 'Add a photo'}</Text>
              </Pressable>
              <Field label="Name *" value={draft.name} onChangeText={(t) => set('name', t)} placeholder="e.g. Biscuit" />
              <Field label="Breed" value={draft.breed} onChangeText={(t) => set('breed', t)} placeholder="e.g. Golden Retriever" />
              <Field label="Age" value={draft.age} onChangeText={(t) => set('age', t)} placeholder="e.g. 4 years" />
              <Choice label="Sex" options={['Male', 'Female']} value={draft.sex} onChange={(v) => set('sex', v)} />
              <Choice
                label="Spayed / neutered"
                options={['Yes', 'No']}
                value={draft.neutered}
                onChange={(v) => set('neutered', v)}
              />
              <Field label="Weight" value={draft.weight} onChangeText={(t) => set('weight', t)} placeholder="e.g. 28 kg" />
              <Field
                label="Colour & markings"
                value={draft.markings}
                onChangeText={(t) => set('markings', t)}
                placeholder="e.g. Golden, white patch on chest, red collar"
                multiline
              />
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
                title="🍽️ Feeding"
                items={draft.feedings}
                onChange={(v) => set('feedings', v)}
                makeEmpty={() => ({ time: '', amount: '' })}
                addLabel="Add feeding"
                fields={[
                  { key: 'time', label: 'Time', placeholder: 'Time (e.g. 7:30 AM)' },
                  { key: 'amount', label: 'Amount', placeholder: 'Amount (e.g. 1 cup dry food)' },
                ]}
              />
              <RowList<Walk>
                title="🦮 Walks"
                items={draft.walks}
                onChange={(v) => set('walks', v)}
                makeEmpty={() => ({ time: '', note: '' })}
                addLabel="Add walk"
                fields={[
                  { key: 'time', label: 'Time', placeholder: 'Time (e.g. 8:00 AM)' },
                  { key: 'note', label: 'Note', placeholder: 'Note (e.g. 20 min, around the block)' },
                ]}
              />
              <Field
                label="🌳 Potty notes"
                value={draft.pottyNotes}
                onChangeText={(t) => set('pottyNotes', t)}
                placeholder="e.g. Goes out every 4 hours. Uses the back corner of the yard."
                multiline
              />
            </>
          )}

          {section === 'behavior' && (
            <>
              {(
                [
                  ['goodWithDogs', 'Good with other dogs?'],
                  ['goodWithCats', 'Good with cats?'],
                  ['goodWithKids', 'Good with kids?'],
                  ['goodWithStrangers', 'Good with strangers?'],
                ] as const
              ).map(([key, label]) => (
                <Choice
                  key={key}
                  label={label}
                  options={['Yes', 'No', 'Sometimes']}
                  value={draft[key]}
                  onChange={(v) => set(key, v)}
                />
              ))}
              <Choice
                label="Escape risk"
                options={['Low', 'Medium', 'High']}
                value={draft.escapeRisk}
                onChange={(v) => set('escapeRisk', v)}
              />
              <Field
                label="Escape notes"
                value={draft.escapeNotes}
                onChangeText={(t) => set('escapeNotes', t)}
                placeholder="e.g. Bolts out the front door. Keep the gate latched."
                multiline
              />
              <Field
                label="Sleep & crate"
                value={draft.sleep}
                onChangeText={(t) => set('sleep', t)}
                placeholder="e.g. Sleeps in her crate at 10 PM, door closed. Likes the radio on."
                multiline
              />
              <Field
                label="Commands they know"
                value={draft.commands}
                onChangeText={(t) => set('commands', t)}
                placeholder="e.g. Sit, wait, leave it, come"
              />
            </>
          )}

          {section === 'quirks' && (
            <RowList<Quirk>
              title="💡 Quirks & house rules"
              items={draft.quirks}
              onChange={(v) => set('quirks', v)}
              makeEmpty={() => ({ text: '' })}
              addLabel="Add quirk or rule"
              fields={[{ key: 'text', label: 'Quirk or rule', placeholder: 'e.g. Scared of the vacuum' }]}
            />
          )}

          {section === 'health' && (
            <>
              <RowList<Medication>
                title="💊 Medications"
                items={draft.meds}
                onChange={(v) => set('meds', v)}
                makeEmpty={() => ({ name: '', time: '', dose: '' })}
                addLabel="Add medication"
                fields={[
                  { key: 'name', label: 'Medication', placeholder: 'Medication (e.g. Apoquel)' },
                  { key: 'dose', label: 'Dose', placeholder: 'Dose (e.g. 1 tablet, 16 mg)' },
                  { key: 'time', label: 'Time', placeholder: 'Time (e.g. 8:00 AM with food)' },
                ]}
              />
              <Field
                label="Medical conditions"
                value={draft.conditions}
                onChangeText={(t) => set('conditions', t)}
                placeholder="e.g. Hip dysplasia, no stairs"
                multiline
              />
              <Field
                label="Allergies"
                value={draft.allergies}
                onChangeText={(t) => set('allergies', t)}
                placeholder="e.g. Chicken, bee stings"
                multiline
              />
              <Field
                label="Vaccinations"
                value={draft.vaccinations}
                onChangeText={(t) => set('vaccinations', t)}
                placeholder="e.g. Up to date. Rabies due March 2027."
                multiline
              />

              <Text style={styles.groupTitle}>🩺 Vet</Text>
              <Field label="Vet name" value={draft.vetName} onChangeText={(t) => set('vetName', t)} placeholder="e.g. Dr. Lee, Happy Paws Clinic" />
              <Field
                label="Vet phone"
                value={draft.vetPhone}
                onChangeText={(t) => set('vetPhone', t)}
                placeholder="e.g. 555-123-4567"
                keyboardType="phone-pad"
              />
              <Field
                label="Vet address"
                value={draft.vetAddress}
                onChangeText={(t) => set('vetAddress', t)}
                placeholder="e.g. 12 Oak Street, Springfield"
                multiline
              />
              <Field
                label="Approved vet spending"
                value={draft.vetSpendingLimit}
                onChangeText={(t) => set('vetSpendingLimit', t)}
                placeholder="e.g. Up to $500 without calling me first"
                multiline
              />

              <Text style={styles.groupTitle}>🛡️ Insurance</Text>
              <Field
                label="Insurance company"
                value={draft.insurance}
                onChangeText={(t) => set('insurance', t)}
                placeholder="e.g. Petplan"
              />
              <Field
                label="Policy number"
                value={draft.insurancePolicy}
                onChangeText={(t) => set('insurancePolicy', t)}
                placeholder="e.g. PP-1234567"
                autoCapitalize="characters"
              />
            </>
          )}

          {section === 'contacts' &&
            (
              [
                ['owner', '🏠 Owner', 'e.g. Sam Rivera'],
                ['backup', '🤝 Backup person', 'e.g. Alex (neighbor)'],
                ['emergencyVet', '🚑 Emergency vet', 'e.g. 24/7 Animal Hospital'],
              ] as const
            ).map(([key, title, namePlaceholder]) => (
              <View key={key}>
                <Text style={styles.groupTitle}>{title}</Text>
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
                {key === 'emergencyVet' && (
                  <Field
                    label="Address"
                    value={draft.emergencyVetAddress}
                    onChangeText={(t) => set('emergencyVetAddress', t)}
                    placeholder="e.g. 400 Main Road, open 24/7"
                    multiline
                  />
                )}
              </View>
            ))}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
          <BigButton label="Cancel" variant="secondary" onPress={cancel} style={styles.footerBtn} />
          <BigButton label={isNew ? 'Create' : 'Save'} onPress={save} style={styles.footerBtn} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: space.md, paddingBottom: space.xl },
  photoBtn: { alignItems: 'center', marginBottom: space.lg },
  photoText: { fontSize: font.body, fontWeight: '700', color: colors.primary, marginTop: space.sm },
  groupTitle: { fontSize: font.large, fontWeight: '800', color: colors.text, marginBottom: space.sm, marginTop: space.sm },
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
