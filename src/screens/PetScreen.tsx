import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BigButton from '../components/BigButton';
import Header from '../components/Header';
import PetAvatar from '../components/PetAvatar';
import { useDialogs } from '../dialogs';
import { useSharing } from '../sharing';
import { petSections } from '../shareText';
import { colors, font, radius, space } from '../theme';
import { HomeInfo, Pet, SectionKey } from '../types';

type Props = {
  pet: Pet;
  home: HomeInfo;
  onBack: () => void;
  onEdit: (section: SectionKey) => void;
  onDelete: () => void;
};

const SECTIONS: { key: SectionKey; title: string; emoji: string }[] = [
  { key: 'profile', title: 'Profile', emoji: '🐕' },
  { key: 'routine', title: 'Daily routine', emoji: '⏰' },
  { key: 'behavior', title: 'Behaviour', emoji: '🐾' },
  { key: 'quirks', title: 'Quirks & rules', emoji: '💡' },
  { key: 'health', title: 'Meds & health', emoji: '🩺' },
  { key: 'contacts', title: 'Emergency contacts', emoji: '📞' },
];

// Short preview lines shown on each section card, taken from what gets shared.
function previews(pet: Pet): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  petSections(pet).forEach((s) => {
    out[s.title] = s.lines.filter((l) => l && !l.startsWith('• Name:'));
  });
  return out;
}

export default function PetScreen({ pet, home, onBack, onEdit, onDelete }: Props) {
  const insets = useSafeAreaInsets();
  const { confirm } = useDialogs();
  const { shareText, shareCard } = useSharing();
  const preview = previews(pet);

  const askDelete = async () => {
    const ok = await confirm(
      `Delete ${pet.name || 'this pet'}?`,
      'This removes the whole profile from this phone. It cannot be undone.',
      'Delete',
    );
    if (ok) onDelete();
  };

  return (
    <View style={styles.screen}>
      <Header title={pet.name || 'Pet'} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <PetAvatar uri={pet.photoUri} size={140} />
          <Text style={styles.heroName}>{pet.name || 'Unnamed pet'}</Text>
          {!!(pet.breed || pet.age) && (
            <Text style={styles.heroMeta}>{[pet.breed, pet.age].filter(Boolean).join(' · ')}</Text>
          )}
        </View>

        {SECTIONS.map((s) => {
          const lines = preview[s.title] ?? [];
          return (
            <Pressable
              key={s.key}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${s.title}`}
              onPress={() => onEdit(s.key)}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {s.emoji} {s.title}
                </Text>
                <Text style={styles.editLink}>Edit</Text>
              </View>
              {lines.length === 0 ? (
                <Text style={styles.cardEmpty}>Tap to add</Text>
              ) : (
                lines.slice(0, 6).map((l, i) => (
                  <Text key={i} style={styles.cardLine} numberOfLines={2}>
                    {l}
                  </Text>
                ))
              )}
              {lines.length > 6 && <Text style={styles.cardEmpty}>+ {lines.length - 6} more</Text>}
            </Pressable>
          );
        })}

        <BigButton
          label="🖼️  Photo card (PDF)"
          variant="secondary"
          onPress={() => shareCard([pet], home)}
          style={styles.cardBtn}
        />
        <BigButton label="Delete this pet" variant="danger" onPress={askDelete} style={styles.delete} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <BigButton label="📤  Share with sitter" onPress={() => shareText([pet], home)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: space.md, paddingBottom: space.xl },
  hero: { alignItems: 'center', marginBottom: space.lg },
  heroName: { fontSize: font.huge, fontWeight: '800', color: colors.text, marginTop: space.md },
  heroMeta: { fontSize: font.body, color: colors.textMuted, marginTop: space.xs },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
  cardTitle: { fontSize: font.large, fontWeight: '800', color: colors.text, flexShrink: 1 },
  editLink: { fontSize: font.body, fontWeight: '700', color: colors.primary, marginLeft: space.sm },
  cardLine: { fontSize: font.body, color: colors.text, lineHeight: 26 },
  cardEmpty: { fontSize: font.body, color: colors.textMuted, fontStyle: 'italic' },
  cardBtn: { marginTop: space.sm },
  delete: { marginTop: space.md },
  footer: {
    paddingHorizontal: space.md,
    paddingTop: space.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
