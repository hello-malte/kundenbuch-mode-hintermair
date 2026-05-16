import { useState, useEffect, useRef } from 'react';
import { X, Download, Upload, Database, AlertTriangle } from 'lucide-react';
import { exportAllData, importAllData, getStats } from '../db/database';

export default function BackupMenu({ open, onClose }) {
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setError('');
    setInfo('');
    getStats().then(setStats);
  }, [open]);

  if (!open) return null;

  const handleExport = async () => {
    setBusy('export');
    setError('');
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const today = new Date().toISOString().slice(0, 10);
      const filename = `kundenbuch-export-${today}.json`;
      const file = new File([json], filename, { type: 'application/json' });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Kundenbuch Backup' });
          setInfo('Backup geteilt.');
          return;
        } catch (e) {
          if (e?.name === 'AbortError') return;
        }
      }

      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setInfo('Backup heruntergeladen.');
    } catch (e) {
      setError(e?.message || 'Export fehlgeschlagen.');
    } finally {
      setBusy('');
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setInfo('');
    setBusy('import');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const counts = `${data.customers?.length ?? 0} Kunden, ${
        data.timeline_entries?.length ?? 0
      } Timeline-Einträge, ${data.order_items?.length ?? 0} Order-Einträge`;
      const ok = confirm(
        `Backup enthält:\n${counts}\n\nAlle aktuellen Daten werden ÜBERSCHRIEBEN. Fortfahren?`
      );
      if (!ok) {
        setBusy('');
        return;
      }
      await importAllData(data);
      const fresh = await getStats();
      setStats(fresh);
      setInfo('Backup eingespielt.');
    } catch (e) {
      setError(e?.message || 'Import fehlgeschlagen.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl ring-1 ring-black/5 shadow-2xl safe-bottom">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-semibold">Daten</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-muted active:opacity-60"
            aria-label="Schließen"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          <div className="bg-surface2 rounded-2xl p-4 flex items-start gap-3">
            <Database size={18} className="text-brand mt-0.5 shrink-0" />
            <div className="text-sm leading-relaxed">
              {stats ? (
                <>
                  <div className="font-medium text-ink">
                    {stats.customers} Kunde{stats.customers === 1 ? '' : 'n'}
                  </div>
                  <div className="text-muted text-xs mt-0.5">
                    {stats.timeline_entries} Einkäufe ·{' '}
                    {stats.alterations ?? 0} Änderungen ·{' '}
                    {stats.order_items} Order-Eintr
                    {stats.order_items === 1 ? 'ag' : 'äge'}
                  </div>
                </>
              ) : (
                <span className="text-muted">Lade …</span>
              )}
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={busy === 'export'}
            className="w-full bg-brand text-white rounded-xl py-3 px-4 flex items-center gap-3 active:opacity-80 disabled:opacity-40 transition-opacity"
          >
            <Download size={20} />
            <span className="flex-1 text-left">
              <span className="block font-medium">Daten exportieren</span>
              <span className="block text-xs opacity-80">
                Backup-Datei zum Teilen oder Speichern
              </span>
            </span>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy === 'import'}
            className="w-full bg-surface2 text-ink rounded-xl py-3 px-4 flex items-center gap-3 active:opacity-80 disabled:opacity-40 transition-opacity"
          >
            <Upload size={20} />
            <span className="flex-1 text-left">
              <span className="block font-medium">Daten importieren</span>
              <span className="block text-xs text-muted">
                Backup wieder einspielen — überschreibt alles
              </span>
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />

          {error && (
            <div className="flex items-start gap-2 text-sm text-brand bg-brand/10 rounded-lg p-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="text-sm text-ink bg-surface2 rounded-lg p-3">
              {info}
            </div>
          )}

          <p className="text-xs text-muted leading-relaxed pt-1">
            Alle Daten liegen nur lokal in diesem Browser. Erstelle regelmäßig
            ein Backup — z. B. wöchentlich in iCloud Drive oder per E-Mail an
            dich selbst.
          </p>
        </div>
      </div>
    </div>
  );
}
