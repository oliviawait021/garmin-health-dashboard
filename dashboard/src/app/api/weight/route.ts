import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { weigh_date, weight_lbs, notes } = body;

  if (!weigh_date || !weight_lbs) {
    return NextResponse.json({ error: 'weigh_date and weight_lbs are required' }, { status: 400 });
  }

  const lbs = parseFloat(weight_lbs);
  if (isNaN(lbs) || lbs <= 0) {
    return NextResponse.json({ error: 'weight_lbs must be a positive number' }, { status: 400 });
  }

  const { error } = await supabase.rpc('upsert_weight', {
    p_date:  weigh_date,
    p_lbs:   lbs,
    p_notes: notes || null,
  });

  if (error) {
    console.error('Weight upsert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
