-- ============================================================
-- email-marketing initial schema
-- ============================================================

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE organizations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  plan                TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'business', 'enterprise')),
  monthly_send_limit  INTEGER NOT NULL DEFAULT 50000,
  sends_this_month    INTEGER NOT NULL DEFAULT 0,
  billing_anchor_day  SMALLINT DEFAULT EXTRACT(DAY FROM NOW())::SMALLINT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES (auth.users を拡張)
-- ============================================================
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: self read/write"
  ON profiles FOR ALL
  USING (id = auth.uid());

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- MEMBERSHIPS
-- ============================================================
CREATE TABLE memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'sender' CHECK (role IN ('owner', 'admin', 'sender')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "memberships: self read"
  ON memberships FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "memberships: owner manage"
  ON memberships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.organization_id = memberships.organization_id
        AND m.user_id = auth.uid()
        AND m.role = 'owner'
    )
  );

-- ============================================================
-- CONTACTS
-- ============================================================
CREATE TABLE contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  first_name      TEXT,
  last_name       TEXT,
  phone           TEXT,
  custom_fields   JSONB NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'subscribed'
                    CHECK (status IN ('subscribed', 'unsubscribed', 'bounced', 'complained', 'pending')),
  source          TEXT,
  unsubscribed_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

CREATE INDEX idx_contacts_org_status ON contacts(organization_id, status);
CREATE INDEX idx_contacts_email ON contacts(email);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts: org member read"
  ON contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE organization_id = contacts.organization_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "contacts: admin/owner write"
  ON contacts FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE organization_id = contacts.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "contacts: admin/owner update"
  ON contacts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE organization_id = contacts.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "contacts: admin/owner delete"
  ON contacts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE organization_id = contacts.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE tags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  color           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags: org member read"
  ON tags FOR SELECT
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = tags.organization_id AND user_id = auth.uid()));

CREATE POLICY "tags: admin write insert"
  ON tags FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memberships WHERE organization_id = tags.organization_id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

CREATE POLICY "tags: admin write update"
  ON tags FOR UPDATE
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = tags.organization_id AND user_id = auth.uid() AND role IN ('owner','admin')));

CREATE POLICY "tags: admin write delete"
  ON tags FOR DELETE
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = tags.organization_id AND user_id = auth.uid() AND role IN ('owner','admin')));

CREATE TABLE contact_tags (
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(contact_id, tag_id)
);

ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_tags: org member read"
  ON contact_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contacts c
      JOIN memberships m ON m.organization_id = c.organization_id
      WHERE c.id = contact_tags.contact_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "contact_tags: admin write insert"
  ON contact_tags FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts c
      JOIN memberships m ON m.organization_id = c.organization_id
      WHERE c.id = contact_tags.contact_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')
    )
  );

CREATE POLICY "contact_tags: admin write delete"
  ON contact_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM contacts c
      JOIN memberships m ON m.organization_id = c.organization_id
      WHERE c.id = contact_tags.contact_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')
    )
  );

-- ============================================================
-- LISTS
-- ============================================================
CREATE TABLE lists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  double_optin    BOOLEAN NOT NULL DEFAULT FALSE,
  from_name       TEXT,
  from_email      TEXT,
  reply_to        TEXT,
  subscriber_count INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lists: org member read"
  ON lists FOR SELECT
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = lists.organization_id AND user_id = auth.uid()));

CREATE POLICY "lists: admin write insert"
  ON lists FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memberships WHERE organization_id = lists.organization_id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

CREATE POLICY "lists: admin write update"
  ON lists FOR UPDATE
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = lists.organization_id AND user_id = auth.uid() AND role IN ('owner','admin')));

CREATE POLICY "lists: admin write delete"
  ON lists FOR DELETE
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = lists.organization_id AND user_id = auth.uid() AND role IN ('owner','admin')));

CREATE TABLE list_contacts (
  list_id    UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'pending')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(list_id, contact_id)
);

ALTER TABLE list_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "list_contacts: org member read"
  ON list_contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN memberships m ON m.organization_id = l.organization_id
      WHERE l.id = list_contacts.list_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "list_contacts: admin write insert"
  ON list_contacts FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN memberships m ON m.organization_id = l.organization_id
      WHERE l.id = list_contacts.list_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')
    )
  );

CREATE POLICY "list_contacts: admin write delete"
  ON list_contacts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN memberships m ON m.organization_id = l.organization_id
      WHERE l.id = list_contacts.list_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')
    )
  );

-- ============================================================
-- SEGMENTS
-- ============================================================
CREATE TABLE segments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  conditions      JSONB NOT NULL DEFAULT '[]',
  match_type      TEXT NOT NULL DEFAULT 'all' CHECK (match_type IN ('all', 'any')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "segments: org member read"
  ON segments FOR SELECT
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = segments.organization_id AND user_id = auth.uid()));

CREATE POLICY "segments: admin write insert"
  ON segments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memberships WHERE organization_id = segments.organization_id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

CREATE POLICY "segments: admin write update"
  ON segments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = segments.organization_id AND user_id = auth.uid() AND role IN ('owner','admin')));

CREATE POLICY "segments: admin write delete"
  ON segments FOR DELETE
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = segments.organization_id AND user_id = auth.uid() AND role IN ('owner','admin')));

-- ============================================================
-- EMAIL TEMPLATES
-- ============================================================
CREATE TABLE email_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  subject         TEXT,
  html_body       TEXT NOT NULL,
  text_body       TEXT,
  preview_text    TEXT,
  thumbnail_url   TEXT,
  is_global       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates: org member read"
  ON email_templates FOR SELECT
  USING (
    is_global = TRUE
    OR EXISTS (SELECT 1 FROM memberships WHERE organization_id = email_templates.organization_id AND user_id = auth.uid())
  );

CREATE POLICY "templates: admin write insert"
  ON email_templates FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memberships WHERE organization_id = email_templates.organization_id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

CREATE POLICY "templates: admin write update"
  ON email_templates FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM memberships WHERE organization_id = email_templates.organization_id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

CREATE POLICY "templates: admin write delete"
  ON email_templates FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM memberships WHERE organization_id = email_templates.organization_id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

-- ============================================================
-- CAMPAIGNS
-- ============================================================
CREATE TABLE campaigns (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  subject           TEXT NOT NULL,
  preview_text      TEXT,
  from_name         TEXT NOT NULL,
  from_email        TEXT NOT NULL,
  reply_to          TEXT,
  html_body         TEXT NOT NULL DEFAULT '',
  text_body         TEXT,
  list_id           UUID REFERENCES lists(id),
  segment_id        UUID REFERENCES segments(id),
  status            TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at      TIMESTAMPTZ,
  sent_at           TIMESTAMPTZ,
  recipients_count  INTEGER NOT NULL DEFAULT 0,
  sent_count        INTEGER NOT NULL DEFAULT 0,
  open_count        INTEGER NOT NULL DEFAULT 0,
  click_count       INTEGER NOT NULL DEFAULT 0,
  bounce_count      INTEGER NOT NULL DEFAULT 0,
  unsubscribe_count INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_org_status ON campaigns(organization_id, status);
CREATE INDEX idx_campaigns_scheduled ON campaigns(scheduled_at) WHERE status = 'scheduled';

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns: org member read"
  ON campaigns FOR SELECT
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = campaigns.organization_id AND user_id = auth.uid()));

CREATE POLICY "campaigns: sender write insert"
  ON campaigns FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memberships WHERE organization_id = campaigns.organization_id AND user_id = auth.uid())
  );

CREATE POLICY "campaigns: sender write update"
  ON campaigns FOR UPDATE
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = campaigns.organization_id AND user_id = auth.uid()));

CREATE POLICY "campaigns: admin delete"
  ON campaigns FOR DELETE
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = campaigns.organization_id AND user_id = auth.uid() AND role IN ('owner','admin')));

-- ============================================================
-- EMAIL EVENTS
-- ============================================================
CREATE TABLE email_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id   UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  event_type   TEXT NOT NULL
                 CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')),
  metadata     JSONB NOT NULL DEFAULT '{}',
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_events_campaign ON email_events(campaign_id, event_type);
CREATE INDEX idx_email_events_contact  ON email_events(contact_id, event_type);
CREATE INDEX idx_email_events_occurred ON email_events(occurred_at DESC);

ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_events: org member read"
  ON email_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN memberships m ON m.organization_id = c.organization_id
      WHERE c.id = email_events.campaign_id
        AND m.user_id = auth.uid()
    )
  );

-- ============================================================
-- AUTOMATION WORKFLOWS
-- ============================================================
CREATE TABLE workflows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  trigger_type    TEXT NOT NULL
                    CHECK (trigger_type IN ('list_subscribe', 'tag_added', 'date_field', 'api_trigger', 'link_click')),
  trigger_config  JSONB NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  enrolled_count  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflows: org member read"
  ON workflows FOR SELECT
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = workflows.organization_id AND user_id = auth.uid()));

CREATE POLICY "workflows: admin write insert"
  ON workflows FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memberships WHERE organization_id = workflows.organization_id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

CREATE POLICY "workflows: admin write update"
  ON workflows FOR UPDATE
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = workflows.organization_id AND user_id = auth.uid() AND role IN ('owner','admin')));

CREATE POLICY "workflows: admin write delete"
  ON workflows FOR DELETE
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = workflows.organization_id AND user_id = auth.uid() AND role IN ('owner','admin')));

CREATE TABLE workflow_steps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  step_order  SMALLINT NOT NULL,
  step_type   TEXT NOT NULL CHECK (step_type IN ('send_email', 'delay', 'add_tag', 'remove_tag', 'webhook')),
  config      JSONB NOT NULL DEFAULT '{}',
  UNIQUE(workflow_id, step_order)
);

ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflow_steps: org member read"
  ON workflow_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workflows w
      JOIN memberships m ON m.organization_id = w.organization_id
      WHERE w.id = workflow_steps.workflow_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "workflow_steps: admin write insert"
  ON workflow_steps FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workflows w
      JOIN memberships m ON m.organization_id = w.organization_id
      WHERE w.id = workflow_steps.workflow_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')
    )
  );

CREATE POLICY "workflow_steps: admin write update"
  ON workflow_steps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workflows w
      JOIN memberships m ON m.organization_id = w.organization_id
      WHERE w.id = workflow_steps.workflow_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')
    )
  );

CREATE POLICY "workflow_steps: admin write delete"
  ON workflow_steps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workflows w
      JOIN memberships m ON m.organization_id = w.organization_id
      WHERE w.id = workflow_steps.workflow_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')
    )
  );

CREATE TABLE workflow_enrollments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id   UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  contact_id    UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  current_step  SMALLINT NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'errored')),
  next_run_at   TIMESTAMPTZ,
  enrolled_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  UNIQUE(workflow_id, contact_id)
);

CREATE INDEX idx_enrollments_next_run ON workflow_enrollments(next_run_at) WHERE status = 'active';

ALTER TABLE workflow_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments: org member read"
  ON workflow_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workflows w
      JOIN memberships m ON m.organization_id = w.organization_id
      WHERE w.id = workflow_enrollments.workflow_id AND m.user_id = auth.uid()
    )
  );

-- ============================================================
-- SENDING DOMAINS
-- ============================================================
CREATE TABLE sending_domains (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  domain          TEXT NOT NULL,
  dkim_status     TEXT NOT NULL DEFAULT 'pending' CHECK (dkim_status IN ('pending', 'verified', 'failed')),
  spf_status      TEXT NOT NULL DEFAULT 'pending' CHECK (spf_status IN ('pending', 'verified', 'failed')),
  dmarc_status    TEXT NOT NULL DEFAULT 'pending' CHECK (dmarc_status IN ('pending', 'verified', 'not_set')),
  dkim_selector   TEXT,
  dkim_public_key TEXT,
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, domain)
);

ALTER TABLE sending_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sending_domains: org member read"
  ON sending_domains FOR SELECT
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = sending_domains.organization_id AND user_id = auth.uid()));

CREATE POLICY "sending_domains: owner/admin write insert"
  ON sending_domains FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memberships WHERE organization_id = sending_domains.organization_id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

CREATE POLICY "sending_domains: owner/admin write delete"
  ON sending_domains FOR DELETE
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = sending_domains.organization_id AND user_id = auth.uid() AND role IN ('owner','admin')));

-- ============================================================
-- API KEYS
-- ============================================================
CREATE TABLE api_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  key_hash        TEXT NOT NULL UNIQUE,
  last_used_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys: owner/admin read"
  ON api_keys FOR SELECT
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = api_keys.organization_id AND user_id = auth.uid() AND role IN ('owner','admin')));

CREATE POLICY "api_keys: owner/admin insert"
  ON api_keys FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memberships WHERE organization_id = api_keys.organization_id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

CREATE POLICY "api_keys: owner/admin delete"
  ON api_keys FOR DELETE
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = api_keys.organization_id AND user_id = auth.uid() AND role IN ('owner','admin')));

-- ============================================================
-- SUBSCRIPTION FORMS
-- ============================================================
CREATE TABLE subscription_forms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  list_id         UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  fields          JSONB NOT NULL DEFAULT '["email","first_name"]',
  success_message TEXT NOT NULL DEFAULT 'ご登録ありがとうございます！',
  redirect_url    TEXT,
  embed_code      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE subscription_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forms: org member read"
  ON subscription_forms FOR SELECT
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = subscription_forms.organization_id AND user_id = auth.uid()));

CREATE POLICY "forms: admin write insert"
  ON subscription_forms FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memberships WHERE organization_id = subscription_forms.organization_id AND user_id = auth.uid() AND role IN ('owner','admin'))
  );

CREATE POLICY "forms: admin write update"
  ON subscription_forms FOR UPDATE
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = subscription_forms.organization_id AND user_id = auth.uid() AND role IN ('owner','admin')));

CREATE POLICY "forms: admin write delete"
  ON subscription_forms FOR DELETE
  USING (EXISTS (SELECT 1 FROM memberships WHERE organization_id = subscription_forms.organization_id AND user_id = auth.uid() AND role IN ('owner','admin')));

-- ============================================================
-- HELPER: updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_lists_updated_at BEFORE UPDATE ON lists FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_segments_updated_at BEFORE UPDATE ON segments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_forms_updated_at BEFORE UPDATE ON subscription_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
