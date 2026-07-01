import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { orgName, slug, userId } = await request.json()

  if (!orgName || !slug || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Create org
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: orgName, slug })
    .select('id')
    .single()

  if (orgError) {
    if (orgError.code === '23505') {
      // Slug conflict — append random suffix
      const newSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
      const { data: org2, error: e2 } = await supabase
        .from('organizations')
        .insert({ name: orgName, slug: newSlug })
        .select('id')
        .single()
      if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })
      await supabase.from('memberships').insert({ organization_id: org2!.id, user_id: userId, role: 'owner' })
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: orgError.message }, { status: 500 })
  }

  const { error: memberError } = await supabase
    .from('memberships')
    .insert({ organization_id: org.id, user_id: userId, role: 'owner' })

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
