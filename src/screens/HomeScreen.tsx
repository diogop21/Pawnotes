import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BigButton from '../components/BigButton';
import PetTag from '../components/PetTag';
import { useSharing } from '../sharing';
import { homeSections } from '../shareText';
import { colors, fonts, radius, size, space } from '../theme';
import { HomeInfo, Pet } from '../types';

type Props = {
  pets: Pet[];
  home: HomeInfo;
  onOpenPet: (id: string) => void;
  onAddPet: () => void;
  onEditHome: () => void;
  onBackup: () => void;
  onRestore: () => void;
};

export default function HomeScreen({ pets, home, onOpenPet, onAddPet, onEditHome, onBackup, onRestore }: Props) {
  const insets = useSafeAreaInsets();
  const { shareText, shareCard } = useSharing();
  // Bullet lines like "• Address: 8 Elm Road", without the bullet.
  const homeLines = homeSections(home)
    .flatMap((s) => s.lines)
    .filter(Boolean)
    .map((l) => l.replace(/^• /, ''));

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg }]}>
        <Text style={styles.wordmark} accessibilityRole="header">
          PawNotes
        </Text>
        <Text style={styles.intro}>Everything your pet sitter needs to know, ready to send.</Text>

        {pets.length === 0 && (
          <View style={styles.empty}>
            <View style={styles.emptyTag}>
              <PetTag photoUri={null} name="" size={132} />
            </View>
            <Text style={styles.emptyTitle}>No pets yet</Text>
            <Text style={styles.emptyText}>
              Add your pet to start their sitter sheet: routine, quirks, meds and who to call.
            </Text>
          </View>
        )}

        {pets.map((pet) => (
          <Pressable
            key={pet.id}
            accessibilityRole="button"
            accessibilityLabel={`Open ${pet.name}'s sitter sheet`}
            onPress={() => onOpenPet(pet.id)}
            style={({ pressed }) => [styles.pet, pressed && styles.petPressed]}
          >
            <PetTag photoUri={pet.photoUri} name={pet.name} size={92} />
            <View style={styles.petInfo}>
              <Text style={styles.petName} numberOfLines={1}>
                {pet.name || 'Unnamed pet'}
              </Text>
              <Text style={styles.petMeta} numberOfLines={2}>
                {[pet.breed, pet.age].filter(Boolean).join(', ') || 'Tap to add details'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={26} color={colors.inkSoft} />
          </Pressable>
        ))}

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Home & visit
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit home and visit details"
              onPress={onEditHome}
              hitSlop={8}
              style={({ pressed }) => [styles.edit, pressed && styles.editPressed]}
            >
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>
          {homeLines.length === 0 ? (
            <Text style={styles.muted}>Trip dates, how to get in, Wi-Fi and where things are. Shared with every pet.</Text>
          ) : (
            homeLines.slice(0, 4).map((l, i) => (
              <Text key={i} style={styles.body} numberOfLines={2}>
                {l}
              </Text>
            ))
          )}
        </View>

        {pets.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Send everything
            </Text>
            <BigButton label="Share all pets" variant="secondary" onPress={() => shareText(pets, home)} />
            <BigButton label="Photo card for all (PDF)" variant="secondary" onPress={() => shareCard(pets, home)} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Keep a copy
          </Text>
          <Text style={styles.muted}>
            Your pets are only saved on this device. Save a backup file somewhere safe, like email or a cloud drive.
          </Text>
          <View style={styles.row}>
            <BigButton label="Back up" variant="secondary" compact onPress={onBackup} disabled={!pets.length} style={styles.flex} />
            <BigButton label="Restore" variant="secondary" compact onPress={onRestore} style={styles.flex} />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <BigButton label={pets.length ? 'Add another pet' : 'Add your pet'} onPress={onAddPet} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  content: { paddingHorizontal: space.md, paddingBottom: space.xl, gap: space.md },
  wordmark: { fontFamily: fonts.display, fontSize: size.name, color: colors.ink, lineHeight: 50 },
  intro: { fontFamily: fonts.body, fontSize: size.body, color: colors.inkSoft, lineHeight: 27, marginBottom: space.md },
  empty: { alignItems: 'flex-start', gap: space.sm, paddingTop: space.lg, paddingBottom: space.md },
  emptyTag: { opacity: 0.55, marginBottom: space.sm },
  emptyTitle: { fontFamily: fonts.heading, fontSize: size.heading, color: colors.ink },
  emptyText: { fontFamily: fonts.body, fontSize: size.body, color: colors.inkSoft, lineHeight: 27 },
  pet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    padding: space.md,
  },
  petPressed: { backgroundColor: colors.line },
  petInfo: { flex: 1, minWidth: 0, gap: 2 },
  petName: { fontFamily: fonts.display, fontSize: size.title, color: colors.ink },
  petMeta: { fontFamily: fonts.body, fontSize: size.body, color: colors.inkSoft },
  section: { borderTopWidth: 2, borderTopColor: colors.line, paddingTop: space.lg, marginTop: space.sm, gap: space.md },
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
  body: { fontFamily: fonts.body, fontSize: size.body, color: colors.ink, lineHeight: 27 },
  muted: { fontFamily: fonts.body, fontSize: size.body, color: colors.inkSoft, lineHeight: 27 },
  row: { flexDirection: 'row', gap: space.md },
  flex: { flex: 1 },
  footer: { paddingHorizontal: space.md, paddingTop: space.md, backgroundColor: colors.page },
});
