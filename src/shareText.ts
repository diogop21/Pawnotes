import { Contact, Pet } from './types';

// Turns a pet's whole profile into neatly formatted plain text
// that reads well in Messages, WhatsApp, email, notes, etc.

const DIVIDER = '──────────────';

function heading(title: string): string {
  return `\n${title.toUpperCase()}\n${DIVIDER}`;
}

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

function section(title: string, lines: (string | null)[]): string {
  const body = lines.filter((l): l is string => l !== null);
  return [heading(title), ...(body.length ? body : ['(nothing added yet)'])].join('\n');
}

export function buildShareText(pet: Pet): string {
  const name = pet.name.trim() || 'My pet';

  const profile = section('Profile', [
    line('Name', pet.name),
    line('Breed', pet.breed),
    line('Age', pet.age),
    line('Microchip #', pet.microchip),
  ]);

  const routineLines: (string | null)[] = [];
  const feedings = pet.feedings.filter((f) => f.time.trim() || f.amount.trim());
  if (feedings.length) {
    routineLines.push('Feeding:');
    feedings.forEach((f) => routineLines.push(`• ${joinParts(f.time, f.amount)}`));
  }
  const walks = pet.walks.filter((w) => w.time.trim() || w.note.trim());
  if (walks.length) {
    if (routineLines.length) routineLines.push('');
    routineLines.push('Walks:');
    walks.forEach((w) => routineLines.push(`• ${joinParts(w.time, w.note)}`));
  }
  if (pet.pottyNotes.trim()) {
    if (routineLines.length) routineLines.push('');
    routineLines.push('Potty notes:', pet.pottyNotes.trim());
  }
  const routine = section('Daily routine', routineLines);

  const quirks = section(
    'Quirks & rules',
    pet.quirks.filter((q) => q.text.trim()).map((q) => `• ${q.text.trim()}`),
  );

  const healthLines: string[] = [];
  const meds = pet.meds.filter((m) => m.name.trim() || m.dose.trim() || m.time.trim());
  if (meds.length) {
    healthLines.push('Medications:');
    meds.forEach((m) => {
      const when = m.time.trim() ? ` at ${m.time.trim()}` : '';
      healthLines.push(`• ${joinParts(m.name, m.dose)}${when}`);
    });
  }
  const healthExtras = [
    line('Allergies', pet.allergies),
    contactLine('Vet', { name: pet.vetName, phone: pet.vetPhone }),
  ].filter((l): l is string => l !== null);
  if (healthLines.length && healthExtras.length) healthLines.push('');
  healthLines.push(...healthExtras);
  const health = section('Meds & health', healthLines);

  const contacts = section('Emergency contacts', [
    contactLine('Owner', pet.owner),
    contactLine('Backup', pet.backup),
    contactLine('Emergency vet', pet.emergencyVet),
  ]);

  return [`🐾 PawNotes for ${name}`, profile, routine, quirks, health, contacts, '\nSent from PawNotes 🐾']
    .join('\n')
    .trim();
}
