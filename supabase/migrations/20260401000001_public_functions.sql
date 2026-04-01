--
-- PostgreSQL database dump
--

\restrict zSiSs7gvnKbL72KTOgAmsbA0619toxG4QD7NakPt6KQhkHsMhjhvhRfch6Umk9e

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: upsert_active_calories(date, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.upsert_active_calories(p_date date, p_calories integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$                                                            
  BEGIN                                                                      
    INSERT INTO raw_manual.active_calories (entry_date, active_calories)        
    VALUES (p_date, p_calories)                                              
    ON CONFLICT (entry_date) DO UPDATE SET                                      
      active_calories = EXCLUDED.active_calories,                               
      entered_at      = NOW();                                                  
  END;                                                                          
  $$;


ALTER FUNCTION public.upsert_active_calories(p_date date, p_calories integer) OWNER TO postgres;

--
-- Name: upsert_weight(date, numeric, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.upsert_weight(p_date date, p_lbs numeric, p_notes text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO raw_manual.weight (weigh_date, weight_lbs, notes)
  VALUES (p_date, p_lbs, p_notes)
  ON CONFLICT (weigh_date) DO UPDATE SET
    weight_lbs = EXCLUDED.weight_lbs,
    notes      = EXCLUDED.notes,
    entered_at = NOW();
END;
$$;


ALTER FUNCTION public.upsert_weight(p_date date, p_lbs numeric, p_notes text) OWNER TO postgres;

--
-- Name: weight_entries; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.weight_entries AS
 SELECT weigh_date,
    weight_lbs,
    notes,
    entered_at
   FROM raw_manual.weight;


ALTER VIEW public.weight_entries OWNER TO postgres;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION upsert_active_calories(p_date date, p_calories integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.upsert_active_calories(p_date date, p_calories integer) TO anon;
GRANT ALL ON FUNCTION public.upsert_active_calories(p_date date, p_calories integer) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_active_calories(p_date date, p_calories integer) TO service_role;


--
-- Name: FUNCTION upsert_weight(p_date date, p_lbs numeric, p_notes text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.upsert_weight(p_date date, p_lbs numeric, p_notes text) TO anon;
GRANT ALL ON FUNCTION public.upsert_weight(p_date date, p_lbs numeric, p_notes text) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_weight(p_date date, p_lbs numeric, p_notes text) TO service_role;


--
-- Name: TABLE weight_entries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.weight_entries TO anon;
GRANT ALL ON TABLE public.weight_entries TO authenticated;
GRANT ALL ON TABLE public.weight_entries TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict zSiSs7gvnKbL72KTOgAmsbA0619toxG4QD7NakPt6KQhkHsMhjhvhRfch6Umk9e

