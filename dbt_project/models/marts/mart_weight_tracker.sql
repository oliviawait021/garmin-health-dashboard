-- Weight entries with moving averages and week-over-week change.

with weight as (
    select * from {{ ref('stg_manual__weight') }}
),

with_averages as (
    select
        weigh_date,
        weight_lbs,
        notes,

        -- Moving averages
        round(
            avg(weight_lbs) over (
                order by weigh_date
                rows between 6 preceding and current row
            ), 2
        )                                               as weight_7d_avg,

        round(
            avg(weight_lbs) over (
                order by weigh_date
                rows between 29 preceding and current row
            ), 2
        )                                               as weight_30d_avg,

        -- Week-over-week change (compare to ~7 rows back — best effort)
        round(
            weight_lbs - lag(weight_lbs, 7) over (order by weigh_date),
            1
        )                                               as change_vs_7d_ago,

        -- Running min/max for context
        min(weight_lbs) over (order by weigh_date rows between unbounded preceding and current row)
                                                        as all_time_low,
        max(weight_lbs) over (order by weigh_date rows between unbounded preceding and current row)
                                                        as all_time_high

    from weight
)

select * from with_averages
order by weigh_date desc
