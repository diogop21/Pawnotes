import Ionicons from '@expo/vector-icons/Ionicons';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BigButton from '../components/BigButton';
import Header from '../components/Header';
import PetTag from '../components/PetTag';
import { useDialogs } from '../dialogs';
import { useSharing } from '../sharing';
import { colors, fonts, radius, size, space } from '../theme';
import { Contact, HomeInfo, Pet, SectionKey } from '../types';

type Props = {
  pet: Pet;
  home: HomeInfo;
  onBack: () => void;
  onEdit: (section: SectionKey) => void;
  onDelete: () => void;
};

const filled = (...values: string[]) => values.some((v) => v.trim());
const joined = (...parts: string[]) => parts.map((p) => p.trim()).filter(Boolean).join(', ');

// Label/value pairs, keeping only the ones that have a value.
function pairs(list: [string, string][]): [string, string][] {
  return list.filter(([, v]) => filled(v));
}

// The sitter sheet: everything about one pet, read top to bottom, with Share at your thumb.
export default function PetScreen({ pet, home, onBack, onEdit, onDelete }: Props) {
  const insets = useSafeAreaInsets();
  const { confirm } = useDialogs();
  const { shareText, shareCard } = useSharing();

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
  const contacts: [string, Contact, string][] = (
    [
      ['Owner', pet.owner, ''],
      ['Backup person', pet.backup, ''],
      ['Emergency vet', pet.emergencyVet, pet.emergencyVetAddress],
    ] as [string, Contact, string][]
  ).filter(([, c, address]) => filled(c.name, c.phone, address));
  const facts = pairs([
    ['Breed', pet.breed],
    ['Age', pet.age],
    ['Sex', pet.sex],
    ['Spayed / neutered', pet.neutered],
    ['Weight', pet.weight],
    ['Markings', pet.markings],
    ['Microchip', pet.microchip],
  ]);
  const behaviour = pairs([
    ['Other dogs', pet.goodWithDogs],
    ['Cats', pet.goodWithCats],
    ['Kids', pet.goodWithKids],
    ['Strangers', pet.goodWithStrangers],
    ['Escape risk', pet.escapeRisk],
  ]);
  const behaviourNotes = pairs([
    ['Escape notes', pet.escapeNotes],
    ['Sleep & crate', pet.sleep],
    ['Commands', pet.commands],
  ]);
  const healthNotes = pairs([
    ['Conditions', pet.conditions],
    ['Vaccinations', pet.vaccinations],
  ]);
  const insurance = joined(pet.insurance, pet.insurancePolicy && `policy ${pet.insurancePolicy.trim()}`);
  const hasHealth =
    filled(pet.allergies, pet.vetName, pet.vetPhone, pet.vetAddress, pet.vetSpendingLimit, insurance) ||
    meds.length > 0 ||
    healthNotes.length > 0;

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
            <Empty text="Add breed, age, weight and microchip number." />
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

        <Section title="Behaviour" onEdit={() => onEdit('behavior')}>
          {behaviour.length + behaviourNotes.length === 0 && (
            <Empty text="Add how they are with dogs, cats, kids and strangers, and escape risk." />
          )}
          {behaviour.length > 0 && (
            <Group label="Good with">
              {behaviour.map(([label, value]) => (
                <Fact key={label} label={label} value={value} />
              ))}
            </Group>
          )}
          {behaviourNotes.map(([label, value]) => (
            <Group key={label} label={label}>
              <Text style={styles.body}>{value.trim()}</Text>
            </Group>
          ))}
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
          {healthNotes.map(([label, value]) => (
            <Group key={label} label={label}>
              <Text style={styles.body}>{value.trim()}</Text>
            </Group>
          ))}
          {filled(pet.vetName, pet.vetPhone, pet.vetAddress) && (
            <ContactRow role="Vet" contact={{ name: pet.vetName, phone: pet.vetPhone }} address={pet.vetAddress} />
          )}
          {filled(pet.vetSpendingLimit) && (
            <Group label="Approved vet spending">
              <Text style={styles.body}>{pet.vetSpendingLimit.trim()}</Text>
            </Group>
          )}
          {filled(insurance) && (
            <Group label="Insurance">
              <Text style={[styles.body, styles.numbers]}>{insurance}</Text>
            </Group>
          )}
          {!hasHealth && <Empty text="Add medications, allergies, conditions and your vet." />}
        </Section>

        <Section title="Emergency contacts" onEdit={() => onEdit('contacts')}>
          {contacts.length ? (
            contacts.map(([role, c, address]) => <ContactRow key={role} role={role} contact={c} address={address} />)
          ) : (
            <Empty text="Add the owner, a backup person and an emergency vet." />
          )}
        </Section>

        <View style={styles.extras}>
          <BigButton label="Photo card (PDF)" variant="secondary" onPress={() => shareCard([pet], home)} />
          <BigButton label="Delete this pet" variant="danger" onPress={askDelete} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <BigButton label="Share with sitter" onPress={() => shareText([pet], home)} />
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

function ContactRow({ role, contact, address = '' }: { role: string; contact: Contact; address?: string }) {
  return (
    <View style={styles.contact}>
      <Text style={styles.groupLabel}>{role}</Text>
      {filled(contact.name) && <Text style={styles.contactName}>{contact.name.trim()}</Text>}
      {filled(contact.phone) && (
        <Text style={[styles.body, styles.numbers]} selectable>
          {contact.phone.trim()}
        </Text>
      )}
      {filled(address) && (
        <Text style={styles.body} selectable>
          {address.trim()}
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
  extras: { gap: space.md, marginTop: space.md },
  footer: { paddingHorizontal: space.md, paddingTop: space.md, backgroundColor: colors.page },
});
