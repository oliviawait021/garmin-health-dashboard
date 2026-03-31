with source as (
    select * from {{ source('raw_garmin', 'steps') }}
),

-- The steps API returns an array; we sum it here for a daily total.
-- The raw array is kept for potential intraday charting.
renamed as (
    select
        steps_date,

        (
            select coalesce(sum((elem ->> 'steps')::int), 0)
            from jsonb_array_elements(raw_data) as elem
        )                                               as total_steps,

        -- Step goal is sometimes embedded per-element; take the first non-null
        (
            select (elem ->> 'stepGoal')::int
            from jsonb_array_elements(raw_data) as elem
            where (elem ->> 'stepGoal') is not null
            limit 1
        )                                               as step_goal,

        raw_data                                        as steps_series_json,

        ingested_at

    from source
)

select * from renamed
