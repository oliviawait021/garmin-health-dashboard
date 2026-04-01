with source as (
    select * from {{ source('raw_garmin', 'calories') }}
),

-- The calories API returns an intraday array; we sum it here for a daily total.
-- The raw array is kept for potential intraday charting.
renamed as (
    select
        calories_date,

        (
            select coalesce(sum((elem ->> 'calories')::int), 0)
            from jsonb_array_elements(raw_data) as elem
        )                                               as total_calories,

        raw_data                                        as calories_series_json,

        ingested_at

    from source
)

select * from renamed
