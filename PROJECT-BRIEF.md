# Ziel: Codex Website Editor

## Gewünschtes Ergebnis

Ein eigenständiges GitHub-Repository als einfach nutzbare Astro-Webseitenvorlage,
auf Basis von david-loe/codex-website und dem vorhandenen Frontend-Editor.
Die Vorlage enthält funktionsfähigen Programmcode und klare Codex-Anweisungen.
Der Schwerpunkt ist eine schnelle, einfache Website-Erstellung und Pflege.

Beim Start mit Codex zwei Wege anbieten:
1. Website anhand einer vom Anwender genannten Referenz gestalten.
2. Eine neutrale Standardwebsite erstellen und individuell anpassen.

Zweck, Inhalte, Gestaltung und notwendige Hostingangaben gezielt erfragen.
Zugangsdaten erst erfragen, wenn Hosting tatsächlich benötigt wird.
Die feste Testwebsite mit drei Seiten ist vorerst zurückgestellt.
Standarddesign und Seitenumfang werden im neuen Chat besprochen.

## Vorhandene Funktionen erhalten

- Admin-Login unter /site-editor/, Passwortwechsel, Abmeldung und Sitzungslaufzeit.
- Frontend-Stiftmodus für Texte, H1-H6 und weitere standardisierte Textrollen.
- Globale Textstile und individuelle Farbe, Größe und Schriftfamilie.
- Individuelle Anpassung als Checkbox: aus = Kategorienauswahl und vererbter Stil;
  an = Kategorie gesperrt mit custom setting und sichtbaren Stiloptionen.
- Bilder und gemeinsam verwendetes Logo ersetzen; Galerie und sichere Uploads.
- Links inklusive Telefon und E-Mail bearbeiten.
- Menüdesign schlicht oder abgerundete Buttons mit begrenzten Größen/Abständen.
- Seiten anlegen, umbenennen, sortieren und löschen; geschützte Startseite.
- Unabhängige Auswahl für Haupt- und Footermenü bei gleicher Seitenreihenfolge.
- Impressum und Datenschutz als normale Footer-Seiteneinträge.
- Inhaltsstand exportieren und letzte Inhaltsveröffentlichung zurücknehmen.
- Sichere Veröffentlichung mit Backup, Prüfung und Datenerhalt.

## Kompatible technische Updates

Neue gemeinsame Funktionen hier entwickeln, versionieren und testen. Der erste
bestehende Einsatz soll später kompatible Core-Versionen aus diesem Repository
übernehmen können, ohne eigenes Design oder Daten zu überschreiben.

- Gemeinsamer Core: editor/core/, fixiert durch editor/core.lock.json.
- Individuelle Website: src/, public/, site.config.json und site-defaults.json.
- Astro-Anbindung: Editable-Komponente, Navigation-Platzhalter und
  page-template.astro; derzeit Integrationsversion 1.
- Datenformat 2; Migrationen erhalten Texte, Stile, Medien, Menüs, Seiten,
  Revision, vorherigen Inhaltsstand und Adminzugang.
- Lokale Core-Abweichungen und inkompatible Integrationen blockieren Updates.
- Installation und Domainzuordnung beim Deployment prüfen. Bestehenden Webspace
  nicht leeren. Daten sichern, Dateien prüfen, bei Übertragungsfehlern zurückkehren.
- Keine automatische Übernahme beliebiger Astro-Websites allein über FTP versprechen.
  Für sichere technische Updates wird das passende Quellrepository benötigt.

## Arbeitsfolge im neuen Projekt

1. Projektstand und übernommenen Core prüfen.
2. Kurz den Stand erläutern und eine erste sinnvolle Gestaltung/Standardstruktur
   mit dem Anwender klären. Bereits bekannte Anforderungen nicht erneut abfragen.
3. Neutrale Astro-Vorlage und generischen Einrichtungs-/Hostingablauf implementieren.
4. Funktional, responsiv, auf Geheimnisse und alte Kundeninhalte prüfen.
5. GitHub-Konto, Repositoryname und Sichtbarkeit konkretisieren; keine öffentliche
   Sichtbarkeit erfinden. Lizenz- und Herkunftshinweise vor Veröffentlichung prüfen.
6. Geprüften Stand auf GitHub veröffentlichen und nachvollziehbare Releases erstellen.
   Danach kann die bestehende Website im ursprünglichen Chat per GitHub-Link
   technisch aktualisiert werden.

## Implementierter Stand am 29.10.2026

Bestätigte Gestaltung: helle Website mit grüner Akzentfarbe; Start, Über uns,
Leistungen, Kontakt sowie Impressum und Datenschutz im Footer. Standardseiten,
page-template.astro, Erstinstallation, allgemeiner FTPS-Publisher und neutrale
PHP-/Browser-/Migrationstests sind ergänzt. Die Tests prüfen auch Core-Updates,
Datenerhalt und Rücksicherung. Der gemeinsame Core bleibt unverändert 1.0.0.

Noch offen: GitHub-Zielkonto und Sichtbarkeit, tatsächliche Veröffentlichung
und Release-Link sowie ein realer Hostinglauf auf dem später gewählten Ziel.
Rechtliche Texte und Kontaktdaten sind ausdrücklich Beispiel-/Platzhalterinhalte.
