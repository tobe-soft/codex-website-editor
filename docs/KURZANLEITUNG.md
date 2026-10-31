# Website erstellen und später selbst pflegen

**Codex gestaltet, der Editor pflegt.** Du brauchst für alltägliche Änderungen
keine Codekenntnisse. Für einen neuen Aufbau oder neue Funktionen beschreibst du
Codex deinen Wunsch in normaler Sprache.

## 1. Website mit Codex erstellen

Verwende dieses Repository als Vorlage für ein eigenes Websiteprojekt und öffne
es in Codex. Nenne Zweck, gewünschte Seiten und entweder eine Referenzwebsite
oder deine Gestaltungswünsche. Ein möglicher Startauftrag:

> Erstelle mit dieser Vorlage eine Website für meinen Betrieb. Kläre mit mir
> Seiten und Gestaltung. Texte, Bilder und Links möchte ich später selbst im
> Editor ändern. Die Veröffentlichung richten wir danach gemeinsam ein.

Codex erstellt die Website und prüft sie lokal. Für die Online-Veröffentlichung
werden Domain und ein geeigneter PHP-Webspace benötigt. Zugangsdaten gehören
nicht ins GitHub-Repository. Die technischen Schritte stehen in der [README](../README.md).

## 2. Inhalte im Browser ändern

Öffne nach der Installation deine Website mit `/site-editor/` am Ende der
Installationsadresse. Lege beim ersten Aufruf dein Adminpasswort fest und öffne
anschließend **Website bearbeiten**.

- **Bearbeiten:** Mit den Stiften Texte, Bilder oder Links öffnen, ändern und
  veröffentlichen. Am Computer erscheinen Stifte bei Annäherung oder Tastaturfokus.
- **Vorschau:** Die Website ohne Bearbeitungsmarkierungen ansehen.
- **Verwaltung → Seiten:** Seiten benennen, ihre Menüzuordnung ändern, sortieren
  und auf Grundlage des vorhandenen Seitentemplates neue Seiten anlegen.
- **Gestaltung:** Vorhandenes Farbkonzept, Menü und Schrift anpassen. Die Auswahl
  der Farbkonzepte setzt eine dafür angebundene Website voraus.
- **Sicherung:** Texte und Einstellungen als JSON herunterladen oder die letzte
  Inhaltsveröffentlichung zurücknehmen. Die JSON-Datei enthält keine Bilddateien
  und ersetzt kein vollständiges Websitebackup. Es gibt derzeit keinen JSON-Import.
- **Zugang:** Passwort ändern und abmelden.

## 3. Größere Änderungen über Codex beauftragen

Öffne dafür das Quellprojekt deiner Website in Codex. Beispiele:

> Ordne die Startseite neu: erst die Leistungen, dann die Vorstellung. Erhalte
> meine bereits gepflegten Inhalte und die Bearbeitbarkeit im Editor.

> Ergänze eine dezente Animation. Text und Bild sollen im Editor austauschbar
> bleiben; die Bewegung selbst muss dort nicht einstellbar sein.

Neue Layouts, Seitentypen und Funktionen werden im Code umgesetzt. Wenn du eine
neue Eigenschaft regelmäßig selbst ändern möchtest, sage das dazu. Codex prüft,
ob dafür eine zusätzliche Editor-Einstellung nötig ist. Änderungen zuerst in
einer Vorschau prüfen und anschließend gezielt veröffentlichen lassen.

Gespeicherte Inhalte, Uploads und Adminzugang sollen bei technischen Updates
erhalten bleiben. Dafür immer das eigene Websiteprojekt verwenden und vor dem
Update sichern; die Vorlage nicht vollständig über die bestehende Website kopieren.

Diese Vorlage baut auf Davids [codex-website](https://github.com/david-loe/codex-website)
auf. [Herkunft und Weiterentwicklung](HERKUNFT-UND-KONZEPT.md).
