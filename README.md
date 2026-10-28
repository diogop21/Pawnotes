# 🐾 PawNotes

Pet sitter info card app. Keep everything a sitter needs to know about your pet in one place, then send it to them with one tap.

Built with **Expo (React Native) + TypeScript**. All data stays on your phone (AsyncStorage). No account, no internet needed.

## What's in version 1

- **Home** – your pet list with an "Add a pet" button (1 pet for now).
- **Profile** – photo from your camera roll, name, breed, age, microchip number.
- **Daily routine** – feeding times & amounts, walk times, potty notes.
- **Quirks & rules** – a list like "scared of the vacuum".
- **Meds & health** – medications (name, dose, time), vet name & phone, allergies.
- **Emergency contacts** – owner, backup person, emergency vet.
- **Share with sitter** – turns the whole profile into tidy text and opens your phone's share sheet.

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
src/types.ts            – what a pet's data looks like
src/storage.ts          – saving/loading on the phone (AsyncStorage)
src/shareText.ts        – builds the text that gets shared
src/photo.ts            – picks a photo and keeps a copy in the app
src/theme.ts            – colors and text sizes
src/screens/            – Home, Pet profile, Edit section
src/components/         – buttons, text fields, lists, header
```

## For developers (with a computer)

```bash
npm install
npx expo start      # scan the QR code with Expo Go
npx tsc --noEmit    # typecheck
```
