-- Create simulations table
CREATE TABLE IF NOT EXISTS "simulations" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    "last_updated" TIMESTAMP DEFAULT NOW() NOT NULL,
    "time_elapsed" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "day_night_cycle" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "year_count" INTEGER DEFAULT 0 NOT NULL,
    "active" BOOLEAN DEFAULT true,
    "settings" JSONB
);

-- Create agents table
CREATE TABLE IF NOT EXISTS "agents" (
    "id" TEXT PRIMARY KEY,
    "simulation_id" INTEGER NOT NULL REFERENCES "simulations"("id"),
    "position_x" DOUBLE PRECISION NOT NULL,
    "position_y" DOUBLE PRECISION NOT NULL,
    "position_z" DOUBLE PRECISION NOT NULL,
    "rotation_x" DOUBLE PRECISION DEFAULT 0,
    "rotation_y" DOUBLE PRECISION DEFAULT 0,
    "rotation_z" DOUBLE PRECISION DEFAULT 0,
    "scale" DOUBLE PRECISION DEFAULT 1,
    "color" TEXT NOT NULL,
    "energy" DOUBLE PRECISION DEFAULT 100,
    "age" DOUBLE PRECISION DEFAULT 0,
    "lifespan" DOUBLE PRECISION DEFAULT 100,
    "generation" INTEGER DEFAULT 0,
    "consciousness_value" DOUBLE PRECISION DEFAULT 0,
    "last_reproduction_time" DOUBLE PRECISION DEFAULT 0,
    "last_action" TEXT DEFAULT 'idle',
    "reproduction_cooldown" DOUBLE PRECISION DEFAULT 0,
    "perception_radius" DOUBLE PRECISION DEFAULT 10,
    "movement_speed" DOUBLE PRECISION DEFAULT 1,
    "mutation_rate" DOUBLE PRECISION DEFAULT 0.05,
    "traits" JSONB,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW(),
    "active" BOOLEAN DEFAULT true
);

-- Create agent_memories table
CREATE TABLE IF NOT EXISTS "agent_memories" (
    "id" SERIAL PRIMARY KEY,
    "agent_id" TEXT NOT NULL REFERENCES "agents"("id"),
    "timestamp" DOUBLE PRECISION NOT NULL,
    "memory_type" TEXT NOT NULL,
    "data" JSONB,
    "intensity" DOUBLE PRECISION DEFAULT 1,
    "created_at" TIMESTAMP DEFAULT NOW()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS "resources" (
    "id" SERIAL PRIMARY KEY,
    "simulation_id" INTEGER NOT NULL REFERENCES "simulations"("id"),
    "resource_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position_x" DOUBLE PRECISION NOT NULL,
    "position_y" DOUBLE PRECISION NOT NULL,
    "position_z" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION DEFAULT 100,
    "regeneration_rate" DOUBLE PRECISION DEFAULT 0.1,
    "last_regeneration" DOUBLE PRECISION DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "active" BOOLEAN DEFAULT true
);

-- Create timeline_events table
CREATE TABLE IF NOT EXISTS "timeline_events" (
    "id" SERIAL PRIMARY KEY,
    "simulation_id" INTEGER NOT NULL REFERENCES "simulations"("id"),
    "timestamp" DOUBLE PRECISION NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_type" TEXT NOT NULL,
    "significance" DOUBLE PRECISION DEFAULT 1,
    "created_at" TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_agents_simulation" ON "agents"("simulation_id");
CREATE INDEX IF NOT EXISTS "idx_resources_simulation" ON "resources"("simulation_id");
CREATE INDEX IF NOT EXISTS "idx_agent_memories_agent" ON "agent_memories"("agent_id");
CREATE INDEX IF NOT EXISTS "idx_timeline_events_simulation" ON "timeline_events"("simulation_id");