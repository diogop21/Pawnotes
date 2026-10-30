import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { photoDataUri } from './photo';
import { homeSections, petName, petSections, Section } from './shareText';
import { colors } from './theme';
import { HomeInfo, Pet } from './types';

// A printable card (PDF) with each pet's photo, so a sitter can show it
// to neighbours or a shelter if the pet ever gets lost.

function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

function sectionHtml(s: Section): string {
  const body = s.lines
    .map((l) => {
      if (!l) return '<div class="gap"></div>';
      if (l.startsWith('• ')) {
        const text = l.slice(2);
        const colon = text.indexOf(': ');
        return colon > 0
          ? `<p>• <b>${escape(text.slice(0, colon))}:</b> ${escape(text.slice(colon + 2))}</p>`
          : `<p>• ${escape(text)}</p>`;
      }
      if (l.endsWith(':')) return `<h4>${escape(l)}</h4>`;
      return `<p>${escape(l)}</p>`;
    })
    .join('');
  return `<section><h3>${escape(s.title)}</h3>${body}</section>`;
}

export function buildCardHtml(pets: Pet[], home: HomeInfo, photos: (string | null)[]): string {
  const homeHtml = homeSections(home).map(sectionHtml).join('');
  const petsHtml = pets
    .map((pet, i) => {
      const photo = photos[i]
        ? `<img class="photo" src="${photos[i]}">`
        : '<div class="photo none">🐾</div>';
      const meta = [pet.breed, pet.age, pet.sex].map((v) => v.trim()).filter(Boolean).join(' · ');
      return `<article>
        <header>${photo}<div><h2>${escape(petName(pet))}</h2>${meta ? `<p class="meta">${escape(meta)}</p>` : ''}</div></header>
        ${petSections(pet).map(sectionHtml).join('')}
      </article>`;
    })
    .join('');

  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: -apple-system, Roboto, "Segoe UI", sans-serif; color: ${colors.text}; margin: 24px; font-size: 13px; }
  h1 { color: ${colors.primaryDark}; font-size: 22px; margin: 0 0 12px; }
  article { page-break-before: always; }
  article:first-of-type { page-break-before: ${homeHtml ? 'always' : 'auto'}; }
  header { display: flex; gap: 16px; align-items: center; margin-bottom: 12px; }
  .photo { width: 140px; height: 140px; border-radius: 16px; object-fit: cover; border: 3px solid ${colors.border}; }
  .none { display: flex; align-items: center; justify-content: center; font-size: 48px; background: ${colors.primarySoft}; }
  h2 { font-size: 26px; margin: 0; }
  .meta { color: ${colors.textMuted}; margin: 4px 0 0; font-size: 15px; }
  section { border: 1px solid ${colors.border}; border-radius: 10px; padding: 8px 12px; margin-bottom: 10px; break-inside: avoid; }
  h3 { margin: 0 0 6px; font-size: 14px; color: ${colors.primaryDark}; text-transform: uppercase; letter-spacing: .5px; }
  h4 { margin: 6px 0 2px; font-size: 13px; }
  p { margin: 2px 0; line-height: 1.4; }
  .gap { height: 6px; }
</style></head><body>
<h1>🐾 PawNotes for ${escape(pets.map(petName).join(' & ') || 'my pets')}</h1>
${homeHtml}
${petsHtml}
</body></html>`;
}

// Web: browsers can't share a PDF file, so open the print dialog where it can be saved as PDF.
function printOnWeb(html: string) {
  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  frame.onload = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 60_000);
  };
  frame.srcdoc = html;
  document.body.appendChild(frame);
}

export async function shareCard(pets: Pet[], home: HomeInfo): Promise<void> {
  const photos = await Promise.all(pets.map((p) => photoDataUri(p.photoUri)));
  const html = buildCardHtml(pets, home, photos);
  if (Platform.OS === 'web') {
    printOnWeb(html);
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Send the PawNotes card',
  });
}
