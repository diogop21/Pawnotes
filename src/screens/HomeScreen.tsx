import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BigButton from '../components/BigButton';
import Header from '../components/Header';
import PetAvatar from '../components/PetAvatar';
import { colors, font, radius, space } from '../theme';
import { Pet } from '../types';

// Version 1 allows only one pet.
export const MAX_PETS = 1;

type Props = {
  pets: Pet[];
  onOpenPet: (id: string) => void;
  onAddPet: () => void;
};

export default function HomeScreen({ pets, onOpenPet, onAddPet }: Props) {
  const insets = useSafeAreaInsets();
  const canAdd = pets.length < MAX_PETS;

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

        {!canAdd && (
          <Text style={styles.limitNote}>
            PawNotes currently supports one pet. More pets are coming in a future version!
          </Text>
        )}
      </ScrollView>

      {canAdd && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
          <BigButton label="+ Add a pet" onPress={onAddPet} />
        </View>
      )}
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
  limitNote: { fontSize: font.small, color: colors.textMuted, textAlign: 'center', marginTop: space.sm, lineHeight: 22 },
  footer: {
    paddingHorizontal: space.md,
    paddingTop: space.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
