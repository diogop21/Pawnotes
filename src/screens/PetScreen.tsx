import Ionicons from '@expo/vector-icons/Ionicons';
import { ReactNode } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BigButton from '../components/BigButton';
import Header from '../components/Header';
import PetTag from '../components/PetTag';
import { useDialogs } from '../dialogs';
import { buildShareText } from '../shareText';
import { colors, fonts, radius, size, space } from '../theme';
import { Contact, Pet, SectionKey } from '../types';

type Props = {
  pet: Pet;
  onBack: () => void;
  onEdit: (section: SectionKey) => void;
  onDelete: () => void;
};

const filled = (...values: string[]) => values.some((v) => v.trim());
const joined = (...parts: string[]) => parts.map((p) => p.trim()).filter(Boolean).join(', ');

// The sitter sheet: everything about one pet, read top to bottom, with Share at your thumb.
export default function PetScreen({ pet, onBack, onEdit, onDelete }: Props) {
  const insets = useSafeAreaInsets();
  const { confirm, showText } = useDialogs();

  const share = async () => {
    const message = buildShareText(pet);
    try {
      await Share.share({ message, title: `PawNotes for ${pet.name}` });
    } catch {
      // No share sheet (e.g. a desktop browser): show the text so it can be copied instead.
      showText('Copy and send to your sitter', message);
    }
  };

  const askDelete = async () => {
    const ok = await confirm(
      `Delete ${pet.name || 'this pet'}?`,
      'This removes the whole sitter sheet from this device. It cannot be undone.',
      'Delete',
    );
    if (ok) onDelete();
  };

  const feedings = pet.feedings.filter((f) => filled(f.time, f.amount));
  const walks = pet.walks.filter((w) => filled(w.time, w.note));
  const quirks = pet.quirks.filter((q) => filled(q.text));
  const meds = pet.meds.filter((m) => filled(m.name, m.dose, m.time));
  const contacts: [string, Contact][] = (
    [
      ['Owner', pet.owner],
      ['Backup person', pet.backup],
      ['Emergency vet', pet.emergencyVet],
    ] as [string, Contact][]
  ).filter(([, c]) => filled(c.name, c.phone));
  const facts: [string, string][] = (
    [
      ['Breed', pet.breed],
      ['Age', pet.age],
      ['Microchip', pet.microchip],
    ] as [string, string][]
  ).filter(([, v]) => filled(v));

  return (
    <View style={styles.screen}>
      <Header onBack={onBack} backLabel="All pets" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <PetTag photoUri={pet.photoUri} name={pet.name} size={176} />
          <Text style={styles.name} accessibilityRole="header">
            {pet.name || 'Unnamed pet'}
          </Text>
        </View>

        <Section title="Profile" onEdit={() => onEdit('profile')}>
          {facts.length ? (
            facts.map(([label, value]) => <Fact key={label} label={label} value={value} />)
          ) : (
            <Empty text="Add breed, age and microchip number." />
          )}
        </Section>

        <Section title="Daily routine" onEdit={() => onEdit('routine')}>
          {feedings.length + walks.length === 0 && !filled(pet.pottyNotes) && (
            <Empty text="Add feeding times, walks and potty notes." />
          )}
          {feedings.length > 0 && (
            <Group label="Feeding">
              {feedings.map((f) => (
                <TimeRow key={f.id} time={f.time} detail={f.amount} />
              ))}
            </Group>
          )}
          {walks.length > 0 && (
            <Group label="Walks">
              {walks.map((w) => (
                <TimeRow key={w.id} time={w.time} detail={w.note} />
              ))}
            </Group>
          )}
          {filled(pet.pottyNotes) && (
            <Group label="Potty">
              <Text style={styles.body}>{pet.pottyNotes.trim()}</Text>
            </Group>
          )}
        </Section>

        <Section title="Quirks & rules" onEdit={() => onEdit('quirks')}>
          {quirks.length ? (
            quirks.map((q) => (
              <View key={q.id} style={styles.quirk}>
                <View style={styles.quirkDot} />
                <Text style={[styles.body, styles.flex]}>{q.text.trim()}</Text>
              </View>
            ))
          ) : (
            <Empty text="Add the little things, like “scared of the vacuum”." />
          )}
        </Section>

        <Section title="Meds & health" onEdit={() => onEdit('health')}>
          {filled(pet.allergies) && (
            <View style={styles.allergy} accessibilityRole="alert">
              <Ionicons name="warning" size={22} color={colors.alert} />
              <Text style={[styles.allergyText, styles.flex]}>Allergic to {pet.allergies.trim()}</Text>
            </View>
          )}
          {meds.length > 0 && (
            <Group label="Medications">
              {meds.map((m) => (
                <TimeRow key={m.id} time={m.time} detail={joined(m.name, m.dose)} />
              ))}
            </Group>
          )}
          {filled(pet.vetName, pet.vetPhone) && (
            <ContactRow role="Vet" contact={{ name: pet.vetName, phone: pet.vetPhone }} />
          )}
          {!filled(pet.allergies, pet.vetName, pet.vetPhone) && meds.length === 0 && (
            <Empty text="Add medications, allergies and your vet." />
          )}
        </Section>

        <Section title="Emergency contacts" onEdit={() => onEdit('contacts')}>
          {contacts.length ? (
            contacts.map(([role, c]) => <ContactRow key={role} role={role} contact={c} />)
          ) : (
            <Empty text="Add the owner, a backup person and an emergency vet." />
          )}
        </Section>

        <BigButton label="Delete this pet" variant="danger" onPress={askDelete} style={styles.delete} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <BigButton label="Share with sitter" onPress={share} />
      </View>
    </View>
  );
}

function Section({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${title.toLowerCase()}`}
          onPress={onEdit}
          hitSlop={8}
          style={({ pressed }) => [styles.edit, pressed && styles.editPressed]}
        >
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.body, styles.flex, styles.numbers]}>{value.trim()}</Text>
    </View>
  );
}

function TimeRow({ time, detail }: { time: string; detail: string }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowTime, styles.numbers]}>{time.trim() || 'Any time'}</Text>
      <Text style={[styles.body, styles.flex]}>{detail.trim()}</Text>
    </View>
  );
}

function ContactRow({ role, contact }: { role: string; contact: Contact }) {
  return (
    <View style={styles.contact}>
      <Text style={styles.groupLabel}>{role}</Text>
      {filled(contact.name) && <Text style={styles.contactName}>{contact.name.trim()}</Text>}
      {filled(contact.phone) && (
        <Text style={[styles.body, styles.numbers]} selectable>
          {contact.phone.trim()}
        </Text>
      )}
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return <Text style={styles.empty}>{text}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  content: { paddingHorizontal: space.md, paddingBottom: space.xl },
  flex: { flex: 1, minWidth: 0 },
  hero: { alignItems: 'center', paddingTop: space.sm, paddingBottom: space.lg, gap: space.md },
  name: { fontFamily: fonts.display, fontSize: size.name, lineHeight: 50, color: colors.ink, textAlign: 'center' },
  section: { borderTopWidth: 2, borderTopColor: colors.line, paddingVertical: space.lg, gap: space.md },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  sectionTitle: { fontFamily: fonts.heading, fontSize: size.heading, color: colors.ink, flexShrink: 1 },
  edit: {
    minHeight: 44,
    paddingHorizontal: space.md,
    justifyContent: 'center',
    borderRadius: radius.round,
    backgroundColor: colors.paper,
  },
  editPressed: { backgroundColor: colors.line },
  editText: { fontFamily: fonts.bodyBold, fontSize: size.small, color: colors.ink },
  group: { gap: space.sm },
  groupLabel: { fontFamily: fonts.bodyBold, fontSize: size.small, color: colors.inkSoft },
  row: { flexDirection: 'row', gap: space.md, alignItems: 'baseline' },
  rowLabel: { width: 104, fontFamily: fonts.body, fontSize: size.small, color: colors.inkSoft },
  rowTime: { width: 104, fontFamily: fonts.bodyBold, fontSize: size.body, color: colors.ink },
  numbers: { fontVariant: ['tabular-nums'] },
  body: { fontFamily: fonts.body, fontSize: size.body, color: colors.ink, lineHeight: 27 },
  quirk: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  quirkDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.marigold, marginTop: 9 },
  allergy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.alertTint,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: 14,
  },
  allergyText: { fontFamily: fonts.bodyBold, fontSize: size.body, color: colors.alert },
  contact: { gap: 2 },
  contactName: { fontFamily: fonts.bodyBold, fontSize: size.body, color: colors.ink },
  empty: { fontFamily: fonts.body, fontSize: size.body, color: colors.inkSoft, lineHeight: 27 },
  delete: { marginTop: space.md },
  footer: { paddingHorizontal: space.md, paddingTop: space.md, backgroundColor: colors.page },
});
