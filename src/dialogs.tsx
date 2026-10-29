import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import BigButton from './components/BigButton';
import { colors, font, radius, space } from './theme';

// Pop-up messages. On phones these use the normal system pop-ups.
// In a web browser we draw our own, because some web previews block browser pop-ups.

type Dialogs = {
  notify: (title: string, message: string) => void;
  confirm: (title: string, message: string, confirmLabel: string) => Promise<boolean>;
  showText: (title: string, text: string) => void;
};

type Open =
  | { kind: 'notify'; title: string; message: string }
  | { kind: 'confirm'; title: string; message: string; confirmLabel: string }
  | { kind: 'text'; title: string; message: string };

const DialogContext = createContext<Dialogs | null>(null);

export function useDialogs(): Dialogs {
  const value = useContext(DialogContext);
  if (!value) throw new Error('useDialogs must be used inside DialogProvider');
  return value;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Open | null>(null);
  const [copied, setCopied] = useState(false);
  const resolveRef = useRef<((ok: boolean) => void) | null>(null);

  const close = (ok: boolean) => {
    resolveRef.current?.(ok);
    resolveRef.current = null;
    setOpen(null);
    setCopied(false);
  };

  const notify = useCallback((title: string, message: string) => {
    if (Platform.OS !== 'web') Alert.alert(title, message);
    else setOpen({ kind: 'notify', title, message });
  }, []);

  const confirm = useCallback((title: string, message: string, confirmLabel: string) => {
    return new Promise<boolean>((resolve) => {
      if (Platform.OS !== 'web') {
        Alert.alert(title, message, [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
        ]);
        return;
      }
      resolveRef.current = resolve;
      setOpen({ kind: 'confirm', title, message, confirmLabel });
    });
  }, []);

  const showText = useCallback((title: string, text: string) => {
    setOpen({ kind: 'text', title, message: text });
  }, []);

  const copy = async () => {
    if (!open) return;
    try {
      await navigator.clipboard.writeText(open.message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <DialogContext.Provider value={{ notify, confirm, showText }}>
      {children}
      <Modal visible={open !== null} transparent animationType="fade" onRequestClose={() => close(false)}>
        <View style={styles.backdrop}>
          <View style={styles.box}>
            <Text style={styles.title}>{open?.title}</Text>
            {open?.kind === 'text' ? (
              <ScrollView style={styles.textScroll}>
                <Text selectable style={styles.shareText}>
                  {open.message}
                </Text>
              </ScrollView>
            ) : (
              <Text style={styles.message}>{open?.message}</Text>
            )}
            {open?.kind === 'confirm' && (
              <View style={styles.row}>
                <BigButton label="Cancel" variant="secondary" onPress={() => close(false)} style={styles.flex} />
                <BigButton label={open.confirmLabel} onPress={() => close(true)} style={styles.flex} />
              </View>
            )}
            {open?.kind === 'notify' && <BigButton label="OK" onPress={() => close(false)} />}
            {open?.kind === 'text' && (
              <View style={styles.row}>
                <BigButton label="Close" variant="secondary" onPress={() => close(false)} style={styles.flex} />
                <BigButton label={copied ? 'Copied ✓' : 'Copy'} onPress={copy} style={styles.flex} />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </DialogContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(61, 44, 36, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.md,
  },
  box: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.md,
  },
  title: { fontSize: font.large, fontWeight: '800', color: colors.text },
  message: { fontSize: font.body, color: colors.text, lineHeight: 26 },
  textScroll: { backgroundColor: colors.background, borderRadius: radius.md, padding: space.md, flexGrow: 0 },
  shareText: { fontSize: font.small, color: colors.text, lineHeight: 24 },
  row: { flexDirection: 'row', gap: space.md },
  flex: { flex: 1 },
});
