-- PostgreSQL schema for WhatsApp Automation Platform
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE whatsapp_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_name VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'disconnected',
    qr_code TEXT,
    qr_code_generated_at TIMESTAMPTZ,
    last_active TIMESTAMPTZ,
    battery_level INT CHECK (battery_level BETWEEN 0 AND 100),
    connection_type VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE warmer_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('standard', 'advanced', 'group')),
    session_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    messages JSONB NOT NULL,
    scheduling JSONB,
    targets JSONB,
    settings JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bulk_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    session_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    message_template TEXT NOT NULL,
    media_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('scheduled', 'running', 'paused', 'completed')),
    scheduled_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE verification_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL,
    is_valid BOOLEAN NOT NULL,
    is_whatsapp_user BOOLEAN NOT NULL,
    last_seen TIMESTAMPTZ,
    campaign_id UUID,
    session_id UUID REFERENCES whatsapp_instances(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_recipients (
    campaign_id UUID REFERENCES bulk_campaigns(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    variables JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    PRIMARY KEY (campaign_id, phone_number)
);

CREATE INDEX idx_instance_status ON whatsapp_instances(status);
CREATE INDEX idx_warmer_session ON warmer_campaigns(session_id);
CREATE INDEX idx_bulk_status ON bulk_campaigns(status);
