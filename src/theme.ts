// PawNotes design tokens.
// The look: a blush page, aubergine ink, and one bold marigold element — the pet's ID tag.
// Marigold always carries dark ink text so it stays easy to read.

export const colors = {
  page: '#FCEEE8', // blush peach background
  paper: '#FFFFFF', // inputs and raised surfaces
  ink: '#2B1A24', // aubergine, for all main text
  inkSoft: '#7A6270', // labels and secondary text
  line: '#EBD5CD', // dividers and input borders
  marigold: '#F4B13E', // the ID tag and main actions
  marigoldDeep: '#C98316', // pressed and focused states
  alert: '#A8323F', // allergies, remove, delete
  alertTint: '#F9DCE0',
};

// Bricolage Grotesque gives names and headings character.
// Atkinson Hyperlegible was designed for low-vision readers: easy to read in a hurry.
export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  heading: 'BricolageGrotesque_700Bold',
  body: 'AtkinsonHyperlegibleNext_400Regular',
  bodyBold: 'AtkinsonHyperlegibleNext_700Bold',
};

export const size = {
  small: 16,
  body: 19,
  heading: 24,
  title: 32,
  name: 44,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
};

export const radius = {
  sm: 12,
  md: 18,
  round: 999,
};
