import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BigButton from '../components/BigButton';
import PetTag from '../components/PetTag';
import { colors, fonts, radius, size, space } from '../theme';
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
            <Text style={styles.emptyTitle}>No pet yet</Text>
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

        {!canAdd && (
          <Text style={styles.limitNote}>PawNotes holds one pet for now. Room for more is coming.</Text>
        )}
      </ScrollView>

      {canAdd && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
          <BigButton label="Add your pet" onPress={onAddPet} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  content: { paddingHorizontal: space.md, paddingBottom: space.xl, gap: space.md },
  wordmark: { fontFamily: fonts.display, fontSize: size.name, color: colors.ink, lineHeight: 50 },
  intro: { fontFamily: fonts.body, fontSize: size.body, color: colors.inkSoft, lineHeight: 27, marginBottom: space.md },
  empty: { alignItems: 'flex-start', gap: space.sm, paddingTop: space.lg },
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
  limitNote: { fontFamily: fonts.body, fontSize: size.small, color: colors.inkSoft, lineHeight: 23 },
  footer: { paddingHorizontal: space.md, paddingTop: space.md, backgroundColor: colors.page },
});
