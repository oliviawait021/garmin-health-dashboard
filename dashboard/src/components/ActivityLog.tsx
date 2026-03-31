import { ActivityRow } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';

interface Props { activities: ActivityRow[]; }

export default function ActivityLog({ activities }: Props) {
  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Recent Activities
      </h3>

      {activities.length === 0 ? (
        <p className="text-slate-600 text-sm">No activities yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-600 text-xs uppercase tracking-wider border-b border-[#2a2d3a]">
                <th className="text-left pb-2 pr-4">Date</th>
                <th className="text-left pb-2 pr-4">Type</th>
                <th className="text-left pb-2 pr-4">Name</th>
                <th className="text-right pb-2 pr-4">Duration</th>
                <th className="text-right pb-2 pr-4">Distance</th>
                <th className="text-right pb-2 pr-4">Pace</th>
                <th className="text-right pb-2">Calories</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3a]">
              {activities.map(act => (
                <tr key={act.activity_id} className="hover:bg-[#1f2335] transition-colors">
                  <td className="py-2 pr-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                    {format(parseISO(act.activity_date), 'MMM d')}
                  </td>
                  <td className="py-2 pr-4">
                    <span className="text-xs bg-[#2a2d3a] text-slate-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {act.activity_label}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-slate-400 truncate max-w-[140px]">
                    {act.activity_name || '—'}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-slate-300">
                    {act.duration_formatted}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-slate-300">
                    {act.distance_miles ? `${act.distance_miles} mi` : '—'}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-slate-300">
                    {act.pace_min_per_mile ? `${act.pace_min_per_mile}/mi` : '—'}
                  </td>
                  <td className="py-2 text-right font-mono text-slate-300">
                    {act.calories ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
