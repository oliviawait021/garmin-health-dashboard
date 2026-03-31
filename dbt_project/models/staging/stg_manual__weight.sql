with source as (
    select * from {{ source('raw_manual', 'weight') }}
)

select
    weigh_date,
    weight_lbs,
    notes,
    entered_at
from source
