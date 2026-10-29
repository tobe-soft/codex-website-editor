# Codex Website Editor

Zuerst PROJECT-BRIEF.md lesen. Nur in diesem eigenen Arbeitsordner entwickeln.
Die bisherige Kundenwebsite und deren Webspace nicht verändern oder als Testziel
verwenden. Lokale Herkunftshinweise stehen unter .local/SOURCE.md und gehören
nicht auf GitHub.

Gemeinsamer Core: editor/core/, Version 1.3.0, Datenformat 2, Integration 1.
editor/core.lock.json fixiert die geprüfte Version. Änderungen versionieren,
Migrationen testen und die Lockdatei nach Prüfung gezielt erneuern. Erhalte die
Upgradegrenzen und alle Funktionen aus PROJECT-BRIEF.md.

Keine Kundeninhalte, Firmendaten, Logos, Fotos, Passwörter, Sessions, alten
Hostingzugänge oder komplette alte Repository-Historie übernehmen.
Persistente Daten und Uploads gehören nicht in Git.

Astro erzeugt dist/; PHP 8.2+ übernimmt serverseitige Verwaltung. Kein dauerhafter
Node-Server auf dem Webspace. Für Texte, Bilder und Links dauerhafte IDs nutzen.
Seitenname, Menübeschriftung und Titel verknüpfen. Haupt-/Footermenü unabhängig.
Bestehende Installationen mit Backup aktualisieren, niemals den Webspace leeren.

Vor Abschluss npm run check und npm run build sowie passende funktionale
PHP-/Browser- und Migrationstests ausführen. Neue allgemeine Funktionen zuerst
hier prüfen, bevor ein Kundenprojekt aktualisiert wird.

Die feste Drei-Seiten-Testwebsite ist zurückgestellt. Erste Designentscheidungen
im neuen Chat klären. GitHub-Veröffentlichung ist das Projektziel; vorher Konto,
Repositorynamen, Sichtbarkeit und Lizenz-/Herkunftshinweise konkret prüfen.
Keine öffentliche Quellcode-ZIP-Datei in Kundenwebsites erzeugen.

## Neue Websites mit dieser Vorlage

Beim Start zwei Wege anbieten: Referenzwebsite oder neutrale Standardgestaltung.
Zweck, Inhalte, Seiten und Gestaltung kurz klären und dann umsetzen. Die jetzigen
Standardseiten dürfen angepasst werden; eine feste Drei-Seiten-Testseite ist
nicht vorgeschrieben. Für neue Websiteprojekte dieses Repository als Vorlage
verwenden. Keine zweite Vorlage innerhalb eines bestehenden Checkouts anlegen.

Hostingdaten erst anfordern, wenn eine Veröffentlichung beauftragt ist. Echte
Passwörter ausschließlich über stdin an scripts/publish-editor.mjs übergeben.
Vor jedem Hostinglauf die echte Websitekennung, Domain und das konkrete
Zielverzeichnis prüfen. Keine implizite Veröffentlichung auf Sites-Hosting:
Diese Vorlage benötigt PHP auf einem passenden Webspace.

Astro dev dient der Gestaltung, die PHP-Vorschau der Editorprüfung. Für neue
Core-Releases auch scripts/editor-core.test.mjs ausführen. README.md enthält
den Einrichtungsablauf. GitHub-Zielkonto und Sichtbarkeit beim Nutzer klären.
