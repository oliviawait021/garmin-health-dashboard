with source as (
    select * from {{ source('raw_manual', 'menstrual_cycle') }}
)

select
    id,
    period_start,
    period_end,
    flow_level,
    symptoms,
    notes,
    entered_at
from source
where period_start >= '2020-01-01'
order by period_start
