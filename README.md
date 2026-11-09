# 🐾 PawNotes

Pet sitter info card app. Keep everything a sitter needs to know about your pet in one place, then send it to them with one tap.

Built with **Expo (React Native) + TypeScript**. All data stays on your phone (AsyncStorage). No account, no internet needed.

## What's in it

- **Home** – all your pets, plus buttons to share everything, back up and restore.
- **Home & visit** – trip dates, update preferences, address, how to get in, door/alarm codes, Wi-Fi, where supplies are, house notes. Shared with every pet. Codes and the Wi-Fi password are left out of shared text unless you switch them on.
- **Profile** – photo from your camera roll, name, breed, age, sex, spayed/neutered, weight, colour & markings, microchip number.
- **Daily routine** – feeding times & amounts, walk times, potty notes.
- **Behaviour** – good with dogs / cats / kids / strangers, escape risk, sleep & crate, commands.
- **Quirks & rules** – a list like "scared of the vacuum".
- **Meds & health** – medications (name, dose, time), conditions, allergies, vaccinations, vet name, phone & address, approved vet spending, insurance.
- **Emergency contacts** – owner, backup person, emergency vet (with address).
- **Share with sitter** – turns the profile (and home & visit info) into tidy text and opens your phone's share sheet. Empty sections are left out.
- **Photo card (PDF)** – a printable card with each pet's photo, handy if a pet ever goes missing. In a web browser it opens the print dialog, where you can save it as a PDF.
- **Back up / Restore** – saves everything (photos included) to one file you can keep in email or a cloud drive, and loads it back on any device. The file includes your codes, so keep it private.

## Preview on your phone (no computer needed)

1. Install **Expo Go** from the App Store / Google Play.
2. Snack can only import **public** GitHub repos. If this repo is private, open it on github.com → **Settings** → scroll to **Danger Zone** → **Change visibility** → **Public**.
3. In your phone's browser, go to **snack.expo.dev** (tap "Request desktop site" if the page looks cramped).
4. Open the menu (☰ / "…") and choose **Import git repository**. Paste `https://github.com/diogop21/Pawnotes` and import.
5. Check the **SDK version** setting in Snack matches the one Expo Go supports (this project uses SDK 58).
6. Tap **Run → My Device** (or "Open in Expo Go"). Expo Go opens and runs PawNotes.
   - You can also tap the **Web** preview to try it right in the browser (photo picking and sharing work best in Expo Go).

## Project layout

```
App.tsx                 – starts the app and switches between screens
src/types.ts            – what a pet's and the home's data look like
src/storage.ts          – saving/loading on the phone (AsyncStorage)
src/shareText.ts        – builds the sections and text that get shared
src/sharing.ts          – share-text and photo-card actions used by the screens
src/card.ts             – the printable photo card (PDF)
src/backup.ts           – back up to / restore from a file
src/photo.ts            – picks a photo and keeps a copy in the app
src/theme.ts            – colors and text sizes
src/screens/            – Home, Home & visit, Pet profile, Edit section
src/components/         – buttons, text fields, choices, lists, header
```

## For developers (with a computer)

```bash
npm install
npx expo start      # scan the QR code with Expo Go
npx tsc --noEmit    # typecheck
```
