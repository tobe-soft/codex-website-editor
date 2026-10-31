# Codex Website Editor

Zuerst PROJECT-BRIEF.md lesen. Nur in diesem eigenen Arbeitsordner entwickeln.
Anwendungskonzept und kurze Nutzeranleitung: docs/KURZANLEITUNG.md.
Herkunft und Abgleich mit dem Ursprungsprojekt: docs/HERKUNFT-UND-KONZEPT.md.
Die bisherige Kundenwebsite und deren Webspace nicht verändern oder als Testziel
verwenden. Lokale Herkunftshinweise stehen unter .local/SOURCE.md und gehören
nicht auf GitHub.

Gemeinsamer Core: editor/core/, Version 1.4.0, Datenformat 2, Integration 1.
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

Die Website schnell, responsiv und barrierearm halten. Semantisches HTML,
sinnvolle Überschriften, Bildbeschreibungen und einfache Komponenten bevorzugen.
Sichtbare Texte standardmäßig deutsch halten, sofern nichts anderes gewünscht.

Vor Abschluss npm run check und npm run build sowie passende funktionale
PHP-/Browser- und Migrationstests ausführen. Neue allgemeine Funktionen zuerst
hier prüfen, bevor ein Kundenprojekt aktualisiert wird.

Erste Designentscheidungen im neuen Websiteprojekt klären. Bei neuen GitHub-Zielen
Konto, Repositorynamen und Sichtbarkeit klären; bestätigte Angaben nicht erneut
erfragen. Herkunftsverweise auf david-loe/codex-website und Lizenz erhalten.
Keine öffentliche Quellcode-ZIP-Datei in Kundenwebsites erzeugen.

## Neue Websites mit dieser Vorlage

### Codex gestaltet, der Editor pflegt

Grundlegende Gestaltung, Seitenaufbau, neue Inhaltsbereiche, Animationen und
zusätzliche Funktionen auf Nutzerauftrag über Codex umsetzen. Die vorhandenen
Editorfunktionen begrenzen nicht die Gestaltungsmöglichkeiten.

Alltägliche Inhalte müssen weiterhin ohne Codeänderung pflegbar sein: Texte,
Bilder/Logo und Links an die vorhandenen Editor-Schnittstellen mit stabilen IDs
anbinden. Navigation, Textrollen und vorhandene Farbkonzepte berücksichtigen.
Eine Animation kann im Code festgelegt sein, während ihr Text/Bild editierbar
bleibt. Zusätzliche Editor-Einstellungen nur bei Bedarf für die laufende Pflege
ergänzen. Einen klar beauftragten festen Effekt ohne erneute Grundsatzfrage bauen.

Wenn der benötigte Pflegeumfang unklar ist oder eine Funktion nicht im Editor
verfügbar sein wird, dies vor der Umsetzung konkret erläutern und nur die offene
Entscheidung klären. Keine Bearbeitbarkeit versprechen, die nicht implementiert
ist. Neue Seitentypen/Layouts über Codex entwickeln; der Editor erstellt Seiten
auf Grundlage des vorhandenen Seitentemplates.

Vor einem Umbau gespeicherte Editor-Anpassungen berücksichtigen. IDs nicht aus
neuen Texten ableiten oder still ersetzen; nötige Änderungen gezielt migrieren.
Individuelles Design in der Website, allgemeine Editor-Erweiterungen im
versionierten Core halten. Nach Änderungen die Pflegefähigkeit der betroffenen
Texte, Bilder und Links sowie Navigation und mobile Darstellung prüfen.

### Start und Veröffentlichung

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
