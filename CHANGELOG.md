# Änderungen

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
