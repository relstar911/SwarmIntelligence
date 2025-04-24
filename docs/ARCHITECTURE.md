# Genesis: Architektur-Dokumentation

## Übersicht

Die Genesis-Simulationsplattform ist nach dem Prinzip einer klaren Trennung zwischen Datenmodell, Geschäftslogik und Präsentationsschicht aufgebaut. Die Anwendung nutzt moderne React-Patterns mit TypeScript für Typsicherheit.

## Hauptbestandteile

### 1. Datenmodell

Die zentralen Datenstrukturen sind in `client/src/lib/types.ts` definiert:

- **Agent**: Repräsentiert autonome Entitäten mit Bewusstsein
- **WorldState**: Enthält den vollständigen Simulationszustand
- **Resource**: Repräsentiert Ressourcen in der Welt
- **EnvironmentalParameters**: Beschreibt Umweltbedingungen

### 2. Kernlogik

#### Agentensystem
- **AgentBehavior** (`agentBehavior.ts`): Steuert das Verhalten und die Aktionen der Agenten
- **Consciousness** (`consciousness.ts`): Berechnet und modelliert Bewusstseinswerte 
- **Evolution** (`evolutionSystem.ts`): Handhabt Mutation, Reproduktion und Artbildung

#### Weltsystem
- **WorldResources** (`worldResources.ts`): Verwaltet die Erzeugung und Verteilung von Ressourcen
- **Terrain Generation**: Nutzt Simplex-Noise für prozedurale Terrains

### 3. Zustandsverwaltung

#### Zustand (State Management)
- **useSimulation** (`useSimulation.ts`): Zentraler Zustandsspeicher für den Simulationszustand
- **useGame** (`useGame.tsx`): Verwaltet spielbezogene Einstellungen
- **useAudio** (`useAudio.tsx`): Steuert Audiosystem und Soundeffekte

#### Server-Kommunikation
- **QueryClient** (`queryClient.ts`): API-Client für die Server-Kommunikation
- **Simulation API**: Endpunkte für Simulationsdaten, Agentenspeicher und Zeitachsenereignisse

### 4. Benutzeroberfläche

#### Hauptkomponenten
- **App** (`App.tsx`): Haupteinstiegspunkt der Anwendung
- **MinimalWorld** (`MinimalWorld.tsx`): Vereinfachte Weltversion für bessere Leistung
- **World** (`World.tsx`): Vollständige Weltimplementierung mit allen Features

#### UI-Steuerelemente
- **SimulationControls**: Steuert Simulationsparameter
- **TimeControls**: Erlaubt Zeitmanipulation
- **Metrics**: Zeigt Simulationsstatistiken an

## Datenfluss

```
1. Benutzeraktion → Zustandsänderung in useSimulation/useGame
2. Zustandsänderung → Re-Rendering relevanter Komponenten
3. SimulationUpdater → Ausführung der Kernlogik (Agenten/Welt-Updates)
4. Kernlogik → Aktualisierung des Simulationszustands
5. Zustandsaktualisierung → Synchronisierung mit dem Backend
6. Backend → Persistierung in der Datenbank
```

## Optimierungen

### Leistungsoptimierungen
- Verwendung von Intervall-Updates statt Animation-Frames für bessere Stabilität
- Vereinfachte statische Agenten ohne komplexe Animationen
- Vorberechnung von Terrain-Daten

### Rendering-Optimierungen
- Gezielte Aktualisierungen von 3D-Objekten ohne vollständige Szenenneuerstellung
- Reduzierung der Aktualisierungsfrequenz für bessere Stabilität

## Datenbanksynchronisation

Die Anwendung verwendet eine PostgreSQL-Datenbank mit dem Drizzle ORM für:

- Speicherung von Simulationszuständen
- Agentendaten und Erinnerungen
- Zeitachsenereignisse zur Verfolgung der Evolution

## Bewusstseinsmodell-Implementierung

Das Bewusstseinsmodell ist in `consciousness.ts` implementiert und nutzt die Formel:

```
B(S) = Φ(S) · σ(S) · δ(S)
```

Die Implementierung berücksichtigt:
- Kommunikationsfähigkeiten
- Gedächtniskapazität
- Sensorische Wahrnehmung
- Autonomie bei Entscheidungen
- Selbstmodellierung

## Herausforderungen und Lösungen

### Flimmern und visuelle Glitches
- **Problem**: Agenten tauschten visuell ihre Positionen, was zu Farbwechseln führte
- **Lösung**: Wechsel von Animation-Frames zu Intervall-Updates mit 1-Sekunden-Intervall

### Leistungsprobleme
- **Problem**: Übermäßige Neuberechnungen und Re-Renders
- **Lösung**: Vereinfachung der Welt mit minimalen, statischen Komponenten