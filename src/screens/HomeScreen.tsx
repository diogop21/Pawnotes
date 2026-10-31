import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BigButton from '../components/BigButton';
import Header from '../components/Header';
import PetAvatar from '../components/PetAvatar';
import { useSharing } from '../sharing';
import { homeSections } from '../shareText';
import { colors, font, radius, space } from '../theme';
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
  const homeLines = homeSections(home).flatMap((s) => s.lines);

  return (
    <View style={styles.screen}>
      <Header title="🐾 PawNotes" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Everything your pet sitter needs to know, in one place.
        </Text>

        {pets.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🐶🐱</Text>
            <Text style={styles.emptyTitle}>No pets yet</Text>
            <Text style={styles.emptyText}>
              Tap “Add a pet” below to create your first pet profile.
            </Text>
          </View>
        )}

        {pets.map((pet) => (
          <Pressable
            key={pet.id}
            accessibilityRole="button"
            accessibilityLabel={`Open ${pet.name}`}
            onPress={() => onOpenPet(pet.id)}
            style={({ pressed }) => [styles.petCard, pressed && styles.pressed]}
          >
            <PetAvatar uri={pet.photoUri} size={76} />
            <View style={styles.petInfo}>
              <Text style={styles.petName} numberOfLines={1}>
                {pet.name || 'Unnamed pet'}
              </Text>
              <Text style={styles.petMeta} numberOfLines={1}>
                {[pet.breed, pet.age].filter(Boolean).join(' · ') || 'Tap to add details'}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit home and visit details"
          onPress={onEditHome}
          style={({ pressed }) => [styles.homeCard, pressed && styles.pressed]}
        >
          <View style={styles.homeHeader}>
            <Text style={styles.homeTitle}>🏠 Home & visit</Text>
            <Text style={styles.editLink}>Edit</Text>
          </View>
          {homeLines.length === 0 ? (
            <Text style={styles.homeEmpty}>Trip dates, how to get in, Wi-Fi, where things are. Shared with every pet.</Text>
          ) : (
            homeLines.slice(0, 4).map((l, i) => (
              <Text key={i} style={styles.homeLine} numberOfLines={1}>
                {l}
              </Text>
            ))
          )}
        </Pressable>

        {pets.length > 1 && (
          <>
            <Text style={styles.groupTitle}>Send everything</Text>
            <BigButton
              label="📤  Share all pets"
              variant="secondary"
              onPress={() => shareText(pets, home)}
              style={styles.gapBtn}
            />
            <BigButton
              label="🖼️  Photo card for all"
              variant="secondary"
              onPress={() => shareCard(pets, home)}
              style={styles.gapBtn}
            />
          </>
        )}

        <Text style={styles.groupTitle}>Keep a copy</Text>
        <Text style={styles.backupText}>
          Your pets are only saved on this device. Save a backup file somewhere safe, like email or a cloud drive.
        </Text>
        <View style={styles.row}>
          <BigButton label="💾 Back up" variant="secondary" compact onPress={onBackup} disabled={!pets.length} style={styles.flex} />
          <BigButton label="📥 Restore" variant="secondary" compact onPress={onRestore} style={styles.flex} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <BigButton label="+ Add a pet" onPress={onAddPet} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: space.md, paddingBottom: space.xl },
  intro: { fontSize: font.body, color: colors.textMuted, marginBottom: space.lg, lineHeight: 26 },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: space.md,
  },
  emptyEmoji: { fontSize: 48, marginBottom: space.sm },
  emptyTitle: { fontSize: font.large, fontWeight: '800', color: colors.text, marginBottom: space.sm },
  emptyText: { fontSize: font.body, color: colors.textMuted, textAlign: 'center', lineHeight: 26 },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.8 },
  petInfo: { flex: 1, marginLeft: space.md },
  petName: { fontSize: font.large, fontWeight: '800', color: colors.text },
  petMeta: { fontSize: font.body, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 40, color: colors.primary, marginLeft: space.sm },
  homeCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
  homeTitle: { fontSize: font.large, fontWeight: '800', color: colors.text, flexShrink: 1 },
  editLink: { fontSize: font.body, fontWeight: '700', color: colors.primary, marginLeft: space.sm },
  homeLine: { fontSize: font.body, color: colors.text, lineHeight: 26 },
  homeEmpty: { fontSize: font.body, color: colors.textMuted, fontStyle: 'italic', lineHeight: 26 },
  groupTitle: { fontSize: font.large, fontWeight: '800', color: colors.text, marginTop: space.md, marginBottom: space.sm },
  gapBtn: { marginBottom: space.sm },
  backupText: { fontSize: font.small, color: colors.textMuted, lineHeight: 22, marginBottom: space.md },
  row: { flexDirection: 'row', gap: space.md },
  flex: { flex: 1 },
  footer: {
    paddingHorizontal: space.md,
    paddingTop: space.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
