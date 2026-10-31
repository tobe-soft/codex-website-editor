# Herkunft und Konzeptvergleich

## Danke an David

Der Ausgangspunkt dieses Projekts ist **[codex-website](https://github.com/david-loe/codex-website)**
von **[David (david-loe)](https://github.com/david-loe)**. Sein Astro-/TypeScript-/
Tailwind-Starter und seine Anweisungen für eine einfache Website auf Shared
Hosting bilden die Grundlage unserer Weiterentwicklung. Vielen Dank für diese
Vorarbeit und die offene Bereitstellung unter der GNU AGPL Version 3.

Die hier entwickelte Browserpflege, der gemeinsame Editor-Core und die dafür
angepassten Updatewerkzeuge werden in diesem Repository eigenständig gepflegt.
Eine Beteiligung oder Freigabe Davids für diese Erweiterungen wird damit nicht
behauptet. Der PHP-Editor ist keine im verglichenen Ursprungsprojekt angebotene
Funktion. Die Entwicklung führte vom Starter über einen konkreten Websiteeinsatz
zu dieser neutralen Vorlage; private Websiteinhalte wurden nicht übernommen.

## Vergleich vom 31.10.2026

Verglichen wurden README, AGENTS.md, Paketkonfiguration und Lizenz des
[Ursprungsstands 229c8aa](https://github.com/david-loe/codex-website/tree/229c8aadd85c10009e79b94e964bff26c7add2fd)
mit unserer Vorlage 0.5.0 / Core 1.4.0 und ihren dokumentierten Schnittstellen.
Das ist ein Konzept- und Vorgabenvergleich, keine vollständige Codeprüfung oder
Zusage, beliebige Ursprungsänderungen automatisch übernehmen zu können.

| Vorgabe im Ursprungsprojekt | Umsetzung und Weiterentwicklung hier |
| --- | --- |
| Astro, TypeScript, Tailwind; Build nach `dist/` | Grundlage erhalten; Astro inzwischen in Version 7 statt 6. |
| Shared Hosting ohne laufenden Node-Server | Weiterhin kein Node-Server; zusätzlich PHP 8.2+ für Editor und Auslieferung gepflegter Inhalte. Deshalb kein rein statischer Betrieb mehr. |
| Schnell, responsiv, barrierearm; einfache Komponenten | Als Arbeitsvorgabe übernommen, ergänzt um Prüfung der Editor-Anbindung. |
| Deutsche Texte und Inhaltsseiten | Neutrale deutsche Beispielseiten, vor Veröffentlichung zu ersetzen. |
| Inhalte bei Wachstum möglichst Markdown/MDX | Für editorpflegbare Inhalte stattdessen stabile IDs und serverseitiger Inhaltsstand; Markdown allein würde die Browserpflege nicht anbinden. |
| Allgemeine Werkzeuge von Websiteinhalten trennen | Versionierter Core mit Lockdatei; individuelles Design und Quellen bleiben außerhalb des Cores. |
| Gerüständerungen gezielt mit Herkunftsverweis übernehmen | Herkunft erhalten; hier kompatible Core-Updates mit Prüfung, Backup und Migration. Kein blindes Kopieren oder automatisches Zusammenführen. |
| Deployment ausdrücklich beauftragen; keine Secrets in Git | Beibehalten; Zugangsdaten an unseren Publisher über stdin. |
| SSH, FTP oder FTPS; Deployment leert das Ziel | Eigener Publisher für explizites FTPS mit Backup, Prüfung und Datenerhalt. Das Leeren des Ziels wäre für Editor-Speicher und Uploads ungeeignet. |
| Astro-Vorschau und Check/Build | Check/Build beibehalten; Editorvorschau zusätzlich über PHP. Astro preview führt PHP nicht aus. |
| AGPL-3.0 | Vollständige LICENSE erhalten; Herkunftshinweise in README und THIRD-PARTY-NOTICES.md. |

Die Konzepte bauen gut aufeinander auf: Codex entwickelt die Website, das
Websiteprojekt enthält ihre individuelle Gestaltung. Unsere zusätzliche Ebene
ermöglicht die alltägliche Pflege ohne erneuten Codex-Auftrag. Animationen oder
neue Layouts bleiben möglich, ihre Texte/Bilder sollen weiter pflegbar sein.

Wichtige Abweichungen sind bewusst dokumentiert: PHP statt ausschließlich
statischer Auslieferung, Inhaltsspeicher statt alleiniger Quelldateipflege und
ein datenerhaltender Veröffentlichungsweg. Die ursprünglichen Deploymentbefehle
und deren Zielbereinigung dürfen deshalb nicht unverändert auf eine laufende
Editorinstallation angewendet werden.

Bei künftigen Übernahmen aus dem Ursprungsprojekt den konkreten Commit nennen,
Änderungen gezielt prüfen und lokale Gestaltung sowie Editor-Daten erhalten.
Urheber- und Lizenzhinweise nicht entfernen. Verfügbare Editorfunktionen und
Codex-Aufgaben beschreibt die [Kurzanleitung](KURZANLEITUNG.md).
