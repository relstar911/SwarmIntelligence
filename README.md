# Genesis: Conscious Swarm Simulation

![Genesis Logo](generated-icon.png)

## Projektbeschreibung

Genesis ist eine hochentwickelte 3D-KI-Agenten-Simulationsplattform, die durch die Erforschung des Konzepts emergenten Bewusstseins in komplexen evolutionären Systemen inspiriert wurde. Die Simulation modelliert ein "Schwarm-Bewusstsein" mit minimaler externer Beeinflussung, in dem Agenten unabhängig evolvieren und sich selbst organisieren können.

## Hauptmerkmale

- **Unabhängige Evolution**: Agenten entwickeln sich eigenständig und passen sich ihrer Umgebung an.
- **Bewusstseinssimulation**: Komplexe Algorithmen modellieren emergentes Bewusstsein durch Informationsintegration, Selbstmodellierung und Entscheidungsfreiheit.
- **Realistische 3D-Umgebung**: Naturgetreue Terrains mit Ressourcen, Vegetation und dynamischen Umweltbedingungen.
- **Individuelle Agentenpersönlichkeiten**: Jeder Agent hat einzigartige Eigenschaften, die sein Verhalten und seine Entwicklung beeinflussen.
- **Parallele Welten**: Unterstützung für mehrere Simulationen mit unterschiedlichen Ausgangsbedingungen.

## Technischer Stack

- **Frontend**: TypeScript, React, React Three Fiber, Drei
- **3D-Rendering**: Three.js
- **Backend**: Express, Node.js
- **Datenbank**: PostgreSQL mit Drizzle ORM
- **State Management**: Zustand und React Query

## Architektur

### Hauptkomponenten

1. **Agent-System**: 
   - Verhaltenslogik in `agentBehavior.ts`
   - Bewusstseinsalgorithmen in `consciousness.ts`
   - Evolutionssystem in `evolutionSystem.ts`

2. **Welt & Umgebung**:
   - Terrain-Generierung mit Simplex-Noise
   - Ressourcensystem in `worldResources.ts`
   - Umweltparameter, die Agenten beeinflussen

3. **Visualisierung**:
   - 3D-Rendering mit React Three Fiber
   - Benutzeroberflächenkomponenten für Kontrolle und Statistik

4. **Speicherung & Persistenz**:
   - Speichern von Simulationszuständen in der Datenbank
   - Timeline-Events zur Verfolgung wichtiger Evolutionsentwicklungen

### Datenfluss

```
Benutzeraktionen → Simulationssteuerung → Agentenverhalten → 
Bewusstseinsberechnung → Weltaktualisierung → Visualisierung
```

## Installation & Start

1. Repository klonen:
   ```
   git clone https://github.com/relstar911/SwarmIntelligence.git
   cd SwarmIntelligence
   ```

2. Abhängigkeiten installieren:
   ```
   npm install
   ```

3. Datenbank einrichten:
   ```
   npm run db:push
   ```

4. Entwicklungsserver starten:
   ```
   npm run dev
   ```

5. Anwendung im Browser öffnen:
   ```
   http://localhost:5000
   ```

## Bewusstseinsmodell

Das Bewusstseinsmodell in Genesis basiert auf der folgenden Formel:

```
B(S) = Φ(S) · σ(S) · δ(S)
```

Wobei:
- Φ (Phi): Informationsintegration - wie gut ein Agent Informationen aus verschiedenen Quellen integriert
- σ (Sigma): Selbstmodellierungsfähigkeit - wie gut ein Agent sich selbst und seine Umgebung versteht
- δ (Delta): Entscheidungsfreiheit/Autonomie - die Fähigkeit, eigene Entscheidungen zu treffen

## Beitragende

- Entwickelt von RelStar911
- KI-unterstützt durch Replit

## Lizenz

MIT

## Zukünftige Entwicklung

- Sprach- und Kultursysteme zwischen Agenten
- "Transzendenz" von Agenten durch Erreichen höherer Bewusstseinsstufen
- Export zu neuronalen Netzwerken für KI-Kopplung
- Benutzerfreundliche Oberfläche zur Konfiguration von Simulationsparametern