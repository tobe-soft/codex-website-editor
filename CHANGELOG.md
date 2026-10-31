# Änderungen

## Dokumentation – 31.10.2026

- Aufgabenverteilung festgelegt: Codex für Design/Aufbau/Funktionen, Editor für laufende Pflege.
- Kurzanleitung, Herkunftsvergleich und sichtbare Würdigung von David (david-loe) ergänzt.
- Vorgaben für Bearbeitbarkeit, stabile IDs und individuelle Erweiterungen präzisiert.
- Keine Änderung am Editor-Core oder Datenformat.

## 0.5.0 – 30.10.2026

- Core 1.4.0: Verwaltung mit Bereichen Seiten, Gestaltung, Sicherung und Zugang.
- Kompakte Seitenzeilen mit aufklappbaren Details und Dreipunktmenüs.
- Schmale Frontend-Leiste mit Bearbeiten, Vorschau und Verwaltung; Stifte bei Hover/Fokus.
- Individuelle Gestaltung und Rücksetzen in aufklappbaren Optionen, klare Aktionshierarchie.
- JSON-Sicherung ausschließlich im Backend als Texte und Einstellungen sichern.
- Browserprüfungen für Navigation, Entwürfe, Vorschau, Dialoge und mobile Darstellung.


## 0.4.2 – 29.10.2026

- Atlantik erhält ruhigeres Marineblau und gedämpfte Graublautöne, angelehnt an
  die vom Anwender genannte Referenz. Bestehende Atlantik-Auswahl übernimmt die
  neue Palette automatisch; Inhalte und individuelle Einstellungen bleiben erhalten.


## 0.4.1 – 29.10.2026

- Core 1.3.1: Beide Menüvarianten folgen dem Farbkonzept einschließlich
  Buttonflächen, Text, Rändern, Hover, aktiver Seite und mobilem Menü.
- Die Menüvorschau im Adminbereich verwendet die gleichen Farben und Schriften.


## 0.4.0 – 29.10.2026

- Core 1.3.0: Vier vollständige Farb-/Schriftkonzepte mit Admin-Vorschau.
- Auswahl gilt für alle Seiten, einschließlich Flächen, Menüs und Footer.
- Farbkonzepte werden mit Inhalt exportiert und wiederhergestellt.
- Kontrasttests und Browserprüfungen für alle vier Paletten.


## 0.3.0 – 29.10.2026

- Core 1.2.0: Adminpasswort direkt beim ersten Aufruf festlegen, ohne Schlüssel.
- Keine Mindestlänge oder Zeichenregeln; kurze und lange Passwörter möglich.
- Bestehende Passwort-Hashes und Adminzugänge bleiben kompatibel.


## 0.2.0 – 29.10.2026

- Core 1.1.0 unterstützt optionale Unterpfade; bestehende Root-Installationen
  bleiben kompatibel (Datenformat 2, Integration 1).
- Editor-Endpunkte, Navigation, Medien, Sitzungen, neue Seiten und Metadaten
  beachten den konfigurierten basePath.
- Getrennte lokale Hostingkonfiguration über SITE_CONFIG_PATH. Keine Hosting-
  oder Zugangsdaten in der Vorlage.
- Root- und Unterpfad-Funktionstests sowie echter FTPS-Installations-/Update-Test
  mit Erhalt von Adminzugang, Texten und Bildern bestanden.

## 0.1.0 – 29.10.2026

Erste neutrale Astro/PHP-Vorlage mit Core 1.0.0, Standardseiten, Einrichtung,
FTPS-Publisher und automatisierten Tests.
