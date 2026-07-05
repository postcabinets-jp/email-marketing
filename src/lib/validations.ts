import { z } from 'zod'

// ─── Shared primitives ───

const uuid = z.string().uuid('有効なUUIDを入力してください')

const email = z.string().email('有効なメールアドレスを入力してください')

const nonEmptyString = (label: string) =>
  z.string().min(1, `${label}は必須です`)

const optionalString = z.string().optional()

const optionalNullableString = z.string().nullish()

const domain = z
  .string()
  .min(1, 'ドメインは必須です')
  .regex(
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    '有効なドメイン名を入力してください'
  )

const isoDatetime = z
  .string()
  .datetime({ message: '有効なISO 8601日時を入力してください' })

// ─── Campaigns ───

export const campaignStatusSchema = z.enum([
  'draft',
  'scheduled',
  'sending',
  'sent',
  'cancelled',
])

export const createCampaignSchema = z.object({
  name: z.string().max(200, 'キャンペーン名は200文字以内にしてください').default('無題のキャンペーン'),
  subject: z.string().max(998, '件名は998文字以内にしてください').default('(件名未設定)'),
  preview_text: optionalNullableString,
  from_name: z.string().default(''),
  from_email: z.union([email, z.literal('')]).default(''),
  reply_to: z.union([email, z.literal(''), z.null()]).optional(),
  html_body: z.string().default(''),
  text_body: optionalNullableString,
  list_id: z.union([uuid, z.literal(''), z.null()]).optional(),
  segment_id: z.union([uuid, z.literal(''), z.null()]).optional(),
})

export const updateCampaignSchema = z
  .object({
    name: z.string().min(1, 'キャンペーン名は必須です').max(200, 'キャンペーン名は200文字以内にしてください'),
    subject: z.string().max(998, '件名は998文字以内にしてください'),
    preview_text: optionalNullableString,
    from_name: z.string(),
    from_email: z.union([email, z.literal('')]),
    reply_to: z.union([email, z.literal(''), z.null()]),
    html_body: z.string(),
    text_body: optionalNullableString,
    list_id: z.union([uuid, z.null()]),
    segment_id: z.union([uuid, z.null()]),
  })
  .partial()

export const scheduleCampaignSchema = z.object({
  id: uuid,
  scheduled_at: isoDatetime,
})

// ─── Contacts ───

export const contactStatusSchema = z.enum([
  'subscribed',
  'unsubscribed',
  'bounced',
  'complained',
  'pending',
])

export const createContactSchema = z.object({
  email: email,
  first_name: optionalNullableString,
  last_name: optionalNullableString,
  phone: z
    .string()
    .regex(/^[\d\s+\-().]*$/, '有効な電話番号を入力してください')
    .nullish(),
})

export const updateContactSchema = z
  .object({
    email: email,
    first_name: optionalNullableString,
    last_name: optionalNullableString,
    phone: z
      .string()
      .regex(/^[\d\s+\-().]*$/, '有効な電話番号を入力してください')
      .nullish(),
    status: contactStatusSchema,
    custom_fields: z.record(z.unknown()),
  })
  .partial()

export const importContactRowSchema = z.object({
  email: email,
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
})

export const importContactsSchema = z
  .array(importContactRowSchema)
  .min(1, 'インポートするデータがありません')
  .max(10000, '一度にインポートできるのは10,000件までです')

// ─── Lists ───

export const createListSchema = z.object({
  name: nonEmptyString('リスト名'),
  description: optionalNullableString,
  from_name: optionalNullableString,
  from_email: z.union([email, z.literal(''), z.null()]).optional(),
  double_optin: z.boolean().default(false),
})

export const updateListSchema = z
  .object({
    name: nonEmptyString('リスト名'),
    description: optionalNullableString,
    from_name: optionalNullableString,
    from_email: z.union([email, z.literal(''), z.null()]),
    reply_to: z.union([email, z.literal(''), z.null()]),
    double_optin: z.boolean(),
  })
  .partial()

export const addContactsToListSchema = z.object({
  list_id: uuid,
  contact_ids: z.array(uuid).min(1, '追加するコンタクトを選択してください'),
})

// ─── Segments ───

export const segmentConditionOpSchema = z.enum([
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'starts_with',
  'ends_with',
  'gt',
  'lt',
  'gte',
  'lte',
  'is_set',
  'is_not_set',
])

export const segmentConditionSchema = z.object({
  field: nonEmptyString('フィールド名'),
  op: z.string().min(1, 'オペレーターは必須です'),
  value: z.string(),
})

export const segmentMatchTypeSchema = z.enum(['all', 'any'])

export const createSegmentSchema = z.object({
  name: nonEmptyString('セグメント名'),
  conditions: z
    .array(segmentConditionSchema)
    .min(1, '条件を1つ以上設定してください'),
  match_type: segmentMatchTypeSchema,
})

export const updateSegmentSchema = z
  .object({
    name: nonEmptyString('セグメント名'),
    conditions: z
      .array(segmentConditionSchema)
      .min(1, '条件を1つ以上設定してください'),
    match_type: segmentMatchTypeSchema,
  })
  .partial()

// ─── Templates ───

export const createTemplateSchema = z.object({
  name: z.string().max(200, 'テンプレート名は200文字以内にしてください').default('無題のテンプレート'),
  subject: optionalNullableString,
  html_body: z.string().default(''),
  text_body: optionalNullableString,
  preview_text: optionalNullableString,
})

export const updateTemplateSchema = z
  .object({
    name: z.string().min(1, 'テンプレート名は必須です').max(200, 'テンプレート名は200文字以内にしてください'),
    subject: optionalNullableString,
    html_body: z.string(),
    text_body: optionalNullableString,
    preview_text: optionalNullableString,
  })
  .partial()

// ─── Workflows ───

export const workflowTriggerTypeSchema = z.enum([
  'list_subscribe',
  'tag_added',
  'date_field',
  'api_trigger',
  'link_click',
])

export const workflowStatusSchema = z.enum(['draft', 'active', 'paused'])

export const createWorkflowSchema = z.object({
  name: nonEmptyString('ワークフロー名'),
  trigger_type: workflowTriggerTypeSchema,
  trigger_config: z.record(z.unknown()).optional(),
})

export const updateWorkflowSchema = z
  .object({
    name: nonEmptyString('ワークフロー名'),
    trigger_type: z.string(),
    trigger_config: z.record(z.unknown()),
  })
  .partial()

export const workflowStepTypeSchema = z.enum([
  'send_email',
  'delay',
  'add_tag',
  'remove_tag',
  'webhook',
])

export const addWorkflowStepSchema = z.object({
  workflow_id: uuid,
  step_type: workflowStepTypeSchema,
  config: z.record(z.unknown()),
})

export const updateWorkflowStepSchema = z
  .object({
    step_type: z.string(),
    config: z.record(z.unknown()),
  })
  .partial()

// ─── Settings / Organization ───

export const updateOrganizationSchema = z
  .object({
    name: z.string().min(1, '組織名は必須です').max(100, '組織名は100文字以内にしてください'),
    slug: z
      .string()
      .min(1, 'スラグは必須です')
      .max(50, 'スラグは50文字以内にしてください')
      .regex(/^[a-z0-9-]+$/, 'スラグは半角英数字とハイフンのみ使用できます'),
  })
  .partial()

export const sendingDomainSchema = z.object({
  domain: domain,
})

export const apiKeySchema = z.object({
  name: nonEmptyString('キー名'),
})

export const memberRoleSchema = z.enum(['admin', 'sender'])

export const inviteTeamMemberSchema = z.object({
  email: email,
  role: memberRoleSchema,
})

export const updateMemberRoleSchema = z.object({
  membership_id: uuid,
  role: memberRoleSchema,
})

// ─── Re-export types ───

export type CreateCampaign = z.infer<typeof createCampaignSchema>
export type UpdateCampaign = z.infer<typeof updateCampaignSchema>
export type ScheduleCampaign = z.infer<typeof scheduleCampaignSchema>
export type CampaignStatus = z.infer<typeof campaignStatusSchema>

export type CreateContact = z.infer<typeof createContactSchema>
export type UpdateContact = z.infer<typeof updateContactSchema>
export type ImportContactRow = z.infer<typeof importContactRowSchema>
export type ContactStatus = z.infer<typeof contactStatusSchema>

export type CreateList = z.infer<typeof createListSchema>
export type UpdateList = z.infer<typeof updateListSchema>
export type AddContactsToList = z.infer<typeof addContactsToListSchema>

export type SegmentCondition = z.infer<typeof segmentConditionSchema>
export type SegmentMatchType = z.infer<typeof segmentMatchTypeSchema>
export type CreateSegment = z.infer<typeof createSegmentSchema>
export type UpdateSegment = z.infer<typeof updateSegmentSchema>

export type CreateTemplate = z.infer<typeof createTemplateSchema>
export type UpdateTemplate = z.infer<typeof updateTemplateSchema>

export type WorkflowTriggerType = z.infer<typeof workflowTriggerTypeSchema>
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>
export type CreateWorkflow = z.infer<typeof createWorkflowSchema>
export type UpdateWorkflow = z.infer<typeof updateWorkflowSchema>
export type WorkflowStepType = z.infer<typeof workflowStepTypeSchema>
export type AddWorkflowStep = z.infer<typeof addWorkflowStepSchema>

export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>
export type SendingDomain = z.infer<typeof sendingDomainSchema>
export type ApiKey = z.infer<typeof apiKeySchema>
export type InviteTeamMember = z.infer<typeof inviteTeamMemberSchema>
export type UpdateMemberRole = z.infer<typeof updateMemberRoleSchema>
