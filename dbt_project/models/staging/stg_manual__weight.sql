with source as (
    select * from {{ source('raw_manual', 'weight') }}
)

select
    weigh_date,
    weight_lbs,
    notes,
    entered_at
from source
where weight_lbs <= 155
  and weigh_date >= '2024-01-01'
