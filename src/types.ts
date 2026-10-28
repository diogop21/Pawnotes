// The shape of everything PawNotes saves about a pet.

export type Feeding = { id: string; time: string; amount: string };
export type Walk = { id: string; time: string; note: string };
export type Quirk = { id: string; text: string };
export type Medication = { id: string; name: string; time: string; dose: string };
export type Contact = { name: string; phone: string };

export type Pet = {
  id: string;
  // Profile
  photoUri: string | null;
  name: string;
  breed: string;
  age: string;
  microchip: string;
  // Daily routine
  feedings: Feeding[];
  walks: Walk[];
  pottyNotes: string;
  // Quirks & rules
  quirks: Quirk[];
  // Meds & health
  meds: Medication[];
  vetName: string;
  vetPhone: string;
  allergies: string;
  // Emergency contacts
  owner: Contact;
  backup: Contact;
  emergencyVet: Contact;
};

export type SectionKey = 'profile' | 'routine' | 'quirks' | 'health' | 'contacts';

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function emptyPet(): Pet {
  return {
    id: newId(),
    photoUri: null,
    name: '',
    breed: '',
    age: '',
    microchip: '',
    feedings: [],
    walks: [],
    pottyNotes: '',
    quirks: [],
    meds: [],
    vetName: '',
    vetPhone: '',
    allergies: '',
    owner: { name: '', phone: '' },
    backup: { name: '', phone: '' },
    emergencyVet: { name: '', phone: '' },
  };
}
