with source as (
    select * from {{ source('raw_manual', 'body_composition') }}
)

-- Renpho tracks users separately, so body composition data is already
-- attributed to Olivia. Filter to 2024+ only.
select
    entry_date,
    body_fat_pct,
    bmi,
    lean_body_mass_lbs,
    source_name,
    entered_at
from source
where entry_date >= '2024-01-01'
