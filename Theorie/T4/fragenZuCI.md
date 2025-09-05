# Software Engineering Practices – Überblick

## 1) Continuous Integration (CI): Was es ist & wie man es umsetzt

**Kurzdefinition**  
CI ist eine Praxis, bei der Code häufig (ideal: mehrmals täglich) in den Main-Branch integriert wird. Jede Integration triggert einen automatisierten Build inkl. Tests, um Integrationsfehler früh zu finden.  
Quelle: [Martin Fowler – Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html)

**Warum wichtig im Prozess**
- Frühzeitiges Feedback → weniger Integrationshölle  
- Stabiler Hauptzweig → schnellere Lieferfähigkeit  
- Grundlage für Continuous Delivery/Deployment (CD)  

**Technik & Werkzeuge (Beispiele)**
- Versionskontrolle: Git  
- CI-Server/-Dienste: Jenkins, GitLab CI, GitHub Actions, Azure Pipelines  
- Pipeline-as-Code: Jenkinsfile, `.gitlab-ci.yml`, GitHub Actions-Workflows, Azure Pipelines YAML  

**Minimaler CI-Flow (Skizze)**  
`[Commit/Push] -> [Build] -> [Unit-/Static-Tests] -> [Artefakt erzeugen] -> [Berichte/Status]`

---

## 2) Continuous Integration: Vor- & Nachteile

**Vorteile**
- Frühe Fehlererkennung  
- Geringere Integrationskosten  
- Schnelleres Feedback  
- Stabilere Releases  
- Bessere Code-Qualität  
Quelle: [Martin Fowler – CI](https://martinfowler.com/articles/continuousIntegration.html)

**Herausforderungen**
- Anfangsaufwand (Testautomatisierung, Pipeline-Aufbau)  
- Kulturwandel: kleine, häufige Commits, disziplinierte Reviews  
- Flaky Tests/instabile Pipelines → können Vertrauen untergraben  

**Langfristiger Einfluss**
- Höhere Produktqualität durch kontinuierliche Verifikation  
- Kürzere Lead Times, bessere Vorhersagbarkeit  

---

## 3) Continuous Testing (CT): Was es ist & Umsetzung

**Kurzdefinition & Abgrenzung**  
CT bedeutet: automatisierte Tests laufen kontinuierlich entlang der Pipeline (nicht nur am Ende) und liefern Risiko-/Qualitätsfeedback zu jedem Change. Unterschied zu traditionellen späten Testphasen.  
Quelle: [IBM – Continuous Testing](https://www.ibm.com/topics/continuous-testing)

**Rolle im Entwicklungszyklus**
- Stützt jede Pipeline-Stufe (Build → Unit, Integrations-/API-, UI-, Performance-, Security-Checks)  
- „Shift-Left“ und „Test everywhere“  

**Typische Testarten & Wirksamkeit**
- Schnelle: Linting/Static Analysis, Unit  
- Mittlere: API/Integrations, Contract Tests  
- Langsame: E2E/UI, Performance, Security  

**CT-Flow (Skizze)**  
`Commit -> Lint/Unit (Sek.) -> API/Contract (Min.) -> E2E/Perf/Sec (Min.-Std.)`  
→ Gates & Qualitätsberichte  

---

## 4) Branching-Strategie: Warum & welche gibt’s?

**Warum wichtig**
- Struktur für parallele Arbeit & Release-Planung  
- Kürzere Branch-Lebenszeit → weniger Konflikte  
- Klare Politik für Reviews, CI-Gates, Releases  

**Bekannte Strategien**
- **Trunk-Based Development (TBD):** kurze Feature-Branches, Feature Flags → fördert CI/CD  
- **GitHub Flow:** main + kurzlebige Feature-Branches + PRs + Deployment von main  
- **GitLab Flow:** kombiniert Umgebungs-/Release-Branches mit Issue-basiertem Flow  
- **Git Flow (Driessen):** develop, feature/*, release/*, hotfix/* → gut für streng versionierte Produkte  

Quelle: [A successful Git branching model – Vincent Driessen](https://nvie.com/posts/a-successful-git-branching-model/)

---

## 5) Commits/Branches mit User Stories verknüpfen

**Warum?**
- Rückverfolgbarkeit (Wer hat was warum geändert?)  
- Automatisierte Statusupdates  

**Best Practices & Konventionen**
- Branch-Namen: `feature/JIRA-123-kurztitel` / `bugfix/AB#456-npe-fix`  
- Commit-Prefix: `JIRA-123: ...` oder `AB#456: ...`  
- Pull-Request: Titel mit Issue-Referenz, „closing keywords“ (`Closes #123`)  

**Tool-Unterstützung**
- Jira Smart Commits → `JRA-123 #comment ... #time 2h #transition Done`  
- GitHub Issues → `closes/fixes/resolves #123`  
- Azure Boards → `AB#123`  

Quelle: [Atlassian – Smart Commits](https://support.atlassian.com/bitbucket-cloud/docs/use-smart-commits/)

---

## 6) Merge-Strategien: Welche & wann?

**Ansätze**
- **Fast-Forward Merge:** lineare Historie, kein Merge-Commit  
- **Three-Way Merge:** Merge-Commit zeigt Feature-Zusammenhang  
- **Squash Merge:** Feature-Historie zu einem Commit zusammenfassen  
- **Rebase:** Commits „umpflanzen“ → saubere lineare Geschichte  

**Einfluss**
- FF/Rebase → linear, weniger sichtbare Bündel  
- Merge-Commit → klarer Feature-Zusammenhang  
- Squash → kompakte Historie, Verlust von Zwischen-Commits  

Quelle: [Git Documentation – Merge](https://git-scm.com/docs/git-merge)

---

## 7) Semantic Versioning (SemVer): Was & wie?

**Wozu?**
- Versionierung: `MAJOR.MINOR.PATCH`  
- MAJOR: Breaking Changes  
- MINOR: neue Features  
- PATCH: Bugfixes  

**Praxis**
- Pre-Release/Build-Metadata: `1.2.0-alpha.1+build.5`  
- Automatisierung: Changelogs & Releases aus Commits („Conventional Commits“)  

Quelle: [SemVer.org – Specification](https://semver.org/)

---

## 8) Mono- vs. Multirepo bei Microservices

**Monorepo**
- **Pro:** atomare Changes, einheitliche Standards, einfache Code-Suche  
- **Contra:** Skalierung von CI/Builds, Repo-Grösse, Governance nötig  

**Multirepo**
- **Pro:** Team-Autonomie, unterschiedliche Release-Zyklen, kleine Repos  
- **Contra:** gemeinsame Libs/Contracts synchron halten, mehr Overhead  

Quelle: [Atlassian – Monorepo vs Many Repos](https://www.atlassian.com/git/articles/monorepos-vs-multiple-repos)

---

## 9) Artifact-Repository: Was & Aufgaben

**Rolle im Prozess**
- Zentrale Ablage für Artefakte (JARs, Docker-Images, Pakete)  
- Versionierung, Retention, Metadaten, Sicherheitsprüfungen  
- Typen: Maven, npm, PyPI, Docker-Registry  

**Warum wichtig**
- Reproduzierbare Deployments  
- Caching & Proxy zu externen Repos  
- Governance (Signaturen, Policies)  

**Beispiele**
- Sonatype Nexus Repository  
- JFrog Artifactory  
- Docker Registry  

Quelle: [JFrog – Artifactory](https://jfrog.com/artifactory/)
