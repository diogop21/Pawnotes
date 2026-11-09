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
  sex: string;
  neutered: string;
  weight: string;
  markings: string;
  microchip: string;
  // Daily routine
  feedings: Feeding[];
  walks: Walk[];
  pottyNotes: string;
  // Behaviour
  goodWithDogs: string;
  goodWithCats: string;
  goodWithKids: string;
  goodWithStrangers: string;
  escapeRisk: string;
  escapeNotes: string;
  sleep: string;
  commands: string;
  // Quirks & rules
  quirks: Quirk[];
  // Meds & health
  meds: Medication[];
  conditions: string;
  allergies: string;
  vaccinations: string;
  vetName: string;
  vetPhone: string;
  vetAddress: string;
  insurance: string;
  insurancePolicy: string;
  vetSpendingLimit: string;
  // Emergency contacts
  owner: Contact;
  backup: Contact;
  emergencyVet: Contact;
  emergencyVetAddress: string;
};

export type SectionKey = 'profile' | 'routine' | 'behavior' | 'quirks' | 'health' | 'contacts';

// About the home and the trip, shared by all pets.
export type HomeInfo = {
  tripStart: string;
  tripEnd: string;
  updates: string;
  address: string;
  entry: string;
  doorCode: string;
  alarmCode: string;
  wifiName: string;
  wifiPassword: string;
  supplies: string;
  houseNotes: string;
  // Door/alarm codes and the Wi-Fi password are left out of shared text unless this is on.
  shareCodes: boolean;
};

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
    sex: '',
    neutered: '',
    weight: '',
    markings: '',
    microchip: '',
    feedings: [],
    walks: [],
    pottyNotes: '',
    goodWithDogs: '',
    goodWithCats: '',
    goodWithKids: '',
    goodWithStrangers: '',
    escapeRisk: '',
    escapeNotes: '',
    sleep: '',
    commands: '',
    quirks: [],
    meds: [],
    conditions: '',
    allergies: '',
    vaccinations: '',
    vetName: '',
    vetPhone: '',
    vetAddress: '',
    insurance: '',
    insurancePolicy: '',
    vetSpendingLimit: '',
    owner: { name: '', phone: '' },
    backup: { name: '', phone: '' },
    emergencyVet: { name: '', phone: '' },
    emergencyVetAddress: '',
  };
}

export function emptyHome(): HomeInfo {
  return {
    tripStart: '',
    tripEnd: '',
    updates: '',
    address: '',
    entry: '',
    doorCode: '',
    alarmCode: '',
    wifiName: '',
    wifiPassword: '',
    supplies: '',
    houseNotes: '',
    shareCodes: false,
  };
}

// Fills in any missing fields so older saved data (and backups) keep working.
export function normalizePet(p: Partial<Pet>): Pet {
  const base = emptyPet();
  return {
    ...base,
    ...p,
    owner: { ...base.owner, ...p.owner },
    backup: { ...base.backup, ...p.backup },
    emergencyVet: { ...base.emergencyVet, ...p.emergencyVet },
  };
}

export function normalizeHome(h: Partial<HomeInfo> | null | undefined): HomeInfo {
  return { ...emptyHome(), ...h };
}
