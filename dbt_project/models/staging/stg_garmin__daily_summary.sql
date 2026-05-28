with source as (
    select * from {{ source('raw_garmin', 'daily_summary') }}
),

renamed as (
    select
        summary_date,

        -- Steps / distance
        (raw_data ->> 'totalSteps')::numeric::int                         as total_steps,
        (raw_data ->> 'totalDistanceMeters')::numeric                    as total_distance_meters,
        (raw_data ->> 'dailyStepGoal')::numeric::int                     as step_goal,

        -- Calories
        (raw_data ->> 'activeKilocalories')::numeric::int                as active_calories,
        (raw_data ->> 'bmrKilocalories')::numeric::int                   as bmr_calories,
        (raw_data ->> 'totalKilocalories')::numeric::int                 as total_calories,

        -- Heart rate
        (raw_data ->> 'restingHeartRate')::numeric::int                  as resting_heart_rate,
        (raw_data ->> 'minHeartRate')::numeric::int                      as min_heart_rate,
        (raw_data ->> 'maxHeartRate')::numeric::int                      as max_heart_rate,
        (raw_data ->> 'lastSevenDaysAvgRestingHeartRate')::numeric::int  as avg_rhr_7d,

        -- Stress
        (raw_data ->> 'averageStressLevel')::numeric::int                as avg_stress_level,
        (raw_data ->> 'maxStressLevel')::numeric::int                    as max_stress_level,

        -- Floors / intensity
        (raw_data ->> 'floorsAscended')::numeric                         as floors_climbed,
        (raw_data ->> 'moderateIntensityMinutes')::numeric::int          as moderate_intensity_minutes,
        (raw_data ->> 'vigorousIntensityMinutes')::numeric::int          as vigorous_intensity_minutes,
        (
            coalesce((raw_data ->> 'moderateIntensityMinutes')::numeric::int, 0)
            + coalesce((raw_data ->> 'vigorousIntensityMinutes')::numeric::int, 0) * 2
        )                                                                 as intensity_minutes_weighted,

        -- Body battery
        (raw_data ->> 'startBodyBatteryValue')::numeric::int             as body_battery_start,
        (raw_data ->> 'endBodyBatteryValue')::numeric::int               as body_battery_end,

        ingested_at

    from source
)

select * from renamed
