-- Fails if any weight entry is zero or negative.

select
    weigh_date,
    weight_lbs
from {{ ref('stg_manual__weight') }}
where weight_lbs <= 0
