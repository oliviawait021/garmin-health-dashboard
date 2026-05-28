import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { period_start, period_end, flow_level, symptoms, notes } = body;

  if (!period_start) {
    return NextResponse.json({ error: 'period_start is required' }, { status: 400 });
  }

  // Write to raw_manual via direct DB, and also to public.cycle_entries for REST access
  const { error } = await supabase
    .from('cycle_entries')
    .upsert({ period_start, period_end: period_end || null, flow_level: flow_level || null, symptoms: symptoms || null, notes: notes || null }, { onConflict: 'period_start' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const { error } = await supabase.from('cycle_entries').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
