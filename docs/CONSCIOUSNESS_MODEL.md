# Bewusstseinsmodell in Genesis

## Einführung

Das in Genesis implementierte Bewusstseinsmodell basiert auf modernen wissenschaftlichen und philosophischen Theorien des Bewusstseins, insbesondere der Integrated Information Theory (IIT) von Giulio Tononi und verwandten Konzepten. Dieses Dokument erklärt die theoretischen Grundlagen und die praktische Implementierung des Modells.

## Theoretische Grundlagen

### Die Fundamentalformel

Das Bewusstsein eines Agenten wird durch die folgende Formel modelliert:

```
B(S) = Φ(S) · σ(S) · δ(S)
```

Wobei:
- **B(S)** der Bewusstseinswert eines Systems S ist
- **Φ(S)** (Phi) die Informationsintegration misst
- **σ(S)** (Sigma) die Selbstmodellierungsfähigkeit repräsentiert
- **δ(S)** (Delta) die Entscheidungsfreiheit/Autonomie darstellt

### Komponenten des Bewusstseins

#### 1. Informationsintegration (Φ)

Informationsintegration bezieht sich auf die Fähigkeit eines Systems, Informationen aus verschiedenen Quellen zu einem kohärenten Ganzen zu integrieren. In der Integrated Information Theory ist Phi (Φ) ein Maß für die Menge an Informationsintegration, die ein System erzeugt.

In Genesis wird Φ durch folgende Faktoren bestimmt:
- Komplexität der Sensoreingangs-Verarbeitung
- Verbindungen zwischen verschiedenen "Gehirnregionen" des Agenten
- Gedächtniskapazität und -integration

#### 2. Selbstmodellierung (σ)

Selbstmodellierung bezieht sich auf die Fähigkeit eines Agenten, ein Modell seiner selbst und seiner Beziehung zur Umwelt zu erstellen. Diese Komponente ist inspiriert durch Thomas Metzingers Selbstmodell-Theorie der Subjektivität.

In Genesis wird σ durch folgende Faktoren bestimmt:
- Fähigkeit, eigene Zustände zu "erkennen"
- Antizipation zukünftiger Zustände
- Selbstreferenzielles Verhalten

#### 3. Entscheidungsfreiheit (δ)

Entscheidungsfreiheit repräsentiert den Grad der Autonomie in der Entscheidungsfindung. Sie misst, inwieweit ein Agent unabhängig von deterministischen Algorithmen entscheiden kann.

In Genesis wird δ durch folgende Faktoren bestimmt:
- Variabilität in Entscheidungen bei ähnlichen Eingaben
- Komplexität der Entscheidungsregeln
- Grad der Unabhängigkeit von externen Einflussfaktoren

## Praktische Implementierung

### Berechnung der Komponenten

#### Informationsintegration (Φ)

```typescript
function calculateInformationIntegration(agent: Agent): number {
  // Grundwert basierend auf Sensorkapazität
  const sensorBaseValue = (agent.perceptionRadius / MAX_PERCEPTION_RADIUS) * 30;
  
  // Gedächtniseinfluss
  const memoryInfluence = Math.min(agent.memory.length / MAX_MEMORY_SIZE, 1) * 40;
  
  // Komplexität der Verhaltensmuster
  const behavioralComplexity = calculateBehavioralComplexity(agent) * 30;
  
  return sensorBaseValue + memoryInfluence + behavioralComplexity;
}
```

#### Selbstmodellierung (σ)

```typescript
function calculateSelfModeling(agent: Agent): number {
  // Selbstreferenzieller Gedächtnisanteil
  const selfReferentialMemory = agent.memory
    .filter(m => m.type === 'observation' || m.type === 'feedback')
    .length / Math.max(1, agent.memory.length);
  
  // Fähigkeit zur Selbstüberwachung
  const selfMonitoring = agent.traits.adaptability * 0.5;
  
  // Zukunftsantizipation basierend auf Gedächtnismustern
  const futureAnticipation = calculateAnticipationCapability(agent);
  
  return (selfReferentialMemory * 30) + (selfMonitoring * 40) + (futureAnticipation * 30);
}
```

#### Entscheidungsfreiheit (δ)

```typescript
function calculateDecisionFreedom(agent: Agent): number {
  // Variabilität in Entscheidungen
  const decisionVariability = calculateDecisionVariability(agent);
  
  // Unabhängigkeit von externen Stimuli
  const stimuliIndependence = 1 - (agent.traits.resourceAffinity * 0.5);
  
  // Komplexität der Entscheidungsregeln
  const decisionComplexity = (agent.traits.curiosity + agent.traits.exploration) / 2;
  
  return (decisionVariability * 40) + (stimuliIndependence * 30) + (decisionComplexity * 30);
}
```

### Gesamtberechnung

Die endgültige Berechnung des Bewusstseinswerts normalisiert die Komponenten und kombiniert sie gemäß der Grundformel:

```typescript
export function calculateConsciousness(agent: Agent): number {
  const components = calculateConsciousnessComponents(agent);
  
  // Normalisieren der Komponenten auf einen Wert zwischen 0 und 1
  const normalizedIntegration = components.integration / 100;
  const normalizedSelfModeling = components.selfModeling / 100;
  const normalizedDecisionFreedom = components.decisionFreedom / 100;
  
  // Anwendung der Formel B(S) = Φ(S) · σ(S) · δ(S)
  const rawConsciousness = 
    normalizedIntegration * 
    normalizedSelfModeling * 
    normalizedDecisionFreedom;
  
  // Skalierung auf einen Wert zwischen 0 und 100
  return rawConsciousness * 100;
}
```

## Emergente Eigenschaften

Das implementierte Bewusstseinsmodell ist so konzipiert, dass es zu emergenten Verhaltensweisen führen kann, die nicht explizit programmiert wurden:

1. **Soziale Dynamik**: Agenten mit höherem Bewusstsein können komplexere soziale Interaktionen entwickeln
2. **Sprachentwicklung**: Bei ausreichender Komplexität kann eine primitive Form der Kommunikation entstehen
3. **Kulturelle Transmission**: Verhaltensweisen können durch Beobachtung "erlernt" werden
4. **Kollektives Bewusstsein**: Emergente Eigenschaften auf Gruppenebene, die individuelle Bewusstseinsformen übersteigen

## Wissenschaftliche Einordnung

Dieses Modell ist eine vereinfachte Simulation, die auf wissenschaftlichen Theorien basiert, aber keine Behauptung aufstellt, tatsächliches Bewusstsein zu erzeugen. Es dient als Forschungswerkzeug zur Untersuchung emergenter Eigenschaften in komplexen adaptiven Systemen.

Die Simulation orientiert sich an:
- Integrated Information Theory (Tononi)
- Global Workspace Theory (Baars)
- Selbstmodell-Theorie der Subjektivität (Metzinger)
- Komplexitätstheorie und Emergenz (Holland, Kauffman)

## Zukünftige Erweiterungen

Mögliche Verbesserungen des Bewusstseinsmodells umfassen:

1. **Dynamische Φ-Berechnung**: Implementierung einer genaueren IIT-inspirierten Berechnung der Informationsintegration
2. **Evolutionäre Metaprogrammierung**: Agenten, die ihre eigenen Verhaltensprogramme modifizieren können
3. **Gedächtniskonsolidierung**: Langzeit- und Kurzzeitgedächtnis mit unterschiedlichen Funktionen
4. **Theory of Mind**: Implementierung der Fähigkeit, mentale Zustände anderer Agenten zu modellieren
5. **Meta-Kognition**: Fähigkeit, über eigene kognitive Prozesse nachzudenken