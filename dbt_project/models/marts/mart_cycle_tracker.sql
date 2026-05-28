-- Menstrual cycle history with computed cycle lengths, period lengths,
-- and a predicted next period date based on average cycle length.

with cycles as (
    select * from {{ ref('stg_manual__menstrual_cycle') }}
),

with_lengths as (
    select
        id,
        period_start,
        period_end,
        flow_level,
        symptoms,
        notes,

        -- Period length in days (null if end not recorded yet)
        case
            when period_end is not null
            then (period_end - period_start) + 1
        end                                                     as period_length_days,

        -- Cycle length = days from this period start to the next
        lead(period_start) over (order by period_start)         as next_period_start,
        (lead(period_start) over (order by period_start)
            - period_start)                                     as cycle_length_days,

        -- Lag for reference
        lag(period_start) over (order by period_start)          as prev_period_start

    from cycles
),

stats as (
    select
        round(avg(cycle_length_days), 1)    as avg_cycle_length,
        round(avg(period_length_days), 1)   as avg_period_length,
        min(cycle_length_days)              as min_cycle_length,
        max(cycle_length_days)              as max_cycle_length
    from with_lengths
    where cycle_length_days is not null
),

final as (
    select
        w.id,
        w.period_start,
        w.period_end,
        w.flow_level,
        w.symptoms,
        w.notes,
        w.period_length_days,
        w.cycle_length_days,
        w.next_period_start,
        w.prev_period_start,
        s.avg_cycle_length,
        s.avg_period_length,
        s.min_cycle_length,
        s.max_cycle_length,

        -- Predicted next period based on average cycle length
        case
            when w.next_period_start is null
            then w.period_start + round(s.avg_cycle_length)::int
        end                                                     as predicted_next_period

    from with_lengths w
    cross join stats s
)

select * from final
order by period_start desc
