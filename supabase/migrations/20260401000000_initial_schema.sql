--
-- PostgreSQL database dump
--

\restrict A36jti5DyljzjCUcEfV8TSdsxWx976XB0XtADyqxjokjejcsSrVbQdY9RpxYD2h

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: raw_garmin; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA raw_garmin;


ALTER SCHEMA raw_garmin OWNER TO postgres;

--
-- Name: raw_manual; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA raw_manual;


ALTER SCHEMA raw_manual OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: weight; Type: TABLE; Schema: raw_manual; Owner: postgres
--

CREATE TABLE raw_manual.weight (
    id bigint NOT NULL,
    weigh_date date NOT NULL,
    weight_lbs numeric(5,1) NOT NULL,
    notes text,
    entered_at timestamp with time zone DEFAULT now()
);


ALTER TABLE raw_manual.weight OWNER TO postgres;

--
-- Name: activities; Type: TABLE; Schema: raw_garmin; Owner: postgres
--

CREATE TABLE raw_garmin.activities (
    id bigint NOT NULL,
    activity_id bigint NOT NULL,
    activity_date date NOT NULL,
    raw_data jsonb NOT NULL,
    ingested_at timestamp with time zone DEFAULT now()
);


ALTER TABLE raw_garmin.activities OWNER TO postgres;

--
-- Name: activities_id_seq; Type: SEQUENCE; Schema: raw_garmin; Owner: postgres
--

CREATE SEQUENCE raw_garmin.activities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE raw_garmin.activities_id_seq OWNER TO postgres;

--
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: raw_garmin; Owner: postgres
--

ALTER SEQUENCE raw_garmin.activities_id_seq OWNED BY raw_garmin.activities.id;


--
-- Name: calories; Type: TABLE; Schema: raw_garmin; Owner: postgres
--

CREATE TABLE raw_garmin.calories (
    id bigint NOT NULL,
    calories_date date NOT NULL,
    raw_data jsonb NOT NULL,
    ingested_at timestamp with time zone DEFAULT now()
);


ALTER TABLE raw_garmin.calories OWNER TO postgres;

--
-- Name: calories_id_seq; Type: SEQUENCE; Schema: raw_garmin; Owner: postgres
--

CREATE SEQUENCE raw_garmin.calories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE raw_garmin.calories_id_seq OWNER TO postgres;

--
-- Name: calories_id_seq; Type: SEQUENCE OWNED BY; Schema: raw_garmin; Owner: postgres
--

ALTER SEQUENCE raw_garmin.calories_id_seq OWNED BY raw_garmin.calories.id;


--
-- Name: daily_summary; Type: TABLE; Schema: raw_garmin; Owner: postgres
--

CREATE TABLE raw_garmin.daily_summary (
    id bigint NOT NULL,
    summary_date date NOT NULL,
    raw_data jsonb NOT NULL,
    ingested_at timestamp with time zone DEFAULT now()
);


ALTER TABLE raw_garmin.daily_summary OWNER TO postgres;

--
-- Name: daily_summary_id_seq; Type: SEQUENCE; Schema: raw_garmin; Owner: postgres
--

CREATE SEQUENCE raw_garmin.daily_summary_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE raw_garmin.daily_summary_id_seq OWNER TO postgres;

--
-- Name: daily_summary_id_seq; Type: SEQUENCE OWNED BY; Schema: raw_garmin; Owner: postgres
--

ALTER SEQUENCE raw_garmin.daily_summary_id_seq OWNED BY raw_garmin.daily_summary.id;


--
-- Name: heart_rate; Type: TABLE; Schema: raw_garmin; Owner: postgres
--

CREATE TABLE raw_garmin.heart_rate (
    id bigint NOT NULL,
    hr_date date NOT NULL,
    raw_data jsonb NOT NULL,
    ingested_at timestamp with time zone DEFAULT now()
);


ALTER TABLE raw_garmin.heart_rate OWNER TO postgres;

--
-- Name: heart_rate_id_seq; Type: SEQUENCE; Schema: raw_garmin; Owner: postgres
--

CREATE SEQUENCE raw_garmin.heart_rate_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE raw_garmin.heart_rate_id_seq OWNER TO postgres;

--
-- Name: heart_rate_id_seq; Type: SEQUENCE OWNED BY; Schema: raw_garmin; Owner: postgres
--

ALTER SEQUENCE raw_garmin.heart_rate_id_seq OWNED BY raw_garmin.heart_rate.id;


--
-- Name: sleep; Type: TABLE; Schema: raw_garmin; Owner: postgres
--

CREATE TABLE raw_garmin.sleep (
    id bigint NOT NULL,
    sleep_date date NOT NULL,
    raw_data jsonb NOT NULL,
    ingested_at timestamp with time zone DEFAULT now()
);


ALTER TABLE raw_garmin.sleep OWNER TO postgres;

--
-- Name: sleep_id_seq; Type: SEQUENCE; Schema: raw_garmin; Owner: postgres
--

CREATE SEQUENCE raw_garmin.sleep_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE raw_garmin.sleep_id_seq OWNER TO postgres;

--
-- Name: sleep_id_seq; Type: SEQUENCE OWNED BY; Schema: raw_garmin; Owner: postgres
--

ALTER SEQUENCE raw_garmin.sleep_id_seq OWNED BY raw_garmin.sleep.id;


--
-- Name: steps; Type: TABLE; Schema: raw_garmin; Owner: postgres
--

CREATE TABLE raw_garmin.steps (
    id bigint NOT NULL,
    steps_date date NOT NULL,
    raw_data jsonb NOT NULL,
    ingested_at timestamp with time zone DEFAULT now()
);


ALTER TABLE raw_garmin.steps OWNER TO postgres;

--
-- Name: steps_id_seq; Type: SEQUENCE; Schema: raw_garmin; Owner: postgres
--

CREATE SEQUENCE raw_garmin.steps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE raw_garmin.steps_id_seq OWNER TO postgres;

--
-- Name: steps_id_seq; Type: SEQUENCE OWNED BY; Schema: raw_garmin; Owner: postgres
--

ALTER SEQUENCE raw_garmin.steps_id_seq OWNED BY raw_garmin.steps.id;


--
-- Name: stress; Type: TABLE; Schema: raw_garmin; Owner: postgres
--

CREATE TABLE raw_garmin.stress (
    id bigint NOT NULL,
    stress_date date NOT NULL,
    raw_data jsonb NOT NULL,
    ingested_at timestamp with time zone DEFAULT now()
);


ALTER TABLE raw_garmin.stress OWNER TO postgres;

--
-- Name: stress_id_seq; Type: SEQUENCE; Schema: raw_garmin; Owner: postgres
--

CREATE SEQUENCE raw_garmin.stress_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE raw_garmin.stress_id_seq OWNER TO postgres;

--
-- Name: stress_id_seq; Type: SEQUENCE OWNED BY; Schema: raw_garmin; Owner: postgres
--

ALTER SEQUENCE raw_garmin.stress_id_seq OWNED BY raw_garmin.stress.id;


--
-- Name: active_calories; Type: TABLE; Schema: raw_manual; Owner: postgres
--

CREATE TABLE raw_manual.active_calories (
    id bigint NOT NULL,
    entry_date date NOT NULL,
    active_calories integer NOT NULL,
    entered_at timestamp with time zone DEFAULT now()
);


ALTER TABLE raw_manual.active_calories OWNER TO postgres;

--
-- Name: active_calories_id_seq; Type: SEQUENCE; Schema: raw_manual; Owner: postgres
--

CREATE SEQUENCE raw_manual.active_calories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE raw_manual.active_calories_id_seq OWNER TO postgres;

--
-- Name: active_calories_id_seq; Type: SEQUENCE OWNED BY; Schema: raw_manual; Owner: postgres
--

ALTER SEQUENCE raw_manual.active_calories_id_seq OWNED BY raw_manual.active_calories.id;


--
-- Name: weight_id_seq; Type: SEQUENCE; Schema: raw_manual; Owner: postgres
--

CREATE SEQUENCE raw_manual.weight_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE raw_manual.weight_id_seq OWNER TO postgres;

--
-- Name: weight_id_seq; Type: SEQUENCE OWNED BY; Schema: raw_manual; Owner: postgres
--

ALTER SEQUENCE raw_manual.weight_id_seq OWNED BY raw_manual.weight.id;


--
-- Name: activities id; Type: DEFAULT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.activities ALTER COLUMN id SET DEFAULT nextval('raw_garmin.activities_id_seq'::regclass);


--
-- Name: calories id; Type: DEFAULT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.calories ALTER COLUMN id SET DEFAULT nextval('raw_garmin.calories_id_seq'::regclass);


--
-- Name: daily_summary id; Type: DEFAULT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.daily_summary ALTER COLUMN id SET DEFAULT nextval('raw_garmin.daily_summary_id_seq'::regclass);


--
-- Name: heart_rate id; Type: DEFAULT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.heart_rate ALTER COLUMN id SET DEFAULT nextval('raw_garmin.heart_rate_id_seq'::regclass);


--
-- Name: sleep id; Type: DEFAULT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.sleep ALTER COLUMN id SET DEFAULT nextval('raw_garmin.sleep_id_seq'::regclass);


--
-- Name: steps id; Type: DEFAULT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.steps ALTER COLUMN id SET DEFAULT nextval('raw_garmin.steps_id_seq'::regclass);


--
-- Name: stress id; Type: DEFAULT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.stress ALTER COLUMN id SET DEFAULT nextval('raw_garmin.stress_id_seq'::regclass);


--
-- Name: active_calories id; Type: DEFAULT; Schema: raw_manual; Owner: postgres
--

ALTER TABLE ONLY raw_manual.active_calories ALTER COLUMN id SET DEFAULT nextval('raw_manual.active_calories_id_seq'::regclass);


--
-- Name: weight id; Type: DEFAULT; Schema: raw_manual; Owner: postgres
--

ALTER TABLE ONLY raw_manual.weight ALTER COLUMN id SET DEFAULT nextval('raw_manual.weight_id_seq'::regclass);


--
-- Name: activities activities_activity_id_key; Type: CONSTRAINT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.activities
    ADD CONSTRAINT activities_activity_id_key UNIQUE (activity_id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: calories calories_calories_date_key; Type: CONSTRAINT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.calories
    ADD CONSTRAINT calories_calories_date_key UNIQUE (calories_date);


--
-- Name: calories calories_pkey; Type: CONSTRAINT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.calories
    ADD CONSTRAINT calories_pkey PRIMARY KEY (id);


--
-- Name: daily_summary daily_summary_pkey; Type: CONSTRAINT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.daily_summary
    ADD CONSTRAINT daily_summary_pkey PRIMARY KEY (id);


--
-- Name: daily_summary daily_summary_summary_date_key; Type: CONSTRAINT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.daily_summary
    ADD CONSTRAINT daily_summary_summary_date_key UNIQUE (summary_date);


--
-- Name: heart_rate heart_rate_hr_date_key; Type: CONSTRAINT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.heart_rate
    ADD CONSTRAINT heart_rate_hr_date_key UNIQUE (hr_date);


--
-- Name: heart_rate heart_rate_pkey; Type: CONSTRAINT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.heart_rate
    ADD CONSTRAINT heart_rate_pkey PRIMARY KEY (id);


--
-- Name: sleep sleep_pkey; Type: CONSTRAINT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.sleep
    ADD CONSTRAINT sleep_pkey PRIMARY KEY (id);


--
-- Name: sleep sleep_sleep_date_key; Type: CONSTRAINT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.sleep
    ADD CONSTRAINT sleep_sleep_date_key UNIQUE (sleep_date);


--
-- Name: steps steps_pkey; Type: CONSTRAINT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.steps
    ADD CONSTRAINT steps_pkey PRIMARY KEY (id);


--
-- Name: steps steps_steps_date_key; Type: CONSTRAINT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.steps
    ADD CONSTRAINT steps_steps_date_key UNIQUE (steps_date);


--
-- Name: stress stress_pkey; Type: CONSTRAINT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.stress
    ADD CONSTRAINT stress_pkey PRIMARY KEY (id);


--
-- Name: stress stress_stress_date_key; Type: CONSTRAINT; Schema: raw_garmin; Owner: postgres
--

ALTER TABLE ONLY raw_garmin.stress
    ADD CONSTRAINT stress_stress_date_key UNIQUE (stress_date);


--
-- Name: active_calories active_calories_entry_date_key; Type: CONSTRAINT; Schema: raw_manual; Owner: postgres
--

ALTER TABLE ONLY raw_manual.active_calories
    ADD CONSTRAINT active_calories_entry_date_key UNIQUE (entry_date);


--
-- Name: active_calories active_calories_pkey; Type: CONSTRAINT; Schema: raw_manual; Owner: postgres
--

ALTER TABLE ONLY raw_manual.active_calories
    ADD CONSTRAINT active_calories_pkey PRIMARY KEY (id);


--
-- Name: weight weight_pkey; Type: CONSTRAINT; Schema: raw_manual; Owner: postgres
--

ALTER TABLE ONLY raw_manual.weight
    ADD CONSTRAINT weight_pkey PRIMARY KEY (id);


--
-- Name: weight weight_weigh_date_key; Type: CONSTRAINT; Schema: raw_manual; Owner: postgres
--

ALTER TABLE ONLY raw_manual.weight
    ADD CONSTRAINT weight_weigh_date_key UNIQUE (weigh_date);


--
-- Name: idx_activities_date; Type: INDEX; Schema: raw_garmin; Owner: postgres
--

CREATE INDEX idx_activities_date ON raw_garmin.activities USING btree (activity_date DESC);


--
-- Name: idx_calories_date; Type: INDEX; Schema: raw_garmin; Owner: postgres
--

CREATE INDEX idx_calories_date ON raw_garmin.calories USING btree (calories_date DESC);


--
-- Name: idx_daily_summary_date; Type: INDEX; Schema: raw_garmin; Owner: postgres
--

CREATE INDEX idx_daily_summary_date ON raw_garmin.daily_summary USING btree (summary_date DESC);


--
-- Name: idx_hr_date; Type: INDEX; Schema: raw_garmin; Owner: postgres
--

CREATE INDEX idx_hr_date ON raw_garmin.heart_rate USING btree (hr_date DESC);


--
-- Name: idx_sleep_date; Type: INDEX; Schema: raw_garmin; Owner: postgres
--

CREATE INDEX idx_sleep_date ON raw_garmin.sleep USING btree (sleep_date DESC);


--
-- Name: idx_steps_date; Type: INDEX; Schema: raw_garmin; Owner: postgres
--

CREATE INDEX idx_steps_date ON raw_garmin.steps USING btree (steps_date DESC);


--
-- Name: idx_stress_date; Type: INDEX; Schema: raw_garmin; Owner: postgres
--

CREATE INDEX idx_stress_date ON raw_garmin.stress USING btree (stress_date DESC);


--
-- Name: idx_active_calories_date; Type: INDEX; Schema: raw_manual; Owner: postgres
--

CREATE INDEX idx_active_calories_date ON raw_manual.active_calories USING btree (entry_date DESC);


--
-- Name: idx_weight_date; Type: INDEX; Schema: raw_manual; Owner: postgres
--

CREATE INDEX idx_weight_date ON raw_manual.weight USING btree (weigh_date DESC);


--
-- Name: SCHEMA raw_manual; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA raw_manual TO anon;
GRANT USAGE ON SCHEMA raw_manual TO authenticated;


--
-- Name: TABLE active_calories; Type: ACL; Schema: raw_manual; Owner: postgres
--

GRANT ALL ON TABLE raw_manual.active_calories TO anon;
GRANT ALL ON TABLE raw_manual.active_calories TO authenticated;


--
-- PostgreSQL database dump complete
--

\unrestrict A36jti5DyljzjCUcEfV8TSdsxWx976XB0XtADyqxjokjejcsSrVbQdY9RpxYD2h

