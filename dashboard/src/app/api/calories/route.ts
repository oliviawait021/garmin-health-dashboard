import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { entry_date, active_calories } = body;

  if (!entry_date || active_calories == null) {
    return NextResponse.json({ error: 'entry_date and active_calories are required' }, { status: 400 });
  }

  const cals = parseInt(active_calories, 10);
  if (isNaN(cals) || cals < 0) {
    return NextResponse.json({ error: 'active_calories must be a non-negative integer' }, { status: 400 });
  }

  const { error } = await supabase.rpc('upsert_active_calories', {
    p_date:     entry_date,
    p_calories: cals,
  });

  if (error) {
    console.error('Active calories upsert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
