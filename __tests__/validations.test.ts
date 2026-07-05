import { describe, it, expect } from 'vitest'
import {
  // Campaigns
  campaignStatusSchema,
  createCampaignSchema,
  updateCampaignSchema,
  scheduleCampaignSchema,
  // Contacts
  contactStatusSchema,
  createContactSchema,
  updateContactSchema,
  importContactRowSchema,
  importContactsSchema,
  // Lists
  createListSchema,
  updateListSchema,
  addContactsToListSchema,
  // Segments
  segmentConditionOpSchema,
  segmentConditionSchema,
  segmentMatchTypeSchema,
  createSegmentSchema,
  updateSegmentSchema,
  // Templates
  createTemplateSchema,
  updateTemplateSchema,
  // Workflows
  workflowTriggerTypeSchema,
  workflowStatusSchema,
  createWorkflowSchema,
  updateWorkflowSchema,
  workflowStepTypeSchema,
  addWorkflowStepSchema,
  updateWorkflowStepSchema,
  // Settings
  updateOrganizationSchema,
  sendingDomainSchema,
  apiKeySchema,
  memberRoleSchema,
  inviteTeamMemberSchema,
  updateMemberRoleSchema,
} from '@/lib/validations'

// ─── helpers ───

const validUuid = '550e8400-e29b-41d4-a716-446655440000'
const validEmail = 'test@example.com'

function expectSuccess(schema: { safeParse: (v: unknown) => { success: boolean } }, value: unknown) {
  const result = schema.safeParse(value)
  expect(result.success).toBe(true)
}

function expectFailure(schema: { safeParse: (v: unknown) => { success: boolean } }, value: unknown) {
  const result = schema.safeParse(value)
  expect(result.success).toBe(false)
}

// ═══════════════════════════════════════════
// CAMPAIGNS
// ═══════════════════════════════════════════

describe('campaignStatusSchema', () => {
  it('accepts valid statuses', () => {
    for (const s of ['draft', 'scheduled', 'sending', 'sent', 'cancelled']) {
      expectSuccess(campaignStatusSchema, s)
    }
  })

  it('rejects invalid status', () => {
    expectFailure(campaignStatusSchema, 'archived')
    expectFailure(campaignStatusSchema, '')
    expectFailure(campaignStatusSchema, 123)
  })
})

describe('createCampaignSchema', () => {
  it('accepts minimal input (all defaults)', () => {
    expectSuccess(createCampaignSchema, {})
  })

  it('accepts full valid input', () => {
    expectSuccess(createCampaignSchema, {
      name: 'Summer Sale',
      subject: 'Big discounts!',
      preview_text: 'Up to 50% off',
      from_name: 'Shop',
      from_email: 'shop@example.com',
      reply_to: 'support@example.com',
      html_body: '<h1>Hello</h1>',
      text_body: 'Hello',
      list_id: validUuid,
      segment_id: validUuid,
    })
  })

  it('applies default name when omitted', () => {
    const result = createCampaignSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('無題のキャンペーン')
    }
  })

  it('applies default subject when omitted', () => {
    const result = createCampaignSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.subject).toBe('(件名未設定)')
    }
  })

  it('rejects name exceeding 200 chars', () => {
    expectFailure(createCampaignSchema, { name: 'x'.repeat(201) })
  })

  it('accepts name at exactly 200 chars', () => {
    expectSuccess(createCampaignSchema, { name: 'x'.repeat(200) })
  })

  it('rejects subject exceeding 998 chars (RFC 2822)', () => {
    expectFailure(createCampaignSchema, { subject: 'x'.repeat(999) })
  })

  it('accepts subject at exactly 998 chars', () => {
    expectSuccess(createCampaignSchema, { subject: 'x'.repeat(998) })
  })

  it('allows from_email to be empty string', () => {
    expectSuccess(createCampaignSchema, { from_email: '' })
  })

  it('rejects invalid from_email', () => {
    expectFailure(createCampaignSchema, { from_email: 'not-an-email' })
  })

  it('allows list_id as null', () => {
    expectSuccess(createCampaignSchema, { list_id: null })
  })

  it('rejects invalid list_id uuid', () => {
    expectFailure(createCampaignSchema, { list_id: 'bad-uuid' })
  })

  it('allows reply_to as null', () => {
    expectSuccess(createCampaignSchema, { reply_to: null })
  })

  it('rejects invalid reply_to email', () => {
    expectFailure(createCampaignSchema, { reply_to: 'not-email' })
  })
})

describe('updateCampaignSchema', () => {
  it('accepts empty partial update', () => {
    expectSuccess(updateCampaignSchema, {})
  })

  it('accepts single field update', () => {
    expectSuccess(updateCampaignSchema, { name: 'Updated Name' })
  })

  it('rejects empty name', () => {
    expectFailure(updateCampaignSchema, { name: '' })
  })

  it('rejects name over 200 chars', () => {
    expectFailure(updateCampaignSchema, { name: 'a'.repeat(201) })
  })

  it('accepts valid from_email in update', () => {
    expectSuccess(updateCampaignSchema, { from_email: 'a@b.com' })
  })

  it('accepts empty from_email in update', () => {
    expectSuccess(updateCampaignSchema, { from_email: '' })
  })

  it('rejects invalid from_email in update', () => {
    expectFailure(updateCampaignSchema, { from_email: 'bad' })
  })
})

describe('scheduleCampaignSchema', () => {
  it('accepts valid schedule data', () => {
    expectSuccess(scheduleCampaignSchema, {
      id: validUuid,
      scheduled_at: '2026-12-25T10:00:00Z',
    })
  })

  it('rejects missing id', () => {
    expectFailure(scheduleCampaignSchema, { scheduled_at: '2026-12-25T10:00:00Z' })
  })

  it('rejects invalid uuid for id', () => {
    expectFailure(scheduleCampaignSchema, {
      id: 'not-a-uuid',
      scheduled_at: '2026-12-25T10:00:00Z',
    })
  })

  it('rejects non-ISO datetime', () => {
    expectFailure(scheduleCampaignSchema, {
      id: validUuid,
      scheduled_at: '2026/12/25 10:00',
    })
  })

  it('rejects empty scheduled_at', () => {
    expectFailure(scheduleCampaignSchema, {
      id: validUuid,
      scheduled_at: '',
    })
  })
})

// ═══════════════════════════════════════════
// CONTACTS
// ═══════════════════════════════════════════

describe('contactStatusSchema', () => {
  it('accepts all valid statuses', () => {
    for (const s of ['subscribed', 'unsubscribed', 'bounced', 'complained', 'pending']) {
      expectSuccess(contactStatusSchema, s)
    }
  })

  it('rejects invalid status', () => {
    expectFailure(contactStatusSchema, 'active')
  })
})

describe('createContactSchema', () => {
  it('accepts minimal valid input (email only)', () => {
    expectSuccess(createContactSchema, { email: validEmail })
  })

  it('accepts full valid input', () => {
    expectSuccess(createContactSchema, {
      email: validEmail,
      first_name: '太郎',
      last_name: '山田',
      phone: '+81-90-1234-5678',
    })
  })

  it('rejects missing email', () => {
    expectFailure(createContactSchema, {})
  })

  it('rejects invalid email', () => {
    expectFailure(createContactSchema, { email: 'not-an-email' })
  })

  it('rejects email without domain', () => {
    expectFailure(createContactSchema, { email: 'user@' })
  })

  it('rejects email without local part', () => {
    expectFailure(createContactSchema, { email: '@example.com' })
  })

  it('accepts null first_name', () => {
    expectSuccess(createContactSchema, { email: validEmail, first_name: null })
  })

  it('accepts phone with various formats', () => {
    const phones = ['09012345678', '+81-90-1234-5678', '(03) 1234 5678', '090.1234.5678']
    for (const phone of phones) {
      expectSuccess(createContactSchema, { email: validEmail, phone })
    }
  })

  it('rejects phone with letters', () => {
    expectFailure(createContactSchema, { email: validEmail, phone: 'abc-123' })
  })

  it('rejects phone with special chars', () => {
    expectFailure(createContactSchema, { email: validEmail, phone: '090#1234' })
  })
})

describe('updateContactSchema', () => {
  it('accepts empty partial update', () => {
    expectSuccess(updateContactSchema, {})
  })

  it('accepts status update', () => {
    expectSuccess(updateContactSchema, { status: 'unsubscribed' })
  })

  it('rejects invalid status in update', () => {
    expectFailure(updateContactSchema, { status: 'deleted' })
  })

  it('accepts custom_fields as record', () => {
    expectSuccess(updateContactSchema, { custom_fields: { company: 'ACME', age: 30 } })
  })

  it('rejects custom_fields as array', () => {
    expectFailure(updateContactSchema, { custom_fields: [1, 2, 3] })
  })
})

describe('importContactRowSchema', () => {
  it('accepts valid row', () => {
    expectSuccess(importContactRowSchema, {
      email: validEmail,
      first_name: 'Taro',
      last_name: 'Yamada',
    })
  })

  it('requires email', () => {
    expectFailure(importContactRowSchema, { first_name: 'Taro' })
  })
})

describe('importContactsSchema', () => {
  it('accepts valid array of rows', () => {
    expectSuccess(importContactsSchema, [
      { email: 'a@b.com' },
      { email: 'c@d.com', first_name: 'Bob' },
    ])
  })

  it('rejects empty array', () => {
    expectFailure(importContactsSchema, [])
  })

  it('rejects non-array', () => {
    expectFailure(importContactsSchema, { email: 'a@b.com' })
  })

  it('rejects if any row has invalid email', () => {
    expectFailure(importContactsSchema, [
      { email: 'valid@x.com' },
      { email: 'not-valid' },
    ])
  })

  it('rejects array exceeding 10,000 rows', () => {
    const rows = Array.from({ length: 10001 }, (_, i) => ({ email: `u${i}@x.com` }))
    expectFailure(importContactsSchema, rows)
  })

  it('accepts exactly 10,000 rows', () => {
    const rows = Array.from({ length: 10000 }, (_, i) => ({ email: `u${i}@x.com` }))
    expectSuccess(importContactsSchema, rows)
  })
})

// ═══════════════════════════════════════════
// LISTS
// ═══════════════════════════════════════════

describe('createListSchema', () => {
  it('accepts minimal valid input', () => {
    expectSuccess(createListSchema, { name: 'Newsletter' })
  })

  it('accepts full valid input', () => {
    expectSuccess(createListSchema, {
      name: 'Newsletter',
      description: 'Weekly updates',
      from_name: 'Company',
      from_email: 'news@example.com',
      double_optin: true,
    })
  })

  it('rejects empty name', () => {
    expectFailure(createListSchema, { name: '' })
  })

  it('rejects missing name', () => {
    expectFailure(createListSchema, {})
  })

  it('defaults double_optin to false', () => {
    const result = createListSchema.safeParse({ name: 'Test' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.double_optin).toBe(false)
    }
  })

  it('accepts from_email as empty string', () => {
    expectSuccess(createListSchema, { name: 'Test', from_email: '' })
  })

  it('rejects invalid from_email', () => {
    expectFailure(createListSchema, { name: 'Test', from_email: 'not-email' })
  })
})

describe('updateListSchema', () => {
  it('accepts empty partial', () => {
    expectSuccess(updateListSchema, {})
  })

  it('accepts name update', () => {
    expectSuccess(updateListSchema, { name: 'Renamed List' })
  })

  it('rejects empty name', () => {
    expectFailure(updateListSchema, { name: '' })
  })

  it('accepts double_optin toggle', () => {
    expectSuccess(updateListSchema, { double_optin: true })
  })

  it('accepts reply_to as valid email', () => {
    expectSuccess(updateListSchema, { reply_to: 'reply@test.com' })
  })

  it('accepts reply_to as null', () => {
    expectSuccess(updateListSchema, { reply_to: null })
  })

  it('accepts reply_to as empty string', () => {
    expectSuccess(updateListSchema, { reply_to: '' })
  })
})

describe('addContactsToListSchema', () => {
  it('accepts valid input', () => {
    expectSuccess(addContactsToListSchema, {
      list_id: validUuid,
      contact_ids: [validUuid],
    })
  })

  it('rejects empty contact_ids', () => {
    expectFailure(addContactsToListSchema, {
      list_id: validUuid,
      contact_ids: [],
    })
  })

  it('rejects invalid uuid in contact_ids', () => {
    expectFailure(addContactsToListSchema, {
      list_id: validUuid,
      contact_ids: ['not-uuid'],
    })
  })

  it('rejects missing list_id', () => {
    expectFailure(addContactsToListSchema, {
      contact_ids: [validUuid],
    })
  })

  it('accepts multiple contact_ids', () => {
    expectSuccess(addContactsToListSchema, {
      list_id: validUuid,
      contact_ids: [
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440003',
      ],
    })
  })
})

// ═══════════════════════════════════════════
// SEGMENTS
// ═══════════════════════════════════════════

describe('segmentConditionOpSchema', () => {
  it('accepts all valid operators', () => {
    const ops = [
      'equals', 'not_equals', 'contains', 'not_contains',
      'starts_with', 'ends_with', 'gt', 'lt', 'gte', 'lte',
      'is_set', 'is_not_set',
    ]
    for (const op of ops) {
      expectSuccess(segmentConditionOpSchema, op)
    }
  })

  it('rejects unknown operator', () => {
    expectFailure(segmentConditionOpSchema, 'between')
  })
})

describe('segmentConditionSchema', () => {
  it('accepts valid condition', () => {
    expectSuccess(segmentConditionSchema, {
      field: 'email',
      op: 'contains',
      value: '@gmail.com',
    })
  })

  it('rejects empty field', () => {
    expectFailure(segmentConditionSchema, { field: '', op: 'equals', value: 'x' })
  })

  it('rejects empty op', () => {
    expectFailure(segmentConditionSchema, { field: 'email', op: '', value: 'x' })
  })

  it('accepts empty value (e.g., for is_set)', () => {
    expectSuccess(segmentConditionSchema, { field: 'phone', op: 'is_set', value: '' })
  })
})

describe('segmentMatchTypeSchema', () => {
  it('accepts all and any', () => {
    expectSuccess(segmentMatchTypeSchema, 'all')
    expectSuccess(segmentMatchTypeSchema, 'any')
  })

  it('rejects none', () => {
    expectFailure(segmentMatchTypeSchema, 'none')
  })
})

describe('createSegmentSchema', () => {
  const validSegment = {
    name: 'Gmail users',
    conditions: [{ field: 'email', op: 'contains', value: '@gmail.com' }],
    match_type: 'all' as const,
  }

  it('accepts valid segment', () => {
    expectSuccess(createSegmentSchema, validSegment)
  })

  it('rejects missing name', () => {
    expectFailure(createSegmentSchema, { ...validSegment, name: undefined })
  })

  it('rejects empty name', () => {
    expectFailure(createSegmentSchema, { ...validSegment, name: '' })
  })

  it('rejects empty conditions array', () => {
    expectFailure(createSegmentSchema, { ...validSegment, conditions: [] })
  })

  it('accepts multiple conditions', () => {
    expectSuccess(createSegmentSchema, {
      ...validSegment,
      conditions: [
        { field: 'email', op: 'contains', value: '@gmail.com' },
        { field: 'first_name', op: 'is_set', value: '' },
      ],
    })
  })

  it('rejects invalid match_type', () => {
    expectFailure(createSegmentSchema, { ...validSegment, match_type: 'or' })
  })
})

describe('updateSegmentSchema', () => {
  it('accepts empty partial', () => {
    expectSuccess(updateSegmentSchema, {})
  })

  it('accepts name-only update', () => {
    expectSuccess(updateSegmentSchema, { name: 'VIP segment' })
  })

  it('rejects empty conditions array when provided', () => {
    expectFailure(updateSegmentSchema, { conditions: [] })
  })
})

// ═══════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════

describe('createTemplateSchema', () => {
  it('accepts minimal input (all defaults)', () => {
    expectSuccess(createTemplateSchema, {})
  })

  it('applies default name', () => {
    const result = createTemplateSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('無題のテンプレート')
    }
  })

  it('accepts full input', () => {
    expectSuccess(createTemplateSchema, {
      name: 'Welcome Email',
      subject: 'Welcome!',
      html_body: '<h1>Hi!</h1>',
      text_body: 'Hi!',
      preview_text: 'We are glad...',
    })
  })

  it('rejects name over 200 chars', () => {
    expectFailure(createTemplateSchema, { name: 'x'.repeat(201) })
  })

  it('accepts name at 200 chars', () => {
    expectSuccess(createTemplateSchema, { name: 'x'.repeat(200) })
  })
})

describe('updateTemplateSchema', () => {
  it('accepts empty partial', () => {
    expectSuccess(updateTemplateSchema, {})
  })

  it('rejects empty name', () => {
    expectFailure(updateTemplateSchema, { name: '' })
  })

  it('accepts valid name update', () => {
    expectSuccess(updateTemplateSchema, { name: 'Renamed' })
  })

  it('rejects name over 200 chars', () => {
    expectFailure(updateTemplateSchema, { name: 'a'.repeat(201) })
  })
})

// ═══════════════════════════════════════════
// WORKFLOWS
// ═══════════════════════════════════════════

describe('workflowTriggerTypeSchema', () => {
  it('accepts all valid trigger types', () => {
    for (const t of ['list_subscribe', 'tag_added', 'date_field', 'api_trigger', 'link_click']) {
      expectSuccess(workflowTriggerTypeSchema, t)
    }
  })

  it('rejects unknown trigger type', () => {
    expectFailure(workflowTriggerTypeSchema, 'form_submit')
  })
})

describe('workflowStatusSchema', () => {
  it('accepts draft, active, paused', () => {
    for (const s of ['draft', 'active', 'paused']) {
      expectSuccess(workflowStatusSchema, s)
    }
  })

  it('rejects archived', () => {
    expectFailure(workflowStatusSchema, 'archived')
  })
})

describe('createWorkflowSchema', () => {
  it('accepts valid workflow', () => {
    expectSuccess(createWorkflowSchema, {
      name: 'Welcome series',
      trigger_type: 'list_subscribe',
    })
  })

  it('accepts with trigger_config', () => {
    expectSuccess(createWorkflowSchema, {
      name: 'Welcome series',
      trigger_type: 'list_subscribe',
      trigger_config: { list_id: validUuid },
    })
  })

  it('rejects empty name', () => {
    expectFailure(createWorkflowSchema, { name: '', trigger_type: 'list_subscribe' })
  })

  it('rejects missing name', () => {
    expectFailure(createWorkflowSchema, { trigger_type: 'list_subscribe' })
  })

  it('rejects invalid trigger_type', () => {
    expectFailure(createWorkflowSchema, { name: 'Test', trigger_type: 'unknown' })
  })
})

describe('updateWorkflowSchema', () => {
  it('accepts empty partial', () => {
    expectSuccess(updateWorkflowSchema, {})
  })

  it('accepts name-only update', () => {
    expectSuccess(updateWorkflowSchema, { name: 'Renamed' })
  })

  it('rejects empty name', () => {
    expectFailure(updateWorkflowSchema, { name: '' })
  })

  it('accepts trigger_config update', () => {
    expectSuccess(updateWorkflowSchema, { trigger_config: { key: 'value' } })
  })
})

describe('workflowStepTypeSchema', () => {
  it('accepts all valid step types', () => {
    for (const t of ['send_email', 'delay', 'add_tag', 'remove_tag', 'webhook']) {
      expectSuccess(workflowStepTypeSchema, t)
    }
  })

  it('rejects unknown step type', () => {
    expectFailure(workflowStepTypeSchema, 'sms')
  })
})

describe('addWorkflowStepSchema', () => {
  it('accepts valid step', () => {
    expectSuccess(addWorkflowStepSchema, {
      workflow_id: validUuid,
      step_type: 'send_email',
      config: { template_id: validUuid },
    })
  })

  it('rejects missing workflow_id', () => {
    expectFailure(addWorkflowStepSchema, {
      step_type: 'send_email',
      config: {},
    })
  })

  it('rejects invalid step_type', () => {
    expectFailure(addWorkflowStepSchema, {
      workflow_id: validUuid,
      step_type: 'unknown',
      config: {},
    })
  })

  it('accepts empty config', () => {
    expectSuccess(addWorkflowStepSchema, {
      workflow_id: validUuid,
      step_type: 'delay',
      config: {},
    })
  })

  it('accepts config with nested objects', () => {
    expectSuccess(addWorkflowStepSchema, {
      workflow_id: validUuid,
      step_type: 'webhook',
      config: { url: 'https://api.example.com', headers: { 'X-Key': 'abc' } },
    })
  })
})

describe('updateWorkflowStepSchema', () => {
  it('accepts empty partial', () => {
    expectSuccess(updateWorkflowStepSchema, {})
  })

  it('accepts config update', () => {
    expectSuccess(updateWorkflowStepSchema, { config: { delay_hours: 24 } })
  })

  it('accepts step_type update', () => {
    expectSuccess(updateWorkflowStepSchema, { step_type: 'delay' })
  })
})

// ═══════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════

describe('updateOrganizationSchema', () => {
  it('accepts empty partial', () => {
    expectSuccess(updateOrganizationSchema, {})
  })

  it('accepts valid name', () => {
    expectSuccess(updateOrganizationSchema, { name: 'ACME Corp' })
  })

  it('rejects empty name', () => {
    expectFailure(updateOrganizationSchema, { name: '' })
  })

  it('rejects name over 100 chars', () => {
    expectFailure(updateOrganizationSchema, { name: 'x'.repeat(101) })
  })

  it('accepts name at 100 chars', () => {
    expectSuccess(updateOrganizationSchema, { name: 'x'.repeat(100) })
  })

  it('accepts valid slug', () => {
    expectSuccess(updateOrganizationSchema, { slug: 'acme-corp' })
  })

  it('rejects empty slug', () => {
    expectFailure(updateOrganizationSchema, { slug: '' })
  })

  it('rejects slug with uppercase', () => {
    expectFailure(updateOrganizationSchema, { slug: 'ACME' })
  })

  it('rejects slug with spaces', () => {
    expectFailure(updateOrganizationSchema, { slug: 'acme corp' })
  })

  it('rejects slug with underscores', () => {
    expectFailure(updateOrganizationSchema, { slug: 'acme_corp' })
  })

  it('rejects slug over 50 chars', () => {
    expectFailure(updateOrganizationSchema, { slug: 'a'.repeat(51) })
  })

  it('accepts slug at 50 chars', () => {
    expectSuccess(updateOrganizationSchema, { slug: 'a'.repeat(50) })
  })

  it('accepts slug with numbers and hyphens', () => {
    expectSuccess(updateOrganizationSchema, { slug: 'my-org-123' })
  })
})

describe('sendingDomainSchema', () => {
  it('accepts valid domain', () => {
    expectSuccess(sendingDomainSchema, { domain: 'example.com' })
  })

  it('accepts subdomain', () => {
    expectSuccess(sendingDomainSchema, { domain: 'mail.example.com' })
  })

  it('accepts deep subdomain', () => {
    expectSuccess(sendingDomainSchema, { domain: 'a.b.c.example.com' })
  })

  it('rejects empty domain', () => {
    expectFailure(sendingDomainSchema, { domain: '' })
  })

  it('rejects domain without TLD', () => {
    expectFailure(sendingDomainSchema, { domain: 'localhost' })
  })

  it('rejects domain with protocol', () => {
    expectFailure(sendingDomainSchema, { domain: 'https://example.com' })
  })

  it('rejects domain with path', () => {
    expectFailure(sendingDomainSchema, { domain: 'example.com/path' })
  })

  it('rejects domain with spaces', () => {
    expectFailure(sendingDomainSchema, { domain: 'example .com' })
  })
})

describe('apiKeySchema', () => {
  it('accepts valid name', () => {
    expectSuccess(apiKeySchema, { name: 'Production Key' })
  })

  it('rejects empty name', () => {
    expectFailure(apiKeySchema, { name: '' })
  })

  it('rejects missing name', () => {
    expectFailure(apiKeySchema, {})
  })
})

describe('memberRoleSchema', () => {
  it('accepts admin', () => {
    expectSuccess(memberRoleSchema, 'admin')
  })

  it('accepts sender', () => {
    expectSuccess(memberRoleSchema, 'sender')
  })

  it('rejects owner', () => {
    expectFailure(memberRoleSchema, 'owner')
  })

  it('rejects viewer', () => {
    expectFailure(memberRoleSchema, 'viewer')
  })
})

describe('inviteTeamMemberSchema', () => {
  it('accepts valid invite', () => {
    expectSuccess(inviteTeamMemberSchema, { email: validEmail, role: 'admin' })
  })

  it('rejects invalid email', () => {
    expectFailure(inviteTeamMemberSchema, { email: 'bad', role: 'admin' })
  })

  it('rejects missing email', () => {
    expectFailure(inviteTeamMemberSchema, { role: 'admin' })
  })

  it('rejects missing role', () => {
    expectFailure(inviteTeamMemberSchema, { email: validEmail })
  })

  it('rejects owner role', () => {
    expectFailure(inviteTeamMemberSchema, { email: validEmail, role: 'owner' })
  })
})

describe('updateMemberRoleSchema', () => {
  it('accepts valid update', () => {
    expectSuccess(updateMemberRoleSchema, {
      membership_id: validUuid,
      role: 'sender',
    })
  })

  it('rejects invalid membership_id', () => {
    expectFailure(updateMemberRoleSchema, {
      membership_id: 'bad',
      role: 'sender',
    })
  })

  it('rejects missing role', () => {
    expectFailure(updateMemberRoleSchema, {
      membership_id: validUuid,
    })
  })

  it('rejects invalid role', () => {
    expectFailure(updateMemberRoleSchema, {
      membership_id: validUuid,
      role: 'superadmin',
    })
  })
})

// ═══════════════════════════════════════════
// CROSS-CUTTING / EDGE CASES
// ═══════════════════════════════════════════

describe('cross-cutting edge cases', () => {
  it('createContactSchema rejects numeric email', () => {
    expectFailure(createContactSchema, { email: 12345 })
  })

  it('createCampaignSchema handles unicode in name', () => {
    expectSuccess(createCampaignSchema, { name: '夏のセールキャンペーン' })
  })

  it('createListSchema handles unicode in name', () => {
    expectSuccess(createListSchema, { name: 'お知らせリスト' })
  })

  it('createSegmentSchema handles unicode in condition value', () => {
    expectSuccess(createSegmentSchema, {
      name: '日本語セグメント',
      conditions: [{ field: 'last_name', op: 'equals', value: '山田' }],
      match_type: 'all',
    })
  })

  it('createWorkflowSchema rejects null as name', () => {
    expectFailure(createWorkflowSchema, { name: null, trigger_type: 'list_subscribe' })
  })

  it('importContactsSchema accepts single row array', () => {
    expectSuccess(importContactsSchema, [{ email: 'solo@test.com' }])
  })

  it('sendingDomainSchema accepts international TLD', () => {
    expectSuccess(sendingDomainSchema, { domain: 'example.co.jp' })
  })

  it('updateOrganizationSchema accepts both name and slug', () => {
    expectSuccess(updateOrganizationSchema, { name: 'New Org', slug: 'new-org' })
  })
})
