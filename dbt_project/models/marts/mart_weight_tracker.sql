-- Weight entries with moving averages, week-over-week change, and body composition.
--
-- Body comp and weight come from the same Renpho scale but are stored separately.
-- On days where the husband stepped on first (weight > 170, filtered out), the
-- body comp row has no matching weight row. We union both date sets so every
-- body comp reading appears regardless of whether a valid weight entry exists.

with weight as (
    select * from {{ ref('stg_manual__weight') }}
),

body_comp as (
    select * from {{ ref('stg_manual__body_composition') }}
),

-- All unique dates from either source
all_dates as (
    select weigh_date as entry_date from weight
    union
    select entry_date             from body_comp
),

combined as (
    select
        d.entry_date                                    as weigh_date,
        w.weight_lbs,
        w.notes,
        bc.body_fat_pct,
        bc.bmi,
        bc.lean_body_mass_lbs,
        bc.source_name                                  as composition_source
    from all_dates d
    left join weight    w  on w.weigh_date  = d.entry_date
    left join body_comp bc on bc.entry_date = d.entry_date
),

with_averages as (
    select
        weigh_date,
        weight_lbs,
        notes,
        body_fat_pct,
        bmi,
        lean_body_mass_lbs,
        composition_source,

        -- Moving averages (only over rows that have a weight value)
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

        round(
            weight_lbs - lag(weight_lbs, 7) over (order by weigh_date),
            1
        )                                               as change_vs_7d_ago,

        min(weight_lbs) over (order by weigh_date rows between unbounded preceding and current row)
                                                        as all_time_low,
        max(weight_lbs) over (order by weigh_date rows between unbounded preceding and current row)
                                                        as all_time_high

    from combined
)

select * from with_averages
order by weigh_date desc
