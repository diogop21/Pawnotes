import { Contact, HomeInfo, Pet } from './types';

// Turns pets and home info into neatly formatted plain text
// that reads well in Messages, WhatsApp, email, notes, etc.
// The same sections are used for the printable photo card.

// A line starting with "• " is a bullet, a line ending in ":" is a small heading,
// and an empty line is a gap.
export type Section = { title: string; lines: string[] };

const DIVIDER = '──────────────';

function line(label: string, value: string): string | null {
  const v = value.trim();
  return v ? `• ${label}: ${v}` : null;
}

function contactLine(label: string, c: Contact): string | null {
  const parts = [c.name.trim(), c.phone.trim()].filter(Boolean);
  return parts.length ? `• ${label}: ${parts.join(' — ')}` : null;
}

function joinParts(...parts: string[]): string {
  return parts.map((p) => p.trim()).filter(Boolean).join(' — ');
}

function present(lines: (string | null)[]): string[] {
  return lines.filter((l): l is string => l !== null);
}

// Adds a titled group of lines, with a gap before it if something came first.
function group(out: string[], title: string, lines: string[]) {
  if (!lines.length) return;
  if (out.length) out.push('');
  out.push(`${title}:`, ...lines);
}

// Drops sections with nothing in them, so the sitter only sees what was filled in.
function filled(sections: Section[]): Section[] {
  return sections.filter((s) => s.lines.length > 0);
}

export function petName(pet: Pet): string {
  return pet.name.trim() || 'My pet';
}

export function petSections(pet: Pet): Section[] {
  const profile = present([
    line('Name', pet.name),
    line('Breed', pet.breed),
    line('Age', pet.age),
    line('Sex', pet.sex),
    line('Spayed / neutered', pet.neutered),
    line('Weight', pet.weight),
    line('Colour & markings', pet.markings),
    line('Microchip #', pet.microchip),
  ]);

  const routine: string[] = [];
  group(
    routine,
    'Feeding',
    pet.feedings.filter((f) => f.time.trim() || f.amount.trim()).map((f) => `• ${joinParts(f.time, f.amount)}`),
  );
  group(
    routine,
    'Walks',
    pet.walks.filter((w) => w.time.trim() || w.note.trim()).map((w) => `• ${joinParts(w.time, w.note)}`),
  );
  group(routine, 'Potty notes', pet.pottyNotes.trim() ? [pet.pottyNotes.trim()] : []);

  const escape = joinParts(pet.escapeRisk, pet.escapeNotes);
  const behavior = present([
    line('Good with dogs', pet.goodWithDogs),
    line('Good with cats', pet.goodWithCats),
    line('Good with kids', pet.goodWithKids),
    line('Good with strangers', pet.goodWithStrangers),
    line('Escape risk', escape),
    line('Sleep & crate', pet.sleep),
    line('Commands', pet.commands),
  ]);

  const quirks = pet.quirks.filter((q) => q.text.trim()).map((q) => `• ${q.text.trim()}`);

  const health: string[] = [];
  group(
    health,
    'Medications',
    pet.meds
      .filter((m) => m.name.trim() || m.dose.trim() || m.time.trim())
      .map((m) => {
        const when = m.time.trim() ? ` at ${m.time.trim()}` : '';
        return `• ${joinParts(m.name, m.dose)}${when}`;
      }),
  );
  const healthExtras = present([
    line('Conditions', pet.conditions),
    line('Allergies', pet.allergies),
    line('Vaccinations', pet.vaccinations),
    contactLine('Vet', { name: pet.vetName, phone: pet.vetPhone }),
    line('Vet address', pet.vetAddress),
    line('Insurance', joinParts(pet.insurance, pet.insurancePolicy && `policy ${pet.insurancePolicy.trim()}`)),
    line('Approved vet spending', pet.vetSpendingLimit),
  ]);
  if (health.length && healthExtras.length) health.push('');
  health.push(...healthExtras);

  const contacts = present([
    contactLine('Owner', pet.owner),
    contactLine('Backup', pet.backup),
    contactLine('Emergency vet', pet.emergencyVet),
    line('Emergency vet address', pet.emergencyVetAddress),
  ]);

  return filled([
    { title: 'Profile', lines: profile },
    { title: 'Daily routine', lines: routine },
    { title: 'Behaviour', lines: behavior },
    { title: 'Quirks & rules', lines: quirks },
    { title: 'Meds & health', lines: health },
    { title: 'Emergency contacts', lines: contacts },
  ]);
}

export function homeSections(home: HomeInfo): Section[] {
  const dates = [home.tripStart.trim(), home.tripEnd.trim()].filter(Boolean).join(' to ');
  const visit = present([line('Dates', dates), line('Updates', home.updates)]);

  const codes = [home.doorCode, home.alarmCode, home.wifiPassword].some((c) => c.trim());
  const houseLines = present([
    line('Address', home.address),
    line('Getting in', home.entry),
    home.shareCodes ? line('Door code', home.doorCode) : null,
    home.shareCodes ? line('Alarm code', home.alarmCode) : null,
    line('Wi-Fi', home.wifiName),
    home.shareCodes ? line('Wi-Fi password', home.wifiPassword) : null,
    !home.shareCodes && codes ? '• Codes & Wi-Fi password: sent separately' : null,
    line('Where things are', home.supplies),
    line('Around the house', home.houseNotes),
  ]);

  return filled([
    { title: 'Visit', lines: visit },
    { title: 'Home', lines: houseLines },
  ]);
}

function sectionText(s: Section): string {
  return [`\n${s.title.toUpperCase()}`, DIVIDER, ...s.lines].join('\n');
}

export function buildShareText(pets: Pet[], home: HomeInfo): string {
  const names = pets.map(petName);
  const title = names.length ? names.join(' & ') : 'my pets';
  const blocks: string[] = [`🐾 PawNotes for ${title}`];

  blocks.push(...homeSections(home).map(sectionText));

  // With several pets, contacts are often the same, so they're only written out once.
  const seenContacts = new Map<string, string>();
  pets.forEach((pet) => {
    if (pets.length > 1) blocks.push(`\n\n🐾 ${petName(pet).toUpperCase()}\n${'═'.repeat(14)}`);
    const sections = petSections(pet);
    if (!sections.length) blocks.push('\n(no details added yet)');
    sections.forEach((s) => {
      if (s.title === 'Emergency contacts' && pets.length > 1) {
        const key = s.lines.join('\n');
        const same = seenContacts.get(key);
        if (same) {
          blocks.push(sectionText({ title: s.title, lines: [`Same as for ${same}.`] }));
          return;
        }
        seenContacts.set(key, petName(pet));
      }
      blocks.push(sectionText(s));
    });
  });

  blocks.push('\nSent from PawNotes 🐾');
  return blocks.join('\n').trim();
}
