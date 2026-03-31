-- Fails if any date appears more than once in the staging daily summary model.
-- dbt singular tests: a non-empty result = test failure.

select
    summary_date,
    count(*) as row_count
from {{ ref('stg_garmin__daily_summary') }}
group by summary_date
having count(*) > 1
