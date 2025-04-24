# Entwickler-Anleitung für Genesis

## Einrichtung der Entwicklungsumgebung

### Voraussetzungen

- Node.js (v18 oder höher)
- npm oder yarn
- PostgreSQL-Datenbank
- Git

### Lokale Installation

1. Repository klonen:
   ```bash
   git clone https://github.com/relstar911/SwarmIntelligence.git
   cd SwarmIntelligence
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

3. Umgebungsvariablen einrichten:
   Erstellen Sie eine `.env`-Datei im Wurzelverzeichnis und fügen Sie folgende Einträge hinzu:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/genesis
   ```

4. Datenbank einrichten:
   ```bash
   npm run db:push
   ```

5. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```

## Projektstruktur

```
genesis/
├── client/               # Frontend-Codebase
│   ├── public/           # Statische Dateien
│   └── src/
│       ├── components/   # React-Komponenten
│       ├── lib/          # Kernlogik
│       │   ├── stores/   # Zustandsverwaltung
│       │   └── ...
│       └── ...
├── server/               # Backend-Code
├── shared/               # Von Frontend und Backend geteilter Code
├── docs/                 # Dokumentation
└── ...
```

## Kernbereiche für Erweiterungen

### 1. Agentenverhaltenslogik

Die Verhaltenslogik der Agenten befindet sich in `client/src/lib/agentBehavior.ts`. Um das Agentenverhalten zu erweitern:

1. Neue Aktionen zum `AgentAction`-Enum in `types.ts` hinzufügen
2. Die `decideAction`-Funktion erweitern, um die neue Aktion auszuwählen
3. Die `performAction`-Funktion implementieren, um die neue Aktion auszuführen

Beispiel für eine neue Aktion "verteidigen":

```typescript
// In types.ts
export type AgentAction = 
  | 'move'
  | 'explore'
  // ...bestehende Aktionen...
  | 'defend'; // Neue Aktion

// In agentBehavior.ts
function decideAction(agent: Agent, ...): AgentAction {
  // Logik zur Entscheidungsfindung
  if (threatDetected && agent.energy > DEFENSE_THRESHOLD) {
    return 'defend';
  }
  // Weitere Logik...
}

function performAction(agent: Agent, action: AgentAction, ...): void {
  switch(action) {
    // Bestehende Fälle...
    case 'defend':
      // Implementierung der Verteidigungsaktion
      break;
  }
}
```

### 2. Bewusstseinsmodell erweitern

Das Bewusstseinsmodell ist in `client/src/lib/consciousness.ts` implementiert. Um das Modell zu erweitern:

1. Neue Komponenten zur `ConsciousnessComponents`-Schnittstelle in `types.ts` hinzufügen
2. Neue Berechnungsfunktionen in `consciousness.ts` implementieren
3. Die Hauptformel `calculateConsciousness` anpassen

### 3. Umweltparameter und Ressourcen

Umweltparameter sind in `types.ts` als `EnvironmentalParameters` definiert und werden in `worldResources.ts` verwaltet. Um neue Umweltfaktoren einzuführen:

1. Neue Parameter zur `EnvironmentalParameters`-Schnittstelle hinzufügen
2. Die Logik in `updateResourceLevels` oder `calculateResourceDistribution` anpassen
3. Die Auswirkungen auf Agenten in `updateSensorValues` in `agentBehavior.ts` implementieren

### 4. Visuelle Darstellung

Die visuelle Darstellung ist in den React-Komponenten in `client/src/components/` implementiert:

- `World.tsx` - Hauptweltkomponente
- `Terrain.tsx` - Terrain-Generierung
- `Agent.tsx` - Visuelle Darstellung von Agenten

Um visuelle Elemente zu ändern, bearbeiten Sie diese Komponenten.

## Tipps zur Fehlerbehebung

### Flimmern und visuelle Glitches

Falls erneut Flimmern auftritt:

1. Prüfen Sie die Aktualisierungsgeschwindigkeit in `SimulationUpdater.tsx`
2. Reduzieren Sie die Komplexität der visuellen Komponenten
3. Überprüfen Sie, ob eindeutige Keys für Listen in React verwendet werden

### Leistungsprobleme

Bei Leistungsproblemen:

1. Verwenden Sie den `React.memo`-Wrapper für Komponenten, die sich selten ändern
2. Reduzieren Sie die Anzahl der Agenten mit dem `populationSize`-Parameter
3. Vereinfachen Sie die Terraingenerierung durch Reduzierung der `resolution` in `Terrain.tsx`

## Testing

Für die Implementierung von Tests:

```bash
# Unit-Tests ausführen
npm test

# Testabdeckung anzeigen
npm run test:coverage
```

## Datenbank-Migrations

Beim Ändern des Datenbankschemas:

1. Passen Sie die Schema-Definitionen in `shared/schema.ts` an
2. Aktualisieren Sie die betroffenen Funktionen in `server/simulationServices.ts`
3. Wenden Sie die Änderungen mit dem folgenden Befehl an:
   ```bash
   npm run db:push
   ```

## Deployment

Für das Deployment auf einem Produktionsserver:

1. Build erstellen:
   ```bash
   npm run build
   ```

2. In der Produktion starten:
   ```bash
   npm start
   ```

## Mitwirkung am Projekt

1. Fork erstellen und einen Feature-Branch anlegen
2. Code schreiben und Tests hinzufügen
3. Änderungen committen und in Ihren Fork pushen
4. Pull Request erstellen