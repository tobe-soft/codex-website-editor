# Codex Website Editor

Astro-Vorlage mit PHP-Frontend-Editor für klassisches Shared Hosting. Auf dem
Webspace wird kein Node-Server benötigt. Dies ist ein eigenständiges Projekt
auf Basis von [david-loe/codex-website](https://github.com/david-loe/codex-website).

## Mit Codex starten

Repository als Vorlage verwenden oder klonen und in Codex öffnen. Zum Beispiel:

> Erstelle mit dieser Vorlage meine Website. Frage zuerst, ob ich eine
> Referenzwebsite verwenden oder die neutrale Standardgestaltung anpassen möchte.
> Kläre Zweck, gewünschte Seiten und Inhalte. Hosting richten wir später ein.

Die Standardgestaltung ist hell mit grüner Akzentfarbe. Enthalten sind Start,
Über uns, Leistungen, Kontakt, Impressum und Datenschutz. Alle Beispieldaten und
rechtlichen Platzhalter vor Veröffentlichung ersetzen. Die Illustrationen sind
lokale SVG-Dateien ohne externe Dienste oder Schriftabrufe.

## Voraussetzungen und Vorschau

- Node.js 22.12+ oder 24+, npm
- PHP 8.2+ mit fileinfo für Verwaltung, Bild-Uploads und Produktionsvorschau
- Hosting: Apache mit mod_rewrite, AllowOverride und HTTPS; explizites FTPS

```sh
npm ci
npm run dev
npm run check
npm run build
php -S 127.0.0.1:8766 -t dist scripts/dev-router.php
```

Astro zeigt die Gestaltung unter seiner ausgegebenen lokalen URL. PHP unter
http://127.0.0.1:8766 zeigt die tatsächlich gebaute Website einschließlich Editor.
`astro preview` kann PHP nicht ausführen und ist keine Produktionsvorschau.
Der PHP-Entwicklungsserver ist ausschließlich für lokale Tests gedacht.

## Editor erstmalig einrichten

```sh
npm run editor:setup
npm run build
```

Der erste Befehl gibt einen zufälligen Einrichtungsschlüssel aus. Sicher
aufbewahren: Lokal wird nur dessen SHA-256-Hash in der ignorierten Datei
`public/site-editor/bootstrap.php` gespeichert. Bestehende Dateien werden nicht
überschrieben. Nach Installation `/site-editor/` öffnen und mit dem Schlüssel
ein Adminpasswort setzen (mindestens 14 Zeichen, maximal 72 UTF-8-Bytes).
Der Schlüssel kann nach der Einrichtung keine neue Anmeldung ersetzen.
Bootstrap-Dateien danach lokal und auf dem Server entfernen.

Im Stiftmodus lassen sich Texte, Textrollen, globale und individuelle Stile,
Bilder, Logo und Links bearbeiten. Die Verwaltung bietet unabhängige Haupt-
und Footermenüs, neue Seiten, Umbenennen, Reihenfolge und Löschen. Die Startseite
ist geschützt. Inhalte können exportiert und die letzte Inhaltsveröffentlichung
zurückgenommen werden. Es gilt eine Konfliktprüfung über Inhaltsrevisionen.

## FTPS-Veröffentlichung mit Codex

Zuerst echte Domain und Websitekennung in `site.config.json` eintragen und neu
bauen. Zugangsdaten erst bei tatsächlichem Hostingbedarf erfragen. Publisher:

```sh
node scripts/publish-editor.mjs
```

Der Befehl liest ein JSON-Objekt über stdin bis EOF. Schema (nur Platzhalter):

```json
{"host":"ftp.example.invalid","port":21,"user":"BENUTZER","password":"PASSWORT","remoteRoot":"/website","mode":"probe"}
```

Codex übergibt echte Zugangsdaten ausschließlich über stdin, niemals in
Befehlsargumenten oder versionierten Dateien. Unterstützt wird explizites FTPS
mit Zertifikatsprüfung. `probe` prüft Verbindung und Installationskennung;
`install` erfordert ein leeres, ausschließlich dieser Website zugeordnetes
Verzeichnis und einen Build mit Einrichtungsschlüssel. `update` erfordert eine
passende vorhandene Installation. Bei Installation/Update bestätigt eine
kurzlebige PHP-Prüfdatei die Domainzuordnung und PHP-Ausführung über HTTPS.

Vor Änderungen wird das gesamte Ziel in `.local/backups/` gesichert. Während
der Übertragung liefert Apache 503. Jede Datei wird nach Upload zurückgelesen
und gehasht; bei Fehlern werden berührte Dateien zurückgesetzt. Schlägt auch die
Rücksicherung fehl, bleibt eine konkrete Fehlermeldung mit Backup-Pfad.
Unbekannte Serverdateien werden nicht gelöscht. Gespeicherte Inhalte, Uploads
und bestehende Adminzugänge werden bei Updates nicht übertragen/überschrieben.
Backups enthalten private Daten und dürfen nicht veröffentlicht werden.

Ein echter Hostinglauf muss am gewählten Ziel geprüft werden; lokale Tests
ersetzen weder FTPS-Zugang noch die Prüfung der Apache-Konfiguration.

## Gemeinsamer Core und Updates

`editor/core/` ist der versionierte gemeinsame Core (1.1.0, Datenformat 2,
Integration 1). `editor/core.lock.json` fixiert dessen geprüfte Prüfsummen.
Websitegestaltung und Inhalte liegen außerhalb des Cores. Neue Core-Releases
müssen ihre Version erhöhen und Migrationen erhalten.

```sh
node scripts/update-editor-core.mjs --source /pfad/zum/vertrauten/editor/core
node scripts/update-editor-core.mjs --source /pfad/zum/vertrauten/editor/core --apply
```

Zuerst den Plan ansehen. Lokale Core-Abweichungen, inkompatible Integrationen,
Schemas und Downgrades werden blockiert; vor Übernahme entsteht ein Backup.
Danach prüfen, bauen und erst dann mit passender Websitekonfiguration deployen.
Für bestehende Websites das jeweilige Quellrepository verwenden. Diese Vorlage
nicht vollständig über ein Kundenrepository kopieren.

## Tests

```sh
npx playwright install chromium
npm run check
npm run build
npm run test:upgrade
node --test scripts/editor-core.test.mjs
# PHP-Vorschau parallel wie oben starten:
npm run test:editor
```

`PHP_BIN` kann einen absoluten PHP-Pfad für Migrationstests setzen.
Funktionstests verwenden ausschließlich localhost und sichern/rücksichern ihren
lokalen Inhaltsstand. Sie prüfen Anmeldung, CSRF, Texte, Stile, Revisionskonflikte,
Menüs, Seitenverwaltung, Wiederherstellung, Mobilansicht und Speicherzugriff.

## Herkunft und Lizenz

Der Astro-Ausgangspunkt stammt von david-loe/codex-website und steht unter
AGPL-3.0. Die vollständige übernommene Lizenz steht in `LICENSE`.
Die neutrale Website, Integration und Werkzeuge wurden am 29.10.2026 erweitert.
`THIRD-PARTY-NOTICES.md` beschreibt Herkunft und die Trennung privater Daten.
Vor öffentlicher Nutzung muss das Quellcodeangebot auf den konkreten,
tatsächlich veröffentlichten Stand zeigen. Keine öffentliche ZIP-Datei mit
privaten Websitequellen, Daten, Uploads oder Zugangsdaten auf dem Webspace erzeugen.

## Installation unter einem Unterpfad

Optional `basePath` in `site.config.json` setzen, zum Beispiel `/codex` (ohne
abschließenden Slash). `origin` bleibt die reine HTTPS-Domain. Der Core 1.1.0
unterstützt die bisherige Domainwurzel weiter unverändert; Datenformat 2 und
Integration 1 bleiben kompatibel. Seitenadressen in Inhaltsdaten bleiben relativ
zur Installation. Für eine lokale, nicht versionierte Hostingkonfiguration kann
`SITE_CONFIG_PATH` auf eine Datei unter `.local/` zeigen. Build und Publisher
müssen dieselbe Konfiguration verwenden. Zugangsdaten nur über stdin übergeben.

Ein realer Erstinstallations- und Update-Test unter einem Unterpfad wurde mit
PHP 8.3 durchgeführt: Anmeldung, Veröffentlichung, neue Seiten, Bild-Upload,
Speicherschutz und Erhalt von Adminzugang/Inhalten/Medien bestanden.
