-- Flags any rows where resting HR is outside the physiologically plausible range.
-- Normal human resting HR: 30 bpm (elite athletes) to 220 bpm (absolute max).

select
    hr_date,
    resting_hr
from {{ ref('stg_garmin__heart_rate') }}
where resting_hr is not null
  and (resting_hr < 30 or resting_hr > 220)
