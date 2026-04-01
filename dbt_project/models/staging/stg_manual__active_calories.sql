with source as (
    select * from {{ source('raw_manual', 'active_calories') }}
)

select
    entry_date,
    active_calories,
    entered_at
from source
