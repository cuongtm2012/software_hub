pg_dump: last built-in OID is 16383
pg_dump: reading extensions
pg_dump: identifying extension members
pg_dump: reading schemas
pg_dump: reading user-defined tables
pg_dump: reading user-defined functions
pg_dump: reading user-defined types
pg_dump: reading procedural languages
pg_dump: reading user-defined aggregate functions
pg_dump: reading user-defined operators
pg_dump: reading user-defined access methods
pg_dump: reading user-defined operator classes
pg_dump: reading user-defined operator families
pg_dump: reading user-defined text search parsers
pg_dump: reading user-defined text search templates
pg_dump: reading user-defined text search dictionaries
pg_dump: reading user-defined text search configurations
pg_dump: reading user-defined foreign-data wrappers
pg_dump: reading user-defined foreign servers
pg_dump: reading default privileges
pg_dump: reading user-defined collations
pg_dump: reading user-defined conversions
pg_dump: reading type casts
pg_dump: reading transforms
pg_dump: reading table inheritance information
pg_dump: reading event triggers
pg_dump: finding extension tables
pg_dump: finding inheritance relationships
pg_dump: reading column info for interesting tables
pg_dump: finding table default expressions
pg_dump: flagging inherited columns in subtables
pg_dump: reading partitioning data
pg_dump: reading indexes
pg_dump: flagging indexes in partitioned tables
pg_dump: reading extended statistics
pg_dump: reading constraints
pg_dump: reading triggers
pg_dump: reading rewrite rules
pg_dump: reading policies
pg_dump: reading row-level security policies
pg_dump: reading publications
pg_dump: reading publication membership of tables
pg_dump: reading publication membership of schemas
pg_dump: reading subscriptions
pg_dump: reading large objects
pg_dump: reading dependency data
pg_dump: saving encoding = UTF8
pg_dump: saving standard_conforming_strings = on
pg_dump: saving search_path = 
pg_dump: saving database definition
--
-- PostgreSQL database dump
--

\restrict WJ1E1813hlabeoLpOmh2gqVPBcnH4aLOcrtSrPuwZkumJ9cn833ontZQhIVAGsd

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

-- Started on 2026-01-29 15:23:56 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS softwarehub;
--
-- TOC entry 3901 (class 1262 OID 25615)
-- Name: softwarehub; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE softwarehub WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE softwarehub OWNER TO postgres;

\unrestrict WJ1E1813hlabeoLpOmh2gqVPBcnH4aLOcrtSrPuwZkumJ9cn833ontZQhIVAGsd
\connect softwarehub
\restrict WJ1E1813hlabeoLpOmh2gqVPBcnH4aLOcrtSrPuwZkumJ9cn833ontZQhIVAGsd

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 897 (class 1247 OID 25617)
-- Name: external_request_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.external_request_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'cancelled',
    'contacted',
    'converted',
    'rejected'
);


ALTER TYPE public.external_request_status OWNER TO postgres;

--
-- TOC entry 900 (class 1247 OID 25632)
-- Name: order_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'completed',
    'cancelled'
);


ALTER TYPE public.order_status OWNER TO postgres;

--
-- TOC entry 903 (class 1247 OID 25646)
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);


ALTER TYPE public.payment_status OWNER TO postgres;

--
-- TOC entry 906 (class 1247 OID 25656)
-- Name: platform; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.platform AS ENUM (
    'windows',
    'mac',
    'linux',
    'android',
    'ios',
    'web'
);


ALTER TYPE public.platform OWNER TO postgres;

--
-- TOC entry 909 (class 1247 OID 25670)
-- Name: project_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.project_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE public.project_status OWNER TO postgres;

--
-- TOC entry 912 (class 1247 OID 25680)
-- Name: quote_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.quote_status AS ENUM (
    'pending',
    'accepted',
    'rejected'
);


ALTER TYPE public.quote_status OWNER TO postgres;

--
-- TOC entry 915 (class 1247 OID 25688)
-- Name: role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role AS ENUM (
    'user',
    'admin',
    'developer',
    'client',
    'seller',
    'buyer'
);


ALTER TYPE public.role OWNER TO postgres;

--
-- TOC entry 918 (class 1247 OID 25702)
-- Name: service_payment_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.service_payment_type AS ENUM (
    'deposit',
    'final',
    'full'
);


ALTER TYPE public.service_payment_type OWNER TO postgres;

--
-- TOC entry 921 (class 1247 OID 25710)
-- Name: service_quotation_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.service_quotation_status AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'expired'
);


ALTER TYPE public.service_quotation_status OWNER TO postgres;

--
-- TOC entry 924 (class 1247 OID 25720)
-- Name: service_request_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.service_request_status AS ENUM (
    'submitted',
    'under_review',
    'quoted',
    'accepted',
    'in_progress',
    'completed',
    'closed',
    'rejected'
);


ALTER TYPE public.service_request_status OWNER TO postgres;

--
-- TOC entry 1026 (class 1247 OID 42732)
-- Name: software_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.software_type AS ENUM (
    'software',
    'api'
);


ALTER TYPE public.software_type OWNER TO postgres;

--
-- TOC entry 927 (class 1247 OID 25738)
-- Name: status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.status OWNER TO postgres;

--
-- TOC entry 930 (class 1247 OID 25746)
-- Name: verification_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.verification_status AS ENUM (
    'pending',
    'verified',
    'rejected'
);


ALTER TYPE public.verification_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 214 (class 1259 OID 25753)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 25758)
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cart_items_id_seq OWNER TO postgres;

--
-- TOC entry 3902 (class 0 OID 0)
-- Dependencies: 215
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- TOC entry 216 (class 1259 OID 25759)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    parent_id integer
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 25764)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 3903 (class 0 OID 0)
-- Dependencies: 217
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 218 (class 1259 OID 25765)
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    room_id integer NOT NULL,
    sender_id integer NOT NULL,
    content text NOT NULL,
    message_type text DEFAULT 'text'::text NOT NULL,
    status text DEFAULT 'sent'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    edited_at timestamp without time zone
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 25773)
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chat_messages_id_seq OWNER TO postgres;

--
-- TOC entry 3904 (class 0 OID 0)
-- Dependencies: 219
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- TOC entry 220 (class 1259 OID 25774)
-- Name: chat_room_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_room_members (
    id integer NOT NULL,
    room_id integer NOT NULL,
    user_id integer NOT NULL,
    joined_at timestamp without time zone DEFAULT now() NOT NULL,
    last_read_at timestamp without time zone,
    is_admin boolean DEFAULT false NOT NULL
);


ALTER TABLE public.chat_room_members OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 25779)
-- Name: chat_room_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chat_room_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chat_room_members_id_seq OWNER TO postgres;

--
-- TOC entry 3905 (class 0 OID 0)
-- Dependencies: 221
-- Name: chat_room_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chat_room_members_id_seq OWNED BY public.chat_room_members.id;


--
-- TOC entry 222 (class 1259 OID 25780)
-- Name: chat_rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_rooms (
    id integer NOT NULL,
    name text,
    type text DEFAULT 'direct'::text NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chat_rooms OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 25788)
-- Name: chat_rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chat_rooms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chat_rooms_id_seq OWNER TO postgres;

--
-- TOC entry 3906 (class 0 OID 0)
-- Dependencies: 223
-- Name: chat_rooms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chat_rooms_id_seq OWNED BY public.chat_rooms.id;


--
-- TOC entry 274 (class 1259 OID 34564)
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    topic text NOT NULL,
    instructor text,
    youtube_url text NOT NULL,
    playlist_id text,
    thumbnail_url text,
    level text,
    language text DEFAULT 'vi'::text,
    status text DEFAULT 'approved'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 34563)
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.courses_id_seq OWNER TO postgres;

--
-- TOC entry 3907 (class 0 OID 0)
-- Dependencies: 273
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- TOC entry 224 (class 1259 OID 25789)
-- Name: external_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_requests (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    project_description text NOT NULL,
    status public.external_request_status DEFAULT 'pending'::public.external_request_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    title text,
    requirements text,
    technology_stack text[],
    timeline text,
    budget_range text,
    budget numeric,
    deadline timestamp without time zone,
    client_id integer,
    assigned_developer_id integer,
    priority text DEFAULT 'normal'::text,
    admin_notes text,
    contact_email text,
    contact_phone text,
    updated_at timestamp without time zone
);


ALTER TABLE public.external_requests OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 25797)
-- Name: external_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.external_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.external_requests_id_seq OWNER TO postgres;

--
-- TOC entry 3908 (class 0 OID 0)
-- Dependencies: 225
-- Name: external_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.external_requests_id_seq OWNED BY public.external_requests.id;


--
-- TOC entry 272 (class 1259 OID 26327)
-- Name: fcm_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fcm_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    device_type character varying(20) DEFAULT 'web'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    active boolean DEFAULT true
);


ALTER TABLE public.fcm_tokens OWNER TO postgres;

--
-- TOC entry 3909 (class 0 OID 0)
-- Dependencies: 272
-- Name: TABLE fcm_tokens; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.fcm_tokens IS 'Stores Firebase Cloud Messaging tokens for push notifications';


--
-- TOC entry 3910 (class 0 OID 0)
-- Dependencies: 272
-- Name: COLUMN fcm_tokens.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fcm_tokens.user_id IS 'Reference to the user who owns this device token';


--
-- TOC entry 3911 (class 0 OID 0)
-- Dependencies: 272
-- Name: COLUMN fcm_tokens.token; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fcm_tokens.token IS 'FCM device token for sending push notifications';


--
-- TOC entry 3912 (class 0 OID 0)
-- Dependencies: 272
-- Name: COLUMN fcm_tokens.device_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fcm_tokens.device_type IS 'Type of device (web, ios, android)';


--
-- TOC entry 271 (class 1259 OID 26326)
-- Name: fcm_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fcm_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fcm_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 3913 (class 0 OID 0)
-- Dependencies: 271
-- Name: fcm_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fcm_tokens_id_seq OWNED BY public.fcm_tokens.id;


--
-- TOC entry 226 (class 1259 OID 25798)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    project_id integer NOT NULL,
    sender_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 25804)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO postgres;

--
-- TOC entry 3914 (class 0 OID 0)
-- Dependencies: 227
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 228 (class 1259 OID 25805)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) DEFAULT 'info'::character varying,
    is_read boolean DEFAULT false,
    link_url character varying(500),
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    read_at timestamp without time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 25813)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 3915 (class 0 OID 0)
-- Dependencies: 229
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 230 (class 1259 OID 25814)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 25820)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_items_id_seq OWNER TO postgres;

--
-- TOC entry 3916 (class 0 OID 0)
-- Dependencies: 231
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 232 (class 1259 OID 25821)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    buyer_id integer NOT NULL,
    status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    total_amount numeric NOT NULL,
    shipping_info jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    seller_id integer,
    commission_amount numeric DEFAULT 0,
    payment_method text DEFAULT 'card'::text,
    download_links text[],
    buyer_info jsonb
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 25831)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO postgres;

--
-- TOC entry 3917 (class 0 OID 0)
-- Dependencies: 233
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 234 (class 1259 OID 25832)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    order_id integer,
    project_id integer,
    amount numeric NOT NULL,
    payment_method text NOT NULL,
    status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    escrow_release boolean DEFAULT false NOT NULL,
    transaction_id text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 25840)
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payments_id_seq OWNER TO postgres;

--
-- TOC entry 3918 (class 0 OID 0)
-- Dependencies: 235
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


pg_dump: dropping DATABASE softwarehub
pg_dump: creating DATABASE "softwarehub"
pg_dump: connecting to new database "softwarehub"
pg_dump: creating TYPE "public.external_request_status"
pg_dump: creating TYPE "public.order_status"
pg_dump: creating TYPE "public.payment_status"
pg_dump: creating TYPE "public.platform"
pg_dump: creating TYPE "public.project_status"
pg_dump: creating TYPE "public.quote_status"
pg_dump: creating TYPE "public.role"
pg_dump: creating TYPE "public.service_payment_type"
pg_dump: creating TYPE "public.service_quotation_status"
pg_dump: creating TYPE "public.service_request_status"
pg_dump: creating TYPE "public.software_type"
pg_dump: creating TYPE "public.status"
pg_dump: creating TYPE "public.verification_status"
pg_dump: creating TABLE "public.cart_items"
pg_dump: creating SEQUENCE "public.cart_items_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.cart_items_id_seq"
pg_dump: creating TABLE "public.categories"
pg_dump: creating SEQUENCE "public.categories_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.categories_id_seq"
pg_dump: creating TABLE "public.chat_messages"
pg_dump: creating SEQUENCE "public.chat_messages_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.chat_messages_id_seq"
pg_dump: creating TABLE "public.chat_room_members"
pg_dump: creating SEQUENCE "public.chat_room_members_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.chat_room_members_id_seq"
pg_dump: creating TABLE "public.chat_rooms"
pg_dump: creating SEQUENCE "public.chat_rooms_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.chat_rooms_id_seq"
pg_dump: creating TABLE "public.courses"
pg_dump: creating SEQUENCE "public.courses_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.courses_id_seq"
pg_dump: creating TABLE "public.external_requests"
pg_dump: creating SEQUENCE "public.external_requests_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.external_requests_id_seq"
pg_dump: creating TABLE "public.fcm_tokens"
pg_dump: creating COMMENT "public.TABLE fcm_tokens"
pg_dump: creating COMMENT "public.COLUMN fcm_tokens.user_id"
pg_dump: creating COMMENT "public.COLUMN fcm_tokens.token"
pg_dump: creating COMMENT "public.COLUMN fcm_tokens.device_type"
pg_dump: creating SEQUENCE "public.fcm_tokens_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.fcm_tokens_id_seq"
pg_dump: creating TABLE "public.messages"
pg_dump: creating SEQUENCE "public.messages_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.messages_id_seq"
pg_dump: creating TABLE "public.notifications"
pg_dump: creating SEQUENCE "public.notifications_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.notifications_id_seq"
pg_dump: creating TABLE "public.order_items"
pg_dump: creating SEQUENCE "public.order_items_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.order_items_id_seq"
pg_dump: creating TABLE "public.orders"
pg_dump: creating SEQUENCE "public.orders_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.orders_id_seq"
pg_dump: creating TABLE "public.payments"
pg_dump: creating SEQUENCE "public.payments_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.payments_id_seq"
pg_dump: creating TABLE "public.portfolio_reviews"
pg_dump: creating SEQUENCE "public.portfolio_reviews_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.portfolio_reviews_id_seq"
pg_dump: creating TABLE "public.portfolios"
pg_dump: creating SEQUENCE "public.portfolios_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.portfolios_id_seq"
pg_dump: creating TABLE "public.product_reviews"
pg_dump: creating SEQUENCE "public.product_reviews_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.product_reviews_id_seq"
pg_dump: creating TABLE "public.products"
pg_dump: creating SEQUENCE "public.products_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.products_id_seq"
pg_dump: creating TABLE "public.quotes"
pg_dump: creating SEQUENCE "public.quotes_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.quotes_id_seq"
pg_dump: creating TABLE "public.reviews"
pg_dump: creating SEQUENCE "public.reviews_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.reviews_id_seq"
pg_dump: creating TABLE "public.sales_analytics"
pg_dump: creating SEQUENCE "public.sales_analytics_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.sales_analytics_id_seq"
pg_dump: creating TABLE "public.seller_profiles"
pg_dump: creating SEQUENCE "public.seller_profiles_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.seller_profiles_id_seq"
pg_dump: creating TABLE "public.service_payments"
--
-- TOC entry 236 (class 1259 OID 25841)
-- Name: portfolio_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.portfolio_reviews (
    id integer NOT NULL,
    portfolio_id integer NOT NULL,
    user_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.portfolio_reviews OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 25847)
-- Name: portfolio_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.portfolio_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.portfolio_reviews_id_seq OWNER TO postgres;

--
-- TOC entry 3919 (class 0 OID 0)
-- Dependencies: 237
-- Name: portfolio_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.portfolio_reviews_id_seq OWNED BY public.portfolio_reviews.id;


--
-- TOC entry 238 (class 1259 OID 25848)
-- Name: portfolios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.portfolios (
    id integer NOT NULL,
    developer_id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    images text[],
    demo_link text,
    technologies text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.portfolios OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 25854)
-- Name: portfolios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.portfolios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.portfolios_id_seq OWNER TO postgres;

--
-- TOC entry 3920 (class 0 OID 0)
-- Dependencies: 239
-- Name: portfolios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.portfolios_id_seq OWNED BY public.portfolios.id;


--
-- TOC entry 240 (class 1259 OID 25855)
-- Name: product_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_reviews (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    buyer_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_reviews OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 25861)
-- Name: product_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_reviews_id_seq OWNER TO postgres;

--
-- TOC entry 3921 (class 0 OID 0)
-- Dependencies: 241
-- Name: product_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_reviews_id_seq OWNED BY public.product_reviews.id;


--
-- TOC entry 242 (class 1259 OID 25862)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    seller_id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    price numeric NOT NULL,
    images text[],
    category text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    price_type text DEFAULT 'fixed'::text NOT NULL,
    stock_quantity integer DEFAULT 1 NOT NULL,
    download_link text,
    product_files text[],
    tags text[],
    license_info text,
    status text DEFAULT 'draft'::text NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    total_sales integer DEFAULT 0 NOT NULL,
    avg_rating numeric(3,2)
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 25874)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 3922 (class 0 OID 0)
-- Dependencies: 243
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 244 (class 1259 OID 25875)
-- Name: quotes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotes (
    id integer NOT NULL,
    project_id integer NOT NULL,
    developer_id integer NOT NULL,
    price numeric NOT NULL,
    timeline text NOT NULL,
    message text,
    status public.quote_status DEFAULT 'pending'::public.quote_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    title text,
    description text,
    deliverables text[],
    deposit_amount numeric(10,2),
    timeline_days integer,
    terms_conditions text,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.quotes OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 25882)
-- Name: quotes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quotes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quotes_id_seq OWNER TO postgres;

--
-- TOC entry 3923 (class 0 OID 0)
-- Dependencies: 245
-- Name: quotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quotes_id_seq OWNED BY public.quotes.id;


--
-- TOC entry 246 (class 1259 OID 25883)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    user_id integer NOT NULL,
    target_type text NOT NULL,
    target_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 25889)
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reviews_id_seq OWNER TO postgres;

--
-- TOC entry 3924 (class 0 OID 0)
-- Dependencies: 247
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- TOC entry 248 (class 1259 OID 25890)
-- Name: sales_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_analytics (
    id integer NOT NULL,
    seller_id integer NOT NULL,
    product_id integer,
    date timestamp without time zone NOT NULL,
    revenue numeric NOT NULL,
    units_sold integer NOT NULL,
    commission_paid numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sales_analytics OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 25896)
-- Name: sales_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_analytics_id_seq OWNER TO postgres;

--
-- TOC entry 3925 (class 0 OID 0)
-- Dependencies: 249
-- Name: sales_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_analytics_id_seq OWNED BY public.sales_analytics.id;


--
-- TOC entry 250 (class 1259 OID 25897)
-- Name: seller_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seller_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    business_name text,
    business_type text,
    tax_id text,
    business_address text,
    bank_account text,
    verification_status public.verification_status DEFAULT 'pending'::public.verification_status NOT NULL,
    verification_documents text[],
    commission_rate numeric DEFAULT 0.10 NOT NULL,
    total_sales numeric DEFAULT 0 NOT NULL,
    rating numeric(3,2),
    total_reviews integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.seller_profiles OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 25908)
-- Name: seller_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seller_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.seller_profiles_id_seq OWNER TO postgres;

--
-- TOC entry 3926 (class 0 OID 0)
-- Dependencies: 251
-- Name: seller_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.seller_profiles_id_seq OWNED BY public.seller_profiles.id;


pg_dump: creating SEQUENCE "public.service_payments_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.service_payments_id_seq"
pg_dump: creating TABLE "public.service_projects"
pg_dump: creating SEQUENCE "public.service_projects_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.service_projects_id_seq"
pg_dump: creating TABLE "public.service_quotations"
--
-- TOC entry 252 (class 1259 OID 25909)
-- Name: service_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_payments (
    id integer NOT NULL,
    quotation_id integer NOT NULL,
    service_project_id integer,
    client_id integer NOT NULL,
    amount numeric NOT NULL,
    payment_type public.service_payment_type NOT NULL,
    status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    stripe_payment_intent_id text,
    payment_method text,
    transaction_fee numeric DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_payments OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 25918)
-- Name: service_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.service_payments_id_seq OWNER TO postgres;

--
-- TOC entry 3927 (class 0 OID 0)
-- Dependencies: 253
-- Name: service_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.service_payments_id_seq OWNED BY public.service_payments.id;


--
-- TOC entry 254 (class 1259 OID 25919)
-- Name: service_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_projects (
    id integer NOT NULL,
    quotation_id integer NOT NULL,
    service_request_id integer NOT NULL,
    client_id integer NOT NULL,
    admin_id integer NOT NULL,
    status public.project_status DEFAULT 'pending'::public.project_status NOT NULL,
    progress_percentage integer DEFAULT 0 NOT NULL,
    milestones jsonb,
    deliverables_submitted text[],
    client_feedback text,
    admin_notes text,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_projects OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 25928)
-- Name: service_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.service_projects_id_seq OWNER TO postgres;

--
-- TOC entry 3928 (class 0 OID 0)
-- Dependencies: 255
-- Name: service_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.service_projects_id_seq OWNED BY public.service_projects.id;


--
-- TOC entry 256 (class 1259 OID 25929)
-- Name: service_quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_quotations (
    id integer NOT NULL,
    service_request_id integer NOT NULL,
    admin_id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    deliverables text[],
    total_price numeric NOT NULL,
    deposit_amount numeric NOT NULL,
    timeline_days integer NOT NULL,
    terms_conditions text,
    status public.service_quotation_status DEFAULT 'pending'::public.service_quotation_status NOT NULL,
    client_response text,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_quotations OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 25937)
-- Name: service_quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_quotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.service_quotations_id_seq OWNER TO postgres;

pg_dump: creating SEQUENCE "public.service_quotations_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.service_quotations_id_seq"
--
-- TOC entry 3929 (class 0 OID 0)
-- Dependencies: 257
-- Name: service_quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.service_quotations_id_seq OWNED BY public.service_quotations.id;


--
-- TOC entry 258 (class 1259 OID 25938)
-- Name: service_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_requests (
    id integer NOT NULL,
    client_id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    requirements text,
    budget_range text,
    timeline text,
    status public.service_request_status DEFAULT 'submitted'::public.service_request_status NOT NULL,
    admin_notes text,
    priority text DEFAULT 'normal'::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_requests OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 25947)
-- Name: service_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.service_requests_id_seq OWNER TO postgres;

--
-- TOC entry 3930 (class 0 OID 0)
-- Dependencies: 259
-- Name: service_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.service_requests_id_seq OWNED BY public.service_requests.id;


--
-- TOC entry 260 (class 1259 OID 25948)
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 25953)
-- Name: softwares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.softwares (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    category_id integer NOT NULL,
    platform text[] NOT NULL,
    download_link text NOT NULL,
    image_url text,
    created_by integer NOT NULL,
    status public.status DEFAULT 'pending'::public.status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    version text,
    vendor text,
    license text,
    installation_instructions text,
    documentation_link text,
    admin_notes text,
    type public.software_type DEFAULT 'software'::public.software_type NOT NULL
);


ALTER TABLE public.softwares OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 25960)
-- Name: softwares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.softwares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.softwares_id_seq OWNER TO postgres;

--
-- TOC entry 3931 (class 0 OID 0)
-- Dependencies: 262
-- Name: softwares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.softwares_id_seq OWNED BY public.softwares.id;


--
-- TOC entry 263 (class 1259 OID 25961)
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.support_tickets (
    id integer NOT NULL,
    order_id integer,
    buyer_id integer NOT NULL,
    seller_id integer,
    subject text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.support_tickets OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 25970)
-- Name: support_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.support_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.support_tickets_id_seq OWNER TO postgres;

--
-- TOC entry 3932 (class 0 OID 0)
-- Dependencies: 264
-- Name: support_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.support_tickets_id_seq OWNED BY public.support_tickets.id;


pg_dump: creating TABLE "public.service_requests"
pg_dump: creating SEQUENCE "public.service_requests_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.service_requests_id_seq"
pg_dump: creating TABLE "public.session"
pg_dump: creating TABLE "public.softwares"
pg_dump: creating SEQUENCE "public.softwares_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.softwares_id_seq"
pg_dump: creating TABLE "public.support_tickets"
pg_dump: creating SEQUENCE "public.support_tickets_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.support_tickets_id_seq"
pg_dump: creating TABLE "public.user_downloads"
pg_dump: creating SEQUENCE "public.user_downloads_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.user_downloads_id_seq"
pg_dump: creating TABLE "public.user_presence"
pg_dump: creating SEQUENCE "public.user_presence_id_seq"
--
-- TOC entry 265 (class 1259 OID 25971)
-- Name: user_downloads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_downloads (
    id integer NOT NULL,
    user_id integer NOT NULL,
    software_id integer NOT NULL,
    version text NOT NULL,
    downloaded_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_downloads OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 25977)
-- Name: user_downloads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_downloads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_downloads_id_seq OWNER TO postgres;

--
-- TOC entry 3933 (class 0 OID 0)
-- Dependencies: 266
-- Name: user_downloads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_downloads_id_seq OWNED BY public.user_downloads.id;


--
-- TOC entry 267 (class 1259 OID 25978)
-- Name: user_presence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_presence (
    id integer NOT NULL,
    user_id integer NOT NULL,
    is_online boolean DEFAULT false NOT NULL,
    last_seen timestamp without time zone DEFAULT now() NOT NULL,
    socket_id text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_presence OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 25987)
-- Name: user_presence_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_presence_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_presence_id_seq OWNER TO postgres;

--
-- TOC entry 3934 (class 0 OID 0)
-- Dependencies: 268
-- Name: user_presence_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_presence_id_seq OWNED BY public.user_presence.id;


pg_dump: creating SEQUENCE OWNED BY "public.user_presence_id_seq"
pg_dump: creating TABLE "public.users"
--
-- TOC entry 269 (class 1259 OID 25988)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public.role DEFAULT 'user'::public.role NOT NULL,
    profile_data jsonb,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    phone text,
    email_verified boolean DEFAULT false NOT NULL,
    phone_verified boolean DEFAULT false NOT NULL,
    reset_token text,
    reset_token_expires timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 25998)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 3935 (class 0 OID 0)
-- Dependencies: 270
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3448 (class 2604 OID 25999)
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- TOC entry 3451 (class 2604 OID 26000)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 3452 (class 2604 OID 26001)
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- TOC entry 3456 (class 2604 OID 26002)
-- Name: chat_room_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_members ALTER COLUMN id SET DEFAULT nextval('public.chat_room_members_id_seq'::regclass);


--
-- TOC entry 3459 (class 2604 OID 26003)
-- Name: chat_rooms id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_rooms ALTER COLUMN id SET DEFAULT nextval('public.chat_rooms_id_seq'::regclass);


--
-- TOC entry 3560 (class 2604 OID 34567)
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- TOC entry 3463 (class 2604 OID 26004)
-- Name: external_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_requests ALTER COLUMN id SET DEFAULT nextval('public.external_requests_id_seq'::regclass);


--
-- TOC entry 3555 (class 2604 OID 26330)
-- Name: fcm_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fcm_tokens ALTER COLUMN id SET DEFAULT nextval('public.fcm_tokens_id_seq'::regclass);


--
-- TOC entry 3467 (class 2604 OID 26005)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 3469 (class 2604 OID 26006)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3473 (class 2604 OID 26007)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 3475 (class 2604 OID 26008)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 3481 (class 2604 OID 26009)
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- TOC entry 3485 (class 2604 OID 26010)
-- Name: portfolio_reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_reviews ALTER COLUMN id SET DEFAULT nextval('public.portfolio_reviews_id_seq'::regclass);


--
-- TOC entry 3487 (class 2604 OID 26011)
-- Name: portfolios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolios ALTER COLUMN id SET DEFAULT nextval('public.portfolios_id_seq'::regclass);


--
-- TOC entry 3489 (class 2604 OID 26012)
-- Name: product_reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews ALTER COLUMN id SET DEFAULT nextval('public.product_reviews_id_seq'::regclass);


--
-- TOC entry 3491 (class 2604 OID 26013)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 3499 (class 2604 OID 26014)
-- Name: quotes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes ALTER COLUMN id SET DEFAULT nextval('public.quotes_id_seq'::regclass);


--
-- TOC entry 3503 (class 2604 OID 26015)
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- TOC entry 3505 (class 2604 OID 26016)
-- Name: sales_analytics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_analytics ALTER COLUMN id SET DEFAULT nextval('public.sales_analytics_id_seq'::regclass);


--
-- TOC entry 3507 (class 2604 OID 26017)
-- Name: seller_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_profiles ALTER COLUMN id SET DEFAULT nextval('public.seller_profiles_id_seq'::regclass);


--
-- TOC entry 3514 (class 2604 OID 26018)
-- Name: service_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_payments ALTER COLUMN id SET DEFAULT nextval('public.service_payments_id_seq'::regclass);


--
-- TOC entry 3519 (class 2604 OID 26019)
-- Name: service_projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_projects ALTER COLUMN id SET DEFAULT nextval('public.service_projects_id_seq'::regclass);


--
-- TOC entry 3524 (class 2604 OID 26020)
-- Name: service_quotations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_quotations ALTER COLUMN id SET DEFAULT nextval('public.service_quotations_id_seq'::regclass);


--
-- TOC entry 3528 (class 2604 OID 26021)
-- Name: service_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_requests ALTER COLUMN id SET DEFAULT nextval('public.service_requests_id_seq'::regclass);


--
-- TOC entry 3533 (class 2604 OID 26022)
-- Name: softwares id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.softwares ALTER COLUMN id SET DEFAULT nextval('public.softwares_id_seq'::regclass);


--
-- TOC entry 3537 (class 2604 OID 26023)
-- Name: support_tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets ALTER COLUMN id SET DEFAULT nextval('public.support_tickets_id_seq'::regclass);


--
-- TOC entry 3542 (class 2604 OID 26024)
-- Name: user_downloads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_downloads ALTER COLUMN id SET DEFAULT nextval('public.user_downloads_id_seq'::regclass);


--
-- TOC entry 3544 (class 2604 OID 26025)
-- Name: user_presence id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_presence ALTER COLUMN id SET DEFAULT nextval('public.user_presence_id_seq'::regclass);


--
-- TOC entry 3549 (class 2604 OID 26026)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3835 (class 0 OID 25753)
-- Dependencies: 214
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, user_id, product_id, quantity, created_at) FROM stdin;
pg_dump: creating SEQUENCE "public.users_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.users_id_seq"
pg_dump: creating DEFAULT "public.cart_items id"
pg_dump: creating DEFAULT "public.categories id"
pg_dump: creating DEFAULT "public.chat_messages id"
pg_dump: creating DEFAULT "public.chat_room_members id"
pg_dump: creating DEFAULT "public.chat_rooms id"
pg_dump: creating DEFAULT "public.courses id"
pg_dump: creating DEFAULT "public.external_requests id"
pg_dump: creating DEFAULT "public.fcm_tokens id"
pg_dump: creating DEFAULT "public.messages id"
pg_dump: creating DEFAULT "public.notifications id"
pg_dump: creating DEFAULT "public.order_items id"
pg_dump: creating DEFAULT "public.orders id"
pg_dump: creating DEFAULT "public.payments id"
pg_dump: creating DEFAULT "public.portfolio_reviews id"
pg_dump: creating DEFAULT "public.portfolios id"
pg_dump: creating DEFAULT "public.product_reviews id"
pg_dump: creating DEFAULT "public.products id"
pg_dump: creating DEFAULT "public.quotes id"
pg_dump: creating DEFAULT "public.reviews id"
pg_dump: creating DEFAULT "public.sales_analytics id"
pg_dump: creating DEFAULT "public.seller_profiles id"
pg_dump: creating DEFAULT "public.service_payments id"
pg_dump: creating DEFAULT "public.service_projects id"
pg_dump: creating DEFAULT "public.service_quotations id"
pg_dump: creating DEFAULT "public.service_requests id"
pg_dump: creating DEFAULT "public.softwares id"
pg_dump: creating DEFAULT "public.support_tickets id"
pg_dump: creating DEFAULT "public.user_downloads id"
pg_dump: creating DEFAULT "public.user_presence id"
pg_dump: creating DEFAULT "public.users id"
pg_dump: processing data for table "public.cart_items"
pg_dump: dumping contents of table "public.cart_items"
\.


--
-- TOC entry 3837 (class 0 OID 25759)
-- Dependencies: 216
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, parent_id) FROM stdin;
pg_dump: processing data for table "public.categories"
pg_dump: dumping contents of table "public.categories"
pg_dump: processing data for table "public.chat_messages"
pg_dump: dumping contents of table "public.chat_messages"
2	Media	\N
3	Communication	\N
8	Security	\N
9	Office & Productivity	\N
10	Media Players & Editors	\N
11	Compression & Archiving Tools	\N
12	Development Tools & IDEs	\N
13	Utilities & System Tools	\N
14	Communication & Collaboration	\N
15	Security & Privacy	\N
16	AI & Big Data Tools	\N
17	Web Browsers	\N
18	Gaming & Entertainment	\N
19	Cloud & Storage	\N
20	Education & Learning Software	\N
21	Design & Creativity	\N
22	3D Printing	\N
25	Data Backup and Recovery	\N
27	E-Book Utilities	\N
28	Electronic	\N
29	Education	\N
30	Email	\N
31	File Manager	\N
33	Internet	\N
35	Proxy	\N
37	Terminal	\N
39	Video	\N
40	VPN	\N
41	Wiki Software	\N
42	Others	\N
43	System Info / Monitoring	\N
44	Tools	\N
45	Console	\N
46	Graphic	\N
47	Compositors	\N
48	Stacking Window Managers	\N
49	Tiling Window Managers	\N
50	Dynamic Window Managers	\N
51	Edit-Mix-Record	23
52	Music Player	23
53	Radio	23
54	3rd Party Client	24
55	All-in-One Client	24
56	Chat Client Utilities	24
57	IRC Client	24
58	Official Client	24
59	Desktop Icon Packs	26
60	Desktop Themes	26
61	Desktop Widgets and Theme Utilities	26
62	Android	6
63	C\\+\\+	6
64	Database	6
66	Git	6
67	Golang	6
68	Java	6
69	Javascript	6
70	Microcomputer and Embedded Devices	6
71	Multiple Languages Support	6
72	PHP	6
73	Python	6
74	Ruby	6
75	Rust	6
76	Shell	6
77	Supporting Tools	6
78	City Building Simulation	5
79	Command Line	5
80	Engine Re-creations (require the actual game)	5
81	FPS	5
82	Miscellaneous	7
83	Puzzle	5
84	Racing	5
85	RPG	5
86	RTS	5
87	Sandbox	5
88	Shooter	5
89	Turn Based Strategy	5
90	Gaming Applications	5
91	Machine Emulators	5
92	Graphic Creation	32
93	Image Editor	32
94	Image Management	32
95	PSD, Sketch Inspection	32
96	Screen Recorder	32
98	Streaming	32
99	Video Editor	32
100	Browser	33
101	Supportive Tool	33
102	Web Service Client	33
103	Accounting	34
105	LaTeX	34
106	Markdown	34
107	Novel Writing	34
108	Automation	7
109	Dock	7
110	Local Search	7
111	Note Taking	7
112	Time and Task	7
113	Time and Usage Tracker	7
114	Widget and Indicator	7
115	Boot Integrity	8
116	Compartmentalization	8
117	Firewall	8
119	Password Manager	8
120	Reverse Engineering	8
121	Other	1
122	Cloud Drive	36
123	Download Manager	36
124	File Sharing	36
125	Remote Desktop	36
126	Torrent Client	36
127	Integrated Development Environment inspired / Common User Access based	38
128	Modal editors & derivatives	38
129	Other editors	38
130	Disk Utilities	1
131	System Maintenance	1
132	System Monitoring	1
133	Software	\N
134	Command Line Tools	133
138	Payments	133
139	Scientific Work	133
140	Screencasting	133
142	Web Applications	133
143	Web Servers	133
146	Automation (SysAdmin)	144
147	Backups (SysAdmin)	144
148	Build and software organization tools (SysAdmin)	144
149	ChatOps (SysAdmin)	144
150	Configuration Management (SysAdmin)	144
151	Configuration Management Database (SysAdmin)	144
152	Continuous Integration & Continuous Deployment (SysAdmin)	144
153	Control Panels (SysAdmin)	144
154	Deployment Automation (SysAdmin)	144
155	Diagramming (SysAdmin)	144
156	Distributed Filesystems (SysAdmin)	144
157	DNS - Control Panels & Domain Management (SysAdmin)	144
158	DNS - Servers (SysAdmin)	144
159	Editors (SysAdmin)	144
160	Identity Management - LDAP (SysAdmin)	144
161	Identity Management - Single Sign-On (SSO) (SysAdmin)	144
162	Identity Management - Tools and web interfaces (SysAdmin)	144
163	IT Asset Management (SysAdmin)	144
164	Log Management (SysAdmin)	144
165	Mail Clients (SysAdmin)	144
166	Metrics & Metric Collection (SysAdmin)	144
167	Miscellaneous (SysAdmin)	144
168	Monitoring (SysAdmin)	144
169	Network Configuration Management (SysAdmin)	144
170	PaaS (SysAdmin)	144
171	Packaging (SysAdmin)	144
172	Queuing (SysAdmin)	144
173	Remote Desktop Clients (SysAdmin)	144
174	Router (SysAdmin)	144
175	Service Discovery (SysAdmin)	144
176	Software Containers (SysAdmin)	144
177	Troubleshooting (SysAdmin)	144
178	Version control (SysAdmin)	144
179	Virtualization (SysAdmin)	144
180	VPN (SysAdmin)	144
181	Web (SysAdmin)	144
182	Official Statistics Software	\N
183	Contributions	182
184	Software Patreons	\N
185	Open Source Projects	184
186	Messaging and social media	184
187	Libraries	184
194	Operating Systems (Software Patreons)	184
196	Open Source Art (Software Patreons)	184
197	Hardware related (Software Patreons)	184
198	People Doing Open Source Work (Software Patreons)	184
199	Articles and Tutorials (Software Patreons)	184
200	Videos (Software Patreons)	184
201	Podcasts (Software Patreons)	184
202	VOZ Software Collection	\N
204	Office (VOZ)	202
205	Development (APIs)	\N
206	Anime (API)	205
207	Blogging (API)	205
208	Books (API)	205
209	Business (API)	205
210	Calendar (API)	205
211	Carsharing (API)	205
212	Cloud (API)	205
213	Cloud Storage (API)	205
214	Delivery-Tracking (API)	205
215	Design (API)	205
216	Development (API)	205
218	Fitness & Wearables (API)	205
219	Food (API)	205
220	Forex & Currencies (API)	205
222	IoT (API)	205
223	Machine Learning (API)	205
224	Maps (API)	205
225	Messaging (API)	205
226	Music (API)	205
227	News & information (API)	205
228	Notes (API)	205
229	Payment (API)	205
230	Photography (API)	205
231	Places (API)	205
232	Social (API)	205
233	Shopping (API)	205
234	Takeout (API)	205
235	Teamwork (API)	205
236	Text Analysis (API)	205
237	To-dos (API)	205
238	Tourism (API)	205
239	Translation (API)	205
241	Voice Analysis (API)	205
242	Vision Analysis (API)	205
243	Weather (API)	205
244	More Resources (API)	205
245	Free Applications	\N
247	Audio Players (Free Apps)	245
248	Audio Recording (Free Apps)	245
249	DJ Software (Free Apps)	245
250	Music Notation (Free Apps)	245
251	Music Production (Free Apps)	245
252	Browsers (Free Apps)	245
254	Email Clients (Free Apps)	245
255	Compression and Archiving (Free Apps)	245
256	System Customization (Free Apps)	245
257	Wallpaper Tools (Free Apps)	245
258	Copy and Move (Free Apps)	245
261	API Development (Free Apps)	245
263	Network Analysis (Free Apps)	245
264	Game Engines (Free Apps)	245
265	Virtualization (Free Apps)	245
267	Office Suites (Free Apps)	245
268	E-book (Free Apps)	245
269	PDF Tools (Free Apps)	245
271	Text Editors (Free Apps)	245
272	Download Managers (Free Apps)	245
273	Games (Free Apps)	245
274	Cloud Gaming (Free Apps)	245
275	Mobile Emulators (Free Apps)	245
276	Other Emulators (Free Apps)	245
277	Graphics Tools (Free Apps)	245
278	3D Modeling and Animation (Free Apps)	245
279	Antivirus (Free Apps)	245
280	Password Managers (Free Apps)	245
281	Image Viewers (Free Apps)	245
282	Remote Access (Free Apps)	245
284	Video Editors (Free Apps)	245
285	Video Players (Free Apps)	245
286	Video Streaming and Recording (Free Apps)	245
287	Video Converters and Compressors (Free Apps)	245
288	VPN and Proxy Tools (Free Apps)	245
289	Utility (Free Apps)	245
290	Clipboard Management (Free Apps)	245
291	Metadata (Free Apps)	245
292	Window Management (Free Apps)	245
293	File Management (Free Apps)	245
294	Application Management (Free Apps)	245
295	Screenshot (Free Apps)	245
296	Space Visualizer (Free Apps)	245
297	Windows Software	\N
298	Audio (Windows)	297
299	Chat Clients (Windows)	297
301	Customization (Windows)	297
302	Data Recovery (Windows)	297
303	Developer Tools (Windows)	297
304	Documents (Windows)	297
308	Graphics (Windows)	297
310	IDEs (Windows)	297
311	Online Storage (Windows)	297
312	Backup (Windows)	297
313	Productivity (Windows)	297
315	Utilities (Windows)	297
318	Windows 10 Setup (Windows)	297
319	Windows 8.1 Setup (Windows)	297
\.


--
-- TOC entry 3839 (class 0 OID 25765)
-- Dependencies: 218
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_messages (id, room_id, sender_id, content, message_type, status, created_at, edited_at) FROM stdin;
1	1	1	hi	text	sent	2025-08-06 13:35:39.626204	\N
2	1	2	aosjlk	text	sent	2025-08-06 13:51:29.939536	\N
3	1	2	asdfalskdjfalsd	text	sent	2025-08-06 13:51:33.83379	\N
4	1	2	fasdfasdf	text	sent	2025-08-06 13:51:37.294607	\N
5	1	2	hi	text	sent	2025-08-07 16:07:47.616168	\N
6	1	2	asldjsdlasd	text	sent	2025-08-07 16:07:53.64132	\N
7	1	2	asdfasdf	text	sent	2025-08-07 16:07:56.570409	\N
8	1	2	asdfasdf	text	sent	2025-08-07 16:08:12.138626	\N
9	1	2	asdlfasdf	text	sent	2025-08-07 16:08:59.39734	\N
10	1	2	asdfasdf	text	sent	2025-08-07 16:09:03.651577	\N
11	1	2	asas	text	sent	2025-08-07 16:14:42.733577	\N
12	1	2	fsdfsdfsdf	text	sent	2025-08-07 16:14:45.891848	\N
13	1	2	sjjsajsa	text	sent	2025-08-07 16:28:30.384133	\N
14	1	2	alsjlkfajsfsf	text	sent	2025-08-07 16:28:35.247683	\N
15	1	2	ádfasdf	text	sent	2025-08-07 16:28:38.042537	\N
16	1	2	ádfasdf	text	sent	2025-08-07 16:28:42.099743	\N
17	1	2	jsdjsjsd	text	sent	2025-08-07 16:28:58.953225	\N
18	1	2	sjajasjsjsjas	text	sent	2025-08-07 16:33:42.50164	\N
19	1	2	âmsdmasdasd	text	sent	2025-08-07 16:33:46.923552	\N
20	1	2	ádasdasdasdas	text	sent	2025-08-07 16:33:50.524244	\N
21	1	1	jsajsjasjsa	text	sent	2025-08-07 16:34:07.276914	\N
22	1	1	sânsansannsa	text	sent	2025-08-07 16:34:11.046001	\N
23	1	1	mmmmm	text	sent	2025-08-07 16:34:17.148083	\N
24	1	1	jsjsjsjsjs	text	sent	2025-08-07 16:34:33.048257	\N
25	1	2	kskksksks	text	sent	2025-08-07 16:34:45.026971	\N
26	1	2	ssss	text	sent	2025-08-07 16:38:00.225056	\N
27	1	2	sss	text	sent	2025-08-07 16:38:04.767043	\N
28	1	1	aaaaa	text	sent	2025-08-07 16:38:46.814156	\N
29	1	1	asdfasdfasdfasdf	text	sent	2025-08-23 14:11:12.834229	\N
30	1	1	asdfasdfasdf	text	sent	2025-08-23 14:11:17.182173	\N
31	1	1	asdfasdfasdfadfasdf	text	sent	2025-08-23 14:11:20.749502	\N
32	2	1	asdfasdf	text	sent	2025-08-23 14:11:26.337142	\N
33	1	1	afsdfasdf	text	sent	2025-08-23 14:24:28.492419	\N
34	1	1	asdfasdfasdf	text	sent	2025-08-23 14:24:32.968988	\N
35	1	1	hdfghdfg hdfghdfg	text	sent	2025-08-23 14:24:36.071727	\N
36	1	1	sadfgsadfg sdfgh	text	sent	2025-08-23 14:24:38.832962	\N
37	1	1	asdfasdf	text	sent	2025-08-23 14:24:41.243396	\N
\.


--
-- TOC entry 3841 (class 0 OID 25774)
-- Dependencies: 220
-- Data for Name: chat_room_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_room_members (id, room_id, user_id, joined_at, last_read_at, is_admin) FROM stdin;
pg_dump: processing data for table "public.chat_room_members"
pg_dump: dumping contents of table "public.chat_room_members"
1	1	1	2025-08-06 13:29:46.638052	\N	f
2	1	2	2025-08-06 13:29:46.638052	\N	f
3	2	1	2025-08-23 14:11:22.644093	\N	f
4	2	3	2025-08-23 14:11:22.644093	\N	f
\.


--
-- TOC entry 3843 (class 0 OID 25780)
-- Dependencies: 222
-- Data for Name: chat_rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_rooms (id, name, type, created_by, created_at, updated_at) FROM stdin;
pg_dump: processing data for table "public.chat_rooms"
pg_dump: dumping contents of table "public.chat_rooms"
1	\N	direct	1	2025-08-06 13:29:46.600022	2025-08-06 13:29:46.600022
2	\N	direct	1	2025-08-23 14:11:22.638885	2025-08-23 14:11:22.638885
\.


--
-- TOC entry 3895 (class 0 OID 34564)
-- Dependencies: 274
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, title, description, topic, instructor, youtube_url, playlist_id, thumbnail_url, level, language, status, created_at, updated_at) FROM stdin;
pg_dump: processing data for table "public.courses"
pg_dump: dumping contents of table "public.courses"
1	Khoá học an ninh mạng của Cisco về CyberSecurity	Khóa học Security bằng tiếng Việt	Security	VQT Network	https://www.youtube.com/playlist?list=PLRSnr8eajoQyUdyywoUOvDRd9FLoovfg3	PLRSnr8eajoQyUdyywoUOvDRd9FLoovfg3	https://i.ytimg.com/vi/PLRSnr8eajoQyUdyywoUOvDRd9FLoovfg3/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.374188	2026-01-20 05:46:49.374188
2	Khóa Học Hacker Mũ Trắng Và Bảo Mật Thông Tin	Khóa học Security bằng tiếng Việt	Security	Nguyễn Thế Lợi	https://www.youtube.com/playlist?list=PLggwtzPh_8VkV50VGVpvybnnqCdgIBCVb	PLggwtzPh_8VkV50VGVpvybnnqCdgIBCVb	https://i.ytimg.com/vi/PLggwtzPh_8VkV50VGVpvybnnqCdgIBCVb/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.397016	2026-01-20 05:46:49.397016
3	Quản trị An ninh mạng Cisco CCNA Security	Khóa học Security bằng tiếng Việt	Security	Giai Phap Mang H3T	https://www.youtube.com/playlist?list=PLOBQKf6CISRQK4laM3VLug8wweoMv0iz4	PLOBQKf6CISRQK4laM3VLug8wweoMv0iz4	https://i.ytimg.com/vi/PLOBQKf6CISRQK4laM3VLug8wweoMv0iz4/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.399776	2026-01-20 05:46:49.399776
4	HỌC BẢO MẬT CÙNG CYBERJUTSU	Khóa học Security bằng tiếng Việt	Security	CyberJutsuTV	https://www.youtube.com/playlist?list=PLijX7E_0LDO-UFu2KluCfxbFZE-NS3TQ_	PLijX7E_0LDO-UFu2KluCfxbFZE-NS3TQ_	https://i.ytimg.com/vi/PLijX7E_0LDO-UFu2KluCfxbFZE-NS3TQ_/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.402125	2026-01-20 05:46:49.402125
5	AN NINH MẠNG CHO NGƯỜI MỚI	Khóa học Security bằng tiếng Việt	Security	Cybersecurity	https://www.youtube.com/playlist?list=PLLHcUwF4MJE2nZhxQtXCk2bpYi4ZtCZIg	PLLHcUwF4MJE2nZhxQtXCk2bpYi4ZtCZIg	https://i.ytimg.com/vi/PLLHcUwF4MJE2nZhxQtXCk2bpYi4ZtCZIg/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.404066	2026-01-20 05:46:49.404066
6	Quản trị mạng máy tính Cisco CCNA	Khóa học Security bằng tiếng Việt	Security	An ninh mạng	https://www.youtube.com/playlist?list=PLFJBtgskuhZYoOqwnRNLbUvFadA6ApqjH	PLFJBtgskuhZYoOqwnRNLbUvFadA6ApqjH	https://i.ytimg.com/vi/PLFJBtgskuhZYoOqwnRNLbUvFadA6ApqjH/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.406123	2026-01-20 05:46:49.406123
7	Cyber Security	Khóa học Security bằng tiếng Việt	Security	Cybersecurity	https://www.youtube.com/playlist?list=PLLHcUwF4MJE1xHr5tuBvyLUxu09dGInRm	PLLHcUwF4MJE1xHr5tuBvyLUxu09dGInRm	https://i.ytimg.com/vi/PLLHcUwF4MJE1xHr5tuBvyLUxu09dGInRm/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.407738	2026-01-20 05:46:49.407738
8	Khóa Học Hacker Mũ Trắng-AEH	Khóa học Security bằng tiếng Việt	Security	Trung Tam Athena	https://www.youtube.com/playlist?list=PLSzZlHir9jJSSygXLtqkhPQNIYkYqGTAU	PLSzZlHir9jJSSygXLtqkhPQNIYkYqGTAU	https://i.ytimg.com/vi/PLSzZlHir9jJSSygXLtqkhPQNIYkYqGTAU/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.408923	2026-01-20 05:46:49.408923
9	NHẬP MÔN AN TOÀN THÔNG TIN	Khóa học Security bằng tiếng Việt	Security	CyberJutsuTV	https://www.youtube.com/playlist?list=PLijX7E_0LDO_-v_UhGNujj_NBTysTwzkC	PLijX7E_0LDO_-v_UhGNujj_NBTysTwzkC	https://i.ytimg.com/vi/PLijX7E_0LDO_-v_UhGNujj_NBTysTwzkC/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.412069	2026-01-20 05:46:49.412069
10	OWASP Top 10 Vulnerabilities	Khóa học Security bằng tiếng Việt	Security	Cookie Han Hoan	https://www.youtube.com/playlist?list=PLu9yx0lLtsRiaeIQ-yn0huBD3YKgJ6wzC	PLu9yx0lLtsRiaeIQ-yn0huBD3YKgJ6wzC	https://i.ytimg.com/vi/PLu9yx0lLtsRiaeIQ-yn0huBD3YKgJ6wzC/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.415073	2026-01-20 05:46:49.415073
11	Introduction to Web Application Security	Khóa học Security bằng tiếng Việt	Security	Cookie Han Hoan	https://www.youtube.com/playlist?list=PLu9yx0lLtsRiWkLUlOyQg-U4Gu0VTPMe_	PLu9yx0lLtsRiWkLUlOyQg-U4Gu0VTPMe_	https://i.ytimg.com/vi/PLu9yx0lLtsRiWkLUlOyQg-U4Gu0VTPMe_/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.416796	2026-01-20 05:46:49.416796
12	Web Hacking Techniques	Khóa học Security bằng tiếng Việt	Security	Cookie Han Hoan	https://www.youtube.com/playlist?list=PLu9yx0lLtsRi3rG11n0fl0H_-3jkSBZk3	PLu9yx0lLtsRi3rG11n0fl0H_-3jkSBZk3	https://i.ytimg.com/vi/PLu9yx0lLtsRi3rG11n0fl0H_-3jkSBZk3/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.417811	2026-01-20 05:46:49.417811
13	Giải thích lỗ hổng Web phổ biến và cách khai thác	Khóa học Security bằng tiếng Việt	Security	Cookie Han Hoan	https://www.youtube.com/playlist?list=PLu9yx0lLtsRhWd2ZQsaM881HXbxZ0dgkS	PLu9yx0lLtsRhWd2ZQsaM881HXbxZ0dgkS	https://i.ytimg.com/vi/PLu9yx0lLtsRhWd2ZQsaM881HXbxZ0dgkS/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.424057	2026-01-20 05:46:49.424057
14	Hướng dẫn Bug Bounty cho người mới	Khóa học Security bằng tiếng Việt	Security	Cookie Han Hoan	https://www.youtube.com/playlist?list=PLu9yx0lLtsRgpVspJJeZ_CfcsDY-onsCo	PLu9yx0lLtsRgpVspJJeZ_CfcsDY-onsCo	https://i.ytimg.com/vi/PLu9yx0lLtsRgpVspJJeZ_CfcsDY-onsCo/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.425429	2026-01-20 05:46:49.425429
15	Tìm kiếm lỗ hổng Web	Khóa học Security bằng tiếng Việt	Security	Cookie Han Hoan	https://www.youtube.com/playlist?list=PLu9yx0lLtsRhM3QN-R6tzMbLr7gBmD6c-	PLu9yx0lLtsRhM3QN-R6tzMbLr7gBmD6c-	https://i.ytimg.com/vi/PLu9yx0lLtsRhM3QN-R6tzMbLr7gBmD6c-/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.426425	2026-01-20 05:46:49.426425
16	Lập trình C# cơ bản	Khóa học C# bằng tiếng Việt	C#	K team	https://www.youtube.com/playlist?list=PL33lvabfss1wUj15ea6W0A-TtDOrWWSRK	PL33lvabfss1wUj15ea6W0A-TtDOrWWSRK	https://i.ytimg.com/vi/PL33lvabfss1wUj15ea6W0A-TtDOrWWSRK/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.427919	2026-01-20 05:46:49.427919
17	Học Lập Trình C# Cơ Bản	Khóa học C# bằng tiếng Việt	C#	thân triệu	https://www.youtube.com/playlist?list=PLE1qPKuGSJaANYwZJweIuzceWHCJI8mnE	PLE1qPKuGSJaANYwZJweIuzceWHCJI8mnE	https://i.ytimg.com/vi/PLE1qPKuGSJaANYwZJweIuzceWHCJI8mnE/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.42882	2026-01-20 05:46:49.42882
18	LẬP TRÌNH C#	Khóa học C# bằng tiếng Việt	C#	XuanThuLab	https://www.youtube.com/playlist?list=PLwJr0JSP7i8BERdErX9Ird67xTflZkxb-	PLwJr0JSP7i8BERdErX9Ird67xTflZkxb-	https://i.ytimg.com/vi/PLwJr0JSP7i8BERdErX9Ird67xTflZkxb-/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.429633	2026-01-20 05:46:49.429633
19	Khóa học lập trình C# nâng cao	Khóa học C# bằng tiếng Việt	C#	K team	https://www.youtube.com/playlist?list=PL33lvabfss1y5jmklzilr2W2LZiltk6bU	PL33lvabfss1y5jmklzilr2W2LZiltk6bU	https://i.ytimg.com/vi/PL33lvabfss1y5jmklzilr2W2LZiltk6bU/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.430576	2026-01-20 05:46:49.430576
20	Lập trình WPF cơ bản	Khóa học C# bằng tiếng Việt	C#	K team	https://www.youtube.com/playlist?list=PL33lvabfss1ywgHcDF2aB8YBxwtj1_Rjk	PL33lvabfss1ywgHcDF2aB8YBxwtj1_Rjk	https://i.ytimg.com/vi/PL33lvabfss1ywgHcDF2aB8YBxwtj1_Rjk/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.431487	2026-01-20 05:46:49.431487
21	Lập trình C# Winform cơ bản	Khóa học C# bằng tiếng Việt	C#	K team	https://www.youtube.com/playlist?list=PL33lvabfss1y2T7yK--YZJHCsU7LZVzBS	PL33lvabfss1y2T7yK--YZJHCsU7LZVzBS	https://i.ytimg.com/vi/PL33lvabfss1y2T7yK--YZJHCsU7LZVzBS/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.433091	2026-01-20 05:46:49.433091
22	Lập trình game Caro với C# Winform	Khóa học C# bằng tiếng Việt	C#	K team	https://www.youtube.com/playlist?list=PL33lvabfss1yCEzvLavt8jD4daqpejzwN	PL33lvabfss1yCEzvLavt8jD4daqpejzwN	https://i.ytimg.com/vi/PL33lvabfss1yCEzvLavt8jD4daqpejzwN/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.433974	2026-01-20 05:46:49.433974
23	Lập trình hướng đối tượng trong C#	Khóa học C# bằng tiếng Việt	C#	K team	https://www.youtube.com/playlist?list=PL33lvabfss1zRgaWBcC__Bnt5AOSRfU71	PL33lvabfss1zRgaWBcC__Bnt5AOSRfU71	https://i.ytimg.com/vi/PL33lvabfss1zRgaWBcC__Bnt5AOSRfU71/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.435505	2026-01-20 05:46:49.435505
24	Lập trình Key logger với C# Console Application	Khóa học C# bằng tiếng Việt	C#	K team	https://www.youtube.com/playlist?list=PL33lvabfss1xfA6027EDgEqUp79XRft5I	PL33lvabfss1xfA6027EDgEqUp79XRft5I	https://i.ytimg.com/vi/PL33lvabfss1xfA6027EDgEqUp79XRft5I/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.43633	2026-01-20 05:46:49.43633
25	Lập trình phần mềm Quản lý quán cafe C# Winform	Khóa học C# bằng tiếng Việt	C#	K team	https://www.youtube.com/playlist?list=PL33lvabfss1xnPhBJHjM0A8TEBBcGCTsf	PL33lvabfss1xnPhBJHjM0A8TEBBcGCTsf	https://i.ytimg.com/vi/PL33lvabfss1xnPhBJHjM0A8TEBBcGCTsf/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.437512	2026-01-20 05:46:49.437512
26	Lập trình Selenium với C#	Khóa học C# bằng tiếng Việt	C#	K team	https://www.youtube.com/playlist?list=PL33lvabfss1ys_UxBqlKvdm6mVs1sL9T2	PL33lvabfss1ys_UxBqlKvdm6mVs1sL9T2	https://i.ytimg.com/vi/PL33lvabfss1ys_UxBqlKvdm6mVs1sL9T2/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.4387	2026-01-20 05:46:49.4387
27	Lập trình ứng dụng Lập Lịch với C# Winform	Khóa học C# bằng tiếng Việt	C#	K team	https://www.youtube.com/playlist?list=PL33lvabfss1zfGzpSGQN7CUoHKS6OQbJc	PL33lvabfss1zfGzpSGQN7CUoHKS6OQbJc	https://i.ytimg.com/vi/PL33lvabfss1zfGzpSGQN7CUoHKS6OQbJc/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.439674	2026-01-20 05:46:49.439674
28	HttpRequest - Crawl data từ website	Khóa học C# bằng tiếng Việt	C#	K team	https://www.youtube.com/playlist?list=PL33lvabfss1w4-G4wujhFVZGTlFkooCck	PL33lvabfss1w4-G4wujhFVZGTlFkooCck	https://i.ytimg.com/vi/PL33lvabfss1w4-G4wujhFVZGTlFkooCck/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.440548	2026-01-20 05:46:49.440548
29	Hướng dẫn code Game Server Basic & Game Client	Khóa học C# bằng tiếng Việt	C#	Code Phủi	https://www.youtube.com/playlist?list=PLm5N2Ku5IP9eZPS20m8AEpdzYNB-lQ7Dp	PLm5N2Ku5IP9eZPS20m8AEpdzYNB-lQ7Dp	https://i.ytimg.com/vi/PLm5N2Ku5IP9eZPS20m8AEpdzYNB-lQ7Dp/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.441279	2026-01-20 05:46:49.441279
30	Lập trình java | Tự học java siêu tốc	Khóa học Java bằng tiếng Việt	Java	Gà Lại Lập Trình	https://www.youtube.com/playlist?list=PLPt6-BtUI22rxpe6PZc5H6XAgPusA6fDQ	PLPt6-BtUI22rxpe6PZc5H6XAgPusA6fDQ	https://i.ytimg.com/vi/PLPt6-BtUI22rxpe6PZc5H6XAgPusA6fDQ/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.442041	2026-01-20 05:46:49.442041
31	Tự Học Java Core Từ A tới Z Dành cho Beginners	Khóa học Java bằng tiếng Việt	Java	Hỏi Dân IT	https://www.youtube.com/playlist?list=PLncHg6Kn2JT5EVkhKoJmzOytHY39Mrf_o	PLncHg6Kn2JT5EVkhKoJmzOytHY39Mrf_o	https://i.ytimg.com/vi/PLncHg6Kn2JT5EVkhKoJmzOytHY39Mrf_o/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.442725	2026-01-20 05:46:49.442725
32	Lập trình Java	Khóa học Java bằng tiếng Việt	Java	TITV	https://www.youtube.com/playlist?list=PLyxSzL3F748401hWFgJ8gKMnN6MM8QQ7F	PLyxSzL3F748401hWFgJ8gKMnN6MM8QQ7F	https://i.ytimg.com/vi/PLyxSzL3F748401hWFgJ8gKMnN6MM8QQ7F/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.443563	2026-01-20 05:46:49.443563
33	Khóa học lập trình Java cơ bản đến hướng đối tượng	Khóa học Java bằng tiếng Việt	Java	K team	https://www.youtube.com/playlist?list=PL33lvabfss1yGrOutFR03OZoqm91TSsvs	PL33lvabfss1yGrOutFR03OZoqm91TSsvs	https://i.ytimg.com/vi/PL33lvabfss1yGrOutFR03OZoqm91TSsvs/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.44432	2026-01-20 05:46:49.44432
34	Tự học Lập trình JAVA	Khóa học Java bằng tiếng Việt	Java	ZendVN	https://www.youtube.com/playlist?list=PLv6GftO355Av6u60DTCvrUe6aXror_bdE	PLv6GftO355Av6u60DTCvrUe6aXror_bdE	https://i.ytimg.com/vi/PLv6GftO355Av6u60DTCvrUe6aXror_bdE/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.445038	2026-01-20 05:46:49.445038
35	Học Lập trình Java với Netbeans IDE	Khóa học Java bằng tiếng Việt	Java	thân triệu	https://www.youtube.com/playlist?list=PLE1qPKuGSJaA6-6So-knCgNNq3vNbCRD6	PLE1qPKuGSJaA6-6So-knCgNNq3vNbCRD6	https://i.ytimg.com/vi/PLE1qPKuGSJaA6-6So-knCgNNq3vNbCRD6/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.446065	2026-01-20 05:46:49.446065
36	Khóa học Java Web Servlet/Jsp	Khóa học Java bằng tiếng Việt	Java	JMaster IO	https://www.youtube.com/playlist?list=PLsfLgp1K1xQ53rzo7vo2dKamBu0bj7lkv	PLsfLgp1K1xQ53rzo7vo2dKamBu0bj7lkv	https://i.ytimg.com/vi/PLsfLgp1K1xQ53rzo7vo2dKamBu0bj7lkv/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.446794	2026-01-20 05:46:49.446794
37	Khóa học lập trình Java Spring boot 3 miễn phí cho người mới (2024)	Khóa học Java bằng tiếng Việt	Java	Devteria	https://www.youtube.com/playlist?list=PL2xsxmVse9IaxzE8Mght4CFltGOqcG6FC	PL2xsxmVse9IaxzE8Mght4CFltGOqcG6FC	https://i.ytimg.com/vi/PL2xsxmVse9IaxzE8Mght4CFltGOqcG6FC/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.447479	2026-01-20 05:46:49.447479
38	Khóa học Java Core	Khóa học Java bằng tiếng Việt	Java	Lê Vũ Nguyên Vlog	https://www.youtube.com/playlist?list=PLmGP0M1IXtjXnqg-GdVmLZcinnt6aXvW3	PLmGP0M1IXtjXnqg-GdVmLZcinnt6aXvW3	https://i.ytimg.com/vi/PLmGP0M1IXtjXnqg-GdVmLZcinnt6aXvW3/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.448234	2026-01-20 05:46:49.448234
39	Khóa Học Java Cơ Bản	Khóa học Java bằng tiếng Việt	Java	JMaster IO	https://www.youtube.com/playlist?list=PLsfLgp1K1xQ4ukX-Y7w5i76eJkApL641w	PLsfLgp1K1xQ4ukX-Y7w5i76eJkApL641w	https://i.ytimg.com/vi/PLsfLgp1K1xQ4ukX-Y7w5i76eJkApL641w/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.449562	2026-01-20 05:46:49.449562
40	Khóa học Java Nâng Cao (Java EE)	Khóa học Java bằng tiếng Việt	Java	JMaster IO	https://www.youtube.com/playlist?list=PLsfLgp1K1xQ51TV6pCyS9yNQvstVk_le_	PLsfLgp1K1xQ51TV6pCyS9yNQvstVk_le_	https://i.ytimg.com/vi/PLsfLgp1K1xQ51TV6pCyS9yNQvstVk_le_/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.450396	2026-01-20 05:46:49.450396
41	Tự học Java cho người mới bắt đầu 2025	Khóa học Java bằng tiếng Việt	Java	Tập Làm Mentor	https://www.youtube.com/playlist?list=PLAv1wIkQKlEt3RIZuS50MKOZwxLrSyR-c	PLAv1wIkQKlEt3RIZuS50MKOZwxLrSyR-c	https://i.ytimg.com/vi/PLAv1wIkQKlEt3RIZuS50MKOZwxLrSyR-c/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.451175	2026-01-20 05:46:49.451175
42	Khoá Học Java Nâng Cao	Khóa học Java bằng tiếng Việt	Java	Trần Văn Điệp Official	https://www.youtube.com/playlist?list=PLMPBVRu4TjAxXA5KuqKFU7gwGiucyif_r	PLMPBVRu4TjAxXA5KuqKFU7gwGiucyif_r	https://i.ytimg.com/vi/PLMPBVRu4TjAxXA5KuqKFU7gwGiucyif_r/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.451846	2026-01-20 05:46:49.451846
43	Khóa học lập trình Backend Java Spring(28tech)	Khóa học Java bằng tiếng Việt	Java	khangmoihocit	https://www.youtube.com/playlist?list=PLPCCr-MyxGncORR0AX73cVlz_WGQhKn4e	PLPCCr-MyxGncORR0AX73cVlz_WGQhKn4e	https://i.ytimg.com/vi/PLPCCr-MyxGncORR0AX73cVlz_WGQhKn4e/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.452523	2026-01-20 05:46:49.452523
44	Ngôn Ngữ Lập Trình C	Khóa học C bằng tiếng Việt	C	28tech	https://www.youtube.com/playlist?list=PLux-_phi0Rz2TB5D16sJzy3MgOht3IlND	PLux-_phi0Rz2TB5D16sJzy3MgOht3IlND	https://i.ytimg.com/vi/PLux-_phi0Rz2TB5D16sJzy3MgOht3IlND/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.453175	2026-01-20 05:46:49.453175
45	Lập trình C	Khóa học C bằng tiếng Việt	C	TITV	https://www.youtube.com/playlist?list=PLyxSzL3F7487Nh-ib25lcLEzhL5mgZkFJ	PLyxSzL3F7487Nh-ib25lcLEzhL5mgZkFJ	https://i.ytimg.com/vi/PLyxSzL3F7487Nh-ib25lcLEzhL5mgZkFJ/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.453816	2026-01-20 05:46:49.453816
46	Học lập trình C	Khóa học C bằng tiếng Việt	C	thân triệu	https://www.youtube.com/playlist?list=PLE1qPKuGSJaBq4VFzTYrhzCiPvCoI8JDv	PLE1qPKuGSJaBq4VFzTYrhzCiPvCoI8JDv	https://i.ytimg.com/vi/PLE1qPKuGSJaBq4VFzTYrhzCiPvCoI8JDv/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.454503	2026-01-20 05:46:49.454503
47	Ngôn Ngữ Lập Trình C	Khóa học C bằng tiếng Việt	C	Dạy Nhau Học	https://www.youtube.com/playlist?list=PLyiioioEJSxHr5X8RNY3QXUGcjzeZeI7l	PLyiioioEJSxHr5X8RNY3QXUGcjzeZeI7l	https://i.ytimg.com/vi/PLyiioioEJSxHr5X8RNY3QXUGcjzeZeI7l/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.455146	2026-01-20 05:46:49.455146
48	Lập trình C cho người mới bắt đầu học lập trình	Khóa học C bằng tiếng Việt	C	Học Công Nghệ	https://www.youtube.com/playlist?list=PLzQuu4-Qxlh7lfDpA2lhuBHMNMskLE2QZ	PLzQuu4-Qxlh7lfDpA2lhuBHMNMskLE2QZ	https://i.ytimg.com/vi/PLzQuu4-Qxlh7lfDpA2lhuBHMNMskLE2QZ/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.455844	2026-01-20 05:46:49.455844
49	Học lập trình C cơ bản	Khóa học C bằng tiếng Việt	C	Son Nguyen	https://www.youtube.com/playlist?list=PLZEIt444jqpAEl0D3W17WDS3ZtGbHIxF3	PLZEIt444jqpAEl0D3W17WDS3ZtGbHIxF3	https://i.ytimg.com/vi/PLZEIt444jqpAEl0D3W17WDS3ZtGbHIxF3/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.456465	2026-01-20 05:46:49.456465
50	Nhập môn lập trình C cơ bản	Khóa học C bằng tiếng Việt	C	Đỗ Phúc Hảo	https://www.youtube.com/playlist?list=PLQj93CJe0N72nRYDYEdVpV3ZzGHMJvgqt	PLQj93CJe0N72nRYDYEdVpV3ZzGHMJvgqt	https://i.ytimg.com/vi/PLQj93CJe0N72nRYDYEdVpV3ZzGHMJvgqt/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.457094	2026-01-20 05:46:49.457094
51	Lập Trình C | Xâu Ký Tự | Chuỗi	Khóa học C bằng tiếng Việt	C	28tech	https://www.youtube.com/playlist?list=PLux-_phi0Rz3XyMk0JHqeN2DM69XDAyyo	PLux-_phi0Rz3XyMk0JHqeN2DM69XDAyyo	https://i.ytimg.com/vi/PLux-_phi0Rz3XyMk0JHqeN2DM69XDAyyo/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.457988	2026-01-20 05:46:49.457988
52	Ngôn ngữ lập trình C-GV. Nguyễn Văn Phúc	Khóa học C bằng tiếng Việt	C	CCE- eLEARN	https://www.youtube.com/playlist?list=PLdgLBTCcFWkfWhf3qSPX-pNGyLOj8IA3w	PLdgLBTCcFWkfWhf3qSPX-pNGyLOj8IA3w	https://i.ytimg.com/vi/PLdgLBTCcFWkfWhf3qSPX-pNGyLOj8IA3w/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.458983	2026-01-20 05:46:49.458983
53	Ngôn Ngữ Lập Trình C |IUH	Khóa học C bằng tiếng Việt	C	Jerry Thắng	https://www.youtube.com/playlist?list=PLOWHQCkFdTueoPoil-FTma3-q-_uxsvhR	PLOWHQCkFdTueoPoil-FTma3-q-_uxsvhR	https://i.ytimg.com/vi/PLOWHQCkFdTueoPoil-FTma3-q-_uxsvhR/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.459594	2026-01-20 05:46:49.459594
54	Học lập trình C cho người mới bắt đầu (2019)	Khóa học C bằng tiếng Việt	C	Lập Trình Không Khó	https://www.youtube.com/playlist?list=PLh91SaQgRYnpj1GqVmVMq4acSAHtSKKwR	PLh91SaQgRYnpj1GqVmVMq4acSAHtSKKwR	https://i.ytimg.com/vi/PLh91SaQgRYnpj1GqVmVMq4acSAHtSKKwR/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.460457	2026-01-20 05:46:49.460457
55	Lập Trình C Từ Cơ Bản Đến Nâng Cao	Khóa học C bằng tiếng Việt	C	Full House	https://www.youtube.com/playlist?list=PL6h8VcmH2PuJzGN8UFhMAoAsPcHg2uepd	PL6h8VcmH2PuJzGN8UFhMAoAsPcHg2uepd	https://i.ytimg.com/vi/PL6h8VcmH2PuJzGN8UFhMAoAsPcHg2uepd/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.46111	2026-01-20 05:46:49.46111
56	Nhập môn LẬP TRÌNH CĂN BẢN với C	Khóa học C bằng tiếng Việt	C	giáo.làng	https://www.youtube.com/playlist?list=PLayYhLZuuO9t9F8tIKR5RE7HQbDwNtnSV	PLayYhLZuuO9t9F8tIKR5RE7HQbDwNtnSV	https://i.ytimg.com/vi/PLayYhLZuuO9t9F8tIKR5RE7HQbDwNtnSV/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.461744	2026-01-20 05:46:49.461744
57	LẬP TRÌNH C++ TỪ CƠ BẢN ĐẾN NÂNG CAO	Khóa học C++ bằng tiếng Việt	C++	Tờ Mờ Sáng học Lập trình	https://www.youtube.com/playlist?list=PLqfkD788zZGCmOyQaymJv4G-au94QqBLj	PLqfkD788zZGCmOyQaymJv4G-au94QqBLj	https://i.ytimg.com/vi/PLqfkD788zZGCmOyQaymJv4G-au94QqBLj/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.462471	2026-01-20 05:46:49.462471
58	Lập trình C++ cơ bản 2023 | Tự học lập trình C++ siêu dễ hiểu cho người mới	Khóa học C++ bằng tiếng Việt	C++	Gà Lại Lập Trình	https://www.youtube.com/playlist?list=PLPt6-BtUI22rZ-lB276VBY85mUNeIFJf5	PLPt6-BtUI22rZ-lB276VBY85mUNeIFJf5	https://i.ytimg.com/vi/PLPt6-BtUI22rZ-lB276VBY85mUNeIFJf5/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.463177	2026-01-20 05:46:49.463177
59	Ngôn Ngữ Lập trình C++	Khóa học C++ bằng tiếng Việt	C++	28tech	https://www.youtube.com/playlist?list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79	PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79	https://i.ytimg.com/vi/PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.463836	2026-01-20 05:46:49.463836
60	Lập trình C++ từ cơ bản tới nâng cao	Khóa học C++ bằng tiếng Việt	C++	F8 Official	https://www.youtube.com/playlist?list=PL_-VfJajZj0Uo72G_6tSY4NRLpmffeXSA	PL_-VfJajZj0Uo72G_6tSY4NRLpmffeXSA	https://i.ytimg.com/vi/PL_-VfJajZj0Uo72G_6tSY4NRLpmffeXSA/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.4644	2026-01-20 05:46:49.4644
61	Lập trình C++ cơ bản - HowKteam	Khóa học C++ bằng tiếng Việt	C++	K team	https://www.youtube.com/playlist?list=PL33lvabfss1xagFyyQPRcppjFKMQ7lvJM	PL33lvabfss1xagFyyQPRcppjFKMQ7lvJM	https://i.ytimg.com/vi/PL33lvabfss1xagFyyQPRcppjFKMQ7lvJM/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.465195	2026-01-20 05:46:49.465195
62	Học C++ cơ bản | Học lập trình C++ cơ bản	Khóa học C++ bằng tiếng Việt	C++	Son Nguyen	https://www.youtube.com/playlist?list=PLZEIt444jqpD6NUtMg5X6Y3T4lYqcudO9	PLZEIt444jqpD6NUtMg5X6Y3T4lYqcudO9	https://i.ytimg.com/vi/PLZEIt444jqpD6NUtMg5X6Y3T4lYqcudO9/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.465859	2026-01-20 05:46:49.465859
63	Học lập trình C++ (CŨ Cmnr)	Khóa học C++ bằng tiếng Việt	C++	thân triệu	https://www.youtube.com/playlist?list=PLE1qPKuGSJaB3x2P8vAob9V1BIEp9VYwp	PLE1qPKuGSJaB3x2P8vAob9V1BIEp9VYwp	https://i.ytimg.com/vi/PLE1qPKuGSJaB3x2P8vAob9V1BIEp9VYwp/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.466532	2026-01-20 05:46:49.466532
64	Học lập trình C++ cho người mới bắt đầu	Khóa học C++ bằng tiếng Việt	C++	Lập Trình Không Khó	https://www.youtube.com/playlist?list=PLh91SaQgRYnp-NC3WnFDMWQV40a6m61Hr	PLh91SaQgRYnp-NC3WnFDMWQV40a6m61Hr	https://i.ytimg.com/vi/PLh91SaQgRYnp-NC3WnFDMWQV40a6m61Hr/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.467438	2026-01-20 05:46:49.467438
65	Khóa học Lập trình C++ từ cơ bản đến nâng cao	Khóa học C++ bằng tiếng Việt	C++	Học Công Nghệ	https://www.youtube.com/playlist?list=PLzQuu4-Qxlh6xm5_uswCkfkudKs00dsNK	PLzQuu4-Qxlh6xm5_uswCkfkudKs00dsNK	https://i.ytimg.com/vi/PLzQuu4-Qxlh6xm5_uswCkfkudKs00dsNK/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.468081	2026-01-20 05:46:49.468081
66	Lập trình căn bản C/C++	Khóa học C++ bằng tiếng Việt	C++	Thien Tam Nguyen	https://www.youtube.com/playlist?list=PLimFJKGsbn1lG2-vNW57FyESDlT-_F2QQ	PLimFJKGsbn1lG2-vNW57FyESDlT-_F2QQ	https://i.ytimg.com/vi/PLimFJKGsbn1lG2-vNW57FyESDlT-_F2QQ/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.469255	2026-01-20 05:46:49.469255
67	Lập Trình Game C++ SDL	Khóa học C++ bằng tiếng Việt	C++	Phát Triển Phần Mềm 123A-Z	https://www.youtube.com/playlist?list=PLR7NDiX0QsfQQ2iFXsXepwH46wf3D4Y4C	PLR7NDiX0QsfQQ2iFXsXepwH46wf3D4Y4C	https://i.ytimg.com/vi/PLR7NDiX0QsfQQ2iFXsXepwH46wf3D4Y4C/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.470024	2026-01-20 05:46:49.470024
68	Lập trình C++ từ cơ bản tới nâng cao	Khóa học C++ bằng tiếng Việt	C++	Minh Quang	https://www.youtube.com/playlist?list=PLjnaYcKy3HzOq4SkNVvXQ1FaXk9QlEkaq	PLjnaYcKy3HzOq4SkNVvXQ1FaXk9QlEkaq	https://i.ytimg.com/vi/PLjnaYcKy3HzOq4SkNVvXQ1FaXk9QlEkaq/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.470733	2026-01-20 05:46:49.470733
69	Khoá học lập trình C++ từ cơ bản đến nâng cao	Khóa học C++ bằng tiếng Việt	C++	thân triệu	https://www.youtube.com/playlist?list=PLE1qPKuGSJaD7sejCSC8ivSueeesNFyov	PLE1qPKuGSJaD7sejCSC8ivSueeesNFyov	https://i.ytimg.com/vi/PLE1qPKuGSJaD7sejCSC8ivSueeesNFyov/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.471325	2026-01-20 05:46:49.471325
70	Lập Trình Game 2D Trên Unity3D - Kiến Thức Căn Bản	Khóa học Unity bằng tiếng Việt	Unity	U DEV	https://www.youtube.com/playlist?list=PLl-dkipSQUGcQQgvh9j8a75Sz4zx9vWo8	PLl-dkipSQUGcQQgvh9j8a75Sz4zx9vWo8	https://i.ytimg.com/vi/PLl-dkipSQUGcQQgvh9j8a75Sz4zx9vWo8/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.471977	2026-01-20 05:46:49.471977
71	Free Unity - Zitga	Khóa học Unity bằng tiếng Việt	Unity	Unity3d Việt Nam	https://www.youtube.com/playlist?list=PLE5Rxh1l0Qs5zorOJMa777FzSYoTNreJH	PLE5Rxh1l0Qs5zorOJMa777FzSYoTNreJH	https://i.ytimg.com/vi/PLE5Rxh1l0Qs5zorOJMa777FzSYoTNreJH/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.472563	2026-01-20 05:46:49.472563
72	Unity Azure Cloud Game	Khóa học Unity bằng tiếng Việt	Unity	Coding Reshape Future	https://www.youtube.com/playlist?list=PLRz-2ltlXLUKYiFcSG1ME0G5-ukGCHtc_	PLRz-2ltlXLUKYiFcSG1ME0G5-ukGCHtc_	https://i.ytimg.com/vi/PLRz-2ltlXLUKYiFcSG1ME0G5-ukGCHtc_/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.473212	2026-01-20 05:46:49.473212
73	Khóa học lập trình Game Unity	Khóa học Unity bằng tiếng Việt	Unity	CodeGym	https://www.youtube.com/playlist?list=PL4voWW1tQT6qfAR8XTD6VcYglb8Kvdw5F	PL4voWW1tQT6qfAR8XTD6VcYglb8Kvdw5F	https://i.ytimg.com/vi/PL4voWW1tQT6qfAR8XTD6VcYglb8Kvdw5F/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.473823	2026-01-20 05:46:49.473823
74	Học làm game 2D trên Unity	Khóa học Unity bằng tiếng Việt	Unity	Tech Lap	https://www.youtube.com/playlist?list=PLw2nfWzUTIAkZGD8r2jPjVw-sSCIIV1wa	PLw2nfWzUTIAkZGD8r2jPjVw-sSCIIV1wa	https://i.ytimg.com/vi/PLw2nfWzUTIAkZGD8r2jPjVw-sSCIIV1wa/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.474439	2026-01-20 05:46:49.474439
75	Unity 3D	Khóa học Unity bằng tiếng Việt	Unity	K team	https://www.youtube.com/playlist?list=PL33lvabfss1wO1v5j9J5PHsbkQRlmo7KD	PL33lvabfss1wO1v5j9J5PHsbkQRlmo7KD	https://i.ytimg.com/vi/PL33lvabfss1wO1v5j9J5PHsbkQRlmo7KD/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.475036	2026-01-20 05:46:49.475036
76	C0: Cơ bản Unity C#	Khóa học Unity bằng tiếng Việt	Unity	Sai Game	https://www.youtube.com/playlist?list=PL9YFzEkTXjbMlVFT3AtHiaARHoZgAP8sm	PL9YFzEkTXjbMlVFT3AtHiaARHoZgAP8sm	https://i.ytimg.com/vi/PL9YFzEkTXjbMlVFT3AtHiaARHoZgAP8sm/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.47566	2026-01-20 05:46:49.47566
77	C2: Cơ bản Unity 3D	Khóa học Unity bằng tiếng Việt	Unity	Sai Game	https://www.youtube.com/playlist?list=PL9YFzEkTXjbM7gq3QVkb5rC4dO8JdIsdj	PL9YFzEkTXjbM7gq3QVkb5rC4dO8JdIsdj	https://i.ytimg.com/vi/PL9YFzEkTXjbM7gq3QVkb5rC4dO8JdIsdj/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.476298	2026-01-20 05:46:49.476298
78	C3: Học Làm Game Unity2D	Khóa học Unity bằng tiếng Việt	Unity	Sai Game	https://www.youtube.com/playlist?list=PL9YFzEkTXjbOUFE0wCrSa4SAjJN7Nz6yq	PL9YFzEkTXjbOUFE0wCrSa4SAjJN7Nz6yq	https://i.ytimg.com/vi/PL9YFzEkTXjbOUFE0wCrSa4SAjJN7Nz6yq/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.477046	2026-01-20 05:46:49.477046
79	C4 - Cơ bản Unity 3D C#	Khóa học Unity bằng tiếng Việt	Unity	Sai Game	https://www.youtube.com/playlist?list=PL9YFzEkTXjbNa2vGgWFCBkNaNCzAFRSQ1	PL9YFzEkTXjbNa2vGgWFCBkNaNCzAFRSQ1	https://i.ytimg.com/vi/PL9YFzEkTXjbNa2vGgWFCBkNaNCzAFRSQ1/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.477965	2026-01-20 05:46:49.477965
80	G1: Hướng Dẫn Unity 3D - City Building	Khóa học Unity bằng tiếng Việt	Unity	Sai Game	https://www.youtube.com/playlist?list=PL9YFzEkTXjbPJLYHlMQ4oxrqdXYVc8t9G	PL9YFzEkTXjbPJLYHlMQ4oxrqdXYVc8t9G	https://i.ytimg.com/vi/PL9YFzEkTXjbPJLYHlMQ4oxrqdXYVc8t9G/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.47857	2026-01-20 05:46:49.47857
81	G2: Cách làm Game 2D và Tower Defense	Khóa học Unity bằng tiếng Việt	Unity	Sai Game	https://www.youtube.com/playlist?list=PL9YFzEkTXjbMkbjtjdxHFySO5rhPN1uMx	PL9YFzEkTXjbMkbjtjdxHFySO5rhPN1uMx	https://i.ytimg.com/vi/PL9YFzEkTXjbMkbjtjdxHFySO5rhPN1uMx/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.479205	2026-01-20 05:46:49.479205
82	G3: Cách làm game thẻ bài - Game Card	Khóa học Unity bằng tiếng Việt	Unity	Sai Game	https://www.youtube.com/playlist?list=PL9YFzEkTXjbP7XXmElG-bRc5R84Hxifes	PL9YFzEkTXjbP7XXmElG-bRc5R84Hxifes	https://i.ytimg.com/vi/PL9YFzEkTXjbP7XXmElG-bRc5R84Hxifes/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.479773	2026-01-20 05:46:49.479773
83	Javascript Cơ Bản	Khóa học JavaScript bằng tiếng Việt	JavaScript	F8 Official	https://www.youtube.com/playlist?list=PL_-VfJajZj0VgpFpEVFzS5Z-lkXtBe-x5	PL_-VfJajZj0VgpFpEVFzS5Z-lkXtBe-x5	https://i.ytimg.com/vi/PL_-VfJajZj0VgpFpEVFzS5Z-lkXtBe-x5/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.480412	2026-01-20 05:46:49.480412
84	JavaScript siêu tốc - Khóa học lập trình JavaScript từ cơ bản đến nâng cao	Khóa học JavaScript bằng tiếng Việt	JavaScript	Gà Lại Lập Trình	https://www.youtube.com/playlist?list=PLPt6-BtUI22pYwpfmkP4EuJkf6GRe63KU	PLPt6-BtUI22pYwpfmkP4EuJkf6GRe63KU	https://i.ytimg.com/vi/PLPt6-BtUI22pYwpfmkP4EuJkf6GRe63KU/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.481091	2026-01-20 05:46:49.481091
85	Tự Học Javascript Cơ Bản Từ A đến Z Cho Người Mới Bắt Đầu với Hỏi Dân IT	Khóa học JavaScript bằng tiếng Việt	JavaScript	Hỏi Dân IT	https://www.youtube.com/playlist?list=PLncHg6Kn2JT5dfQqpVtfNYvv3EBVHHVKo	PLncHg6Kn2JT5dfQqpVtfNYvv3EBVHHVKo	https://i.ytimg.com/vi/PLncHg6Kn2JT5dfQqpVtfNYvv3EBVHHVKo/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.482074	2026-01-20 05:46:49.482074
86	Học Javascript cùng F8	Khóa học JavaScript bằng tiếng Việt	JavaScript	Tech Mely	https://www.youtube.com/playlist?list=PLwJIrGynFq9APduetgi3l9xehOCZCTZEG	PLwJIrGynFq9APduetgi3l9xehOCZCTZEG	https://i.ytimg.com/vi/PLwJIrGynFq9APduetgi3l9xehOCZCTZEG/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.482889	2026-01-20 05:46:49.482889
87	Học JavaScript	Khóa học JavaScript bằng tiếng Việt	JavaScript	HoleTex	https://www.youtube.com/playlist?list=PLqQ6Lvascx2tbLuhCg3E1nC1qcHrckpue	PLqQ6Lvascx2tbLuhCg3E1nC1qcHrckpue	https://i.ytimg.com/vi/PLqQ6Lvascx2tbLuhCg3E1nC1qcHrckpue/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.483466	2026-01-20 05:46:49.483466
88	Cafedev - Series tự học Javascript từ cơ bản tới nâng cao	Khóa học JavaScript bằng tiếng Việt	JavaScript	cafedev	https://www.youtube.com/playlist?list=PLq3KxntIWWrJ-YMciMrAqgXWjZIJyje1b	PLq3KxntIWWrJ-YMciMrAqgXWjZIJyje1b	https://i.ytimg.com/vi/PLq3KxntIWWrJ-YMciMrAqgXWjZIJyje1b/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.484103	2026-01-20 05:46:49.484103
89	Học JavaScript	Khóa học JavaScript bằng tiếng Việt	JavaScript	thân triệu	https://www.youtube.com/playlist?list=PLE1qPKuGSJaDd2AiY_FkSJ2TVyuDal_k8	PLE1qPKuGSJaDd2AiY_FkSJ2TVyuDal_k8	https://i.ytimg.com/vi/PLE1qPKuGSJaDd2AiY_FkSJ2TVyuDal_k8/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.484774	2026-01-20 05:46:49.484774
90	Tutorial học Javascript cơ bản thông qua dự án	Khóa học JavaScript bằng tiếng Việt	JavaScript	Thầy Hoàng JS (phecode)	https://www.youtube.com/playlist?list=PLZdbOLxIxNPCw1ljJRlpBTEFtbNPpvKsP	PLZdbOLxIxNPCw1ljJRlpBTEFtbNPpvKsP	https://i.ytimg.com/vi/PLZdbOLxIxNPCw1ljJRlpBTEFtbNPpvKsP/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.485349	2026-01-20 05:46:49.485349
91	🔥 Javascript cho người mới bắt đầu 🚀	Khóa học JavaScript bằng tiếng Việt	JavaScript	Easy Frontend	https://www.youtube.com/playlist?list=PLeS7aZkL6GOtpuqMKVTfS37RNTlkolLCk	PLeS7aZkL6GOtpuqMKVTfS37RNTlkolLCk	https://i.ytimg.com/vi/PLeS7aZkL6GOtpuqMKVTfS37RNTlkolLCk/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.485929	2026-01-20 05:46:49.485929
92	Khóa học Javascript siêu dễ 2023 - Lập trình thật dễ	Khóa học JavaScript bằng tiếng Việt	JavaScript	Lập trình thật dễ	https://www.youtube.com/playlist?list=PL_QEvEi9neNS1rdD8jeQR0xP0EZEiSELT	PL_QEvEi9neNS1rdD8jeQR0xP0EZEiSELT	https://i.ytimg.com/vi/PL_QEvEi9neNS1rdD8jeQR0xP0EZEiSELT/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.48709	2026-01-20 05:46:49.48709
93	Tự học Javascript - Lập trình Javascript	Khóa học JavaScript bằng tiếng Việt	JavaScript	ZendVN	https://www.youtube.com/playlist?list=PLv6GftO355AvAl13CUVcVvWu0hOZnpfW8	PLv6GftO355AvAl13CUVcVvWu0hOZnpfW8	https://i.ytimg.com/vi/PLv6GftO355AvAl13CUVcVvWu0hOZnpfW8/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.487888	2026-01-20 05:46:49.487888
94	Tự Học JavaScript Nâng Cao -  Modern JavaScript Từ A đến Z Cho Beginners	Khóa học JavaScript bằng tiếng Việt	JavaScript	Hỏi Dân IT	https://www.youtube.com/playlist?list=PLncHg6Kn2JT4eGJ__iQv6BrvL_YnZLHyX	PLncHg6Kn2JT4eGJ__iQv6BrvL_YnZLHyX	https://i.ytimg.com/vi/PLncHg6Kn2JT4eGJ__iQv6BrvL_YnZLHyX/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.488559	2026-01-20 05:46:49.488559
95	Tự học Lập Trình Android từ A đến Z	Khóa học Android bằng tiếng Việt	Android	Kênh Công nghệ	https://www.youtube.com/playlist?list=PL6aoXCbsHwIayYCo9aDuzZ3dMC9oShs1u	PL6aoXCbsHwIayYCo9aDuzZ3dMC9oShs1u	https://i.ytimg.com/vi/PL6aoXCbsHwIayYCo9aDuzZ3dMC9oShs1u/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.48929	2026-01-20 05:46:49.48929
96	Lập trình Android cơ bản	Khóa học Android bằng tiếng Việt	Android	K team	https://www.youtube.com/playlist?list=PL33lvabfss1wDeQMvegg_OZQfaXcbqOQh	PL33lvabfss1wDeQMvegg_OZQfaXcbqOQh	https://i.ytimg.com/vi/PL33lvabfss1wDeQMvegg_OZQfaXcbqOQh/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.489924	2026-01-20 05:46:49.489924
97	Lập trình Android A-Z	Khóa học Android bằng tiếng Việt	Android	Khoa Phạm	https://www.youtube.com/playlist?list=PL5uqQAwS_KDjAgLGiaCakwJV1f4vRnTLS	PL5uqQAwS_KDjAgLGiaCakwJV1f4vRnTLS	https://i.ytimg.com/vi/PL5uqQAwS_KDjAgLGiaCakwJV1f4vRnTLS/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.490486	2026-01-20 05:46:49.490486
98	Học Android + Kotlin cơ bản	Khóa học Android bằng tiếng Việt	Android	Xin chào, mình là Sữa	https://www.youtube.com/playlist?list=PLpgD-OxlvlqFNyyaFlan2-WTtSaBkWllm	PLpgD-OxlvlqFNyyaFlan2-WTtSaBkWllm	https://i.ytimg.com/vi/PLpgD-OxlvlqFNyyaFlan2-WTtSaBkWllm/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.491076	2026-01-20 05:46:49.491076
99	Lập Trình Android Rest API	Khóa học Android bằng tiếng Việt	Android	Nam Nguyen Poly Lab	https://www.youtube.com/playlist?list=PLFPekWzEN9zMPU_se3HtbdmPDvXnX7V80	PLFPekWzEN9zMPU_se3HtbdmPDvXnX7V80	https://i.ytimg.com/vi/PLFPekWzEN9zMPU_se3HtbdmPDvXnX7V80/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.4917	2026-01-20 05:46:49.4917
100	Android app bán hàng online	Khóa học Android bằng tiếng Việt	Android	NH Android	https://www.youtube.com/playlist?list=PLbhheUORMqP2_2bdQ3QYnkst8TFldm3p3	PLbhheUORMqP2_2bdQ3QYnkst8TFldm3p3	https://i.ytimg.com/vi/PLbhheUORMqP2_2bdQ3QYnkst8TFldm3p3/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.492414	2026-01-20 05:46:49.492414
101	Android Cơ Bản	Khóa học Android bằng tiếng Việt	Android	thân triệu	https://www.youtube.com/playlist?list=PLE1qPKuGSJaAeaWy8eRkuDjrqm4Rhm-cx	PLE1qPKuGSJaAeaWy8eRkuDjrqm4Rhm-cx	https://i.ytimg.com/vi/PLE1qPKuGSJaAeaWy8eRkuDjrqm4Rhm-cx/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.493019	2026-01-20 05:46:49.493019
102	Android với kolin cho người mới	Khóa học Android bằng tiếng Việt	Android	Gà Lại Lập Trình	https://www.youtube.com/playlist?list=PLPt6-BtUI22qf3KE1V1PyAm1v8M2qqwL5	PLPt6-BtUI22qf3KE1V1PyAm1v8M2qqwL5	https://i.ytimg.com/vi/PLPt6-BtUI22qf3KE1V1PyAm1v8M2qqwL5/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.49378	2026-01-20 05:46:49.49378
103	Lập trình Android - Android Studio	Khóa học Android bằng tiếng Việt	Android	XuanThuLab	https://www.youtube.com/playlist?list=PLwJr0JSP7i8AU_esH4BC0NDz_m_yLV4PW	PLwJr0JSP7i8AU_esH4BC0NDz_m_yLV4PW	https://i.ytimg.com/vi/PLwJr0JSP7i8AU_esH4BC0NDz_m_yLV4PW/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.494459	2026-01-20 05:46:49.494459
104	Lập trình Android cơ bản - v2022	Khóa học Android bằng tiếng Việt	Android	Anh Nguyen Ngoc	https://www.youtube.com/playlist?list=PLn9lhDYvf_3FDMIcSTSuXZIAB1NJuPuaS	PLn9lhDYvf_3FDMIcSTSuXZIAB1NJuPuaS	https://i.ytimg.com/vi/PLn9lhDYvf_3FDMIcSTSuXZIAB1NJuPuaS/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.495325	2026-01-20 05:46:49.495325
105	Tự Học Node.JS Cơ Bản Từ A Đến Z Cho Người Mới Bắt Đầu	Khóa học NodeJS bằng tiếng Việt	NodeJS	Hỏi Dân IT	https://www.youtube.com/playlist?list=PLncHg6Kn2JT4smWdJceM0bDg4YUF3yqLu	PLncHg6Kn2JT4smWdJceM0bDg4YUF3yqLu	https://i.ytimg.com/vi/PLncHg6Kn2JT4smWdJceM0bDg4YUF3yqLu/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.496061	2026-01-20 05:46:49.496061
106	NodeJS & ExpressJS	Khóa học NodeJS bằng tiếng Việt	NodeJS	F8 Official	https://www.youtube.com/playlist?list=PL_-VfJajZj0VatBpaXkEHK_UPHL7dW6I3	PL_-VfJajZj0VatBpaXkEHK_UPHL7dW6I3	https://i.ytimg.com/vi/PL_-VfJajZj0VatBpaXkEHK_UPHL7dW6I3/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.496687	2026-01-20 05:46:49.496687
107	Khóa học NodeJs trọn bộ	Khóa học NodeJS bằng tiếng Việt	NodeJS	TK Vlogs	https://www.youtube.com/playlist?list=PLqnlyu33Xy-6g7IqU5-3BXOfewcJKoL08	PLqnlyu33Xy-6g7IqU5-3BXOfewcJKoL08	https://i.ytimg.com/vi/PLqnlyu33Xy-6g7IqU5-3BXOfewcJKoL08/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.497293	2026-01-20 05:46:49.497293
108	Thực chiến Back-end NodeJS + MongoDB	Khóa học NodeJS bằng tiếng Việt	NodeJS	TrungQuanDev	https://www.youtube.com/playlist?list=PLP6tw4Zpj-RIMgUPYxhLBVCpaBs94D73V	PLP6tw4Zpj-RIMgUPYxhLBVCpaBs94D73V	https://i.ytimg.com/vi/PLP6tw4Zpj-RIMgUPYxhLBVCpaBs94D73V/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.49789	2026-01-20 05:46:49.49789
109	Học Nodejs cùng F8	Khóa học NodeJS bằng tiếng Việt	NodeJS	Tech Mely	https://www.youtube.com/playlist?list=PLwJIrGynFq9BZto5VvKw7OEDNxN6plq_3	PLwJIrGynFq9BZto5VvKw7OEDNxN6plq_3	https://i.ytimg.com/vi/PLwJIrGynFq9BZto5VvKw7OEDNxN6plq_3/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.498518	2026-01-20 05:46:49.498518
110	Xây dựng Backend ứng dụng ShopApp với NodeJS, MySQL, Google Firebase	Khóa học NodeJS bằng tiếng Việt	NodeJS	Nguyen Duc Hoang	https://www.youtube.com/playlist?list=PLWBrqglnjNl271vpuIiKZtn-xrAZcX92a	PLWBrqglnjNl271vpuIiKZtn-xrAZcX92a	https://i.ytimg.com/vi/PLWBrqglnjNl271vpuIiKZtn-xrAZcX92a/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.499425	2026-01-20 05:46:49.499425
111	NodeJS Mới Nhất 2024	Khóa học NodeJS bằng tiếng Việt	NodeJS	Ninedev	https://www.youtube.com/playlist?list=PLnRJxWEhhmzrN03mUHESraIva5Ppi1FaG	PLnRJxWEhhmzrN03mUHESraIva5Ppi1FaG	https://i.ytimg.com/vi/PLnRJxWEhhmzrN03mUHESraIva5Ppi1FaG/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.500052	2026-01-20 05:46:49.500052
112	Khóa học Fullstack SERN (SQL, Express.js, React.js, Node.js) Web Developer	Khóa học NodeJS bằng tiếng Việt	NodeJS	Hỏi Dân IT	https://www.youtube.com/playlist?list=PLncHg6Kn2JT6E38Z3kit9Hnif1xC_9VqI	PLncHg6Kn2JT6E38Z3kit9Hnif1xC_9VqI	https://i.ytimg.com/vi/PLncHg6Kn2JT6E38Z3kit9Hnif1xC_9VqI/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.500723	2026-01-20 05:46:49.500723
113	Course - Node.js Backend Architecture	Khóa học NodeJS bằng tiếng Việt	NodeJS	Tips Javascript	https://www.youtube.com/playlist?list=PLw0w5s5b9NK4ucXizOF-eKAXKvn9ruCw8	PLw0w5s5b9NK4ucXizOF-eKAXKvn9ruCw8	https://i.ytimg.com/vi/PLw0w5s5b9NK4ucXizOF-eKAXKvn9ruCw8/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.501477	2026-01-20 05:46:49.501477
114	UDEMY - Backend RESTFul Server với Node.JS và Express (SQL/MongoDB)	Khóa học NodeJS bằng tiếng Việt	NodeJS	Hỏi Dân IT	https://www.youtube.com/playlist?list=PLncHg6Kn2JT734qFpgJeSfFR0mMOklC_3	PLncHg6Kn2JT734qFpgJeSfFR0mMOklC_3	https://i.ytimg.com/vi/PLncHg6Kn2JT734qFpgJeSfFR0mMOklC_3/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.502192	2026-01-20 05:46:49.502192
115	LẬP TRÌNH PYTHON CƠ BẢN	Khóa học Python bằng tiếng Việt	Python	Tờ Mờ Sáng học Lập trình	https://www.youtube.com/playlist?list=PLqfkD788zZGDjIctPlbff9doS_KTXOyDc	PLqfkD788zZGDjIctPlbff9doS_KTXOyDc	https://i.ytimg.com/vi/PLqfkD788zZGDjIctPlbff9doS_KTXOyDc/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.503096	2026-01-20 05:46:49.503096
116	[Python] Lập trình Python cơ bản	Khóa học Python bằng tiếng Việt	Python	K team	https://www.youtube.com/playlist?list=PL33lvabfss1xczCv2BA0SaNJHu_VXsFtg	PL33lvabfss1xczCv2BA0SaNJHu_VXsFtg	https://i.ytimg.com/vi/PL33lvabfss1xczCv2BA0SaNJHu_VXsFtg/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.50385	2026-01-20 05:46:49.50385
117	Lập trình Python cơ bản cho người mới bắt đầu	Khóa học Python bằng tiếng Việt	Python	TITV	https://www.youtube.com/playlist?list=PLyxSzL3F7486SaHaQayPdKJUScVFh1UwA	PLyxSzL3F7486SaHaQayPdKJUScVFh1UwA	https://i.ytimg.com/vi/PLyxSzL3F7486SaHaQayPdKJUScVFh1UwA/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.505092	2026-01-20 05:46:49.505092
118	LẬP TRÌNH PYTHON TỪ CƠ BẢN TỚI NÂNG CAO	Khóa học Python bằng tiếng Việt	Python	28tech	https://www.youtube.com/playlist?list=PLux-_phi0Rz0Ngc01o_GYe0JUGjL1yIAm	PLux-_phi0Rz0Ngc01o_GYe0JUGjL1yIAm	https://i.ytimg.com/vi/PLux-_phi0Rz0Ngc01o_GYe0JUGjL1yIAm/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.505821	2026-01-20 05:46:49.505821
119	Lập Trình Python	Khóa học Python bằng tiếng Việt	Python	Dũng Lại Lập Trình	https://www.youtube.com/playlist?list=PLKzXIbeO5pQ0J2boMB4btE7VDs7gP8vdl	PLKzXIbeO5pQ0J2boMB4btE7VDs7gP8vdl	https://i.ytimg.com/vi/PLKzXIbeO5pQ0J2boMB4btE7VDs7gP8vdl/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.506697	2026-01-20 05:46:49.506697
120	Tự học lập trình python	Khóa học Python bằng tiếng Việt	Python	Gà Lại Lập Trình	https://www.youtube.com/playlist?list=PLPt6-BtUI22oGqQwAEF6xwrFL6aOjtHWl	PLPt6-BtUI22oGqQwAEF6xwrFL6aOjtHWl	https://i.ytimg.com/vi/PLPt6-BtUI22oGqQwAEF6xwrFL6aOjtHWl/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.507522	2026-01-20 05:46:49.507522
121	Khóa học Python cơ bản và nâng cao	Khóa học Python bằng tiếng Việt	Python	Lập trình Python	https://www.youtube.com/playlist?list=PLSpCQre3PzmWlodvqNcr0lg_10Bil8oF7	PLSpCQre3PzmWlodvqNcr0lg_10Bil8oF7	https://i.ytimg.com/vi/PLSpCQre3PzmWlodvqNcr0lg_10Bil8oF7/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.508162	2026-01-20 05:46:49.508162
122	Khóa học Lập trình Python từ Cơ bản đến Nâng cao	Khóa học Python bằng tiếng Việt	Python	Học Công Nghệ	https://www.youtube.com/playlist?list=PLzQuu4-Qxlh44nsjdQH2quvfKePtAaI3_	PLzQuu4-Qxlh44nsjdQH2quvfKePtAaI3_	https://i.ytimg.com/vi/PLzQuu4-Qxlh44nsjdQH2quvfKePtAaI3_/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.508804	2026-01-20 05:46:49.508804
123	Tự học python cơ bản	Khóa học Python bằng tiếng Việt	Python	Gà Python	https://www.youtube.com/playlist?list=PLUocOGc7RDEJAH2152KaiY9H8S-C8TvT-	PLUocOGc7RDEJAH2152KaiY9H8S-C8TvT-	https://i.ytimg.com/vi/PLUocOGc7RDEJAH2152KaiY9H8S-C8TvT-/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.5094	2026-01-20 05:46:49.5094
124	Khóa học Lập trình Game với Python	Khóa học Python bằng tiếng Việt	Python	Học Công Nghệ	https://www.youtube.com/playlist?list=PLzQuu4-Qxlh47gX_HnqKSJIycFNekP79m	PLzQuu4-Qxlh47gX_HnqKSJIycFNekP79m	https://i.ytimg.com/vi/PLzQuu4-Qxlh47gX_HnqKSJIycFNekP79m/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.510435	2026-01-20 05:46:49.510435
125	Angular căn bản 2023	Khóa học Angular bằng tiếng Việt	Angular	TEDU	https://www.youtube.com/playlist?list=PLRhlTlpDUWswOJnLxzotd7MgqaRrBlZOG	PLRhlTlpDUWswOJnLxzotd7MgqaRrBlZOG	https://i.ytimg.com/vi/PLRhlTlpDUWswOJnLxzotd7MgqaRrBlZOG/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.511235	2026-01-20 05:46:49.511235
126	100 Days Of Angular (from Angular Vietnam)	Khóa học Angular bằng tiếng Việt	Angular	Angular Vietnam	https://www.youtube.com/playlist?list=PLMTyi4Bfd5pW73uXw-6jgRxDwdPYqwk0r	PLMTyi4Bfd5pW73uXw-6jgRxDwdPYqwk0r	https://i.ytimg.com/vi/PLMTyi4Bfd5pW73uXw-6jgRxDwdPYqwk0r/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.512041	2026-01-20 05:46:49.512041
127	Khóa học Angular Mới Nhất 2024	Khóa học Angular bằng tiếng Việt	Angular	Ninedev	https://www.youtube.com/playlist?list=PLnRJxWEhhmzrta5bu4gJsZX_kdDff3Y4R	PLnRJxWEhhmzrta5bu4gJsZX_kdDff3Y4R	https://i.ytimg.com/vi/PLnRJxWEhhmzrta5bu4gJsZX_kdDff3Y4R/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.512692	2026-01-20 05:46:49.512692
128	Angular 16 - 2023	Khóa học Angular bằng tiếng Việt	Angular	Lửng Code	https://www.youtube.com/playlist?list=PLFWDoeAHRLTYaOhywzqEOwYk9sCVbIBB-	PLFWDoeAHRLTYaOhywzqEOwYk9sCVbIBB-	https://i.ytimg.com/vi/PLFWDoeAHRLTYaOhywzqEOwYk9sCVbIBB-/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.513438	2026-01-20 05:46:49.513438
129	Angular 12 - Hướng dẫn từ căn bản	Khóa học Angular bằng tiếng Việt	Angular	Code là Ghiền	https://www.youtube.com/playlist?list=PLiNjao7yG417iy0SwSuaGDZ7GBJs654ME	PLiNjao7yG417iy0SwSuaGDZ7GBJs654ME	https://i.ytimg.com/vi/PLiNjao7yG417iy0SwSuaGDZ7GBJs654ME/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.514063	2026-01-20 05:46:49.514063
130	Tự học Angular 2020	Khóa học Angular bằng tiếng Việt	Angular	CodersX	https://www.youtube.com/playlist?list=PLkY6Xj8Sg8-uBQaBU8wMLo2CrFkE-9VIZ	PLkY6Xj8Sg8-uBQaBU8wMLo2CrFkE-9VIZ	https://i.ytimg.com/vi/PLkY6Xj8Sg8-uBQaBU8wMLo2CrFkE-9VIZ/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.514905	2026-01-20 05:46:49.514905
131	Học Angular 8+ qua các ví dụ thực tế	Khóa học Angular bằng tiếng Việt	Angular	TechMaster Vietnam	https://www.youtube.com/playlist?list=PLlahAO-uyDzJ2tRFJ8hFkiPf6xuSg9IQa	PLlahAO-uyDzJ2tRFJ8hFkiPf6xuSg9IQa	https://i.ytimg.com/vi/PLlahAO-uyDzJ2tRFJ8hFkiPf6xuSg9IQa/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.515513	2026-01-20 05:46:49.515513
132	Angular 4 Cơ Bản	Khóa học Angular bằng tiếng Việt	Angular	Khoa Phạm	https://www.youtube.com/playlist?list=PLzrVYRai0riTA1m7Dasg8eraBr6R9nFgC	PLzrVYRai0riTA1m7Dasg8eraBr6R9nFgC	https://i.ytimg.com/vi/PLzrVYRai0riTA1m7Dasg8eraBr6R9nFgC/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.516128	2026-01-20 05:46:49.516128
133	AngularJS căn bản cho người mới bắt đầu	Khóa học Angular bằng tiếng Việt	Angular	TEDU	https://www.youtube.com/playlist?list=PLRhlTlpDUWsw70vZAkJgALJ1yhgYsqDGx	PLRhlTlpDUWsw70vZAkJgALJ1yhgYsqDGx	https://i.ytimg.com/vi/PLRhlTlpDUWsw70vZAkJgALJ1yhgYsqDGx/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.516705	2026-01-20 05:46:49.516705
134	MERN Stack (MongoDB, Express, React, Node.js)- Lập trình web bán hàng fullstack	Khóa học ExpressJS bằng tiếng Việt	ExpressJS	Lập trình thật dễ	https://www.youtube.com/playlist?list=PL_QEvEi9neNSOGrmYOZSYFk9DpYr-Zd9p	PL_QEvEi9neNSOGrmYOZSYFk9DpYr-Zd9p	https://i.ytimg.com/vi/PL_QEvEi9neNSOGrmYOZSYFk9DpYr-Zd9p/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.518283	2026-01-20 05:46:49.518283
135	ExpressJS & NodeJS - Xây dựng hệ thống server chuẩn RESTFUL, xác thực phân quyền làm blog cá nhân	Khóa học ExpressJS bằng tiếng Việt	ExpressJS	Nodemy	https://www.youtube.com/playlist?list=PLodO7Gi1F7R1GMefX_44suLAaXnaNYMyC	PLodO7Gi1F7R1GMefX_44suLAaXnaNYMyC	https://i.ytimg.com/vi/PLodO7Gi1F7R1GMefX_44suLAaXnaNYMyC/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.518843	2026-01-20 05:46:49.518843
136	Khóa học Xây dựng Rest API với Nodejs, Express và MongoDB	Khóa học ExpressJS bằng tiếng Việt	ExpressJS	TEDU	https://www.youtube.com/playlist?list=PLRhlTlpDUWsz4IwOpkEmtgwAom3Puw8rx	PLRhlTlpDUWsz4IwOpkEmtgwAom3Puw8rx	https://i.ytimg.com/vi/PLRhlTlpDUWsz4IwOpkEmtgwAom3Puw8rx/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.519743	2026-01-20 05:46:49.519743
137	[FULL STACK] MERN PRO • Học lập trình Front-end + Back-end | Làm dự án thực tế Trello kéo thả	Khóa học ExpressJS bằng tiếng Việt	ExpressJS	TrungQuanDev	https://www.youtube.com/playlist?list=PLP6tw4Zpj-RJP2-YrhtkWqObMQ-AA4TDy	PLP6tw4Zpj-RJP2-YrhtkWqObMQ-AA4TDy	https://i.ytimg.com/vi/PLP6tw4Zpj-RJP2-YrhtkWqObMQ-AA4TDy/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.520402	2026-01-20 05:46:49.520402
138	React Native EventHub Fullstack với NodeJS ExpressJS MongoDB	Khóa học ExpressJS bằng tiếng Việt	ExpressJS	Đào Quang	https://www.youtube.com/playlist?list=PLwRuTV6YR6x1_CzgvKEDEPH1Czl6Mmu6h	PLwRuTV6YR6x1_CzgvKEDEPH1Czl6Mmu6h	https://i.ytimg.com/vi/PLwRuTV6YR6x1_CzgvKEDEPH1Czl6Mmu6h/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.521097	2026-01-20 05:46:49.521097
139	Tự học lập trình Flutter 2023	Khóa học Flutter bằng tiếng Việt	Flutter	TinCoder	https://www.youtube.com/playlist?list=PL3Ob3F0T-08brnWfs8np2ROjICeT-Pr6T	PL3Ob3F0T-08brnWfs8np2ROjICeT-Pr6T	https://i.ytimg.com/vi/PL3Ob3F0T-08brnWfs8np2ROjICeT-Pr6T/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.522016	2026-01-20 05:46:49.522016
140	Lập trình Flutter - thiết bị di động	Khóa học Flutter bằng tiếng Việt	Flutter	TITV	https://www.youtube.com/playlist?list=PLyxSzL3F7484qhNw1K08o8kDn8ecCpA_j	PLyxSzL3F7484qhNw1K08o8kDn8ecCpA_j	https://i.ytimg.com/vi/PLyxSzL3F7484qhNw1K08o8kDn8ecCpA_j/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.522697	2026-01-20 05:46:49.522697
141	Lập trình di động với Flutter	Khóa học Flutter bằng tiếng Việt	Flutter	Học Lập Trình Online	https://www.youtube.com/playlist?list=PLv6GftO355AsxyLjGVkpOmN8DUbcPdIBv	PLv6GftO355AsxyLjGVkpOmN8DUbcPdIBv	https://i.ytimg.com/vi/PLv6GftO355AsxyLjGVkpOmN8DUbcPdIBv/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.523286	2026-01-20 05:46:49.523286
142	Flutter Từ Cơ Bản Đến Nâng Cao 2024 - 2025	Khóa học Flutter bằng tiếng Việt	Flutter	thân triệu	https://www.youtube.com/playlist?list=PLE1qPKuGSJaAmSo-tC02ugcyttOcsK7C9	PLE1qPKuGSJaAmSo-tC02ugcyttOcsK7C9	https://i.ytimg.com/vi/PLE1qPKuGSJaAmSo-tC02ugcyttOcsK7C9/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.524016	2026-01-20 05:46:49.524016
143	Lập trình di động Flutter (Mobile Development Flutter)	Khóa học Flutter bằng tiếng Việt	Flutter	Dummy Fresher	https://www.youtube.com/playlist?list=PLZqHbMxF8mzbcMAjOtClkRcEIkhvV3ZtL	PLZqHbMxF8mzbcMAjOtClkRcEIkhvV3ZtL	https://i.ytimg.com/vi/PLZqHbMxF8mzbcMAjOtClkRcEIkhvV3ZtL/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.525015	2026-01-20 05:46:49.525015
144	Lập trình di động với Flutter căn bản	Khóa học Flutter bằng tiếng Việt	Flutter	TEDU	https://www.youtube.com/playlist?list=PLRhlTlpDUWsxWhGA4jTr0oGeNs7xYyDPW	PLRhlTlpDUWsxWhGA4jTr0oGeNs7xYyDPW	https://i.ytimg.com/vi/PLRhlTlpDUWsxWhGA4jTr0oGeNs7xYyDPW/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.525589	2026-01-20 05:46:49.525589
145	Flutter Tutorial 2021 for Beginners: English App | Flutter Lab	Khóa học Flutter bằng tiếng Việt	Flutter	200Lab	https://www.youtube.com/playlist?list=PLFcgubjtcw5U-Y6z1gpR02ebF-jyLoyga	PLFcgubjtcw5U-Y6z1gpR02ebF-jyLoyga	https://i.ytimg.com/vi/PLFcgubjtcw5U-Y6z1gpR02ebF-jyLoyga/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.526218	2026-01-20 05:46:49.526218
146	Xây dựng ứng dụng Flutter thực tế.	Khóa học Flutter bằng tiếng Việt	Flutter	Chàng Dev Mobile	https://www.youtube.com/playlist?list=PLFDupNa8166hj4TEZcq3_za4GirSiawzN	PLFDupNa8166hj4TEZcq3_za4GirSiawzN	https://i.ytimg.com/vi/PLFDupNa8166hj4TEZcq3_za4GirSiawzN/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.526796	2026-01-20 05:46:49.526796
147	Tự học Flutter 2020	Khóa học Flutter bằng tiếng Việt	Flutter	Nguyen Duc Hoang	https://www.youtube.com/playlist?list=PLWBrqglnjNl3DzS2RHds5KlanGqQ1uLNQ	PLWBrqglnjNl3DzS2RHds5KlanGqQ1uLNQ	https://i.ytimg.com/vi/PLWBrqglnjNl3DzS2RHds5KlanGqQ1uLNQ/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.527423	2026-01-20 05:46:49.527423
148	Học lập trình React JS - Redux - NodeJS qua dự án thực tế	Khóa học React bằng tiếng Việt	React	Thầy Nguyễn Đức Việt	https://www.youtube.com/playlist?list=PLmbxe7ftoDqSNf5yGMhbDNjIZIM5mQ7Ow	PLmbxe7ftoDqSNf5yGMhbDNjIZIM5mQ7Ow	https://i.ytimg.com/vi/PLmbxe7ftoDqSNf5yGMhbDNjIZIM5mQ7Ow/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.528242	2026-01-20 05:46:49.528242
149	Học React Hooks cơ bản (2020)	Khóa học React bằng tiếng Việt	React	Easy Frontend	https://www.youtube.com/playlist?list=PLeS7aZkL6GOsHNoyeEpeL8B1PnbKoQD9m	PLeS7aZkL6GOsHNoyeEpeL8B1PnbKoQD9m	https://i.ytimg.com/vi/PLeS7aZkL6GOsHNoyeEpeL8B1PnbKoQD9m/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.529106	2026-01-20 05:46:49.529106
150	Học redux cơ bản 2020	Khóa học React bằng tiếng Việt	React	Easy Frontend	https://www.youtube.com/playlist?list=PLeS7aZkL6GOvCz3GiOtvtDXChJRuebb7S	PLeS7aZkL6GOvCz3GiOtvtDXChJRuebb7S	https://i.ytimg.com/vi/PLeS7aZkL6GOvCz3GiOtvtDXChJRuebb7S/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.529999	2026-01-20 05:46:49.529999
151	Khóa Học Fullstack SERN (SQL, Express.js, React.js, Node.js) Web Developer	Khóa học React bằng tiếng Việt	React	Hỏi Dân IT	https://youtube.com/playlist?list=PLncHg6Kn2JT6E38Z3kit9Hnif1xC_9VqI	PLncHg6Kn2JT6E38Z3kit9Hnif1xC_9VqI	https://i.ytimg.com/vi/PLncHg6Kn2JT6E38Z3kit9Hnif1xC_9VqI/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.530793	2026-01-20 05:46:49.530793
152	Khóa Học Lập Trình React.js - Redux	Khóa học React bằng tiếng Việt	React	nghiepuit	https://www.youtube.com/playlist?list=PLJ5qtRQovuEOoKffoCBzTfvzMTTORnoyp	PLJ5qtRQovuEOoKffoCBzTfvzMTTORnoyp	https://i.ytimg.com/vi/PLJ5qtRQovuEOoKffoCBzTfvzMTTORnoyp/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.531408	2026-01-20 05:46:49.531408
153	Lập trình ReactJS với Redux	Khóa học React bằng tiếng Việt	React	Khoa Phạm	https://www.youtube.com/playlist?list=PLzrVYRai0riQFEN586LOz3eMv2Rgy6WXS	PLzrVYRai0riQFEN586LOz3eMv2Rgy6WXS	https://i.ytimg.com/vi/PLzrVYRai0riQFEN586LOz3eMv2Rgy6WXS/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.532342	2026-01-20 05:46:49.532342
154	React.js Cơ Bản	Khóa học React bằng tiếng Việt	React	Unknown	https://www.youtube.com/playlist?list=PLzrVYRai0riSPcINVFvaCaM7Ul55DzpLd	PLzrVYRai0riSPcINVFvaCaM7Ul55DzpLd	https://i.ytimg.com/vi/PLzrVYRai0riSPcINVFvaCaM7Ul55DzpLd/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.532996	2026-01-20 05:46:49.532996
155	ReactJS - Demo các project trong khóa học	Khóa học React bằng tiếng Việt	React	Học Lập Trình Online	https://www.youtube.com/playlist?list=PLv6GftO355Av08p6Zi1I67VYw47nMS8xO	PLv6GftO355Av08p6Zi1I67VYw47nMS8xO	https://i.ytimg.com/vi/PLv6GftO355Av08p6Zi1I67VYw47nMS8xO/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.533579	2026-01-20 05:46:49.533579
156	Redux Cơ Bản	Khóa học React bằng tiếng Việt	React	CodersX	https://www.youtube.com/playlist?list=PLkY6Xj8Sg8-tmotihDcWZN0LvtXFyxmRZ	PLkY6Xj8Sg8-tmotihDcWZN0LvtXFyxmRZ	https://i.ytimg.com/vi/PLkY6Xj8Sg8-tmotihDcWZN0LvtXFyxmRZ/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.53444	2026-01-20 05:46:49.53444
157	Học thiết kế Website Wordpress từ A đến Z	Khóa học Wordpress bằng tiếng Việt	Wordpress	Học WordPress	https://www.youtube.com/playlist?list=PLFsfDLNKS58x01diBZc-jrRWukDdSWI4z	PLFsfDLNKS58x01diBZc-jrRWukDdSWI4z	https://i.ytimg.com/vi/PLFsfDLNKS58x01diBZc-jrRWukDdSWI4z/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.535082	2026-01-20 05:46:49.535082
158	Học WordPress cơ bản cho người mới bắt đầu tự làm website	Khóa học Wordpress bằng tiếng Việt	Wordpress	Digital Marketing IMTA	https://www.youtube.com/playlist?list=PL8tBvUxXM0tww5FCbQcCuKVlDxEjlyiau	PL8tBvUxXM0tww5FCbQcCuKVlDxEjlyiau	https://i.ytimg.com/vi/PL8tBvUxXM0tww5FCbQcCuKVlDxEjlyiau/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.53567	2026-01-20 05:46:49.53567
159	Học WordPress 4 cơ bản (2015)	Khóa học Wordpress bằng tiếng Việt	Wordpress	Thạch Phạm	https://www.youtube.com/playlist?list=PLl4nkmb3a8w3EEFbxkPjd6snE11eAPh5e	PLl4nkmb3a8w3EEFbxkPjd6snE11eAPh5e	https://i.ytimg.com/vi/PLl4nkmb3a8w3EEFbxkPjd6snE11eAPh5e/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.536486	2026-01-20 05:46:49.536486
160	Tự học Wordpress	Khóa học Wordpress bằng tiếng Việt	Wordpress	TITV	https://www.youtube.com/playlist?list=PLyxSzL3F7487-LYICz9nzlbQ5XJxFQPoI	PLyxSzL3F7487-LYICz9nzlbQ5XJxFQPoI	https://i.ytimg.com/vi/PLyxSzL3F7487-LYICz9nzlbQ5XJxFQPoI/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.537155	2026-01-20 05:46:49.537155
161	Tự học làm website WordPress 2023 (Module nền tảng + làm blog cá nhân)	Khóa học Wordpress bằng tiếng Việt	Wordpress	Võ Thanh Duy	https://www.youtube.com/playlist?list=PLoNIfk8yyjz6Z-r6s8oksoB0xo4NUsMQN	PLoNIfk8yyjz6Z-r6s8oksoB0xo4NUsMQN	https://i.ytimg.com/vi/PLoNIfk8yyjz6Z-r6s8oksoB0xo4NUsMQN/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.53778	2026-01-20 05:46:49.53778
162	WordPress Tinh Gọn 2024	Khóa học Wordpress bằng tiếng Việt	Wordpress	Thạch Phạm	https://www.youtube.com/playlist?list=PLl4nkmb3a8w2Z_sEJv_0xoXIHWMfhEw76	PLl4nkmb3a8w2Z_sEJv_0xoXIHWMfhEw76	https://i.ytimg.com/vi/PLl4nkmb3a8w2Z_sEJv_0xoXIHWMfhEw76/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.538455	2026-01-20 05:46:49.538455
163	Lập trình WordPress 2023	Khóa học Wordpress bằng tiếng Việt	Wordpress	Quảng Trị Coder	https://www.youtube.com/playlist?list=PL0-Cg8lpmCm3lBsQ6dciJGU4e7oNs-S5w	PL0-Cg8lpmCm3lBsQ6dciJGU4e7oNs-S5w	https://i.ytimg.com/vi/PL0-Cg8lpmCm3lBsQ6dciJGU4e7oNs-S5w/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.539082	2026-01-20 05:46:49.539082
164	Tự học WordPress Online - Cài đặt và sử dụng WordPress CMS	Khóa học Wordpress bằng tiếng Việt	Wordpress	ZendVN	https://www.youtube.com/playlist?list=PLv6GftO355As7yY0I6-fDZOHKatBjq9jI	PLv6GftO355As7yY0I6-fDZOHKatBjq9jI	https://i.ytimg.com/vi/PLv6GftO355As7yY0I6-fDZOHKatBjq9jI/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.539684	2026-01-20 05:46:49.539684
165	học thiết kế web bằng wordpress	Khóa học Wordpress bằng tiếng Việt	Wordpress	Richard Quang	https://www.youtube.com/playlist?list=PLSYhjar46cY7AAFWKqXfilAHfhdizCoAQ	PLSYhjar46cY7AAFWKqXfilAHfhdizCoAQ	https://i.ytimg.com/vi/PLSYhjar46cY7AAFWKqXfilAHfhdizCoAQ/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.540326	2026-01-20 05:46:49.540326
166	Asembly, lập trình hợp ngữ trên emu 8086	Khóa học Assembly bằng tiếng Việt	Assembly	Huy Init	https://www.youtube.com/playlist?list=PLDYXQL9eThN7o1fsQIEn40eTiJCZTFVoc	PLDYXQL9eThN7o1fsQIEn40eTiJCZTFVoc	https://i.ytimg.com/vi/PLDYXQL9eThN7o1fsQIEn40eTiJCZTFVoc/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.540912	2026-01-20 05:46:49.540912
167	Lập trình Assembly	Khóa học Assembly bằng tiếng Việt	Assembly	Ky Nguyen IoT	https://www.youtube.com/playlist?list=PL_5qWES7xEtCt5z3Fi4rKh71xBKSXzNzv	PL_5qWES7xEtCt5z3Fi4rKh71xBKSXzNzv	https://i.ytimg.com/vi/PL_5qWES7xEtCt5z3Fi4rKh71xBKSXzNzv/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.541488	2026-01-20 05:46:49.541488
168	Assembly - Lập trình hợp ngữ	Khóa học Assembly bằng tiếng Việt	Assembly	KienThucTin	https://www.youtube.com/playlist?list=PLqNgXeR4XrjBgFcjPV46Nb2k4D23alTK_	PLqNgXeR4XrjBgFcjPV46Nb2k4D23alTK_	https://i.ytimg.com/vi/PLqNgXeR4XrjBgFcjPV46Nb2k4D23alTK_/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.542043	2026-01-20 05:46:49.542043
169	Lập Trình ASSEMBLY ARM	Khóa học Assembly bằng tiếng Việt	Assembly	HuLa Embedded	https://www.youtube.com/playlist?list=PLE9xJNSB3lTFBf2zj0Mp4gBhGqSDJxj0z	PLE9xJNSB3lTFBf2zj0Mp4gBhGqSDJxj0z	https://i.ytimg.com/vi/PLE9xJNSB3lTFBf2zj0Mp4gBhGqSDJxj0z/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.542994	2026-01-20 05:46:49.542994
170	Lập Trình ARM Assembly	Khóa học Assembly bằng tiếng Việt	Assembly	Lập Trình Nhúng A-Z	https://www.youtube.com/playlist?list=PLGZ_RWetU5HJLQmSNExog6Wiws-tCDxh0	PLGZ_RWetU5HJLQmSNExog6Wiws-tCDxh0	https://i.ytimg.com/vi/PLGZ_RWetU5HJLQmSNExog6Wiws-tCDxh0/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.543604	2026-01-20 05:46:49.543604
171	Lập trình hợp ngữ Assembly 8051	Khóa học Assembly bằng tiếng Việt	Assembly	Vũ Minh Đức	https://www.youtube.com/playlist?list=PLBlxAM4UiXxQ2Vz7C-z1voTjDmsRqEEd1	PLBlxAM4UiXxQ2Vz7C-z1voTjDmsRqEEd1	https://i.ytimg.com/vi/PLBlxAM4UiXxQ2Vz7C-z1voTjDmsRqEEd1/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.544427	2026-01-20 05:46:49.544427
172	Lập Trình x86 Assembly	Khóa học Assembly bằng tiếng Việt	Assembly	Lập Trình Nhúng A-Z	https://www.youtube.com/playlist?list=PLGZ_RWetU5HInf6eYocQXXAaikHbvZI81	PLGZ_RWetU5HInf6eYocQXXAaikHbvZI81	https://i.ytimg.com/vi/PLGZ_RWetU5HInf6eYocQXXAaikHbvZI81/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.545021	2026-01-20 05:46:49.545021
173	Lập trình hợp ngữ	Khóa học Assembly bằng tiếng Việt	Assembly	K.Huynh.	https://www.youtube.com/playlist?list=PL9sn2M__GrF--BchVjp9msnEniq3hWw1k	PL9sn2M__GrF--BchVjp9msnEniq3hWw1k	https://i.ytimg.com/vi/PL9sn2M__GrF--BchVjp9msnEniq3hWw1k/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.545606	2026-01-20 05:46:49.545606
174	Lập trình ASP.NET MVC Core cơ bản	Khóa học ASP.NET bằng tiếng Việt	ASP.NET	TEDU	https://www.youtube.com/playlist?list=PLRhlTlpDUWsxSup77UnO2pWEkr4ahTohJ	PLRhlTlpDUWsxSup77UnO2pWEkr4ahTohJ	https://i.ytimg.com/vi/PLRhlTlpDUWsxSup77UnO2pWEkr4ahTohJ/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.546244	2026-01-20 05:46:49.546244
175	Làm dự án với ASP.NET Core 3.1	Khóa học ASP.NET bằng tiếng Việt	ASP.NET	TEDU	https://www.youtube.com/playlist?list=PLRhlTlpDUWsyN_FiVQrDWMtHix_E2A_UD	PLRhlTlpDUWsyN_FiVQrDWMtHix_E2A_UD	https://i.ytimg.com/vi/PLRhlTlpDUWsyN_FiVQrDWMtHix_E2A_UD/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.546851	2026-01-20 05:46:49.546851
176	ASP.NET Core Web API	Khóa học ASP.NET bằng tiếng Việt	ASP.NET	HIENLTH Channel	https://www.youtube.com/playlist?list=PLE5Bje814fYbhdwSHiHN9rlwJlwJ2YD3t	PLE5Bje814fYbhdwSHiHN9rlwJlwJ2YD3t	https://i.ytimg.com/vi/PLE5Bje814fYbhdwSHiHN9rlwJlwJ2YD3t/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.54743	2026-01-20 05:46:49.54743
177	C.51 - .NET Core - Angular 12 - Quản Lý Nhà Hàng	Khóa học ASP.NET bằng tiếng Việt	ASP.NET	Code là Ghiền	https://www.youtube.com/playlist?list=PLiNjao7yG415y_J0G21QUc40akV2vRntP	PLiNjao7yG415y_J0G21QUc40akV2vRntP	https://i.ytimg.com/vi/PLiNjao7yG415y_J0G21QUc40akV2vRntP/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.548034	2026-01-20 05:46:49.548034
178	Lập trình ASP.NET MVC Core	Khóa học ASP.NET bằng tiếng Việt	ASP.NET	XuanThuLab	https://www.youtube.com/playlist?list=PLwJr0JSP7i8DXGzj8NgnhOApBMRhWD4J-	PLwJr0JSP7i8DXGzj8NgnhOApBMRhWD4J-	https://i.ytimg.com/vi/PLwJr0JSP7i8DXGzj8NgnhOApBMRhWD4J-/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.548581	2026-01-20 05:46:49.548581
179	Website Thương mại Điện tử với ASP.NET Core MVC	Khóa học ASP.NET bằng tiếng Việt	ASP.NET	HIENLTH Channel	https://www.youtube.com/playlist?list=PLE5Bje814fYbtRxvDgmWJ6fUpIZXtbNrb	PLE5Bje814fYbtRxvDgmWJ6fUpIZXtbNrb	https://i.ytimg.com/vi/PLE5Bje814fYbtRxvDgmWJ6fUpIZXtbNrb/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.549174	2026-01-20 05:46:49.549174
180	Web bán hàng ASP.NET Core 6 to 8 EF MVC	Khóa học ASP.NET bằng tiếng Việt	ASP.NET	Hiếu Tutorial with live project	https://www.youtube.com/playlist?list=PLWTu87GngvNzYGOXJnXQwlkdhV6_RWs1b	PLWTu87GngvNzYGOXJnXQwlkdhV6_RWs1b	https://i.ytimg.com/vi/PLWTu87GngvNzYGOXJnXQwlkdhV6_RWs1b/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.549767	2026-01-20 05:46:49.549767
181	Xây dựng ứng dụng web với ASP.NET Core	Khóa học ASP.NET bằng tiếng Việt	ASP.NET	TEDU	https://www.youtube.com/playlist?list=PLRhlTlpDUWsyP9PB1yrhNAYI7LC6yr4tZ	PLRhlTlpDUWsyP9PB1yrhNAYI7LC6yr4tZ	https://i.ytimg.com/vi/PLRhlTlpDUWsyP9PB1yrhNAYI7LC6yr4tZ/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.550399	2026-01-20 05:46:49.550399
182	Lập trình Go cơ bản	Khóa học Go bằng tiếng Việt	Go	Việt Trần	https://www.youtube.com/playlist?list=PLOsM_3jFFQRnzp7jWU3WLmQ1sF4IX45zr	PLOsM_3jFFQRnzp7jWU3WLmQ1sF4IX45zr	https://i.ytimg.com/vi/PLOsM_3jFFQRnzp7jWU3WLmQ1sF4IX45zr/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.551011	2026-01-20 05:46:49.551011
183	Go - Con đường lập trình	Khóa học Go bằng tiếng Việt	Go	Tips Golang	https://www.youtube.com/playlist?list=PL0Pnqmz-onB5Xk2o46BpvGHa-c8Toe0YP	PL0Pnqmz-onB5Xk2o46BpvGHa-c8Toe0YP	https://i.ytimg.com/vi/PL0Pnqmz-onB5Xk2o46BpvGHa-c8Toe0YP/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.551529	2026-01-20 05:46:49.551529
184	Lập trình Golang	Khóa học Go bằng tiếng Việt	Go	Code4Func	https://www.youtube.com/playlist?list=PLVDJsRQrTUz5icsxSfKdymhghOtLNFn-k	PLVDJsRQrTUz5icsxSfKdymhghOtLNFn-k	https://i.ytimg.com/vi/PLVDJsRQrTUz5icsxSfKdymhghOtLNFn-k/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.552049	2026-01-20 05:46:49.552049
185	Golang cơ bản - Playlist	Khóa học Go bằng tiếng Việt	Go	Yuh lập trình viên	https://www.youtube.com/playlist?list=PLw-L1SGSvTEco7QvKTEd39wrMoTCPNUuN	PLw-L1SGSvTEco7QvKTEd39wrMoTCPNUuN	https://i.ytimg.com/vi/PLw-L1SGSvTEco7QvKTEd39wrMoTCPNUuN/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.552566	2026-01-20 05:46:49.552566
186	Lập Trình REST API cơ bản với Golang	Khóa học Go bằng tiếng Việt	Go	Việt Trần	https://www.youtube.com/playlist?list=PLOsM_3jFFQRl3tAqDVU-nPJOHBfXJVnaM	PLOsM_3jFFQRl3tAqDVU-nPJOHBfXJVnaM	https://i.ytimg.com/vi/PLOsM_3jFFQRl3tAqDVU-nPJOHBfXJVnaM/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.553166	2026-01-20 05:46:49.553166
187	Golang thực chiến cho người mới	Khóa học Go bằng tiếng Việt	Go	Code4Func	https://www.youtube.com/playlist?list=PLVDJsRQrTUz4bQDHCElBG2AsJzCwonqKs	PLVDJsRQrTUz4bQDHCElBG2AsJzCwonqKs	https://i.ytimg.com/vi/PLVDJsRQrTUz4bQDHCElBG2AsJzCwonqKs/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.553697	2026-01-20 05:46:49.553697
188	Course - Go Backend Architecture	Khóa học Go bằng tiếng Việt	Go	Tips Javascript	https://www.youtube.com/playlist?list=PLw0w5s5b9NK6qiL9Xzki-mGbq_V8dBQkY	PLw0w5s5b9NK6qiL9Xzki-mGbq_V8dBQkY	https://i.ytimg.com/vi/PLw0w5s5b9NK6qiL9Xzki-mGbq_V8dBQkY/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.55427	2026-01-20 05:46:49.55427
189	Tự học Golang trong 5 giờ. Học xong kiếm lương ngàn đô!	Khóa học Go bằng tiếng Việt	Go	The Funzy Dev	https://www.youtube.com/playlist?list=PLC4c48H3oDRwlxVzOv2L8CXF7tZmtPHkn	PLC4c48H3oDRwlxVzOv2L8CXF7tZmtPHkn	https://i.ytimg.com/vi/PLC4c48H3oDRwlxVzOv2L8CXF7tZmtPHkn/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.554803	2026-01-20 05:46:49.554803
190	Lập trình jQuery từ căn bản đến nâng cao	Khóa học jQuery bằng tiếng Việt	jQuery	TEDU	https://www.youtube.com/playlist?list=PLRhlTlpDUWsyAGY7FDGSndEhOD3F2Ruhm	PLRhlTlpDUWsyAGY7FDGSndEhOD3F2Ruhm	https://i.ytimg.com/vi/PLRhlTlpDUWsyAGY7FDGSndEhOD3F2Ruhm/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.555398	2026-01-20 05:46:49.555398
191	Tự Học JQuery	Khóa học jQuery bằng tiếng Việt	jQuery	T.A.N	https://www.youtube.com/playlist?list=PLepCFdNQOPNfY15_XAp-cRN3XrKYCvT-h	PLepCFdNQOPNfY15_XAp-cRN3XrKYCvT-h	https://i.ytimg.com/vi/PLepCFdNQOPNfY15_XAp-cRN3XrKYCvT-h/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.555999	2026-01-20 05:46:49.555999
192	Học jQuery từ cơ bản đến nâng cao	Khóa học jQuery bằng tiếng Việt	jQuery	Học online	https://www.youtube.com/playlist?list=PLuEp4OGUFN9s2Lw4msL-5xevemYEPcLCS	PLuEp4OGUFN9s2Lw4msL-5xevemYEPcLCS	https://i.ytimg.com/vi/PLuEp4OGUFN9s2Lw4msL-5xevemYEPcLCS/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.556588	2026-01-20 05:46:49.556588
193	Học jQuery cơ bản	Khóa học jQuery bằng tiếng Việt	jQuery	CiOne eLearning	https://www.youtube.com/playlist?list=PL75xdq9Y-GaQly0pFP2pFO8xYYfLQXjtG	PL75xdq9Y-GaQly0pFP2pFO8xYYfLQXjtG	https://i.ytimg.com/vi/PL75xdq9Y-GaQly0pFP2pFO8xYYfLQXjtG/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.557153	2026-01-20 05:46:49.557153
194	Khóa Học Lập Trình Jquery Với Project Thực Tế	Khóa học jQuery bằng tiếng Việt	jQuery	Coding Is Life	https://www.youtube.com/playlist?list=PLttNL2ipMblsb9w03TUDAInwnH-bXaTft	PLttNL2ipMblsb9w03TUDAInwnH-bXaTft	https://i.ytimg.com/vi/PLttNL2ipMblsb9w03TUDAInwnH-bXaTft/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.55772	2026-01-20 05:46:49.55772
195	Học Jquery	Khóa học jQuery bằng tiếng Việt	jQuery	Tiến Nguyễn	https://www.youtube.com/playlist?list=PLJz8fm2GRwfX6F-Ed8BFH7NH5K5Z4b02f	PLJz8fm2GRwfX6F-Ed8BFH7NH5K5Z4b02f	https://i.ytimg.com/vi/PLJz8fm2GRwfX6F-Ed8BFH7NH5K5Z4b02f/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.558747	2026-01-20 05:46:49.558747
196	Tự học Jquery	Khóa học jQuery bằng tiếng Việt	jQuery	Tiến Nguyễn	https://www.youtube.com/playlist?list=PLJz8fm2GRwfX7ZbZGuOSpsdQ1BBdzsPeN	PLJz8fm2GRwfX7ZbZGuOSpsdQ1BBdzsPeN	https://i.ytimg.com/vi/PLJz8fm2GRwfX7ZbZGuOSpsdQ1BBdzsPeN/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.559302	2026-01-20 05:46:49.559302
197	Học jQuery từ cơ bản đến nâng cao	Khóa học jQuery bằng tiếng Việt	jQuery	Ngọc Hoàng IT	https://www.youtube.com/playlist?list=PLjjB_k3ljmLRu_Xvtq7pxOEhgikS6xonm	PLjjB_k3ljmLRu_Xvtq7pxOEhgikS6xonm	https://i.ytimg.com/vi/PLjjB_k3ljmLRu_Xvtq7pxOEhgikS6xonm/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.55991	2026-01-20 05:46:49.55991
198	Hướng dẫn lập trình Swift iOS từ A đến Z	Khóa học Swift bằng tiếng Việt	Swift	Thạch Phạm Dev	https://www.youtube.com/playlist?list=PLRb-vAn1juPSOsB7sUhs6QYLkMg1mYawl	PLRb-vAn1juPSOsB7sUhs6QYLkMg1mYawl	https://i.ytimg.com/vi/PLRb-vAn1juPSOsB7sUhs6QYLkMg1mYawl/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.560496	2026-01-20 05:46:49.560496
199	Tự Học Swift iOS	Khóa học Swift bằng tiếng Việt	Swift	Học Lập Trình Cho Người Mới	https://www.youtube.com/playlist?list=PLOxRl_MBrBg9plgHWtA2R62CRzRPW7Pvq	PLOxRl_MBrBg9plgHWtA2R62CRzRPW7Pvq	https://i.ytimg.com/vi/PLOxRl_MBrBg9plgHWtA2R62CRzRPW7Pvq/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.561076	2026-01-20 05:46:49.561076
200	Học lập trình Swift 3 - Cơ bản	Khóa học Swift bằng tiếng Việt	Swift	edu TV	https://www.youtube.com/playlist?list=PL4VEtQ6PTTQFCBxdxUIS3h6h7wSTEHrPu	PL4VEtQ6PTTQFCBxdxUIS3h6h7wSTEHrPu	https://i.ytimg.com/vi/PL4VEtQ6PTTQFCBxdxUIS3h6h7wSTEHrPu/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.56165	2026-01-20 05:46:49.56165
201	Lập trình iOS - Swift	Khóa học Swift bằng tiếng Việt	Swift	laptrinh0kho	https://www.youtube.com/playlist?list=PLBgIyLVk3GlT07wf1UPCDg6duV2iDKVbu	PLBgIyLVk3GlT07wf1UPCDg6duV2iDKVbu	https://i.ytimg.com/vi/PLBgIyLVk3GlT07wf1UPCDg6duV2iDKVbu/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.562241	2026-01-20 05:46:49.562241
202	Lập trình iOS với SwiftUI	Khóa học Swift bằng tiếng Việt	Swift	laptrinh0kho	https://www.youtube.com/playlist?list=PLBgIyLVk3GlSGQ68t3Qvfqg_x_RacLXje	PLBgIyLVk3GlSGQ68t3Qvfqg_x_RacLXje	https://i.ytimg.com/vi/PLBgIyLVk3GlSGQ68t3Qvfqg_x_RacLXje/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.562829	2026-01-20 05:46:49.562829
203	Tự học và xây dựng 10 ứng dụng IOS với SWIFT	Khóa học Swift bằng tiếng Việt	Swift	Thích Code	https://www.youtube.com/playlist?list=PLw0_ti13tferyQFB7pJpqbk5mFOjJsyU9	PLw0_ti13tferyQFB7pJpqbk5mFOjJsyU9	https://i.ytimg.com/vi/PLw0_ti13tferyQFB7pJpqbk5mFOjJsyU9/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.563388	2026-01-20 05:46:49.563388
204	Lập trình iOS cơ bản với Swift 3 và Xcode 8	Khóa học Swift bằng tiếng Việt	Swift	Trung Tâm Đào Tạo Công Nghệ Khoa Phạm	https://www.youtube.com/playlist?list=PLzrVYRai0riSlAocQR3BvHCtEhcKa204E	PLzrVYRai0riSlAocQR3BvHCtEhcKa204E	https://i.ytimg.com/vi/PLzrVYRai0riSlAocQR3BvHCtEhcKa204E/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.564073	2026-01-20 05:46:49.564073
205	Swift - Tổng quan	Khóa học Swift bằng tiếng Việt	Swift	Dev Step by Step	https://www.youtube.com/playlist?list=PLR1-CgtL7hK6bbuXUSgAKZveZsKa2tehl	PLR1-CgtL7hK6bbuXUSgAKZveZsKa2tehl	https://i.ytimg.com/vi/PLR1-CgtL7hK6bbuXUSgAKZveZsKa2tehl/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.564677	2026-01-20 05:46:49.564677
206	Học lập trình AutoIt từ cơ bản đến nâng cao	Khóa học AutoIt bằng tiếng Việt	AutoIt	J2TEAM	https://www.youtube.com/playlist?list=PLRqrlsp_0RPWgxqRv5vlXFFpa3s4VA7zZ	PLRqrlsp_0RPWgxqRv5vlXFFpa3s4VA7zZ	https://i.ytimg.com/vi/PLRqrlsp_0RPWgxqRv5vlXFFpa3s4VA7zZ/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.565269	2026-01-20 05:46:49.565269
207	Học AutoIT	Khóa học AutoIt bằng tiếng Việt	AutoIt	nghịch máy tính	https://www.youtube.com/playlist?list=PLYi1bpA-AvSC7cGGZTTwLXP4azlMaUVKN	PLYi1bpA-AvSC7cGGZTTwLXP4azlMaUVKN	https://i.ytimg.com/vi/PLYi1bpA-AvSC7cGGZTTwLXP4azlMaUVKN/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.565863	2026-01-20 05:46:49.565863
208	AutoIT - Cách làm Auto Chuột và Bàn Phím	Khóa học AutoIt bằng tiếng Việt	AutoIt	LeeSai	https://www.youtube.com/playlist?list=PLNeDQQ_ukvRpn7NfdLvtQ9PgVJfkNEsAr	PLNeDQQ_ukvRpn7NfdLvtQ9PgVJfkNEsAr	https://i.ytimg.com/vi/PLNeDQQ_ukvRpn7NfdLvtQ9PgVJfkNEsAr/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.56688	2026-01-20 05:46:49.56688
209	Học lập trình Auto game bằng AutoIT	Khóa học AutoIt bằng tiếng Việt	AutoIt	LongHai Auto	https://www.youtube.com/playlist?list=PLAFIcN_lkOfDP78ug2IhgO0heMJ9N2Kxl	PLAFIcN_lkOfDP78ug2IhgO0heMJ9N2Kxl	https://i.ytimg.com/vi/PLAFIcN_lkOfDP78ug2IhgO0heMJ9N2Kxl/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.567477	2026-01-20 05:46:49.567477
210	Học Cheat Engine với AutoIT	Khóa học AutoIt bằng tiếng Việt	AutoIt	LeeSai	https://www.youtube.com/playlist?list=PLNeDQQ_ukvRrPcOXOQW47aalcFM9T8wIw	PLNeDQQ_ukvRrPcOXOQW47aalcFM9T8wIw	https://i.ytimg.com/vi/PLNeDQQ_ukvRrPcOXOQW47aalcFM9T8wIw/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.568034	2026-01-20 05:46:49.568034
211	Auto Game Tutorial	Khóa học AutoIt bằng tiếng Việt	AutoIt	Tool By Autoit	https://www.youtube.com/playlist?list=PLlhlxkw8o0Ga8Vg3Sw5iXHubFxoOvV6aq	PLlhlxkw8o0Ga8Vg3Sw5iXHubFxoOvV6aq	https://i.ytimg.com/vi/PLlhlxkw8o0Ga8Vg3Sw5iXHubFxoOvV6aq/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.568588	2026-01-20 05:46:49.568588
212	Học AutoIT - Auto game BoomOnline	Khóa học AutoIt bằng tiếng Việt	AutoIt	Triển IS Official	https://www.youtube.com/playlist?list=PLMz2PqxT4j96uqILfWfypxsUPz9UiZZOM	PLMz2PqxT4j96uqILfWfypxsUPz9UiZZOM	https://i.ytimg.com/vi/PLMz2PqxT4j96uqILfWfypxsUPz9UiZZOM/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.56913	2026-01-20 05:46:49.56913
213	Khóa tự học machine learning cơ bản	Khóa học Machine Learning bằng tiếng Việt	Machine Learning	Son Nguyen	https://www.youtube.com/playlist?list=PLZEIt444jqpBPoqtW2ARJp9ICnF3c7vJC	PLZEIt444jqpBPoqtW2ARJp9ICnF3c7vJC	https://i.ytimg.com/vi/PLZEIt444jqpBPoqtW2ARJp9ICnF3c7vJC/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.569683	2026-01-20 05:46:49.569683
214	Tự học Machine Learning	Khóa học Machine Learning bằng tiếng Việt	Machine Learning	Thân Quang Khoát	https://www.youtube.com/playlist?list=PLaKukjQCR56ZRh2cAkweftiZCF2sTg11_	PLaKukjQCR56ZRh2cAkweftiZCF2sTg11_	https://i.ytimg.com/vi/PLaKukjQCR56ZRh2cAkweftiZCF2sTg11_/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.570291	2026-01-20 05:46:49.570291
215	Lập trình Machine learning cơ bản với Python	Khóa học Machine Learning bằng tiếng Việt	Machine Learning	K team	https://www.youtube.com/playlist?list=PL33lvabfss1zLDVHXW_YUJxhxBFap-vm_	PL33lvabfss1zLDVHXW_YUJxhxBFap-vm_	https://i.ytimg.com/vi/PL33lvabfss1zLDVHXW_YUJxhxBFap-vm_/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.571087	2026-01-20 05:46:49.571087
216	Machine Learning Cơ Bản	Khóa học Machine Learning bằng tiếng Việt	Machine Learning	Học Lập Trình cùng Phát	https://www.youtube.com/playlist?list=PLu-LVHS6JzYjoUuPAwcE9sff2NMrEH6KD	PLu-LVHS6JzYjoUuPAwcE9sff2NMrEH6KD	https://i.ytimg.com/vi/PLu-LVHS6JzYjoUuPAwcE9sff2NMrEH6KD/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.571828	2026-01-20 05:46:49.571828
217	Machine learning cơ bản (Học máy thống kê)	Khóa học Machine Learning bằng tiếng Việt	Machine Learning	Bài Học 10 Phút	https://www.youtube.com/playlist?list=PLpDNYPX7w1RYeDSr3q0EJA978jjuMz4TX	PLpDNYPX7w1RYeDSr3q0EJA978jjuMz4TX	https://i.ytimg.com/vi/PLpDNYPX7w1RYeDSr3q0EJA978jjuMz4TX/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.572443	2026-01-20 05:46:49.572443
218	Machine learning vietsub	Khóa học Machine Learning bằng tiếng Việt	Machine Learning	Lân ở Đức	https://www.youtube.com/playlist?list=PLDpRz2wA0qZzTcDLeXP5PSCfmQ96l9-Qr	PLDpRz2wA0qZzTcDLeXP5PSCfmQ96l9-Qr	https://i.ytimg.com/vi/PLDpRz2wA0qZzTcDLeXP5PSCfmQ96l9-Qr/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.573012	2026-01-20 05:46:49.573012
219	Machine Learning	Khóa học Machine Learning bằng tiếng Việt	Machine Learning	Son Tran	https://www.youtube.com/playlist?list=PLsWjY--3QXFWE1Nk6erXuTSf3QLC161pm	PLsWjY--3QXFWE1Nk6erXuTSf3QLC161pm	https://i.ytimg.com/vi/PLsWjY--3QXFWE1Nk6erXuTSf3QLC161pm/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.573605	2026-01-20 05:46:49.573605
220	Học MySQL, học Database	Khóa học MySQL bằng tiếng Việt	MySQL	Nguyễn Danh Tú	https://www.youtube.com/playlist?list=PLoI3zgRgTJKbmTPE2em22aqed3412CO17	PLoI3zgRgTJKbmTPE2em22aqed3412CO17	https://i.ytimg.com/vi/PLoI3zgRgTJKbmTPE2em22aqed3412CO17/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.574216	2026-01-20 05:46:49.574216
221	Học SQL (sử dụng MySQL)	Khóa học MySQL bằng tiếng Việt	MySQL	TITV	https://www.youtube.com/playlist?list=PLyxSzL3F7487f2BrlHKg87WlUEennWOKu	PLyxSzL3F7487f2BrlHKg87WlUEennWOKu	https://i.ytimg.com/vi/PLyxSzL3F7487f2BrlHKg87WlUEennWOKu/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.575169	2026-01-20 05:46:49.575169
222	Học nhanh cơ sở dữ liệu (trên Mysql Workbench)	Khóa học MySQL bằng tiếng Việt	MySQL	Huy Init	https://www.youtube.com/playlist?list=PLDYXQL9eThN4fvrP8J0ASHnxSKJFtkU-Q	PLDYXQL9eThN4fvrP8J0ASHnxSKJFtkU-Q	https://i.ytimg.com/vi/PLDYXQL9eThN4fvrP8J0ASHnxSKJFtkU-Q/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.575747	2026-01-20 05:46:49.575747
223	Học SQL Cơ Bản	Khóa học MySQL bằng tiếng Việt	MySQL	thân triệu	https://www.youtube.com/playlist?list=PLE1qPKuGSJaDkQQB5vK7t7-PRIVjtqeHB	PLE1qPKuGSJaDkQQB5vK7t7-PRIVjtqeHB	https://i.ytimg.com/vi/PLE1qPKuGSJaDkQQB5vK7t7-PRIVjtqeHB/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.576337	2026-01-20 05:46:49.576337
224	Tự Học SQL cùng Vịt - Khóa Cơ Bản cho Người Mới Bắt Đầu	Khóa học MySQL bằng tiếng Việt	MySQL	Vịt làm Data	https://www.youtube.com/playlist?list=PL01fPqVNMdrmtcb_Yui_Oh23X_3laoZoO	PL01fPqVNMdrmtcb_Yui_Oh23X_3laoZoO	https://i.ytimg.com/vi/PL01fPqVNMdrmtcb_Yui_Oh23X_3laoZoO/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.576889	2026-01-20 05:46:49.576889
225	Khóa học cơ sở dữ liệu Mysql	Khóa học MySQL bằng tiếng Việt	MySQL	Lê Vũ Nguyên Vlog	https://www.youtube.com/playlist?list=PLmGP0M1IXtjULXD1KUAf7Snkq9O0RMsYT	PLmGP0M1IXtjULXD1KUAf7Snkq9O0RMsYT	https://i.ytimg.com/vi/PLmGP0M1IXtjULXD1KUAf7Snkq9O0RMsYT/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.577461	2026-01-20 05:46:49.577461
226	Khoá học PHP & MYSQL bài bản từ A-Z	Khóa học MySQL bằng tiếng Việt	MySQL	Hienu	https://www.youtube.com/playlist?list=PL88QwC-jiH9ByYqO0mVStNEHB6QT24yx1	PL88QwC-jiH9ByYqO0mVStNEHB6QT24yx1	https://i.ytimg.com/vi/PL88QwC-jiH9ByYqO0mVStNEHB6QT24yx1/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.578126	2026-01-20 05:46:49.578126
227	Hướng dẫn học R	Khóa học R bằng tiếng Việt	R	SciEco	https://www.youtube.com/playlist?list=PLMIaO-u3S5-jO2rMt8r8HD5ifiZv_Sd9O	PLMIaO-u3S5-jO2rMt8r8HD5ifiZv_Sd9O	https://i.ytimg.com/vi/PLMIaO-u3S5-jO2rMt8r8HD5ifiZv_Sd9O/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.578698	2026-01-20 05:46:49.578698
228	Hướng dẫn phần mềm thống kê R và R-studio	Khóa học R bằng tiếng Việt	R	Bài Học 10 Phút	https://www.youtube.com/playlist?list=PLpDNYPX7w1RYuBxWT0blVTrmxyb9KfJMg	PLpDNYPX7w1RYuBxWT0blVTrmxyb9KfJMg	https://i.ytimg.com/vi/PLpDNYPX7w1RYuBxWT0blVTrmxyb9KfJMg/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.579261	2026-01-20 05:46:49.579261
229	Bài giảng về ngôn ngữ R	Khóa học R bằng tiếng Việt	R	Nguyễn Văn Tuấn	https://www.youtube.com/playlist?list=PLbRKZL7ww3qj1f1FjDE7Wl6tkZebPPrf2	PLbRKZL7ww3qj1f1FjDE7Wl6tkZebPPrf2	https://i.ytimg.com/vi/PLbRKZL7ww3qj1f1FjDE7Wl6tkZebPPrf2/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.579841	2026-01-20 05:46:49.579841
230	HỌC R SIÊU NHANH QUA CASE STUDY | R CRASH COURSE	Khóa học R bằng tiếng Việt	R	DUC NGUYEN	https://www.youtube.com/playlist?list=PLCKFKYBfLgPV07MhYMoOMlazOSS7KwKuA	PLCKFKYBfLgPV07MhYMoOMlazOSS7KwKuA	https://i.ytimg.com/vi/PLCKFKYBfLgPV07MhYMoOMlazOSS7KwKuA/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.580378	2026-01-20 05:46:49.580378
231	HƯỚNG DẪN SỬ DỤNG R ĐỂ XỬ LÝ DỮ LIỆU	Khóa học R bằng tiếng Việt	R	DUC NGUYEN	https://www.youtube.com/playlist?list=PLCKFKYBfLgPU4mSgJ-5MhGDcki2UTBr2H	PLCKFKYBfLgPU4mSgJ-5MhGDcki2UTBr2H	https://i.ytimg.com/vi/PLCKFKYBfLgPU4mSgJ-5MhGDcki2UTBr2H/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.580963	2026-01-20 05:46:49.580963
232	Phân tích dữ liệu bằng ngôn ngữ R	Khóa học R bằng tiếng Việt	R	Chiến Tiên Nhân	https://www.youtube.com/playlist?list=PLteVqnBNrrGWr8qmCJienB1ySL93aiIpW	PLteVqnBNrrGWr8qmCJienB1ySL93aiIpW	https://i.ytimg.com/vi/PLteVqnBNrrGWr8qmCJienB1ySL93aiIpW/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.58163	2026-01-20 05:46:49.58163
233	Thống kê trong R-Studio	Khóa học R bằng tiếng Việt	R	[Học một chút]	https://www.youtube.com/playlist?list=PL9XZJEFXvG9E9HJn2n1Gu_TLAsVPc1MkJ	PL9XZJEFXvG9E9HJn2n1Gu_TLAsVPc1MkJ	https://i.ytimg.com/vi/PL9XZJEFXvG9E9HJn2n1Gu_TLAsVPc1MkJ/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.582215	2026-01-20 05:46:49.582215
234	Tự Học TypeScript Cơ Bản Từ A đến Z Cho Người Mới Bắt Đầu	Khóa học TypeScript bằng tiếng Việt	TypeScript	Hỏi Dân IT	https://www.youtube.com/playlist?list=PLncHg6Kn2JT5emvXmG6kgeGkrQjRqxsb4	PLncHg6Kn2JT5emvXmG6kgeGkrQjRqxsb4	https://i.ytimg.com/vi/PLncHg6Kn2JT5emvXmG6kgeGkrQjRqxsb4/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.583054	2026-01-20 05:46:49.583054
235	Tự học TypeScript 2021	Khóa học TypeScript bằng tiếng Việt	TypeScript	CodersX	https://www.youtube.com/playlist?list=PLkY6Xj8Sg8-vTdKt2QdlCqoIKEFrWHx9l	PLkY6Xj8Sg8-vTdKt2QdlCqoIKEFrWHx9l	https://i.ytimg.com/vi/PLkY6Xj8Sg8-vTdKt2QdlCqoIKEFrWHx9l/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.583625	2026-01-20 05:46:49.583625
236	Typescript cơ bản	Khóa học TypeScript bằng tiếng Việt	TypeScript	Easy Frontend	https://www.youtube.com/playlist?list=PLeS7aZkL6GOtUGTQ81kfm3iGlRTycKjrZ	PLeS7aZkL6GOtUGTQ81kfm3iGlRTycKjrZ	https://i.ytimg.com/vi/PLeS7aZkL6GOtUGTQ81kfm3iGlRTycKjrZ/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.584174	2026-01-20 05:46:49.584174
237	Lập trình TypeScript	Khóa học TypeScript bằng tiếng Việt	TypeScript	ZendVN	https://www.youtube.com/playlist?list=PLv6GftO355AsQtYp_YrsqEihOCiNlZkCb	PLv6GftO355AsQtYp_YrsqEihOCiNlZkCb	https://i.ytimg.com/vi/PLv6GftO355AsQtYp_YrsqEihOCiNlZkCb/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.58474	2026-01-20 05:46:49.58474
238	ReactJS và Typescript Cho Người Mới Bắt Đầu	Khóa học TypeScript bằng tiếng Việt	TypeScript	Ninedev	https://www.youtube.com/playlist?list=PLnRJxWEhhmzpneEcZIZY_fs18OANMlxhA	PLnRJxWEhhmzpneEcZIZY_fs18OANMlxhA	https://i.ytimg.com/vi/PLnRJxWEhhmzpneEcZIZY_fs18OANMlxhA/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.585289	2026-01-20 05:46:49.585289
239	Tự Học Fullstack Next.js/Nest.js (TypeScript)	Khóa học TypeScript bằng tiếng Việt	TypeScript	Hỏi Dân IT	https://www.youtube.com/playlist?list=PLncHg6Kn2JT5009M5nlo_un6wlIHM-0HS	PLncHg6Kn2JT5009M5nlo_un6wlIHM-0HS	https://i.ytimg.com/vi/PLncHg6Kn2JT5009M5nlo_un6wlIHM-0HS/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.585827	2026-01-20 05:46:49.585827
240	ES6 & TypeScript cho người mới bắt đầu	Khóa học TypeScript bằng tiếng Việt	TypeScript	TEDU	https://www.youtube.com/playlist?list=PLRhlTlpDUWswObIX8HNCSHWOpgvjMiMe2	PLRhlTlpDUWswObIX8HNCSHWOpgvjMiMe2	https://i.ytimg.com/vi/PLRhlTlpDUWswObIX8HNCSHWOpgvjMiMe2/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.586432	2026-01-20 05:46:49.586432
241	Khoá học Vuejs từ cơ bản đến nâng cao	Khóa học Vue.js bằng tiếng Việt	Vue.js	Tech Mely	https://www.youtube.com/playlist?list=PLwJIrGynFq9B_BQJZJi-ikWDDkYKVUpM5	PLwJIrGynFq9B_BQJZJi-ikWDDkYKVUpM5	https://i.ytimg.com/vi/PLwJIrGynFq9B_BQJZJi-ikWDDkYKVUpM5/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.587121	2026-01-20 05:46:49.587121
242	VueJS Dành Cho Người Mới Bắt Đầu 2024	Khóa học Vue.js bằng tiếng Việt	Vue.js	Ninedev	https://www.youtube.com/playlist?list=PLnRJxWEhhmzrtVhPAzNCv4DbQk1R7_fS4	PLnRJxWEhhmzrtVhPAzNCv4DbQk1R7_fS4	https://i.ytimg.com/vi/PLnRJxWEhhmzrtVhPAzNCv4DbQk1R7_fS4/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.587946	2026-01-20 05:46:49.587946
243	Học Vue JS 2 cơ bản	Khóa học Vue.js bằng tiếng Việt	Vue.js	RHP Team	https://www.youtube.com/playlist?list=PLU4OBh9yHE95G_Y1cUVY-5Mc9P-rQBY3F	PLU4OBh9yHE95G_Y1cUVY-5Mc9P-rQBY3F	https://i.ytimg.com/vi/PLU4OBh9yHE95G_Y1cUVY-5Mc9P-rQBY3F/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.589001	2026-01-20 05:46:49.589001
244	Lập trình VueJS	Khóa học Vue.js bằng tiếng Việt	Vue.js	ZendVN	https://www.youtube.com/playlist?list=PLv6GftO355AtDjStqeyXvhA1oRLuhvJWf	PLv6GftO355AtDjStqeyXvhA1oRLuhvJWf	https://i.ytimg.com/vi/PLv6GftO355AtDjStqeyXvhA1oRLuhvJWf/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.58974	2026-01-20 05:46:49.58974
245	Vue js 3 Cơ Bản	Khóa học Vue.js bằng tiếng Việt	Vue.js	Tips Web Hay	https://www.youtube.com/playlist?list=PL7akNQhSmpsZUB7aP-ttyYVHHaKjn0W7P	PL7akNQhSmpsZUB7aP-ttyYVHHaKjn0W7P	https://i.ytimg.com/vi/PL7akNQhSmpsZUB7aP-ttyYVHHaKjn0W7P/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.590355	2026-01-20 05:46:49.590355
246	Series Tự học Vuejs 3 A - Z	Khóa học Vue.js bằng tiếng Việt	Vue.js	Tự học lập trình từ A đến Z	https://www.youtube.com/playlist?list=PLieV0Y7g-FFy_hVCs3lf973Yo8_rsRGc0	PLieV0Y7g-FFy_hVCs3lf973Yo8_rsRGc0	https://i.ytimg.com/vi/PLieV0Y7g-FFy_hVCs3lf973Yo8_rsRGc0/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.591037	2026-01-20 05:46:49.591037
247	Demo Dự án Vue JS 3!	Khóa học Vue.js bằng tiếng Việt	Vue.js	Tips Web Hay	https://www.youtube.com/playlist?list=PL7akNQhSmpsYTQsV6jqZmmlLEu37IWA7f	PL7akNQhSmpsYTQsV6jqZmmlLEu37IWA7f	https://i.ytimg.com/vi/PL7akNQhSmpsYTQsV6jqZmmlLEu37IWA7f/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.593144	2026-01-20 05:46:49.593144
248	Tự học NoSQL - MongoDB	Khóa học MongoDB bằng tiếng Việt	MongoDB	ZendVN	https://www.youtube.com/playlist?list=PLv6GftO355Aug0rwKfb6v96mlYrwOw7XV	PLv6GftO355Aug0rwKfb6v96mlYrwOw7XV	https://i.ytimg.com/vi/PLv6GftO355Aug0rwKfb6v96mlYrwOw7XV/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.594923	2026-01-20 05:46:49.594923
249	Mongo DB cơ bản	Khóa học MongoDB bằng tiếng Việt	MongoDB	RHP Team	https://www.youtube.com/playlist?list=PLU4OBh9yHE94QAav7qIuaTtH9-pq39We8	PLU4OBh9yHE94QAav7qIuaTtH9-pq39We8	https://i.ytimg.com/vi/PLU4OBh9yHE94QAav7qIuaTtH9-pq39We8/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.598187	2026-01-20 05:46:49.598187
250	MongoDB 2020	Khóa học MongoDB bằng tiếng Việt	MongoDB	CodersX	https://www.youtube.com/playlist?list=PLkY6Xj8Sg8-vgHI_wNWPHKdiRwlgQXaTR	PLkY6Xj8Sg8-vgHI_wNWPHKdiRwlgQXaTR	https://i.ytimg.com/vi/PLkY6Xj8Sg8-vgHI_wNWPHKdiRwlgQXaTR/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.599023	2026-01-20 05:46:49.599023
251	Học lập trình Web BackEnd NodeJS và MongoDB thực chiến	Khóa học MongoDB bằng tiếng Việt	MongoDB	Thien Tam Nguyen	https://www.youtube.com/playlist?list=PLimFJKGsbn1lQlDQW3A5yb2CdVJ8MqqG8	PLimFJKGsbn1lQlDQW3A5yb2CdVJ8MqqG8	https://i.ytimg.com/vi/PLimFJKGsbn1lQlDQW3A5yb2CdVJ8MqqG8/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.600008	2026-01-20 05:46:49.600008
252	Khóa học lập trình backend Nodejs và MongoDB	Khóa học MongoDB bằng tiếng Việt	MongoDB	Kênh Tổng Hợp Source Code Website	https://www.youtube.com/playlist?list=PLEnECmpTzvQO-1tEWazRmPNV02vkUhU0R	PLEnECmpTzvQO-1tEWazRmPNV02vkUhU0R	https://i.ytimg.com/vi/PLEnECmpTzvQO-1tEWazRmPNV02vkUhU0R/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.602718	2026-01-20 05:46:49.602718
253	Học Lập Trình PHP + Mysql	Khóa học PHP bằng tiếng Việt	PHP	Hoàng Thương Official	https://www.youtube.com/playlist?list=PLaevEBkXyvnXEMoe6ZHFJGjPDb_eCCVNc	PLaevEBkXyvnXEMoe6ZHFJGjPDb_eCCVNc	https://i.ytimg.com/vi/PLaevEBkXyvnXEMoe6ZHFJGjPDb_eCCVNc/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.607651	2026-01-20 05:46:49.607651
254	Tự Học Lập trình PHP	Khóa học PHP bằng tiếng Việt	PHP	Học Lập Trình Online	https://www.youtube.com/playlist?list=PLv6GftO355AsZFXlWLKob6tMsWZa4VCY1	PLv6GftO355AsZFXlWLKob6tMsWZa4VCY1	https://i.ytimg.com/vi/PLv6GftO355AsZFXlWLKob6tMsWZa4VCY1/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.60971	2026-01-20 05:46:49.60971
255	Tự học PHP  Laravel Framework cho người mới bắt đầu	Khóa học PHP bằng tiếng Việt	PHP	Đặng Kim Thi	https://www.youtube.com/playlist?list=PLsVJaIeVT78qJEPWJ9rIwgPCcmuVI-r4k	PLsVJaIeVT78qJEPWJ9rIwgPCcmuVI-r4k	https://i.ytimg.com/vi/PLsVJaIeVT78qJEPWJ9rIwgPCcmuVI-r4k/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.610593	2026-01-20 05:46:49.610593
256	Lập trình PHP1 - SU22	Khóa học PHP bằng tiếng Việt	PHP	Thầy Hộ Fpoly	https://www.youtube.com/playlist?list=PLieAxB9_noZlWuur0Hxw7BIYVbGJ-hS0N	PLieAxB9_noZlWuur0Hxw7BIYVbGJ-hS0N	https://i.ytimg.com/vi/PLieAxB9_noZlWuur0Hxw7BIYVbGJ-hS0N/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.611206	2026-01-20 05:46:49.611206
257	Học php từ cơ bản đến nâng cao - web bán hàng	Khóa học PHP bằng tiếng Việt	PHP	gv cybersoft	https://www.youtube.com/playlist?list=PLSMUwja5VsJWoq5VmD5cW2Xoy52FILBV3	PLSMUwja5VsJWoq5VmD5cW2Xoy52FILBV3	https://i.ytimg.com/vi/PLSMUwja5VsJWoq5VmD5cW2Xoy52FILBV3/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.611921	2026-01-20 05:46:49.611921
258	Tự Học Sass	Khóa học SASS bằng tiếng Việt	SASS	Học Lập Trình Online	https://www.youtube.com/playlist?list=PLv6GftO355AtWld1EE7SBAH-OkKKt23Bb	PLv6GftO355AtWld1EE7SBAH-OkKKt23Bb	https://i.ytimg.com/vi/PLv6GftO355AtWld1EE7SBAH-OkKKt23Bb/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.61275	2026-01-20 05:46:49.61275
259	Khóa học lập trình CSS và SASS nâng cao cho website Landing Page 2019	Khóa học SASS bằng tiếng Việt	SASS	K team	https://www.youtube.com/playlist?list=PL33lvabfss1wstoZNI8szds9s0ESVbuqs	PL33lvabfss1wstoZNI8szds9s0ESVbuqs	https://i.ytimg.com/vi/PL33lvabfss1wstoZNI8szds9s0ESVbuqs/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.613395	2026-01-20 05:46:49.613395
260	Khóa Học Lập Trình SCSS Từ Căn Bản Đến Nâng Cao	Khóa học SASS bằng tiếng Việt	SASS	Nghiep Phan	https://www.youtube.com/playlist?list=PLJ5qtRQovuEMWzLVs3iuwcNsWeElizTwF	PLJ5qtRQovuEMWzLVs3iuwcNsWeElizTwF	https://i.ytimg.com/vi/PLJ5qtRQovuEMWzLVs3iuwcNsWeElizTwF/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.614648	2026-01-20 05:46:49.614648
261	Khóa Học Lập Trình SASS	Khóa học SASS bằng tiếng Việt	SASS	IT News	https://www.youtube.com/playlist?list=PLIRbquK6vGyf7sCUAGAYFOrS-kgbBc-O1	PLIRbquK6vGyf7sCUAGAYFOrS-kgbBc-O1	https://i.ytimg.com/vi/PLIRbquK6vGyf7sCUAGAYFOrS-kgbBc-O1/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.615395	2026-01-20 05:46:49.615395
262	SASS	Khóa học SASS bằng tiếng Việt	SASS	ZenDvn	https://www.youtube.com/playlist?list=PLw_erwgZq4-EGs9VEEKROpDbjCuzgx01W	PLw_erwgZq4-EGs9VEEKROpDbjCuzgx01W	https://i.ytimg.com/vi/PLw_erwgZq4-EGs9VEEKROpDbjCuzgx01W/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.616075	2026-01-20 05:46:49.616075
263	HTML, CSS từ Zero Tới Hero	Khóa học HTML, CSS bằng tiếng Việt	HTML, CSS	F8 Official	https://www.youtube.com/playlist?list=PL_-VfJajZj0U9nEXa4qyfB4U5ZIYCMPlz	PL_-VfJajZj0U9nEXa4qyfB4U5ZIYCMPlz	https://i.ytimg.com/vi/PL_-VfJajZj0U9nEXa4qyfB4U5ZIYCMPlz/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.616668	2026-01-20 05:46:49.616668
264	HTML, CSS cơ bản dễ hiểu- học lập trình online miễn phí	Khóa học HTML, CSS bằng tiếng Việt	HTML, CSS	Gà Lại Lập Trình	https://www.youtube.com/playlist?list=PLPt6-BtUI22oveeGAyckbAXRSmTBGLZP4	PLPt6-BtUI22oveeGAyckbAXRSmTBGLZP4	https://i.ytimg.com/vi/PLPt6-BtUI22oveeGAyckbAXRSmTBGLZP4/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.617226	2026-01-20 05:46:49.617226
265	HTML Cơ Bản	Khóa học HTML, CSS bằng tiếng Việt	HTML, CSS	Thạch Phạm	https://www.youtube.com/playlist?list=PLl4nkmb3a8w135_M4YRPzYD9_6tERz3ce	PLl4nkmb3a8w135_M4YRPzYD9_6tERz3ce	https://i.ytimg.com/vi/PLl4nkmb3a8w135_M4YRPzYD9_6tERz3ce/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.617902	2026-01-20 05:46:49.617902
266	CSS Cơ Bản	Khóa học HTML, CSS bằng tiếng Việt	HTML, CSS	Thạch Phạm	https://www.youtube.com/playlist?list=PLl4nkmb3a8w1cnIhegAj5_mE8w_mbYvY4	PLl4nkmb3a8w1cnIhegAj5_mE8w_mbYvY4	https://i.ytimg.com/vi/PLl4nkmb3a8w1cnIhegAj5_mE8w_mbYvY4/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.618688	2026-01-20 05:46:49.618688
267	Lập trình Android với Kotlin full tại Khoa Phạm	Khóa học Kotlin bằng tiếng Việt	Kotlin	Khoa Phạm	https://www.youtube.com/playlist?list=PLzrVYRai0riRFcvx8VYTF7fx4hXbd_nhU	PLzrVYRai0riRFcvx8VYTF7fx4hXbd_nhU	https://i.ytimg.com/vi/PLzrVYRai0riRFcvx8VYTF7fx4hXbd_nhU/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.620023	2026-01-20 05:46:49.620023
268	Lập trình Kotlin từ cơ bản đến nâng cao	Khóa học Kotlin bằng tiếng Việt	Kotlin	Anh Nguyen Ngoc	https://www.youtube.com/playlist?list=PLn9lhDYvf_3E_5JZ-1jlk67o9101Lu9N6	PLn9lhDYvf_3E_5JZ-1jlk67o9101Lu9N6	https://i.ytimg.com/vi/PLn9lhDYvf_3E_5JZ-1jlk67o9101Lu9N6/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.62071	2026-01-20 05:46:49.62071
269	[2024] Học Next.js 14 miễn phí | Khóa học NextJs TypeScript siêu chi tiết | Được Dev	Khóa học Next.js bằng tiếng Việt	Next.js	Được Dev	https://www.youtube.com/playlist?list=PLFfVmM19UNqn1ZIWvxn1artfz-C6dgAFb	PLFfVmM19UNqn1ZIWvxn1artfz-C6dgAFb	https://i.ytimg.com/vi/PLFfVmM19UNqn1ZIWvxn1artfz-C6dgAFb/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.621405	2026-01-20 05:46:49.621405
270	Tự Học Next.JS Cơ Bản (với React và TypeScript) | Hỏi Dân IT	Khóa học Next.js bằng tiếng Việt	Next.js	Hỏi Dân IT	https://www.youtube.com/playlist?list=PLncHg6Kn2JT6zw4JiFOE1z90ghnyrFl5B	PLncHg6Kn2JT6zw4JiFOE1z90ghnyrFl5B	https://i.ytimg.com/vi/PLncHg6Kn2JT6zw4JiFOE1z90ghnyrFl5B/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.622529	2026-01-20 05:46:49.622529
271	NextJS cơ bản 🎉	Khóa học Next.js bằng tiếng Việt	Next.js	Easy Frontend	https://www.youtube.com/playlist?list=PLeS7aZkL6GOuMvDYcyW9VVLCvKnNhm4It	PLeS7aZkL6GOuMvDYcyW9VVLCvKnNhm4It	https://i.ytimg.com/vi/PLeS7aZkL6GOuMvDYcyW9VVLCvKnNhm4It/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.623402	2026-01-20 05:46:49.623402
272	Lập trình NextJS	Khóa học Next.js bằng tiếng Việt	Next.js	Học Lập Trình Online	https://www.youtube.com/playlist?list=PLv6GftO355AvWAQv4or-RE2RAFFXaI3Jz	PLv6GftO355AvWAQv4or-RE2RAFFXaI3Jz	https://i.ytimg.com/vi/PLv6GftO355AvWAQv4or-RE2RAFFXaI3Jz/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.62411	2026-01-20 05:46:49.62411
273	LẬP TRÌNH RUST	Khóa học Rust bằng tiếng Việt	Rust	Jayden Dang	https://www.youtube.com/playlist?list=PLFnEYduGTiXE2ejxmzTIraP2feI-pmeuw	PLFnEYduGTiXE2ejxmzTIraP2feI-pmeuw	https://i.ytimg.com/vi/PLFnEYduGTiXE2ejxmzTIraP2feI-pmeuw/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.625117	2026-01-20 05:46:49.625117
274	Lập trình cơ bản Rust	Khóa học Rust bằng tiếng Việt	Rust	Nguyen Tuan Dung	https://www.youtube.com/playlist?list=PLOB8_oGJl40SPgVOMJ6ivoEgmSvTiSdNQ	PLOB8_oGJl40SPgVOMJ6ivoEgmSvTiSdNQ	https://i.ytimg.com/vi/PLOB8_oGJl40SPgVOMJ6ivoEgmSvTiSdNQ/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.625766	2026-01-20 05:46:49.625766
275	Rust Back-End - Microservices | Server High Performance	Khóa học Rust bằng tiếng Việt	Rust	Jayden Dang	https://www.youtube.com/playlist?list=PLFnEYduGTiXEPQ1pVCcg5zxgBS4RwM6wd	PLFnEYduGTiXEPQ1pVCcg5zxgBS4RwM6wd	https://i.ytimg.com/vi/PLFnEYduGTiXEPQ1pVCcg5zxgBS4RwM6wd/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.626408	2026-01-20 05:46:49.626408
276	Rust	Khóa học Rust bằng tiếng Việt	Rust	Nỡm	https://www.youtube.com/playlist?list=PLbVzvoeVj6gTQvZq46tqqvDQ8d5WZbBPT	PLbVzvoeVj6gTQvZq46tqqvDQ8d5WZbBPT	https://i.ytimg.com/vi/PLbVzvoeVj6gTQvZq46tqqvDQ8d5WZbBPT/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.627015	2026-01-20 05:46:49.627015
277	Tự học SQL - Ngôn ngữ SQL	Khóa học SQL bằng tiếng Việt	SQL	ZendVN	https://www.youtube.com/playlist?list=PLv6GftO355AtXdxv1WLgxmorw3OMesoS7	PLv6GftO355AtXdxv1WLgxmorw3OMesoS7	https://i.ytimg.com/vi/PLv6GftO355AtXdxv1WLgxmorw3OMesoS7/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.628246	2026-01-20 05:46:49.628246
278	Tự Học SQL Cơ Bản Đến Nâng Cao	Khóa học SQL bằng tiếng Việt	SQL	Test Mentor	https://www.youtube.com/playlist?list=PLavGKPtOxApM2hfcLdIU3mVWIo5G2ZX2a	PLavGKPtOxApM2hfcLdIU3mVWIo5G2ZX2a	https://i.ytimg.com/vi/PLavGKPtOxApM2hfcLdIU3mVWIo5G2ZX2a/hqdefault.jpg	advanced	vi	approved	2026-01-20 05:46:49.629039	2026-01-20 05:46:49.629039
279	Khóa học SQL Server cho người mới (2023)	Khóa học SQL Server bằng tiếng Việt	SQL Server	TITV	https://www.youtube.com/playlist?list=PLyxSzL3F7484deka_j1czssCiHygV6oF-	PLyxSzL3F7484deka_j1czssCiHygV6oF-	https://i.ytimg.com/vi/PLyxSzL3F7484deka_j1czssCiHygV6oF-/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.629905	2026-01-20 05:46:49.629905
280	[SQL Server] Khóa học sử dụng SQL server	Khóa học SQL Server bằng tiếng Việt	SQL Server	K team	https://www.youtube.com/playlist?list=PL33lvabfss1xnFpWQF6YH11kMTS1HmLsw	PL33lvabfss1xnFpWQF6YH11kMTS1HmLsw	https://i.ytimg.com/vi/PL33lvabfss1xnFpWQF6YH11kMTS1HmLsw/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.630739	2026-01-20 05:46:49.630739
281	Tự Học SQL Server Cơ Bản	Khóa học SQL Server bằng tiếng Việt	SQL Server	Học Viện Công nghệ MCI	https://www.youtube.com/playlist?list=PLyOUYAtDpqrfVUnjw5h0kG5a2-b9sHNKd	PLyOUYAtDpqrfVUnjw5h0kG5a2-b9sHNKd	https://i.ytimg.com/vi/PLyOUYAtDpqrfVUnjw5h0kG5a2-b9sHNKd/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.631313	2026-01-20 05:46:49.631313
282	Tự học Microsoft SQL Server	Khóa học SQL Server bằng tiếng Việt	SQL Server	1Click2beDBA	https://www.youtube.com/playlist?list=PLNJklplv9g14lsZqtDd879kdyrs02NlBx	PLNJklplv9g14lsZqtDd879kdyrs02NlBx	https://i.ytimg.com/vi/PLNJklplv9g14lsZqtDd879kdyrs02NlBx/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.631853	2026-01-20 05:46:49.631853
283	Lập trình Dart	Khóa học Dart bằng tiếng Việt	Dart	Migolab	https://www.youtube.com/playlist?list=PLRoAKls-7kksChE3OhiE2iAeCa7h1kk5k	PLRoAKls-7kksChE3OhiE2iAeCa7h1kk5k	https://i.ytimg.com/vi/PLRoAKls-7kksChE3OhiE2iAeCa7h1kk5k/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.632476	2026-01-20 05:46:49.632476
284	Lập trình ngôn ngữ Dart | Flutter cơ bản	Khóa học Dart bằng tiếng Việt	Dart	Tùng Sugar	https://www.youtube.com/playlist?list=PLRnNjVSYDePhLyD_bKgQnEGyL6R2-fKU1	PLRnNjVSYDePhLyD_bKgQnEGyL6R2-fKU1	https://i.ytimg.com/vi/PLRnNjVSYDePhLyD_bKgQnEGyL6R2-fKU1/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.633073	2026-01-20 05:46:49.633073
285	Lập trình Dart	Khóa học Dart bằng tiếng Việt	Dart	Coder Studio	https://www.youtube.com/playlist?list=PLanHRxSQZoQEs0ApO55id4KGyXUjPReQA	PLanHRxSQZoQEs0ApO55id4KGyXUjPReQA	https://i.ytimg.com/vi/PLanHRxSQZoQEs0ApO55id4KGyXUjPReQA/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.63364	2026-01-20 05:46:49.63364
286	Git - from Zero to Hero	Khóa học Git bằng tiếng Việt	Git	CodersX	https://www.youtube.com/playlist?list=PLkY6Xj8Sg8-viFVtaVps_h_Emi2wQyE7q	PLkY6Xj8Sg8-viFVtaVps_h_Emi2wQyE7q	https://i.ytimg.com/vi/PLkY6Xj8Sg8-viFVtaVps_h_Emi2wQyE7q/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.634667	2026-01-20 05:46:49.634667
287	Học Git và Github	Khóa học Git bằng tiếng Việt	Git	TITV	https://www.youtube.com/playlist?list=PLyxSzL3F7485Xgn7novgNxnou8QU6i485	PLyxSzL3F7485Xgn7novgNxnou8QU6i485	https://i.ytimg.com/vi/PLyxSzL3F7485Xgn7novgNxnou8QU6i485/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.635375	2026-01-20 05:46:49.635375
288	Git Siêu Căn Bản Cho Người Mới Bắt Đầu Từ Z Đến A với Hỏi Dân IT	Khóa học Git bằng tiếng Việt	Git	Hỏi Dân IT	https://www.youtube.com/playlist?list=PLncHg6Kn2JT6nWS9MRjSnt6Z-9Rj0pAlo	PLncHg6Kn2JT6nWS9MRjSnt6Z-9Rj0pAlo	https://i.ytimg.com/vi/PLncHg6Kn2JT6nWS9MRjSnt6Z-9Rj0pAlo/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.636012	2026-01-20 05:46:49.636012
289	Lập trình Bash Shell Script cơ bản	Khóa học Bash/Shell bằng tiếng Việt	Bash/Shell	Curry	https://www.youtube.com/playlist?list=PLcW6QFb7l0G7ukw6LBcPJbvxbFhgfX9-S	PLcW6QFb7l0G7ukw6LBcPJbvxbFhgfX9-S	https://i.ytimg.com/vi/PLcW6QFb7l0G7ukw6LBcPJbvxbFhgfX9-S/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.636612	2026-01-20 05:46:49.636612
290	SHELL/BASH	Khóa học Bash/Shell bằng tiếng Việt	Bash/Shell	Toan Nguyen	https://www.youtube.com/playlist?list=PL1HxRSJMOMPKOJhefnyfYLICczYTiUGaK	PL1HxRSJMOMPKOJhefnyfYLICczYTiUGaK	https://i.ytimg.com/vi/PL1HxRSJMOMPKOJhefnyfYLICczYTiUGaK/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.637223	2026-01-20 05:46:49.637223
291	Học PostgreSQL qua ví dụ || PostgreSQL Tutorial	Khóa học PostgreSQL bằng tiếng Việt	PostgreSQL	Lập Trình B2A	https://www.youtube.com/playlist?list=PLMbuMydSxMKxfg0OeJJoNsdRTnTIEcqmg	PLMbuMydSxMKxfg0OeJJoNsdRTnTIEcqmg	https://i.ytimg.com/vi/PLMbuMydSxMKxfg0OeJJoNsdRTnTIEcqmg/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.637806	2026-01-20 05:46:49.637806
292	Postgresql cơ bản	Khóa học PostgreSQL bằng tiếng Việt	PostgreSQL	Migolab	https://www.youtube.com/playlist?list=PLRoAKls-7kksI-BbBn_ihFB9sRjSrDrs4	PLRoAKls-7kksI-BbBn_ihFB9sRjSrDrs4	https://i.ytimg.com/vi/PLRoAKls-7kksI-BbBn_ihFB9sRjSrDrs4/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.638422	2026-01-20 05:46:49.638422
293	Từ ruby tới rails 2022	Khóa học Ruby bằng tiếng Việt	Ruby	Lupca	https://www.youtube.com/playlist?list=PL2hl9DVcc5u1f2uhSYko6Ea3bdaI_BGeB	PL2hl9DVcc5u1f2uhSYko6Ea3bdaI_BGeB	https://i.ytimg.com/vi/PL2hl9DVcc5u1f2uhSYko6Ea3bdaI_BGeB/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.639051	2026-01-20 05:46:49.639051
294	Học Ruby on Rails Căn Bản	Khóa học Ruby bằng tiếng Việt	Ruby	Luân Nguyễn Thành	https://www.youtube.com/playlist?list=PLFoXG6w6FhAp8WtQ7GicFWfILjdegaNET	PLFoXG6w6FhAp8WtQ7GicFWfILjdegaNET	https://i.ytimg.com/vi/PLFoXG6w6FhAp8WtQ7GicFWfILjdegaNET/hqdefault.jpg	beginner	vi	approved	2026-01-20 05:46:49.639769	2026-01-20 05:46:49.639769
\.


--
-- TOC entry 3845 (class 0 OID 25789)
-- Dependencies: 224
-- Data for Name: external_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_requests (id, name, email, phone, project_description, status, created_at, title, requirements, technology_stack, timeline, budget_range, budget, deadline, client_id, assigned_developer_id, priority, admin_notes, contact_email, contact_phone, updated_at) FROM stdin;
pg_dump: processing data for table "public.external_requests"
pg_dump: dumping contents of table "public.external_requests"
pg_dump: processing data for table "public.fcm_tokens"
pg_dump: dumping contents of table "public.fcm_tokens"
6	Test User	test@example.com	+84378246333	Test project with Vietnamese phone number - React, Node.js, PostgreSQL	in_progress	2025-08-04 03:59:14.10611	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
5	Test Seller	seller@test.com	0378246333	Project Name: Test 4. toi muon tao web app\nCompany: fpt\nDescription: toi muon tao web app doc baotoi muon tao web app doc baotoi muon tao web app doc baotoi muon tao web app doc bao\nRequirements: - TypeScript\n- Redis\n- Laravel\n- Docker\nBudget: 1000000\nTimeline: 3 ngay	cancelled	2025-08-04 03:44:07.786565	\N	\N	\N	\N	\N	\N	\N	2	\N	normal	\N	\N	\N	\N
4	Test Seller	seller@test.com	0378246333	Project Name: lsdflasjdflasdjfas dfa sdf \nCompany: slasjdfasdf\nDescription: asdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdf\nRequirements: - Python\n- Python\n- Python\n- Python\n- Python\nBudget: 1000000\nTimeline: 3 ngay	completed	2025-08-04 03:42:52.714536	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
3	Test Seller	seller@test.com	+841234567890	Project Name: lsdflasjdflasdjfas dfa sdf \nCompany: slasjdfasdf\nDescription: lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf \nRequirements: - AWS\n- AWS\n- AWS\n- AWS\nBudget: 1000000\nTimeline: 3 ngay	in_progress	2025-08-04 03:32:06.476881	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
2	Test Seller	seller@test.com	+843892342342	Project Name: lsdflasjdflasdjfas dfa sdf \nCompany: N/A\nDescription: alsfjalsdfasdf asd fa sdf á df asd fa sdf á dfa sd fas dfa\nRequirements: - Next.js\n- Python\nBudget: 1000000\nTimeline: 3 ngay	in_progress	2025-08-03 16:11:03.766457	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
1	tran	cuong@gmail.com	03892342342	Project Name: lsdflasjdflasdjfas dfa sdf \nCompany: slasjdfasdf\nDescription: asdfasd dfas df á dfa \nRequirements: asdfa sd fa sdf asdf   asdf a sdf  asdf   ádf\nBudget: 1000000\nTimeline: 3 ngay	in_progress	2025-08-03 15:44:48.700399	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
7	Test Seller	seller@test.com	0378246333	Project Name: lam web app don gian\nCompany: fpt\nDescription: lam web app don gianlam web app don gianlam web app don gianlam web app don gian\nRequirements: - Node.js\n- Python\n- AWS\n- Docker\nBudget: 10000000\nTimeline: 3 ngay	contacted	2025-08-09 03:08:45.253079	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	OK	\N	\N	2026-01-03 15:30:16.95
8	Jack Team	cuongtm2012@gmail.com	+84378246333	Project Name: lam website\nCompany: fpt \nDescription: lam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam website\nRequirements: - Node.js\n- Python\n- AWS\n- Docker\nBudget: 1000000\nTimeline: 1 thang	pending	2026-01-03 20:22:21.158	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	2026-01-03 20:22:21.158
9	Test Seller	seller@test.com	+84378246333	Project Name: lam website\nCompany: fpt \nDescription: lam websitelam websitelam websitelam websitelam websitelam website\nRequirements: - Node.js\n- Python\n- AWS\n- MongoDB\nBudget: 1000000\nTimeline: 1 thang	pending	2026-01-03 20:22:58.845	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	2026-01-03 20:22:58.845
10	Test Buyer	buyer@test.com	+84378246333	Project Name: lam website\nCompany: fpt\nDescription: lam websitelam websitelam websitelam websitelam websitelam websitelam websitelam website\nRequirements: - Node.js\n- Python\n- AWS\n- Docker\nBudget: 1000000\nTimeline: 1 thang	pending	2026-01-03 20:47:40.349	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	2026-01-03 20:47:40.349
11	Jack Team	cuongtm2012@gmail.com	+84378246333	Project Name: lam website\nCompany: fpt\nDescription: lam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam website\nRequirements: lam websitelam website\n- Python\n- AWS\n- Docker\n- PostgreSQL\nBudget: 1000000\nTimeline: 1 thang	pending	2026-01-03 20:51:29.517	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	2026-01-03 20:51:29.517
16	Test Buyer	cuongtm2012@gmail.com	+84378246333	Project Name: lam website\nCompany: fpt \nDescription: lam websitelam websitelam websitelam websitelam websitelam websitelam website	in_progress	2026-01-04 03:23:28.302	\N	- Express.js\n- Vue.js\n- GraphQL	\N	2026-01-16	\N	10000000	\N	3	\N	normal	dfgasdfasdfads ád fasdf ádf ádf ádfa sdfas	\N	\N	2026-01-04 05:02:52.42
15	Test Buyer	buyer@test.com	+84378246333	Project Name: lam website\nCompany: fpt\nDescription: lam websitelam websitelam websitelam websitelam websitelam website\nRequirements: - Python\n- Docker\n- MongoDB\nBudget: 20.000.000\nTimeline: 2026-01-29	contacted	2026-01-04 03:19:15.342	\N		\N		\N	\N	\N	3	\N	normal	ádfa sdfa sdfa sdfasd fasdfa sdf ád fa	\N	\N	2026-01-04 05:03:03.722
14	Test Buyer	cuongtm2012@gmail.com	+84378246333	Project Name: lam website\nCompany: fpt \nDescription: lam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam website\nRequirements: - GraphQL\n- REST API\n- Angular\n- Laravel\n- Docker\n- MongoDB\nBudget: 2.000.000\nTimeline: 2026-01-11	converted	2026-01-04 03:18:39.802	\N		\N		\N	\N	\N	\N	\N	normal	sadfa sdfa sdfas fasd ádf ádfa sdfasdfasd fa	\N	\N	2026-01-04 05:03:41.443
13	Test Buyer	buyer@test.com	+84378246333	Project Name: lam website\nCompany: fpt\nDescription: lam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam website\nRequirements: - Node.js\n- Express.js\n- Firebase\n- GraphQL\n- REST API\nBudget: 1000000\nTimeline: 1 thang	converted	2026-01-03 20:59:24.953	\N	\N	\N	\N	\N	\N	\N	3	\N	normal	ádf ádfa sdf ádf	\N	\N	2026-01-04 05:03:58.222
12	Test Buyer	buyer@test.com	+84378246333	Project Name: lam website\nCompany: fpt \nDescription: lam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam websitelam website\nRequirements: - AWS\n- Angular\n- REST API\n- GraphQL\n- Kubernetes\nBudget: 1000000\nTimeline: 1 thang	in_progress	2026-01-03 20:52:23.557	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	lkjhlkjh k họ ouihj ộh juoj ọ oiujho ộpkjok pọik. pôij pọ pội pọi pọiuo	\N	\N	2026-01-04 05:05:37.181
17	Nguy	test@example.com	+84 123 456 789	This is a test project description	pending	2026-01-25 04:19:43.891	\N	\n\nCông nghệ: 	\N		\N	\N	\N	\N	\N	normal	\N	\N	\N	2026-01-25 04:19:43.891
\.


--
-- TOC entry 3893 (class 0 OID 26327)
-- Dependencies: 272
-- Data for Name: fcm_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fcm_tokens (id, user_id, token, device_type, created_at, updated_at, active) FROM stdin;
pg_dump: processing data for table "public.messages"
pg_dump: dumping contents of table "public.messages"
1	2	dNlREI86a2Vvxk9v95A5mm:APA91bE9Xi_fJ5IqPCwBHH7lL7-PjXMA2ctkDCFGHq_8Dc5AquLHnvSOCJ_-y_y3dV3JZoSDP7i0_bzIOKjO5kyBaH6ZYEnQCjiDoCk8gtxgVGVqkSlN45E	web	2025-12-29 16:01:07.659048	2025-12-29 16:01:07.659048	t
2	3	etYlg2j5veLx3oARtjN80M:APA91bFf4CUjGejJo-Ap8ebduf3wx2qPzMizyJFvZgTyptz84BJUmE8A5dgMjGVSxjJUD01YVgFChObgz3UH5ERTVZO6XlXe0Prcw5JT_gGr1JpOrUdZMjs	web	2025-12-29 16:03:10.076003	2025-12-29 16:03:10.076003	t
\.


--
-- TOC entry 3847 (class 0 OID 25798)
-- Dependencies: 226
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, project_id, sender_id, content, created_at) FROM stdin;
\.


--
-- TOC entry 3849 (class 0 OID 25805)
-- Dependencies: 228
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, is_read, link_url, metadata, created_at, read_at) FROM stdin;
pg_dump: processing data for table "public.notifications"
pg_dump: dumping contents of table "public.notifications"
1	1	Welcome to SoftwareHub!	Thank you for joining our platform. Explore our software catalog and start downloading today.	success	f	\N	\N	2025-08-10 08:27:02.417542	\N
2	1	New Feature Alert	We've added a new notification system to keep you updated on important events.	info	f	\N	\N	2025-08-10 07:27:02.417542	\N
3	1	System Maintenance	Scheduled maintenance on Sunday 2:00 AM - 4:00 AM EST.	warning	t	\N	\N	2025-08-10 06:27:02.417542	\N
4	2	Welcome to SoftwareHub!	Thank you for joining our platform. Explore our software catalog and start downloading today.	success	f	\N	\N	2025-08-10 08:30:25.89762	\N
5	2	New Feature Alert	We've added a new notification system to keep you updated on important events.	info	f	\N	\N	2025-08-10 07:30:25.89762	\N
\.


--
-- TOC entry 3851 (class 0 OID 25814)
-- Dependencies: 230
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, quantity, price) FROM stdin;
pg_dump: processing data for table "public.order_items"
pg_dump: dumping contents of table "public.order_items"
1	1	4	1	8000000
2	2	3	1	1200000
3	3	2	1	500000
4	4	1	1	39.99
5	5	1	1	39.99
6	6	1	1	39.99
7	7	1	1	39.99
8	8	1	1	39.99
9	9	4	1	8000000
10	10	4	1	8000000
11	11	3	1	1200000
12	12	4	1	8000000
13	13	4	1	8000000
14	14	4	1	8000000
15	15	4	1	8000000
16	16	3	1	1200000
\.


--
-- TOC entry 3853 (class 0 OID 25821)
-- Dependencies: 232
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, buyer_id, status, total_amount, shipping_info, created_at, updated_at, seller_id, commission_amount, payment_method, download_links, buyer_info) FROM stdin;
pg_dump: processing data for table "public.orders"
pg_dump: dumping contents of table "public.orders"
1	3	completed	8000000	\N	2025-08-10 10:18:16.093347	2025-08-10 10:18:16.093347	2	400000	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
2	3	completed	1200000	\N	2025-08-10 10:18:40.226885	2025-08-10 10:18:40.226885	2	60000	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
3	3	completed	500000	\N	2025-08-10 10:18:46.658706	2025-08-10 10:18:46.658706	2	25000	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
4	3	completed	39.99	\N	2025-08-10 10:18:51.432313	2025-08-10 10:18:51.432313	2	1.9995000000000003	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
5	3	completed	39.99	\N	2025-08-10 10:18:53.97439	2025-08-10 10:18:53.97439	2	1.9995000000000003	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
6	3	completed	39.99	\N	2025-08-10 10:30:20.665608	2025-08-10 10:30:20.665608	2	1.9995000000000003	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
7	3	completed	39.99	\N	2025-08-10 10:32:21.079005	2025-08-10 10:32:21.079005	2	1.9995000000000003	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
8	3	completed	39.99	\N	2025-08-10 10:32:23.561183	2025-08-10 10:32:23.561183	2	1.9995000000000003	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
9	3	completed	8000000	\N	2025-08-10 10:35:55.072381	2025-08-10 10:35:55.072381	2	400000	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
10	3	completed	8000000	\N	2025-08-10 10:36:08.055489	2025-08-10 10:36:08.055489	2	400000	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
11	3	completed	1200000	\N	2025-08-10 10:36:16.845849	2025-08-10 10:36:16.845849	2	60000	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
12	3	completed	8000000	\N	2025-08-10 10:37:24.429885	2025-08-10 10:37:24.429885	2	400000	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
13	3	completed	8000000	\N	2025-08-10 10:40:01.255288	2025-08-10 10:40:01.255288	2	400000	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
14	3	completed	8000000	\N	2025-08-10 10:44:21.690626	2025-08-10 10:44:21.690626	2	400000	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
15	3	completed	8000000	\N	2025-08-10 10:48:38.006953	2025-08-10 10:48:38.006953	2	400000	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
16	3	completed	1200000	\N	2025-08-10 10:49:45.016237	2025-08-10 10:49:45.016237	2	60000	credit_card	\N	{"buyer_name": "Test Buyer", "buyer_email": "buyer@test.com"}
\.


--
-- TOC entry 3855 (class 0 OID 25832)
-- Dependencies: 234
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, project_id, amount, payment_method, status, escrow_release, transaction_id, created_at) FROM stdin;
pg_dump: processing data for table "public.payments"
pg_dump: dumping contents of table "public.payments"
1	1	\N	8000000	credit_card	completed	f	txn_1754821096282_21xhme9s6	2025-08-10 10:18:16.301681
2	2	\N	1200000	credit_card	completed	f	txn_1754821120404_vgid0tpox	2025-08-10 10:18:40.42374
3	3	\N	500000	credit_card	completed	f	txn_1754821126832_e7n10op2y	2025-08-10 10:18:46.851628
4	4	\N	39.99	credit_card	completed	f	txn_1754821131597_wvzaq16cm	2025-08-10 10:18:51.616227
5	5	\N	39.99	credit_card	completed	f	txn_1754821134138_smxd6vbx2	2025-08-10 10:18:54.156365
6	6	\N	39.99	credit_card	completed	f	txn_1754821820855_bw8dwhsv6	2025-08-10 10:30:20.874378
7	7	\N	39.99	credit_card	completed	f	txn_1754821941251_z3nj5hqlh	2025-08-10 10:32:21.269796
8	8	\N	39.99	credit_card	completed	f	txn_1754821943724_6uh10n4xe	2025-08-10 10:32:23.742508
9	9	\N	8000000	credit_card	completed	f	txn_1754822155240_ndb11qh71	2025-08-10 10:35:55.258644
10	10	\N	8000000	credit_card	completed	f	txn_1754822168234_q5vythp0f	2025-08-10 10:36:08.255023
11	11	\N	1200000	credit_card	completed	f	txn_1754822177020_fdggw5icw	2025-08-10 10:36:17.041726
12	12	\N	8000000	credit_card	completed	f	txn_1754822244598_57m6msqc4	2025-08-10 10:37:24.618158
13	13	\N	8000000	credit_card	completed	f	txn_1754822401431_3u9xsbvel	2025-08-10 10:40:01.451111
14	14	\N	8000000	credit_card	completed	f	txn_1754822661875_57rowsh7l	2025-08-10 10:44:21.898328
15	15	\N	8000000	credit_card	completed	f	txn_1754822918206_smrcxpz7r	2025-08-10 10:48:38.225617
16	16	\N	1200000	credit_card	completed	f	txn_1754822985187_px6ei800z	2025-08-10 10:49:45.206534
\.


--
-- TOC entry 3857 (class 0 OID 25841)
-- Dependencies: 236
-- Data for Name: portfolio_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.portfolio_reviews (id, portfolio_id, user_id, rating, comment, created_at) FROM stdin;
pg_dump: processing data for table "public.portfolio_reviews"
pg_dump: dumping contents of table "public.portfolio_reviews"
\.


--
-- TOC entry 3859 (class 0 OID 25848)
-- Dependencies: 238
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.portfolios (id, developer_id, title, description, images, demo_link, technologies, created_at) FROM stdin;
pg_dump: processing data for table "public.portfolios"
pg_dump: dumping contents of table "public.portfolios"
\.


--
-- TOC entry 3861 (class 0 OID 25855)
-- Dependencies: 240
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_reviews (id, order_id, product_id, buyer_id, rating, comment, created_at) FROM stdin;
pg_dump: processing data for table "public.product_reviews"
pg_dump: dumping contents of table "public.product_reviews"
\.


--
-- TOC entry 3863 (class 0 OID 25862)
-- Dependencies: 242
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, seller_id, title, description, price, images, category, created_at, updated_at, price_type, stock_quantity, download_link, product_files, tags, license_info, status, featured, total_sales, avg_rating) FROM stdin;
pg_dump: processing data for table "public.products"
pg_dump: dumping contents of table "public.products"
2	2	Advanced Captcha Solver Tool	AI-powered captcha solving tool with 99% success rate. Supports reCAPTCHA v2, v3, hCaptcha, and FunCaptcha. Includes API access and documentation.	500000	{https://via.placeholder.com/300x200?text=Captcha+Solver}	Captcha Solvers	2025-08-02 06:55:39.432431	2025-08-02 06:55:39.432431	fixed	10	\N	\N	\N	\N	approved	f	1	\N
5	2	Test Product API Fixed	This is a comprehensive test product description with sufficient length to meet requirements	29.99	\N	Software Licenses	2025-08-02 16:51:09.691862	2025-08-02 16:51:09.691862	fixed	10	\N	\N	{test,software,licenses}	\N	pending	f	0	\N
6	2	Test Product	Test description	29.99	\N	Software Licenses	2025-08-03 10:54:36.64279	2025-08-03 10:54:36.64279	fixed	10	\N	\N	\N	\N	pending	f	0	\N
7	2	Frontend Test Product	This is a test product created from the frontend form	19.99	\N	Software Licenses	2025-08-03 10:55:01.009814	2025-08-03 10:55:01.009814	fixed	5	\N	\N	\N	\N	pending	f	0	\N
9	2	ban Gmail gia re	san pham Gmail gia re nhat thi thuong	10000	\N	Software Licenses	2025-08-04 08:25:47.867482	2025-08-04 08:25:47.867482	fixed	1	https://1000logos.net/wp-content/uploads/2021/05/Gmail-logo-500x281.png	\N	{gmail}	san pham gmail gia re an toan tuyet doi	pending	f	0	\N
4	2	Crypto Trading Bot Premium	Professional cryptocurrency trading bot with AI algorithms. Supports Binance, Bybit, and other major exchanges. Includes risk management and backtesting.	8000000	{https://via.placeholder.com/300x200?text=Crypto+Bot}	Crypto Tools	2025-08-02 06:55:39.432431	2025-08-02 06:55:39.432431	fixed	4	\N	\N	\N	\N	approved	f	7	\N
3	2	Social Media Marketing Bot	Automated social media management tool for Instagram, Facebook, and TikTok. Features auto-posting, engagement automation, and analytics dashboard.	1200000	{https://via.placeholder.com/300x200?text=Social+Bot}	Marketing Tools	2025-08-02 06:55:39.432431	2025-08-02 06:55:39.432431	fixed	8	\N	\N	\N	\N	approved	f	3	\N
1	2	Updated Product Title	Updated comprehensive test product description with sufficient length to meet requirements	39.99	{https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2021/09/gmail-e1682331561418.jpg}	Development Tools & IDEs	2025-08-02 06:55:39.432431	2025-08-02 06:55:39.432431	fixed	10	\N	\N	\N	\N	approved	f	5	\N
\.


--
-- TOC entry 3865 (class 0 OID 25875)
-- Dependencies: 244
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotes (id, project_id, developer_id, price, timeline, message, status, created_at, title, description, deliverables, deposit_amount, timeline_days, terms_conditions, updated_at) FROM stdin;
pg_dump: processing data for table "public.quotes"
pg_dump: dumping contents of table "public.quotes"
\.


--
-- TOC entry 3867 (class 0 OID 25883)
-- Dependencies: 246
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, user_id, target_type, target_id, rating, comment, created_at) FROM stdin;
pg_dump: processing data for table "public.reviews"
pg_dump: dumping contents of table "public.reviews"
\.


--
-- TOC entry 3869 (class 0 OID 25890)
-- Dependencies: 248
-- Data for Name: sales_analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_analytics (id, seller_id, product_id, date, revenue, units_sold, commission_paid, created_at) FROM stdin;
pg_dump: processing data for table "public.sales_analytics"
pg_dump: dumping contents of table "public.sales_analytics"
\.


--
-- TOC entry 3871 (class 0 OID 25897)
-- Dependencies: 250
-- Data for Name: seller_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seller_profiles (id, user_id, business_name, business_type, tax_id, business_address, bank_account, verification_status, verification_documents, commission_rate, total_sales, rating, total_reviews, created_at, updated_at) FROM stdin;
pg_dump: processing data for table "public.seller_profiles"
pg_dump: dumping contents of table "public.seller_profiles"
1	2	Test Seller Business	individual	\N	\N	\N	verified	\N	0.10	0	\N	0	2025-08-02 13:18:12.626063	2025-08-02 13:18:12.626063
2	12	Mua ban San Pham	individual	888888	zxmzxmzxmzxmzxm	{"bank_code":"VCB","bank_name":"Vietcombank","account_number":"91293912391923","account_holder_name":"Tran Manh Cuong"}	verified	{verification-documents/12/1754809473012-z6224429011579_e99562d6adca5eb65942b84dc9fe8404.jpg,verification-documents/12/1754809476696-z6221566336300_dc1eeea0124ed7fc8886658b103e720f.jpg,verification-documents/12/1754809481555-cmt_Front.jpg}	0.10	0	\N	0	2025-08-10 07:04:58.743184	2025-08-10 07:30:14.366
\.


--
-- TOC entry 3873 (class 0 OID 25909)
-- Dependencies: 252
-- Data for Name: service_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_payments (id, quotation_id, service_project_id, client_id, amount, payment_type, status, stripe_payment_intent_id, payment_method, transaction_fee, created_at, updated_at) FROM stdin;
pg_dump: processing data for table "public.service_payments"
pg_dump: dumping contents of table "public.service_payments"
\.


--
-- TOC entry 3875 (class 0 OID 25919)
-- Dependencies: 254
-- Data for Name: service_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_projects (id, quotation_id, service_request_id, client_id, admin_id, status, progress_percentage, milestones, deliverables_submitted, client_feedback, admin_notes, started_at, completed_at, created_at, updated_at) FROM stdin;
pg_dump: processing data for table "public.service_projects"
pg_dump: dumping contents of table "public.service_projects"
\.


--
-- TOC entry 3877 (class 0 OID 25929)
-- Dependencies: 256
-- Data for Name: service_quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_quotations (id, service_request_id, admin_id, title, description, deliverables, total_price, deposit_amount, timeline_days, terms_conditions, status, client_response, expires_at, created_at, updated_at) FROM stdin;
pg_dump: processing data for table "public.service_quotations"
pg_dump: dumping contents of table "public.service_quotations"
\.


--
-- TOC entry 3879 (class 0 OID 25938)
-- Dependencies: 258
-- Data for Name: service_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_requests (id, client_id, title, description, requirements, budget_range, timeline, status, admin_notes, priority, created_at, updated_at) FROM stdin;
pg_dump: processing data for table "public.service_requests"
pg_dump: dumping contents of table "public.service_requests"
\.


--
-- TOC entry 3881 (class 0 OID 25948)
-- Dependencies: 260
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
pg_dump: processing data for table "public.session"
pg_dump: dumping contents of table "public.session"
\.


--
-- TOC entry 3882 (class 0 OID 25953)
-- Dependencies: 261
-- Data for Name: softwares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.softwares (id, name, description, category_id, platform, download_link, image_url, created_by, status, created_at, version, vendor, license, installation_instructions, documentation_link, admin_notes, type) FROM stdin;
pg_dump: processing data for table "public.softwares"
pg_dump: dumping contents of table "public.softwares"
3	Slack	Team collaboration hub that brings conversations, tools, and files together.	3	{windows,mac,linux,ios,android,web}	https://slack.com/downloads	https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_256.png	1	approved	2025-08-01 10:42:11.218774	\N	\N	\N	\N	\N	\N	software
8	Malwarebytes	Anti-malware software for detecting and removing malicious software.	8	{windows,mac,android}	https://malwarebytes.com/download	https://www.malwarebytes.com/images/brand/mb-logo-dark.svg	1	approved	2025-08-01 10:42:11.218774	\N	\N	\N	\N	\N	\N	software
9	LibreOffice	Free and open-source office suite with word processor, spreadsheet, presentation, and database applications	9	{windows,mac,linux}	https://www.libreoffice.org/download/	https://www.libreoffice.org/assets/Uploads/LibreOffice-Initial-Artwork-Logo-ColorLogoBasic-500px.png	1	approved	2025-08-01 16:56:05.323518	\N	\N	\N	\N	\N	\N	software
10	OnlyOffice	Comprehensive office suite for document editing, collaboration, and project management	9	{windows,mac,linux,web}	https://www.onlyoffice.com/download.aspx	https://www.onlyoffice.com/blog/content/images/2021/04/onlyoffice-logo.png	1	approved	2025-08-01 16:56:05.323518	\N	\N	\N	\N	\N	\N	software
11	WPS Office	Lightweight office suite compatible with Microsoft Office formats	9	{windows,mac,linux,android,ios}	https://www.wps.com/download/	https://www.wps.com/images/wps-logo.png	1	approved	2025-08-01 16:56:05.323518	\N	\N	\N	\N	\N	\N	software
12	Zoho Office Suite	Cloud-based office suite with document, spreadsheet, and presentation tools	9	{web,android,ios}	https://www.zoho.com/docs/	https://www.zoho.com/img/zoho-logo.svg	1	approved	2025-08-01 16:56:05.323518	\N	\N	\N	\N	\N	\N	software
13	Notion	All-in-one workspace for note-taking, collaboration, and project management	9	{windows,mac,web,android,ios}	https://www.notion.so/desktop	https://www.notion.so/images/logo-ios.png	1	approved	2025-08-01 16:56:05.323518	\N	\N	\N	\N	\N	\N	software
14	Evernote	Note-taking and organization app for capturing and organizing information	9	{windows,mac,web,android,ios}	https://evernote.com/download	https://evernote.com/img/evernote-logo.svg	1	approved	2025-08-01 16:56:05.323518	\N	\N	\N	\N	\N	\N	software
15	VLC Media Player	Free and open-source multimedia player and framework that plays most multimedia files	10	{windows,mac,linux,android,ios}	https://www.videolan.org/vlc/	https://images.videolan.org/images/VLC-IconSmall.png	1	approved	2025-08-01 16:56:13.983007	\N	\N	\N	\N	\N	\N	software
16	MPV Player	Free, open-source, and cross-platform media player with advanced features	10	{windows,mac,linux}	https://mpv.io/installation/	https://mpv.io/images/mpv-logo-128.png	1	approved	2025-08-01 16:56:13.983007	\N	\N	\N	\N	\N	\N	software
17	Audacity	Free, open-source, cross-platform audio software for multi-track recording and editing	10	{windows,mac,linux}	https://www.audacityteam.org/download/	https://www.audacityteam.org/wp-content/themes/wp_audacity/img/logo.png	1	approved	2025-08-01 16:56:13.983007	\N	\N	\N	\N	\N	\N	software
18	Shotcut	Free, open-source, cross-platform video editor with comprehensive features	10	{windows,mac,linux}	https://shotcut.org/download/	https://shotcut.org/assets/img/shotcut-logo-64.png	1	approved	2025-08-01 16:56:13.983007	\N	\N	\N	\N	\N	\N	software
19	OBS Studio	Free and open-source software for video recording and live streaming	10	{windows,mac,linux}	https://obsproject.com/download	https://obsproject.com/assets/images/new_icon_small-r.png	1	approved	2025-08-01 16:56:13.983007	\N	\N	\N	\N	\N	\N	software
20	GIMP	GNU Image Manipulation Program - free and open-source raster graphics editor	10	{windows,mac,linux}	https://www.gimp.org/downloads/	https://www.gimp.org/images/frontpage/wilber-big.png	1	approved	2025-08-01 16:56:13.983007	\N	\N	\N	\N	\N	\N	software
21	Inkscape	Professional vector graphics editor for creating scalable graphics	10	{windows,mac,linux}	https://inkscape.org/release/	https://media.inkscape.org/static/images/inkscape-logo.svg	1	approved	2025-08-01 16:56:13.983007	\N	\N	\N	\N	\N	\N	software
22	7-Zip	Free and open-source file archiver with high compression ratio	11	{windows,linux}	https://www.7-zip.org/download.html	https://www.7-zip.org/7ziplogo.png	1	approved	2025-08-01 16:56:19.845734	\N	\N	\N	\N	\N	\N	software
23	PeaZip	Free file archiver utility with support for 200+ archive formats	11	{windows,linux}	https://peazip.github.io/peazip-download.html	https://peazip.github.io/peazip-64.png	1	approved	2025-08-01 16:56:19.845734	\N	\N	\N	\N	\N	\N	software
24	WinRAR	Powerful archiver and archive manager with compression and encryption features	11	{windows,mac}	https://www.win-rar.com/download.html	https://www.win-rar.com/fileadmin/images/winrar_logo.png	1	approved	2025-08-01 16:56:19.845734	\N	\N	\N	\N	\N	\N	software
25	Bandizip	Lightweight, fast, and free archiver for Windows with clean interface	11	{windows}	https://en.bandisoft.com/bandizip/	https://en.bandisoft.com/img/bandizip/bandizip-icon-256.png	1	approved	2025-08-01 16:56:19.845734	\N	\N	\N	\N	\N	\N	software
26	Visual Studio Code	Lightweight but powerful source code editor with extensive extension support	12	{windows,mac,linux}	https://code.visualstudio.com/download	https://code.visualstudio.com/assets/images/code-stable.png	1	approved	2025-08-01 16:56:29.449493	\N	\N	\N	\N	\N	\N	software
27	IntelliJ IDEA Community Edition	Free and open-source IDE for Java development with intelligent code assistance	12	{windows,mac,linux}	https://www.jetbrains.com/idea/download/	https://resources.jetbrains.com/storage/products/intellij-idea/img/meta/intellij-idea_logo_300x300.png	1	approved	2025-08-01 16:56:29.449493	\N	\N	\N	\N	\N	\N	software
1474	389 Directory Server	Enterprise-class Open Source LDAP server for Linux	160	{Linux}	https://github.com/389ds/389-ds-base	\N	1	approved	2026-01-17 17:48:41.323706	\N	\N	GPL-3.0	\N	\N	\N	software
6	Node.js	JavaScript runtime built on Chrome V8 engine for building scalable applications.	216	{windows,mac,linux}	https://nodejs.org/download	https://nodejs.org/static/images/logo.svg	1	approved	2025-08-01 10:42:11.218774	\N	\N	\N	\N	\N	\N	software
1	Visual Studio Code	A powerful code editor with IntelliSense, debugging, and Git integration.	216	{windows,mac,linux}	https://code.visualstudio.com/download	https://code.visualstudio.com/assets/images/code-stable.png	1	approved	2025-08-01 10:42:11.218774	\N	\N	\N	\N	\N	\N	software
7	Notion	All-in-one workspace for notes, tasks, wikis, and databases.	313	{windows,mac,web,ios,android}	https://www.notion.com/desktop/windows/download	https://www.notion.so/images/logo-ios.png	1	approved	2025-08-01 10:42:11.218774	\N	\N	\N	\N	\N	\N	software
1288	Libre.fm	Stream, download, remix, and share music for free.	298	{windows,mac,linux,web}	https://libre.fm/	\N	13	approved	2026-01-17 17:08:48.379814	\N	\N	GNU AGPLv3	\N	https://libre.fm/	Imported from awesome-free-software. License: GNU AGPLv3	software
28	Eclipse IDE	Free and open-source integrated development environment primarily for Java	12	{windows,mac,linux}	https://www.eclipse.org/downloads/	https://www.eclipse.org/eclipse.org-common/themes/solstice/public/images/logo/eclipse-426x100.png	1	approved	2025-08-01 16:56:29.449493	\N	\N	\N	\N	\N	\N	software
29	Atom Editor	Free and open-source text and source code editor with customizable interface	12	{windows,mac,linux}	https://github.com/atom/atom/releases	https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png	1	approved	2025-08-01 16:56:29.449493	\N	\N	\N	\N	\N	\N	software
30	GitKraken	Powerful Git client with intuitive interface for version control management	12	{windows,mac,linux}	https://www.gitkraken.com/download	https://www.gitkraken.com/img/gk-logo.svg	1	approved	2025-08-01 16:56:29.449493	\N	\N	\N	\N	\N	\N	software
31	SourceTree	Free Git client for Windows and Mac with visual interface for repositories	12	{windows,mac}	https://www.sourcetreeapp.com/	https://wac-cdn.atlassian.com/dam/jcr:580b2cc1-1d37-4e96-9e3a-46e71e3a4076/sourcetree-icon-blue.svg	1	approved	2025-08-01 16:56:29.449493	\N	\N	\N	\N	\N	\N	software
32	BleachBit	Free system cleaner that removes unnecessary files and protects privacy	13	{windows,linux}	https://www.bleachbit.org/download	https://www.bleachbit.org/sites/default/files/zen_logo.png	1	approved	2025-08-01 16:56:39.775967	\N	\N	\N	\N	\N	\N	software
33	Duplicati	Free backup client that stores encrypted, compressed backups online	13	{windows,mac,linux}	https://www.duplicati.com/download	https://www.duplicati.com/img/duplicati_logo.png	1	approved	2025-08-01 16:56:39.775967	\N	\N	\N	\N	\N	\N	software
34	Glary Utilities	All-in-one system cleaner and performance optimizer for Windows	13	{windows}	https://www.glarysoft.com/glary-utilities/	https://www.glarysoft.com/img/gu-logo.png	1	approved	2025-08-01 16:56:39.775967	\N	\N	\N	\N	\N	\N	software
35	CPU-Z	System information software that provides detailed hardware information	13	{windows}	https://www.cpuid.com/softwares/cpu-z.html	https://www.cpuid.com/medias/images/logos/cpuz.png	1	approved	2025-08-01 16:56:39.775967	\N	\N	\N	\N	\N	\N	software
36	HWMonitor	Hardware monitoring program that reads health sensors of systems	13	{windows}	https://www.cpuid.com/softwares/hwmonitor.html	https://www.cpuid.com/medias/images/logos/hwmonitor.png	1	approved	2025-08-01 16:56:39.775967	\N	\N	\N	\N	\N	\N	software
37	Everything Search Engine	Lightning-fast file search utility for Windows based on filename indexing	13	{windows}	https://www.voidtools.com/downloads/	https://www.voidtools.com/Everything.ico	1	approved	2025-08-01 16:56:39.775967	\N	\N	\N	\N	\N	\N	software
38	Signal	Private messenger with end-to-end encryption for secure communication	14	{windows,mac,linux,android,ios}	https://signal.org/download/	https://signal.org/assets/images/header/signal-logo.png	1	approved	2025-08-01 16:56:47.063157	\N	\N	\N	\N	\N	\N	software
39	Thunderbird	Free and open-source email client with calendar and chat features	14	{windows,mac,linux}	https://www.thunderbird.net/download/	https://www.thunderbird.net/media/img/thunderbird/logos/logo.png	1	approved	2025-08-01 16:56:47.063157	\N	\N	\N	\N	\N	\N	software
40	Zoom	Video conferencing platform for meetings, webinars, and collaboration	14	{windows,mac,linux,android,ios,web}	https://zoom.us/download	https://st1.zoom.us/static/6.3.5/image/new/topNav/Zoom_logo.svg	1	approved	2025-08-01 16:56:47.063157	\N	\N	\N	\N	\N	\N	software
41	Microsoft Teams	Collaboration platform combining workplace chat, meetings, and file sharing	14	{windows,mac,linux,android,ios,web}	https://www.microsoft.com/microsoft-teams/download-app	https://www.microsoft.com/favicon.ico	1	approved	2025-08-01 16:56:47.063157	\N	\N	\N	\N	\N	\N	software
42	Jitsi Meet	Open-source video conferencing solution with privacy focus	14	{web,android,ios}	https://jitsi.org/downloads/	https://jitsi.org/wp-content/uploads/2017/11/jitsi-logo-blue-grey-text.png	1	approved	2025-08-01 16:56:47.063157	\N	\N	\N	\N	\N	\N	software
43	VeraCrypt	Free open-source disk encryption software for creating encrypted volumes	15	{windows,mac,linux}	https://www.veracrypt.fr/en/Downloads.html	https://www.veracrypt.fr/en/VeraCrypt_Logo.png	1	approved	2025-08-01 16:56:53.125143	\N	\N	\N	\N	\N	\N	software
44	Bitwarden	Open-source password manager with cross-platform synchronization	15	{windows,mac,linux,android,ios,web}	https://bitwarden.com/download/	https://bitwarden.com/images/icons/logo.svg	1	approved	2025-08-01 16:56:53.125143	\N	\N	\N	\N	\N	\N	software
45	Tor Browser	Privacy-focused web browser that routes traffic through the Tor network	15	{windows,mac,linux,android}	https://www.torproject.org/download/	https://www.torproject.org/static/images/tor-project-logo-onions.png	1	approved	2025-08-01 16:56:53.125143	\N	\N	\N	\N	\N	\N	software
46	KeePass	Free, open-source password manager that stores passwords in encrypted databases	15	{windows,mac,linux}	https://keepass.info/download.html	https://keepass.info/screenshots/keepass_2x_mainwnd_big.png	1	approved	2025-08-01 16:56:53.125143	\N	\N	\N	\N	\N	\N	software
47	TensorFlow	Open-source machine learning framework for developing and training ML models	16	{windows,mac,linux}	https://www.tensorflow.org/install	https://www.tensorflow.org/images/tf_logo_social.png	1	approved	2025-08-01 16:56:59.045671	\N	\N	\N	\N	\N	\N	software
48	PyTorch	Open-source machine learning library based on Torch for deep learning applications	16	{windows,mac,linux}	https://pytorch.org/get-started/locally/	https://pytorch.org/assets/images/pytorch-logo.png	1	approved	2025-08-01 16:56:59.045671	\N	\N	\N	\N	\N	\N	software
49	Apache Spark	Unified analytics engine for large-scale data processing and machine learning	16	{windows,mac,linux}	https://spark.apache.org/downloads.html	https://spark.apache.org/images/spark-logo-trademark.png	1	approved	2025-08-01 16:56:59.045671	\N	\N	\N	\N	\N	\N	software
50	Jupyter Notebook	Open-source web application for creating and sharing computational documents	16	{windows,mac,linux}	https://jupyter.org/install	https://jupyter.org/assets/logos/rectanglelogo-greytext-orangebody-greymoons.svg	1	approved	2025-08-01 16:56:59.045671	\N	\N	\N	\N	\N	\N	software
51	OpenCV	Open-source computer vision and machine learning software library	16	{windows,mac,linux}	https://opencv.org/releases/	https://opencv.org/wp-content/uploads/2020/07/OpenCV_logo_no_text_.png	1	approved	2025-08-01 16:56:59.045671	\N	\N	\N	\N	\N	\N	software
52	Mozilla Firefox	Free and open-source web browser with privacy features and customization options	17	{windows,mac,linux,android,ios}	https://www.mozilla.org/firefox/download/	https://www.mozilla.org/media/img/logos/firefox/logo-quantum.png	1	approved	2025-08-01 16:57:10.00909	\N	\N	\N	\N	\N	\N	software
53	Google Chrome	Fast and secure web browser built for the modern web with Google integration	17	{windows,mac,linux,android,ios}	https://www.google.com/chrome/	https://www.google.com/chrome/static/images/chrome-logo.svg	1	approved	2025-08-01 16:57:10.00909	\N	\N	\N	\N	\N	\N	software
54	Brave Browser	Privacy-focused web browser that blocks ads and trackers by default	17	{windows,mac,linux,android,ios}	https://brave.com/download/	https://brave.com/static-assets/images/brave-logo.svg	1	approved	2025-08-01 16:57:10.00909	\N	\N	\N	\N	\N	\N	software
1568	aptly	Swiss army knife for Debian repository management	171	{Linux,Mac,Windows}	https://github.com/aptly-dev/aptly	\N	1	approved	2026-01-17 17:48:41.401996	\N	\N	MIT	\N	\N	\N	software
55	Microsoft Edge	Modern web browser built on Chromium with Microsoft services integration	17	{windows,mac,linux,android,ios}	https://www.microsoft.com/edge/download	https://www.microsoft.com/favicon.ico	1	approved	2025-08-01 16:57:10.00909	\N	\N	\N	\N	\N	\N	software
56	Lutris	Open-source gaming platform for Linux that manages game installations	18	{linux}	https://lutris.net/downloads/	https://lutris.net/static/images/lutris-logo.png	1	approved	2025-08-01 16:57:12.819875	\N	\N	\N	\N	\N	\N	software
57	RetroArch	Frontend for emulators, game engines and media players with unified interface	18	{windows,mac,linux,android,ios}	https://www.retroarch.com/index.php?page=platforms	https://www.retroarch.com/images/retroarch-logo.png	1	approved	2025-08-01 16:57:12.819875	\N	\N	\N	\N	\N	\N	software
58	Nextcloud	Self-hosted productivity platform with file sync, share, and collaboration features	19	{windows,mac,linux,android,ios,web}	https://nextcloud.com/install/	https://nextcloud.com/media/nextcloud-logo-blue.svg	1	approved	2025-08-01 16:57:17.539974	\N	\N	\N	\N	\N	\N	software
59	Syncthing	Continuous file synchronization program that syncs files between devices	19	{windows,mac,linux,android}	https://syncthing.net/downloads/	https://syncthing.net/img/logo-horizontal.svg	1	approved	2025-08-01 16:57:17.539974	\N	\N	\N	\N	\N	\N	software
60	Resilio Sync	Peer-to-peer file synchronization tool for sharing data across devices	19	{windows,mac,linux,android,ios}	https://www.resilio.com/individuals/	https://www.resilio.com/img/logo.svg	1	approved	2025-08-01 16:57:17.539974	\N	\N	\N	\N	\N	\N	software
61	Anki	Spaced repetition flashcard program for efficient learning and memorization	20	{windows,mac,linux,android,ios}	https://apps.ankiweb.net/	https://apps.ankiweb.net/favicon.ico	1	approved	2025-08-01 16:57:22.879038	\N	\N	\N	\N	\N	\N	software
62	Moodle	Open-source learning platform for creating personalized learning environments	20	{web}	https://moodle.org/download/	https://moodle.org/theme/image.php/boost/theme_moodleorg/1638360480/moodlelogo	1	approved	2025-08-01 16:57:22.879038	\N	\N	\N	\N	\N	\N	software
63	Khan Academy	Free online courses and practice exercises for personalized learning	20	{web,android,ios}	https://www.khanacademy.org/	https://cdn.kastatic.org/images/khan-logo-dark-background.png	1	approved	2025-08-01 16:57:22.879038	\N	\N	\N	\N	\N	\N	software
64	Blender	Free and open-source 3D computer graphics software for modeling, animation, and rendering	21	{windows,mac,linux}	https://www.blender.org/download/	https://www.blender.org/wp-content/uploads/2015/03/blender_logo_socket.png	1	approved	2025-08-01 16:57:26.381129	\N	\N	\N	\N	\N	\N	software
65	Krita	Free and open-source digital painting application designed for concept artists and illustrators	21	{windows,mac,linux}	https://krita.org/en/download/krita-desktop/	https://krita.org/images/krita-logo.svg	1	approved	2025-08-01 16:57:26.381129	\N	\N	\N	\N	\N	\N	software
66	Canva	Web-based graphic design platform with templates for social media, presentations, and more	21	{web,android,ios}	https://www.canva.com/	https://www.canva.com/img/logos/canva-logo.svg	1	approved	2025-08-01 16:57:26.381129	\N	\N	\N	\N	\N	\N	software
67	Scratch 3.29	Visual programming language and online community for creating interactive stories, games, and animations	12	{windows,mac,linux,web}	https://scratch.mit.edu/download	https://scratch.mit.edu/images/scratch-logo.svg	1	approved	2025-08-01 17:06:12.175092	\N	\N	\N	\N	\N	\N	software
68	Microsoft Visual C++ Redistributable	Runtime components of Visual C++ Libraries required for running applications developed with Visual C++	12	{windows}	https://docs.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist	https://www.microsoft.com/favicon.ico	1	approved	2025-08-01 17:06:12.175092	\N	\N	\N	\N	\N	\N	software
69	Python 3.13	High-level programming language with dynamic semantics and powerful data structures	12	{windows,mac,linux}	https://www.python.org/downloads/	https://www.python.org/static/img/python-logo.png	1	approved	2025-08-01 17:06:12.175092	\N	\N	\N	\N	\N	\N	software
70	Visual Studio 2022	Comprehensive IDE for developing applications across multiple platforms and languages	12	{windows,mac}	https://visualstudio.microsoft.com/downloads/	https://www.microsoft.com/favicon.ico	1	approved	2025-08-01 17:06:12.175092	\N	\N	\N	\N	\N	\N	software
71	Notepad++	Free source code editor and Notepad replacement with syntax highlighting and tabbed interface	12	{windows}	https://notepad-plus-plus.org/downloads/	https://notepad-plus-plus.org/images/logo.svg	1	approved	2025-08-01 17:06:12.175092	\N	\N	\N	\N	\N	\N	software
72	Microsoft SQL Server 2019	Relational database management system developed by Microsoft for enterprise applications	12	{windows,linux}	https://www.microsoft.com/sql-server/sql-server-downloads	https://www.microsoft.com/favicon.ico	1	approved	2025-08-01 17:06:12.175092	\N	\N	\N	\N	\N	\N	software
73	Code::Blocks	Free, open-source, cross-platform C/C++ IDE built around a plugin framework	12	{windows,mac,linux}	https://www.codeblocks.org/downloads/	https://www.codeblocks.org/images/logo160.png	1	approved	2025-08-01 17:06:12.175092	\N	\N	\N	\N	\N	\N	software
74	MATLAB R2024b	Multi-paradigm programming language and computing environment for algorithm development and data analysis	12	{windows,mac,linux}	https://www.mathworks.com/products/matlab.html	https://www.mathworks.com/etc/designs/mathworks/images/pic-header-mathworks-logo.svg	1	approved	2025-08-01 17:06:12.175092	\N	\N	\N	\N	\N	\N	software
75	Arduino IDE	Open-source electronics platform based on easy-to-use hardware and software for microcontroller programming	12	{windows,mac,linux}	https://www.arduino.cc/en/software	https://www.arduino.cc/arduino_logo.svg	1	approved	2025-08-01 17:06:12.175092	\N	\N	\N	\N	\N	\N	software
76	Visual Studio Community 2019	Free, full-featured IDE for students, open-source contributors, and individual developers	12	{windows}	https://visualstudio.microsoft.com/vs/older-downloads/	https://www.microsoft.com/favicon.ico	1	approved	2025-08-01 17:06:12.175092	\N	\N	\N	\N	\N	\N	software
78	Microsoft Visual Studio 2017 Express	Free version of Visual Studio IDE for individual developers and small teams	12	{windows}	https://visualstudio.microsoft.com/vs/older-downloads/	https://www.microsoft.com/favicon.ico	1	approved	2025-08-01 17:07:30.207287	\N	\N	\N	\N	\N	\N	software
79	Free Pascal 3.2	Open source Pascal compiler with Object Pascal support for multiple platforms	12	{windows,mac,linux}	https://www.freepascal.org/download.html	https://www.freepascal.org/pic/logo.gif	1	approved	2025-08-01 17:07:30.207287	\N	\N	\N	\N	\N	\N	software
80	PyCharm 2025.1	Professional Python IDE with intelligent code assistance and debugging tools	12	{windows,mac,linux}	https://www.jetbrains.com/pycharm/download/	https://resources.jetbrains.com/storage/products/pycharm/img/meta/pycharm_logo_300x300.png	1	approved	2025-08-01 17:07:30.207287	\N	\N	\N	\N	\N	\N	software
81	Adobe Animate CC 2019	Professional animation software for creating interactive animations and multimedia content	21	{windows,mac}	https://www.adobe.com/products/animate.html	https://www.adobe.com/content/dam/acom/en/products/animate/pdp/animate-app-icon.svg	1	approved	2025-08-01 17:07:30.207287	\N	\N	\N	\N	\N	\N	software
82	XAMPP 8.2	Free and open-source cross-platform web server solution stack with Apache, MySQL, PHP and Perl	12	{windows,mac,linux}	https://www.apachefriends.org/download.html	https://www.apachefriends.org/images/xampp-logo.svg	1	approved	2025-08-01 17:07:30.207287	\N	\N	\N	\N	\N	\N	software
83	Android Studio 2024.2	Official integrated development environment for Android app development	12	{windows,mac,linux}	https://developer.android.com/studio	https://developer.android.com/images/brand/Android_Robot.png	1	approved	2025-08-01 17:07:30.207287	\N	\N	\N	\N	\N	\N	software
84	Resource Hacker 5.1	Resource compiler and decompiler for Windows applications	13	{windows}	http://www.angusj.com/resourcehacker/	https://www.angusj.com/resourcehacker/resource_hacker.png	1	approved	2025-08-01 17:07:30.207287	\N	\N	\N	\N	\N	\N	software
85	MySQL 8.0	Open-source relational database management system for web applications and data storage	12	{windows,mac,linux}	https://dev.mysql.com/downloads/	https://labs.mysql.com/common/logos/mysql-logo.svg	1	approved	2025-08-01 17:07:30.207287	\N	\N	\N	\N	\N	\N	software
2	Adobe Photoshop	Professional image editing software with advanced features for digital art and photography.	2	{windows,mac}	https://adobe.com/photoshop	https://www.adobe.com/content/dam/acom/en/products/photoshop/pdp/photoshop-app-icon.svg	1	approved	2025-08-01 10:42:11.218774	\N	\N	free	\N	\N	\N	software
86	Cura	The world's most advanced 3D printer software.	22	{linux}	https://github.com/Ultimaker/Cura	\N	13	approved	2026-01-17 17:04:28.719444	\N	\N	Open Source	\N	https://ultimaker.com/software/ultimaker-cura/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
87	FreeCAD	An open source parametric 3D CAD modeler.	22	{linux}	https://github.com/FreeCAD	\N	13	approved	2026-01-17 17:04:28.728752	\N	\N	Open Source	\N	https://www.freecad.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
88	PrusaSlicer	A slicer based on Slic3r by Alessandro Ranellucci and the RepRap community.	22	{linux}	https://github.com/prusa3d/PrusaSlicer	\N	13	approved	2026-01-17 17:04:28.729684	\N	\N	Open Source	\N	https://www.prusa3d.com/page/prusaslicer_424/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
89	Slic3r	Open Source toolpath generator for 3D printers.	22	{linux}	https://github.com/slic3r/Slic3r	\N	13	approved	2026-01-17 17:04:28.730706	\N	\N	Open Source	\N	https://slic3r.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
90	Ardour	Record, Edit, and Mix on Linux.	51	{linux}	https://github.com/Ardour/ardour	\N	13	approved	2026-01-17 17:04:28.731605	\N	\N	Open Source	\N	https://ardour.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
91	Audio Recorder	Simple audio recorder available in an Ubuntu PPA.	51	{linux}	https://bazaar.launchpad.net/~audio-recorder/audio-recorder/trunk/files	\N	13	approved	2026-01-17 17:04:28.733077	\N	\N	Open Source	\N	https://launchpad.net/~audio-recorder	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
92	Bitwig	DAW for music production.	51	{linux}	https://www.bitwig.com/en/download.html	\N	13	approved	2026-01-17 17:04:28.734236	\N	\N	Commercial	\N	https://www.bitwig.com/en/download.html	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
93	EasyEffects	EasyEffects is an advanced audio manipulation tool. It includes an equalizer, limiter, compressor and a reverberation tool, just to mention a few. To complement this there is also a built in spectrum analyzer.	51	{linux}	https://github.com/wwmm/easyeffects	\N	13	approved	2026-01-17 17:04:28.735013	\N	\N	Open Source	\N	https://github.com/wwmm/easyeffects	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
94	Helm	A software synthesizer, that runs either standalone, or as an LV2, VST, VST3 or AU plugin.	51	{linux}	https://github.com/mtytel/helm	\N	13	approved	2026-01-17 17:04:28.735916	\N	\N	Open Source	\N	https://tytel.org/helm/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
95	Hydrogen	Advanced drum machine for GNU/Linux.	51	{linux}	https://github.com/hydrogen-music/hydrogen	\N	13	approved	2026-01-17 17:04:28.73675	\N	\N	Open Source	\N	http://www.hydrogen-music.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
96	KxStudio	A collection of applications and plugins for professional audio production.	51	{linux}	https://github.com/KXStudio/Repository	\N	13	approved	2026-01-17 17:04:28.737535	\N	\N	Open Source	\N	https://kx.studio/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
97	LMMS	Making music on your PC by creating melodies and beats, synthesizing and mixing sounds, arranging samples and much more.	51	{linux}	https://github.com/LMMS/lmms	\N	13	approved	2026-01-17 17:04:28.738321	\N	\N	Open Source	\N	https://lmms.io/download/#linux	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
98	Mixxx	Free DJ software that gives you everything you need to perform live mixes; veritable alternative to Traktor.	51	{linux}	https://github.com/mixxxdj/mixxx	\N	13	approved	2026-01-17 17:04:28.739046	\N	\N	Open Source	\N	https://www.mixxx.org/download/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
99	MuseScore	Create, play and print beautiful sheet music.	51	{linux}	https://github.com/musescore/MuseScore	\N	13	approved	2026-01-17 17:04:28.739818	\N	\N	Open Source	\N	https://musescore.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
100	Ocenaudio	A cross-platform, easy to use, fast and functional audio editor. It is the ideal software for people who need to edit and analyze audio files.	51	{linux}	https://www.ocenaudio.com/whatis	\N	13	approved	2026-01-17 17:04:28.740542	\N	\N	Freeware	\N	https://www.ocenaudio.com/whatis	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
101	Reaper	Audio Production without Limits.	51	{linux}	https://www.reaper.fm/	\N	13	approved	2026-01-17 17:04:28.741219	\N	\N	Commercial	\N	https://www.reaper.fm/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
102	VCV Rack	An open-source virtual modular synthesizer.	51	{linux}	https://github.com/VCVRack/Rack	\N	13	approved	2026-01-17 17:04:28.741959	\N	\N	Open Source	\N	https://vcvrack.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
103	Viper4Linux	An audio effect processor based on Viper4Android.	51	{linux}	https://github.com/Audio4Linux/Viper4Linux-GUI	\N	13	approved	2026-01-17 17:04:28.742671	\N	\N	Open Source	\N	https://github.com/Audio4Linux/Viper4Linux-GUI	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
104	Amarok	Amarok is a free, cross-platform, versatile, powerful and feature-rich music player and collection manager.	52	{linux}	https://invent.kde.org/multimedia/amarok	\N	13	approved	2026-01-17 17:04:28.743381	\N	\N	Open Source	\N	https://apps.kde.org/amarok/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
105	Amberol	A small and simple sound and music player that is well integrated with GNOME.	52	{linux}	https://gitlab.gnome.org/World/amberol	\N	13	approved	2026-01-17 17:04:28.744065	\N	\N	Open Source	\N	https://apps.gnome.org/app/io.bassi.Amberol/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
106	Audacious	An open source audio player that plays your music how you want it, without stealing away your computer’s resources from other tasks.	52	{linux}	https://audacious-media-player.org/developers	\N	13	approved	2026-01-17 17:04:28.74511	\N	\N	Open Source	\N	https://audacious-media-player.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
107	AudioTube	Feature-rich YouTube Music client for KDE, built with Kirigami.	52	{linux}	https://invent.kde.org/multimedia/audiotube	\N	13	approved	2026-01-17 17:04:28.746945	\N	\N	Open Source	\N	https://apps.kde.org/audiotube/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
108	beets	Beets is the media library management system for obsessive-compulsive music geeks.	52	{linux}	https://github.com/beetbox/beets	\N	13	approved	2026-01-17 17:04:28.747695	\N	\N	Open Source	\N	https://beets.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
109	Cantata	Qt6 Graphical MPD (Music Player Daemon) Client for Linux, Windows, MacOS.	52	{linux}	https://github.com/nullobsi/cantata	\N	13	approved	2026-01-17 17:04:28.748495	\N	\N	Open Source	\N	https://github.com/nullobsi/cantata	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
110	Cider	A cross-platform proprietary commercial Apple Music client based on Electron and Vue.js written from scratch with performance in mind.	52	{linux}	https://cider.sh/	\N	13	approved	2026-01-17 17:04:28.749374	\N	\N	Commercial	\N	https://cider.sh/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
111	Clementine	Play numerous lossy and lossless audio formats.	52	{linux}	https://github.com/clementine-player/Clementine	\N	13	approved	2026-01-17 17:04:28.75031	\N	\N	Open Source	\N	https://www.clementine-player.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
112	Cmus	A small, fast and powerful console music player for Unix-like operating systems.	52	{linux}	https://github.com/cmus/cmus	\N	13	approved	2026-01-17 17:04:28.751126	\N	\N	Open Source	\N	https://cmus.github.io/#download	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
113	DeaDBeeF	DeaDBeeF is a modular audio player for GNU/Linux, BSD, OpenSolaris, macOS, and other UNIX-like systems.	52	{linux}	https://github.com/DeaDBeeF-Player/deadbeef	\N	13	approved	2026-01-17 17:04:28.751806	\N	\N	Open Source	\N	https://deadbeef.sourceforge.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
114	Deepin Music	An application, developed by Deepin Technology Team, which focused on local music playing.	52	{linux}	https://github.com/linuxdeepin/deepin-music	\N	13	approved	2026-01-17 17:04:28.75262	\N	\N	Open Source	\N	https://www.deepin.org/en/original/deepin-music/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
115	Elisa	Elisa is a music player developed by the KDE community that strives to be simple and nice to use.	52	{linux}	https://invent.kde.org/multimedia/elisa	\N	13	approved	2026-01-17 17:04:28.75359	\N	\N	Open Source	\N	https://apps.kde.org/elisa/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
116	G4Music	A fast, fluent, light weight music player written in GTK4.	52	{linux}	https://gitlab.gnome.org/neithern/g4music	\N	13	approved	2026-01-17 17:04:28.754551	\N	\N	Open Source	\N	https://gitlab.gnome.org/neithern/g4music	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
117	Gpodder	Media aggregator and podcast client.	52	{linux}	https://github.com/gpodder/gpodder	\N	13	approved	2026-01-17 17:04:28.75549	\N	\N	Open Source	\N	https://gpodder.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
118	Harmonoid	Plays & manages your music library. Looks beautiful & juicy. Playlists, visuals, synced lyrics, pitch shift, volume boost & more.	52	{linux}	https://github.com/harmonoid/harmonoid	\N	13	approved	2026-01-17 17:04:28.756507	\N	\N	Open Source	\N	https://harmonoid.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
119	JuK	Jukebox music player for managing audio and editing metadata.	52	{linux}	https://invent.kde.org/multimedia/juk	\N	13	approved	2026-01-17 17:04:28.75728	\N	\N	Open Source	\N	https://juk.kde.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
120	Libretime	The open broadcast software for scheduling and remote station management; forked from Airtime.	52	{linux}	https://github.com/LibreTime/libretime	\N	13	approved	2026-01-17 17:04:28.759159	\N	\N	Open Source	\N	https://libretime.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
121	Lollypop	A GNOME music playing application.	52	{linux}	https://gitlab.gnome.org/World/lollypop	\N	13	approved	2026-01-17 17:04:28.759957	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Lollypop	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
122	Monophony	Linux app for streaming music from YouTube.	52	{linux}	https://gitlab.com/zehkira/monophony	\N	13	approved	2026-01-17 17:04:28.760677	\N	\N	Open Source	\N	https://gitlab.com/zehkira/monophony	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
123	Moosync	Customizable Desktop Music Player with a clean interface for streaming local music as well as music from online sources such as YouTube and Spotify,.	52	{linux}	https://github.com/Moosync/Moosync	\N	13	approved	2026-01-17 17:04:28.761392	\N	\N	Open Source	\N	https://moosync.app/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
124	Mopidy	An extensible music server written in Python.	52	{linux}	https://github.com/mopidy/mopidy	\N	13	approved	2026-01-17 17:04:28.762148	\N	\N	Open Source	\N	https://www.mopidy.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
125	muffon	muffon is a cross-platform music streaming browser for desktop, which helps you find, listen and organize music in a way you've probably never experienced before.	52	{linux}	https://github.com/staniel359/muffon	\N	13	approved	2026-01-17 17:04:28.762852	\N	\N	Open Source	\N	https://muffon.netlify.app/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
126	Museeks	A simple, clean and cross-platform music player.	52	{linux}	https://github.com/martpie/museeks	\N	13	approved	2026-01-17 17:04:28.763502	\N	\N	Open Source	\N	https://museeks.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
127	Netease Music	A music player of Netease - a cloud music service in China.	52	{linux}	https://music.163.com/#/download	\N	13	approved	2026-01-17 17:04:28.764191	\N	\N	Freeware	\N	https://music.163.com/#/download	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
128	Nuclear	An Electron-based, multiplatform music player app that streams from multiple sources.	52	{linux}	https://github.com/nukeop/nuclear	\N	13	approved	2026-01-17 17:04:28.764909	\N	\N	Open Source	\N	https://nuclearplayer.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
129	Parlatype	GNOME audio player for transcription.	52	{linux}	https://github.com/gkarsay/parlatype	\N	13	approved	2026-01-17 17:04:28.765611	\N	\N	Open Source	\N	https://www.parlatype.xyz/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
130	Pithos	A native Pandora client for Linux.	52	{linux}	https://github.com/pithos/pithos	\N	13	approved	2026-01-17 17:04:28.766308	\N	\N	Open Source	\N	https://pithos.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
131	Quod Libet	GTK+ music player written with huge libraries in mind. Supports search-based dynamic playlists, regular expressions, tagging, Replay Gain, podcasts & Internet radio.	52	{linux}	https://github.com/quodlibet/quodlibet	\N	13	approved	2026-01-17 17:04:28.767078	\N	\N	Open Source	\N	https://quodlibet.readthedocs.io	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
132	Rhythmbox	Music player from GNOME.	52	{linux}	https://github.com/GNOME/rhythmbox	\N	13	approved	2026-01-17 17:04:28.76795	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Rhythmbox	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
133	Sayonara Player	A small, clear and fast audio player for Linux written in C++, supported by the Qt framework.	52	{linux}	https://gitlab.com/luciocarreras/sayonara-player	\N	13	approved	2026-01-17 17:04:28.768682	\N	\N	Open Source	\N	https://sayonara-player.com/downloads/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
134	Sonata	A Music player that is designed to be an elegant and intuitive interface for your music collection via the Music Player Daemon (MPD).	52	{linux}	https://github.com/multani/sonata/	\N	13	approved	2026-01-17 17:04:28.769402	\N	\N	Open Source	\N	https://www.nongnu.org/sonata/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
135	Spot	Native Spotify client for the GNOME desktop.	52	{linux}	https://github.com/xou816/spot	\N	13	approved	2026-01-17 17:04:28.7701	\N	\N	Open Source	\N	https://github.com/xou816/spot	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
136	Spotify	Spotify is the best way to listen to music and podcasts on pc, mobile or tablet.	52	{linux}	https://www.spotify.com/us/	\N	13	approved	2026-01-17 17:04:28.770751	\N	\N	Freeware	\N	https://www.spotify.com/us/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
138	Strawberry	Strawberry is a fork of Clementine aimed at music collectors and audiophiles. It's written in C++ using the Qt toolkit.	52	{linux}	https://github.com/strawberrymusicplayer/strawberry	\N	13	approved	2026-01-17 17:04:28.772065	\N	\N	Open Source	\N	https://www.strawberrymusicplayer.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
139	Tidal-hifi	The web version of Tidal running in electron with hifi support thanks to widevine.	52	{linux}	https://github.com/Mastermindzh/tidal-hifi	\N	13	approved	2026-01-17 17:04:28.772701	\N	\N	Open Source	\N	https://github.com/Mastermindzh/tidal-hifi	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
140	Youtube-Music	YouTube Music Desktop App bundled with custom plugins (and built-in ad blocker / downloader)	52	{linux}	https://github.com/th-ch/youtube-music	\N	13	approved	2026-01-17 17:04:28.77333	\N	\N	Open Source	\N	https://github.com/th-ch/youtube-music/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
141	curseradio	Command line radio player.	53	{linux}	https://github.com/chronitis/curseradio	\N	13	approved	2026-01-17 17:04:28.773952	\N	\N	Open Source	\N	https://github.com/chronitis/curseradio	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
142	Kasts	Feature-rich, convergent podcast client for Linux Desktop and Mobile.	53	{linux}	https://invent.kde.org/multimedia/kasts	\N	13	approved	2026-01-17 17:04:28.774654	\N	\N	Open Source	\N	https://apps.kde.org/kasts/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
143	RadioTray-NG	An Internet radio player for Linux.	53	{linux}	https://github.com/ebruck/radiotray-ng	\N	13	approved	2026-01-17 17:04:28.775318	\N	\N	Open Source	\N	https://github.com/ebruck/radiotray-ng	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
144	Shortwave	Shortwave is an internet radio player that provides access to a station database with over 25,000 stations.	53	{linux}	https://gitlab.gnome.org/World/Shortwave	\N	13	approved	2026-01-17 17:04:28.775978	\N	\N	Open Source	\N	https://apps.gnome.org/app/de.haeckerfelix.Shortwave/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
145	Vocal	Podcast client for the modern desktop.	53	{linux}	https://github.com/needle-and-thread/vocal	\N	13	approved	2026-01-17 17:04:28.776658	\N	\N	Open Source	\N	https://vocalproject.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
592	DeSmuME	DeSmuME is a Nintendo DS emulator.	91	{linux}	https://github.com/TASEmulators/desmume	\N	13	approved	2026-01-17 17:04:29.076244	\N	\N	Open Source	\N	https://desmume.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
147	Ear Tag	Small and simple audio file tag editor.	315	{linux}	https://gitlab.gnome.org/World/eartag	\N	13	approved	2026-01-17 17:04:28.777958	\N	\N	Open Source	\N	https://apps.gnome.org/EarTag/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
148	EasyTag	Edit audio file metadata.	315	{linux}	https://github.com/GNOME/easytag	\N	13	approved	2026-01-17 17:04:28.77895	\N	\N	Open Source	\N	https://github.com/GNOME/easytag	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
150	K3b	The CD/DVD Kreator for Linux, optimized for KDE.	315	{linux}	https://github.com/KDE/k3b	\N	13	approved	2026-01-17 17:04:28.780284	\N	\N	Open Source	\N	https://userbase.kde.org/K3b	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
151	Kid3	Edit tags of multiple files, e.g. the artist, album, year and genre of all mp3 files of an album.	315	{linux}	https://invent.kde.org/multimedia/kid3/	\N	13	approved	2026-01-17 17:04:28.780904	\N	\N	Open Source	\N	https://kid3.kde.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
152	linuxwave	Generate music from the entropy of Linux	315	{linux}	https://github.com/orhun/linuxwave	\N	13	approved	2026-01-17 17:04:28.781509	\N	\N	Open Source	\N	https://orhun.dev/linuxwave/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
137	Spotube	Spotube is a Flutter based lightweight spotify client. It utilizes the power of Spotify & Youtube's public API & creates a hazardless, performant & resource friendly User Experience.	52	{linux}	https://github.com/krtirtho/spotube	\N	13	approved	2026-01-17 17:04:28.771402	\N	\N	Open Source	\N	https://spotube.krtirtho.dev/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
161	Caprine	Elegant Facebook Messenger desktop app.	54	{linux}	https://github.com/sindresorhus/caprine	\N	13	approved	2026-01-17 17:04:28.787407	\N	\N	Open Source	\N	https://github.com/sindresorhus/caprine	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
162	Chatterino	Chatterino is a chat client for Twitch chat. It aims to be an improved/extended version of the Twitch web chat.	54	{linux}	https://github.com/chatterino/chatterino2	\N	13	approved	2026-01-17 17:04:28.78831	\N	\N	Open Source	\N	https://chatterino.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
163	Chatty	Chatty is a Twitch chat client for everyone who wants to try something new and different from the webchat, but doesn't want the complexity of an IRC client or miss out on the Twitch specific features.	54	{linux}	https://github.com/chatty/chatty	\N	13	approved	2026-01-17 17:04:28.78891	\N	\N	Open Source	\N	https://chatty.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
164	Fractal	Fractal is a Matrix messaging app for GNOME written in Rust. Its interface is optimized for collaboration in large groups, such as free software projects.	54	{linux}	https://gitlab.gnome.org/GNOME/fractal	\N	13	approved	2026-01-17 17:04:28.789564	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Fractal	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
165	NeoChat	NeoChat is a Matrix client. It allows you to send text messages, videos and audio files to your family, colleagues and friends using the Matrix protocol.	54	{linux}	https://invent.kde.org/network/neochat	\N	13	approved	2026-01-17 17:04:28.790211	\N	\N	Open Source	\N	https://apps.kde.org/neochat/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
166	nheko	Desktop client for Matrix using Qt and C++20.	54	{linux}	https://github.com/Nheko-Reborn/nheko	\N	13	approved	2026-01-17 17:04:28.79085	\N	\N	Open Source	\N	https://nheko-reborn.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
167	Tokodon	Tokodon is a Mastodon client for Plasma and Plasma Mobile.	54	{linux}	https://invent.kde.org/network/tokodon	\N	13	approved	2026-01-17 17:04:28.791457	\N	\N	Open Source	\N	https://apps.kde.org/tokodon/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
168	Vesktop	Vesktop is a custom Discord App aiming to give you better performance and improve linux support.	54	{linux}	https://github.com/Vencord/Vesktop	\N	13	approved	2026-01-17 17:04:28.79208	\N	\N	Open Source	\N	https://github.com/Vencord/Vesktop	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
169	WebCord	A Discord and Fosscord web-based client made with the electron.	54	{linux}	https://github.com/SpacingBat3/WebCord	\N	13	approved	2026-01-17 17:04:28.792697	\N	\N	Open Source	\N	https://github.com/SpacingBat3/WebCord	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
170	WhatsDesk	WhatsDesk is a unofficial client of WhatsApp.	54	{linux}	https://gitlab.com/zerkc/whatsdesk	\N	13	approved	2026-01-17 17:04:28.793282	\N	\N	Open Source	\N	https://zerkc.gitlab.io/whatsdesk/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
171	Ferdium	[Ferdium](https://ferdium.org/) - Fork of Ferdi/Franz. Ferdium is a desktop app that helps you organize how you use your favourite apps by combining them into one application.	55	{linux}	https://ferdium.org/	\N	13	approved	2026-01-17 17:04:28.793885	\N	\N	Freeware	\N	https://ferdium.org/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
172	Franz	[Franz](https://meetfranz.com/) - Franz is a free messaging app that combines many chat & messaging services into one application.	55	{linux}	https://meetfranz.com/	\N	13	approved	2026-01-17 17:04:28.79449	\N	\N	Freeware	\N	https://meetfranz.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
173	Pidgin	A universal chat client.	55	{linux}	https://developer.pidgin.im/	\N	13	approved	2026-01-17 17:04:28.79511	\N	\N	Open Source	\N	https://pidgin.im/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
174	Rambox	Free and Cross Platform messaging and emailing app that combines common web applications into one.	55	{linux}	https://rambox.app/	\N	13	approved	2026-01-17 17:04:28.79571	\N	\N	Freeware	\N	https://rambox.app/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
175	Tangram	Tangram is a new kind of browser. It is designed to organize and run your Web applications.	55	{linux}	https://github.com/sonnyp/Tangram	\N	13	approved	2026-01-17 17:04:28.796691	\N	\N	Open Source	\N	https://apps.gnome.org/app/re.sonny.Tangram/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
705	Opera	Opera browser is everything you need to do more on the web.	100	{linux}	https://www.opera.com/	\N	13	approved	2026-01-17 17:04:29.152521	\N	\N	Freeware	\N	https://www.opera.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
154	MusicBrainz Picard	Picard is a cross-platform music tagger written in Python.	315	{linux}	https://github.com/metabrainz/picard	\N	13	approved	2026-01-17 17:04:28.782891	\N	\N	Open Source	\N	https://picard.musicbrainz.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
155	MusixMatch	A Capable lyrics app with synchronized lyrics function.	315	{linux}	https://snapcraft.io/musixmatch	\N	13	approved	2026-01-17 17:04:28.783497	\N	\N	Freeware	\N	https://snapcraft.io/musixmatch	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
156	OSD Lyrics	Show lyrics with your favorite media player.	315	{linux}	https://github.com/osdlyrics/osdlyrics	\N	13	approved	2026-01-17 17:04:28.784116	\N	\N	Open Source	\N	https://github.com/osdlyrics/osdlyrics	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
157	Soundconverter	Leading audio file converter. Aims to be simple to use, and very fast.	315	{linux}	https://launchpad.net/soundconverter	\N	13	approved	2026-01-17 17:04:28.784724	\N	\N	Open Source	\N	https://soundconverter.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
158	SoundJuicer	CD Ripping tool for GNOME.	315	{linux}	https://gitlab.gnome.org/GNOME/sound-juicer	\N	13	approved	2026-01-17 17:04:28.785465	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/SoundJuicer/Documentation#Installing	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
159	Soundux	A cross-platform soundboard.	315	{linux}	https://github.com/Soundux/Soundux	\N	13	approved	2026-01-17 17:04:28.786155	\N	\N	Open Source	\N	https://soundux.rocks/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
176	BetterDiscord	BetterDiscord extends the functionality of DiscordApp by enhancing it with new features.	56	{linux}	https://github.com/BetterDiscord/BetterDiscord	\N	13	approved	2026-01-17 17:04:28.797281	\N	\N	Open Source	\N	https://betterdiscord.app/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
177	Discover	Yet another Discord overlay for Linux written in Python using GTK3.	56	{linux}	https://github.com/trigg/Discover	\N	13	approved	2026-01-17 17:04:28.797971	\N	\N	Open Source	\N	https://trigg.github.io/Discover/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
178	JMusicBot	A Discord music bot that's easy to set up and run yourself.	56	{linux}	https://github.com/jagrosh/MusicBot	\N	13	approved	2026-01-17 17:04:28.798551	\N	\N	Open Source	\N	https://jmusicbot.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
179	Red Discord Bot	Red Discord Bot is a self-hosted music/chat/trivia bot that can run on a Raspberry Pi and a variety of OS's. It's extensible through a system of "Cogs" that allow it to do more.	56	{linux}	https://github.com/Cog-Creators/Red-DiscordBot	\N	13	approved	2026-01-17 17:04:28.799153	\N	\N	Open Source	\N	https://index.discord.red/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
180	Vencord	The cutest Discord client mod.	56	{linux}	https://github.com/Vendicated/Vencord	\N	13	approved	2026-01-17 17:04:28.799763	\N	\N	Open Source	\N	https://vencord.dev/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
181	HexChat	HexChat is an IRC client based on XChat, but unlike XChat it’s completely free for both Windows and Unix-like system.	57	{linux}	https://github.com/hexchat	\N	13	approved	2026-01-17 17:04:28.800392	\N	\N	Open Source	\N	https://hexchat.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
182	Irssi	Irssi is a modular chat client that is most commonly known for its text mode user interface.	57	{linux}	https://github.com/irssi/irssi	\N	13	approved	2026-01-17 17:04:28.801047	\N	\N	Open Source	\N	https://irssi.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
183	Konversation	User-friendly and fully-featured IRC client.	57	{linux}	https://invent.kde.org/network/konversation	\N	13	approved	2026-01-17 17:04:28.80207	\N	\N	Open Source	\N	https://konversation.kde.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
184	KVIrc	KVIrc is a free portable IRC client based on the excellent Qt GUI toolkit.	57	{linux}	https://github.com/kvirc/KVIrc	\N	13	approved	2026-01-17 17:04:28.802772	\N	\N	Open Source	\N	https://www.kvirc.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
185	Polari	A simple IRC client that is designed to integrate seamlessly with GNOME.	57	{linux}	https://gitlab.gnome.org/GNOME/polari	\N	13	approved	2026-01-17 17:04:28.803388	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Polari	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
186	Weechat	WeeChat is a fast, light and extensible chat client.	57	{linux}	https://github.com/weechat/weechat	\N	13	approved	2026-01-17 17:04:28.804072	\N	\N	Open Source	\N	https://weechat.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
187	BeeBEEP	[BeeBEEP](https://www.beebeep.net/) - BeeBEEP is an open source, peer to peer, lan messenger. You can talk and share files with anyone inside your local area network. You don't need a server, just download, unzip and start it. Simple, fast and secure.	58	{linux}	https://www.beebeep.net/	\N	13	approved	2026-01-17 17:04:28.804689	\N	\N	Freeware	\N	https://www.beebeep.net/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
188	Dino	Clean and modern Jabber/XMPP chat client.	58	{linux}	https://github.com/dino/dino	\N	13	approved	2026-01-17 17:04:28.805274	\N	\N	Open Source	\N	https://dino.im	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
189	Discord	All-in-one voice and text chat for gamers that’s free, secure, and works on both your desktop and phone.	58	{linux}	https://discord.com/	\N	13	approved	2026-01-17 17:04:28.805942	\N	\N	Freeware	\N	https://discord.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
190	Element	A glossy Matrix collaboration client for the web.	58	{linux}	https://github.com/vector-im/element-web	\N	13	approved	2026-01-17 17:04:28.806588	\N	\N	Open Source	\N	https://element.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
191	Gitter	Gitter — Where developers come to talk. Gitter is designed to make community messaging, collaboration and discovery as smooth and simple as possible.	58	{linux}	https://gitlab.com/gitlab-org/gitter/services	\N	13	approved	2026-01-17 17:04:28.807258	\N	\N	Open Source	\N	https://gitter.im/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
192	Guilded	Guilded is the best app for gaming chat. Guilded is perfect for gaming with friends, clans, guilds, communities, esports, LFG and teams. And it's free.	58	{linux}	https://www.guilded.gg/	\N	13	approved	2026-01-17 17:04:28.807923	\N	\N	Freeware	\N	https://www.guilded.gg/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
193	Jami	Chat. Talk. Share. Jami is a free and universal communication platform which preserves the users' privacy and freedoms. Formerly Ring.	58	{linux}	https://git.jami.net/savoirfairelinux	\N	13	approved	2026-01-17 17:04:28.808569	\N	\N	Open Source	\N	https://jami.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
194	Jitsi	Jitsi is a free and open source multiplatform voice, videoconferencing and instant messaging application for Windows, Linux, Mac OS X and Android.	58	{linux}	https://github.com/jitsi	\N	13	approved	2026-01-17 17:04:28.809189	\N	\N	Open Source	\N	https://jitsi.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
195	Mattermost	Mattermost is a secure collaboration platform that is open, flexible, and deeply integrated with the tools you love.	58	{linux}	https://github.com/mattermost/	\N	13	approved	2026-01-17 17:04:28.809826	\N	\N	Open Source	\N	https://mattermost.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
196	qTox	A simple distributed, secure messenger with audio and video chat capabilities.	58	{linux}	https://github.com/qTox/qTox	\N	13	approved	2026-01-17 17:04:28.810524	\N	\N	Open Source	\N	https://qtox.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
197	Revolt	Revolt is an open source user-first chat platform.	58	{linux}	https://github.com/revoltchat	\N	13	approved	2026-01-17 17:04:28.811128	\N	\N	Open Source	\N	https://revolt.chat/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
198	Rocket.Chat	Rocket.Chat is an open-source fully customizable communications platform developed in JavaScript for organizations with high standards of data protection.	58	{linux}	https://github.com/RocketChat/Rocket.Chat	\N	13	approved	2026-01-17 17:04:28.811792	\N	\N	Open Source	\N	https://rocket.chat/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
199	Session	Session is an end-to-end encrypted messenger that minimises sensitive metadata, designed and built for people who want absolute privacy and freedom from any form of surveillance.	58	{linux}	https://github.com/oxen-io	\N	13	approved	2026-01-17 17:04:28.812382	\N	\N	Open Source	\N	https://getsession.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
200	Skype	Skype keeps the world talking, for free.	58	{linux}	https://www.skype.com/en/	\N	13	approved	2026-01-17 17:04:28.813425	\N	\N	Freeware	\N	https://www.skype.com/en/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
201	Telegram	A messaging app with a focus on speed and security, it’s super fast, simple and free.	58	{linux}	https://github.com/telegramdesktop/tdesktop	\N	13	approved	2026-01-17 17:04:28.814353	\N	\N	Open Source	\N	https://desktop.telegram.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
202	Twake	Open-source alternative to Microsoft Teams.	58	{linux}	https://github.com/linagora/Twake	\N	13	approved	2026-01-17 17:04:28.814965	\N	\N	Open Source	\N	https://twake.app/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
203	Viber	Viber for Linux lets you send free messages and make free calls to other Viber users on any device and network, in any country.	58	{linux}	https://www.viber.com/download/	\N	13	approved	2026-01-17 17:04:28.816144	\N	\N	Freeware	\N	https://www.viber.com/download/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
204	Wire	Secure communication. Full privacy.	58	{linux}	https://github.com/wireapp	\N	13	approved	2026-01-17 17:04:28.816738	\N	\N	Open Source	\N	https://wire.com/en/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
205	Zulip	Zulip is a powerful, open source group chat application that combines the immediacy of real-time chat with the productivity benefits of threaded conversations.	58	{linux}	https://github.com/zulip/zulip	\N	13	approved	2026-01-17 17:04:28.817352	\N	\N	Open Source	\N	https://zulip.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
206	Back In Time	A simple backup tool for Linux, inspired by "flyback project".	25	{linux}	https://github.com/bit-team/backintime/	\N	13	approved	2026-01-17 17:04:28.817959	\N	\N	Open Source	\N	https://github.com/bit-team/backintime/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
207	BorgBackup	A deduplicating backup program with compression and authenticated encryption.	25	{linux}	https://borgbackup.readthedocs.io/en/stable/development.html	\N	13	approved	2026-01-17 17:04:28.818617	\N	\N	Open Source	\N	https://borgbackup.readthedocs.io/en/stable/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
208	bup	Very efficient backup system based on the git packfile format, providing fast incremental saves and global deduplication (among and within files, including virtual machine images).	25	{linux}	https://github.com/bup/bup	\N	13	approved	2026-01-17 17:04:28.819305	\N	\N	Open Source	\N	https://bup.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
209	Deja Dup	A simple backup tool with built-in encryption.	25	{linux}	https://gitlab.gnome.org/World/deja-dup	\N	13	approved	2026-01-17 17:04:28.819967	\N	\N	Open Source	\N	https://apps.gnome.org/DejaDup/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
210	Duplicacy	Duplicacy is a new generation cross-platform cloud backup tool based on the idea of Lock-Free Deduplication. CLI version is free for personal use and is open-source, GUI and commercial use require licensing.	25	{linux}	https://github.com/gilbertchen/duplicacy	\N	13	approved	2026-01-17 17:04:28.820584	\N	\N	Open Source	\N	https://duplicacy.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
211	Duplicity	Duplicity does directory backups by producing encrypted tar-format volumes and uploading them to a remote or local file server.	25	{linux}	https://gitlab.com/duplicity/duplicity	\N	13	approved	2026-01-17 17:04:28.821214	\N	\N	Open Source	\N	https://duplicity.gitlab.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
212	FreeFileSync	FreeFileSync is a folder comparison and synchronization software that creates and manages backup copies of all your important files. Instead of copying every file every time, FreeFileSync determines the differences between a source and a target folder and transfers only the minimum amount of data needed.	25	{linux}	https://www.freefilesync.org/download.php	\N	13	approved	2026-01-17 17:04:28.821946	\N	\N	Open Source	\N	https://www.freefilesync.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
213	Kopia	Cross-platform backup tool for Windows, macOS & Linux with fast, incremental backups, client-side end-to-end encryption, compression and data deduplication.	25	{linux}	https://github.com/kopia/kopia/	\N	13	approved	2026-01-17 17:04:28.822937	\N	\N	Open Source	\N	https://kopia.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
214	Photorec	PhotoRec is file data recovery software designed to recover lost files including video, documents and archives from hard disks, CD-ROMs, and lost pictures (thus the Photo Recovery name) from digital camera memory.	25	{linux}	https://github.com/cgsecurity/testdisk	\N	13	approved	2026-01-17 17:04:28.82378	\N	\N	Open Source	\N	https://www.cgsecurity.org/wiki/PhotoRec	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
215	Pika Backup	Pika Backup is designed to save your personal data and does not support complete system recovery. Pika Backup is powered by the well-tested BorgBackup software.	25	{linux}	https://gitlab.gnome.org/World/pika-backup	\N	13	approved	2026-01-17 17:04:28.824434	\N	\N	Open Source	\N	https://apps.gnome.org/app/org.gnome.World.PikaBackup/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
217	rclone	Rclone is a command line program to sync files and directories to and from various cloud storage solutions. It also allows encrypted backups.	25	{linux}	https://github.com/ncw/rclone	\N	13	approved	2026-01-17 17:04:28.825713	\N	\N	Open Source	\N	https://rclone.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1569	fpm	Versatile multi format package creator	171	{Linux}	https://github.com/jordansissel/fpm	\N	1	approved	2026-01-17 17:48:41.402889	\N	\N	MIT	\N	\N	\N	software
219	rsnapshot	rsnapshot is a command line utility based on rsync to make periodic snapshots of local/remote machines. The code makes extensive use of hard links whenever possible to greatly reduce the disk space required.	25	{linux}	https://github.com/rsnapshot/rsnapshot	\N	13	approved	2026-01-17 17:04:28.827283	\N	\N	Open Source	\N	https://rsnapshot.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
220	System Rescue CD	SystemRescueCd is a Linux system rescue disk available as a bootable CD-ROM or USB stick for administrating or repairing your system and data after a crash.	25	{linux}	https://sourceforge.net/projects/systemrescuecd/	\N	13	approved	2026-01-17 17:04:28.827995	\N	\N	Open Source	\N	https://www.system-rescue.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
221	TestDisk	TestDisk is powerful free data recovery software! It was primarily designed to help recover lost partitions and/or make non-booting disks bootable again when these symptoms are caused by faulty software.	25	{linux}	https://github.com/cgsecurity/testdisk	\N	13	approved	2026-01-17 17:04:28.828797	\N	\N	Open Source	\N	https://www.cgsecurity.org/wiki/TestDisk	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
223	Vorta	Vorta is a backup client for macOS and Linux desktops. It integrates the mighty BorgBackup with your desktop environment to protect your data from disk failure, ransomware and theft.	25	{linux}	https://github.com/borgbase/vorta	\N	13	approved	2026-01-17 17:04:28.83019	\N	\N	Open Source	\N	https://vorta.borgbase.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
224	Candy Icons	An icon theme colored with sweet gradients.	59	{linux}	https://github.com/EliverLara/candy-icons	\N	13	approved	2026-01-17 17:04:28.830887	\N	\N	Open Source	\N	https://github.com/EliverLara/candy-icons	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
225	Flat Remix	Flat Remix is an icon theme inspired by material design. It is mostly flat using a colorful palette with some shadows, highlights, and gradients for some depth.	59	{linux}	https://github.com/daniruiz/Flat-Remix	\N	13	approved	2026-01-17 17:04:28.832109	\N	\N	Open Source	\N	https://github.com/daniruiz/Flat-Remix	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
226	Fluent Icon Theme	Fluent icon theme for linux desktops.	59	{linux}	https://github.com/vinceliuice/Fluent-icon-theme	\N	13	approved	2026-01-17 17:04:28.832817	\N	\N	Open Source	\N	https://github.com/vinceliuice/Fluent-icon-theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
228	Moka Icon Theme	Moka was created with simplicity in mind. With the use simple geometry & bright colours.	59	{linux}	https://github.com/snwh/moka-icon-theme	\N	13	approved	2026-01-17 17:04:28.834584	\N	\N	Open Source	\N	https://snwh.org/moka	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
229	Numix Icon Theme	A flat icon theme that comes in two varieties, Numix Main, and Numix circle.	59	{linux}	https://github.com/numixproject/numix-icon-theme	\N	13	approved	2026-01-17 17:04:28.835256	\N	\N	Open Source	\N	https://numixproject.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
231	Qogir Icon Theme	A flat colorful design icon theme for linux desktops.	59	{linux}	https://github.com/vinceliuice/Qogir-icon-theme	\N	13	approved	2026-01-17 17:04:28.836541	\N	\N	Open Source	\N	https://github.com/vinceliuice/Qogir-icon-theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
232	Reversal Icon Theme	A colorful design icon theme for linux desktops.	59	{linux}	https://github.com/yeyushengfan258/Reversal-icon-theme	\N	13	approved	2026-01-17 17:04:28.837171	\N	\N	Open Source	\N	https://github.com/yeyushengfan258/Reversal-icon-theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
233	Tela Icon Theme	A flat colorful Design icon theme.	59	{linux}	https://github.com/vinceliuice/Tela-icon-theme	\N	13	approved	2026-01-17 17:04:28.83777	\N	\N	Open Source	\N	https://github.com/vinceliuice/Tela-icon-theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
234	WhiteSur Icon Theme	MacOS Big Sur style icon theme for linux desktops.	59	{linux}	https://github.com/vinceliuice/WhiteSur-icon-theme	\N	13	approved	2026-01-17 17:04:28.838386	\N	\N	Open Source	\N	https://github.com/vinceliuice/WhiteSur-icon-theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
235	Zafiro Icons	Minimalist icons created with the flat-desing technique, utilizing washed out colors and always accompanied by white.	59	{linux}	https://github.com/zayronxio/Zafiro-icons	\N	13	approved	2026-01-17 17:04:28.838991	\N	\N	Open Source	\N	https://github.com/zayronxio/Zafiro-icons	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
236	Ant Theme	Ant is a flat GTK theme for Ubuntu and other GNOME-based Linux desktops it comes in three varieties: vanilla, Bloody, or Dracula.	60	{linux}	https://github.com/EliverLara/Ant	\N	13	approved	2026-01-17 17:04:28.83956	\N	\N	Open Source	\N	https://github.com/EliverLara/Ant	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
237	Arc Theme	A flat theme with transparent elements.	60	{linux}	https://github.com/jnsh/arc-theme	\N	13	approved	2026-01-17 17:04:28.840109	\N	\N	Open Source	\N	https://github.com/jnsh/arc-theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
238	Catppuccin	Catppuccin is a community-driven pastel theme that aims to be the middle ground between low and high contrast themes.	60	{linux}	https://github.com/catppuccin	\N	13	approved	2026-01-17 17:04:28.840669	\N	\N	Open Source	\N	https://github.com/catppuccin	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1681	The Lounge	Modern web IRC client	186	{Web}	https://opencollective.com/thelounge	\N	1	approved	2026-01-18 09:29:54.699555	\N	\N	Open Source	\N	\N	\N	software
239	Dracula	A dark theme using the awesome Dracula color pallete.	60	{linux}	https://github.com/dracula/gtk	\N	13	approved	2026-01-17 17:04:28.841224	\N	\N	Open Source	\N	https://draculatheme.com/gtk	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
240	Graphite	Graphite GTK theme.	60	{linux}	https://github.com/vinceliuice/Graphite-gtk-theme	\N	13	approved	2026-01-17 17:04:28.842174	\N	\N	Open Source	\N	https://github.com/vinceliuice/Graphite-gtk-theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
241	Gruvbox	A GTK theme based on the Gruvbox colour palette.	60	{linux}	https://github.com/Fausto-Korpsvart/Gruvbox-GTK-Theme	\N	13	approved	2026-01-17 17:04:28.843039	\N	\N	Open Source	\N	https://github.com/Fausto-Korpsvart/Gruvbox-GTK-Theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
242	Kimi	Kimi is a light Gtk3.20+ theme.	60	{linux}	https://github.com/EliverLara/Kimi	\N	13	approved	2026-01-17 17:04:28.843607	\N	\N	Open Source	\N	https://github.com/EliverLara/Kimi	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
243	Layan	Layan is a flat Material Design theme for GTK 3, GTK 2 and Gnome-Shell which supports GTK 3 and GTK 2 based desktop environments like Gnome, Budgie, etc.	60	{linux}	https://github.com/vinceliuice/Layan-gtk-theme	\N	13	approved	2026-01-17 17:04:28.844179	\N	\N	Open Source	\N	https://github.com/vinceliuice/Layan-gtk-theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
244	Material Ocean Theme	A material design theme with oceanic colors(GTK, QT).	60	{linux}	https://github.com/material-ocean/material-ocean	\N	13	approved	2026-01-17 17:04:28.844849	\N	\N	Open Source	\N	https://github.com/material-ocean/material-ocean	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
245	Mojave GTK Theme	Mojave is a Mac OSX like theme for GTK 3, GTK 2 and GNOME-Shell which supports GTK 3 and GTK 2 based desktop environments like GNOME, Pantheon, XFCE, Mate, etc.	60	{linux}	https://github.com/vinceliuice/Mojave-gtk-theme	\N	13	approved	2026-01-17 17:04:28.84538	\N	\N	Open Source	\N	https://github.com/vinceliuice/Mojave-gtk-theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
246	Nordic	Dark Gtk3.20+ theme created using the awesome Nord color pallete.	60	{linux}	https://github.com/EliverLara/Nordic	\N	13	approved	2026-01-17 17:04:28.845982	\N	\N	Open Source	\N	https://github.com/EliverLara/Nordic	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
247	Orchis theme	Orchis is a Material Design theme for GNOME/GTK based desktop environments.	60	{linux}	https://github.com/vinceliuice/Orchis-theme	\N	13	approved	2026-01-17 17:04:28.846584	\N	\N	Open Source	\N	https://github.com/vinceliuice/Orchis-theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
248	Qogir	Qogir is a flat Design theme for GTK.	60	{linux}	https://github.com/vinceliuice/Qogir-theme	\N	13	approved	2026-01-17 17:04:28.847179	\N	\N	Open Source	\N	https://github.com/vinceliuice/Qogir-theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
249	Sweet	Light and dark colorful Gtk3.20+ theme.	60	{linux}	https://github.com/EliverLara/Sweet	\N	13	approved	2026-01-17 17:04:28.84775	\N	\N	Open Source	\N	https://github.com/EliverLara/Sweet	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
250	WhiteSur GTK Theme	MacOS Big Sur like theme for GNOME desktops.	60	{linux}	https://github.com/vinceliuice/WhiteSur-gtk-theme	\N	13	approved	2026-01-17 17:04:28.848326	\N	\N	Open Source	\N	https://github.com/vinceliuice/WhiteSur-gtk-theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
251	Conky	Conky is a free, light-weight system monitor for X, that displays any kind of information on your desktop.	61	{linux}	https://github.com/brndnmtthws/conky	\N	13	approved	2026-01-17 17:04:28.848903	\N	\N	Open Source	\N	https://conky.cc/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
252	Extension Manager	A utility for browsing and installing GNOME Shell Extensions.	61	{linux}	https://github.com/mjakeman/extension-manager	\N	13	approved	2026-01-17 17:04:28.84949	\N	\N	Open Source	\N	https://github.com/mjakeman/extension-manager	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
253	GNOME Extensions	Extensions for the GNOME Desktop Environment.	61	{linux}	https://extensions.gnome.org/	\N	13	approved	2026-01-17 17:04:28.850102	\N	\N	Freeware	\N	https://extensions.gnome.org/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
254	GNOME Look	A website that hosts a Large amounts of community created icons, shell themes, fonts, and many more assets that can be used to customize your GNOME desktop environment.	61	{linux}	https://www.gnome-look.org/	\N	13	approved	2026-01-17 17:04:28.851242	\N	\N	Freeware	\N	https://www.gnome-look.org/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
255	Gradience	Gradience is a tool for customizing Libadwaita applications and the adw-gtk3 theme.	61	{linux}	https://github.com/GradienceTeam/Gradience	\N	13	approved	2026-01-17 17:04:28.851807	\N	\N	Open Source	\N	https://gradienceteam.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
256	Hardcode Tray	This script fixes hardcoded tray icons in Linux by automatically detecting your default theme, the right icon size, the hard-coded applications, the right icons for each indicator and fix them.	61	{linux}	https://github.com/bilelmoussaoui/Hardcode-Tray	\N	13	approved	2026-01-17 17:04:28.852367	\N	\N	Open Source	\N	https://github.com/bilelmoussaoui/Hardcode-Tray	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
257	Kando	A cross-platform pie menu for your desktop, offering an unconventional, fast, and highly efficient way of interacting with your computer using mouse, stylus, touch, or controller input.	61	{linux}	https://github.com/kando-menu/kando	\N	13	approved	2026-01-17 17:04:28.852946	\N	\N	Open Source	\N	https://kando.menu/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
258	Lemonbar	Super fast, lightweight, and mnml status bar for Linux.	61	{linux}	https://github.com/LemonBoy/bar	\N	13	approved	2026-01-17 17:04:28.853529	\N	\N	Open Source	\N	https://github.com/LemonBoy/bar	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
259	Login Manager Settings	A settings app for GNOME's Login Manager, GDM.	61	{linux}	https://github.com/realmazharhussain/gdm-settings	\N	13	approved	2026-01-17 17:04:28.854126	\N	\N	Open Source	\N	https://realmazharhussain.github.io/gdm-settings/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
261	Pling Store	Desktop app of openDesktop.org, which is one of the largest communities where developers and artists share applications, themes and other content.	61	{linux}	https://www.opencode.net/dfn2/pling-store-development	\N	13	approved	2026-01-17 17:04:28.855258	\N	\N	Open Source	\N	https://www.pling.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
262	Polybar	Fast and easy-to-use status bar.	61	{linux}	https://github.com/jaagr/polybar	\N	13	approved	2026-01-17 17:04:28.856083	\N	\N	Open Source	\N	https://polybar.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
263	Wpgtk	A universal theming software for all themes defined in text files, compatible with all terminals, with default themes for GTK2, GTK+, openbox and Tint2 that uses pywal as it's core for colorscheme generation.	61	{linux}	https://github.com/deviantfero/wpgtk	\N	13	approved	2026-01-17 17:04:28.856676	\N	\N	Open Source	\N	https://deviantfero.github.io/wpgtk	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
264	Anbox	Run Android applications on any GNU/Linux operating system.	62	{linux}	https://github.com/anbox/anbox	\N	13	approved	2026-01-17 17:04:28.857249	\N	\N	Open Source	\N	https://anbox.io	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
265	Android Studio	The Official IDE for Android: Android Studio provides the fastest tools for building apps on every type of Android device.	62	{linux}	https://android.googlesource.com/platform/tools/base/+/studio-master-dev/source.md	\N	13	approved	2026-01-17 17:04:28.857812	\N	\N	Open Source	\N	https://developer.android.com/studio/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
266	Waydroid	Waydroid uses a container-based approach to boot a full Android system on a regular GNU/Linux system like Ubuntu.	62	{linux}	https://github.com/waydroid/waydroid	\N	13	approved	2026-01-17 17:04:28.858364	\N	\N	Open Source	\N	https://waydro.id/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
267	CLion	A cross-platform and powerful IDE for C/C++.	63	{linux}	https://www.jetbrains.com/clion/	\N	13	approved	2026-01-17 17:04:28.859162	\N	\N	Commercial	\N	https://www.jetbrains.com/clion/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
268	CodeLite	A Free, open source, cross platform C/C++, PHP and Node.js IDE.	63	{linux}	https://wiki.codelite.org/pmwiki.php/Main/Repositories	\N	13	approved	2026-01-17 17:04:28.860025	\N	\N	Open Source	\N	https://codelite.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
269	QT Creator	Fully-stocked cross-platform integrated development environment for easy creation of connected devices, UIs and applications.	63	{linux}	https://github.com/qt-creator/qt-creator	\N	13	approved	2026-01-17 17:04:28.860664	\N	\N	Open Source	\N	https://www.qt.io/product/development-tools	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
270	Cassandra	Apache Cassandra database is the right choice when you need scalability and high availability without compromising performance. Linear scalability and proven fault-tolerance on commodity hardware or cloud infrastructure make it the perfect platform for mission-critical data.	64	{linux}	https://github.com/apache/cassandra	\N	13	approved	2026-01-17 17:04:28.861295	\N	\N	Open Source	\N	https://cassandra.apache.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
272	DataGrip	DataGrip is a cross-platform IDE that is aimed at DBAs and developers working with SQL databases. It has built-in drivers that support DB2, Derby, H2, HSQLDB, MySQL, Oracle, PostgreSQL, SQL Server, Sqlite and Sybase.	64	{linux}	https://www.jetbrains.com/datagrip/	\N	13	approved	2026-01-17 17:04:28.862539	\N	\N	Freeware	\N	https://www.jetbrains.com/datagrip/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
273	DBeaver	A universal database client supporting multiple platforms and databases.	64	{linux}	https://github.com/dbeaver/dbeaver	\N	13	approved	2026-01-17 17:04:28.863321	\N	\N	Open Source	\N	https://dbeaver.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
274	Ispirer	[Ispirer Toolkit](https://www.ispirer.com/) - Ispirer Toolkit is a powerful database migration and conversion tool designed to automate migrations across many major database systems and programming languages, such as Oracle, SQL Server, IBM DB2, PostgreSQL, Informix, MySQL, and more. Ispirer Toolkit is available for Linux, including Debian-based distributions.	64	{linux}	https://github.com/Ispirer	\N	13	approved	2026-01-17 17:04:28.863897	\N	\N	Commercial	\N	https://github.com/Ispirer	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
275	Kexi	Kexi is an open source visual database applications creator, a long-awaited competitor for programs like MS Access or Filemaker.	64	{linux}	https://invent.kde.org/office/kexi	\N	13	approved	2026-01-17 17:04:28.864483	\N	\N	Open Source	\N	https://calligra.org/kexi/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
276	MariaDB	One of the most popular database servers. Made by the original developers of MySQL.	64	{linux}	https://mariadb.org/get-involved/getting-started-for-developers/	\N	13	approved	2026-01-17 17:04:28.865049	\N	\N	Open Source	\N	https://mariadb.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
277	MongoDB	MongoDB is a free and open-source cross-platform document-oriented database program, uses JSON-like documents with schemas.	64	{linux}	https://github.com/mongodb/mongo	\N	13	approved	2026-01-17 17:04:28.865634	\N	\N	Open Source	\N	https://www.mongodb.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
278	MyCLI	MyCLI is a command line interface for MySQL, MariaDB, and Percona with auto-completion and syntax highlighting.	64	{linux}	https://github.com/dbcli/mycli	\N	13	approved	2026-01-17 17:04:28.866245	\N	\N	Open Source	\N	https://www.mycli.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
279	MySQL	MySQL is the world's leading open source database thanks to its proven performance, reliability and ease-of-use. It is used by high profile web properties including Facebook, Twitter, YouTube, Yahoo! and many more.	64	{linux}	https://github.com/mysql/mysql-server	\N	13	approved	2026-01-17 17:04:28.866811	\N	\N	Open Source	\N	https://dev.mysql.com/doc/refman/5.7/en/linux-installation.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
280	MySQL Workbench	MySQL Workbench is a unified visual tool for database architects, developers, and DBAs. MySQL Workbench provides data modeling, SQL development, and comprehensive administration tools for server configuration, user administration, backup, and much more.	64	{linux}	https://github.com/mysql/mysql-workbench	\N	13	approved	2026-01-17 17:04:28.867939	\N	\N	Open Source	\N	https://www.mysql.com/products/workbench/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
281	OceanBase	Distributed relational database. Based on the Paxos protocol and its distributed structure, it provides high availability and linear scalability.	64	{linux}	https://github.com/oceanbase/oceanbase	\N	13	approved	2026-01-17 17:04:28.868494	\N	\N	Open Source	\N	https://github.com/oceanbase/oceanbase	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
282	OmniDB	Browser-based tool that visually create, manage, and view databases.	64	{linux}	https://github.com/OmniDB/OmniDB	\N	13	approved	2026-01-17 17:04:28.86908	\N	\N	Open Source	\N	https://github.com/OmniDB/OmniDB	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
283	OracleDB	Object-relational database management system produced and marketed by Oracle Corporation, one of the most trusted and widely-used relational database engines.	64	{linux}	https://www.oracle.com/technetwork/database/enterprise-edition/downloads/index.html	\N	13	approved	2026-01-17 17:04:28.869641	\N	\N	Commercial	\N	https://www.oracle.com/technetwork/database/enterprise-edition/downloads/index.html	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
284	Percona MongoDB	Percona Server for MongoDB provides all features and benefits of MongoDB Community Server.	64	{linux}	https://github.com/percona/percona-server-mongodb	\N	13	approved	2026-01-17 17:04:28.870233	\N	\N	Open Source	\N	https://www.percona.com/software/mongo-database/percona-server-for-mongodb	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
285	Percona Monitoring	Percona Monitoring and Management (PMM) is a free and open-source platform for managing and monitoring MySQL, MariaDB and MongoDB performance. You can run PMM in your own environment for maximum security and reliability. It provides thorough time-based analysis for MySQL, MariaDB and MongoDB servers to ensure that your data works as efficiently as possible.	64	{linux}	https://github.com/percona/pmm-server	\N	13	approved	2026-01-17 17:04:28.870824	\N	\N	Open Source	\N	https://www.percona.com/software/database-tools/percona-monitoring-and-management	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
286	Percona MySQL	Percona Server for MySQL is a free, fully compatible, enhanced, open source drop-in replacement for MySQL that provides superior performance, scalability and instrumentation.	64	{linux}	https://github.com/percona/percona-server	\N	13	approved	2026-01-17 17:04:28.871447	\N	\N	Open Source	\N	https://www.percona.com/software/mysql-database/percona-server	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
287	Percona XtraDB Cluster	Percona XtraDB Cluster is an active/active high availability and high scalability open source solution for MySQL clustering. It integrates Percona Server and Percona XtraBackup with the Codership Galera library of MySQL high availability solutions in a single package that enables you to create a cost-effective MySQL high availability cluster.	64	{linux}	https://github.com/percona/percona-xtradb-cluster	\N	13	approved	2026-01-17 17:04:28.872034	\N	\N	Open Source	\N	https://www.percona.com/software/mysql-database/percona-xtradb-cluster	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
288	pgcli	Pgcli is a command line interface for Postgres with auto-completion and syntax highlighting.	64	{linux}	https://github.com/dbcli/pgcli	\N	13	approved	2026-01-17 17:04:28.872598	\N	\N	Open Source	\N	https://www.pgcli.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
289	PostgreSQL	PostgreSQL is a powerful, open source object-relational database system with more than 15 year development. PostgreSQL is not controlled by any corporation or other private entity and the source code is available free of charge.	64	{linux}	https://github.com/postgres/postgres	\N	13	approved	2026-01-17 17:04:28.873177	\N	\N	Open Source	\N	https://www.postgresql.org/download/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
290	Sqlite	SQLite is an in-process library that implements a self-contained, serverless, zero-configuration, transactional SQL database engine.	64	{linux}	https://www.sqlite.org/src/doc/trunk/README.md	\N	13	approved	2026-01-17 17:04:28.873702	\N	\N	Open Source	\N	https://sqlite.org/download.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
291	Sqlite Browser	Visually create, manage, and view sqlite database files.	64	{linux}	https://github.com/sqlitebrowser/sqlitebrowser	\N	13	approved	2026-01-17 17:04:28.874502	\N	\N	Open Source	\N	https://sqlitebrowser.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
292	WebDB	Open Source and Efficient Database IDE. Easy server connection, Modern ERD, Intelligent data generator, IA assistant, NoSQL structure manager, Time machine and Powerful query editor.	64	{linux}	https://github.com/WebDB-App/app	\N	13	approved	2026-01-17 17:04:28.875064	\N	\N	Open Source	\N	https://webdb.app/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1208	lolcat	Displays text in rainbow colors.	44	{linux}	https://github.com/busyloop/lolcat	\N	13	approved	2026-01-17 17:04:29.545229	\N	\N	Open Source	\N	https://github.com/busyloop/lolcat	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
295	Epic Asset Manager	An unofficial client to install Unreal Engine, download and manage purchased assets, projects, plugins and games from the Epic Games Store.	264	{linux}	https://github.com/AchetaGames/Epic-Asset-Manager	\N	13	approved	2026-01-17 17:04:28.876916	\N	\N	Open Source	\N	https://github.com/AchetaGames/Epic-Asset-Manager	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
296	Flax Engine	Flax Engine – multi-platform 3D game engine.	264	{linux}	https://github.com/FlaxEngine/FlaxEngine	\N	13	approved	2026-01-17 17:04:28.877525	\N	\N	Open Source	\N	https://flaxengine.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
297	GameMaker	The Ultimate 2D Game Development Environment.	264	{linux}	https://gamemaker.io/en	\N	13	approved	2026-01-17 17:04:28.878129	\N	\N	Freeware	\N	https://gamemaker.io/en	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
298	GDevelop	Open-source, cross-platform game engine designed to be used by everyone.	264	{linux}	https://github.com/4ian/GDevelop	\N	13	approved	2026-01-17 17:04:28.878701	\N	\N	Open Source	\N	https://gdevelop.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
299	Godot Engine	Godot provides a huge set of common tools, so you can just focus on making your game without reinventing the wheel.	264	{linux}	https://github.com/godotengine	\N	13	approved	2026-01-17 17:04:28.879435	\N	\N	Open Source	\N	https://godotengine.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
307	cgit	A hyperfast web frontend for git repositories written in C.	66	{linux}	https://git.zx2c4.com/cgit/refs/tags	\N	13	approved	2026-01-17 17:04:28.884311	\N	\N	Open Source	\N	https://git.zx2c4.com/cgit/about/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
308	Forgejo	Forgejo is a self-hosted lightweight software forge. It is a "soft" fork of Gitea with a focus on scaling, federation and privacy.	66	{linux}	https://codeberg.org/forgejo/forgejo	\N	13	approved	2026-01-17 17:04:28.88486	\N	\N	Open Source	\N	https://forgejo.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
309	Giggle	Giggle is a graphical frontend for the git content tracker.	66	{linux}	https://gitlab.gnome.org/GNOME/giggle/	\N	13	approved	2026-01-17 17:04:28.885442	\N	\N	Open Source	\N	https://wiki.gnome.org/action/show/Apps/giggle	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
310	Gisto	Gisto is a code snippet manager that runs on GitHub Gists and adds additional features such as searching, tagging and sharing gists while including a rich code editor.	66	{linux}	https://github.com/Gisto/Gisto	\N	13	approved	2026-01-17 17:04:28.885994	\N	\N	Open Source	\N	https://www.gistoapp.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
311	Git	Git is a free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.	66	{linux}	https://github.com/git/git	\N	13	approved	2026-01-17 17:04:28.886572	\N	\N	Open Source	\N	https://git-scm.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
312	GitCola	Git Cola is a sleek and powerful graphical Git client. Written in Python and GPL-licensed.	66	{linux}	https://github.com/git-cola/git-cola	\N	13	approved	2026-01-17 17:04:28.88714	\N	\N	Open Source	\N	https://git-cola.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
313	Gitea	Gitea is a community managed lightweight code hosting solution written in Go. It is published under the MIT license.	66	{linux}	https://github.com/go-gitea/	\N	13	approved	2026-01-17 17:04:28.887965	\N	\N	Open Source	\N	https://about.gitea.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
314	Gitg	Gitg is the GNOME GUI client to view git repositories.	66	{linux}	https://gitlab.gnome.org/GNOME/gitg	\N	13	approved	2026-01-17 17:04:28.88854	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Gitg	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
315	GitLab	GitLab is a web-based Git repository manager with wiki and issue tracking features.	66	{linux}	https://github.com/gitlabhq/gitlabhq	\N	13	approved	2026-01-17 17:04:28.889386	\N	\N	Open Source	\N	https://github.com/gitlabhq/gitlabhq	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
316	Gitolite	Gitolite allows you to setup git hosting on a central server, with fine-grained access control and many more powerful features.	66	{linux}	https://github.com/sitaramc/gitolite	\N	13	approved	2026-01-17 17:04:28.889952	\N	\N	Open Source	\N	https://gitolite.com/gitolite/index.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
317	Gittyup	Gittyup is a graphical Git client designed to help you understand and manage your source code history.	66	{linux}	https://github.com/Murmele/Gittyup	\N	13	approved	2026-01-17 17:04:28.890541	\N	\N	Open Source	\N	https://murmele.github.io/Gittyup/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
318	Gogs	A painless self-hosted Git service.	66	{linux}	https://github.com/gogs/gogs	\N	13	approved	2026-01-17 17:04:28.891363	\N	\N	Open Source	\N	https://gogs.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
319	lazygit	A simple terminal UI for git commands, written in Go with the gocui library.	66	{linux}	https://github.com/jesseduffield/lazygit	\N	13	approved	2026-01-17 17:04:28.891937	\N	\N	Open Source	\N	https://github.com/jesseduffield/lazygit	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
320	SmartGit	SmartGit is a Git client with support for GitHub Pull Requests+Comments and SVN.	66	{linux}	https://www.syntevo.com/smartgit/	\N	13	approved	2026-01-17 17:04:28.892528	\N	\N	Commercial	\N	https://www.syntevo.com/smartgit/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
321	SourceGit	SourceGit is a simple graphical git client available for Windows, macOS and Linux.	66	{linux}	https://github.com/sourcegit-scm/sourcegit	\N	13	approved	2026-01-17 17:04:28.893121	\N	\N	Open Source	\N	https://sourcegit-scm.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
322	GoLand	Commercial IDE by JetBrains aimed at providing an ergonomic environment for Go development.	67	{linux}	https://www.jetbrains.com/go/	\N	13	approved	2026-01-17 17:04:28.893742	\N	\N	Commercial	\N	https://www.jetbrains.com/go/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
302	Open 3D Engine	Open 3D Engine (O3DE) is a modular, open source, cross-platform 3D engine built to power anything from AAA games to cinema-quality 3D worlds to high-fidelity simulations.	264	{linux}	https://github.com/o3de/o3de/	\N	13	approved	2026-01-17 17:04:28.881255	\N	\N	Open Source	\N	https://www.o3de.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
303	Stride	Stride is an open-source C# game engine for realistic rendering and VR.	264	{linux}	https://github.com/stride3d/stride	\N	13	approved	2026-01-17 17:04:28.881793	\N	\N	Open Source	\N	https://www.stride3d.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
304	Unity	The world’s leading platform for real-time content creation.	264	{linux}	https://unity.com/	\N	13	approved	2026-01-17 17:04:28.882568	\N	\N	Freeware	\N	https://unity.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
305	Unreal Engine	The world’s most open and advanced real-time 3D creation tool.	264	{linux}	https://www.unrealengine.com/en-US	\N	13	approved	2026-01-17 17:04:28.88318	\N	\N	Freeware	\N	https://www.unrealengine.com/en-US	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
306	Wicked Engine	3D engine with modern graphics.	264	{linux}	https://github.com/turanszkij/WickedEngine	\N	13	approved	2026-01-17 17:04:28.883778	\N	\N	Open Source	\N	https://wickedengine.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
323	LiteIDE X	LiteIDE is a simple, open source, cross-platform Go IDE.	67	{linux}	https://github.com/visualfc/liteide	\N	13	approved	2026-01-17 17:04:28.894377	\N	\N	Open Source	\N	https://github.com/visualfc/liteide	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
324	BlueJ	A free Java Development Environment designed for beginners, used by millions worldwide.	68	{linux}	https://www.bluej.org/versions.html	\N	13	approved	2026-01-17 17:04:28.895064	\N	\N	Open Source	\N	https://bluej.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
325	Eclipse	Eclipse is famous for our Java Integrated Development Environment (IDE), but can also download packages to support C/C++ IDE and PHP IDE.	68	{linux}	https://git.eclipse.org/c/	\N	13	approved	2026-01-17 17:04:28.895645	\N	\N	Open Source	\N	https://eclipse.org/ide/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
326	IntelliJ IDEA Community	Open source IDE by Jetbrains for JVM and Android development.	68	{linux}	https://github.com/JetBrains/intellij-community	\N	13	approved	2026-01-17 17:04:28.896208	\N	\N	Open Source	\N	https://www.jetbrains.com/idea/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
327	IntelliJ IDEA Ultimate	Commercial IDE by Jetbrains for web and enterprise JAVA development.	68	{linux}	https://www.jetbrains.com/idea/	\N	13	approved	2026-01-17 17:04:28.896758	\N	\N	Commercial	\N	https://www.jetbrains.com/idea/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
328	Webstorm	Powerful IDE for modern JavaScript development, made by JetBrains.	69	{linux}	https://www.jetbrains.com/webstorm/	\N	13	approved	2026-01-17 17:04:28.897353	\N	\N	Commercial	\N	https://www.jetbrains.com/webstorm/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
329	Fritzing	Fritzing is an open-source hardware initiative that makes electronics accessible as a creative material for anyone.	70	{linux}	https://github.com/fritzing/fritzing-app	\N	13	approved	2026-01-17 17:04:28.898244	\N	\N	Open Source	\N	https://fritzing.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
330	Sloeber IDE	Sloeber IDE. The Arduino IDE for Eclipse.	70	{linux}	https://github.com/Sloeber/arduino-eclipse-plugin	\N	13	approved	2026-01-17 17:04:28.89881	\N	\N	Open Source	\N	https://eclipse.baeyens.it/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
331	Aptana	Aptana Studio harnesses the flexibility of Eclipse and focuses it into a powerful web development engine.	71	{linux}	https://github.com/aptana/studio3	\N	13	approved	2026-01-17 17:04:28.899413	\N	\N	Open Source	\N	https://www.axway.com/en/aptana	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
332	KDevelop	It is a free, open source IDE, feature-full, plugin extensible IDE for C/C++ and other programming languages.	71	{linux}	https://invent.kde.org/kdevelop/kdevelop	\N	13	approved	2026-01-17 17:04:28.900232	\N	\N	Open Source	\N	https://www.kdevelop.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
333	MonoDevelop	Cross platform IDE for C#, F# and more.	71	{linux}	https://www.monodevelop.com/developers/	\N	13	approved	2026-01-17 17:04:28.900821	\N	\N	Open Source	\N	https://www.monodevelop.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
334	Netbeans	NetBeans IDE lets you quickly and easily develop Java desktop, mobile, and web applications, as well as HTML5 applications with HTML, JavaScript, and CSS.	71	{linux}	https://netbeans.apache.org/participate/index.html	\N	13	approved	2026-01-17 17:04:28.901477	\N	\N	Open Source	\N	https://netbeans.apache.org/download/index.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
335	Pants Build	Powerful build system for Python, JVM, Go and more, relies on static analysis instead of boilerplate to make adoption and use easy.	71	{linux}	https://pantsbuild.org/	\N	13	approved	2026-01-17 17:04:28.902049	\N	\N	Open Source	\N	https://www.pantsbuild.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
336	PHPStorm	Lightning-smart and powerful PHP IDE from Jetbrains.	72	{linux}	https://www.jetbrains.com/phpstorm/	\N	13	approved	2026-01-17 17:04:28.90261	\N	\N	Commercial	\N	https://www.jetbrains.com/phpstorm/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
337	PyCharm Community	Open source IDE by Jetbrains for pure Python development.	73	{linux}	https://github.com/JetBrains/intellij-community/tree/master/python	\N	13	approved	2026-01-17 17:04:28.903143	\N	\N	Open Source	\N	https://www.jetbrains.com/pycharm/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
338	PyCharm Professional	Commercial IDE by Jetbrains for scientific and web Python development.	73	{linux}	https://www.jetbrains.com/pycharm/	\N	13	approved	2026-01-17 17:04:28.903706	\N	\N	Commercial	\N	https://www.jetbrains.com/pycharm/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
339	RubyMine	Professional Ruby and Rails IDE.	74	{linux}	https://www.jetbrains.com/ruby/	\N	13	approved	2026-01-17 17:04:28.904279	\N	\N	Commercial	\N	https://www.jetbrains.com/ruby/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
340	RustRover	Professional Rust IDE by Jetbrains, free for non-commercial use.	75	{linux}	https://www.jetbrains.com/rust/	\N	13	approved	2026-01-17 17:04:28.904882	\N	\N	Commercial	\N	https://www.jetbrains.com/rust/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
341	Fish	A smart and user-friendly command-line shell.	76	{linux}	https://github.com/fish-shell/fish-shell	\N	13	approved	2026-01-17 17:04:28.905486	\N	\N	Open Source	\N	https://fishshell.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
342	Fisher	A plugin manager for fish shell.	76	{linux}	https://github.com/jorgebucaran/fisher	\N	13	approved	2026-01-17 17:04:28.906059	\N	\N	Open Source	\N	https://github.com/jorgebucaran/fisher	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
343	Ipython	Powerful Python shell.	76	{linux}	https://github.com/ipython/ipython	\N	13	approved	2026-01-17 17:04:28.906603	\N	\N	Open Source	\N	https://ipython.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
344	nushell	A new type of shell.	76	{linux}	https://github.com/nushell/nushell	\N	13	approved	2026-01-17 17:04:28.907351	\N	\N	Open Source	\N	https://www.nushell.sh/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
345	Oh-my-fish	Provides various packages and themes to extend the functionality of your fish shell.	76	{linux}	https://github.com/oh-my-fish/oh-my-fish	\N	13	approved	2026-01-17 17:04:28.908109	\N	\N	Open Source	\N	https://github.com/oh-my-fish/oh-my-fish	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
346	Oh-my-zsh	A delightful community-driven framework for managing your zsh configuration.	76	{linux}	https://github.com/robbyrussell/oh-my-zsh	\N	13	approved	2026-01-17 17:04:28.90914	\N	\N	Open Source	\N	https://ohmyz.sh/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
347	oilshell	Oil is a new Unix shell for Python and JavaScript users who avoid shell!.	76	{linux}	https://github.com/oilshell/oil	\N	13	approved	2026-01-17 17:04:28.909846	\N	\N	Open Source	\N	https://github.com/oilshell/oil	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
348	Shellcheck	ShellCheck, a static analysis tool for shell scripts.	76	{linux}	https://github.com/koalaman/shellcheck	\N	13	approved	2026-01-17 17:04:28.910531	\N	\N	Open Source	\N	https://www.shellcheck.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
349	Zim	Modular, customizable, and blazing fast Zsh framework.	76	{linux}	https://github.com/zimfw/zimfw	\N	13	approved	2026-01-17 17:04:28.911171	\N	\N	Open Source	\N	https://zimfw.sh/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
350	Zsh	A powerful command line shell.	76	{linux}	https://sourceforge.net/p/zsh/code/ci/master/tree/	\N	13	approved	2026-01-17 17:04:28.911753	\N	\N	Open Source	\N	https://www.zsh.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
351	bzip3	A versatile statistical compressor with better compression ratio than standard Linux tools (gzip, bzip2, etc...).	77	{linux}	https://github.com/kspalaiologos/bzip3	\N	13	approved	2026-01-17 17:04:28.912324	\N	\N	Open Source	\N	https://github.com/kspalaiologos/bzip3	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
352	Collision	Collision comes with a simple & clean UI, allowing anyone, from any age and experience group, to generate, compare and verify MD5, SHA-256, SHA-512 and SHA-1 hashes.	77	{linux}	https://github.com/GeopJr/Collision	\N	13	approved	2026-01-17 17:04:28.91287	\N	\N	Open Source	\N	https://collision.geopjr.dev/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
353	Cscope	Cscope is a developer's tool for browsing source code. Although cmd-line application, it is nativelly integrated with Vim editor. It allows searching code for symbols, definitions, functions (called/calling), regex, files.	77	{linux}	https://sourceforge.net/projects/cscope/	\N	13	approved	2026-01-17 17:04:28.913426	\N	\N	Open Source	\N	https://cscope.sourceforge.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
354	Curtail	Curtail is an useful image compressor, supporting PNG, JPEG and WEBP file types.	77	{linux}	https://github.com/Huluti/Curtail	\N	13	approved	2026-01-17 17:04:28.91401	\N	\N	Open Source	\N	https://apps.gnome.org/app/com.github.huluti.Curtail/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
355	Czkawka	Multi functional app to find duplicates, empty folders, similar images etc.	77	{linux}	https://github.com/qarmin/czkawka	\N	13	approved	2026-01-17 17:04:28.91456	\N	\N	Open Source	\N	https://github.com/qarmin/czkawka	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
356	Devilbox	The devilbox is a modern and highly customisable dockerized PHP stack supporting full LAMP and MEAN and running on all major platforms. The main goal is to easily switch and combine any version required for local development.	77	{linux}	https://github.com/cytopia/devilbox	\N	13	approved	2026-01-17 17:04:28.915136	\N	\N	Open Source	\N	https://github.com/cytopia/devilbox	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
357	Dialect	A translation app for GNOME.	77	{linux}	https://github.com/dialect-app/dialect/	\N	13	approved	2026-01-17 17:04:28.915674	\N	\N	Open Source	\N	https://apps.gnome.org/app/app.drey.Dialect/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
358	Diffuse	Diffuse is a graphical tool for comparing and merging text files. It can retrieve files for comparison from Bazaar, CVS, Darcs, Git, Mercurial, Monotone, RCS, Subversion, and SVK repositories.	77	{linux}	https://sourceforge.net/projects/diffuse/files/?source=navbar	\N	13	approved	2026-01-17 17:04:28.916241	\N	\N	Open Source	\N	https://diffuse.sourceforge.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
359	Docker	Docker is a set of platform as a service products that use OS-level virtualization to deliver software in packages called containers.	77	{linux}	https://github.com/docker/desktop-linux	\N	13	approved	2026-01-17 17:04:28.916778	\N	\N	Open Source	\N	https://docs.docker.com/desktop/linux/install/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
360	Flox	Flox is a virtual environment and package manager all-in-one.	77	{linux}	https://github.com/flox/flox	\N	13	approved	2026-01-17 17:04:28.917755	\N	\N	Open Source	\N	https://flox.dev	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
361	Fossil	Self-contained, distributed software configuration management system with integrated bug-tracking, wiki, technotes and web interface.	77	{linux}	https://www.fossil-scm.org/index.html/dir?ci=tip	\N	13	approved	2026-01-17 17:04:28.918343	\N	\N	Open Source	\N	https://www.fossil-scm.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
362	Gaphor	A simple and fast software and systems modeling tool.	77	{linux}	https://github.com/gaphor/gaphor	\N	13	approved	2026-01-17 17:04:28.918897	\N	\N	Open Source	\N	https://gaphor.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
363	Genymotion	Genymotion is a fast third-party emulator that can be used instead of the default Android emulator.	77	{linux}	https://www.genymotion.com/desktop/	\N	13	approved	2026-01-17 17:04:28.919446	\N	\N	Commercial	\N	https://www.genymotion.com/desktop/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
364	Glade	GTK+ User Interface Builder.	77	{linux}	https://gitlab.gnome.org/Archive/glade	\N	13	approved	2026-01-17 17:04:28.920123	\N	\N	Open Source	\N	https://gitlab.gnome.org/Archive/glade	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
365	Heaptrack	A heap memory profiler for Linux.	77	{linux}	https://phabricator.kde.org/source/heaptrack/repository/master/	\N	13	approved	2026-01-17 17:04:28.920775	\N	\N	Open Source	\N	https://phabricator.kde.org/source/heaptrack/repository/master/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
366	hors	Instant coding answers via the command line.	77	{linux}	https://github.com/WindSoilder/hors	\N	13	approved	2026-01-17 17:04:28.921424	\N	\N	Open Source	\N	https://github.com/WindSoilder/hors	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
368	Intel® VTune™ Profiler	GUI and Commandline tool from Intel for finding and fixing performance bottlenecks in software written in C/C++, C#, Java, and more.	77	{linux}	https://www.intel.com/content/www/us/en/developer/tools/oneapi/vtune-profiler.html	\N	13	approved	2026-01-17 17:04:28.922678	\N	\N	Freeware	\N	https://www.intel.com/content/www/us/en/developer/tools/oneapi/vtune-profiler.html	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
369	lazydocker	A simple terminal UI for both docker and docker-compose, written in Go with the gocui library.	77	{linux}	https://github.com/jesseduffield/lazydocker	\N	13	approved	2026-01-17 17:04:28.923547	\N	\N	Open Source	\N	https://github.com/jesseduffield/lazydocker	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
370	Meld	Meld is a visual diff and merge tool that helps you compare files, directories, and version controlled projects.	77	{linux}	https://gitlab.gnome.org/GNOME/meld/tree/main	\N	13	approved	2026-01-17 17:04:28.92425	\N	\N	Open Source	\N	https://meldmerge.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
371	Metadata Cleaner	This tool allows you to view metadata in your files and to get rid of it, as much as possible.	77	{linux}	https://gitlab.com/rmnvgr/metadata-cleaner/	\N	13	approved	2026-01-17 17:04:28.924808	\N	\N	Open Source	\N	https://metadatacleaner.romainvigier.fr/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
372	Mockitt	Mockitt is an easy-to-use prototyping tool.	77	{linux}	https://mockitt.com/home.html	\N	13	approved	2026-01-17 17:04:28.925374	\N	\N	Freeware	\N	https://mockitt.com/home.html	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
373	Okteta	Hex Editor for viewing and editing the raw data of files.	77	{linux}	https://invent.kde.org/utilities/okteta	\N	13	approved	2026-01-17 17:04:28.926197	\N	\N	Open Source	\N	https://apps.kde.org/okteta/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
374	Pencil	An open-source GUI prototyping tool that's available for ALL platforms.	77	{linux}	https://github.com/evolus/pencil	\N	13	approved	2026-01-17 17:04:28.926894	\N	\N	Open Source	\N	https://pencil.evolus.vn/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
375	Pick	Simple color picker.	77	{linux}	https://github.com/stuartlangridge/ColourPicker	\N	13	approved	2026-01-17 17:04:28.9276	\N	\N	Open Source	\N	https://kryogenix.org/code/pick/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
376	Podman	Podman: A tool for managing OCI containers and pods.	77	{linux}	https://github.com/containers/podman	\N	13	approved	2026-01-17 17:04:28.928251	\N	\N	Open Source	\N	https://podman.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
378	Rabbit VCS	RabbitVCS is a set of graphical tools written to provide simple and straightforward access to the version control systems you use.	77	{linux}	https://github.com/rabbitvcs/rabbitvcs	\N	13	approved	2026-01-17 17:04:28.929672	\N	\N	Open Source	\N	http://rabbitvcs.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
379	Sourcetrail	Sourcetrail is a free and open-source cross-platform source explorer that helps you get productive on unfamiliar source code.	77	{linux}	https://github.com/CoatiSoftware/Sourcetrail	\N	13	approved	2026-01-17 17:04:28.930268	\N	\N	Open Source	\N	https://www.sourcetrail.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
380	StarUML	A sophisticated software modeler.	77	{linux}	https://staruml.io/	\N	13	approved	2026-01-17 17:04:28.930817	\N	\N	Commercial	\N	https://staruml.io/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
381	Uncrustify	Source Code Beautifier for C/C++, C#, ObjectiveC, D, Java, Pawn and VALA. See UniversalIndentGUI below.	77	{linux}	https://github.com/uncrustify/uncrustify	\N	13	approved	2026-01-17 17:04:28.93134	\N	\N	Open Source	\N	https://uncrustify.sourceforge.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
382	UniversalIndentGUI	UniversalIndentGUI offers a live preview for setting the parameters of nearly any indenter.	77	{linux}	https://sourceforge.net/projects/universalindent/files/uigui/	\N	13	approved	2026-01-17 17:04:28.931962	\N	\N	Open Source	\N	https://universalindent.sourceforge.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
383	Valgrind	Valgrind is a GPL'd system for debugging and profiling Linux programs.	77	{linux}	https://sourceware.org/git/?p=valgrind.git	\N	13	approved	2026-01-17 17:04:28.932503	\N	\N	Open Source	\N	https://valgrind.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
384	GitBreeze	GitBreeze is the free for personal use effortless Git GUI for Windows, Mac, & Linux.	77	{linux}	https://gitbreeze.dev/	\N	13	approved	2026-01-17 17:04:28.93303	\N	\N	Commercial	\N	https://gitbreeze.dev/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
385	Wdiff	The GNU wdiff program is a front end to diff for comparing files on a word per word basis. It collects the diff output and uses it to produce a nicer display of word differences between the original files.	77	{linux}	https://www.gnu.org/software/wdiff/devguide	\N	13	approved	2026-01-17 17:04:28.933558	\N	\N	Open Source	\N	https://www.gnu.org/software/wdiff/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
386	Workbench	Workbench goal is to let you experiment with GNOME technologies, no matter if tinkering for the first time or building and testing a custom GTK widget.	77	{linux}	https://github.com/sonnyp/Workbench	\N	13	approved	2026-01-17 17:04:28.934207	\N	\N	Open Source	\N	https://apps.gnome.org/app/re.sonny.Workbench/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
387	Zeal	Zeal is an offline documentation browser for software developers.	77	{linux}	https://github.com/zealdocs/zeal	\N	13	approved	2026-01-17 17:04:28.935137	\N	\N	Open Source	\N	https://zealdocs.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
388	Arianna	An eBook reader and library management applicatiion for `.epub` files from KDE.	27	{linux}	https://invent.kde.org/graphics/arianna	\N	13	approved	2026-01-17 17:04:28.935726	\N	\N	Open Source	\N	https://apps.kde.org/arianna/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
389	Bookworm	A simple, focused eBook reader.	27	{linux}	https://github.com/babluboy/bookworm	\N	13	approved	2026-01-17 17:04:28.936281	\N	\N	Open Source	\N	https://babluboy.github.io/bookworm/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
390	Buka	A program for EBook Management.	27	{linux}	https://github.com/oguzhaninan/Buka	\N	13	approved	2026-01-17 17:04:28.936818	\N	\N	Open Source	\N	https://github.com/oguzhaninan/Buka/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
391	Calibre	Incredibly ugly but powerful software for ebook management and conversion.	27	{linux}	https://github.com/kovidgoyal/calibre	\N	13	approved	2026-01-17 17:04:28.937413	\N	\N	Open Source	\N	https://calibre-ebook.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1637	pull request	on data/software.yaml	183	{Linux,Mac,Windows}	https://help.github.com/articles/creating-a-pull-request/	\N	1	approved	2026-01-18 09:29:54.620956	\N	\N	Open Source	\N	\N	\N	software
392	Calibre-web	Calibre Web is a web app providing a clean interface for browsing, reading and downloading eBooks using an existing Calibre database.	27	{linux}	https://github.com/janeczku/calibre-web	\N	13	approved	2026-01-17 17:04:28.937952	\N	\N	Open Source	\N	https://github.com/janeczku/calibre-web	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
393	Easy Ebook Viewer	Modern GTK Python Ebook Reader app to easily read epub files.	27	{linux}	https://github.com/michaldaniel/Ebook-Viewer	\N	13	approved	2026-01-17 17:04:28.938558	\N	\N	Open Source	\N	https://github.com/michaldaniel/Ebook-Viewer	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
394	Evince	Evince is a document viewer for multiple document formats. The goal of evince is to replace the multiple document viewers that exist on the GNOME Desktop with a single simple application.	27	{linux}	https://wiki.gnome.org/Apps/Evince/GettingEvince	\N	13	approved	2026-01-17 17:04:28.939097	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Evince	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
395	FBReader	One of the most popular eReader apps.	27	{linux}	https://github.com/geometer/FBReader	\N	13	approved	2026-01-17 17:04:28.939681	\N	\N	Open Source	\N	https://fbreader.org/content/fbreader-beta-linux-desktop	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
396	Foliate	Foliate is a simple and modern GTK eBook viewer.	27	{linux}	https://github.com/johnfactotum/foliate	\N	13	approved	2026-01-17 17:04:28.940288	\N	\N	Open Source	\N	https://johnfactotum.github.io/foliate/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
397	Foxit	Foxit Reader 8.0—Award-winning PDF Reader.	27	{linux}	https://www.foxit.com/pdf-reader/	\N	13	approved	2026-01-17 17:04:28.940943	\N	\N	Freeware	\N	https://www.foxit.com/pdf-reader/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
398	GNOME Books	GNOME Books is application for listing, searching and reading eBooks.	27	{linux}	https://github.com/martahilmar/gnome-books	\N	13	approved	2026-01-17 17:04:28.941502	\N	\N	Open Source	\N	https://github.com/martahilmar/gnome-books	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
399	K2pdfopt	K2pdfopt optimizes PDF/DJVU files for mobile e-readers (e.g. the Kindle) and smartphones.	27	{linux}	https://www.willus.com/k2pdfopt/src	\N	13	approved	2026-01-17 17:04:28.942058	\N	\N	Open Source	\N	https://www.willus.com/k2pdfopt	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
400	Komikku	Manga reader with support for online and offline reading, automatic downloads, locally stored manga formats (CBZ and CBR formats), and collection organization features.	27	{linux}	https://codeberg.org/valos/Komikku	\N	13	approved	2026-01-17 17:04:28.942613	\N	\N	Open Source	\N	https://apps.gnome.org/Komikku/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
401	Lucidor	Lucidor is a computer program for reading and handling e-books. Lucidor supports e-books in the EPUB file format, and catalogs in the OPDS format.	27	{linux}	https://lucidor.org/lucidor/	\N	13	approved	2026-01-17 17:04:28.943381	\N	\N	Freeware	\N	https://lucidor.org/lucidor/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
402	MasterPDF editor	Master PDF Editor a convenient and smart PDF editor for Linux.	27	{linux}	https://code-industry.net/free-pdf-editor/	\N	13	approved	2026-01-17 17:04:28.943932	\N	\N	Freeware	\N	https://code-industry.net/free-pdf-editor/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
403	Mcomix	GTK+ comic book viewer.	27	{linux}	https://sourceforge.net/p/mcomix/git/ci/master/tree/	\N	13	approved	2026-01-17 17:04:28.944524	\N	\N	Open Source	\N	https://sourceforge.net/projects/mcomix/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
404	MuPDF	A lightweight PDF and XPS viewer.	27	{linux}	https://git.ghostscript.com/?p=mupdf.git;a=summary	\N	13	approved	2026-01-17 17:04:28.945107	\N	\N	Open Source	\N	https://mupdf.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
405	Okular	Okular is a universal document viewer based developed by KDE. Okular works on multiple platforms, including but not limited to Linux, Windows, Mac OS X, BSD, etc.	27	{linux}	https://github.com/KDE/okular	\N	13	approved	2026-01-17 17:04:28.945632	\N	\N	Open Source	\N	https://okular.kde.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
406	PDF Arranger	PDF Arranger is a small application, which helps the user to merge or split pdf documents and rotate, crop and rearrange their pages using an interactive and intuitive graphical interface.	27	{linux}	https://github.com/pdfarranger/pdfarranger	\N	13	approved	2026-01-17 17:04:28.946228	\N	\N	Open Source	\N	https://github.com/pdfarranger/pdfarranger	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
407	PDFsam	A desktop application to split, extract pages, rotate, mix and merge PDF files.	27	{linux}	https://github.com/torakiki/pdfsam	\N	13	approved	2026-01-17 17:04:28.946873	\N	\N	Open Source	\N	https://www.pdfsam.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
408	PDF Slicer	PDF Slicer is a simple application to extract, merge, rotate and reorder pages of PDF documents.	27	{linux}	https://github.com/junrrein/pdfslicer	\N	13	approved	2026-01-17 17:04:28.94876	\N	\N	Open Source	\N	https://junrrein.github.io/pdfslicer/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
409	PDF Studio	An easy to use, full-featured PDF editing software that is a reliable alternative to Adobe Acrobat and provides all PDF functions needed at a fraction of the cost. PDF Studio maintains full compatibility with the PDF Standard.	27	{linux}	https://www.qoppa.com/pdfstudio/	\N	13	approved	2026-01-17 17:04:28.949338	\N	\N	Commercial	\N	https://www.qoppa.com/pdfstudio/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
410	qpdfview	qpdfview is a tabbed document viewer.	27	{linux}	https://launchpad.net/qpdfview	\N	13	approved	2026-01-17 17:04:28.949917	\N	\N	Open Source	\N	https://launchpad.net/qpdfview	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
411	Sigil	Sigil is a multi-platform EPUB ebook editor.	27	{linux}	https://github.com/Sigil-Ebook/Sigil	\N	13	approved	2026-01-17 17:04:28.950483	\N	\N	Open Source	\N	https://sigil-ebook.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
412	Zathura	Zathura is a highly customizable and functional document viewer.	27	{linux}	https://github.com/pwmt/zathura	\N	13	approved	2026-01-17 17:04:28.951055	\N	\N	Open Source	\N	https://pwmt.org/projects/zathura/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
413	KiCAD	An EDA suite for schematic and circuit board design.	28	{linux}	https://github.com/KiCad	\N	13	approved	2026-01-17 17:04:28.951996	\N	\N	Open Source	\N	https://www.kicad.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1209	lsd	The next gen ls command.	44	{linux}	https://github.com/Peltoche/lsd	\N	13	approved	2026-01-17 17:04:29.54613	\N	\N	Open Source	\N	https://github.com/Peltoche/lsd	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
414	Logisim Evolution	Graphical tool for designing and simulating digital logic curcuits. Successor of LogiSim.	28	{linux}	https://github.com/logisim-evolution/logisim-evolution	\N	13	approved	2026-01-17 17:04:28.952555	\N	\N	Open Source	\N	https://github.com/logisim-evolution/logisim-evolution	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
415	Artha	Artha is a free cross-platform English thesaurus that works completely off-line and is based on WordNet.	29	{linux}	https://sourceforge.net/projects/artha/	\N	13	approved	2026-01-17 17:04:28.953441	\N	\N	Open Source	\N	https://sourceforge.net/projects/artha/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
416	BibleTime	BibleTime is a Bible study application based on the Sword library and Qt toolkit.	29	{linux}	https://github.com/bibletime/bibletime	\N	13	approved	2026-01-17 17:04:28.954002	\N	\N	Open Source	\N	http://bibletime.info/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
417	Celestia	The free space simulation that lets you explore our universe in three dimensions.	29	{linux}	https://github.com/CelestiaProject/Celestia	\N	13	approved	2026-01-17 17:04:28.954604	\N	\N	Open Source	\N	https://github.com/CelestiaProject/Celestia	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
418	Chemtool	Chemtool is a small program for drawing chemical structures on Linux.	29	{linux}	https://github.com/opp11/chemtool/	\N	13	approved	2026-01-17 17:04:28.955153	\N	\N	Open Source	\N	http://ruby.chemie.uni-freiburg.de/~martin/chemtool/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
419	Colobot	Colobot: Gold Edition is a real-time strategy game, where you can program your units (bots) in a language called CBOT, which is similar to C++ and Java.	29	{linux}	https://github.com/colobot	\N	13	approved	2026-01-17 17:04:28.955779	\N	\N	Open Source	\N	https://colobot.info/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
420	Epoptes	An open source computer lab management and monitoring tool.	29	{linux}	https://code.launchpad.net/epoptes	\N	13	approved	2026-01-17 17:04:28.956336	\N	\N	Open Source	\N	https://epoptes.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
421	GAP	A computer algebra system for computational discrete algebra with particular emphasis on computational group theory.	29	{linux}	https://github.com/gap-system/gap	\N	13	approved	2026-01-17 17:04:28.956919	\N	\N	Open Source	\N	https://www.gap-system.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
422	Gcompris	GCompris is a high quality educational software suite comprising of numerous activities for children aged 2 to 10.	29	{linux}	https://gcompris.net/wiki/Developer%27s_corner	\N	13	approved	2026-01-17 17:04:28.957515	\N	\N	Open Source	\N	https://gcompris.net/index-en.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
423	Geogebra	The graphing calculator for functions, geometry, algebra, calculus, statistics and 3D mathematics.	29	{linux}	https://github.com/geogebra/geogebra	\N	13	approved	2026-01-17 17:04:28.958042	\N	\N	Open Source	\N	https://www.geogebra.org/download	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
424	GNOME Dictionary	A powerful dictionary for GNOME.	29	{linux}	https://wiki.gnome.org/Apps/Dictionary	\N	13	approved	2026-01-17 17:04:28.95864	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Dictionary	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
425	GNU Octave	GNU Octave is a scientific programming language, primarily intended for numerical computations, that is mostly compatible with MATLAB.	29	{linux}	https://hg.savannah.gnu.org/hgweb/octave	\N	13	approved	2026-01-17 17:04:28.959238	\N	\N	Open Source	\N	https://octave.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
426	GNU Typist	ncurses-based free-software typing instructor.	29	{linux}	https://git.savannah.gnu.org/cgit/gtypist.git	\N	13	approved	2026-01-17 17:04:28.960138	\N	\N	Open Source	\N	https://www.gnu.org/software/gtypist/index.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
427	GNUKhata	Open source accounting software.	29	{linux}	https://gitlab.com/gnukhata	\N	13	approved	2026-01-17 17:04:28.960832	\N	\N	Open Source	\N	https://gnukhata.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
428	Google Earth	Google Earth is a virtual globe, map and geographical information program.	29	{linux}	https://www.google.com/earth/about/versions/	\N	13	approved	2026-01-17 17:04:28.961574	\N	\N	Freeware	\N	https://www.google.com/earth/about/versions/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
429	GPeriodic	GPeriodic is a periodic table application for Linux.	29	{linux}	http://gperiodic.seul.org/cvs/	\N	13	approved	2026-01-17 17:04:28.962289	\N	\N	Open Source	\N	http://gperiodic.seul.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
430	KDE Edu Suite	Free Educational Software based on the KDE technologies.	29	{linux}	https://apps.kde.org/education/	\N	13	approved	2026-01-17 17:04:28.963425	\N	\N	Freeware	\N	https://apps.kde.org/education/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
431	Klavaro	A touch typing tutor very flexible, supporting customizable keyboard layouts. You can edit and save new or unknown keyboard layouts, as the basic course was designed to not depend on specific ones. Also, there are some charts about the learning process.	29	{linux}	https://sourceforge.net/projects/klavaro	\N	13	approved	2026-01-17 17:04:28.964003	\N	\N	Open Source	\N	https://klavaro.sourceforge.io/en/index.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
432	Ktouch	KTouch is a program to learn and practice touch typing.	29	{linux}	https://invent.kde.org/education/ktouch	\N	13	approved	2026-01-17 17:04:28.96456	\N	\N	Open Source	\N	https://apps.kde.org/ktouch/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
433	MAPLE	Maple is math software that combines the world's most powerful math engine with an interface that makes it extremely easy to analyze, explore, visualize, and solve mathematical problems.	29	{linux}	https://www.maplesoft.com/products/maple/	\N	13	approved	2026-01-17 17:04:28.965114	\N	\N	Commercial	\N	https://www.maplesoft.com/products/maple/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
434	MapTiler	MapTiler generates zoomable raster maps from images in user-defined coordinate system.	29	{linux}	https://www.maptiler.com/	\N	13	approved	2026-01-17 17:04:28.965671	\N	\N	Commercial	\N	https://www.maptiler.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
435	Marble	Marble is a virtual globe and world atlas — your swiss army knife for maps.	29	{linux}	https://github.com/KDE/marble	\N	13	approved	2026-01-17 17:04:28.966234	\N	\N	Open Source	\N	https://marble.kde.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1210	lshw	Hardware Lister for Linux.	44	{linux}	https://ezix.org/src/pkg/lshw	\N	13	approved	2026-01-17 17:04:29.546772	\N	\N	Open Source	\N	https://ezix.org/project/wiki/HardwareLiSter	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
436	MATLAB	The MATLAB platform is optimized for solving engineering and scientific problems. MATLAB helps you take your ideas beyond the desktop. You can run your analyses on larger data sets and scale up to clusters and clouds.	29	{linux}	https://www.mathworks.com/products/matlab/	\N	13	approved	2026-01-17 17:04:28.966781	\N	\N	Commercial	\N	https://www.mathworks.com/products/matlab/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
437	Mathematica	The world's definitive system for modern technical computing.	29	{linux}	https://www.wolfram.com/mathematica/	\N	13	approved	2026-01-17 17:04:28.967427	\N	\N	Commercial	\N	https://www.wolfram.com/mathematica/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
438	Maxima	Maxima is a system for the manipulation of symbolic and numerical expressions, including differentiation, integration, Taylor series, Laplace transforms, ordinary differential equations, systems of linear equations, and much more.	29	{linux}	https://sourceforge.net/projects/maxima/	\N	13	approved	2026-01-17 17:04:28.968002	\N	\N	Open Source	\N	https://maxima.sourceforge.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
439	Mendeley	Mendeley is a program for managing and sharing research papers, finding research data and collaborating online.	29	{linux}	https://www.mendeley.com/	\N	13	approved	2026-01-17 17:04:28.968598	\N	\N	Freeware	\N	https://www.mendeley.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
440	OpenEuclid	OpenEuclide is a 2D geometry software: figures are defined dynamically by describing formal geometrical constraints.	29	{linux}	https://sourceforge.net/projects/openeuclide/	\N	13	approved	2026-01-17 17:04:28.969833	\N	\N	Open Source	\N	http://coulon.publi.free.fr/openeuclide/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
441	OpenMapTiles	OpenMapTiles is a set of open-source tools for self-hosting of OpenStreetMaps in more than 50 languages. It provides both raster as well as vector tiles, WMS, WMTS, support for JavaScript viewers and mobile SDK.	29	{linux}	https://github.com/openmaptiles	\N	13	approved	2026-01-17 17:04:28.971121	\N	\N	Open Source	\N	https://openmaptiles.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
442	OpenSIS	School Management Software that Increases Student Achievements & Teacher Performances.	29	{linux}	https://opensis.sourceforge.net/	\N	13	approved	2026-01-17 17:04:28.972671	\N	\N	Open Source	\N	https://www.opensis.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
443	PARI/GP	A computer algebra system for fast computations in number theory.	29	{linux}	https://pari.math.u-bordeaux.fr/cgi-bin/gitweb.cgi?p=pari.git;a=summary	\N	13	approved	2026-01-17 17:04:28.973546	\N	\N	Open Source	\N	https://pari.math.u-bordeaux.fr/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
444	SageMath	A mathematical software with features covering many aspects of mathematics, including algebra, combinatorics, numerical mathematics, number theory, and calculus.	29	{linux}	https://github.com/sagemath/sage	\N	13	approved	2026-01-17 17:04:28.974238	\N	\N	Open Source	\N	https://www.sagemath.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
445	Scipy	SciPy is a Python-based ecosystem of open-source software for mathematics, science, and engineering.	29	{linux}	https://github.com/scipy/scipy	\N	13	approved	2026-01-17 17:04:28.97488	\N	\N	Open Source	\N	https://scipy.org/install.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
446	Scratch	With Scratch, you can program your own interactive stories, games, and animations — and share your creations with others in the online community.	29	{linux}	https://github.com/LLK/scratch-flash	\N	13	approved	2026-01-17 17:04:28.975492	\N	\N	Open Source	\N	https://scratch.mit.edu/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
447	Stellarium	Stellarium is a free open source planetarium for your computer.	29	{linux}	https://sourceforge.net/projects/stellarium/	\N	13	approved	2026-01-17 17:04:28.976312	\N	\N	Open Source	\N	https://www.stellarium.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
448	Sugar Desktop Environment	Sugar is a learning platform that reinvents how computers are used for education. Collaboration, reflection, and discovery are integrated directly into the user interface.	29	{linux}	https://github.com/sugarlabs/sugar	\N	13	approved	2026-01-17 17:04:28.977042	\N	\N	Open Source	\N	https://sugarlabs.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
449	TuxType	An educational typing tutorial game starring Tux.	29	{linux}	https://sourceforge.net/projects/tuxtype/files/tuxtype-source/	\N	13	approved	2026-01-17 17:04:28.977644	\N	\N	Open Source	\N	https://www.tux4kids.com/tuxtyping.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
450	UGENE	UGENE is free open-source cross-platform integrated GUI-based bioinformatics software.	29	{linux}	https://github.com/ugeneunipro/ugene	\N	13	approved	2026-01-17 17:04:28.978262	\N	\N	Open Source	\N	https://ugene.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
451	Veyon	Veyon is a computer management software for classrooms, it allows a teacher to control student computers and guide students over a computer network.	29	{linux}	https://github.com/veyon/veyon	\N	13	approved	2026-01-17 17:04:28.978862	\N	\N	Open Source	\N	https://veyon.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
452	aerc	aerc is an efficient, extensible email client that runs in the terminal. It features special support for git email workflows, reviewing patches, and processing HTML emails in a terminal-based browser.	30	{linux}	https://git.sr.ht/~sircmpwn/aerc	\N	13	approved	2026-01-17 17:04:28.979447	\N	\N	Open Source	\N	https://aerc-mail.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
453	Claws	Claws is an email client and news reader, featuring sophisticated interface, easy configuration, intuitive operation, abundant features and plugins, robustness and stability.	30	{linux}	https://git.claws-mail.org/	\N	13	approved	2026-01-17 17:04:28.980046	\N	\N	Open Source	\N	https://www.claws-mail.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
454	ElectronMail	ElectronMail is an Electron-based unofficial desktop client for ProtonMail and Tutanota end-to-end encrypted email providers.	30	{linux}	https://github.com/vladimiry/ElectronMail	\N	13	approved	2026-01-17 17:04:28.980638	\N	\N	Open Source	\N	https://github.com/vladimiry/ElectronMail	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
455	Evolution	Evolution is a personal information management application that provides integrated mail, calendaring and address book functionality.	30	{linux}	https://gitlab.gnome.org/GNOME/evolution/	\N	13	approved	2026-01-17 17:04:28.981209	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Evolution/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1638	Akira	Linux application for UI and UX design	185	{Linux,Mac,Windows}	https://www.patreon.com/akiraux	\N	1	approved	2026-01-18 09:29:54.643891	\N	\N	Open Source	\N	\N	\N	software
456	Geary	Geary is an email application built for GNOME 3. It allows you to read and send email with a simple, modern interface.	30	{linux}	https://gitlab.gnome.org/GNOME/geary/	\N	13	approved	2026-01-17 17:04:28.981806	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Geary	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
457	Hiri	Hiri is a business focused desktop e-mail client for sending and receiving e-mails, managing calendars, contacts, and tasks.	30	{linux}	https://www.hiri.com/	\N	13	approved	2026-01-17 17:04:28.982456	\N	\N	Commercial	\N	https://www.hiri.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
458	KMail	KMail is the email component of Kontact, the integrated personal information manager from KDE.	30	{linux}	https://invent.kde.org/pim/kmail	\N	13	approved	2026-01-17 17:04:28.983011	\N	\N	Open Source	\N	https://apps.kde.org/kmail2/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
459	Mailnag	Mailnag is a daemon program that checks POP3 and IMAP servers for new mail.	30	{linux}	https://github.com/pulb/mailnag	\N	13	approved	2026-01-17 17:04:28.983555	\N	\N	Open Source	\N	https://launchpad.net/~pulb/+archive/ubuntu/mailnag	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
460	Mailspring	A beautiful, fast and maintained fork of Nylas Mail ([dead](https://github.com/nylas/nylas-mail)) by one of the original authors.	30	{linux}	https://getmailspring.com/	\N	13	approved	2026-01-17 17:04:28.984277	\N	\N	Freeware	\N	https://getmailspring.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
461	Sylpheed	Lightweight and user-friendly e-mail client.	30	{linux}	https://sylpheed.sraoss.jp/en/download.html#stable	\N	13	approved	2026-01-17 17:04:28.984871	\N	\N	Open Source	\N	https://sylpheed.sraoss.jp/en/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
462	Trojita	A super fast desktop email client for Linux.	30	{linux}	https://github.com/KDE/trojita	\N	13	approved	2026-01-17 17:04:28.985672	\N	\N	Open Source	\N	https://apps.kde.org/trojita/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
463	Vmail	Vim-like Gmail client.	30	{linux}	https://github.com/danchoi/vmail	\N	13	approved	2026-01-17 17:04:28.986217	\N	\N	Open Source	\N	https://danielchoi.com/software/vmail.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
464	7Zip	A very capable program that can unzip nearly any file archiving format.	31	{linux}	https://sourceforge.net/projects/sevenzip/	\N	13	approved	2026-01-17 17:04:28.986744	\N	\N	Open Source	\N	https://www.7-zip.org/download.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
465	Caja	Is the default file manager for the MATE desktop environment, it is very fast and simple to use.	31	{linux}	https://github.com/mate-desktop/caja	\N	13	approved	2026-01-17 17:04:28.987267	\N	\N	Open Source	\N	https://mate-desktop.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
466	CliFM	The shell-like, command line terminal file manager: simple, fast, extensible, and lightweight as hell.	31	{linux}	https://github.com/leo-arch/clifm	\N	13	approved	2026-01-17 17:04:28.988022	\N	\N	Open Source	\N	https://github.com/leo-arch/clifm	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
467	Dolphin	Dolphin is the default file manager of the KDE desktop environment featuring usability as well as functionality.	31	{linux}	https://invent.kde.org/system/dolphin	\N	13	approved	2026-01-17 17:04:28.988692	\N	\N	Open Source	\N	https://apps.kde.org/dolphin/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
468	Double Commander	Double Commander is a cross platform open source file manager with two panels side by side. It is inspired by Total Commander and features some new ideas.	31	{linux}	https://sourceforge.net/projects/doublecmd/	\N	13	approved	2026-01-17 17:04:28.989298	\N	\N	Open Source	\N	https://doublecmd.sourceforge.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
469	Konqueror	Konqueror is KDE's Webbrowser and swiss-army-knife for any kind of file-management and file previewing.	31	{linux}	https://invent.kde.org/network/konqueror	\N	13	approved	2026-01-17 17:04:28.989842	\N	\N	Open Source	\N	https://apps.kde.org/konqueror/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
470	Krusader	Krusader is an advanced twin panel (commander style) file manager for KDE and other desktops in the \\*nix world, similar to Midnight or Total Commander.	31	{linux}	https://invent.kde.org/utilities/krusader	\N	13	approved	2026-01-17 17:04:28.990418	\N	\N	Open Source	\N	https://krusader.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
471	lf	lf as in "list files" is a modern and minimal terminal file manager with VI key bindings inspired by ranger.	31	{linux}	https://github.com/gokcehan/lf	\N	13	approved	2026-01-17 17:04:28.990947	\N	\N	Open Source	\N	https://github.com/gokcehan/lf	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
472	Midnight Commander	A feature rich full-screen file manager that allows you to copy, move and delete files and whole directory trees.	31	{linux}	https://github.com/MidnightCommander/mc	\N	13	approved	2026-01-17 17:04:28.99155	\N	\N	Open Source	\N	https://www.midnight-commander.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
473	Nautilus	Nautilus (Files) is a file manager designed to fit the GNOME desktop design and behaviour, giving the user a simple way to navigate and manage its files.	31	{linux}	https://github.com/GNOME/nautilus	\N	13	approved	2026-01-17 17:04:28.99213	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Files	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
474	Nemo	Nemo is the file manager for the Cinnamon desktop environment.	31	{linux}	https://github.com/linuxmint/nemo	\N	13	approved	2026-01-17 17:04:28.992662	\N	\N	Open Source	\N	https://github.com/linuxmint/nemo	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
475	nnn	A very lightweight and fast terminal file browser with excellent desktop integration.	31	{linux}	https://github.com/jarun/nnn	\N	13	approved	2026-01-17 17:04:28.993169	\N	\N	Open Source	\N	https://github.com/jarun/nnn	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
476	QDirStat	Qt-based directory statistics - KDirStat without any KDE, from the original KDirStat author.	31	{linux}	https://github.com/shundhammer/qdirstat	\N	13	approved	2026-01-17 17:04:28.993713	\N	\N	Open Source	\N	https://github.com/shundhammer/qdirstat	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
477	Ranger	Ranger is a console file manager with VI key bindings.	31	{linux}	https://github.com/ranger/ranger	\N	13	approved	2026-01-17 17:04:28.994265	\N	\N	Open Source	\N	https://ranger.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
591	Cemu	Software to emulate Wii U games and applications on PC.	91	{linux}	https://github.com/cemu-project/Cemu	\N	13	approved	2026-01-17 17:04:29.075605	\N	\N	Open Source	\N	https://cemu.info/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
478	SpaceFM	Multi-panel tabbed file and desktop manager with built-in VFS, udev- or HAL-based device manager, customisable menu system and bash-GTK integration.	31	{linux}	https://github.com/IgnorantGuru/spacefm	\N	13	approved	2026-01-17 17:04:28.994807	\N	\N	Open Source	\N	https://ignorantguru.github.io/spacefm/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
479	Thunar	Thunar is a modern file manager for the Xfce Desktop Environment.	31	{linux}	https://gitlab.xfce.org/xfce/thunar	\N	13	approved	2026-01-17 17:04:28.995657	\N	\N	Open Source	\N	https://docs.xfce.org/xfce/thunar/start	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
480	Vifm	Vifm is an ncurses based file manager with VI like keybindings, which also borrows some useful ideas from mutt.	31	{linux}	https://github.com/vifm/vifm	\N	13	approved	2026-01-17 17:04:28.996195	\N	\N	Open Source	\N	https://vifm.info/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
481	Dwarf Fortress	A famously complex simulation of a High Fantasy Dwarf Fortress, fight goblins, and slay massive legendary beasts. Strike the earth!	78	{linux}	http://www.bay12games.com/dwarves/	\N	13	approved	2026-01-17 17:04:28.996773	\N	\N	Freeware	\N	http://www.bay12games.com/dwarves/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
482	OpenTTD	An open-source clone of Transport Tycoon Plus with major improvements.	78	{linux}	https://github.com/OpenTTD/OpenTTD	\N	13	approved	2026-01-17 17:04:28.99734	\N	\N	Open Source	\N	https://www.openttd.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
483	Simutrans	Simutrans is a freeware and open-source transportation simulator.	78	{linux}	https://github.com/aburch/simutrans	\N	13	approved	2026-01-17 17:04:28.99791	\N	\N	Open Source	\N	https://www.simutrans.com	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
484	Unknown Horizons	A 2D realtime strategy simulation with an emphasis on economy and city building. Multiplayer currently broken.	78	{linux}	https://github.com/unknown-horizons/unknown-horizons	\N	13	approved	2026-01-17 17:04:28.998467	\N	\N	Open Source	\N	https://unknown-horizons.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
485	2048	Play the famous 2048 in commandline.	79	{linux}	https://github.com/mydzor/bash2048	\N	13	approved	2026-01-17 17:04:28.99906	\N	\N	Open Source	\N	https://github.com/mydzor/bash2048	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
486	Bastet	Play Tetris in commandline.	79	{linux}	https://github.com/fph/bastet	\N	13	approved	2026-01-17 17:04:28.99974	\N	\N	Open Source	\N	https://fph.altervista.org/prog/bastet.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
487	gambit	Play chess in your terminal.	79	{linux}	https://github.com/maaslalani/gambit	\N	13	approved	2026-01-17 17:04:29.00031	\N	\N	Open Source	\N	https://github.com/maaslalani/gambit	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
488	nSnake	Play the classic Nokia snake game on the command line.	79	{linux}	https://github.com/alexdantas/nsnake	\N	13	approved	2026-01-17 17:04:29.001096	\N	\N	Open Source	\N	https://github.com/alexdantas/nsnake	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
489	Pacman4console	Play Pacman game in console.	79	{linux}	https://github.com/alexdantas/pacman4console.debian	\N	13	approved	2026-01-17 17:04:29.001802	\N	\N	Open Source	\N	https://launchpad.net/ubuntu/+source/pacman4console	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
490	Pokete	A terminal based Pokemon like game.	79	{linux}	https://github.com/lxgr-linux/pokete/	\N	13	approved	2026-01-17 17:04:29.002469	\N	\N	Open Source	\N	https://lxgr-linux.github.io/pokete/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
491	tty-solitaire	Play solitaire in your terminal!	79	{linux}	https://github.com/mpereira/tty-solitaire	\N	13	approved	2026-01-17 17:04:29.003104	\N	\N	Open Source	\N	https://github.com/mpereira/tty-solitaire	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
492	NXEngine	A source port of Cave Story that runs natively on Linux, source needs to be built.	80	{linux}	https://nxengine.sourceforge.io/	\N	13	approved	2026-01-17 17:04:29.003775	\N	\N	Open Source	\N	https://nxengine.sourceforge.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
493	NXEngine-evo	A somewhat upgraded/refactored version of NXEngine by Caitlin Shaw.	80	{linux}	https://github.com/nxengine/nxengine-evo	\N	13	approved	2026-01-17 17:04:29.004639	\N	\N	Open Source	\N	https://github.com/nxengine/nxengine-evo	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
494	OpenMW	A recreation of the Morrowind engine, expanding upon the original. It can be used to play legitimate copies of original game.	80	{linux}	https://github.com/OpenMW/openmw	\N	13	approved	2026-01-17 17:04:29.00537	\N	\N	Open Source	\N	https://openmw.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
495	OpenRA	Classic strategy games, rebuilt for the modern era. Open source.	80	{linux}	https://github.com/OpenRA/OpenRA	\N	13	approved	2026-01-17 17:04:29.006025	\N	\N	Open Source	\N	https://www.openra.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
496	OpenRCT2	A recreation of the Rollercoaster Tycoon 2 engine. Requires the original games assests.	80	{linux}	https://github.com/OpenRCT2/OpenRCT2	\N	13	approved	2026-01-17 17:04:29.006635	\N	\N	Open Source	\N	https://openrct2.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
497	ChaosEsqueAnthology Disc 1	[ChaosEsqueAnthology Disc 2](https://sourceforge.net/projects/chaosesqueanthologyvolume2/) - A modification of Xonotic which included extended weapons, maps, vehicles, buildable buildings, mounted weapons, spell casting, monsters, player characters, textures, and game mode (such as colorwar (think liquidwar)).	81	{linux}	https://gitlab.com/xonotic	\N	13	approved	2026-01-17 17:04:29.007235	\N	\N	Open Source	\N	https://sourceforge.net/projects/chaosesqueanthology/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
498	Freedoom	Free version of the original Doom games, with newly created free-licensed assets.	81	{linux}	https://github.com/freedoom/freedoom	\N	13	approved	2026-01-17 17:04:29.007844	\N	\N	Open Source	\N	https://freedoom.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
499	OpenArena	Free and open-source clone of Quake III Arena, based on the realeased source code, with newly created assets.	81	{linux}	https://sourceforge.net/projects/oarena/	\N	13	approved	2026-01-17 17:04:29.008447	\N	\N	Open Source	\N	https://sourceforge.net/projects/oarena/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
500	Red Eclipse	Red Eclipse is a fun-filled new take on the first person arena shooter, which lends itself toward a balanced gameplay, with a general theme of agility in a variety of environments.	81	{linux}	https://github.com/red-eclipse/base	\N	13	approved	2026-01-17 17:04:29.009054	\N	\N	Open Source	\N	https://redeclipse.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
501	Urban Terror	A "Hollywood" tactical shooter - realism based, but the motto is "fun over realism".	81	{linux}	https://www.urbanterror.info	\N	13	approved	2026-01-17 17:04:29.00965	\N	\N	Freeware	\N	https://www.urbanterror.info	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
502	Xonotic	Arena shooter inspired by Unreal Tournament and Quake.	81	{linux}	https://gitlab.com/xonotic	\N	13	approved	2026-01-17 17:04:29.010346	\N	\N	Open Source	\N	https://www.xonotic.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
503	Zandronum	Leading the way in newschool multiplayer Doom online.	81	{linux}	https://osdn.net/projects/zandronum/scm/	\N	13	approved	2026-01-17 17:04:29.010947	\N	\N	Open Source	\N	https://zandronum.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
504	Zdoom	ZDoom is a source port for the modern era, supporting current hardware and operating systems and sporting a vast array of user options.	81	{linux}	https://github.com/coelckers/gzdoom	\N	13	approved	2026-01-17 17:04:29.011612	\N	\N	Open Source	\N	https://zdoom.org/index	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
505	FlightGear	Professional quality 3D flight simulator.	82	{linux}	https://wiki.flightgear.org/Portal:Developer	\N	13	approved	2026-01-17 17:04:29.012579	\N	\N	Open Source	\N	https://www.flightgear.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
506	Mudlet	A cross-platform, open source, and super fast MUD (text-only MMORPGs) client with scripting in Lua.	82	{linux}	https://github.com/Mudlet/Mudlet	\N	13	approved	2026-01-17 17:04:29.013402	\N	\N	Open Source	\N	https://www.mudlet.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
507	Neverball	Addictive ball-rolling game with many levels, avatars and an ability to record replays.	82	{linux}	https://github.com/Neverball/neverball	\N	13	approved	2026-01-17 17:04:29.014664	\N	\N	Open Source	\N	https://neverball.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
508	OhMyGiraffe	A delightful game of survival. A game about a giraffe eating fruit while being chased by lions.	82	{linux}	https://www.ohmygiraffe.com/	\N	13	approved	2026-01-17 17:04:29.015518	\N	\N	Freeware	\N	https://www.ohmygiraffe.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
509	Open Surge	A 2D platformer and game creation engine inspired by the 16-bit Sonic the Hedgehog games.	82	{linux}	https://github.com/alemart/opensurge	\N	13	approved	2026-01-17 17:04:29.016618	\N	\N	Open Source	\N	https://opensurge2d.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
510	Snake Game	Cross-platform Classic Snake Game based on Node.js.	82	{linux}	https://github.com/alpcoskun/snake	\N	13	approved	2026-01-17 17:04:29.017328	\N	\N	Open Source	\N	https://aprilcoskun.github.io/snake/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
511	SuperTux	Clone of the popular sidescrolling Super Mario games.	82	{linux}	https://github.com/SuperTux/supertux/	\N	13	approved	2026-01-17 17:04:29.018222	\N	\N	Open Source	\N	https://www.supertux.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
512	Cockatrice	Cockatrice is an open-source multiplatform supported program for playing tabletop card games over a network.	83	{linux}	https://github.com/Cockatrice/Cockatrice	\N	13	approved	2026-01-17 17:04:29.019231	\N	\N	Open Source	\N	https://cockatrice.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
513	Galois	Galois is a Falling Blocks type game that isn't limited to the standard tetrominoes that most games in it's genre are limited to.	83	{linux}	https://download.savannah.gnu.org/releases/galois/source/	\N	13	approved	2026-01-17 17:04:29.02088	\N	\N	Open Source	\N	https://www.nongnu.org/galois/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
514	GBrainy	Gbrainy is a brain teaser game with logic puzzles and memory trainers.	83	{linux}	https://gitlab.gnome.org/GNOME/gbrainy/	\N	13	approved	2026-01-17 17:04:29.02234	\N	\N	Open Source	\N	https://wiki.gnome.org/action/show/Apps/gbrainy	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
515	Pingus	2D puzzle game that clones the popular Lemmings. Your goal is to guide a group of penguins safely across the game map.	83	{linux}	https://github.com/Pingus/pingus	\N	13	approved	2026-01-17 17:04:29.024633	\N	\N	Open Source	\N	https://pingus.seul.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
516	Tabletop Club	An open-source platform for playing tabletop games in a physics-based 3D environment for Windows, macOS, and Linux! Made with the Godot Engine.	83	{linux}	https://github.com/drwhut/tabletop-club	\N	13	approved	2026-01-17 17:04:29.025488	\N	\N	Open Source	\N	https://drwhut.itch.io/tabletop-club	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
517	Dr. Robotnik's Ring Racers	A technical kart racer, drawing inspiration from “antigrav” racers, fighting games, and traditional-style kart racing.	84	{linux}	https://github.com/KartKrewDev/RingRacers/	\N	13	approved	2026-01-17 17:04:29.026459	\N	\N	Open Source	\N	https://www.kartkrew.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
518	MotoGT	2D top-viewed game where you drive a MotoGP bike.	84	{linux}	https://motogt.sourceforge.net/	\N	13	approved	2026-01-17 17:04:29.027247	\N	\N	Open Source	\N	https://motogt.sourceforge.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
519	SuperTuxKart	SuperTuxKart is a 3D open-source arcade racer with a variety characters, tracks, and modes to play.	84	{linux}	https://github.com/supertuxkart/stk-code	\N	13	approved	2026-01-17 17:04:29.027914	\N	\N	Open Source	\N	https://supertuxkart.net	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
520	XMoto	2D motocross physics-based game requiring a lot of skill to master, with a built-in replay-recording and sharing system.	84	{linux}	https://xmoto.tuxfamily.org/index.php	\N	13	approved	2026-01-17 17:04:29.029161	\N	\N	Open Source	\N	https://xmoto.tuxfamily.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
521	FLARE	Singleplayer Diablo clone with beautiful original graphics.	85	{linux}	https://github.com/flareteam/flare-engine	\N	13	approved	2026-01-17 17:04:29.029807	\N	\N	Open Source	\N	https://flarerpg.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
522	FreedroidRPG	Sci-fi 2D top-down RPG inspired by Diablo games.	85	{linux}	https://gitlab.com/freedroid/freedroid-src	\N	13	approved	2026-01-17 17:04:29.030384	\N	\N	Open Source	\N	https://www.freedroid.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
523	Ryzom	Free and open-source 3D MMORPG with unique features and deep lore. The official servers allow free accounts as well as paid subscriptions with extra features.	85	{linux}	https://github.com/ryzom/ryzomcore	\N	13	approved	2026-01-17 17:04:29.030993	\N	\N	Open Source	\N	https://ryzom.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
524	Tales of Maj'Eyal	Tales of Maj’Eyal (ToME) is a free, open source roguelike RPG, featuring tactical turn-based combat and advanced character building.	85	{linux}	https://te4.org/	\N	13	approved	2026-01-17 17:04:29.031691	\N	\N	Open Source	\N	https://te4.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
525	Veloren	Veloren is a multiplayer voxel RPG written in Rust. It is inspired by games such as Cube World, Legend of Zelda: Breath of the Wild, Dwarf Fortress and Minecraft.	85	{linux}	https://gitlab.com/veloren/veloren	\N	13	approved	2026-01-17 17:04:29.032335	\N	\N	Open Source	\N	https://veloren.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
526	Zelda Classic	A tribute to Nintendo's The Legend of Zelda with additional quests, items and challenges.	85	{linux}	https://github.com/ZeldaClassic/ZeldaClassic	\N	13	approved	2026-01-17 17:04:29.032955	\N	\N	Open Source	\N	https://www.zeldaclassic.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
527	Zelda: Mystery of Solarus DX	A direct sequel to The Legend of Zelda: A Link to the Past on the SNES, using the same graphics and game mechanisms.	85	{linux}	https://gitlab.com/solarus-games/	\N	13	approved	2026-01-17 17:04:29.033535	\N	\N	Open Source	\N	https://www.solarus-games.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
528	0 A.D.	Age of Empires like RTS game of ancient warfare.	86	{linux}	https://releases.wildfiregames.com/	\N	13	approved	2026-01-17 17:04:29.034137	\N	\N	Open Source	\N	https://play0ad.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
529	Mindustry	The automation tower defense RTS, written in Java.	86	{linux}	https://github.com/Anuken/Mindustry	\N	13	approved	2026-01-17 17:04:29.034872	\N	\N	Open Source	\N	https://mindustrygame.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
530	Nethack	Open-source rogue-like with ASCII graphics.	86	{linux}	https://sourceforge.net/projects/nethack/	\N	13	approved	2026-01-17 17:04:29.035565	\N	\N	Open Source	\N	https://www.nethack.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
531	TripleA	Open source grand strategy game with "Axis and Allies" game rules.	86	{linux}	https://github.com/triplea-game/triplea/	\N	13	approved	2026-01-17 17:04:29.036243	\N	\N	Open Source	\N	https://triplea-game.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
532	Warzone 2100	Open-source real-time strategy game that takes place after a nuclear war.	86	{linux}	https://github.com/Warzone2100/warzone2100	\N	13	approved	2026-01-17 17:04:29.036833	\N	\N	Open Source	\N	https://wz2100.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
533	Widelands	Widelands is a open source RTS game with singleplayer campaigns and a multiplayer mode inspired by Settlers II.	86	{linux}	https://bazaar.launchpad.net/~widelands-dev/widelands/trunk/changes	\N	13	approved	2026-01-17 17:04:29.037467	\N	\N	Open Source	\N	https://www.widelands.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
534	Factorio	A factory building sandbox game.	87	{linux}	https://www.factorio.com/	\N	13	approved	2026-01-17 17:04:29.038083	\N	\N	Commercial	\N	https://www.factorio.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
535	Luanti	Luanti (formerly Minetest) is an open source voxel game-creation platform with easy modding and game creation.	87	{linux}	https://github.com/minetest/minetest/	\N	13	approved	2026-01-17 17:04:29.038706	\N	\N	Open Source	\N	https://www.luanti.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
536	Mcpelauncher	Unofficial Open-source launcher for Minecraft: Bedrock edition.	87	{linux}	https://github.com/minecraft-linux/mcpelauncher-manifest	\N	13	approved	2026-01-17 17:04:29.039287	\N	\N	Open Source	\N	https://mcpelauncher.readthedocs.io/en/latest/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
537	Minecraft	Minecraft is a game about placing blocks and going on adventures. Explore randomly generated worlds and build amazing things from the simplest of homes to the grandest of castles.	87	{linux}	https://minecraft.net	\N	13	approved	2026-01-17 17:04:29.039854	\N	\N	Commercial	\N	https://minecraft.net	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
538	Modrinth App	The Modrinth App is a unique, open source launcher that allows you to play your favorite mods, and keep them up to date, all in one neat little package.	87	{linux}	https://github.com/modrinth/code	\N	13	approved	2026-01-17 17:04:29.040415	\N	\N	Open Source	\N	https://modrinth.com/app	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
539	MultiMC	MultiMC is an alternative launcher for Minecraft. It allows you to have multiple, cleanly separated instances of Minecraft (each with their own mods, resource packs, saves, etc) and helps you manage them and their associated options with a simple and powerful interface.	87	{linux}	https://github.com/MultiMC/Launcher/	\N	13	approved	2026-01-17 17:04:29.040977	\N	\N	Open Source	\N	https://multimc.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
540	Prism Launcher	A custom launcher for Minecraft that allows you to easily manage multiple installations of Minecraft at once (Fork of MultiMC and PolyMC).	87	{linux}	https://github.com/PrismLauncher/PrismLauncher	\N	13	approved	2026-01-17 17:04:29.041556	\N	\N	Open Source	\N	https://prismlauncher.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
541	AstroMenace	Hardcore 3D space scroll-shooter with spaceship upgrade possibilities.	88	{linux}	https://github.com/viewizard/astromenace	\N	13	approved	2026-01-17 17:04:29.042147	\N	\N	Open Source	\N	https://viewizard.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
542	C-Dogs SDL	Classic overhead run-and-gun game in beautiful pixel-art.	88	{linux}	https://github.com/cxong/cdogs-sdl	\N	13	approved	2026-01-17 17:04:29.042808	\N	\N	Open Source	\N	https://cxong.github.io/cdogs-sdl/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
543	Battle for Wesnoth	The Battle for Wesnoth is an open source, turn-based strategy game with a high fantasy theme. It features both singleplayer and online/hotseat multiplayer combat.	89	{linux}	https://github.com/wesnoth/wesnoth	\N	13	approved	2026-01-17 17:04:29.043414	\N	\N	Open Source	\N	https://wesnoth.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
544	FreeCiv	Freeciv is a Free and Open Source empire-building strategy game inspired by the history of human civilization.	89	{linux}	https://github.com/freeciv/freeciv	\N	13	approved	2026-01-17 17:04:29.044093	\N	\N	Open Source	\N	http://www.freeciv.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
545	HedgeWars	2D game where teams compete in the style of the popular Worms games.	89	{linux}	https://www.hedgewars.org/download/releases/	\N	13	approved	2026-01-17 17:04:29.044757	\N	\N	Open Source	\N	https://www.hedgewars.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
546	Tanks of Freedom II	Pixel-art military strategy implemented in Godot game engine.	89	{linux}	https://github.com/P1X-in/tanks-of-freedom-ii	\N	13	approved	2026-01-17 17:04:29.045357	\N	\N	Open Source	\N	https://czlowiekimadlo.itch.io/tanks-of-freedom-ii	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
547	Bottles	Easily manage wine prefixes in a new way. Run Windows software and games on Linux.	90	{linux}	https://github.com/bottlesdevs/	\N	13	approved	2026-01-17 17:04:29.046219	\N	\N	Open Source	\N	https://usebottles.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
548	Cartridges	A GTK4 + Libadwaita game launcher.	90	{linux}	https://github.com/kra-mo/cartridges	\N	13	approved	2026-01-17 17:04:29.04683	\N	\N	Open Source	\N	https://apps.gnome.org/Cartridges/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
549	Heroic Games Launcher	A Native GOG and Epic Games Launcher for Linux, Windows and Mac.	90	{linux}	https://github.com/Heroic-Games-Launcher	\N	13	approved	2026-01-17 17:04:29.047449	\N	\N	Open Source	\N	https://heroicgameslauncher.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
550	itch	The itch.io app. All of your downloads are kept in a single place and are automatically updated. Plenty of free games.	90	{linux}	https://github.com/itchio/itch	\N	13	approved	2026-01-17 17:04:29.048187	\N	\N	Open Source	\N	https://itch.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
551	Minigalaxy	A simple GOG client for Linux.	90	{linux}	https://github.com/sharkwouter/minigalaxy	\N	13	approved	2026-01-17 17:04:29.049109	\N	\N	Open Source	\N	https://sharkwouter.github.io/minigalaxy/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
552	PlayOnLinux	A front-end for Wine.	90	{linux}	https://repository.playonlinux.com/	\N	13	approved	2026-01-17 17:04:29.049727	\N	\N	Open Source	\N	https://www.playonlinux.com	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
553	BoilR	Synchronize games from other platforms into your Steam library.	90	{linux}	https://github.com/PhilipK/BoilR	\N	13	approved	2026-01-17 17:04:29.050708	\N	\N	Open Source	\N	https://github.com/PhilipK/BoilR	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
554	Boxtron	Steam Play compatibility tool to run DOS games using native Linux DOSBox. It is a sister project of Luxtorpeda and DOSBox Staging.	90	{linux}	https://github.com/dreamer/boxtron	\N	13	approved	2026-01-17 17:04:29.05135	\N	\N	Open Source	\N	https://github.com/dreamer/boxtron	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
555	CryoUtilities	A utility to improve performance and help manage storage on Steam Deck.	90	{linux}	https://github.com/CryoByte33/steam-deck-utilities	\N	13	approved	2026-01-17 17:04:29.051951	\N	\N	Open Source	\N	https://github.com/CryoByte33/steam-deck-utilities	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
556	Decky Loader	A plugin loader for the Steam Deck.	90	{linux}	https://github.com/SteamDeckHomebrew/decky-loader	\N	13	approved	2026-01-17 17:04:29.052701	\N	\N	Open Source	\N	https://decky.xyz/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
557	DOSBox Staging	DOSBox Staging is a modern continuation of DOSBox with advanced features and current development practices.	90	{linux}	https://github.com/dosbox-staging/dosbox-staging	\N	13	approved	2026-01-17 17:04:29.05337	\N	\N	Open Source	\N	https://www.dosbox-staging.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
558	GameMode	Optimise Linux system performance on demand.	90	{linux}	https://github.com/FeralInteractive/gamemode	\N	13	approved	2026-01-17 17:04:29.054022	\N	\N	Open Source	\N	https://github.com/FeralInteractive/gamemode	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
559	GOverlay	GOverlay is an open source project that aims to create a Graphical UI to help manage Linux overlays.	90	{linux}	https://github.com/benjamimgois/goverlay	\N	13	approved	2026-01-17 17:04:29.054635	\N	\N	Open Source	\N	https://github.com/benjamimgois/goverlay	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
560	Luxtorpeda	Suite of Steam Play compatibility tools to run games using native Linux engines.	90	{linux}	https://github.com/luxtorpeda-dev/luxtorpeda	\N	13	approved	2026-01-17 17:04:29.055254	\N	\N	Open Source	\N	https://luxtorpeda.gitlab.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
561	MangoHud	A Vulkan and OpenGL overlay for monitoring FPS, temperatures, CPU/GPU load and more.	90	{linux}	https://github.com/flightlessmango/MangoHud	\N	13	approved	2026-01-17 17:04:29.055831	\N	\N	Open Source	\N	https://github.com/flightlessmango/MangoHud	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
562	Nyrna	Suspend games and applications.	90	{linux}	https://github.com/Merrit/nyrna	\N	13	approved	2026-01-17 17:04:29.056413	\N	\N	Open Source	\N	https://nyrna.merritt.codes/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
563	Roberta	Steam Play compatibility tool to run adventure games using native Linux ScummVM. It is a sister project of Luxtorpeda.	90	{linux}	https://github.com/dreamer/roberta	\N	13	approved	2026-01-17 17:04:29.057091	\N	\N	Open Source	\N	https://github.com/dreamer/roberta	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
564	SC Controller	User-mode driver, mapper and GTK3 based GUI for Steam Controller, DualShock 4, and similar controllers.	90	{linux}	https://github.com/kozec/sc-controller	\N	13	approved	2026-01-17 17:04:29.057717	\N	\N	Open Source	\N	https://github.com/kozec/sc-controller	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
565	ScummVM	ScummVM allows you to play classic graphic point-and-click adventure games, text adventure games, and RPGs, as long as you already have the game data files. ScummVM replaces the executable files shipped with the games, which means you can now play your favorite games on all your favorite devices.	90	{linux}	https://github.com/scummvm/scummvm	\N	13	approved	2026-01-17 17:04:29.058348	\N	\N	Open Source	\N	https://www.scummvm.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
567	Steam ROM Manager	An app for managing ROMs in Steam.	90	{linux}	https://github.com/SteamGridDB/steam-rom-manager	\N	13	approved	2026-01-17 17:04:29.059597	\N	\N	Open Source	\N	https://steamgriddb.github.io/steam-rom-manager/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
568	SteamTinkerLaunch	Linux wrapper tool for use with the Steam client for custom launch options and 3rd party programs.	90	{linux}	https://github.com/sonic2kk/steamtinkerlaunch	\N	13	approved	2026-01-17 17:04:29.060265	\N	\N	Open Source	\N	https://github.com/sonic2kk/steamtinkerlaunch	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
569	WineZGUI	GUI Frontend using Zenity for running Windows games with Wine that allows you to create, manage, and share game prefixes.	90	{linux}	https://github.com/fastrizwaan/WineZGUI/	\N	13	approved	2026-01-17 17:04:29.060856	\N	\N	Open Source	\N	https://github.com/fastrizwaan/WineZGUI/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
570	GE-Proton	Compatibility tool for Steam Play based on Wine and additional components.	90	{linux}	https://github.com/GloriousEggroll/proton-ge-custom	\N	13	approved	2026-01-17 17:04:29.061517	\N	\N	Open Source	\N	https://github.com/GloriousEggroll/proton-ge-custom	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
571	Kron4ek Wine Builds	Custom Wine builds and build scripts for Vanilla, Wine Staging, Wine-tkg and Proton.	90	{linux}	https://github.com/Kron4ek/Wine-Builds	\N	13	approved	2026-01-17 17:04:29.062079	\N	\N	Open Source	\N	https://github.com/Kron4ek/Wine-Builds	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
572	Proton	Compatibility tool for Steam Play based on Wine and additional components, primarily developed by Valve and CodeWeavers.	90	{linux}	https://github.com/ValveSoftware/Proton	\N	13	approved	2026-01-17 17:04:29.062768	\N	\N	Open Source	\N	https://github.com/ValveSoftware/Proton	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
573	ProtonPlus	A simple Wine and Proton manager for GNOME.	90	{linux}	https://github.com/Vysp3r/ProtonPlus	\N	13	approved	2026-01-17 17:04:29.063377	\N	\N	Open Source	\N	https://github.com/Vysp3r/ProtonPlus	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
574	Protontricks	This is a wrapper script that allows you to easily run Winetricks commands for Steam Play/Proton games among other common Wine features, such as launching external Windows executables.	90	{linux}	https://github.com/Matoking/protontricks	\N	13	approved	2026-01-17 17:04:29.064283	\N	\N	Open Source	\N	https://github.com/Matoking/protontricks	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
576	ProtonUp-Qt	Install and manage GE-Proton and Luxtorpeda for Steam and Wine-GE for Lutris with this graphical user interface.	90	{linux}	https://github.com/DavidoTek/ProtonUp-Qt	\N	13	approved	2026-01-17 17:04:29.065472	\N	\N	Open Source	\N	https://davidotek.github.io/protonup-qt/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
577	Wine	Wine ("Wine Is Not an Emulator") is a compatibility layer capable of running Windows applications on Linux, quality depends from game to game.	90	{linux}	https://dl.winehq.org/wine/source/	\N	13	approved	2026-01-17 17:04:29.066049	\N	\N	Open Source	\N	https://www.winehq.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
578	Wine-GE-Custom	Custom build of wine, made to use with lutris. Built with lutris's buildbot.	90	{linux}	https://github.com/GloriousEggroll/wine-ge-custom	\N	13	approved	2026-01-17 17:04:29.066661	\N	\N	Open Source	\N	https://github.com/GloriousEggroll/wine-ge-custom	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
579	Wine-tkg	The wine-tkg build systems, to create custom Wine and Proton builds.	90	{linux}	https://github.com/Frogging-Family/wine-tkg-git	\N	13	approved	2026-01-17 17:04:29.067298	\N	\N	Open Source	\N	https://github.com/Frogging-Family/wine-tkg-git	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
580	Winetricks	Winetricks is an easy way to work around problems in Wine.	90	{linux}	https://github.com/Winetricks/winetricks	\N	13	approved	2026-01-17 17:04:29.068001	\N	\N	Open Source	\N	https://github.com/Winetricks/winetricks	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
581	Wine-Wayland	Wine-wayland allows playing DX9/DX11 and Vulkan games using pure wayland and Wine/DXVK.	90	{linux}	https://github.com/varmd/wine-wayland	\N	13	approved	2026-01-17 17:04:29.068773	\N	\N	Open Source	\N	https://github.com/varmd/wine-wayland	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
582	ares	A multi-system console emulation suite.	91	{linux}	https://github.com/ares-emulator/ares	\N	13	approved	2026-01-17 17:04:29.06941	\N	\N	Open Source	\N	https://ares-emu.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
583	GNOME Video Arcade	GNOME Video Arcade is a simple Mame frontend for any freedesktop.org compliant desktop environment.	91	{linux}	https://gitlab.gnome.org/Archive/gnome-video-arcade	\N	13	approved	2026-01-17 17:04:29.070022	\N	\N	Open Source	\N	https://wiki.gnome.org/action/show/Apps/GnomeVideoArcade	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
584	Higan	Higan is a multi-system emulator that supports emulating a huge number of different systems including: NES, SNES, GameBoy, GameBoy Color, Gameboy Advance, NEC PC Engine, Sega Master System, and more. Here is a guide to install it on Linux [Higan Installation](https://higan.readthedocs.io/en/stable/install/linux/).	91	{linux}	https://github.com/byuu/higan	\N	13	approved	2026-01-17 17:04:29.07067	\N	\N	Open Source	\N	https://github.com/higan-emu/higan	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
585	MAME	MAME is an Arcade Cabinet emulator that strives for accuracy, and can play a huge number of different arcade games.	91	{linux}	https://github.com/mamedev/mame	\N	13	approved	2026-01-17 17:04:29.071375	\N	\N	Open Source	\N	https://mamedev.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
586	qmc2	QMC2 is the successor to QMamecat, it is a gui for MAME and a ROM manager.	91	{linux}	https://github.com/qmc2/qmc2-mame-fe	\N	13	approved	2026-01-17 17:04:29.072092	\N	\N	Open Source	\N	https://github.com/qmc2/qmc2-mame-fe	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
587	Stella	Is an Atari 2600 Emulator that is multiplatform.	91	{linux}	https://github.com/stella-emu/stella	\N	13	approved	2026-01-17 17:04:29.073074	\N	\N	Open Source	\N	https://stella-emu.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
588	EmuDeck	Emulator configurator for Steam Deck.	91	{linux}	https://github.com/dragoonDorise/EmuDeck	\N	13	approved	2026-01-17 17:04:29.073713	\N	\N	Open Source	\N	https://www.emudeck.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
589	RetroDECK	Everything you need for emulation on Steam Deck.	91	{linux}	https://github.com/XargonWan/RetroDECK	\N	13	approved	2026-01-17 17:04:29.074335	\N	\N	Open Source	\N	https://retrodeck.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
590	xemu	Original Xbox Emulator for Windows, macOS, and Linux (Active Development).	91	{linux}	https://github.com/mborgerson/xemu	\N	13	approved	2026-01-17 17:04:29.074957	\N	\N	Open Source	\N	https://xemu.app/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
593	Dolphin Emulator	Dolphin is a GameCube / Wii emulator, allowing you to play games for these two platforms on PC with improvements.	91	{linux}	https://github.com/dolphin-emu/dolphin	\N	13	approved	2026-01-17 17:04:29.076882	\N	\N	Open Source	\N	https://dolphin-emu.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
594	melonDS	melonDS aims at providing fast and accurate Nintendo DS emulation.	91	{linux}	https://github.com/Arisotura/melonDS	\N	13	approved	2026-01-17 17:04:29.077625	\N	\N	Open Source	\N	https://melonds.kuribo64.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
595	mGBA	mGBA is an open-source Game Boy Advance emulator.	91	{linux}	https://github.com/mgba-emu	\N	13	approved	2026-01-17 17:04:29.07829	\N	\N	Open Source	\N	https://mgba.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
596	nestopia	nestopia is a Nintendo Entertainment System/Famicon emulator.	91	{linux}	https://github.com/0ldsk00l/nestopia	\N	13	approved	2026-01-17 17:04:29.078975	\N	\N	Open Source	\N	http://0ldsk00l.ca/nestopia/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
597	Snes9x	Is a multiplatform Super Nintendo Entertainment System emulator that has gone through many incarnations, but is still being actively developed.	91	{linux}	https://github.com/snes9xgit/snes9x	\N	13	approved	2026-01-17 17:04:29.07983	\N	\N	Open Source	\N	http://www.snes9x.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
598	Visual Boy Advance-M	A Gameboy and Gameboy Advance Emulator that is still undergoing active development and can even emulate a system link between two gameboys.	91	{linux}	https://github.com/visualboyadvance-m/visualboyadvance-m	\N	13	approved	2026-01-17 17:04:29.08046	\N	\N	Open Source	\N	https://www.visualboyadvance-m.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
599	ZSNES	A capable and commonly used Super Nintendo Entertainment System/Super Famicom emulator, many consider it the gold standard in SNES/Super Famicom emulation.	91	{linux}	https://sourceforge.net/projects/zsnes/	\N	13	approved	2026-01-17 17:04:29.081099	\N	\N	Open Source	\N	https://www.zsnes.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
600	Flycast	A multiplatform Sega Dreamcast emulator. Available for Windows, macOS, Linux, Android and various home consoles.	91	{linux}	https://github.com/flyinghead/flycast	\N	13	approved	2026-01-17 17:04:29.081722	\N	\N	Open Source	\N	https://github.com/flyinghead/flycast	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
601	DuckStation	DuckStation is a multiplatform PSX emulator for Windows, macOS, Linux and Android.	91	{linux}	https://github.com/stenzek/duckstation	\N	13	approved	2026-01-17 17:04:29.082745	\N	\N	Open Source	\N	https://www.duckstation.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
602	PCSX2	PCSX2 is a free and open-source PlayStation 2 (PS2) emulator.	91	{linux}	https://github.com/PCSX2	\N	13	approved	2026-01-17 17:04:29.083369	\N	\N	Open Source	\N	https://pcsx2.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
603	Play!	Play! is a PlayStation2 emulator for Windows, macOS, UNIX, Android, iOS and web browser platforms.	91	{linux}	https://github.com/jpd002/Play-	\N	13	approved	2026-01-17 17:04:29.083983	\N	\N	Open Source	\N	https://purei.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
604	PPSSPP	PPSSPP is a PSP emulator that can run games full HD resolution. It can even upscale textures that would otherwise be too blurry as they were made for the small screen of the original PSP.	91	{linux}	https://github.com/hrydgard/ppsspp	\N	13	approved	2026-01-17 17:04:29.0846	\N	\N	Open Source	\N	https://www.ppsspp.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
605	RPCS3	RPCS3 is a multi-platform open-source Sony PlayStation 3 emulator and debugger written in C++ for Windows, Linux, macOS and FreeBSD.	91	{linux}	https://github.com/rpcs3	\N	13	approved	2026-01-17 17:04:29.085228	\N	\N	Open Source	\N	https://rpcs3.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
606	ShadPS4	A PS4 emulator in active development. Available on Windows, macOS and Linux.	91	{linux}	https://github.com/shadps4-emu/shadps4	\N	13	approved	2026-01-17 17:04:29.085841	\N	\N	Open Source	\N	https://github.com/shadps4-emu/shadps4	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
607	Vita3K	Vita3K is an experimental PlayStation Vita emulator for Windows and Linux.	91	{linux}	https://github.com/Vita3K/Vita3K	\N	13	approved	2026-01-17 17:04:29.086439	\N	\N	Open Source	\N	https://vita3k.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
608	Fuse	Fuse (the Free Unix Spectrum Emulator) is a ZX Spectrum emulator for Unix.	91	{linux}	https://sourceforge.net/p/fuse-emulator/	\N	13	approved	2026-01-17 17:04:29.087054	\N	\N	Open Source	\N	https://fuse-emulator.sourceforge.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
609	Aseprite	Animated sprite editor & pixel art tool.	92	{linux}	https://www.aseprite.org/	\N	13	approved	2026-01-17 17:04:29.087665	\N	\N	Commercial	\N	https://www.aseprite.org/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
610	Cinepaint	Open source deep paint software.	92	{linux}	https://sourceforge.net/projects/cinepaint/	\N	13	approved	2026-01-17 17:04:29.088605	\N	\N	Open Source	\N	http://cinepaint.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
611	Drawing	This free basic raster image editor is similar to Microsoft Paint, but aiming at the GNOME desktop.	92	{linux}	https://github.com/maoschanz/drawing	\N	13	approved	2026-01-17 17:04:29.08926	\N	\N	Open Source	\N	https://maoschanz.github.io/drawing/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
612	Gifcurry	Your open source video to GIF maker built with Haskell.	92	{linux}	https://github.com/lettier/gifcurry	\N	13	approved	2026-01-17 17:04:29.089878	\N	\N	Open Source	\N	https://lettier.github.io/gifcurry/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
613	Heron Animation	A free stop animation making program.	92	{linux}	https://heronanimation.brunolefevre.net/	\N	13	approved	2026-01-17 17:04:29.090478	\N	\N	Freeware	\N	https://heronanimation.brunolefevre.net/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
614	Ipe	Ipe is a LaTeX powered drawing editor for creating figures and presentations in PDF format.	92	{linux}	https://ipe.otfried.org	\N	13	approved	2026-01-17 17:04:29.091347	\N	\N	Open Source	\N	https://ipe.otfried.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
615	Karbon	An open source vector drawing program.	92	{linux}	https://invent.kde.org/office/calligra	\N	13	approved	2026-01-17 17:04:29.091988	\N	\N	Open Source	\N	https://www.calligra.org/karbon/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1639	Albert launcher	Keyboard launcher written in C++/Qt	185	{Linux,Mac,Windows}	https://www.patreon.com/albertlauncher	\N	1	approved	2026-01-18 09:29:54.645656	\N	\N	Open Source	\N	\N	\N	software
616	Knotter	A Program designed solely to help design and create Celtic Knots.	92	{linux}	https://gitlab.com/mattia.basaglia/Knotter	\N	13	approved	2026-01-17 17:04:29.092603	\N	\N	Open Source	\N	https://knotter.mattbas.org/Knotter	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
617	KolourPaint	KolourPaint is a simple painting program to quickly create raster images.	92	{linux}	https://invent.kde.org/graphics/kolourpaint	\N	13	approved	2026-01-17 17:04:29.093298	\N	\N	Open Source	\N	https://apps.kde.org/kolourpaint/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
618	Lunacy	Free design software that keeps your flow with AI tools and built-in graphics	92	{linux}	https://icons8.com/lunacy/	\N	13	approved	2026-01-17 17:04:29.094454	\N	\N	Freeware	\N	https://icons8.com/lunacy/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
619	Mypaint	) - Mypaint is a paint program for use with graphics tablets.	92	{linux}	https://github.com/mypaint/mypaint	\N	13	approved	2026-01-17 17:04:29.095121	\N	\N	Open Source	\N	https://github.com/mypaint/mypaint	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
620	Open DVD Producer	A modern, open source cross platform software to produce DVD images.	92	{linux}	https://gitlab.com/jonata/opendvdproducer	\N	13	approved	2026-01-17 17:04:29.095775	\N	\N	Open Source	\N	https://opendvdproducer.jonata.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
621	Pinta	Pinta is a free, open source program for drawing and image editing.	92	{linux}	https://www.pinta-project.com/howto/contribute	\N	13	approved	2026-01-17 17:04:29.096426	\N	\N	Open Source	\N	https://www.pinta-project.com	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
622	Pixelorama	A free & open-source 2D sprite editor, made with the Godot Engine!	92	{linux}	https://github.com/Orama-Interactive/Pixelorama	\N	13	approved	2026-01-17 17:04:29.097058	\N	\N	Open Source	\N	https://orama-interactive.itch.io/pixelorama	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
623	StopMotion	Linux Stopmotion is a Free Open Source application to create stop-motion animations. It helps you capture and edit the frames of your animation and export them as a single file.	92	{linux}	https://launchpad.net/lsm	\N	13	approved	2026-01-17 17:04:29.097692	\N	\N	Open Source	\N	http://linuxstopmotion.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
624	Sweet Home 3D	House interior and exterior designer with 3D preview, free model database, virtual visits and useful repository of plugins.	92	{linux}	https://sourceforge.net/projects/sweethome3d/	\N	13	approved	2026-01-17 17:04:29.09832	\N	\N	Open Source	\N	http://www.sweethome3d.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
625	Synfig Studio	Open-source 2D animation software.	92	{linux}	https://github.com/synfig/synfig	\N	13	approved	2026-01-17 17:04:29.098903	\N	\N	Open Source	\N	https://www.synfig.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
626	Scan Tailor	Scan Tailor is an interactive post-processing tool for scanned pages. For a tutorial on how to use it, consult its [User Guide](https://github.com/scantailor/scantailor/wiki/User-Guide).	92	{linux}	https://github.com/scantailor/scantailor	\N	13	approved	2026-01-17 17:04:29.099487	\N	\N	Open Source	\N	https://scantailor.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
627	Skanpage	Simple multi-page document scanning application.	92	{linux}	https://invent.kde.org/utilities/skanpage	\N	13	approved	2026-01-17 17:04:29.100076	\N	\N	Open Source	\N	https://apps.kde.org/skanpage/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
628	Vectr	Vectr is a free graphics software used to create vector graphics easily and intuitively. It's a simple yet powerful web and desktop cross-platform tool to bring your designs into reality.	92	{linux}	https://vectr.com/	\N	13	approved	2026-01-17 17:04:29.100702	\N	\N	Freeware	\N	https://vectr.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
629	Xara Extreme	Xara Xtreme for Linux is a powerful, general purpose graphics program for Unix platforms including Linux, FreeBSD.	92	{linux}	http://www.xaraxtreme.org/Developers/develeopers-source-code-a-building.html	\N	13	approved	2026-01-17 17:04:29.101493	\N	\N	Open Source	\N	http://www.xaraxtreme.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
630	yEd Graph Editor	yEd is a powerful desktop application that can be used to quickly and effectively generate high-quality diagrams. Create diagrams manually, or import your external data for analysis. Our automatic layout algorithms arrange even large data sets with just the press of a button.	92	{linux}	https://www.yworks.com/products/yed	\N	13	approved	2026-01-17 17:04:29.102105	\N	\N	Freeware	\N	https://www.yworks.com/products/yed	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
631	Aftershot	A powerful alternative to Adobe Photoshop.	93	{linux}	https://www.aftershotpro.com/en/products/aftershot/pro/	\N	13	approved	2026-01-17 17:04:29.102721	\N	\N	Commercial	\N	https://www.aftershotpro.com/en/products/aftershot/pro/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
632	Darktable	Darktable is an open source photography workflow application and RAW developer.	93	{linux}	https://github.com/darktable-org/darktable	\N	13	approved	2026-01-17 17:04:29.103325	\N	\N	Open Source	\N	https://www.darktable.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
633	GraphicsMagick	GraphicsMagick is the swiss army knife of image processing.	93	{linux}	https://sourceforge.net/projects/graphicsmagick/	\N	13	approved	2026-01-17 17:04:29.104182	\N	\N	Open Source	\N	http://www.graphicsmagick.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
634	Hugin	An easy to use cross-platform panoramic imaging toolchain based on Panorama Tools.	93	{linux}	https://hugin.sourceforge.io/	\N	13	approved	2026-01-17 17:04:29.10491	\N	\N	Open Source	\N	https://hugin.sourceforge.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
635	ImageMagik	ImageMagick is a suite of command-line utilities for modifying and working with images.	93	{linux}	https://github.com/ImageMagick/ImageMagick	\N	13	approved	2026-01-17 17:04:29.10553	\N	\N	Open Source	\N	https://www.imagemagick.org/script/index.php	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
636	imgp	Blazing fast terminal image resizer and rotator.	93	{linux}	https://github.com/jarun/imgp	\N	13	approved	2026-01-17 17:04:29.106206	\N	\N	Open Source	\N	https://github.com/jarun/imgp	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
637	Luminance HDR	Luminance HDR is an open source graphical user interface application that aims to provide a workflow for HDR imaging.	93	{linux}	https://github.com/LuminanceHDR/LuminanceHDR	\N	13	approved	2026-01-17 17:04:29.106812	\N	\N	Open Source	\N	https://sourceforge.net/projects/qtpfsgui/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
638	Photivo	Photivo is a free and open source (GPL3) photo processor, handles your RAW and bitmap files (TIFF, JPEG, BMP, PNG and many more) in a non-destructive 16 bit processing pipe with gimp workflow integration and batch mode. It is intended to be used in a workflow together with digiKam/F-Spot/Shotwell and Gimp.	93	{linux}	https://github.com/google-code-export/photivo	\N	13	approved	2026-01-17 17:04:29.107413	\N	\N	Open Source	\N	https://photivo.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
639	Piskel	Browser-based editor for animated sprites and pixel art. Available as offline application.	93	{linux}	https://github.com/piskelapp/piskel	\N	13	approved	2026-01-17 17:04:29.108069	\N	\N	Open Source	\N	https://www.piskelapp.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
640	Pixelitor	Pixelitor is a free and open source image editing software that supports layers, layer masks, text layers, filters, multiple undo etc.	93	{linux}	https://github.com/lbalazscs/Pixelitor	\N	13	approved	2026-01-17 17:04:29.10865	\N	\N	Open Source	\N	https://pixelitor.sourceforge.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
641	RawTherapee	A good looking but lesser known photo editing app.	93	{linux}	https://github.com/Beep6581/RawTherapee	\N	13	approved	2026-01-17 17:04:29.109359	\N	\N	Open Source	\N	https://rawtherapee.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
642	Aspect	Photo organization application with support for peer-to-peer based synchronization across devices.	94	{linux}	https://aspect.bildhuus.com/	\N	13	approved	2026-01-17 17:04:29.110017	\N	\N	Freeware	\N	https://aspect.bildhuus.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
643	Digikam	DigiKam is an advanced digital photo management application for Linux.	94	{linux}	https://invent.kde.org/graphics/digikam	\N	13	approved	2026-01-17 17:04:29.110616	\N	\N	Open Source	\N	https://www.digikam.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
644	ExifCleaner	Remove image metadata with drag and drop. Supports multi-core batch processing.	94	{linux}	https://github.com/szTheory/exifcleaner	\N	13	approved	2026-01-17 17:04:29.11124	\N	\N	Open Source	\N	https://exifcleaner.com	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
645	Feh	Lightweight and fast image viewer.	94	{linux}	https://git.finalrewind.org/feh	\N	13	approved	2026-01-17 17:04:29.111863	\N	\N	Open Source	\N	https://feh.finalrewind.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
646	Fotocx	Fotocx is a free open source Linux program for image editing and collection management.	94	{linux}	http://www.kornelix.net/downloads/downloads.html	\N	13	approved	2026-01-17 17:04:29.112492	\N	\N	Open Source	\N	https://www.kornelix.net/fotocx/fotocx.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
647	geeqie	Image viewer / photo collection browser. Successor of GQview.	94	{linux}	https://github.com/BestImageViewer/geeqie	\N	13	approved	2026-01-17 17:04:29.113119	\N	\N	Open Source	\N	http://www.geeqie.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
648	gThumb	gThumb is an image viewer and browser (it also includes an importer tool for transferring photos from cameras).	94	{linux}	https://gitlab.gnome.org/GNOME/gthumb/	\N	13	approved	2026-01-17 17:04:29.113728	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Gthumb	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
649	gwenview	Simple yet powerful image viewer and management for KDE desktops.	94	{linux}	https://invent.kde.org/graphics/gwenview	\N	13	approved	2026-01-17 17:04:29.114357	\N	\N	Open Source	\N	https://apps.kde.org/gwenview/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
650	Imagine	An open source image optimizer that can shrink the size of images with a minimal loss of quality.	94	{linux}	https://github.com/meowtec/Imagine	\N	13	approved	2026-01-17 17:04:29.114937	\N	\N	Open Source	\N	https://github.com/meowtec/Imagine	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
651	nomacs	nomacs is an image viewer that is able to view nearly any image format, and has powerful renaming and sorting tools.	94	{linux}	https://github.com/nomacs/nomacs/tree/master	\N	13	approved	2026-01-17 17:04:29.115532	\N	\N	Open Source	\N	https://nomacs.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
652	Ojo	A fast and pretty image viewer.	94	{linux}	https://github.com/peterlevi/ojo	\N	13	approved	2026-01-17 17:04:29.116165	\N	\N	Open Source	\N	https://github.com/peterlevi/ojo	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
653	Phockup	Command line sorting tool to organize photos and videos from your camera in folders by year, month and day.	94	{linux}	https://github.com/ivandokov/phockup	\N	13	approved	2026-01-17 17:04:29.116772	\N	\N	Open Source	\N	https://github.com/ivandokov/phockup	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
654	Photonic	Phototonic is image viewer and organizer.	94	{linux}	https://github.com/oferkv/phototonic	\N	13	approved	2026-01-17 17:04:29.117358	\N	\N	Open Source	\N	https://github.com/oferkv/phototonic	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
655	quickviewer	Very fast image/comic viewer by using OpenGL.	94	{linux}	https://github.com/kanryu/quickviewer	\N	13	approved	2026-01-17 17:04:29.117991	\N	\N	Open Source	\N	https://kanryu.github.io/quickviewer/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
656	rclip	AI-Powered Command-Line Photo Search Tool.	94	{linux}	https://github.com/yurijmikhalevich/rclip	\N	13	approved	2026-01-17 17:04:29.11901	\N	\N	Open Source	\N	https://github.com/yurijmikhalevich/rclip	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
657	Shotwell	Shotwell is a photo manager for GNOME.	94	{linux}	https://gitlab.gnome.org/GNOME/shotwell	\N	13	approved	2026-01-17 17:04:29.1196	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Shotwell	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
658	Handbrake	HandBrake is a tool for converting video from nearly any format to a selection of modern, widely supported codecs.	82	{linux}	https://github.com/HandBrake/HandBrake	\N	13	approved	2026-01-17 17:04:29.120632	\N	\N	Open Source	\N	https://handbrake.fr/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
659	PhotoGIMP	A patch for optimizing GIMP 2.10+ for Adobe Photoshop users.	82	{linux}	https://github.com/Diolinux/PhotoGIMP	\N	13	approved	2026-01-17 17:04:29.121355	\N	\N	Open Source	\N	https://github.com/Diolinux/PhotoGIMP	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
660	Photoshop CCv19	Photoshop CC v19 installer for Gnu/Linux.	82	{linux}	https://github.com/Gictorbit/photoshopCClinux	\N	13	approved	2026-01-17 17:04:29.12198	\N	\N	Open Source	\N	https://github.com/Gictorbit/photoshopCClinux	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1640	bcachefs	Linux filesystem	185	{Linux,Mac,Windows}	https://www.patreon.com/bcachefs	\N	1	approved	2026-01-18 09:29:54.647063	\N	\N	Open Source	\N	\N	\N	software
661	Photoshop-CC2022-Linux	Installer for Photoshop CC 2022 on linux with a GUI.	82	{linux}	https://github.com/MiMillieuh/Photoshop-CC2022-Linux	\N	13	approved	2026-01-17 17:04:29.122617	\N	\N	Open Source	\N	https://github.com/MiMillieuh/Photoshop-CC2022-Linux	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
662	Potrace	Potrace is a tool for tracing a bitmap, which means, transforming a bitmap into a smooth, scalable image.	82	{linux}	https://potrace.sourceforge.net/#downloading	\N	13	approved	2026-01-17 17:04:29.123277	\N	\N	Open Source	\N	https://potrace.sourceforge.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
663	Radiance	Radiance - A Validated Lighting Simulation Tool.	82	{linux}	https://www.radiance-online.org/download-install/radiance-source-code	\N	13	approved	2026-01-17 17:04:29.123911	\N	\N	Open Source	\N	https://www.radiance-online.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
665	Avocode	Avocode - Share and inspect Photoshop and Sketch designs in a heart beat.	95	{linux}	https://avocode.com/	\N	13	approved	2026-01-17 17:04:29.125132	\N	\N	Commercial	\N	https://avocode.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
666	asciinema	Terminal session recorder.	96	{linux}	https://github.com/asciinema/asciinema	\N	13	approved	2026-01-17 17:04:29.125748	\N	\N	Open Source	\N	https://asciinema.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
667	Green Recorder	A simple desktop recorder for Linux systems, supports recording audio and video on almost all Linux interfaces and Wayland display server on GNOME session.	96	{linux}	https://github.com/dvershinin/green-recorder	\N	13	approved	2026-01-17 17:04:29.126445	\N	\N	Open Source	\N	https://github.com/dvershinin/green-recorder	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
668	gpu-screen-recorder	CLI screen recorder and replay software that uses hardware acceleration similar to AMD ReLive or Nvidia ShadowPlay.	96	{linux}	https://git.dec05eba.com/gpu-screen-recorder	\N	13	approved	2026-01-17 17:04:29.127098	\N	\N	Open Source	\N	https://git.dec05eba.com/gpu-screen-recorder	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
669	gpu-screen-recorder-git	Official GTK-based frontend for the CLI tool `gpu-screen-recorder`.	96	{linux}	https://git.dec05eba.com/gpu-screen-recorder-gtk	\N	13	approved	2026-01-17 17:04:29.12771	\N	\N	Open Source	\N	https://git.dec05eba.com/gpu-screen-recorder-gtk	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
670	Kazam	An easy to use and very intuitive screen recording program that will capture the content of your screen and record a video file that can be played by any video player that supports VP8/WebM video format.	96	{linux}	https://code.launchpad.net/kazam	\N	13	approved	2026-01-17 17:04:29.128445	\N	\N	Open Source	\N	https://launchpad.net/kazam	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
671	Kooha	A simple screen recorder written with GTK. It allows you to record your screen and also audio from your microphone or desktop.	96	{linux}	https://github.com/SeaDve/Kooha	\N	13	approved	2026-01-17 17:04:29.129084	\N	\N	Open Source	\N	https://flathub.org/apps/io.github.seadve.Kooha	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
672	menyoki	Screen{shot,cast} and perform ImageOps on the command line.	96	{linux}	https://github.com/orhun/menyoki	\N	13	approved	2026-01-17 17:04:29.129729	\N	\N	Open Source	\N	https://menyoki.cli.rs/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
673	Peek	Simple animated GIF screen recorder with an easy to use interface.	96	{linux}	https://github.com/phw/peek	\N	13	approved	2026-01-17 17:04:29.130637	\N	\N	Open Source	\N	https://github.com/phw/peek	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
674	Silentcast	Silentcast can create MKV screencasts and also output to an animated GIF.	96	{linux}	https://github.com/colinkeenan/silentcast	\N	13	approved	2026-01-17 17:04:29.131236	\N	\N	Open Source	\N	https://github.com/colinkeenan/silentcast	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
675	SimpleScreenRecorder	SimpleScreenRecorder is a feature-rich screen recorder that supports X11 and OpenGL. It has a Qt-based graphical user interface.	96	{linux}	https://github.com/MaartenBaert/ssr	\N	13	approved	2026-01-17 17:04:29.131819	\N	\N	Open Source	\N	https://www.maartenbaert.be/simplescreenrecorder/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
676	Vokoscreen	A free, multilingual and easy to use screencast recorder with audio for Linux. It has many features.	96	{linux}	https://github.com/vkohaupt/vokoscreen	\N	13	approved	2026-01-17 17:04:29.132419	\N	\N	Open Source	\N	https://linuxecke.volkoh.de/vokoscreen/vokoscreen.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
682	Boatswain	Control your Elgato Stream Deck devices.	98	{linux}	https://gitlab.gnome.org/World/boatswain	\N	13	approved	2026-01-17 17:04:29.136085	\N	\N	Open Source	\N	https://apps.gnome.org/Boatswain/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1641	Compiler Explorer	Online decompiler and compiler explorer	185	{Web}	https://www.patreon.com/mattgodbolt	\N	1	approved	2026-01-18 09:29:54.650249	\N	\N	Open Source	\N	\N	\N	software
679	ScreenCloud	ScreenCloud is an easy to use screenshot sharing tool consisting of a cross-platform client and a sharing website.	295	{linux}	https://github.com/olav-st/screencloud	\N	13	approved	2026-01-17 17:04:29.134196	\N	\N	Open Source	\N	https://screencloud.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
680	Shutter	Shutter is a feature-rich screenshot program for Linux based operating systems such as Ubuntu.	295	{linux}	https://github.com/shutter-project/shutter	\N	13	approved	2026-01-17 17:04:29.134784	\N	\N	Open Source	\N	https://shutter-project.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
681	Spectacle	Spectacle is a simple application for capturing desktop screenshots.	295	{linux}	https://invent.kde.org/graphics/spectacle	\N	13	approved	2026-01-17 17:04:29.13541	\N	\N	Open Source	\N	https://apps.kde.org/spectacle/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
664	Rapid Photo Downloader	Rapid Photo Downloader makes it easy to import photos from a camera or smartphone.	82	{linux}	https://launchpad.net/rapid/	\N	13	approved	2026-01-17 17:04:29.124519	\N	\N	Open Source	\N	https://damonlynch.net/rapid/download.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
683	ReadyMedia	Formerly known as **MiniDLNA**, ReadyMedia is a is a simple, lightweight media server software, with the aim of being fully compliant with DLNA/UPnP-AV clients. The MiniDNLA daemon serves media files (music, pictures, and video) to clients on a network such as smartphones, portable media players, televisions, other computers and some gaming systems.	98	{linux}	https://sourceforge.net/projects/minidlna	\N	13	approved	2026-01-17 17:04:29.13691	\N	\N	Open Source	\N	https://minidlna.sourceforge.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
684	VPupPr	VTuber application made with Godot 3.4.	98	{linux}	https://github.com/virtual-puppet-project/vpuppr	\N	13	approved	2026-01-17 17:04:29.13761	\N	\N	Open Source	\N	https://github.com/virtual-puppet-project/vpuppr	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
685	Cinelerra-cv	Professional video editing and compositing environment.	99	{linux}	https://github.com/cinelerra-cv-team/cinelerra-cv	\N	13	approved	2026-01-17 17:04:29.138265	\N	\N	Open Source	\N	http://cinelerra-cv.wikidot.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
686	Davinci Resolve	Revolutionary tools for editing, color correction, audio post and now visual effects, all in a single application.	99	{linux}	https://www.blackmagicdesign.com/products/davinciresolve/	\N	13	approved	2026-01-17 17:04:29.139021	\N	\N	Commercial	\N	https://www.blackmagicdesign.com/products/davinciresolve/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
687	Flowblade	A multitrack non-linear video editor for Linux.	99	{linux}	https://github.com/jliljebl/flowblade	\N	13	approved	2026-01-17 17:04:29.139713	\N	\N	Open Source	\N	https://github.com/jliljebl/flowblade	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
688	Kdenlive	Kdenlive is a Non-Linear Video Editor, which is much more powerful than beginners’ (linear) editors.	99	{linux}	https://invent.kde.org/multimedia/kdenlive	\N	13	approved	2026-01-17 17:04:29.140342	\N	\N	Open Source	\N	https://kdenlive.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
689	Lightworks	Professional non-linear video editing program with a free version available.	99	{linux}	https://www.lwks.com/	\N	13	approved	2026-01-17 17:04:29.141003	\N	\N	Commercial	\N	https://www.lwks.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
690	Olive	Olive is a free non-linear video editor aiming to provide a fully-featured alternative to high-end professional video editing software.	99	{linux}	https://github.com/olive-editor/olive	\N	13	approved	2026-01-17 17:04:29.141617	\N	\N	Open Source	\N	https://www.olivevideoeditor.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
691	OpenShot	OpenShot is a free, simple-to-use, feature-rich video editor for Linux.	99	{linux}	https://github.com/OpenShot/openshot-qt	\N	13	approved	2026-01-17 17:04:29.142275	\N	\N	Open Source	\N	https://www.openshot.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
692	Pitivi	A free video editor with a beautiful and intuitive user interface, a clean codebase and a fantastic community.	99	{linux}	https://gitlab.gnome.org/GNOME/pitivi	\N	13	approved	2026-01-17 17:04:29.142855	\N	\N	Open Source	\N	https://www.pitivi.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
693	Vidcutter	Cross-platform Qt5 based app for quick and easy video trimming/splitting and merging/joining for simple quick edits.	99	{linux}	https://github.com/ozmartian/vidcutter	\N	13	approved	2026-01-17 17:04:29.143712	\N	\N	Open Source	\N	https://github.com/ozmartian/vidcutter	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
694	Brave	Brave is a fast, good desktop browser for macOS, Windows, and Linux.	100	{linux}	https://github.com/brave/brave-browser	\N	13	approved	2026-01-17 17:04:29.144448	\N	\N	Open Source	\N	https://brave.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
695	Chrome	A popular Web Browser with a lot of plugins/apps.	100	{linux}	https://www.google.com/chrome/browser/desktop/index.html	\N	13	approved	2026-01-17 17:04:29.145512	\N	\N	Freeware	\N	https://www.google.com/chrome/browser/desktop/index.html	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
696	Chromium	Chromium is an open-source browser project that aims to build a safer, faster, and more stable way for all users to experience the web.	100	{linux}	https://chromium.googlesource.com/chromium/src.git	\N	13	approved	2026-01-17 17:04:29.146218	\N	\N	Open Source	\N	https://www.chromium.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
697	Falkon	Falkon aims to be a lightweight web browser available through all major platforms.	100	{linux}	https://invent.kde.org/network/falkon	\N	13	approved	2026-01-17 17:04:29.147219	\N	\N	Open Source	\N	https://www.falkon.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
698	Firefox	A popular Web Browser with a lot of plugins/apps.	100	{linux}	https://hg.mozilla.org/mozilla-central/	\N	13	approved	2026-01-17 17:04:29.147828	\N	\N	Open Source	\N	https://www.mozilla.org/en-US/firefox/new/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
699	GNOME Web	GNOME Web (codename: Epiphany) is a GNOME web browser based on	100	{linux}	https://gitlab.gnome.org/GNOME/epiphany	\N	13	approved	2026-01-17 17:04:29.148422	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Web	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
700	IceCat	GNU version of Firefox built for privacy, using only free software and free of trademarks.	100	{linux}	https://git.savannah.gnu.org/cgit/gnuzilla.git	\N	13	approved	2026-01-17 17:04:29.149038	\N	\N	Open Source	\N	https://www.gnu.org/software/gnuzilla/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
701	LibreWolf	Fork of Firefox, with the primary goals of privacy, security and user freedom.	100	{linux}	https://gitlab.com/librewolf-community	\N	13	approved	2026-01-17 17:04:29.14964	\N	\N	Open Source	\N	https://librewolf.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
702	Midori	A lightweight free browser that runs well on low spec systems.	100	{linux}	https://gitlab.com/midori-web/midori-desktop	\N	13	approved	2026-01-17 17:04:29.150565	\N	\N	Open Source	\N	https://astian.org/midori-browser/download/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
703	Min	A smarter, faster web browser.	100	{linux}	https://github.com/minbrowser/min	\N	13	approved	2026-01-17 17:04:29.151233	\N	\N	Open Source	\N	https://minbrowser.org/min/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
704	Mullvad Browser	The Mullvad Browser is a privacy-focused web browser developed in a collaboration between Mullvad VPN and the Tor Project. It’s designed to minimize tracking and fingerprinting.	100	{linux}	https://gitlab.torproject.org/tpo/applications/mullvad-browser/	\N	13	approved	2026-01-17 17:04:29.151877	\N	\N	Open Source	\N	https://mullvad.net/en/browser	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
706	QuteBrowser	A keyboard-driven, vim-like browser based on PyQt5.	100	{linux}	https://github.com/qutebrowser/qutebrowser	\N	13	approved	2026-01-17 17:04:29.153153	\N	\N	Open Source	\N	https://www.qutebrowser.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
707	Tor	Tor is free software and an open network that helps you defend against traffic analysis, a form of network surveillance that threatens personal freedom and privacy.	100	{linux}	https://gitlab.torproject.org/tpo/core/tor/	\N	13	approved	2026-01-17 17:04:29.153891	\N	\N	Open Source	\N	https://www.torproject.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
708	ungoogled-chromium	ungoogled-chromium is Google Chromium, sans dependency on Google web services.	100	{linux}	https://github.com/Eloston/ungoogled-chromium	\N	13	approved	2026-01-17 17:04:29.154534	\N	\N	Open Source	\N	https://github.com/Eloston/ungoogled-chromium	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
709	Vivaldi	A new and rising browser with a lot of customizations.	100	{linux}	https://vivaldi.com	\N	13	approved	2026-01-17 17:04:29.155152	\N	\N	Freeware	\N	https://vivaldi.com	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
710	Waterfox	Fork of Firefox. Waterfox gives you a sane way to browse the web. Built with you, the user, in mind.	100	{linux}	https://github.com/WaterfoxCo/Waterfox	\N	13	approved	2026-01-17 17:04:29.156196	\N	\N	Open Source	\N	https://www.waterfox.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
711	Wavebox	A feature-rich Chromium browser that's built for productive working across Google Workspaces, Microsoft Teams, ClickUp, Monday, Atlassian, Asana, AirTable, Slack, and every other web app you use to get work done.	100	{linux}	https://wavebox.io	\N	13	approved	2026-01-17 17:04:29.156989	\N	\N	Freeware	\N	https://wavebox.io	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
712	Yandex	Fast and convenient browser.	100	{linux}	https://browser.yandex.com	\N	13	approved	2026-01-17 17:04:29.157636	\N	\N	Freeware	\N	https://browser.yandex.com	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
713	Clipgrab	A friendly downloader for YouTube and other sites.	101	{linux}	https://clipgrab.org/	\N	13	approved	2026-01-17 17:04:29.15833	\N	\N	Freeware	\N	https://clipgrab.org/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
714	Parabolic	Download web video and audio.	101	{linux}	https://github.com/NickvisionApps/Parabolic	\N	13	approved	2026-01-17 17:04:29.158951	\N	\N	Open Source	\N	https://github.com/NickvisionApps/Parabolic	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
715	spotDL	Download your Spotify playlists and songs along with album art and metadata (from YouTube if a match is found).	101	{linux}	https://github.com/spotDL/spotify-downloader	\N	13	approved	2026-01-17 17:04:29.159676	\N	\N	Open Source	\N	https://github.com/spotDL/spotify-downloader	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
716	Video Downloader	Download videos from websites like YouTube and many others (based on yt-dlp).	101	{linux}	https://github.com/Unrud/video-downloader	\N	13	approved	2026-01-17 17:04:29.160409	\N	\N	Open Source	\N	https://github.com/Unrud/video-downloader	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
717	ytDownloader	A cross-platform GUI for yt-dlp with advanced options and a modern UI.	101	{linux}	https://github.com/aandrew-me/ytdownloader/	\N	13	approved	2026-01-17 17:04:29.16118	\N	\N	Open Source	\N	https://ytdn.netlify.app/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
718	Zerotier	Zerotier is a program that creates a Virtual Network for only your devices with end to end encryption over the internet. By default Zerotier will manage your virtual network but you can switch to a self-managed network if you prefer.	101	{linux}	https://github.com/zerotier/ZeroTierOne	\N	13	approved	2026-01-17 17:04:29.161829	\N	\N	Open Source	\N	https://my.zerotier.com	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
719	Akregator	A KDE Feed Reader.	102	{linux}	https://invent.kde.org/pim/akregator	\N	13	approved	2026-01-17 17:04:29.162529	\N	\N	Open Source	\N	https://apps.kde.org/akregator/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
720	Choqok	Choqok is a Qt5 client for Twitter, GNU Social, Friendica and Pump.IO.	102	{linux}	https://invent.kde.org/network/choqok	\N	13	approved	2026-01-17 17:04:29.163151	\N	\N	Open Source	\N	https://apps.kde.org/choqok/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
721	FeedTheMonkey	FeedTheMonkey is a desktop client for TinyTinyRSS.	102	{linux}	https://github.com/jeena/FeedTheMonkey	\N	13	approved	2026-01-17 17:04:29.163781	\N	\N	Open Source	\N	https://github.com/jeena/FeedTheMonkey	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
722	Fluent Reader	Modern desktop RSS reader built with Electron, React, and Fluent UI.	102	{linux}	https://github.com/yang991178/fluent-reader	\N	13	approved	2026-01-17 17:04:29.164379	\N	\N	Open Source	\N	https://hyliu.me/fluent-reader/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
723	FreeTube	FreeTube is a YouTube client for Windows, Mac, and Linux built around using YouTube more privately.	102	{linux}	https://github.com/FreeTubeApp/FreeTube	\N	13	approved	2026-01-17 17:04:29.165014	\N	\N	Open Source	\N	https://freetubeapp.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
724	Kaku	An open source youtube music player for Ubuntu.	102	{linux}	https://github.com/EragonJ/Kaku	\N	13	approved	2026-01-17 17:04:29.165671	\N	\N	Open Source	\N	https://kaku.rocks/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
725	NewsFlash	NewsFlash is a program designed to complement an already existing web-based RSS reader account.	102	{linux}	https://gitlab.com/news-flash/news_flash_gtk	\N	13	approved	2026-01-17 17:04:29.166302	\N	\N	Open Source	\N	https://apps.gnome.org/app/io.gitlab.news_flash.NewsFlash/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
726	PlasmaTube	Kirigami-based YouTube client for Linux Desktop and Mobile with built-in ad-blocking and privacy features.	102	{linux}	https://invent.kde.org/multimedia/plasmatube	\N	13	approved	2026-01-17 17:04:29.166995	\N	\N	Open Source	\N	https://apps.kde.org/plasmatube/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
727	Popcorn Time	Watch torrent movies instantly.	102	{linux}	https://github.com/popcorn-official/popcorn-desktop	\N	13	approved	2026-01-17 17:04:29.167736	\N	\N	Open Source	\N	https://github.com/popcorn-official/popcorn-desktop	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
728	RSS Guard	Feed reader which supports RSS/ATOM/JSON and many web-based feed services.	102	{linux}	https://github.com/martinrotter/rssguard	\N	13	approved	2026-01-17 17:04:29.16851	\N	\N	Open Source	\N	https://github.com/martinrotter/rssguard	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
729	Streamlink Twitch GUI	A multi platform Twitch.tv browser for [Streamlink](https://streamlink.github.io/).	102	{linux}	https://github.com/streamlink/streamlink-twitch-gui	\N	13	approved	2026-01-17 17:04:29.169183	\N	\N	Open Source	\N	https://streamlink.github.io/streamlink-twitch-gui/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
730	ytfzf	Terminal Youtube/Odysee client with thumbnails.	102	{linux}	https://github.com/pystardust/ytfzf	\N	13	approved	2026-01-17 17:04:29.169901	\N	\N	Open Source	\N	https://github.com/pystardust/ytfzf	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
731	GnuCash	GnuCash is a free software accounting program that implements a double-entry bookkeeping system. It was initially aimed at developing capabilities similar to Intuit, Inc.'s Quicken application, but also has features for small business accounting.	103	{linux}	https://github.com/Gnucash/	\N	13	approved	2026-01-17 17:04:29.170603	\N	\N	Open Source	\N	https://www.gnucash.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
732	hledger	Easy-to-use command-line/curses/web plaintext accounting tool.	103	{linux}	https://github.com/simonmichael/hledger	\N	13	approved	2026-01-17 17:04:29.17184	\N	\N	Open Source	\N	https://hledger.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
733	HomeBank	HomeBank is a free software that will assist you to manage your personal accounting.	103	{linux}	https://code.launchpad.net/homebank	\N	13	approved	2026-01-17 17:04:29.173166	\N	\N	Open Source	\N	https://homebank.free.fr/en/index.php	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
734	KMyMoney	KMyMoney is the personal finance manager by KDE. Its operation is similar to Microsoft Money and Quicken.	103	{linux}	https://invent.kde.org/office/kmymoney	\N	13	approved	2026-01-17 17:04:29.173883	\N	\N	Open Source	\N	https://kmymoney.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
735	Skrooge	A personal finances manager, powered by KDE.	103	{linux}	https://invent.kde.org/office/skrooge	\N	13	approved	2026-01-17 17:04:29.174555	\N	\N	Open Source	\N	https://skrooge.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
738	GNOME LaTeX	GNOME LaTeX is a LaTeX editor for the GNOME desktop.	105	{linux}	https://gitlab.gnome.org/swilmet/gnome-latex	\N	13	approved	2026-01-17 17:04:29.177382	\N	\N	Open Source	\N	https://gitlab.gnome.org/swilmet/gnome-latex	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
739	Gummi	Simple latex editor with templates, spell check, and wizards.	105	{linux}	https://github.com/alexandervdm/gummi	\N	13	approved	2026-01-17 17:04:29.178124	\N	\N	Open Source	\N	https://github.com/alexandervdm/gummi	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
740	LyX	Mature document editor that renders into LaTeX.	105	{linux}	https://www.lyx.org/trac/browser	\N	13	approved	2026-01-17 17:04:29.178771	\N	\N	Open Source	\N	https://www.lyx.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
741	TexLive	TeX Live is an easy way to get up and running with the TeX document production system.	105	{linux}	https://www.tug.org/texlive/build.html	\N	13	approved	2026-01-17 17:04:29.179375	\N	\N	Open Source	\N	https://www.tug.org/texlive/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
742	TeXmacs	Free scientific text editor, inspired by TeX and GNU Emacs. WYSIWYG editor and CAS-interface.	105	{linux}	https://savannah.gnu.org/projects/texmacs	\N	13	approved	2026-01-17 17:04:29.180056	\N	\N	Open Source	\N	http://www.texmacs.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
743	Texmaker	Free cross-platform LaTeX editor.	105	{linux}	https://www.xm1math.net/texmaker/download.html	\N	13	approved	2026-01-17 17:04:29.180665	\N	\N	Open Source	\N	https://www.xm1math.net/texmaker/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
744	TeXstudio	TeXstudio's goal is to make writing LaTeX documents as easy and comfortable as possible.	105	{linux}	https://github.com/texstudio-org/texstudio	\N	13	approved	2026-01-17 17:04:29.18125	\N	\N	Open Source	\N	https://www.texstudio.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
745	TeXworks	TeXworks is an environment for authoring TeX (LaTeX, ConTeXt, etc) documents, with a Unicode-based, TeX-aware editor, integrated PDF viewer, and a clean, simple interface accessible to casual and non-technical users.	105	{linux}	https://github.com/TeXworks/texworks	\N	13	approved	2026-01-17 17:04:29.181897	\N	\N	Open Source	\N	https://www.tug.org/texworks/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
746	Ghost Writer	A distraction-free Markdown editor for Windows and Linux.	106	{linux}	https://github.com/wereturtle/ghostwriter	\N	13	approved	2026-01-17 17:04:29.182526	\N	\N	Open Source	\N	https://ghostwriter.kde.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
747	Marker	Marker is a markdown editor for linux made with GTK+-3.0.	106	{linux}	https://github.com/fabiocolacio/Marker	\N	13	approved	2026-01-17 17:04:29.183228	\N	\N	Open Source	\N	https://github.com/fabiocolacio/Marker	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
748	MarkText	MarkText is a free and open-source realtime preview markdown editor which support both CommonMark Spec and GitHub Flavored Markdown Spec. It is a concise text editor, dedicated to improving your writing efficiency.	106	{linux}	https://github.com/marktext/marktext	\N	13	approved	2026-01-17 17:04:29.183852	\N	\N	Open Source	\N	https://github.com/marktext/marktext	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
749	Remarkable	A capable markdown editor that uses a variant of GitHub Flavored Markdown (GFM).	106	{linux}	https://github.com/jamiemcg/remarkable	\N	13	approved	2026-01-17 17:04:29.184471	\N	\N	Open Source	\N	https://remarkableapp.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
751	Typora	A Minimal markdown editor.	106	{linux}	https://typora.io/	\N	13	approved	2026-01-17 17:04:29.185733	\N	\N	Freeware	\N	https://typora.io/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
737	WPS office	A popular office suite in China, but is fully translated and functions well in English.	267	{linux}	https://www.wps.com/office/linux/	\N	13	approved	2026-01-17 17:04:29.176573	\N	\N	Freeware	\N	https://www.wps.com/office/linux/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
750	Retext	A Simple but powerful editor for Markdown and reStructuredText.	106	{linux}	https://github.com/retext-project/retext	\N	13	approved	2026-01-17 17:04:29.185073	\N	\N	Open Source	\N	https://github.com/retext-project/retext	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
752	Bibisco	A novel writing software with focus on ideas and characters.	107	{linux}	https://github.com/andreafeccomandi/bibisco	\N	13	approved	2026-01-17 17:04:29.186364	\N	\N	Open Source	\N	https://www.bibisco.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
753	Manuskript	Manuskript is a perfect tool for those writer who like to organize and plan everything before writing.	107	{linux}	https://github.com/olivierkes/manuskript	\N	13	approved	2026-01-17 17:04:29.187256	\N	\N	Open Source	\N	https://www.theologeek.ch/manuskript/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
754	Skribisto	Software for writers	107	{linux}	https://github.com/jacquetc/skribisto	\N	13	approved	2026-01-17 17:04:29.187852	\N	\N	Open Source	\N	https://www.skribisto.eu	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
755	Scribus	Scribus is a desktop publishing application designed for layout, typesetting, and preparation of files for professional-quality image-setting equipment. It can also create animated and interactive PDF presentations and forms.	107	{linux}	https://github.com/scribusproject/scribus	\N	13	approved	2026-01-17 17:04:29.188436	\N	\N	Open Source	\N	https://www.scribus.net/downloads/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
756	Trelby	Trelby is simple, fast and elegantly laid out to make screenwriting simple.	107	{linux}	https://github.com/trelby/trelby	\N	13	approved	2026-01-17 17:04:29.189061	\N	\N	Open Source	\N	https://www.trelby.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
757	Actiona	An utility for task automation Ubuntu/Linux. (Previously Actionaz)	108	{linux}	https://github.com/Jmgr/actiona	\N	13	approved	2026-01-17 17:04:29.189672	\N	\N	Open Source	\N	https://wiki.actiona.tools/doku.php?id=:en:start	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
758	Autokey	A desktop automation utility for Linux allows you to manage collection of scripts and phrases, and assign abbreviations and hotkeys to these.	108	{linux}	https://github.com/autokey/autokey	\N	13	approved	2026-01-17 17:04:29.190357	\N	\N	Open Source	\N	https://github.com/autokey/autokey	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
759	Blanket	Improve focus and increase your productivity by listening to different sounds.	108	{linux}	https://github.com/rafaelmardojai/blanket	\N	13	approved	2026-01-17 17:04:29.190977	\N	\N	Open Source	\N	https://apps.gnome.org/app/com.rafaelmardojai.Blanket/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
760	Caffeine	Prevents Ubuntu from automatically going to sleep.	108	{linux}	https://code.launchpad.net/caffeine	\N	13	approved	2026-01-17 17:04:29.191643	\N	\N	Open Source	\N	https://launchpad.net/caffeine	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
761	espanso	Cross-platform Text Expander written in Rust.	108	{linux}	https://github.com/federico-terzi/espanso	\N	13	approved	2026-01-17 17:04:29.192269	\N	\N	Open Source	\N	https://espanso.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
762	Max Auto Clicker	Automate your mouse clicks easily with this awesome cross-platform application (for Windows and Linux Desktops).	108	{linux}	https://github.com/mautosoft/maxautoclicker/	\N	13	approved	2026-01-17 17:04:29.19295	\N	\N	Open Source	\N	https://maxautoclicker.blogspot.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
763	XClicker	A blazing fast gui autoclicker for linux.	108	{linux}	https://github.com/robiot/xclicker	\N	13	approved	2026-01-17 17:04:29.193684	\N	\N	Open Source	\N	https://xclicker.xyz/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
764	Cairo-Dock	Cairo-Dock is a desktop interface that takes the shape of docks, desklets, panel, etc.	109	{linux}	https://github.com/Cairo-Dock	\N	13	approved	2026-01-17 17:04:29.194358	\N	\N	Open Source	\N	https://glx-dock.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
765	Docky	Docky is a full fledged dock application that makes opening common applications and managing windows easier and quicker.	109	{linux}	https://code.launchpad.net/docky	\N	13	approved	2026-01-17 17:04:29.195203	\N	\N	Open Source	\N	https://launchpad.net/docky	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
766	Latte Dock	Latte is a dock based on plasma frameworks that provides an elegant and intuitive experience for your tasks and plasmoids.	109	{linux}	https://invent.kde.org/plasma/latte-dock	\N	13	approved	2026-01-17 17:04:29.195817	\N	\N	Open Source	\N	https://store.kde.org/p/1169519/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
767	Plank	Plank is meant to be the simplest dock of apps on the planet.	109	{linux}	https://git.launchpad.net/plank	\N	13	approved	2026-01-17 17:04:29.196569	\N	\N	Open Source	\N	https://launchpad.net/plank	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
768	Albert	An awesome keyboard launcher for the Linux desktop.	110	{linux}	https://github.com/albertlauncher/albert	\N	13	approved	2026-01-17 17:04:29.197239	\N	\N	Open Source	\N	https://albertlauncher.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
769	ANGRYsearch	Linux file search, instant results as you type.	110	{linux}	https://github.com/DoTheEvo/ANGRYsearch	\N	13	approved	2026-01-17 17:04:29.198295	\N	\N	Open Source	\N	https://github.com/DoTheEvo/ANGRYsearch	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
770	Catfish	Catfish is a versatile file searching tool.	110	{linux}	https://code.launchpad.net/catfish-search	\N	13	approved	2026-01-17 17:04:29.199143	\N	\N	Open Source	\N	https://launchpad.net/catfish-search	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
771	Cerebro	Open-source productivity booster with a brain / MacOS-Spotlight alternative.	110	{linux}	https://github.com/KELiON/cerebro	\N	13	approved	2026-01-17 17:04:29.202327	\N	\N	Open Source	\N	https://cerebroapp.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
772	fsearch	A fast file search utility for Unix-like systems based on GTK+3. Wildcard support, RegEx support, Filter support.	110	{linux}	https://github.com/cboxdoerfer/fsearch	\N	13	approved	2026-01-17 17:04:29.204225	\N	\N	Open Source	\N	https://github.com/cboxdoerfer/fsearch	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
773	Plotinus	A searchable command palette in every modern GTK+ application.	110	{linux}	https://github.com/p-e-w/plotinus	\N	13	approved	2026-01-17 17:04:29.206646	\N	\N	Open Source	\N	https://github.com/p-e-w/plotinus	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
774	Synapse	Synapse is a semantic launcher written in Vala that you can use to start applications as well as find and access relevant documents and files by making use of the Zeitgeist engine.	110	{linux}	https://git.launchpad.net/synapse-project	\N	13	approved	2026-01-17 17:04:29.207544	\N	\N	Open Source	\N	https://launchpad.net/synapse-project	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
775	Ulauncher	Ulauncher is a fast application launcher for Linux. It's is written in Python, using GTK+.	110	{linux}	https://github.com/Ulauncher/Ulauncher/	\N	13	approved	2026-01-17 17:04:29.208183	\N	\N	Open Source	\N	https://ulauncher.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
776	Ambient Noise	An ambient noise generator for Linux.	82	{linux}	https://github.com/costales/anoise	\N	13	approved	2026-01-17 17:04:29.208991	\N	\N	Open Source	\N	https://github.com/costales/anoise	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
777	bcal	Perform storage conversions and calculations.	82	{linux}	https://github.com/jarun/bcal	\N	13	approved	2026-01-17 17:04:29.210589	\N	\N	Open Source	\N	https://github.com/jarun/bcal	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
778	CopyQ	CopyQ is advanced clipboard manager with editing and scripting features.	82	{linux}	https://github.com/hluk/CopyQ	\N	13	approved	2026-01-17 17:04:29.211534	\N	\N	Open Source	\N	https://hluk.github.io/CopyQ/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
779	f.lux	A program that reddens your display to help you sleep better.	82	{linux}	https://justgetflux.com/linux.html	\N	13	approved	2026-01-17 17:04:29.212205	\N	\N	Freeware	\N	https://justgetflux.com/linux.html	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
780	Gpick	Gpick allows you to sample any color from anywhere on your desktop, and it also provides some other advanced features!	82	{linux}	https://github.com/thezbyg/gpick	\N	13	approved	2026-01-17 17:04:29.212963	\N	\N	Open Source	\N	https://www.gpick.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
781	pdd	Tiny date, time diff calculator.	82	{linux}	https://github.com/jarun/pdd	\N	13	approved	2026-01-17 17:04:29.213798	\N	\N	Open Source	\N	https://github.com/jarun/pdd	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
782	Redshift	Redshift adjusts the color temperature of your screen according to your surroundings. This may help your eyes hurt less if you are working in front of the screen at night.	82	{linux}	https://github.com/jonls/redshift	\N	13	approved	2026-01-17 17:04:29.214742	\N	\N	Open Source	\N	http://jonls.dk/redshift/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
783	SpeedCrunch	A nice, open source, high-precision scientific calculator.	82	{linux}	https://www.speedcrunch.org/	\N	13	approved	2026-01-17 17:04:29.21539	\N	\N	Open Source	\N	https://www.speedcrunch.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
784	Undistract me	Notifies you when long-running terminal commands complete.	82	{linux}	https://github.com/jml/undistract-me	\N	13	approved	2026-01-17 17:04:29.215996	\N	\N	Open Source	\N	https://github.com/jml/undistract-me	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
785	Xmind	A mind mapping tool.	82	{linux}	https://xmind.app/	\N	13	approved	2026-01-17 17:04:29.216646	\N	\N	Freeware	\N	https://xmind.app/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
786	AFFiNE	Open source Alternative to Notion and Miro, A multi-platform, open-source, local-first, personal knowledge management(pkm) tool.	111	{linux}	https://github.com/toeverything/AFFiNE	\N	13	approved	2026-01-17 17:04:29.217535	\N	\N	Open Source	\N	https://affine.pro/download	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
787	Anytype	A multi-platform, open-source, local-first, personal knowledge base tool.	111	{linux}	https://github.com/anyproto/anytype-ts	\N	13	approved	2026-01-17 17:04:29.218514	\N	\N	Open Source	\N	https://download.anytype.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
788	Basket Note Pads	This multi-purpose note-taking application helps you to easily take all sort of notes.	111	{linux}	https://basket-notepads.github.io/download.html	\N	13	approved	2026-01-17 17:04:29.219326	\N	\N	Open Source	\N	https://basket-notepads.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
789	Beaver Notes	A multi-platform, open-source, privacy-first, community-driven, note-taking app and personal knowledge manager.	111	{linux}	https://github.com/Daniele-rolli/Beaver-Notes	\N	13	approved	2026-01-17 17:04:29.219945	\N	\N	Open Source	\N	https://beavernotes.com	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
790	Boostnote	Boostnote is an open source note-taking app made for programmers just like you.	111	{linux}	https://github.com/BoostIO/BoostNote-App	\N	13	approved	2026-01-17 17:04:29.2206	\N	\N	Open Source	\N	https://boostnote.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
791	Cherrytree	A hierarchical note taking application, featuring rich text and syntax highlighting, storing data in a single xml or sqlite file.	111	{linux}	https://github.com/giuspen/cherrytree	\N	13	approved	2026-01-17 17:04:29.221192	\N	\N	Open Source	\N	https://www.giuspen.com/cherrytree/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
793	Joplin	A note taking and to-do application with synchronization capabilities for Windows, macOS, Linux, Android and iOS.	111	{linux}	https://github.com/laurent22/joplin	\N	13	approved	2026-01-17 17:04:29.222935	\N	\N	Open Source	\N	https://joplinapp.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
794	Logseq	Logseq is a privacy-first, open-source knowledge base that works on top of local plain-text Markdown and Org-mode files. Use it to write, organize and share your thoughts, keep your to-do list, and build your own digital garden.	111	{linux}	https://github.com/logseq/logseq	\N	13	approved	2026-01-17 17:04:29.223666	\N	\N	Open Source	\N	https://logseq.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
795	Mindforger	Thinking notebook and Markdown editor.	111	{linux}	https://github.com/dvorka/mindforger	\N	13	approved	2026-01-17 17:04:29.224283	\N	\N	Open Source	\N	https://www.mindforger.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
796	NixNote	An open source client for Evernote.	111	{linux}	https://sourceforge.net/p/nevernote/code/ci/master/tree/	\N	13	approved	2026-01-17 17:04:29.224936	\N	\N	Open Source	\N	https://sourceforge.net/projects/nevernote/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
797	Notes	A clean simple note taking app for Linux.	111	{linux}	https://github.com/nuttyartist/notes	\N	13	approved	2026-01-17 17:04:29.228729	\N	\N	Open Source	\N	https://www.get-notes.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
798	Notesnook	A fully open source & end-to-end encrypted note taking alternative to Evernote.	111	{linux}	https://github.com/streetwriters/notesnook	\N	13	approved	2026-01-17 17:04:29.229848	\N	\N	Open Source	\N	https://notesnook.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
799	Obsidian	Obsidian is a powerful knowledge base on top of a local folder of plain text Markdown files.	111	{linux}	https://obsidian.md/	\N	13	approved	2026-01-17 17:04:29.230679	\N	\N	Freeware	\N	https://obsidian.md/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
800	OneNote	Linux Electron OneNote.	111	{linux}	https://github.com/patrikx3/onenote	\N	13	approved	2026-01-17 17:04:29.231497	\N	\N	Open Source	\N	https://www.corifeus.com/onenote	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
801	Org mode	Org mode is for keeping notes, maintaining TODO lists, planning projects, and authoring documents with a fast and effective plain-text system.	111	{linux}	https://orgmode.org/	\N	13	approved	2026-01-17 17:04:29.232474	\N	\N	Open Source	\N	https://orgmode.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
802	Planify	Task manager with Todoist and Nextcloud support designed for GNU/Linux.	111	{linux}	https://github.com/alainm23/planify	\N	13	approved	2026-01-17 17:04:29.233232	\N	\N	Open Source	\N	https://github.com/alainm23/planify	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
803	QOwnNotes	QOwnNotes is a plain-text file notepad and todo-list manager with markdown support and ownCloud / Nextcloud integration.	111	{linux}	https://github.com/pbek/QOwnNotes	\N	13	approved	2026-01-17 17:04:29.233923	\N	\N	Open Source	\N	https://www.qownnotes.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
804	Simplenote	A Cross platform notetaking app and Evernote competitor.	111	{linux}	https://simplenote.com/	\N	13	approved	2026-01-17 17:04:29.234636	\N	\N	Freeware	\N	https://simplenote.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
805	Springseed	Simple and beautiful note taking app for daily user.	111	{linux}	https://github.com/spsdco/notes	\N	13	approved	2026-01-17 17:04:29.235367	\N	\N	Open Source	\N	https://github.com/spsdco/notes	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
806	Standard Notes	Standard Notes is an end-to-end encrypted note-taking app for digitalists and professionals. Capture your notes, files, and life’s work all in one secure place.	111	{linux}	https://github.com/standardnotes/	\N	13	approved	2026-01-17 17:04:29.236054	\N	\N	Open Source	\N	https://standardnotes.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
807	Standard Unix Notes	GPG Encrypted Notes/Notebook manager for BSD/Linux	111	{linux}	https://github.com/Standard-Unix-Notes/unix-notes	\N	13	approved	2026-01-17 17:04:29.236781	\N	\N	Open Source	\N	https://github.com/Standard-Unix-Notes/unix-notes	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
808	Stickynote	Sticky notes on your Linux desktop.	111	{linux}	https://bazaar.launchpad.net/~umang/indicator-stickynotes/trunk/files	\N	13	approved	2026-01-17 17:04:29.237493	\N	\N	Open Source	\N	https://launchpad.net/indicator-stickynotes	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
809	Tomboy	Tomboy is a desktop note-taking application which is simple and easy to use.	111	{linux}	https://github.com/tomboy-notes/tomboy	\N	13	approved	2026-01-17 17:04:29.238331	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Tomboy	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
810	TriliumNext Notes	TriliumNext Notes is a hierarchical note taking application with focus on building large personal knowledge bases.	111	{linux}	https://github.com/TriliumNext/Notes	\N	13	approved	2026-01-17 17:04:29.239038	\N	\N	Open Source	\N	https://github.com/TriliumNext/Notes	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
811	Turtl	The secure, collaborative notebook.	111	{linux}	https://github.com/turtl	\N	13	approved	2026-01-17 17:04:29.239716	\N	\N	Open Source	\N	https://turtlapp.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
812	Tusk	Refined Evernote desktop app.	111	{linux}	https://github.com/klaussinani/tusk	\N	13	approved	2026-01-17 17:04:29.240377	\N	\N	Open Source	\N	https://klaudiosinani.github.io/tusk/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
813	WizNote	A cross-platform cloud based note-taking client.	111	{linux}	https://github.com/wizteam/wizqtclient	\N	13	approved	2026-01-17 17:04:29.241056	\N	\N	Open Source	\N	https://github.com/wizteam/wizqtclient	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
814	Alarm Clock	Alarm Clock is a fully-featured alarm clock for your GNOME panel or equivalent.	112	{linux}	https://github.com/alarm-clock-applet/alarm-clock	\N	13	approved	2026-01-17 17:04:29.241807	\N	\N	Open Source	\N	https://alarm-clock-applet.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
815	Break Timer	A break timer application for GNOME.	112	{linux}	https://gitlab.gnome.org/GNOME/gnome-break-timer/	\N	13	approved	2026-01-17 17:04:29.242474	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/BreakTimer	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
816	BreakTimer	BreakTimer is a cross platform desktop application with nice UI for managing and enforcing periodic breaks.	112	{linux}	https://github.com/tom-james-watson/breaktimer-app/	\N	13	approved	2026-01-17 17:04:29.24378	\N	\N	Open Source	\N	https://breaktimer.app/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
817	calcurse	A calendar and scheduling application for the command line.	112	{linux}	https://git.calcurse.org/calcurse.git/	\N	13	approved	2026-01-17 17:04:29.248366	\N	\N	Open Source	\N	https://calcurse.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
818	California	Complete Calendar app replacement which uses natural language for creating events.	112	{linux}	https://gitlab.gnome.org/GNOME/california	\N	13	approved	2026-01-17 17:04:29.254545	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/California	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
819	Everdo	TODO list and Getting Things Done® app for all platforms. Beautiful, powerful, not SaaS, free version available.	112	{linux}	https://everdo.net/	\N	13	approved	2026-01-17 17:04:29.256699	\N	\N	Commercial	\N	https://everdo.net/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
820	GNOME Pomodoro	A full-featured pomodoro timer for GNOME.	112	{linux}	https://github.com/codito/gnome-pomodoro	\N	13	approved	2026-01-17 17:04:29.269419	\N	\N	Open Source	\N	https://gnomepomodoro.org/#download	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
821	Go For It	Go For It! is a simple and stylish productivity app, featuring a to-do list, merged with a timer that keeps your focus on the current task.	112	{linux}	https://github.com/JMoerman/Go-For-It	\N	13	approved	2026-01-17 17:04:29.272485	\N	\N	Open Source	\N	https://github.com/JMoerman/Go-For-It	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
822	Kalendar	Kalendar is a calendar application that allows you to manage your tasks and events.	112	{linux}	https://invent.kde.org/pim/kalendar	\N	13	approved	2026-01-17 17:04:29.273698	\N	\N	Open Source	\N	https://apps.kde.org/kalendar/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
823	RoundPie App	RoundPie App is the easiest way to track your workflow using Tomato technique, on top of your current task management service.	112	{linux}	https://theroundpie.com/	\N	13	approved	2026-01-17 17:04:29.274768	\N	\N	Commercial	\N	https://theroundpie.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
824	RSIBreak	RSIBreak takes care of your health and regularly breaks your work to avoid repetitive strain injury.	112	{linux}	https://invent.kde.org/utilities/rsibreak	\N	13	approved	2026-01-17 17:04:29.275867	\N	\N	Open Source	\N	https://apps.kde.org/rsibreak/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
825	sleek	Cross platform todo manager based on the todo.txt syntax.	112	{linux}	https://github.com/ransome1/sleek	\N	13	approved	2026-01-17 17:04:29.277458	\N	\N	Open Source	\N	https://github.com/ransome1/sleek	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
826	Solanum	A pomodoro timer for the GNOME desktop.	112	{linux}	https://gitlab.gnome.org/World/Solanum	\N	13	approved	2026-01-17 17:04:29.278213	\N	\N	Open Source	\N	https://apps.gnome.org/app/org.gnome.Solanum/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
827	Super Productivity	The simple free flexible ToDo List / Time Tracker / personal Jira and Github Task Manager.	112	{linux}	https://github.com/johannesjo/super-productivity	\N	13	approved	2026-01-17 17:04:29.278835	\N	\N	Open Source	\N	https://super-productivity.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
828	Taskade	Real-time organization and collaboration tool for getting things done. Taskade is a unified workspace for team tasks, notes, with integrated video chat available cross-platform and free to use.	112	{linux}	https://www.taskade.com/downloads	\N	13	approved	2026-01-17 17:04:29.279548	\N	\N	Freeware	\N	https://www.taskade.com/downloads	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
829	Taskbook	Tasks, boards & notes for the command-line habitat.	112	{linux}	https://github.com/klaussinani/taskbook	\N	13	approved	2026-01-17 17:04:29.280217	\N	\N	Open Source	\N	https://github.com/klaussinani/taskbook	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
830	TaskWarrior	Taskwarrior is Free and Open Source Software that manages your TODO list from the command line.	112	{linux}	https://github.com/GothenburgBitFactory/taskwarrior	\N	13	approved	2026-01-17 17:04:29.280899	\N	\N	Open Source	\N	https://taskwarrior.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
831	Todo.txt	Todo.txt is a set of focused editors which help you manage your tasks with as few keystrokes and taps possible.	112	{linux}	https://github.com/todotxt/todo.txt-android	\N	13	approved	2026-01-17 17:04:29.281624	\N	\N	Open Source	\N	http://todotxt.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
832	Todoist	Unofficial client of Todoist, the cross-platform to-do manager with mobile apps, great UI and has some optional premium features.	112	{linux}	https://github.com/kamhix/todoist-linux	\N	13	approved	2026-01-17 17:04:29.282273	\N	\N	Open Source	\N	https://github.com/kamhix/todoist-linux	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
833	ActivityWatch	ActivityWatch is an app that automatically tracks how you spend time on your devices.	113	{linux}	https://github.com/ActivityWatch/activitywatch	\N	13	approved	2026-01-17 17:04:29.283778	\N	\N	Open Source	\N	https://activitywatch.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
834	Time Cop	A time tracking app that respects your privacy and gets the job done without getting too fancy.	113	{linux}	https://github.com/hamaluik/timecop	\N	13	approved	2026-01-17 17:04:29.28438	\N	\N	Open Source	\N	https://timecop.app/en/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
835	Toggl Track	[Toggl Track](https://flathub.org/apps/details/com.toggl.TogglDesktop/) - Simple and Intuitive Time Tracking Software with cloud sync.	113	{linux}	https://flathub.org/apps/details/com.toggl.TogglDesktop/	\N	13	approved	2026-01-17 17:04:29.284998	\N	\N	Freeware	\N	https://flathub.org/apps/details/com.toggl.TogglDesktop/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
836	Brightness	Brightness indicator for Ubuntu.	114	{linux}	https://bazaar.launchpad.net/~indicator-brightness/indicator-brightness/trunk/files	\N	13	approved	2026-01-17 17:04:29.285647	\N	\N	Open Source	\N	https://launchpad.net/indicator-brightness	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
837	My Weather Indicator	Weather indicator and widget for Ubuntu.	114	{linux}	https://git.launchpad.net/my-weather-indicator	\N	13	approved	2026-01-17 17:04:29.286284	\N	\N	Open Source	\N	https://launchpad.net/my-weather-indicator	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
838	Recent Noti	An indicator for recent notification.	114	{linux}	https://bazaar.launchpad.net/~jconti/recent-notifications/trunk/files	\N	13	approved	2026-01-17 17:04:29.286929	\N	\N	Open Source	\N	https://launchpad.net/recent-notifications	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
839	Yktoo Sound Switcher Indicator	Sound input/output selector indicator for Ubuntu/Unity.	114	{linux}	https://github.com/yktoo/indicator-sound-switcher	\N	13	approved	2026-01-17 17:04:29.287541	\N	\N	Open Source	\N	https://yktoo.com/en/software/indicator-sound-switcher	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
840	mitmproxy	mitmproxy is a free and open source interactive HTTPS proxy.	35	{linux}	https://github.com/mitmproxy/mitmproxy	\N	13	approved	2026-01-17 17:04:29.288165	\N	\N	Open Source	\N	https://mitmproxy.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
841	Privoxy	Privoxy is a non-caching web proxy with advanced filtering capabilities for enhancing privacy, modifying web page data and HTTP headers, controlling access, and removing ads and other obnoxious Internet junk.	35	{linux}	https://sourceforge.net/projects/ijbswa/	\N	13	approved	2026-01-17 17:04:29.288784	\N	\N	Open Source	\N	https://www.privoxy.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
842	ProxyChains	A tool that forces any TCP connection made by any given application to follow through proxy like TOR or any other SOCKS4, SOCKS5 or HTTP(S) proxy.	35	{linux}	https://github.com/haad/proxychains	\N	13	approved	2026-01-17 17:04:29.289415	\N	\N	Open Source	\N	https://proxychains.sourceforge.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
843	Shadowsocks	A secure socks5 proxy, designed to protect your Internet traffic.	35	{linux}	https://github.com/shadowsocks/shadowsocks-qt5	\N	13	approved	2026-01-17 17:04:29.290018	\N	\N	Open Source	\N	https://shadowsocks.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
866	AuthPass	Password Manager based on Flutter for all platforms.	119	{linux}	https://github.com/authpass/authpass	\N	13	approved	2026-01-17 17:04:29.305811	\N	\N	Open Source	\N	https://authpass.app/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
844	Mortar	Mortar allows for convenient automatic unlocking of LUKS-encrypted disks without sacrificing security through the use of Secureboot and TPM validation. Mortar aims to be distribution-agnostic.	115	{linux}	https://github.com/noahbliss/mortar	\N	13	approved	2026-01-17 17:04:29.290638	\N	\N	Open Source	\N	https://github.com/noahbliss/mortar	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
845	Atoms	Easily manage Linux Chroot(s) and Containers with Atoms.	116	{linux}	https://github.com/AtomsDevs/Atoms	\N	13	approved	2026-01-17 17:04:29.291305	\N	\N	Open Source	\N	https://github.com/AtomsDevs/Atoms	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
846	Distrobox	Use any linux distribution inside your terminal.	116	{linux}	https://github.com/89luca89/distrobox	\N	13	approved	2026-01-17 17:04:29.292467	\N	\N	Open Source	\N	https://distrobox.it/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
848	GNOME Boxes	Virtualization made simple.	116	{linux}	https://gitlab.gnome.org/GNOME/gnome-boxes	\N	13	approved	2026-01-17 17:04:29.293783	\N	\N	Open Source	\N	https://apps.gnome.org/app/org.gnome.Boxes/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
849	KVM	KVM (for Kernel-based Virtual Machine) is a full virtualization solution for Linux on x86 hardware containing virtualization extensions (Intel VT or AMD-V).	116	{linux}	https://sourceforge.net/projects/kvm/files/	\N	13	approved	2026-01-17 17:04:29.294409	\N	\N	Open Source	\N	https://www.linux-kvm.org/page/Main_Page	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
850	ops	OPS is a tool that builds, runs and deploys ordinary linux applications as unikernels.	116	{linux}	https://github.com/nanovms/ops/	\N	13	approved	2026-01-17 17:04:29.295078	\N	\N	Open Source	\N	https://ops.city/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
851	Pods	Interact with Podman using an intuitive desktop application.	116	{linux}	https://github.com/marhkb/pods	\N	13	approved	2026-01-17 17:04:29.29569	\N	\N	Open Source	\N	https://github.com/marhkb/pods	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
852	Quickemu	Quickly create and run optimised Windows, macOS and Linux desktop virtual machines.	116	{linux}	https://github.com/quickemu-project/quickemu	\N	13	approved	2026-01-17 17:04:29.29629	\N	\N	Open Source	\N	https://github.com/quickemu-project/quickemu	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
853	Toolbx	Tool for containerized command line environments on Linux.	116	{linux}	https://github.com/containers/toolbox	\N	13	approved	2026-01-17 17:04:29.296994	\N	\N	Open Source	\N	https://containertoolbx.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
854	VirtualBox	VirtualBox is a general-purpose full virtualizer for x86 hardware, targeted at server, desktop and embedded use.	116	{linux}	https://www.virtualbox.org/wiki/Contributor_information	\N	13	approved	2026-01-17 17:04:29.297595	\N	\N	Open Source	\N	https://www.virtualbox.org/wiki/Downloads	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
855	Virtual Machine Manager	Desktop tool for managing virtual machines via libvirt.	116	{linux}	https://github.com/virt-manager/virt-manager	\N	13	approved	2026-01-17 17:04:29.298275	\N	\N	Open Source	\N	https://virt-manager.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
856	VMware Workstation Player	Easily run multiple operating systems as virtual machines on your Windows or Linux PC with VMware Workstation Player.	116	{linux}	https://www.vmware.com/products/workstation-player.html	\N	13	approved	2026-01-17 17:04:29.298905	\N	\N	Freeware	\N	https://www.vmware.com/products/workstation-player.html	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
857	FireHOL	Linux firewall (`iptables`) manager for humans.	117	{linux}	https://github.com/firehol/firehol	\N	13	approved	2026-01-17 17:04:29.299516	\N	\N	Open Source	\N	https://firehol.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
858	Firewalld	Firewalld provides a dynamically managed firewall with support for network or firewall zones to define the trust level of network connections or interfaces.	117	{linux}	https://github.com/firewalld/firewalld	\N	13	approved	2026-01-17 17:04:29.300146	\N	\N	Open Source	\N	https://github.com/firewalld/firewalld	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
859	GuFW	One of the easiest firewalls in the world of Linux.	117	{linux}	https://github.com/costales/gufw	\N	13	approved	2026-01-17 17:04:29.301033	\N	\N	Open Source	\N	https://github.com/costales/gufw	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
860	OpenSnitch	OpenSnitch is a GNU/Linux interactive application firewall inspired by Little Snitch.	117	{linux}	https://github.com/evilsocket/opensnitch	\N	13	approved	2026-01-17 17:04:29.301657	\N	\N	Open Source	\N	https://github.com/evilsocket/opensnitch	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
865	1Password	1Password is the easiest way to store and use strong passwords. Log in to sites and fill forms securely with a single click.	119	{linux}	https://1password.com/downloads/linux/	\N	13	approved	2026-01-17 17:04:29.30495	\N	\N	Freeware	\N	https://1password.com/downloads/linux/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
863	Termshark	A terminal UI for tshark, inspired by Wireshark.	263	{linux}	https://github.com/gcla/termshark	\N	13	approved	2026-01-17 17:04:29.303685	\N	\N	Open Source	\N	https://termshark.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
847	Firejail	Firejail is a SUID program that reduces the risk of security breaches by restricting the running environment of untrusted applications using [Linux namespaces](https://lwn.net/Articles/531114/) and [seccomp-bpf](https://l3net.wordpress.com/2015/04/13/firejail-seccomp-guide/).	116	{linux}	https://github.com/netblue30/firejail	\N	13	approved	2026-01-17 17:04:29.293105	\N	\N	Open Source	\N	https://firejail.wordpress.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
867	Buttercup	Buttercup is a free, open-source and cross-platform password manager, built on NodeJS with Typescript.	119	{linux}	https://github.com/buttercup/buttercup-desktop	\N	13	approved	2026-01-17 17:04:29.306787	\N	\N	Open Source	\N	https://buttercup.pw/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
868	Enpass	Enpass makes your life easy by securely managing your passwords and important information.	119	{linux}	https://www.enpass.io/	\N	13	approved	2026-01-17 17:04:29.307486	\N	\N	Freeware	\N	https://www.enpass.io/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
869	gopass	The slightly more awesome standard unix password manager for teams.	119	{linux}	https://github.com/gopasspw/gopass	\N	13	approved	2026-01-17 17:04:29.30814	\N	\N	Open Source	\N	https://www.gopass.pw/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
870	KeePassXC	Cross platform password manager. A Community-maintained fork of KeePassX.	119	{linux}	https://github.com/keepassxreboot/keepassxc	\N	13	approved	2026-01-17 17:04:29.309568	\N	\N	Open Source	\N	https://keepassxc.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
871	Keeper	The leading cybersecurity platform that protects passwords, secrets and access to infrastructure.	119	{linux}	https://www.keepersecurity.com/download.html	\N	13	approved	2026-01-17 17:04:29.310324	\N	\N	Freeware	\N	https://www.keepersecurity.com/download.html	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
872	KeeWeb	Free cross-platform password manager compatible with KeePass.	119	{linux}	https://github.com/keeweb/keeweb	\N	13	approved	2026-01-17 17:04:29.311016	\N	\N	Open Source	\N	https://keeweb.info/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
873	LastPass	LastPass is a crossplatform freemium password management service that stores encrypted passwords in private accounts.	119	{linux}	https://lastpass.com/misc_download2.php	\N	13	approved	2026-01-17 17:04:29.312282	\N	\N	Freeware	\N	https://lastpass.com/misc_download2.php	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
874	NordPass	A secure and simple password manager for a stress-free online experience. Optimized for Linux devices.	119	{linux}	https://nordpass.com/download/linux/	\N	13	approved	2026-01-17 17:04:29.313004	\N	\N	Freeware	\N	https://nordpass.com/download/linux/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
875	Padloc	A modern, open source password manager for individuals and teams.	119	{linux}	https://github.com/padloc/padloc	\N	13	approved	2026-01-17 17:04:29.313686	\N	\N	Open Source	\N	https://padloc.app/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
876	Pass	The standard Unix password manager.	119	{linux}	https://git.zx2c4.com/password-store/	\N	13	approved	2026-01-17 17:04:29.314355	\N	\N	Open Source	\N	https://www.passwordstore.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
877	Password Safe	Password Safe allows you to safely and easily create a secured and encrypted user name/password list.	119	{linux}	https://sourceforge.net/projects/passwordsafe/	\N	13	approved	2026-01-17 17:04:29.315006	\N	\N	Open Source	\N	https://pwsafe.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
878	Psono	Psono is an open source and self hosted password manager to help keep your data safe.	119	{linux}	https://gitlab.com/psono/psono-app	\N	13	approved	2026-01-17 17:04:29.315642	\N	\N	Open Source	\N	https://psono.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
879	Secrets	Secrets is a password manager which integrates perfectly with the GNOME desktop and provides an easy and uncluttered interface for the management of password databases.	119	{linux}	https://gitlab.gnome.org/World/secrets	\N	13	approved	2026-01-17 17:04:29.31628	\N	\N	Open Source	\N	https://apps.gnome.org/app/org.gnome.World.Secrets/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
880	VaultWarden	Unofficial Bitwarden compatible server written in Rust, formerly known as bitwarden_rs.	119	{linux}	https://github.com/dani-garcia/vaultwarden	\N	13	approved	2026-01-17 17:04:29.316944	\N	\N	Open Source	\N	https://github.com/dani-garcia/vaultwarden	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
881	cutter	Cutter's goal is to be an advanced FREE and open-source reverse-engineering platform while keeping the user experience at mind.	120	{linux}	https://github.com/rizinorg/cutter	\N	13	approved	2026-01-17 17:04:29.317573	\N	\N	Open Source	\N	https://cutter.re/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
882	edb-debugger	edb is a cross platform AArch32/x86/x86-64 debugger. It was inspired by Ollydbg.	120	{linux}	https://github.com/eteran/edb-debugger	\N	13	approved	2026-01-17 17:04:29.318235	\N	\N	Open Source	\N	https://github.com/eteran/edb-debugger	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
883	GDB	GDB, the GNU Project debugger, allows you to see what is going on `inside' another program while it executes.	120	{linux}	https://sourceware.org/git/gitweb.cgi?p=binutils-gdb.git	\N	13	approved	2026-01-17 17:04:29.318934	\N	\N	Open Source	\N	https://www.sourceware.org/gdb/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
884	ghidra	A software reverse engineering (SRE) suite of tools developed by NSA's Research Directorate in support of the Cybersecurity mission.	120	{linux}	https://github.com/NationalSecurityAgency/ghidra/releases	\N	13	approved	2026-01-17 17:04:29.319566	\N	\N	Open Source	\N	https://ghidra-sre.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
885	radare2	A free/libre toolchain for easing several low level tasks like forensics, software reverse engineering, exploiting, debugging.	120	{linux}	https://github.com/radareorg/radare2/releases	\N	13	approved	2026-01-17 17:04:29.320216	\N	\N	Open Source	\N	https://rada.re/n/radare2.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
886	Authenticator	Simple application for generating Two-Factor Authentication Codes.	121	{linux}	https://gitlab.gnome.org/World/Authenticator	\N	13	approved	2026-01-17 17:04:29.321	\N	\N	Open Source	\N	https://apps.gnome.org/app/com.belmoussaoui.Authenticator/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
887	ClamAV	ClamAV is an open source antivirus engine for detecting trojans, viruses, malware & other malicious threats.	121	{linux}	https://github.com/Cisco-Talos/clamav-devel	\N	13	approved	2026-01-17 17:04:29.321902	\N	\N	Open Source	\N	https://www.clamav.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
888	Cryptomator	Multi-platform transparent client-side encryption of your files in the cloud.	121	{linux}	https://github.com/cryptomator/cryptomator	\N	13	approved	2026-01-17 17:04:29.322508	\N	\N	Open Source	\N	https://cryptomator.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
936	Teamviewer	PC remote control/remote access software, free for personal use.	125	{linux}	https://www.teamviewer.com/	\N	13	approved	2026-01-17 17:04:29.354878	\N	\N	Freeware	\N	https://www.teamviewer.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
889	Decoder	Fancy yet simple QR Codes scanner and generator.	121	{linux}	https://gitlab.gnome.org/World/decoder/	\N	13	approved	2026-01-17 17:04:29.323149	\N	\N	Open Source	\N	https://apps.gnome.org/app/com.belmoussaoui.Decoder/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
890	Fail2ban	Fail2ban scans log files (e.g. /var/log/apache/error_log) and bans IPs that show the malicious signs -- too many password failures, seeking for exploits, etc.	121	{linux}	https://github.com/fail2ban/fail2ban	\N	13	approved	2026-01-17 17:04:29.323879	\N	\N	Open Source	\N	https://github.com/fail2ban/fail2ban	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
891	FireQoS	Linux QoS (`tc`) manager for humans.	121	{linux}	https://firehol.org/tutorial/fireqos-new-user/	\N	13	approved	2026-01-17 17:04:29.324552	\N	\N	Open Source	\N	https://learn.netdata.cloud/docs/collecting-metrics/linux-systems/network/tc-qos-classes#tcplugin	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
892	GnuPG	GnuPG allows to encrypt and sign your data and communication, features a versatile key management system as well as access modules for all kinds of public key directories.	121	{linux}	https://git.gnupg.org/	\N	13	approved	2026-01-17 17:04:29.325182	\N	\N	Open Source	\N	https://www.gnupg.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
893	IPrange	A very fast command line utility for processing IP lists (merge, compare, exclude, etc).	121	{linux}	https://github.com/firehol/iprange	\N	13	approved	2026-01-17 17:04:29.325833	\N	\N	Open Source	\N	https://github.com/firehol/iprange	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
894	spy	Linux kernel mode debugfs keylogger.	121	{linux}	https://github.com/jarun/spy	\N	13	approved	2026-01-17 17:04:29.326601	\N	\N	Open Source	\N	https://github.com/jarun/spy	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
895	Lynis	Security auditing tool for Linux, macOS, and UNIX-based systems. Assists with compliance testing (HIPAA/ISO27001/PCI DSS) and system hardening. Agentless, and installation optional.	121	{linux}	https://github.com/CISOfy/lynis	\N	13	approved	2026-01-17 17:04:29.327341	\N	\N	Open Source	\N	https://cisofy.com/lynis/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
896	Obfuscate	Obfuscate lets you redact your private information from any image.	121	{linux}	https://gitlab.gnome.org/World/obfuscate/	\N	13	approved	2026-01-17 17:04:29.328053	\N	\N	Open Source	\N	https://apps.gnome.org/app/com.belmoussaoui.Obfuscate/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
897	OpenSSH	OpenSSH Secure Shell Server and Client.	121	{linux}	https://www.openbsd.org/anoncvs.html	\N	13	approved	2026-01-17 17:04:29.328701	\N	\N	Open Source	\N	https://www.openssh.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
898	OWASP ZAP	OWASP Zed Attack Proxy (ZAP) web security testing tool.	121	{linux}	https://github.com/zaproxy/zaproxy/	\N	13	approved	2026-01-17 17:04:29.329353	\N	\N	Open Source	\N	https://www.zaproxy.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
899	Seahorse	A GNOME frontend for GnuPG.	121	{linux}	https://gitlab.gnome.org/GNOME/seahorse	\N	13	approved	2026-01-17 17:04:29.330023	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Seahorse	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
900	Sirikali	A Qt/C++ GUI front end to cryfs,gocryptfs,securefs,ecryptfs and encfs.	121	{linux}	https://github.com/mhogomchungu/sirikali	\N	13	approved	2026-01-17 17:04:29.331046	\N	\N	Open Source	\N	https://mhogomchungu.github.io/sirikali/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
901	Uktools	Keep your system up-to-date with last kernel available. Possibility to clean old kernel too.	121	{linux}	https://github.com/usbkey9/uktools	\N	13	approved	2026-01-17 17:04:29.331659	\N	\N	Open Source	\N	https://github.com/usbkey9/uktools	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
902	Update-IPsets	A manager for all cybercrime IP feeds that can download, convert and install netfilter `ipsets`.	121	{linux}	https://github.com/firehol/blocklist-ipsets	\N	13	approved	2026-01-17 17:04:29.33229	\N	\N	Open Source	\N	https://iplists.firehol.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
903	Dropbox	Dropbox is a free service that lets you bring your photos, docs, and videos anywhere and share them easily.	122	{linux}	https://www.dropbox.com/install?os=lnx	\N	13	approved	2026-01-17 17:04:29.333259	\N	\N	Freeware	\N	https://www.dropbox.com/install?os=lnx	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
904	MEGA	Easy automated syncing between your computers and your MEGA cloud drive.	122	{linux}	https://github.com/meganz/MEGAsync	\N	13	approved	2026-01-17 17:04:29.333896	\N	\N	Open Source	\N	https://mega.io/desktop	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
905	nextCloud	An actively maintained fork of ownCloud, a suite of client-server software for creating and using file hosting services.	122	{linux}	https://github.com/nextcloud	\N	13	approved	2026-01-17 17:04:29.334518	\N	\N	Open Source	\N	https://nextcloud.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
906	ownCloud	The goal of ownCloud is to give you access to your files wherever you are.	122	{linux}	https://github.com/owncloud	\N	13	approved	2026-01-17 17:04:29.33515	\N	\N	Open Source	\N	https://owncloud.com/client/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
907	Seafile	Seafile is an enterprise file hosting platform with high reliability and performance. Put files on your own server. Sync and share files across different devices, or access all the files as a virtual disk.	122	{linux}	https://github.com/haiwen/seafile	\N	13	approved	2026-01-17 17:04:29.335793	\N	\N	Open Source	\N	https://www.seafile.com/en/home/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
908	aria2	aria2 is a lightweight multi-protocol & multi-source command-line download utility.	123	{linux}	https://github.com/aria2/aria2	\N	13	approved	2026-01-17 17:04:29.336406	\N	\N	Open Source	\N	https://aria2.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
909	ArrowDL	ArrowDL is a mass download manager for Windows, Mac OS X and Linux. It helps you to select, organize, prioritize and run your downloads in parallel.	123	{linux}	https://github.com/setvisible/ArrowDL	\N	13	approved	2026-01-17 17:04:29.337024	\N	\N	Open Source	\N	https://www.arrow-dl.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
910	Flareget	Full featured, multi-threaded download manager and accelerator.	123	{linux}	https://flareget.com/	\N	13	approved	2026-01-17 17:04:29.337631	\N	\N	Freeware	\N	https://flareget.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
935	Rustdesk	Open source virtual / remote desktop infrastructure for everyone! The open source TeamViewer alternative.	125	{linux}	https://github.com/rustdesk/rustdesk	\N	13	approved	2026-01-17 17:04:29.354248	\N	\N	Open Source	\N	https://rustdesk.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
911	Free Download Manager	Free Download Manager is a powerful modern cross-platform download accelerator and organizer for Windows, Mac and Linux.	123	{linux}	https://www.freedownloadmanager.org/	\N	13	approved	2026-01-17 17:04:29.338281	\N	\N	Freeware	\N	https://www.freedownloadmanager.org/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
912	JDownloader	JDownloader is a free download management tool with a huge community of developers that makes downloading as easy and fast as it should be.	123	{linux}	https://jdownloader.org/	\N	13	approved	2026-01-17 17:04:29.338964	\N	\N	Freeware	\N	https://jdownloader.org/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
913	KGet	KGet is a versatile and user-friendly download manager.	123	{linux}	https://invent.kde.org/network/kget	\N	13	approved	2026-01-17 17:04:29.339586	\N	\N	Open Source	\N	https://apps.kde.org/kget/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
914	Motrix	Motrix is a full-featured clean and easy to use interface download manager that supports downloading HTTP, FTP, BitTorrent, Magnet, etc.	123	{linux}	https://github.com/agalwood/Motrix/	\N	13	approved	2026-01-17 17:04:29.340287	\N	\N	Open Source	\N	https://motrix.app/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
915	uGet	A download manager that can monitor the clipboard for downloadable links, and can create a list of downloads, and run them in parallel.	123	{linux}	https://sourceforge.net/p/urlget/uget2/ci/master/tree/	\N	13	approved	2026-01-17 17:04:29.340885	\N	\N	Open Source	\N	https://sourceforge.net/projects/urlget/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
916	Xtreme Download Manager	A good download manager with fresh UI for Linux.	123	{linux}	https://github.com/subhra74/xdm	\N	13	approved	2026-01-17 17:04:29.341525	\N	\N	Open Source	\N	https://xtremedownloadmanager.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
917	airpaste	A 1-1 network pipe that auto discovers other peers using mdns.	124	{linux}	https://github.com/mafintosh/airpaste	\N	13	approved	2026-01-17 17:04:29.342195	\N	\N	Open Source	\N	https://github.com/mafintosh/airpaste	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
918	croc	Easily and securely send things from one computer to another.	124	{linux}	https://github.com/schollz/croc	\N	13	approved	2026-01-17 17:04:29.342863	\N	\N	Open Source	\N	https://schollz.com/blog/croc6/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
919	CrossFTP	CrossFTP makes it extremely simple to manage the FTP related tasks.	124	{linux}	https://www.crossftp.com/ftp-client.htm	\N	13	approved	2026-01-17 17:04:29.343493	\N	\N	Freeware	\N	https://www.crossftp.com/ftp-client.htm	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
920	D-lan	A free LAN file sharing software.	124	{linux}	https://www.d-lan.net/	\N	13	approved	2026-01-17 17:04:29.344198	\N	\N	Freeware	\N	https://www.d-lan.net/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
921	Filezilla	The free FTP solution.	124	{linux}	https://svn.filezilla-project.org/filezilla/FileZilla3/	\N	13	approved	2026-01-17 17:04:29.344941	\N	\N	Open Source	\N	https://filezilla-project.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
922	LocalSend	An open-source cross-platform alternative to AirDrop.	124	{linux}	https://github.com/localsend/localsend	\N	13	approved	2026-01-17 17:04:29.345539	\N	\N	Open Source	\N	https://localsend.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
923	NitroShare	Cross-Platform network file transfer application.	124	{linux}	https://github.com/nitroshare/nitroshare-desktop	\N	13	approved	2026-01-17 17:04:29.346168	\N	\N	Open Source	\N	https://nitroshare.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
924	OnionShare	Securely and anonymously share a file of any size.	124	{linux}	https://github.com/micahflee/onionshare	\N	13	approved	2026-01-17 17:04:29.346768	\N	\N	Open Source	\N	https://onionshare.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
925	PushBullet for desktop	The missing Desktop application for Pushbullet.	124	{linux}	https://github.com/sidneys/pb-for-desktop	\N	13	approved	2026-01-17 17:04:29.347388	\N	\N	Open Source	\N	https://sidneys.github.io/pb-for-desktop/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
926	Quazaa	A cross platform multi-network peer-to-peer (P2P) file-sharing client.	124	{linux}	https://sourceforge.net/projects/quazaa/	\N	13	approved	2026-01-17 17:04:29.348009	\N	\N	Freeware	\N	https://sourceforge.net/projects/quazaa/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
927	SpiderOak	Real-time collaboration for teams and businesses that care about privacy.	124	{linux}	https://spideroak.com/	\N	13	approved	2026-01-17 17:04:29.348625	\N	\N	Freeware	\N	https://spideroak.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
928	Warp	Warp allows you to securely send files to each other via the internet or local network by exchanging a word-based code.	124	{linux}	https://gitlab.gnome.org/World/warp	\N	13	approved	2026-01-17 17:04:29.349916	\N	\N	Open Source	\N	https://apps.gnome.org/app/app.drey.Warp/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
929	Warpinator	Share files across LAN.	124	{linux}	https://github.com/linuxmint/warpinator	\N	13	approved	2026-01-17 17:04:29.350545	\N	\N	Open Source	\N	https://github.com/linuxmint/warpinator	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
930	Wormhole	Get arbitrary-sized files and directories (or short pieces of text) from one computer to another safely.	124	{linux}	https://github.com/warner/magic-wormhole	\N	13	approved	2026-01-17 17:04:29.351155	\N	\N	Open Source	\N	https://github.com/warner/magic-wormhole	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
931	AnyDesk	AnyDesk ensures secure and reliable remote desktop connections for IT professionals and on-the-go individuals alike.	125	{linux}	https://anydesk.com/en	\N	13	approved	2026-01-17 17:04:29.351753	\N	\N	Freeware	\N	https://anydesk.com/en	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
932	Barrier	Share mouse and keyboard over the local network.	125	{linux}	https://github.com/debauchee/barrier/	\N	13	approved	2026-01-17 17:04:29.352364	\N	\N	Open Source	\N	https://github.com/debauchee/barrier/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
933	Connections	Connections allows you to connect to and use other desktops. This can be a great way to access content or software on a different desktop operating system.	125	{linux}	https://gitlab.gnome.org/GNOME/connections	\N	13	approved	2026-01-17 17:04:29.352993	\N	\N	Open Source	\N	https://apps.gnome.org/app/org.gnome.Connections/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
934	PushBullet	Pushbullet connects your devices, making them feel like one.	125	{linux}	https://www.pushbullet.com/	\N	13	approved	2026-01-17 17:04:29.353596	\N	\N	Freeware	\N	https://www.pushbullet.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
937	Deluge	Deluge is a lightweight, Free Software, cross-platform BitTorrent client.	126	{linux}	https://git.deluge-torrent.org/deluge	\N	13	approved	2026-01-17 17:04:29.355492	\N	\N	Open Source	\N	https://deluge-torrent.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
938	Fragments	Fragments is an easy to use BitTorrent client for the GNOME desktop environment.	126	{linux}	https://gitlab.gnome.org/World/Fragments	\N	13	approved	2026-01-17 17:04:29.356153	\N	\N	Open Source	\N	https://apps.gnome.org/app/de.haeckerfelix.Fragments/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
939	KTorrent	KTorrent is a BitTorrent application by KDE which allows you to download files using the BitTorrent protocol.	126	{linux}	https://invent.kde.org/network/ktorrent	\N	13	approved	2026-01-17 17:04:29.356776	\N	\N	Open Source	\N	https://apps.kde.org/ktorrent/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
940	qBittorent	The qBittorrent project aims to provide a Free Software alternative to µTorrent.	126	{linux}	https://github.com/qbittorrent/qBittorrent	\N	13	approved	2026-01-17 17:04:29.357378	\N	\N	Open Source	\N	https://www.qbittorrent.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
941	qBittorrent Enhanced Edition	qBittorrent Enhanced is fork of qBittorrent that features peer whitelist/blacklist, auto update public tracker list and more.	126	{linux}	https://github.com/c0re100/qBittorrent-Enhanced-Edition	\N	13	approved	2026-01-17 17:04:29.358183	\N	\N	Open Source	\N	https://github.com/c0re100/qBittorrent-Enhanced-Edition	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
942	Tixati	Freeware, advanced featured torrent client, a web user interface is included.	126	{linux}	https://www.tixati.com/	\N	13	approved	2026-01-17 17:04:29.359029	\N	\N	Freeware	\N	https://www.tixati.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
943	Transmission	Simple, lightweight, multi-platform torrent client.	126	{linux}	https://trac.transmissionbt.com/browser/trunk	\N	13	approved	2026-01-17 17:04:29.359658	\N	\N	Open Source	\N	https://transmissionbt.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
944	Transmission Remote GUI	Transmission Remote GUI is a feature rich cross platform front-end to remotely control a Transmission Bit-Torrent client daemon via its RPC protocol.	126	{linux}	https://github.com/transmission-remote-gui/transgui	\N	13	approved	2026-01-17 17:04:29.360326	\N	\N	Open Source	\N	https://sourceforge.net/projects/transgui/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
945	Vuze	Vuze is a BitTorrent client used to transfer files via the BitTorrent protocol.	126	{linux}	https://www.vuze.com	\N	13	approved	2026-01-17 17:04:29.361072	\N	\N	Freeware	\N	https://www.vuze.com	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
946	Web Torrent Desktop	Web Torrent Desktop is for streaming torrents which connects to both BitTorrent and WebTorrent peers.	126	{linux}	https://github.com/webtorrent/webtorrent-desktop	\N	13	approved	2026-01-17 17:04:29.361659	\N	\N	Open Source	\N	https://webtorrent.io/desktop/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
947	Alacritty	A cross-platform, GPU-accelerated terminal emulator.	37	{linux}	https://github.com/jwilm/alacritty	\N	13	approved	2026-01-17 17:04:29.362313	\N	\N	Open Source	\N	https://alacritty.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
948	Black Box	A beautiful GTK 4 terminal.	37	{linux}	https://gitlab.gnome.org/raggesilver/blackbox	\N	13	approved	2026-01-17 17:04:29.362935	\N	\N	Open Source	\N	https://gitlab.gnome.org/raggesilver/blackbox	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
949	Console	A simple user-friendly terminal emulator for the GNOME desktop.	37	{linux}	https://gitlab.gnome.org/GNOME/console	\N	13	approved	2026-01-17 17:04:29.363551	\N	\N	Open Source	\N	https://apps.gnome.org/Console/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
950	Contour	Contour is a modern and actually fast, modal, virtual terminal emulator, for everyday use. It is aiming for power users with a modern feature mindset.	37	{linux}	https://github.com/contour-terminal/contour/	\N	13	approved	2026-01-17 17:04:29.364167	\N	\N	Open Source	\N	https://github.com/contour-terminal/contour/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
951	Cool Retro Term	A good looking terminal that mimicks the old cathode display.	37	{linux}	https://github.com/Swordfish90/cool-retro-term	\N	13	approved	2026-01-17 17:04:29.364784	\N	\N	Open Source	\N	https://github.com/Swordfish90/cool-retro-term	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
952	eDEX-UI	eDEX-UI is a fullscreen, cross-platform terminal emulator and system monitor that looks and feels like a sci-fi computer interface.	37	{linux}	https://github.com/GitSquared/edex-ui	\N	13	approved	2026-01-17 17:04:29.365409	\N	\N	Open Source	\N	https://github.com/GitSquared/edex-ui	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
953	Foot	A fast, lightweight and minimalistic Wayland terminal emulator	37	{linux}	https://codeberg.org/dnkl/foot	\N	13	approved	2026-01-17 17:04:29.366012	\N	\N	Open Source	\N	https://codeberg.org/dnkl/foot	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
954	Ghostty	Cross-platform, GPU-accelerated terminal emulator. Available for macOS and Linux. Written in Zig.	37	{linux}	https://github.com/ghostty-org/ghostty	\N	13	approved	2026-01-17 17:04:29.366638	\N	\N	Open Source	\N	https://ghostty.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
955	GNOME Terminal	A widely preinstalled terminal emulator in Linux world.	37	{linux}	https://github.com/GNOME	\N	13	approved	2026-01-17 17:04:29.367446	\N	\N	Open Source	\N	https://help.gnome.org/users/gnome-terminal/stable/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
956	Guake	Guake is a top-down terminal for GNOME.	37	{linux}	https://github.com/Guake/guake	\N	13	approved	2026-01-17 17:04:29.368066	\N	\N	Open Source	\N	http://guake.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
957	Hyper	A terminal built on web technologies.	37	{linux}	https://github.com/zeit/hyper	\N	13	approved	2026-01-17 17:04:29.368665	\N	\N	Open Source	\N	https://hyper.is/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
958	Kermit	A VTE-based, simple and froggy terminal emulator.	37	{linux}	https://github.com/orhun/kermit	\N	13	approved	2026-01-17 17:04:29.369317	\N	\N	Open Source	\N	https://github.com/orhun/kermit	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
959	Kitty	Cross-platform, fast, feature full, OpenGL based terminal emulator.	37	{linux}	https://github.com/kovidgoyal/kitty	\N	13	approved	2026-01-17 17:04:29.369959	\N	\N	Open Source	\N	https://sw.kovidgoyal.net/kitty/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1678	Dekko Project	Ubuntu email client	186	{Linux,Mac,Windows}	https://www.patreon.com/dekkoproject	\N	1	approved	2026-01-18 09:29:54.696769	\N	\N	Open Source	\N	\N	\N	software
960	Konsole	An alternative terminal emulator for KDE desktop environment.	37	{linux}	https://invent.kde.org/utilities/konsole	\N	13	approved	2026-01-17 17:04:29.370599	\N	\N	Open Source	\N	https://apps.kde.org/konsole/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
961	Ptyxis	A terminal for a container-oriented desktop.	37	{linux}	https://gitlab.gnome.org/chergert/ptyxis	\N	13	approved	2026-01-17 17:04:29.371323	\N	\N	Open Source	\N	https://gitlab.gnome.org/chergert/ptyxis	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
962	RXVT	A terminal emulator for X11, a popular replacement for the standard ‘xterm’.	37	{linux}	https://sourceforge.net/projects/rxvt/	\N	13	approved	2026-01-17 17:04:29.371949	\N	\N	Open Source	\N	https://rxvt.sourceforge.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
963	rxvt-unicode	rxvt-unicode is a fork of the well known terminal emulator.	37	{linux}	http://dist.schmorp.de/rxvt-unicode/	\N	13	approved	2026-01-17 17:04:29.372547	\N	\N	Open Source	\N	http://software.schmorp.de/pkg/rxvt-unicode.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
964	Sakura	Simple but powerful libvte based terminal emulator, supporting utf-8 and input methods as provided by gtk+ and pango libraries.	37	{linux}	https://bazaar.launchpad.net/~dabisu/sakura/sakura/files	\N	13	approved	2026-01-17 17:04:29.373155	\N	\N	Open Source	\N	https://launchpad.net/sakura	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
965	st	st is a simple terminal implementation for X.	37	{linux}	https://git.suckless.org/st	\N	13	approved	2026-01-17 17:04:29.373827	\N	\N	Open Source	\N	https://st.suckless.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
966	Terminator	Feature filled terminal emulator that supports tabs and grids.	37	{linux}	https://github.com/gnome-terminator/terminator	\N	13	approved	2026-01-17 17:04:29.374449	\N	\N	Open Source	\N	https://github.com/gnome-terminator/terminator	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
967	Tabby	Modern, highly configurable terminal app based on web technologies.	37	{linux}	https://github.com/Eugeny/tabby	\N	13	approved	2026-01-17 17:04:29.375049	\N	\N	Open Source	\N	https://tabby.sh	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
968	Terminology	The pretty and lightweight terminal from the Enlightenment Desktop, it's highly configurable, it works in X11, under a Wayland compositor and even directly in the framebuffer on Linux. Replace your boring text-mode VT with a graphical one that requires no display system.	37	{linux}	https://github.com/billiob/terminology	\N	13	approved	2026-01-17 17:04:29.375668	\N	\N	Open Source	\N	https://www.enlightenment.org/about-terminology	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
969	Termit	Simple terminal emulator based on vte library, extensible via Lua.	37	{linux}	https://github.com/nonstop/termit	\N	13	approved	2026-01-17 17:04:29.376321	\N	\N	Open Source	\N	https://github.com/nonstop/termit	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
970	Termius	Cross-platform terminal with built-in SSH and Telnet.	37	{linux}	https://www.termius.com/	\N	13	approved	2026-01-17 17:04:29.37693	\N	\N	Freeware	\N	https://www.termius.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
971	Tilda	A Gtk based drop down terminal for Linux and Unix.	37	{linux}	https://github.com/lanoxx/tilda	\N	13	approved	2026-01-17 17:04:29.377623	\N	\N	Open Source	\N	https://github.com/lanoxx/tilda	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
972	Tilix	A tiling terminal emulator for Linux using GTK+ 3.	37	{linux}	https://github.com/gnunn1/tilix	\N	13	approved	2026-01-17 17:04:29.37828	\N	\N	Open Source	\N	https://gnunn1.github.io/tilix-web/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
973	Twin	Fast, lightweight text-mode window environment with mouse support. Enables multiple terminals in a single Linux console, terminal or X11 window. It can be detached (keeps running in background) and reattached to a different console, terminal or X11 server. Works on Linux, Mac OS X and BSD.	37	{linux}	https://github.com/cosmos72/twin	\N	13	approved	2026-01-17 17:04:29.378905	\N	\N	Open Source	\N	https://github.com/cosmos72/twin/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
974	Visidata	A terminal spreadsheet multitool for discovering and arranging data.	37	{linux}	https://github.com/saulpw/visidata	\N	13	approved	2026-01-17 17:04:29.379527	\N	\N	Open Source	\N	https://visidata.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
975	Wave Terminal	Wave is an open-source, AI-native terminal built for seamless developer workflows with inline rendering, a modern UI, and persistent sessions.	37	{linux}	https://github.com/wavetermdev/waveterm	\N	13	approved	2026-01-17 17:04:29.380457	\N	\N	Open Source	\N	https://waveterm.dev/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
976	WezTerm	A GPU-accelerated cross-platform terminal emulator and multiplexer written by @wez and implemented in Rust.	37	{linux}	https://github.com/wez/wezterm	\N	13	approved	2026-01-17 17:04:29.381134	\N	\N	Open Source	\N	https://wezfurlong.org/wezterm/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
977	Xterm	The Xterm program is a terminal emulator for the X Window System. It provides DEC VT102 and Tektronix 4014 compatible terminals for programs that can't use the window system directly.	37	{linux}	https://invisible-island.net/xterm/	\N	13	approved	2026-01-17 17:04:29.381786	\N	\N	Open Source	\N	https://invisible-island.net/xterm/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
978	Yakuake	A Quake-style terminal emulator based on KDE Konsole technology.	37	{linux}	https://invent.kde.org/utilities/yakuake	\N	13	approved	2026-01-17 17:04:29.382423	\N	\N	Open Source	\N	https://apps.kde.org/yakuake/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
979	Zellij	A terminal workspace and multiplexer. Letting you open several panes and tabs to run different programs, share a terminal session with others and more. Very user friendly and intuitive.	37	{linux}	https://github.com/zellij-org/zellij	\N	13	approved	2026-01-17 17:04:29.38324	\N	\N	Open Source	\N	https://zellij.dev/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
980	Bluefish	Bluefish is a powerful editor targeted towards programmers and web developers, with many options to write websites, scripts and programming code.	127	{linux}	https://sourceforge.net/p/bluefish/code/HEAD/tree/trunk/bluefish/	\N	13	approved	2026-01-17 17:04:29.383835	\N	\N	Open Source	\N	https://bluefish.openoffice.nl/index.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
981	Brackets	A modern text editor that understands web design.	127	{linux}	https://github.com/adobe/brackets	\N	13	approved	2026-01-17 17:04:29.384464	\N	\N	Open Source	\N	https://brackets.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
982	CudaText	CudaText is a cross-platform text editor, written in Object Pascal.	127	{linux}	https://github.com/Alexey-T/CudaText	\N	13	approved	2026-01-17 17:04:29.385296	\N	\N	Open Source	\N	https://cudatext.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
983	Fleet	The Code Editor and IDE for Any Language.	127	{linux}	https://www.jetbrains.com/fleet	\N	13	approved	2026-01-17 17:04:29.38598	\N	\N	Commercial	\N	https://www.jetbrains.com/fleet	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
984	Geany	Geany is a text editor using the GTK+ toolkit with basic features of an integrated development environment. It was developed to provide a small and fast IDE, which has only a few dependencies from other packages.	127	{linux}	https://www.geany.org/Download/Git	\N	13	approved	2026-01-17 17:04:29.386611	\N	\N	Open Source	\N	https://www.geany.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
985	Gedit	Gedit is the GNOME text editor. While aiming at simplicity and ease of use, gedit is a powerful general purpose text editor.	127	{linux}	https://gitlab.gnome.org/GNOME/gedit	\N	13	approved	2026-01-17 17:04:29.387246	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Gedit	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
986	GNOME Builder	Powerful IDE for modern C / C++ / Bash / JavaScript development, made by Gnome Team. One of the best IDE for C/C++ development (Cmake integrated).	127	{linux}	https://github.com/GNOME/gnome-builder	\N	13	approved	2026-01-17 17:04:29.387913	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Builder	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
987	Helix	A post-modern modal text editor.	127	{linux}	https://github.com/helix-editor/helix	\N	13	approved	2026-01-17 17:04:29.388746	\N	\N	Open Source	\N	https://helix-editor.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
988	Kate	Kate is a multi-document editor part of KDE since release 2.2.	127	{linux}	https://kate-editor.org/build-it/	\N	13	approved	2026-01-17 17:04:29.389358	\N	\N	Open Source	\N	https://kate-editor.org/get-it/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
989	Komodo Edit	Free and open source multilanguage development environment.	127	{linux}	https://github.com/Komodo/KomodoEdit	\N	13	approved	2026-01-17 17:04:29.390011	\N	\N	Open Source	\N	https://www.activestate.com/products/komodo-edit/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
990	Lapce	Lightning-fast and Powerful Code Editor written in Rust.	127	{linux}	https://github.com/lapce/lapce	\N	13	approved	2026-01-17 17:04:29.390621	\N	\N	Open Source	\N	https://lap.dev/lapce/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
991	Lighttable	The next generation code editor! Support live coding.	127	{linux}	https://github.com/LightTable/LightTable	\N	13	approved	2026-01-17 17:04:29.39125	\N	\N	Open Source	\N	http://lighttable.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
992	Pulsar	A Community-led Hyper-Hackable Text Editor, Forked from Atom, built on Electron.	127	{linux}	https://github.com/pulsar-edit/pulsar	\N	13	approved	2026-01-17 17:04:29.391865	\N	\N	Open Source	\N	https://pulsar-edit.dev/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
993	Sublime	A very capable text editor with advanced search capabilities, and many powerful plugins to improve its functionality.	127	{linux}	https://www.sublimetext.com/	\N	13	approved	2026-01-17 17:04:29.392486	\N	\N	Commercial	\N	https://www.sublimetext.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
994	Textadept	Minimalist text editor for programmers. Textadept is extensible with Lua programming language.	127	{linux}	https://github.com/orbitalquark/textadept	\N	13	approved	2026-01-17 17:04:29.393179	\N	\N	Open Source	\N	https://orbitalquark.github.io/textadept/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
995	VSCode	Visual Studio Code is a lightweight but powerful source code editor which runs on your desktop and is available for Windows, OS X and Linux. It comes with built-in support for JavaScript, TypeScript and Node.js and has a rich ecosystem of extensions for other languages (C++, C#, Python, PHP, Golang) and runtimes.	127	{linux}	https://github.com/Microsoft/vscode	\N	13	approved	2026-01-17 17:04:29.393869	\N	\N	Open Source	\N	https://code.visualstudio.com	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
996	VSCodium	Binary releases of VS Code without MS branding/telemetry/licensing.	127	{linux}	https://github.com/VSCodium/vscodium	\N	13	approved	2026-01-17 17:04:29.394777	\N	\N	Open Source	\N	https://vscodium.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
997	ZeroBrane Studio	A mature, lightweight, cross-platform Lua IDE with modern development features.	127	{linux}	https://github.com/pkulchenko/ZeroBraneStudio	\N	13	approved	2026-01-17 17:04:29.395404	\N	\N	Open Source	\N	https://studio.zerobrane.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
998	AstroNvim	AstroNvim is an aesthetic and feature-rich neovim config that is extensible and easy to use with a great set of plugins.	128	{linux}	https://github.com/AstroNvim/AstroNvim	\N	13	approved	2026-01-17 17:04:29.396012	\N	\N	Open Source	\N	https://astronvim.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
999	Doom Emacs	An Emacs framework for the stubborn martian hacker.	128	{linux}	https://github.com/doomemacs/doomemacs	\N	13	approved	2026-01-17 17:04:29.396662	\N	\N	Open Source	\N	https://github.com/doomemacs/doomemacs	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1000	Emacs	An extensible, customizable, free/libre text editor — and more.	128	{linux}	https://github.com/emacs-mirror/emacs	\N	13	approved	2026-01-17 17:04:29.397278	\N	\N	Open Source	\N	https://www.gnu.org/software/emacs/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1001	Kakoune	Kakoune code editor - Vim inspired. Faster as in less keystrokes. Multiple selections. Orthogonal design. Has a strong focus on interactivity.	128	{linux}	https://github.com/mawww/kakoune	\N	13	approved	2026-01-17 17:04:29.397912	\N	\N	Open Source	\N	https://kakoune.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1002	LunarVim	LunarVim is an opinionated, extensible, and fast IDE layer for Neovim.	128	{linux}	https://github.com/LunarVim/LunarVim	\N	13	approved	2026-01-17 17:04:29.398523	\N	\N	Open Source	\N	https://www.lunarvim.org/#opinionated	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1003	Neovide	Neovide is a cross-platform GUI for Neovim written in Rust with graphical improvements and more visual flair.	128	{linux}	https://github.com/neovide/neovide/	\N	13	approved	2026-01-17 17:04:29.399149	\N	\N	Open Source	\N	https://neovide.dev/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1004	Neovim	Neovim is a fork of Vim aiming to improve user experience, plugins, and GUIs.	128	{linux}	https://github.com/neovim/neovim	\N	13	approved	2026-01-17 17:04:29.399712	\N	\N	Open Source	\N	https://neovim.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1005	NvChad	An attempt to make neovim cli functional like an IDE while being very beautiful and blazing fast.	128	{linux}	https://github.com/NvChad/NvChad	\N	13	approved	2026-01-17 17:04:29.400304	\N	\N	Open Source	\N	https://nvchad.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1006	Spacemacs	A community-driven Emacs distribution.	128	{linux}	https://github.com/syl20bnr/spacemacs	\N	13	approved	2026-01-17 17:04:29.40095	\N	\N	Open Source	\N	https://www.spacemacs.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1007	SpaceVim	A community-driven modular vim distribution.	128	{linux}	https://github.com/SpaceVim/SpaceVim	\N	13	approved	2026-01-17 17:04:29.401579	\N	\N	Open Source	\N	https://spacevim.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1008	Vim	Vim is an advanced text editor that seeks to provide the power of the de-facto Unix editor 'Vi', with a more complete feature set. It's useful whether you're already using vi or using a different editor.	128	{linux}	https://github.com/vim/vim	\N	13	approved	2026-01-17 17:04:29.402272	\N	\N	Open Source	\N	https://www.vim.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1009	Micro	Micro is a terminal-based text editor that aims to be easy to use and intuitive, while also taking advantage of the full capabilities of modern terminals.	129	{linux}	https://github.com/zyedidia/micro	\N	13	approved	2026-01-17 17:04:29.403008	\N	\N	Open Source	\N	https://micro-editor.github.io	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1010	Nano	GNU Nano is a text editor which aims to introduce a simple interface and intuitive command options to console based text editing.	129	{linux}	http://git.savannah.gnu.org/cgit/nano.git/	\N	13	approved	2026-01-17 17:04:29.404061	\N	\N	Open Source	\N	https://www.nano-editor.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1011	KWrite	KWrite is a text editor by KDE, based on the Kate's editor component.	129	{linux}	https://invent.kde.org/utilities/kate	\N	13	approved	2026-01-17 17:04:29.404735	\N	\N	Open Source	\N	https://apps.kde.org/kwrite/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1012	Notepadqq	Notepadqq is a Notepad++-like editor for the Linux desktop.	129	{linux}	https://github.com/notepadqq/notepadqq	\N	13	approved	2026-01-17 17:04:29.405516	\N	\N	Open Source	\N	https://notepadqq.com/wp/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1013	Notepad Next	A cross-platform, reimplementation of Notepad++.	129	{linux}	https://github.com/dail8859/NotepadNext	\N	13	approved	2026-01-17 17:04:29.406627	\N	\N	Open Source	\N	https://github.com/dail8859/NotepadNext	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1014	Brasero	A capable CD/DVD burner.	130	{linux}	https://github.com/GNOME/brasero	\N	13	approved	2026-01-17 17:04:29.407418	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Brasero	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1015	Clonezilla	Clonezilla is a partition and disk imaging/cloning program similar to True Image® or Norton Ghost®.	130	{linux}	https://clonezilla.org/related-links/	\N	13	approved	2026-01-17 17:04:29.408405	\N	\N	Open Source	\N	https://clonezilla.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1016	DBAN	Delete information stored on hard disk drives (HDDs) in PC laptops, desktops or servers.	130	{linux}	https://sourceforge.net/projects/dban/	\N	13	approved	2026-01-17 17:04:29.409402	\N	\N	Open Source	\N	https://dban.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1017	Diskonaut	A disk space visualizer and navigator for the terminal.	130	{linux}	https://github.com/imsnif/diskonaut	\N	13	approved	2026-01-17 17:04:29.411067	\N	\N	Open Source	\N	https://github.com/imsnif/diskonaut	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1018	Duc	Duc, a library and suite of tools for indexing, and visualizing inspecting disk usage.	130	{linux}	https://github.com/zevv/duc	\N	13	approved	2026-01-17 17:04:29.412153	\N	\N	Open Source	\N	https://duc.zevv.nl/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1019	Etcher	Flash OS images to SD cards & USB drives, safely and easily.	130	{linux}	https://github.com/balena-io/etcher	\N	13	approved	2026-01-17 17:04:29.413171	\N	\N	Open Source	\N	https://etcher.balena.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1020	GParted	Disk Partition utility for Linux.	130	{linux}	https://github.com/GNOME/gparted	\N	13	approved	2026-01-17 17:04:29.414345	\N	\N	Open Source	\N	https://gparted.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1021	KDiskMark	A simple open-source disk benchmark tool for Linux distros, similar to CrystalDiskmark on Windows.	130	{linux}	https://github.com/JonMagon/KDiskMark	\N	13	approved	2026-01-17 17:04:29.415037	\N	\N	Open Source	\N	https://github.com/JonMagon/KDiskMark	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1022	KFloppy	Graphical utility to format 3.5" and 5.25" floppy disks.	130	{linux}	https://invent.kde.org/utilities/kfloppy	\N	13	approved	2026-01-17 17:04:29.4157	\N	\N	Open Source	\N	https://apps.kde.org/kfloppy/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1023	MultiBootUSB	MultiBootUSB allows you to install multiple live linux on a USB disk.	130	{linux}	https://github.com/mbusb/multibootusb	\N	13	approved	2026-01-17 17:04:29.41631	\N	\N	Open Source	\N	https://github.com/mbusb/multibootusb	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1024	Popsicle	Popsicle is a Linux utility for flashing multiple USB devices in parallel, written in Rust.	130	{linux}	https://github.com/pop-os/popsicle	\N	13	approved	2026-01-17 17:04:29.41707	\N	\N	Open Source	\N	https://github.com/pop-os/popsicle	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1025	Unetbootin	UNetbootin allows you to create bootable Live USB drives for Ubuntu and other Linux distributions. You can either let UNetbootin download one of the many distributions supported out-of-the-box for you, or supply your own Linux .iso file.	130	{linux}	https://github.com/unetbootin/unetbootin	\N	13	approved	2026-01-17 17:04:29.417686	\N	\N	Open Source	\N	https://unetbootin.github.io	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1026	Ventoy	A new bootable USB solution.	130	{linux}	https://github.com/ventoy/Ventoy	\N	13	approved	2026-01-17 17:04:29.418334	\N	\N	Open Source	\N	https://www.ventoy.net/en/index.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1027	Aptik	A tool for you to organize your Favorite PPAs and manage Packages Easily.	131	{linux}	https://code.launchpad.net/~teejee2008/apt-toolkit/trunk	\N	13	approved	2026-01-17 17:04:29.418947	\N	\N	Open Source	\N	https://launchpad.net/apt-toolkit	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1377	Dar	Which stands for Disk ARchive, is a robust and rich featured archiving and backup software of the tar style	147	{Linux,Mac,Windows}	https://github.com/Edrusb/DAR	\N	1	approved	2026-01-17 17:48:41.224026	\N	\N	GPL-2.0	\N	\N	\N	software
1028	AppImageLauncher	Helper application for Linux distributions serving as a kind of "entry point" for running and integrating AppImages.	131	{linux}	https://github.com/TheAssassin/AppImageLauncher	\N	13	approved	2026-01-17 17:04:29.419551	\N	\N	Open Source	\N	https://github.com/TheAssassin/AppImageLauncher	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1029	AppImage Pool	A simple, modern AppImageHub Client.	131	{linux}	https://github.com/prateekmedia/appimagepool	\N	13	approved	2026-01-17 17:04:29.420294	\N	\N	Open Source	\N	https://github.com/prateekmedia/appimagepool	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1030	bauh	Graphical user interface for managing your Linux applications. Supports AppImage, Arch packages (including AUR), Debian packages, Flatpak, Snap and native Web applications.	131	{linux}	https://github.com/vinifmor/bauh	\N	13	approved	2026-01-17 17:04:29.421004	\N	\N	Open Source	\N	https://github.com/vinifmor/bauh	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1031	dconf Editor	Simple configuration storage system - graphical editor.	131	{linux}	https://github.com/GNOME/dconf-editor	\N	13	approved	2026-01-17 17:04:29.421948	\N	\N	Open Source	\N	https://github.com/GNOME/dconf-editor	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1033	Nix	Nix is a powerful package manager for Linux and other Unix systems that makes package management reliable and reproducible.	131	{linux}	https://github.com/NixOS/nix	\N	13	approved	2026-01-17 17:04:29.423864	\N	\N	Open Source	\N	https://nixos.org/download.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1034	Paru	Paru is your standard pacman wrapping AUR helper with lots of features and minimal interaction.	131	{linux}	https://github.com/morganamilo/paru	\N	13	approved	2026-01-17 17:04:29.424867	\N	\N	Open Source	\N	https://github.com/morganamilo/paru	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1035	rmlint	rmlint finds space waste and other broken things on your filesystem and offers to remove it.	131	{linux}	https://github.com/sahib/rmlint	\N	13	approved	2026-01-17 17:04:29.425848	\N	\N	Open Source	\N	https://rmlint.readthedocs.io/en/latest/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1036	Stacer	The most well known Ubuntu System Optimizer.	131	{linux}	https://github.com/oguzhaninan/Stacer	\N	13	approved	2026-01-17 17:04:29.426955	\N	\N	Open Source	\N	https://oguzhaninan.github.io/Stacer-Web/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1037	Synaptic	Synaptic is a graphical package management program for apt.	131	{linux}	http://download.savannah.nongnu.org/releases/synaptic/	\N	13	approved	2026-01-17 17:04:29.428284	\N	\N	Open Source	\N	https://www.nongnu.org/synaptic/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1038	UbuntuCleaner	Ubuntu Cleaner is a tool that makes it easy to clean your Ubuntu system.	131	{linux}	https://github.com/gerardpuig/ubuntu-cleaner	\N	13	approved	2026-01-17 17:04:29.429107	\N	\N	Open Source	\N	https://github.com/gerardpuig/ubuntu-cleaner	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1039	Yay	Yet another Yogurt - An AUR Helper written in Go.	131	{linux}	https://github.com/Jguer/yay	\N	13	approved	2026-01-17 17:04:29.429836	\N	\N	Open Source	\N	https://github.com/Jguer/yay	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1040	bandwhich	Terminal bandwidth utilization tool.	132	{linux}	https://github.com/imsnif/bandwhich	\N	13	approved	2026-01-17 17:04:29.430517	\N	\N	Open Source	\N	https://github.com/imsnif/bandwhich	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1041	CoreCtrl	CoreCtrl is a Free and Open Source GNU/Linux application that allows you to control with ease your computer hardware using application profiles. It aims to be flexible, comfortable and accessible to regular users.	132	{linux}	https://gitlab.com/corectrl/corectrl	\N	13	approved	2026-01-17 17:04:29.431261	\N	\N	Open Source	\N	https://gitlab.com/corectrl/corectrl	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1042	CPU-G	Easy monitoring the battery life of your Ubuntu laptop.	132	{linux}	https://bazaar.launchpad.net/~cpug-devs/cpug/main/files	\N	13	approved	2026-01-17 17:04:29.432004	\N	\N	Open Source	\N	https://launchpad.net/cpug	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1043	cpupower-gui	Graphical program to easily change the frequency limits and governors of the CPU, similar to cpupower.	132	{linux}	https://github.com/vagnum08/cpupower-gui	\N	13	approved	2026-01-17 17:04:29.432755	\N	\N	Open Source	\N	https://github.com/vagnum08/cpupower-gui	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1044	CPU-X	CPU-X is a Free software that gathers information on CPU, motherboard and more.	132	{linux}	https://github.com/TheTumultuousUnicornOfDarkness/CPU-X	\N	13	approved	2026-01-17 17:04:29.433434	\N	\N	Open Source	\N	https://thetumultuousunicornofdarkness.github.io/CPU-X/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1045	Filelight	Filelight is an application to visualize the disk usage on your computer by showing folders using an easy-to-understand view of concentric rings. Filelight makes it simple to free up space!	132	{linux}	https://invent.kde.org/utilities/filelight	\N	13	approved	2026-01-17 17:04:29.43408	\N	\N	Open Source	\N	https://apps.kde.org/filelight/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1046	GD map	A tool to visualize disk usage.	132	{linux}	https://gdmap.sourceforge.net/	\N	13	approved	2026-01-17 17:04:29.434712	\N	\N	Freeware	\N	https://gdmap.sourceforge.net/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
1047	indicator-cpufreq	It provides the same functionality as the GNOME CPU frequency applet, but doesn't require GNOME panel and works under Unity.	132	{linux}	https://bazaar.launchpad.net/~artfwo/indicator-cpufreq/trunk/files	\N	13	approved	2026-01-17 17:04:29.435419	\N	\N	Open Source	\N	https://launchpad.net/indicator-cpufreq	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1048	indicator-multiload	Graphical system load indicator for CPU, ram, etc.	132	{linux}	https://launchpad.net/ubuntu/+source/indicator-multiload	\N	13	approved	2026-01-17 17:04:29.436108	\N	\N	Open Source	\N	https://launchpad.net/ubuntu/+source/indicator-multiload	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1071	GNOME-Pie	The circular app launcher for Linux desktops.	121	{linux}	https://github.com/Simmesimme/Gnome-Pie	\N	13	approved	2026-01-17 17:04:29.452268	\N	\N	Open Source	\N	https://schneegans.github.io/gnome-pie.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1049	Indicator-SysMonitor	An Application Indicator showing cpu temperature, memory, network speed, cpu usage, public IP address and internet connection status.	132	{linux}	https://github.com/fossfreedom/indicator-sysmonitor	\N	13	approved	2026-01-17 17:04:29.437004	\N	\N	Open Source	\N	https://github.com/fossfreedom/indicator-sysmonitor	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1050	Ncdu	A disk usage analyzer with an ncurses interface.	132	{linux}	https://g.blicky.net/ncdu.git/	\N	13	approved	2026-01-17 17:04:29.438278	\N	\N	Open Source	\N	https://dev.yorhel.nl/ncdu	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1051	SysMonTask	Linux system monitor with the compactness and usefulness of windows task manager to allow higher control and monitoring.	132	{linux}	https://github.com/KrispyCamel4u/SysMonTask/	\N	13	approved	2026-01-17 17:04:29.438961	\N	\N	Open Source	\N	https://github.com/KrispyCamel4u/SysMonTask/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1052	NetData	Next-gen web based real-time performance and health monitoring for physical and virtual servers, containers and IoT devices. It is also a distributed `statsd` server with automatic visualization for APM (applications performance monitoring).	132	{linux}	https://github.com/netdata/netdata	\N	13	approved	2026-01-17 17:04:29.439712	\N	\N	Open Source	\N	https://www.netdata.cloud/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1053	Systemload	A program that shows current system load in a status bar.	132	{linux}	https://bazaar.launchpad.net/~indicator-multiload/indicator-multiload/trunk/files	\N	13	approved	2026-01-17 17:04:29.440367	\N	\N	Open Source	\N	https://launchpad.net/indicator-multiload	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1054	vnStat	vnStat is a console-based network traffic monitor that uses the network interface statistics provided by the kernel as information source. This means that vnStat won't actually be sniffing any traffic and also ensures light use of system resources regardless of network traffic rate.	132	{linux}	https://github.com/vergoh/vnstat	\N	13	approved	2026-01-17 17:04:29.440995	\N	\N	Open Source	\N	https://humdi.net/vnstat/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1055	Alien Package Converter	Package converter. Converts between RPM, DPKG, SLP, and TGZ package formats.	121	{linux}	https://sourceforge.net/projects/alien-pkg-convert/files/	\N	13	approved	2026-01-17 17:04:29.441607	\N	\N	Open Source	\N	https://sourceforge.net/projects/alien-pkg-convert/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1056	Angry IP Scanner	Fast and friendly network scanner.	121	{linux}	https://github.com/angryip/ipscan	\N	13	approved	2026-01-17 17:04:29.4422	\N	\N	Open Source	\N	https://angryip.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1057	AntiMicroX	Graphical program used to map keyboard buttons and mouse controls to a gamepad. Useful for playing games with no gamepad support.	121	{linux}	https://github.com/AntiMicroX/antimicrox/	\N	13	approved	2026-01-17 17:04:29.442792	\N	\N	Open Source	\N	https://github.com/AntiMicroX/antimicrox/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1058	BlueZ	Official Linux Bluetooth protocol stack.	121	{linux}	https://git.kernel.org/pub/scm/bluetooth/bluez.git	\N	13	approved	2026-01-17 17:04:29.443388	\N	\N	Open Source	\N	https://www.bluez.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1059	Cheat	Cheat allows you to create and view interactive cheatsheets on the command-line.	121	{linux}	https://github.com/cheat/cheat	\N	13	approved	2026-01-17 17:04:29.444148	\N	\N	Open Source	\N	https://github.com/cheat/cheat	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1060	Convertall	A program that can convert many units of measurement to other units.	121	{linux}	https://convertall.bellz.org/download.html	\N	13	approved	2026-01-17 17:04:29.444787	\N	\N	Open Source	\N	https://sourceforge.net/projects/convertall/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1061	Curlew	A GTK media converter for the GNOME desktop.	121	{linux}	https://github.com/chamfay/Curlew	\N	13	approved	2026-01-17 17:04:29.445496	\N	\N	Open Source	\N	https://github.com/chamfay/Curlew	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1062	deb-get	Deb-get makes is easy to install and update .debs published in 3rd party apt repositories or made available via direct download on websites or GitHub release pages.	121	{linux}	https://github.com/wimpysworld/deb-get	\N	13	approved	2026-01-17 17:04:29.446127	\N	\N	Open Source	\N	https://github.com/wimpysworld/deb-get	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1063	dmenu	dmenu is a dynamic menu for X, originally designed for dwm. It manages large numbers of user-defined menu items efficiently.	121	{linux}	https://git.suckless.org/dmenu/	\N	13	approved	2026-01-17 17:04:29.446958	\N	\N	Open Source	\N	https://tools.suckless.org/dmenu/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1064	Droidcam	DroidCam turns your Android device into a wireless webcam for your PC.	121	{linux}	https://github.com/dev47apps/droidcam	\N	13	approved	2026-01-17 17:04:29.447611	\N	\N	Open Source	\N	https://www.dev47apps.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1065	EasyStroke	Easystroke is a gesture-recognition application for X11.	121	{linux}	https://github.com/thjaeger/easystroke	\N	13	approved	2026-01-17 17:04:29.44824	\N	\N	Open Source	\N	https://github.com/thjaeger/easystroke	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1066	Emoji Keyboard	Virtual keyboard-like emoji picker for Linux.	121	{linux}	https://github.com/OzymandiasTheGreat/emoji-keyboard	\N	13	approved	2026-01-17 17:04:29.448929	\N	\N	Open Source	\N	https://github.com/OzymandiasTheGreat/emoji-keyboard	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1067	fast-cli	Test your download and upload speed using fast.com.	121	{linux}	https://github.com/sindresorhus/fast-cli	\N	13	approved	2026-01-17 17:04:29.449605	\N	\N	Open Source	\N	https://github.com/sindresorhus/fast-cli	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1068	Flatseal	Flatseal is a graphical utility to review and modify permissions from your Flatpak applications.	121	{linux}	https://github.com/tchx84/flatseal	\N	13	approved	2026-01-17 17:04:29.450265	\N	\N	Open Source	\N	https://github.com/tchx84/flatseal	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1069	FreeRDP	FreeRDP is a free implementation of the Remote Desktop Protocol (RDP).	121	{linux}	https://github.com/FreeRDP/FreeRDP	\N	13	approved	2026-01-17 17:04:29.450948	\N	\N	Open Source	\N	https://www.freerdp.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1070	Glow	Render markdown on the CLI, with pizzazz! 💅🏻	121	{linux}	https://charm.sh/apps/	\N	13	approved	2026-01-17 17:04:29.451624	\N	\N	Open Source	\N	https://github.com/charmbracelet/glow	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1072	GPT4All	gpt4all: an ecosystem of open-source chatbots trained on a massive collection of clean assistant data including code, stories and dialogue	121	{linux}	https://github.com/nomic-ai/gpt4all	\N	13	approved	2026-01-17 17:04:29.452899	\N	\N	Open Source	\N	https://www.nomic.ai/gpt4all	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1073	Gramps	Research, organize and share your family tree with Gramps.	121	{linux}	https://github.com/gramps-project/gramps	\N	13	approved	2026-01-17 17:04:29.45362	\N	\N	Open Source	\N	https://gramps-project.org/blog/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1074	GSConnect	KDE Connect implementation for GNOME.	121	{linux}	https://github.com/GSConnect/gnome-shell-extension-gsconnect	\N	13	approved	2026-01-17 17:04:29.454307	\N	\N	Open Source	\N	https://extensions.gnome.org/extension/1319/gsconnect/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1075	HydraPaper	Wallpaper manager with multi monitor support.	121	{linux}	https://gitlab.gnome.org/GabMus/HydraPaper	\N	13	approved	2026-01-17 17:04:29.454997	\N	\N	Open Source	\N	https://hydrapaper.gabmus.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1076	KDE-Connect	A tool, that allows one to integrate the Linux desktop with an Android smartphone and can be used to send files to and from the phone and the linux desktop, use the phone as a trackpad, control the desktop media player using the phone, and lots more.	121	{linux}	https://invent.kde.org/network/kdeconnect-kde	\N	13	approved	2026-01-17 17:04:29.45574	\N	\N	Open Source	\N	https://apps.kde.org/kdeconnect/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1077	Keynav	Keynav is a piece of an on-going experiment to make pointer-driven interfaces easier and faster for users to operate. It lets you move the pointer quickly to most points on the screen with only a few keystrokes.	121	{linux}	https://github.com/jordansissel/keynav	\N	13	approved	2026-01-17 17:04:29.456484	\N	\N	Open Source	\N	https://www.semicomplete.com/projects/keynav/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1078	Komorebi	Komorebi is a background manager for all Linux platforms, provides fully customizable backgrounds that can be tweaked at any time.	121	{linux}	https://github.com/cheesecakeufo/komorebi	\N	13	approved	2026-01-17 17:04:29.457135	\N	\N	Open Source	\N	https://github.com/cheesecakeufo/komorebi	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1079	mapscii	MapSCII is a Braille & ASCII world map renderer for your console.	121	{linux}	https://github.com/rastapasta/mapscii	\N	13	approved	2026-01-17 17:04:29.458653	\N	\N	Open Source	\N	https://github.com/rastapasta/mapscii	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1080	Mosh	Mosh is a Remote terminal application that allows roaming, supports intermittent connectivity, and provides intelligent local echo and line editing of user keystrokes.	121	{linux}	https://github.com/mobile-shell/mosh	\N	13	approved	2026-01-17 17:04:29.459399	\N	\N	Open Source	\N	https://mosh.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1081	Nmap	Nmap is a free, open-source tool for network exploration, management, and security auditing.	121	{linux}	https://github.com/nmap/nmap	\N	13	approved	2026-01-17 17:04:29.460076	\N	\N	Open Source	\N	https://nmap.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1082	Nativefier	Make any web page a desktop application.	121	{linux}	https://github.com/jiahaog/nativefier	\N	13	approved	2026-01-17 17:04:29.460806	\N	\N	Open Source	\N	https://github.com/jiahaog/nativefier	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1083	PeaExtractor	A utility designed to unzip files and be as frictionless as possible, and easy to use as possible.	121	{linux}	https://sourceforge.net/projects/peaextractor/files/	\N	13	approved	2026-01-17 17:04:29.461469	\N	\N	Open Source	\N	https://sourceforge.net/projects/peaextractor/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1084	Peazip	A utility to unzip any of a huge variety of compression formats.	121	{linux}	https://sourceforge.net/projects/peazip/files/	\N	13	approved	2026-01-17 17:04:29.462115	\N	\N	Open Source	\N	https://sourceforge.net/projects/peazip/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1085	Pi-Hole	Network-wide ad blocking via your own Linux hardware, using DNS filtering and re-direction Pi-Hole can block ads on a whole network, so Smartphones and Game Consoles can benefit from it in addition to computers.	121	{linux}	https://github.com/pi-hole/pi-hole	\N	13	approved	2026-01-17 17:04:29.462687	\N	\N	Open Source	\N	https://pi-hole.net	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1086	PipeWire	PipeWire is a project that aims to greatly improve handling of audio and video under Linux.	121	{linux}	https://gitlab.freedesktop.org/pipewire/pipewire	\N	13	approved	2026-01-17 17:04:29.463382	\N	\N	Open Source	\N	https://pipewire.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1087	PlexyDesk	Plexydesk supports multiple widget workspaces/desktops on Linux.	121	{linux}	https://www.omgubuntu.co.uk/2016/09/plexydesk-widgets-linux-desktop-ppa	\N	13	approved	2026-01-17 17:04:29.463994	\N	\N	Freeware	\N	https://www.omgubuntu.co.uk/2016/09/plexydesk-widgets-linux-desktop-ppa	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
1088	Powertop	A tool that can help diagnose issues with power consumption in Linux.	121	{linux}	https://github.com/fenrus75/powertop	\N	13	approved	2026-01-17 17:04:29.464665	\N	\N	Open Source	\N	https://github.com/fenrus75/powertop	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1089	Pulse Audio	Improve Linux Audio with customized Profiles.	121	{linux}	https://github.com/pulseaudio/pulseaudio	\N	13	approved	2026-01-17 17:04:29.465271	\N	\N	Open Source	\N	https://wiki.ubuntu.com/PulseAudio	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1090	Remmina	A feature-rich remote desktop application for Linux and other UNIXes.	121	{linux}	https://github.com/FreeRDP/Remmina	\N	13	approved	2026-01-17 17:04:29.466291	\N	\N	Open Source	\N	https://remmina.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1091	rofi	A window switcher, Application launcher and dmenu replacement.	121	{linux}	https://github.com/davatorium/rofi	\N	13	approved	2026-01-17 17:04:29.466912	\N	\N	Open Source	\N	https://github.com/davatorium/rofi	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1092	scrcpy	Display and control your Android device.	121	{linux}	https://github.com/Genymobile/scrcpy	\N	13	approved	2026-01-17 17:04:29.467544	\N	\N	Open Source	\N	https://github.com/Genymobile/scrcpy	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1093	Solaar	Logitech Unifying Receiver peripherals manager for Linux.	121	{linux}	https://github.com/pwr-Solaar/Solaar	\N	13	approved	2026-01-17 17:04:29.468163	\N	\N	Open Source	\N	https://github.com/pwr-Solaar/Solaar	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1094	Sushi	Sushi is a quick previewer for Nautilus, the GNOME desktop file manager.	121	{linux}	https://gitlab.gnome.org/GNOME/sushi	\N	13	approved	2026-01-17 17:04:29.468884	\N	\N	Open Source	\N	https://gitlab.gnome.org/GNOME/sushi	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1095	Touche	Easily configure your touchpad and touchscreen multi-touch gestures using Touchégg with this GTK graphical user interface.	121	{linux}	https://github.com/JoseExposito/touche	\N	13	approved	2026-01-17 17:04:29.469595	\N	\N	Open Source	\N	https://flathub.org/apps/details/com.github.joseexposito.touche	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1096	TightVNC	A Free, Lightweight, Fast and Reliable Remote Control / Remote Desktop Software.	121	{linux}	https://www.tightvnc.com/download.php	\N	13	approved	2026-01-17 17:04:29.470382	\N	\N	Open Source	\N	https://www.tightvnc.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1097	TLP	An application that can help optimize battery life on Linux.	121	{linux}	https://linrunner.de/en/tlp/docs/tlp-linux-advanced-power-management.html	\N	13	approved	2026-01-17 17:04:29.471113	\N	\N	Freeware	\N	https://linrunner.de/en/tlp/docs/tlp-linux-advanced-power-management.html	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
1098	TMSU	TMSU lets you tags your files and then access them through a nifty virtual filesystem from any other application.	121	{linux}	https://github.com/oniony/TMSU	\N	13	approved	2026-01-17 17:04:29.471738	\N	\N	Open Source	\N	https://tmsu.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1099	Trimage	A cross-platform tool for losslessly optimizing PNG and JPG files.	121	{linux}	https://github.com/Kilian/Trimage	\N	13	approved	2026-01-17 17:04:29.472414	\N	\N	Open Source	\N	https://trimage.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1100	Ubunsys	An application designed to allow you to change in-depth system features without the command line.	121	{linux}	https://github.com/adgellida/ubunsys	\N	13	approved	2026-01-17 17:04:29.47305	\N	\N	Open Source	\N	https://github.com/adgellida/ubunsys	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1101	unsnap	Quickly migrate from using snap packages to flatpaks.	121	{linux}	https://github.com/popey/unsnap	\N	13	approved	2026-01-17 17:04:29.473684	\N	\N	Open Source	\N	https://github.com/popey/unsnap	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1102	Upscayl	Free and Open Source AI Image Upscaler.	121	{linux}	https://github.com/upscayl/upscayl	\N	13	approved	2026-01-17 17:04:29.474324	\N	\N	Open Source	\N	https://www.upscayl.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1103	USB network gate	Allows you to share USB ports over a Network on Linux.	121	{linux}	https://www.eltima.com/products/usb-over-ip-linux/	\N	13	approved	2026-01-17 17:04:29.474949	\N	\N	Freeware	\N	https://www.eltima.com/products/usb-over-ip-linux/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
1104	Variety	Variety is an open-source wallpaper changer for Linux, packed with great features, yet slim and easy to use.	121	{linux}	https://github.com/varietywalls/variety	\N	13	approved	2026-01-17 17:04:29.475872	\N	\N	Open Source	\N	https://github.com/varietywalls/variety/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1105	Wayland	Wayland is intended as a simpler replacement for X, easier to develop and maintain.	121	{linux}	https://gitlab.freedesktop.org/wayland	\N	13	approved	2026-01-17 17:04:29.476503	\N	\N	Open Source	\N	https://wayland.freedesktop.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1106	Workrave	A program that assists in the recovery and prevention of Repetitive Strain Injury (RSI).	121	{linux}	https://github.com/rcaelers/workrave	\N	13	approved	2026-01-17 17:04:29.477166	\N	\N	Open Source	\N	https://www.workrave.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1107	Bomi Player	A powerful and easy-to-use multimedia player.	39	{linux}	https://github.com/xylosper/bomi	\N	13	approved	2026-01-17 17:04:29.47782	\N	\N	Open Source	\N	https://bomi-player.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1108	Celluloid	Simple GTK+ frontend for mpv.	39	{linux}	https://github.com/celluloid-player/celluloid	\N	13	approved	2026-01-17 17:04:29.47849	\N	\N	Open Source	\N	https://celluloid-player.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1109	Cheese	Cheese uses your webcam to take photos and videos, applies fancy special effects and lets you share the fun with others.	39	{linux}	https://github.com/GNOME/cheese	\N	13	approved	2026-01-17 17:04:29.479283	\N	\N	Open Source	\N	https://wiki.gnome.org/Apps/Cheese	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1110	Clapper	A GNOME media player built using GJS with GTK4 toolkit and powered by GStreamer with OpenGL rendering.	39	{linux}	https://github.com/Rafostar/clapper	\N	13	approved	2026-01-17 17:04:29.479919	\N	\N	Open Source	\N	https://rafostar.github.io/clapper/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1111	Emby Theater	Emby Server's official media player.	39	{linux}	https://emby.media/emby-theater-linux.html	\N	13	approved	2026-01-17 17:04:29.480609	\N	\N	Freeware	\N	https://emby.media/emby-theater-linux.html	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
1112	FFmpeg	FFmpeg is a collection of libraries and tools to process multimedia content such as audio, video, subtitles and related metadata.	39	{linux}	https://github.com/FFmpeg/FFmpeg	\N	13	approved	2026-01-17 17:04:29.481269	\N	\N	Open Source	\N	https://www.ffmpeg.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1113	Haruna	Open source video player built with Qt/QML and libmpv.	39	{linux}	https://invent.kde.org/multimedia/haruna	\N	13	approved	2026-01-17 17:04:29.481896	\N	\N	Open Source	\N	https://haruna.kde.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1114	Jellyfin Media Player	Jellyfin Desktop Client based on Plex Media Player.	39	{linux}	https://github.com/jellyfin/jellyfin-media-player	\N	13	approved	2026-01-17 17:04:29.482589	\N	\N	Open Source	\N	https://jellyfin.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1115	Kamoso	Kamoso is a simple and friendly program to use your camera. Use it to take pictures and make videos to share.	39	{linux}	https://invent.kde.org/multimedia/kamoso	\N	13	approved	2026-01-17 17:04:29.483327	\N	\N	Open Source	\N	https://apps.kde.org/kamoso/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1116	Kodi	An award-winning free and open source (GPL) software media center for playing videos, music, pictures, games, and more.	39	{linux}	https://github.com/xbmc/xbmc	\N	13	approved	2026-01-17 17:04:29.484003	\N	\N	Open Source	\N	https://kodi.tv/about/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1472	jotgit	Git-backed real-time collaborative code editing. `MIT` `Nodejs`	159	{Linux}	https://github.com/jdleesmiller/jotgit	\N	1	approved	2026-01-17 17:48:41.318953	\N	\N	MIT	\N	\N	\N	software
1117	LosslessCut	The swiss army knife of lossless video/audio editing.	39	{linux}	https://github.com/mifi/lossless-cut	\N	13	approved	2026-01-17 17:04:29.484684	\N	\N	Open Source	\N	https://github.com/mifi/lossless-cut	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1118	Miro	Free, and open video, music and internet TV application; it brings video channels from thousands of sources and has more free HD than any other platform.	39	{linux}	https://github.com/pculture/miro	\N	13	approved	2026-01-17 17:04:29.485815	\N	\N	Open Source	\N	https://www.getmiro.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1119	Movie Monad	A free and simple to use video player made with Haskell.	39	{linux}	https://github.com/lettier/movie-monad	\N	13	approved	2026-01-17 17:04:29.486612	\N	\N	Open Source	\N	https://lettier.github.io/movie-monad	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1120	MPlayer	MPlayer is a movie player which runs on many systems, play any kind of videos.	39	{linux}	http://www.mplayerhq.hu/design7/dload.html	\N	13	approved	2026-01-17 17:04:29.48737	\N	\N	Open Source	\N	http://www.mplayerhq.hu/design7/news.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1121	MPV	A free, open source, and cross-platform media player.	39	{linux}	https://github.com/mpv-player/mpv	\N	13	approved	2026-01-17 17:04:29.488165	\N	\N	Open Source	\N	https://www.mpv.io	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1122	Plex	Plex is a media server and streaming platform that organizes, streams, and shares your digital media content.	39	{linux}	https://www.plex.tv/	\N	13	approved	2026-01-17 17:04:29.489004	\N	\N	Freeware	\N	https://www.plex.tv/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
1123	SMPlayer	Free Media Player with built-in codecs. Play all audio and video formats.	39	{linux}	https://sourceforge.net/p/smplayer/code/HEAD/tree/	\N	13	approved	2026-01-17 17:04:29.489647	\N	\N	Open Source	\N	https://www.smplayer.info/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1124	Stremio	Stremio is a modern media center that's a one-stop solution for your video entertainment.	39	{linux}	https://github.com/Stremio	\N	13	approved	2026-01-17 17:04:29.490287	\N	\N	Open Source	\N	https://www.stremio.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1125	Subtitld	Subtitld is an open source software to edit, transcribe and create subtitles.	39	{linux}	https://gitlab.com/jonata/subtitld	\N	13	approved	2026-01-17 17:04:29.490933	\N	\N	Open Source	\N	https://subtitld.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1126	SVP	SVP allows you to watch any video on your desktop computer using frame interpolation as it is available on high-end TVs and projectors.	39	{linux}	https://www.svp-team.com/w/index.php?title=Main_Page	\N	13	approved	2026-01-17 17:04:29.491567	\N	\N	Freeware	\N	https://www.svp-team.com/w/index.php?title=Main_Page	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
1127	VLC	VLC is a free and open source cross-platform multimedia player and framework that plays most multimedia files as well as DVDs, Audio CDs, VCDs, and various streaming protocols.	39	{linux}	https://www.videolan.org/vlc/download-sources.html	\N	13	approved	2026-01-17 17:04:29.492171	\N	\N	Open Source	\N	https://www.videolan.org/vlc/index.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1128	CyberGhost	CyberGhost VPN allows you to surf the Internet freely, as if in disguise, regardless of the type of application you use and from where you log in.	40	{linux}	https://www.cyberghostvpn.com/en_US/	\N	13	approved	2026-01-17 17:04:29.492759	\N	\N	Commercial	\N	https://www.cyberghostvpn.com/en_US/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
1129	ExpressVPN	ExpressVPN is the worlds fastest VPN service. It is both safe and reliable to watch and stream movies abroad, or simply access your favourite sites.	40	{linux}	https://www.expressvpn.com/	\N	13	approved	2026-01-17 17:04:29.493413	\N	\N	Commercial	\N	https://www.expressvpn.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
1130	IVPN	IVPN offers a secure VPN service to privacy minded individuals including multi-hop technology and fast bandwidth.	40	{linux}	https://www.ivpn.net/	\N	13	approved	2026-01-17 17:04:29.494127	\N	\N	Commercial	\N	https://www.ivpn.net/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
1131	Mozilla VPN	Protect your web history, feel safer on public Wi-Fi, and limit ad tracking by increasing the security of your network connection.	40	{linux}	https://github.com/mozilla-mobile/mozilla-vpn-client	\N	13	approved	2026-01-17 17:04:29.495069	\N	\N	Open Source	\N	https://www.mozilla.org/en-US/products/vpn/	Imported from Awesome-Linux-Software. Open Source: true, Free: false	software
1132	Mullvad	Mullvad is a VPN service that helps keep your online activity, identity, and location private.	40	{linux}	https://github.com/mullvad/mullvadvpn-app	\N	13	approved	2026-01-17 17:04:29.495687	\N	\N	Open Source	\N	https://mullvad.net/en/	Imported from Awesome-Linux-Software. Open Source: true, Free: false	software
1134	OpenVPN	OpenVPN is a virtual private network (VPN) system that implements techniques to create secure point-to-point or site-to-site connections in routed or bridged configurations and remote access facilities. It implements both client and server applications.	40	{linux}	https://github.com/OpenVPN	\N	13	approved	2026-01-17 17:04:29.496953	\N	\N	Open Source	\N	https://openvpn.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1135	Private Internet Access	Private Internet Access provides state of the art, multi-layered security with advanced privacy protection using VPN tunneling.	40	{linux}	https://github.com/pia-foss/desktop	\N	13	approved	2026-01-17 17:04:29.497572	\N	\N	Open Source	\N	https://www.privateinternetaccess.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: false	software
1136	ProtonVPN	High-speed Swiss VPN that safeguards your privacy.	40	{linux}	https://protonvpn.com/	\N	13	approved	2026-01-17 17:04:29.498197	\N	\N	Open Source	\N	https://protonvpn.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: false	software
1137	PureVPN	PureVPN is much more than your usual VPN services provider. It offers unparalleled security and anonymity, making it your only choice for a secure online browsing experience.	40	{linux}	https://www.purevpn.com/	\N	13	approved	2026-01-17 17:04:29.498832	\N	\N	Commercial	\N	https://www.purevpn.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
1138	Surfshark	All you need in a VPN and more in one easy-to-use app.	40	{linux}	https://surfshark.com/	\N	13	approved	2026-01-17 17:04:29.499467	\N	\N	Commercial	\N	https://surfshark.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	software
1139	Tailscale	Tailscale is a WireGuard-based app that makes secure, private networks easy for teams of any scale.	40	{linux}	https://github.com/tailscale	\N	13	approved	2026-01-17 17:04:29.500084	\N	\N	Open Source	\N	https://tailscale.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: false	software
1140	Windscribe	Browse the web privately as it was meant to be.	40	{linux}	https://github.com/Windscribe/Desktop-App	\N	13	approved	2026-01-17 17:04:29.500818	\N	\N	Open Source	\N	https://windscribe.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: false	software
1141	WireGuard	WireGuard is an extremely simple yet fast and modern VPN that utilizes state-of-the-art cryptography. It aims to be faster, simpler, leaner, and more useful than IPsec, while avoiding the massive headache.	40	{linux}	https://www.wireguard.com/repositories/	\N	13	approved	2026-01-17 17:04:29.501476	\N	\N	Open Source	\N	https://www.wireguard.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1142	DokuWiki	A popular self-hostable wiki software with a large number of plugins.	41	{linux}	https://github.com/splitbrain/dokuwiki	\N	13	approved	2026-01-17 17:04:29.502086	\N	\N	Open Source	\N	https://www.dokuwiki.org/dokuwiki	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1143	ikiwiki	ikiwiki is a wiki compiler. It converts wiki pages into HTML pages suitable for publishing on a website. Ikiwiki stores pages and history in a revision control system such as Subversion or Git.	41	{linux}	https://git.joeyh.name/git/ikiwiki.git/	\N	13	approved	2026-01-17 17:04:29.502913	\N	\N	Open Source	\N	https://ikiwiki.info/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1144	TiddlyDesktop	A desktop app for TiddlyWiki, an open-source personal wiki written in javascript, great if you're still searching for a good note-taking (and more) app.	41	{linux}	https://github.com/Jermolene/TiddlyDesktop	\N	13	approved	2026-01-17 17:04:29.503516	\N	\N	Open Source	\N	https://tiddlywiki.com/#TiddlyDesktop	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1145	DisplayCAL	Open Source Display Calibration and Characterization powered by ArgyllCMS.	42	{linux}	https://displaycal.net/#download	\N	13	approved	2026-01-17 17:04:29.504449	\N	\N	Open Source	\N	https://displaycal.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1146	FontForge	Free (libre) font editor for Windows, Mac OS X and GNU+Linux.	42	{linux}	https://github.com/fontforge/fontforge	\N	13	approved	2026-01-17 17:04:29.505091	\N	\N	Open Source	\N	https://fontforge.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1147	GrubCustomizer	Grub Customizer is a graphical interface to configure the GRUB2/BURG settings and menuentries.	42	{linux}	https://git.launchpad.net/grub-customizer	\N	13	approved	2026-01-17 17:04:29.505701	\N	\N	Open Source	\N	https://launchpad.net/grub-customizer	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1148	Labplot	LabPlot is a KDE-application for interactive graphing and analysis of scientific data.	42	{linux}	https://invent.kde.org/education/labplot	\N	13	approved	2026-01-17 17:04:29.506317	\N	\N	Open Source	\N	https://labplot.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1149	Mycroft	Mycroft is a hackable open source voice assistant.	42	{linux}	https://github.com/MycroftAI/mycroft-core	\N	13	approved	2026-01-17 17:04:29.506943	\N	\N	Open Source	\N	https://community.openconversational.ai/c/mycroft-project	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1150	OpenRGB	Open source RGB lighting control that doesn't depend on manufacturer software. For Windows, Linux, MacOS.	42	{linux}	https://gitlab.com/CalcProgrammer1/OpenRGB	\N	13	approved	2026-01-17 17:04:29.507606	\N	\N	Open Source	\N	https://openrgb.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1151	Piper	Piper is a GTK+ application to configure gaming mice.	42	{linux}	https://github.com/libratbag/piper	\N	13	approved	2026-01-17 17:04:29.508243	\N	\N	Open Source	\N	https://github.com/libratbag/piper	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1152	Polychromatic	Graphical front end and tray applet for configuring Razer peripherals on GNU/Linux.	42	{linux}	https://github.com/polychromatic/polychromatic	\N	13	approved	2026-01-17 17:04:29.508858	\N	\N	Open Source	\N	https://polychromatic.app/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1153	rEFInd	rEFInd is a fork of the rEFIt boot manager. Like rEFIt, rEFInd can auto-detect your installed EFI boot loaders and it presents a pretty GUI menu of boot options.	42	{linux}	https://sourceforge.net/projects/refind/	\N	13	approved	2026-01-17 17:04:29.509493	\N	\N	Open Source	\N	https://www.rodsbooks.com/refind/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1154	trackma	Open multi-site list manager for Unix-like systems.	42	{linux}	https://github.com/z411/trackma	\N	13	approved	2026-01-17 17:04:29.510185	\N	\N	Open Source	\N	https://z411.github.io/trackma/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1155	Daily Reddit Wallpaper	Change your wallpaper to the most upvoted image of the day from /r/wallpapers or any other subreddit on system startup.	33	{linux}	https://github.com/federicotorrielli/Daily-Reddit-Wallpaper	\N	13	approved	2026-01-17 17:04:29.510857	\N	\N	Open Source	\N	https://federicotorrielli.github.io/Daily-Reddit-Wallpaper/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1156	ddgr	DuckDuckGo from the command line.	33	{linux}	https://github.com/jarun/ddgr	\N	13	approved	2026-01-17 17:04:29.511783	\N	\N	Open Source	\N	https://github.com/jarun/ddgr	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1157	dnscrypt-proxy	DNS proxy with support for encrypted DNS protocols,cross platform.	33	{linux}	https://dnscrypt.info/	\N	13	approved	2026-01-17 17:04:29.512432	\N	\N	Open Source	\N	https://github.com/DNSCrypt/dnscrypt-proxy	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1158	gallery-dl	Command-line program to download image galleries and collections from pixiv, exhentai, danbooru and more.	33	{linux}	https://github.com/mikf/gallery-dl	\N	13	approved	2026-01-17 17:04:29.513026	\N	\N	Open Source	\N	https://github.com/mikf/gallery-dl	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1159	Googler	A program that can Google anything right in the command line.	33	{linux}	https://github.com/jarun/googler	\N	13	approved	2026-01-17 17:04:29.513597	\N	\N	Open Source	\N	https://github.com/jarun/googler	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1160	i2pd	I2P daemon written in C++.	33	{linux}	https://i2pd.website/	\N	13	approved	2026-01-17 17:04:29.514222	\N	\N	Open Source	\N	https://github.com/PurpleI2P/i2pd	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1182	htop	An interactive process viewer for Unix systems with improved features and user experience.	43	{linux}	https://github.com/hishamhm/htop	\N	13	approved	2026-01-17 17:04:29.528438	\N	\N	Open Source	\N	https://htop.dev/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1161	Linux-router	Set Linux as router in one command. Can share Internet, create WiFi hotspot, or route VM/containers.	33	{linux}	https://github.com/garywill/linux-router	\N	13	approved	2026-01-17 17:04:29.514887	\N	\N	Open Source	\N	https://github.com/garywill/linux-router	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1162	mps-youtube	A terminal based program for searching, streaming and downloading music. This implementation uses YouTube as a source of content and can play and download video as well as audio.	33	{linux}	https://github.com/mps-youtube/mps-youtube	\N	13	approved	2026-01-17 17:04:29.515584	\N	\N	Open Source	\N	https://github.com/mps-youtube/mps-youtube	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1163	Mutt	A terminal based mail client with vim keybindings and great flexibility and customizability.	33	{linux}	https://gitlab.com/muttmua/mutt	\N	13	approved	2026-01-17 17:04:29.516257	\N	\N	Open Source	\N	http://www.mutt.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1164	Newsboat	Newsboat is a fork of Newsbeuter, an RSS/Atom feed reader for the text console.	33	{linux}	https://github.com/newsboat/newsboat	\N	13	approved	2026-01-17 17:04:29.516903	\N	\N	Open Source	\N	https://newsboat.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1165	Rainbow Stream	A smart and nice Twitter client on terminal written in Python.	33	{linux}	https://github.com/orakaro/rainbowstream	\N	13	approved	2026-01-17 17:04:29.517545	\N	\N	Open Source	\N	https://github.com/orakaro/rainbowstream	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1166	reddio	A command-line interface for Reddit written in POSIX sh.	33	{linux}	https://gitlab.com/aaronNG/reddio	\N	13	approved	2026-01-17 17:04:29.51816	\N	\N	Open Source	\N	https://gitlab.com/aaronNG/reddio	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1167	Streamlink	Streamlink is a CLI utility which pipes video streams from various services into a video player.	33	{linux}	https://github.com/streamlink/streamlink	\N	13	approved	2026-01-17 17:04:29.518762	\N	\N	Open Source	\N	https://streamlink.github.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1168	tmpmail	A temporary email right from your terminal written in POSIX sh.	33	{linux}	https://github.com/sdushantha/tmpmail	\N	13	approved	2026-01-17 17:04:29.51943	\N	\N	Open Source	\N	https://github.com/sdushantha/tmpmail	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1169	translate-shell	Command-line translator using Google Translate, Bing Translator, Yandex.Translate, etc.	33	{linux}	https://github.com/soimort/translate-shell	\N	13	approved	2026-01-17 17:04:29.520047	\N	\N	Open Source	\N	https://www.soimort.org/translate-shell	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1170	WBOT	A simple CLI based BOT for WhatsApp™ in NodeJS. reply to your friends quickly and have fun along the way.	33	{linux}	https://github.com/vasani-arpit/WBOT	\N	13	approved	2026-01-17 17:04:29.52076	\N	\N	Open Source	\N	https://github.com/vasani-arpit/WBOT	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1172	youtube-dl	youtube-dl is a command-line program to download videos from YouTube.com and a few more sites. It requires the Python interpreter (2.6, 2.7, or 3.2+), and it is not platform specific.	33	{linux}	https://github.com/rg3/youtube-dl	\N	13	approved	2026-01-17 17:04:29.522145	\N	\N	Open Source	\N	https://rg3.github.io/youtube-dl/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1173	yt-dlp	A youtube-dl fork with additional features and fixes.	33	{linux}	https://github.com/yt-dlp/yt-dlp	\N	13	approved	2026-01-17 17:04:29.52279	\N	\N	Open Source	\N	https://github.com/yt-dlp/yt-dlp	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1174	ytmdl	A simple app to get songs from YouTube in mp3 format with artist name, album name etc from sources like iTunes, Spotify, LastFM, Deezer, Gaana etc.	33	{linux}	https://github.com/deepjyoti30/ytmdl	\N	13	approved	2026-01-17 17:04:29.523424	\N	\N	Open Source	\N	https://github.com/deepjyoti30/ytmdl	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1175	auto-cpufreq	Automatic CPU speed & power optimizer for Linux.	43	{linux}	https://github.com/AdnanHodzic/auto-cpufreq	\N	13	approved	2026-01-17 17:04:29.524041	\N	\N	Open Source	\N	https://github.com/AdnanHodzic/auto-cpufreq	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1176	bottom	Yet another cross-platform graphical process/system monitor.	43	{linux}	https://github.com/ClementTsang/bottom	\N	13	approved	2026-01-17 17:04:29.52468	\N	\N	Open Source	\N	https://clementtsang.github.io/bottom/nightly/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1177	bpytop	Resource monitor that shows usage and stats for processor, memory, disks, network and processes. Python port and continuation of bashtop.	43	{linux}	https://github.com/aristocratos/bpytop	\N	13	approved	2026-01-17 17:04:29.525301	\N	\N	Open Source	\N	https://github.com/aristocratos/bpytop	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1178	btop	Resource monitor that shows usage and stats for processor, memory, disks, network and processes.	43	{linux}	https://github.com/aristocratos/btop	\N	13	approved	2026-01-17 17:04:29.525943	\N	\N	Open Source	\N	https://github.com/aristocratos/btop	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1179	Fastfetch	Fastfetch is a Neofetch-like tool for fetching system information and displaying it prettily. It is written mainly in C, with performance and customizability in mind.	43	{linux}	https://github.com/fastfetch-cli/fastfetch	\N	13	approved	2026-01-17 17:04:29.526633	\N	\N	Open Source	\N	https://github.com/fastfetch-cli/fastfetch/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1180	Glances	Glances is a system monitoring terminal application that shows you your disk usage, ram usage, and cpu usage in a very friendly way using the Ncurses programming library. It is tolerant to windows resizing, and very low on system ram usage.	43	{linux}	https://github.com/nicolargo/glances	\N	13	approved	2026-01-17 17:04:29.527269	\N	\N	Open Source	\N	https://nicolargo.github.io/glances/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1181	gtop	A system monitoring dashboard for terminal. Think 'graphical top', with bar charts, line graphs, pie charts, and etc.	43	{linux}	https://github.com/aksakalli/gtop	\N	13	approved	2026-01-17 17:04:29.527853	\N	\N	Open Source	\N	https://github.com/aksakalli/gtop	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1183	hyperfine	A command-line benchmarking tool.	43	{linux}	https://github.com/sharkdp/hyperfine	\N	13	approved	2026-01-17 17:04:29.529351	\N	\N	Open Source	\N	https://github.com/sharkdp/hyperfine	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1184	kmon	Linux Kernel Manager and Activity Monitor.	43	{linux}	https://github.com/orhun/kmon	\N	13	approved	2026-01-17 17:04:29.529962	\N	\N	Open Source	\N	https://kmon.cli.rs/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1185	NVTOP	GPUs process monitoring for AMD, Intel and NVIDIA.	43	{linux}	https://github.com/Syllo/nvtop	\N	13	approved	2026-01-17 17:04:29.530558	\N	\N	Open Source	\N	https://github.com/Syllo/nvtop	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1186	pfetch	A pretty system information tool written in POSIX sh.	43	{linux}	https://github.com/dylanaraps/pfetch	\N	13	approved	2026-01-17 17:04:29.531173	\N	\N	Open Source	\N	https://github.com/dylanaraps/pfetch	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1187	screenFetch	Fetches system/theme information in terminal for Linux desktop screenshots.	43	{linux}	https://github.com/KittyKatt/screenFetch	\N	13	approved	2026-01-17 17:04:29.531738	\N	\N	Open Source	\N	https://github.com/KittyKatt/screenFetch	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1188	s-tui	s-tui is an UI for monitoring your computer's CPU temperature, frequency and utilization in a graphical way from the terminal.	43	{linux}	https://github.com/amanusk/s-tui	\N	13	approved	2026-01-17 17:04:29.532298	\N	\N	Open Source	\N	https://amanusk.github.io/s-tui/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1189	Age	Simple, Modern, Secure encryption tool.	44	{linux}	https://github.com/FiloSottile/age	\N	13	approved	2026-01-17 17:04:29.532902	\N	\N	Open Source	\N	https://github.com/FiloSottile/age	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1190	bat	A cat clone with syntax highlighting and Git integration.	44	{linux}	https://github.com/sharkdp/bat	\N	13	approved	2026-01-17 17:04:29.533516	\N	\N	Open Source	\N	https://github.com/sharkdp/bat	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1191	broot	A new way to see and navigate directory trees.	44	{linux}	https://github.com/Canop/broot	\N	13	approved	2026-01-17 17:04:29.534139	\N	\N	Open Source	\N	https://dystroy.org/broot/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1192	Buku	A Command line bookmark manager.	44	{linux}	https://github.com/jarun/Buku	\N	13	approved	2026-01-17 17:04:29.534772	\N	\N	Open Source	\N	https://github.com/jarun/Buku	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1193	ccat	Colorizing `cat`.	44	{linux}	https://github.com/owenthereal/ccat	\N	13	approved	2026-01-17 17:04:29.535426	\N	\N	Open Source	\N	https://github.com/owenthereal/ccat	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1194	Clipboard	Cut, copy, and paste anything, anywhere, anytime.	44	{linux}	https://github.com/Slackadays/Clipboard	\N	13	approved	2026-01-17 17:04:29.536038	\N	\N	Open Source	\N	https://github.com/Slackadays/Clipboard	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1195	Cloc	Count Lines of Code: cloc counts blank lines, comment lines, and physical lines of source code in many programming languages.	44	{linux}	https://github.com/AlDanial/cloc	\N	13	approved	2026-01-17 17:04:29.536739	\N	\N	Open Source	\N	https://github.com/AlDanial/cloc	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1196	Color LS	Color Ls is a Ruby Gem that spices up the ls command and shows more visually than ls does without additional commands.	44	{linux}	https://github.com/athityakumar/colorls	\N	13	approved	2026-01-17 17:04:29.537384	\N	\N	Open Source	\N	https://github.com/athityakumar/colorls	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1197	draw	Draw in your terminal.	44	{linux}	https://github.com/maaslalani/draw	\N	13	approved	2026-01-17 17:04:29.538003	\N	\N	Open Source	\N	https://github.com/maaslalani/draw	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1198	duf	Disk Usage/Free Utility - a better 'df' alternative.	44	{linux}	https://github.com/muesli/duf	\N	13	approved	2026-01-17 17:04:29.538835	\N	\N	Open Source	\N	https://github.com/muesli/duf	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1199	eza	eza is a modern replacement for ls, written in Rust.	44	{linux}	https://github.com/eza-community/eza	\N	13	approved	2026-01-17 17:04:29.539501	\N	\N	Open Source	\N	https://eza.rocks/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1200	fd	A simple, fast and user-friendly alternative to 'find'.	44	{linux}	https://github.com/sharkdp/fd	\N	13	approved	2026-01-17 17:04:29.540125	\N	\N	Open Source	\N	https://github.com/sharkdp/fd	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1201	Fishfry	Replaces fish history with a history tailored to pentesters for efficiency and newbie pentesters for learning.	44	{linux}	https://github.com/LubuntuFu/fishfry	\N	13	approved	2026-01-17 17:04:29.54076	\N	\N	Open Source	\N	https://github.com/LubuntuFu/fishfry	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1202	fzf	A general-purpose command-line fuzzy finder with interactive filter and preview feature for things like files, command history, git commits, hostnames, etc.	44	{linux}	https://github.com/junegunn/fzf	\N	13	approved	2026-01-17 17:04:29.541374	\N	\N	Open Source	\N	https://github.com/junegunn/fzf	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1203	fkill	Fabulously kill processes. Cross-platform.	44	{linux}	https://github.com/sindresorhus/fkill-cli	\N	13	approved	2026-01-17 17:04:29.541988	\N	\N	Open Source	\N	https://github.com/sindresorhus/fkill-cli	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1204	Gkill	An interactive process killer for Linux.	44	{linux}	https://github.com/heppu/gkill	\N	13	approved	2026-01-17 17:04:29.542594	\N	\N	Open Source	\N	https://github.com/heppu/gkill	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1205	gping	ping but with graph, cross platform.	44	{linux}	https://github.com/orf/gping	\N	13	approved	2026-01-17 17:04:29.543247	\N	\N	Open Source	\N	https://github.com/orf/gping	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1206	korkut	Quick and simple image processing at the command line.	44	{linux}	https://github.com/oguzhaninan/korkut	\N	13	approved	2026-01-17 17:04:29.543918	\N	\N	Open Source	\N	https://github.com/oguzhaninan/korkut	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1207	Liquidprompt	A full-featured & carefully designed adaptive prompt for Bash & Zsh.	44	{linux}	https://github.com/nojhan/liquidprompt	\N	13	approved	2026-01-17 17:04:29.544565	\N	\N	Open Source	\N	https://github.com/nojhan/liquidprompt	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1679	Flarum	Forum platform	186	{Linux,Mac,Windows}	https://opencollective.com/flarum/	\N	1	approved	2026-01-18 09:29:54.697791	\N	\N	Open Source	\N	\N	\N	software
1211	navi	An interactive cheatsheet tool for the command-line.	44	{linux}	https://github.com/denisidoro/navi	\N	13	approved	2026-01-17 17:04:29.547427	\N	\N	Open Source	\N	https://github.com/denisidoro/navi	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1212	Onefetch	Git repository summary on your terminal.	44	{linux}	https://github.com/o2sh/onefetch	\N	13	approved	2026-01-17 17:04:29.548104	\N	\N	Open Source	\N	https://onefetch.dev/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1213	PathPicker	A command that lets you select files that were output from a previous command in the command line, so you can then run another command or edit them.	44	{linux}	https://github.com/facebook/PathPicker	\N	13	approved	2026-01-17 17:04:29.548733	\N	\N	Open Source	\N	https://github.com/facebook/PathPicker	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1214	pywal	pywal is a script that takes an image (or a directory of images), generates a colorscheme (using imagemagick) and then changes all of your open terminal's colors to the new colorscheme on the fly, allowing you to have your terminal colors change with your wallpaper, or other criteria.	44	{linux}	https://github.com/dylanaraps/pywal	\N	13	approved	2026-01-17 17:04:29.549369	\N	\N	Open Source	\N	https://github.com/dylanaraps/pywal	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1215	ripgrep	Ripgrep is a line-oriented search tool that recursively searches the current directory for a regex pattern.	44	{linux}	https://github.com/BurntSushi/ripgrep	\N	13	approved	2026-01-17 17:04:29.550005	\N	\N	Open Source	\N	https://github.com/BurntSushi/ripgrep	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1216	slides	Terminal based presentation tool.	44	{linux}	https://github.com/maaslalani/slides	\N	13	approved	2026-01-17 17:04:29.550632	\N	\N	Open Source	\N	https://maaslalani.com/slides/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1217	The Silver Searcher / Ag	A code-searching tool similar to ack, but faster.	44	{linux}	https://github.com/ggreer/the_silver_searcher	\N	13	approved	2026-01-17 17:04:29.55128	\N	\N	Open Source	\N	https://geoff.greer.fm/ag/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1218	Starship	A minimal, blazingly fast and infinitely customizable prompt for any shell, cross-platform.	44	{linux}	https://starship.rs/	\N	13	approved	2026-01-17 17:04:29.551927	\N	\N	Open Source	\N	https://github.com/starship/starship	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1219	TheFuck	Magnificent app which corrects your previous console command.	44	{linux}	https://github.com/nvbn/thefuck	\N	13	approved	2026-01-17 17:04:29.552581	\N	\N	Open Source	\N	https://github.com/nvbn/thefuck	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1220	tldr-pages	The tldr-pages project is a collection of community-maintained help pages for command-line tools, that aims to be a simpler, more approachable complement to traditional man pages.	44	{linux}	https://github.com/tldr-pages/tldr	\N	13	approved	2026-01-17 17:04:29.55322	\N	\N	Open Source	\N	https://tldr.sh/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1221	tealdeer	A very fast implementation of tldr written in Rust.	44	{linux}	https://github.com/dbrgn/tealdeer	\N	13	approved	2026-01-17 17:04:29.553844	\N	\N	Open Source	\N	https://tealdeer-rs.github.io/tealdeer/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1222	Tmux	It lets you switch easily between several programs in one terminal, detach them (they keep running in the background) and reattach them to a different terminal. And do a lot more.	44	{linux}	https://github.com/tmux/tmux	\N	13	approved	2026-01-17 17:04:29.554489	\N	\N	Open Source	\N	https://github.com/tmux/tmux	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1223	undistract-me	A command line program that plays a sound or sends a notification when a long command has finished running in the command line.	44	{linux}	https://github.com/jml/undistract-me	\N	13	approved	2026-01-17 17:04:29.55514	\N	\N	Open Source	\N	https://github.com/jml/undistract-me	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1224	vagrant	Vagrant is a tool for building and distributing development environments.	44	{linux}	https://github.com/hashicorp/vagrant	\N	13	approved	2026-01-17 17:04:29.555782	\N	\N	Open Source	\N	https://www.vagrantup.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1225	VHS	Your CLI home video recorder vhs	44	{linux}	https://github.com/charmbracelet/vhs	\N	13	approved	2026-01-17 17:04:29.556384	\N	\N	Open Source	\N	https://github.com/charmbracelet/vhs	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1226	wicd-curses	Command line WiFi connection manager.	44	{linux}	https://wiki.archlinux.org/index.php/wicd#Running_Wicd_in_Text_Mode	\N	13	approved	2026-01-17 17:04:29.557133	\N	\N	Freeware	\N	https://wiki.archlinux.org/index.php/wicd#Running_Wicd_in_Text_Mode	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
1227	xsv	A fast CSV command line toolkit written in Rust.	44	{linux}	https://github.com/BurntSushi/xsv	\N	13	approved	2026-01-17 17:04:29.557854	\N	\N	Open Source	\N	https://github.com/BurntSushi/xsv	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1228	z.lua	A new cd command that helps you navigate faster by learning your habits.	44	{linux}	https://github.com/skywind3000/z.lua	\N	13	approved	2026-01-17 17:04:29.558544	\N	\N	Open Source	\N	https://github.com/skywind3000/z.lua	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1229	zoxide	A better way to navigate your filesystem written in Rust.	44	{linux}	https://github.com/ajeetdsouza/zoxide	\N	13	approved	2026-01-17 17:04:29.559245	\N	\N	Open Source	\N	https://github.com/ajeetdsouza/zoxide	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1230	GNU Linux-libre	GNU Linux-libre is a project to maintain and publish 100% Free distributions of Linux, suitable for use in Free System Distributions.	44	{linux}	https://linux-libre.fsfla.org/pub/linux-libre/releases/	\N	13	approved	2026-01-17 17:04:29.559878	\N	\N	Open Source	\N	https://www.fsfla.org/ikiwiki/selibre/linux-libre/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1231	Linux-Hardened	A security-focused Linux kernel applying a set of hardening patches to mitigate kernel and userspace exploits. It also enables more upstream kernel hardening features than linux.	44	{linux}	https://github.com/anthraxx/linux-hardened	\N	13	approved	2026-01-17 17:04:29.560636	\N	\N	Open Source	\N	https://github.com/anthraxx/linux-hardened	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1232	linux-tkg	Scripts to automatically download, patch and compile the Linux Kernel from the official Linux git repository, with a selection of patches aiming for better desktop/gaming experience.	44	{linux}	https://github.com/Frogging-Family/linux-tkg	\N	13	approved	2026-01-17 17:04:29.561461	\N	\N	Open Source	\N	https://github.com/Frogging-Family/linux-tkg	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1233	Liquorix	Liquorix is a distro kernel replacement built using the best configuration and kernel sources for desktop, multimedia, and gaming workloads.	44	{linux}	https://github.com/damentz/liquorix-package	\N	13	approved	2026-01-17 17:04:29.562248	\N	\N	Open Source	\N	https://liquorix.net	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1234	XanMod	XanMod is a general-purpose Linux kernel distribution with custom settings and new features. Built to provide a stable, responsive and smooth desktop experience.	44	{linux}	https://sourceforge.net/projects/xanmod/	\N	13	approved	2026-01-17 17:04:29.562972	\N	\N	Open Source	\N	https://xanmod.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1235	Zen	Result of a collaborative effort of kernel hackers to provide the best Linux kernel possible for everyday systems.	44	{linux}	https://github.com/zen-kernel/zen-kernel	\N	13	approved	2026-01-17 17:04:29.563644	\N	\N	Open Source	\N	https://github.com/zen-kernel/zen-kernel	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1236	Budgie	Budgie is a desktop environment designed with the modern user in mind, it focuses on simplicity and elegance.	44	{linux}	https://github.com/BuddiesOfBudgie/budgie-desktop	\N	13	approved	2026-01-17 17:04:29.564307	\N	\N	Open Source	\N	https://buddiesofbudgie.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1237	Cinnamon	Cinnamon strives to provide a traditional user experience. Cinnamon is a fork of GNOME 3.	44	{linux}	https://github.com/linuxmint/Cinnamon	\N	13	approved	2026-01-17 17:04:29.564935	\N	\N	Open Source	\N	https://projects.linuxmint.com/cinnamon/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1238	Deepin DE	DDE (Deepin Desktop Environment) is the default desktop environment originally created for the Linux Deepin distribution.	44	{linux}	https://github.com/linuxdeepin/dde-file-manager/tree/develop2.0	\N	13	approved	2026-01-17 17:04:29.565586	\N	\N	Open Source	\N	https://www.deepin.org/en/dde/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1239	Enlightenment	A lightweight and pretty desktop environment that is designed to run fast and look good, while retaining a large degree of customization.	44	{linux}	https://git.enlightenment.org/enlightenment/efl	\N	13	approved	2026-01-17 17:04:29.566302	\N	\N	Open Source	\N	https://www.enlightenment.org/about	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1240	GNOME	The GNOME desktop environment is an attractive and intuitive desktop with both a modern (GNOME) and a classic (GNOME Classic) session.	44	{linux}	https://gitlab.gnome.org/GNOME	\N	13	approved	2026-01-17 17:04:29.566889	\N	\N	Open Source	\N	https://www.gnome.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1241	GNOME Flashback	GNOME Flashback is a shell for GNOME 3 which was initially called GNOME fallback mode. The desktop layout and the underlying technology is similar to GNOME 2.	44	{linux}	https://gitlab.gnome.org/GNOME/gnome-flashback	\N	13	approved	2026-01-17 17:04:29.567554	\N	\N	Open Source	\N	https://wiki.gnome.org/Projects/GnomeFlashback	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1242	KDE Plasma	The KDE Plasma desktop environment is a familiar working environment. Plasma Desktop offers all the tools required for a modern desktop computing experience so you can be productive right from the start.	44	{linux}	https://invent.kde.org/plasma/plasma-desktop	\N	13	approved	2026-01-17 17:04:29.568153	\N	\N	Open Source	\N	https://www.kde.org/plasma-desktop	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1243	LXDE	The Lightweight X11 Desktop Environment is a fast and energy-saving desktop environment.	44	{linux}	https://github.com/lxde	\N	13	approved	2026-01-17 17:04:29.568802	\N	\N	Open Source	\N	https://lxde.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1244	LXQt	LXQt is the Qt port and the upcoming version of LXDE, the Lightweight Desktop Environment.	44	{linux}	https://github.com/lxqt/lxqt	\N	13	approved	2026-01-17 17:04:29.569543	\N	\N	Open Source	\N	https://lxqt-project.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1245	Mate	Mate provides an intuitive and attractive desktop to Linux users using traditional metaphors. MATE is a fork of GNOME 2.	44	{linux}	https://github.com/mate-desktop/	\N	13	approved	2026-01-17 17:04:29.57046	\N	\N	Open Source	\N	https://mate-desktop.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1246	Pantheon	Pantheon is the default desktop environment originally created for the elementary OS distribution.	44	{linux}	https://elementary.io/	\N	13	approved	2026-01-17 17:04:29.571255	\N	\N	Open Source	\N	https://elementary.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1247	UKUI	UKUI is a desktop environment for Linux distributions and other UNIX-like operating systems, originally developed for Ubuntu Kylin, and written using the Qt framework.	44	{linux}	https://github.com/ukui/ukui-desktop-environment	\N	13	approved	2026-01-17 17:04:29.571956	\N	\N	Open Source	\N	https://www.ukui.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1248	Lomiri	A convergent desktop environment.	44	{linux}	https://gitlab.com/ubports/development/core/lomiri	\N	13	approved	2026-01-17 17:04:29.572642	\N	\N	Open Source	\N	https://lomiri.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1249	Xfce	Xfce embodies the traditional UNIX philosophy of modularity and re-usability.	44	{linux}	https://github.com/xfce-mirror	\N	13	approved	2026-01-17 17:04:29.573297	\N	\N	Open Source	\N	https://www.xfce.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1250	CDM	A ultra-minimalistic, yet full-featured login manager written in Bash.	45	{linux}	https://github.com/evertiro/cdm	\N	13	approved	2026-01-17 17:04:29.573928	\N	\N	Open Source	\N	https://github.com/evertiro/cdm	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1251	Console TDM	An extension for xinit written in pure Bash.	45	{linux}	https://github.com/dopsi/console-tdm	\N	13	approved	2026-01-17 17:04:29.57457	\N	\N	Open Source	\N	https://github.com/dopsi/console-tdm	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1252	Lemurs	A customizable TUI display/login manager written in Rust.	45	{linux}	https://github.com/coastalwhite/lemurs	\N	13	approved	2026-01-17 17:04:29.575417	\N	\N	Open Source	\N	https://github.com/coastalwhite/lemurs	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1253	Ly	Ly is a lightweight, TUI (ncurses-like) display manager for Linux.	45	{linux}	https://github.com/cylgom/ly	\N	13	approved	2026-01-17 17:04:29.576053	\N	\N	Open Source	\N	https://github.com/cylgom/ly	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1254	nodm	A minimalistic display manager for automatic logins.	45	{linux}	https://github.com/spanezz/nodm	\N	13	approved	2026-01-17 17:04:29.576739	\N	\N	Open Source	\N	https://github.com/spanezz/nodm	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1255	Entrance	An EFL based display manager, highly experimental.	46	{linux}	https://github.com/tomas/entrance	\N	13	approved	2026-01-17 17:04:29.577467	\N	\N	Open Source	\N	https://enlightenment.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1256	GDM	The GNOME display manager.	46	{linux}	https://github.com/GNOME/gdm	\N	13	approved	2026-01-17 17:04:29.578203	\N	\N	Open Source	\N	https://wiki.gnome.org/Projects/GDM	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1257	LightDM	A cross-desktop display manager, can use various front-ends written in any toolkit.	46	{linux}	https://github.com/canonical/lightdm	\N	13	approved	2026-01-17 17:04:29.578858	\N	\N	Open Source	\N	https://www.freedesktop.org/wiki/Software/LightDM	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1258	LXDM	The LXDE display manager. Can be used independent of the LXDE desktop environment.	46	{linux}	https://sourceforge.net/p/lxdm/code/ci/master/tree/	\N	13	approved	2026-01-17 17:04:29.579488	\N	\N	Open Source	\N	https://sourceforge.net/projects/lxdm/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1259	MDM	The MDM display manager, used in Linux Mint, a fork of GDM 2.	46	{linux}	https://github.com/linuxmint/mdm	\N	13	approved	2026-01-17 17:04:29.580139	\N	\N	Open Source	\N	https://github.com/linuxmint/mdm	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1260	SDDM	The QML-based display manager and successor to KDE4's kdm; recommended for Plasma 5 and LXQt.	46	{linux}	https://github.com/sddm/sddm	\N	13	approved	2026-01-17 17:04:29.580758	\N	\N	Open Source	\N	https://github.com/sddm/sddm	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1261	SLiM	Lightweight and elegant graphical login solution. (Discontinued)	46	{linux}	https://github.com/gsingh93/slim-display-manager	\N	13	approved	2026-01-17 17:04:29.581364	\N	\N	Open Source	\N	https://sourceforge.net/projects/slim.berlios/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1262	XDM	The X display manager with support for XDMCP, and host chooser.	46	{linux}	https://github.com/bbidulock/xdm	\N	13	approved	2026-01-17 17:04:29.581996	\N	\N	Open Source	\N	https://www.x.org/archive/X11R7.5/doc/man/man1/xdm.1.html	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1263	Picom	Picom is a standalone composite manager, suitable for use with window managers that do not natively provide compositing functionality.	47	{linux}	https://github.com/yshui/picom	\N	13	approved	2026-01-17 17:04:29.582619	\N	\N	Open Source	\N	https://github.com/yshui/picom	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1264	Gamescope	Gamescope is a micro-compositor that provides a sandboxed Xwayland desktop with independent input, resolution, and refresh rate.	47	{linux}	https://github.com/Plagman/gamescope	\N	13	approved	2026-01-17 17:04:29.583269	\N	\N	Open Source	\N	https://github.com/Plagman/gamescope	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1265	Hyprland	Hyprland is a dynamic tiling Wayland compositor that doesn't sacrifice on its looks.	47	{linux}	https://github.com/hyprwm/Hyprland	\N	13	approved	2026-01-17 17:04:29.583865	\N	\N	Open Source	\N	https://hyprland.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1266	River	River is a dynamic tiling Wayland compositor with flexible runtime configuration.	47	{linux}	https://github.com/riverwm/river	\N	13	approved	2026-01-17 17:04:29.584492	\N	\N	Open Source	\N	https://github.com/riverwm/river	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1267	Sway	Sway is tiling Wayland compositor and a drop-in replacement for the i3 window manager for X11.	47	{linux}	https://github.com/swaywm/sway	\N	13	approved	2026-01-17 17:04:29.585133	\N	\N	Open Source	\N	https://swaywm.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1268	Wayfire	Wayfire is a wayland compositor based on wlroots. It aims to create a customizable, extendable and lightweight environment without sacrificing its appearance.	47	{linux}	https://github.com/WayfireWM/wayfire	\N	13	approved	2026-01-17 17:04:29.585832	\N	\N	Open Source	\N	https://wayfire.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1269	Xcompmgr	Xcompmgr is a simple composite manager capable of rendering drop shadows and, with the use of the transset utility, primitive window transparency.	47	{linux}	https://cgit.freedesktop.org/xorg/app/xcompmgr	\N	13	approved	2026-01-17 17:04:29.586465	\N	\N	Open Source	\N	https://cgit.freedesktop.org/xorg/app/xcompmgr	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1270	2bwm	A fast floating WM, with the particularity of having 2 borders, written over the XCB library and derived from mcwm.	48	{linux}	https://github.com/venam/2bwm	\N	13	approved	2026-01-17 17:04:29.587217	\N	\N	Open Source	\N	https://github.com/venam/2bwm	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1271	Blackbox	A fast, lightweight window manager for the X Window System, without all those annoying library dependencies.	48	{linux}	https://github.com/bbidulock/blackboxwm	\N	13	approved	2026-01-17 17:04:29.587912	\N	\N	Open Source	\N	https://github.com/bbidulock/blackboxwm	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1272	Fluxbox	A window manager for X that was based on the Blackbox 0.61.1 code.	48	{linux}	https://github.com/fluxbox/fluxbox	\N	13	approved	2026-01-17 17:04:29.58856	\N	\N	Open Source	\N	http://fluxbox.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1273	IceWM	A window manager for the X Window System. The goal of IceWM is speed, simplicity, and not getting in the user’s way.	48	{linux}	https://github.com/ice-wm/icewm	\N	13	approved	2026-01-17 17:04:29.589174	\N	\N	Open Source	\N	https://ice-wm.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1274	Openbox	A highly configurable, next generation window manager with extensive standards support.	48	{linux}	https://github.com/danakj/openbox	\N	13	approved	2026-01-17 17:04:29.589781	\N	\N	Open Source	\N	http://openbox.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1275	Bismuth	Making tiling window management easy. On KDE Plasma.	49	{linux}	https://github.com/Bismuth-Forge/bismuth	\N	13	approved	2026-01-17 17:04:29.590417	\N	\N	Open Source	\N	https://bismuth-forge.github.io/bismuth/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1276	Bspwm	Bspwm is a tiling window manager that represents windows as the leaves of a full binary tree.	49	{linux}	https://github.com/baskerville/bspwm	\N	13	approved	2026-01-17 17:04:29.591023	\N	\N	Open Source	\N	https://github.com/baskerville/bspwm/wiki	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1277	Herbstluftwm	Is a Manual tiling window manager for X11 using Xlib and Glib.	49	{linux}	https://github.com/herbstluftwm/herbstluftwm	\N	13	approved	2026-01-17 17:04:29.591648	\N	\N	Open Source	\N	https://herbstluftwm.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1278	i3 WM	A better tiling and dynamic window manager. It's completely written from scratch. The target platforms are GNU/Linux and BSD operating systems.	49	{linux}	https://github.com/i3/i3	\N	13	approved	2026-01-17 17:04:29.592313	\N	\N	Open Source	\N	https://i3wm.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1279	Pop!\\_OS Shell	Pop Shell is a keyboard-driven auto-tiling window manager that run on top of the GNOME shell.	49	{linux}	https://github.com/pop-os/shell	\N	13	approved	2026-01-17 17:04:29.59314	\N	\N	Open Source	\N	https://github.com/pop-os/shell	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1280	Qtile	Qtile is a full-featured, hackable tiling window manager written and configured in Python.	49	{linux}	https://github.com/qtile/qtile	\N	13	approved	2026-01-17 17:04:29.593843	\N	\N	Open Source	\N	https://qtile.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1281	awesome	A highly configurable, next generation framework window manager for X.	50	{linux}	https://github.com/awesomeWM/awesome	\N	13	approved	2026-01-17 17:04:29.594513	\N	\N	Open Source	\N	https://awesomewm.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1282	dwm	A dynamic window manager for X. It manages windows in tiled, monocle and floating layouts.	50	{linux}	https://github.com/cdown/dwm	\N	13	approved	2026-01-17 17:04:29.595196	\N	\N	Open Source	\N	https://dwm.suckless.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1283	Kröhnkite	A dynamic tiling extension for KWin.	50	{linux}	https://github.com/esjeon/krohnkite	\N	13	approved	2026-01-17 17:04:29.595864	\N	\N	Open Source	\N	https://github.com/esjeon/krohnkite	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1284	spectrwm	A small dynamic tiling window manager for X11, largely inspired by xmonad and dwm.	50	{linux}	https://github.com/conformal/spectrwm	\N	13	approved	2026-01-17 17:04:29.596712	\N	\N	Open Source	\N	https://github.com/conformal/spectrwm	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1285	Worm	A dynamic, tag-based window manager written in Nim.	50	{linux}	https://github.com/codic12/worm	\N	13	approved	2026-01-17 17:04:29.597352	\N	\N	Open Source	\N	https://github.com/codic12/worm	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1286	xmonad	A dynamically tiling X11 window manager that is written and configured in Haskell.	50	{linux}	https://github.com/xmonad/xmonad	\N	13	approved	2026-01-17 17:04:29.598013	\N	\N	Open Source	\N	https://xmonad.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
1287	What is Markdown?	Markdown is the writing method used to create this list, if you want to know how to format properly, it's best that you learn how to use Github Markdown.	50	{linux}	https://github.com/luong-komorebi/Markdown-Tutorial	\N	13	approved	2026-01-17 17:04:29.598625	\N	\N	Freeware	\N	https://github.com/luong-komorebi/Markdown-Tutorial	Imported from Awesome-Linux-Software. Open Source: false, Free: true	software
1291	Cygwin	Unix-like environment for Windows, providing access to a number of tools commonly found on Linux systems.	134	{windows,mac,linux,web}	http://cygwin.com/	\N	13	approved	2026-01-17 17:08:48.386017	\N	\N	GNU GPLv3	\N	http://cygwin.com/	Imported from awesome-free-software. License: GNU GPLv3	software
1293	PuTTY	Remote terminal emulator that connects over SSH, Telnet, SCP, and rlogin protocols as well as raw socket connections.	134	{windows,mac,linux,web}	http://www.chiark.greenend.org.uk/~sgtatham/putty/	\N	13	approved	2026-01-17 17:08:48.387954	\N	\N	MIT	\N	http://www.chiark.greenend.org.uk/~sgtatham/putty/	Imported from awesome-free-software. License: MIT	software
1294	ranger	Minimal, lightweight, and aesthetically pleasing file explorer for GNU/Linux. It runs in the terminal window, so it fits in well with window managers such as i3. vi key bindings allow for quick operations to be performed, including rename and delete.	134	{windows,mac,linux,web}	https://ranger.github.io/	\N	13	approved	2026-01-17 17:08:48.388936	\N	\N	GNU GPLv3	\N	https://ranger.github.io/	Imported from awesome-free-software. License: GNU GPLv3	software
1295	GNU stow	GNU Stow is a symlink farm manager which takes distinct packages of software and/or data located in separate directories on the filesystem, and makes them appear to be installed in the same place.	134	{windows,mac,linux,web}	https://www.gnu.org/software/stow/	\N	13	approved	2026-01-17 17:08:48.389802	\N	\N	GNU GPLv3	\N	https://www.gnu.org/software/stow/	Imported from awesome-free-software. License: GNU GPLv3	software
1296	SimpleLocalize	No description available	134	{windows,mac,linux,web}	https://github.com/simplelocalize/simplelocalize-cli	\N	13	approved	2026-01-17 17:08:48.390693	\N	\N	Open Source	\N	https://github.com/simplelocalize/simplelocalize-cli	Imported from awesome-free-software. License: Unknown	software
1297	Localizely	Open source tool that helps you sync localization files between your source code and the Localizely platform.	134	{windows,mac,linux,web}	https://github.com/localizely/localizely-cli	\N	13	approved	2026-01-17 17:08:48.391529	\N	\N	MIT	\N	https://github.com/localizely/localizely-cli	Imported from awesome-free-software. License: MIT	software
1298	Kit CLI	Open source MLOps tool that allows you to create, manage, run, and deploy ModelKits using Kitfiles. From packaging new models to deploying existing ones, Kit CLI lets you streamline workflows effortlessly.	134	{windows,mac,linux,web}	https://github.com/jozu-ai/kitops?tab=readme-ov-file	\N	13	approved	2026-01-17 17:08:48.392446	\N	\N	Apache License 2.0	\N	https://github.com/jozu-ai/kitops?tab=readme-ov-file	Imported from awesome-free-software. License: Apache License 2.0	software
1299	Conversations	XMPP/Jabber client for Android.	3	{windows,mac,linux,web}	https://conversations.im/	\N	13	approved	2026-01-17 17:08:48.393293	\N	\N	GNU GPLv3	\N	https://conversations.im/	Imported from awesome-free-software. License: GNU GPLv3	software
1300	Gajim	XMPP/Jabber client for desktop.	3	{windows,mac,linux,web}	https://gajim.org/	\N	13	approved	2026-01-17 17:08:48.394092	\N	\N	GNU GPLv3	\N	https://gajim.org/	Imported from awesome-free-software. License: GNU GPLv3	software
1290	Nuclear Music Player	Streaming music player that finds music from free sources automatically.	298	{windows,mac,linux,web}	https://nuclear.js.org/	\N	13	approved	2026-01-17 17:08:48.384234	\N	\N	GNU AGPLv3	\N	https://nuclear.js.org/	Imported from awesome-free-software. License: GNU AGPLv3	software
1292	Logdissect	CLI utility and Python API for analyzing log files and other data.	134	{windows,mac,linux,web}	https://github.com/dogoncouch/logdissect/	\N	13	approved	2026-01-17 17:08:48.38698	\N	\N	MIT	\N	https://github.com/dogoncouch/logdissect/	Imported from awesome-free-software. License: MIT	api
1301	Mail-in-a-Box	Easy-to-deploy mail server package for cloud computers.	3	{windows,mac,linux,web}	https://mailinabox.email/	\N	13	approved	2026-01-17 17:08:48.39547	\N	\N	CC0	\N	https://mailinabox.email/	Imported from awesome-free-software. License: CC0	software
1302	Matrix	Open standard for decentralised, persistent, and interoperable communications.	3	{windows,mac,linux,web}	https://matrix.org/	\N	13	approved	2026-01-17 17:08:48.39692	\N	\N	Apache License 2.0	\N	https://matrix.org/	Imported from awesome-free-software. License: Apache License 2.0	software
1303	ProtonMail	Secure web-based email service.	3	{windows,mac,linux,web}	https://protonmail.com/	\N	13	approved	2026-01-17 17:08:48.39818	\N	\N	MIT	\N	https://protonmail.com/	Imported from awesome-free-software. License: MIT	software
1304	Ring	Telephone, teleconferencing, and media sharing through a distributed service.	3	{windows,mac,linux,web}	https://ring.cx/	\N	13	approved	2026-01-17 17:08:48.399184	\N	\N	GNU GPLv3	\N	https://ring.cx/	Imported from awesome-free-software. License: GNU GPLv3	software
1305	Tox	Encrypted and distributed messaging platform with voice, video, and screen sharing.	3	{windows,mac,linux,web}	https://tox.chat/	\N	13	approved	2026-01-17 17:08:48.400459	\N	\N	GNU GPLv3	\N	https://tox.chat/	Imported from awesome-free-software. License: GNU GPLv3	software
1306	Tutanota	Encrypted email at no cost with support for business accounts.	3	{windows,mac,linux,web}	https://tutanota.com/	\N	13	approved	2026-01-17 17:08:48.401327	\N	\N	GNU GPLv3	\N	https://tutanota.com/	Imported from awesome-free-software. License: GNU GPLv3	software
1311	qBittorrent	Easy to use BitTorrent client.	124	{windows,mac,linux,web}	https://www.qbittorrent.org/	\N	13	approved	2026-01-17 17:08:48.406304	\N	\N	GNU GPLv2+	\N	https://www.qbittorrent.org/	Imported from awesome-free-software. License: GNU GPLv2+	software
1312	Sharry	Convinient file sharing web application that allows you to upload files and get a url back that can then be shared.	124	{windows,mac,linux,web}	https://eikek.github.io/sharry/	\N	13	approved	2026-01-17 17:08:48.407153	\N	\N	GNU GPLv3+	\N	https://eikek.github.io/sharry/	Imported from awesome-free-software. License: GNU GPLv3+	software
1319	Disroot	No description available	121	{windows,mac,linux,web}	https://disroot.org/	\N	13	approved	2026-01-17 17:08:48.422496	\N	\N	Open Source	\N	https://disroot.org/	Imported from awesome-free-software. License: Unknown	software
1320	ZeroNet	Decentralized websites using Bitcoin cryptography and the BitTorrent network.	121	{windows,mac,linux,web}	https://zeronet.io/	\N	13	approved	2026-01-17 17:08:48.423913	\N	\N	GNU GPLv2	\N	https://zeronet.io/	Imported from awesome-free-software. License: GNU GPLv2	software
1321	Simple Mobile Tools	No description available	121	{windows,mac,linux,web}	https://simplemobiletools.github.io/	\N	13	approved	2026-01-17 17:08:48.425138	\N	\N	Open Source	\N	https://simplemobiletools.github.io/	Imported from awesome-free-software. License: Unknown	software
1322	IP2Trace	A traceroute tools that displaying geolocation information using IP2Location database.	121	{windows,mac,linux,web}	https://github.com/ip2location/ip2location-traceroute	\N	13	approved	2026-01-17 17:08:48.425948	\N	\N	MIT	\N	https://github.com/ip2location/ip2location-traceroute	Imported from awesome-free-software. License: MIT	software
1323	Electrum	Lightweight Bitcoin client that provides wallet recovery, decentralized servers, and offline storage.	138	{windows,mac,linux,web}	https://electrum.org	\N	13	approved	2026-01-17 17:08:48.426819	\N	\N	MIT	\N	https://electrum.org	Imported from awesome-free-software. License: MIT	software
1324	GNU Taler	Cash-like system for online payments.	138	{windows,mac,linux,web}	https://taler.net	\N	13	approved	2026-01-17 17:08:48.427654	\N	\N	GNU GPL	\N	https://taler.net	Imported from awesome-free-software. License: GNU GPL	software
1325	DocEar	Literature management using mind mapping technology.	139	{windows,mac,linux,web}	http://www.docear.org/	\N	13	approved	2026-01-17 17:08:48.428509	\N	\N	GNU GPLv2+	\N	http://www.docear.org/	Imported from awesome-free-software. License: GNU GPLv2+	software
1315	Devuan	Fork of Debian without systemd.	194	{windows,mac,linux,web}	https://devuan.org/	\N	13	approved	2026-01-17 17:08:48.415886	\N	\N	Licenses	\N	https://devuan.org/	Imported from awesome-free-software. License: Licenses	software
1316	PureOS	No description available	194	{windows,mac,linux,web}	https://pureos.net/	\N	13	approved	2026-01-17 17:08:48.417965	\N	\N	Open Source	\N	https://pureos.net/	Imported from awesome-free-software. License: Unknown	software
1317	LineageOS	No description available	194	{windows,mac,linux,web}	https://lineageos.org/	\N	13	approved	2026-01-17 17:08:48.419429	\N	\N	Open Source	\N	https://lineageos.org/	Imported from awesome-free-software. License: Unknown	software
1318	Arch	Lightweight and flexible Linux distribution that tries to keep it simple.	194	{windows,mac,linux,web}	https://www.archlinux.org/	\N	13	approved	2026-01-17 17:08:48.421459	\N	\N	GNU GPLv2	\N	https://www.archlinux.org/	Imported from awesome-free-software. License: GNU GPLv2	software
1307	Filestash	A Dropbox-like web client where users can bring their own backend (FTP, SFTP, Webdav, S3, Minio, ...).	293	{windows,mac,linux,web}	http://www.filestash.app	\N	13	approved	2026-01-17 17:08:48.402643	\N	\N	GNU AGPLv3	\N	http://www.filestash.app	Imported from awesome-free-software. License: GNU AGPLv3	software
1308	FileZilla	Universal FTP solution.	293	{windows,mac,linux,web}	https://filezilla-project.org/	\N	13	approved	2026-01-17 17:08:48.403791	\N	\N	GNU GPLv2+	\N	https://filezilla-project.org/	Imported from awesome-free-software. License: GNU GPLv2+	software
1309	Mikochi	A web interface for browsing remote folders, managing files (uploading, deleting, renaming, downloading), and streaming directly to VLC/mpv.	293	{windows,mac,linux,web}	https://github.com/zer0tonin/Mikochi	\N	13	approved	2026-01-17 17:08:48.404652	\N	\N	MIT	\N	https://github.com/zer0tonin/Mikochi	Imported from awesome-free-software. License: MIT	software
1310	WinSCP	SFTP and FTP client for Windows	293	{windows,mac,linux,web}	https://github.com/winscp/winscp	\N	13	approved	2026-01-17 17:08:48.40543	\N	\N	GNU GPLv3	\N	https://github.com/winscp/winscp	Imported from awesome-free-software. License: GNU GPLv3	software
1313	Open Office	Provides a full featured office productivity suite based on open standards.	204	{windows,mac,linux,web}	https://github.com/apache/openoffice	\N	13	approved	2026-01-17 17:08:48.411502	\N	\N	Apache License 2.0	\N	https://github.com/apache/openoffice	Imported from awesome-free-software. License: Apache License 2.0	software
1326	JabRef	Manages references and attached PDFs using BibTeX/BibLaTeX. Includes support for LibreOffice.	139	{windows,mac,linux,web}	https://www.jabref.org	\N	13	approved	2026-01-17 17:08:48.430341	\N	\N	MIT	\N	https://www.jabref.org	Imported from awesome-free-software. License: MIT	software
1327	ShareX	Screen capture, file sharing and productivity tool.	140	{windows,mac,linux,web}	https://getsharex.com/	\N	13	approved	2026-01-17 17:08:48.432048	\N	\N	GNU GPLv3	\N	https://getsharex.com/	Imported from awesome-free-software. License: GNU GPLv3	software
1338	NewPipe	Lightweight YouTube frontend for Android.	39	{windows,mac,linux,web}	https://newpipe.schabi.org/	\N	13	approved	2026-01-17 17:08:48.442667	\N	\N	GNU GPLv3	\N	https://newpipe.schabi.org/	Imported from awesome-free-software. License: GNU GPLv3	software
1340	Cloverleaf	An open source app to replace your password manager without storing your passwords anywhere.	142	{windows,mac,linux,web}	https://cloverleaf.app	\N	13	approved	2026-01-17 17:08:48.446949	\N	\N	MIT	\N	https://cloverleaf.app	Imported from awesome-free-software. License: MIT	software
1341	Dnote	A simple command line notebook with multi-device sync and web interface.	142	{windows,mac,linux,web}	https://www.getdnote.com/	\N	13	approved	2026-01-17 17:08:48.447771	\N	\N	GNU AGPLv3	\N	https://www.getdnote.com/	Imported from awesome-free-software. License: GNU AGPLv3	software
1342	DocuSeal	A platform to fill and sign digital documents.	142	{windows,mac,linux,web}	https://www.docuseal.co/	\N	13	approved	2026-01-17 17:08:48.448528	\N	\N	GNU AGPLv3	\N	https://www.docuseal.co/	Imported from awesome-free-software. License: GNU AGPLv3	software
1343	Etherpad	Collaborative document editing in real-time.	142	{windows,mac,linux,web}	http://etherpad.org/	\N	13	approved	2026-01-17 17:08:48.449295	\N	\N	Apache License 2.0	\N	http://etherpad.org/	Imported from awesome-free-software. License: Apache License 2.0	software
1344	Ghost	Hackable platform for building and running online publications.	142	{windows,mac,linux,web}	https://ghost.org/	\N	13	approved	2026-01-17 17:08:48.450007	\N	\N	MIT	\N	https://ghost.org/	Imported from awesome-free-software. License: MIT	software
1345	GNU social	Microblogging server written in PHP.	142	{windows,mac,linux,web}	https://gnu.io/social/	\N	13	approved	2026-01-17 17:08:48.451116	\N	\N	GNU GPLv3	\N	https://gnu.io/social/	Imported from awesome-free-software. License: GNU GPLv3	software
1346	Healthchecks	Cron job monitoring service.	142	{windows,mac,linux,web}	https://healthchecks.io/	\N	13	approved	2026-01-17 17:08:48.452364	\N	\N	BSD 3-clause	\N	https://healthchecks.io/	Imported from awesome-free-software. License: BSD 3-clause	software
1347	Inventaire	Share books with friends and communities.	142	{windows,mac,linux,web}	https://inventaire.io/welcome	\N	13	approved	2026-01-17 17:08:48.453389	\N	\N	GNU AGPLv3	\N	https://inventaire.io/welcome	Imported from awesome-free-software. License: GNU AGPLv3	software
1348	Lobsters	Link aggregation and discussion with downvote explanations.	142	{windows,mac,linux,web}	https://lobste.rs/	\N	13	approved	2026-01-17 17:08:48.454227	\N	\N	BSD 3-clause	\N	https://lobste.rs/	Imported from awesome-free-software. License: BSD 3-clause	software
1349	Mastodon	Decentralized social network server.	142	{windows,mac,linux,web}	https://joinmastodon.org/	\N	13	approved	2026-01-17 17:08:48.454956	\N	\N	GNU AGPLv3	\N	https://joinmastodon.org/	Imported from awesome-free-software. License: GNU AGPLv3	software
1350	MediaGoblin	Publishing platform for all types of media.	142	{windows,mac,linux,web}	http://mediagoblin.org/	\N	13	approved	2026-01-17 17:08:48.455704	\N	\N	GNU AGPLv3	\N	http://mediagoblin.org/	Imported from awesome-free-software. License: GNU AGPLv3	software
1333	Markdownify	A minimal Markdown editor.	315	{windows,mac,linux,web}	https://markdownify.js.org	\N	13	approved	2026-01-17 17:08:48.437865	\N	\N	MIT	\N	https://markdownify.js.org	Imported from awesome-free-software. License: MIT	software
1334	Sandman	Lets you know when to turn off the computer and sleep based on calculated sleep cycles.	315	{windows,mac,linux,web}	https://alexanderepstein.github.io/Sandman/	\N	13	approved	2026-01-17 17:08:48.438979	\N	\N	MIT	\N	https://alexanderepstein.github.io/Sandman/	Imported from awesome-free-software. License: MIT	software
1335	Search Deflector	A small program that redirects searches made from the Windows Start Menu or Cortana to whatever browser and search engine you prefer.	315	{windows,mac,linux,web}	https://spikespaz.com/search-deflector	\N	13	approved	2026-01-17 17:08:48.439688	\N	\N	MIT	\N	https://spikespaz.com/search-deflector	Imported from awesome-free-software. License: MIT	software
1336	Espanso	A cross-playform text expander	315	{windows,mac,linux,web}	https://github.com/federico-terzi/espanso	\N	13	approved	2026-01-17 17:08:48.441076	\N	\N	GNU GPLv3	\N	https://github.com/federico-terzi/espanso	Imported from awesome-free-software. License: GNU GPLv3	software
1337	Freeter	Freeter allows to gather everything you need for work in one place, organized by projects and workflows, and have a quick access to them. For Win, Linux, Mac OS.	315	{windows,mac,linux,web}	https://freeter.io/	\N	13	approved	2026-01-17 17:08:48.441901	\N	\N	GNU GPLv3	\N	https://freeter.io/	Imported from awesome-free-software. License: GNU GPLv3	software
1328	Atom	Hackable text and source code editor. (Archived)	271	{windows,mac,linux,web}	https://atom.io/	\N	13	approved	2026-01-17 17:08:48.433239	\N	\N	MIT	\N	https://atom.io/	Imported from awesome-free-software. License: MIT	software
1329	GNU nano	Simple text editor for the command line.	271	{windows,mac,linux,web}	https://www.nano-editor.org/	\N	13	approved	2026-01-17 17:08:48.434704	\N	\N	GNU GPL	\N	https://www.nano-editor.org/	Imported from awesome-free-software. License: GNU GPL	software
1330	vim	Vim is a highly configurable text editor built to make creating and changing any kind of text very efficient.	271	{windows,mac,linux,web}	https://www.vim.org/	\N	13	approved	2026-01-17 17:08:48.43543	\N	\N	GNU GPL compatible	\N	https://www.vim.org/	Imported from awesome-free-software. License: GNU GPL compatible	software
1331	VS Code	A source-code editor made by Microsoft	271	{windows,mac,linux,web}	https://github.com/microsoft/vscode	\N	13	approved	2026-01-17 17:08:48.436124	\N	\N	MIT	\N	https://github.com/microsoft/vscode	Imported from awesome-free-software. License: MIT	software
1339	QEMU	QEMU is a generic and open source machine emulator and virtualizer.	265	{windows,mac,linux,web}	http://www.qemu-project.org/	\N	13	approved	2026-01-17 17:08:48.445139	\N	\N	GNU GPLv2	\N	http://www.qemu-project.org/	Imported from awesome-free-software. License: GNU GPLv2	software
1351	MediaWiki	Wiki software that can organize and serve large amounts of frequently accessed data.	142	{windows,mac,linux,web}	https://www.mediawiki.org	\N	13	approved	2026-01-17 17:08:48.456702	\N	\N	GNU GPLv2+	\N	https://www.mediawiki.org	Imported from awesome-free-software. License: GNU GPLv2+	software
1352	MetaGer	Private search engine created by a non-profit that uses green electricity for its servers.	142	{windows,mac,linux,web}	https://metager.de/en	\N	13	approved	2026-01-17 17:08:48.457452	\N	\N	GNU AGPLv3	\N	https://metager.de/en	Imported from awesome-free-software. License: GNU AGPLv3	software
1353	Neocities	GeoCities for the modern world.	142	{windows,mac,linux,web}	https://neocities.org/	\N	13	approved	2026-01-17 17:08:48.458168	\N	\N	BSD 2-clause	\N	https://neocities.org/	Imported from awesome-free-software. License: BSD 2-clause	software
1354	NotABug.org	Collaboration platform for freely licensed projects.	142	{windows,mac,linux,web}	https://notabug.org/	\N	13	approved	2026-01-17 17:08:48.458873	\N	\N	MIT	\N	https://notabug.org/	Imported from awesome-free-software. License: MIT	software
1355	OpenStreetMap	Map of the world created by users and released under an open license.	142	{windows,mac,linux,web}	https://www.openstreetmap.org	\N	13	approved	2026-01-17 17:08:48.45959	\N	\N	GNU GPLv2	\N	https://www.openstreetmap.org	Imported from awesome-free-software. License: GNU GPLv2	software
1356	PeerTube	Decentralized video streaming service.	142	{windows,mac,linux,web}	https://framagit.org/chocobozzz/PeerTube	\N	13	approved	2026-01-17 17:08:48.460381	\N	\N	GNU AGPLv3	\N	https://framagit.org/chocobozzz/PeerTube	Imported from awesome-free-software. License: GNU AGPLv3	software
1357	Phabricator	Code management platform (similar to GitLab) built with PHP.	142	{windows,mac,linux,web}	https://phacility.com/phabricator/	\N	13	approved	2026-01-17 17:08:48.461113	\N	\N	Apache License 2.0	\N	https://phacility.com/phabricator/	Imported from awesome-free-software. License: Apache License 2.0	software
1358	Tolgee	Developer & translator friendly web-based localization platform.	142	{windows,mac,linux,web}	https://tolgee.io	\N	13	approved	2026-01-17 17:08:48.462568	\N	\N	Apache License 2.0	\N	https://tolgee.io	Imported from awesome-free-software. License: Apache License 2.0	software
1359	Wallabag	Save and classify articles. Read them later. Freely.	142	{windows,mac,linux,web}	https://wallabag.org/en	\N	13	approved	2026-01-17 17:08:48.463416	\N	\N	MIT	\N	https://wallabag.org/en	Imported from awesome-free-software. License: MIT	software
1360	Weblate	Translation management system with version control integration.	142	{windows,mac,linux,web}	https://weblate.org	\N	13	approved	2026-01-17 17:08:48.464651	\N	\N	GNU GPLv3	\N	https://weblate.org	Imported from awesome-free-software. License: GNU GPLv3	software
1361	WordPress	Blog publishing platform and content management system.	142	{windows,mac,linux,web}	https://wordpress.org/	\N	13	approved	2026-01-17 17:08:48.465485	\N	\N	GNU GPLv2+	\N	https://wordpress.org/	Imported from awesome-free-software. License: GNU GPLv2+	software
1362	Apache HTTP Server	Secure, efficient, and extensible web server.	143	{windows,mac,linux,web}	https://httpd.apache.org/	\N	13	approved	2026-01-17 17:08:48.466241	\N	\N	Apache License 2.0	\N	https://httpd.apache.org/	Imported from awesome-free-software. License: Apache License 2.0	software
1363	lighttpd	Optimized for speed-critical environments while remaining standards-compliant, secure and flexible.	143	{windows,mac,linux,web}	http://www.lighttpd.net/	\N	13	approved	2026-01-17 17:08:48.467034	\N	\N	Revised BSD license	\N	http://www.lighttpd.net/	Imported from awesome-free-software. License: Revised BSD license	software
1364	nginx	HTTP and reverse proxy server, a mail proxy server, and a generic TCP/UDP proxy server.	143	{windows,mac,linux,web}	https://nginx.org/	\N	13	approved	2026-01-17 17:08:48.467792	\N	\N	2-clause BSD-like license	\N	https://nginx.org/	Imported from awesome-free-software. License: 2-clause BSD-like license	software
1365	Apache Ant	Automation build tool, similar to make, a library and command-line tool whose mission is to drive processes described in build files as targets and extension points dependent upon each other	146	{Linux,Mac,Windows}	https://github.com/apache/ant	\N	1	approved	2026-01-17 17:48:41.203882	\N	\N	Apache-2.0	\N	\N	\N	software
1366	Apache Maven	Build automation tool mainly for Java. A software project management and comprehension tool. Based on the concept of a project object model (POM), Maven can manage a project's build, reporting and documentation from a central piece of information	146	{Linux,Mac,Windows}	https://github.com/apache/maven	\N	1	approved	2026-01-17 17:48:41.209497	\N	\N	Apache-2.0	\N	\N	\N	software
1367	Bazel	A fast, scalable, multi-language and extensible build system. Used by Google	146	{Linux,Mac,Windows}	https://github.com/bazelbuild/bazel/	\N	1	approved	2026-01-17 17:48:41.211025	\N	\N	Apache-2.0	\N	\N	\N	software
1368	Bolt	You can use Bolt to run one-off tasks, scripts to automate the provisioning and management of some nodes, you can use Bolt to move a step beyond scripts, and make them shareable	146	{Linux}	https://github.com/puppetlabs/bolt	\N	1	approved	2026-01-17 17:48:41.21228	\N	\N	Apache-2.0	\N	\N	\N	software
1369	GNU Make	The most popular automation build tool for many purposes, make is a tool which controls the generation of executables and other non-source files of a program from the program's source files	146	{Linux,Mac,Windows}	https://git.savannah.gnu.org/cgit/make.git	\N	1	approved	2026-01-17 17:48:41.213476	\N	\N	GPL-3.0	\N	\N	\N	software
1370	Gradle	Another build automation system	146	{Linux,Mac,Windows}	https://github.com/gradle/gradle	\N	1	approved	2026-01-17 17:48:41.214512	\N	\N	Apache-2.0	\N	\N	\N	software
1371	Rake	Build automation tool similar to Make, written in and extensible in Ruby	146	{Linux}	https://github.com/ruby/rake	\N	1	approved	2026-01-17 17:48:41.215523	\N	\N	MIT	\N	\N	\N	software
1372	Backupninja	Lightweight, extensible meta-backup system, provides a centralized way to configure and coordinate many different backup utilities. `GPL-2.0` `Shell`	147	{Linux}	https://0xacab.org/liberate/backupninja	\N	1	approved	2026-01-17 17:48:41.217694	\N	\N	GPL-2.0	\N	\N	\N	software
1374	Bareos	Cross-network backup solution which preserves, archives, and recovers data from all major operating systems	147	{Linux,Mac,Windows}	https://github.com/bareos/bareos	\N	1	approved	2026-01-17 17:48:41.219955	\N	\N	AGPL-3.0	\N	\N	\N	software
1375	Barman	Backup and Recovery Manager for PostgreSQL	147	{Linux,Mac,Windows}	https://github.com/EnterpriseDB/barman	\N	1	approved	2026-01-17 17:48:41.220912	\N	\N	GPL-3.0	\N	\N	\N	software
1379	Proxmox Backup Server	Proxmox Backup Server is an enterprise-class, client-server backup solution thatis capable of backing up virtual machines, containers, and physical hosts	147	{Linux,Mac,Windows}	https://git.proxmox.com/?p=proxmox-backup.git;a=tree	\N	1	approved	2026-01-17 17:48:41.228015	\N	\N	GPL-3.0	\N	\N	\N	software
1380	Rdiff-backup	Reverse differential backup tool, over a network or locally	147	{Linux,Mac,Windows}	https://github.com/rdiff-backup/rdiff-backup	\N	1	approved	2026-01-17 17:48:41.229185	\N	\N	GPL-2.0	\N	\N	\N	software
1382	Rsnapshot	Filesystem snapshot utility based on rsync	147	{Linux}	https://github.com/rsnapshot/rsnapshot	\N	1	approved	2026-01-17 17:48:41.231131	\N	\N	GPL-2.0	\N	\N	\N	software
1384	UrBackup	Client/Server Open Source Network Backup for Windows, MacOS and Linux	147	{Windows,Mac,Linux}	https://github.com/uroni/urbackup_backend	\N	1	approved	2026-01-17 17:48:41.232704	\N	\N	AGPL-3.0	\N	\N	\N	software
1385	EasyBuild	EasyBuild builds software and modulefiles for High Performance Computing (HPC) systems in an efficient way	148	{Linux,Mac,Windows}	https://github.com/easybuilders/easybuild-easyconfigs	\N	1	approved	2026-01-17 17:48:41.234356	\N	\N	GPL-2.0	\N	\N	\N	software
1386	Environment Modules	Environment Modules provides for the dynamic modification of a user's environment via modulefiles	148	{Linux,Mac,Windows}	https://github.com/cea-hpc/modules	\N	1	approved	2026-01-17 17:48:41.235231	\N	\N	GPL-2.0	\N	\N	\N	software
1387	Lmod	Lmod is a Lua based module system that easily handles the MODULEPATH Hierarchical problem	148	{Linux}	https://github.com/TACC/Lmod	\N	1	approved	2026-01-17 17:48:41.236029	\N	\N	MIT	\N	\N	\N	software
1388	Spack	A flexible package manager that supports multiple versions, configurations, platforms, and compilers	148	{Linux,Mac,Windows}	https://github.com/spack/spack	\N	1	approved	2026-01-17 17:48:41.236935	\N	\N	MIT/Apache-2.0	\N	\N	\N	software
1389	Eggdrop	The oldest Internet Relay Chat (IRC) bot still in active development	149	{Linux,Mac,Windows}	https://github.com/eggheads/eggdrop	\N	1	approved	2026-01-17 17:48:41.239883	\N	\N	GPL-2.0	\N	\N	\N	software
1390	Errbot	Plugin based chatbot designed to be easily deployable, extensible and maintainable	149	{Linux,Mac,Windows}	https://github.com/errbotio/errbot	\N	1	approved	2026-01-17 17:48:41.240747	\N	\N	GPL-3.0	\N	\N	\N	software
1391	Hubot	A customizable, life embetterment robot	149	{Linux}	https://github.com/hubotio/hubot	\N	1	approved	2026-01-17 17:48:41.241634	\N	\N	MIT	\N	\N	\N	software
1392	Ansible	Provisioning, configuration management, and application-deployment tool	150	{Linux,Mac,Windows}	https://github.com/ansible/ansible	\N	1	approved	2026-01-17 17:48:41.243197	\N	\N	GPL-3.0	\N	\N	\N	software
1393	CFEngine	Configuration management system for automated configuration and maintenance of large-scale computer systems	150	{Linux,Mac,Windows}	https://github.com/cfengine/core	\N	1	approved	2026-01-17 17:48:41.244047	\N	\N	GPL-3.0	\N	\N	\N	software
1394	Chef	Configuration management tool using a pure-Ruby, domain-specific language (DSL) for writing system configuration "recipes"	150	{Linux}	https://github.com/chef/chef	\N	1	approved	2026-01-17 17:48:41.244881	\N	\N	Apache-2.0	\N	\N	\N	software
1395	cloud-init	Initialization tool to automate the configuration of VMs, cloud instances, or machines on a network	150	{Linux,Mac,Windows}	https://github.com/canonical/cloud-init	\N	1	approved	2026-01-17 17:48:41.245652	\N	\N	GPL-3.0/Apache-2.0	\N	\N	\N	software
1396	Puppet	Software configuration management tool which includes its own declarative language to describe system configuration	150	{Linux,Mac,Windows}	https://github.com/puppetlabs/puppet	\N	1	approved	2026-01-17 17:48:41.24649	\N	\N	Apache-2.0	\N	\N	\N	software
1397	Rudder	Scalable and dynamic configuration management system for patching, security & compliance, based on CFEngine	150	{Linux,Mac,Windows}	https://github.com/Normation/rudder	\N	1	approved	2026-01-17 17:48:41.247265	\N	\N	GPL-3.0	\N	\N	\N	software
1398	Salt	Event-driven IT automation, remote task execution, and configuration management software	150	{Linux,Mac,Windows}	https://github.com/saltstack/salt	\N	1	approved	2026-01-17 17:48:41.248023	\N	\N	Apache-2.0	\N	\N	\N	software
1399	Collins	At Tumblr, it's the infrastructure source of truth and knowledge	151	{Linux,Mac,Windows}	https://github.com/tumblr/collins	\N	1	approved	2026-01-17 17:48:41.249843	\N	\N	Apache-2.0	\N	\N	\N	software
1400	i-doit	IT Documentation and CMDB. `AGPL-3.0` `PHP`	151	{Web}	https://www.i-doit.org/	\N	1	approved	2026-01-17 17:48:41.25054	\N	\N	AGPL-3.0	\N	\N	\N	software
1401	iTop	Complete ITIL web based service management tool	151	{Web}	https://sourceforge.net/projects/itop/files/	\N	1	approved	2026-01-17 17:48:41.251308	\N	\N	AGPL-3.0	\N	\N	\N	software
1402	netbox	IP address management (IPAM) and data center infrastructure management (DCIM) tool. ([Demo](https://demo.netbox.dev/), [Source Code](https://github.com/netbox-community/netbox)) `Apache-2.0` `Python`	151	{Linux,Mac,Windows}	https://github.com/netbox-community/netbox	\N	1	approved	2026-01-17 17:48:41.2521	\N	\N	Apache-2.0	\N	\N	\N	software
1403	ArgoCD	Declarative, GitOps continuous delivery tool for Kubernetes	152	{Linux,Mac,Windows}	https://github.com/argoproj/argo-cd	\N	1	approved	2026-01-17 17:48:41.255062	\N	\N	Apache-2.0	\N	\N	\N	software
1404	Buildbot	Python-based toolkit for continuous integration	152	{Linux,Mac,Windows}	https://github.com/buildbot/buildbot	\N	1	approved	2026-01-17 17:48:41.256197	\N	\N	GPL-2.0	\N	\N	\N	software
1405	CDS	Enterprise-Grade Continuous Delivery & DevOps Automation Open Source Platform	152	{Linux,Mac,Windows}	https://github.com/ovh/cds	\N	1	approved	2026-01-17 17:48:41.257071	\N	\N	BSD-3-Clause	\N	\N	\N	software
1406	Concourse	Concourse is a CI tool that treats pipelines as first class objects and containerizes every step along the way. ([Demo](https://ci.concourse-ci.org/), [Source Code](https://github.com/concourse/concourse)) `Apache-2.0` `Go`	152	{Linux,Mac,Windows}	https://github.com/concourse/concourse	\N	1	approved	2026-01-17 17:48:41.257872	\N	\N	Apache-2.0	\N	\N	\N	software
1407	drone	Drone is a Continuous Delivery platform built on Docker, written in Go	152	{Linux,Mac,Windows}	https://github.com/drone/drone	\N	1	approved	2026-01-17 17:48:41.258657	\N	\N	Apache-2.0	\N	\N	\N	software
1473	TextMate	A graphical text editor for OS X	159	{Linux,Mac,Windows}	https://github.com/textmate/textmate/	\N	1	approved	2026-01-17 17:48:41.32146	\N	\N	GPL-3.0	\N	\N	\N	software
1408	Factor	Programmatically define and run workflows to connect configuration management, source code management, build, continuous integration, continuous deployment and communication tools	152	{Linux}	https://github.com/factor-io/factor	\N	1	approved	2026-01-17 17:48:41.25944	\N	\N	MIT	\N	\N	\N	software
1409	GitLab CI	Gitlab's built-in, full-featured CI/CD solution	152	{Linux}	https://gitlab.com/gitlab-org/gitlab-foss	\N	1	approved	2026-01-17 17:48:41.260192	\N	\N	MIT	\N	\N	\N	software
1410	GoCD	Continuous delivery server	152	{Linux,Mac,Windows}	https://github.com/gocd/gocd	\N	1	approved	2026-01-17 17:48:41.260922	\N	\N	Apache-2.0	\N	\N	\N	software
1411	Jenkins	Continuous Integration Server	152	{Linux,Mac,Windows}	https://github.com/jenkinsci/jenkins/	\N	1	approved	2026-01-17 17:48:41.26161	\N	\N	MIT	\N	\N	\N	software
1412	Laminar	Fast, lightweight, simple and flexible Continuous Integration	152	{Linux,Mac,Windows}	https://github.com/ohwgiles/laminar	\N	1	approved	2026-01-17 17:48:41.262335	\N	\N	GPL-3.0	\N	\N	\N	software
1413	PHP Censor	Open source self-hosted continuous integration server for PHP projects. `BSD-2-Clause` `PHP`	152	{Web}	https://github.com/php-censor/php-censor	\N	1	approved	2026-01-17 17:48:41.2631	\N	\N	BSD-2-Clause	\N	\N	\N	software
1414	Strider	Open Source Continuous Deployment / Continuous Integration platform	152	{Linux}	https://github.com/Strider-CD/strider	\N	1	approved	2026-01-17 17:48:41.263995	\N	\N	MIT	\N	\N	\N	software
1415	Terrateam	GitOps-first automation platform for Terraform and OpenTofu workflows with support for self-hosted runners	152	{Linux,Mac,Windows}	https://github.com/terrateamio/terrateam	\N	1	approved	2026-01-17 17:48:41.264785	\N	\N	MPL-2.0	\N	\N	\N	software
1416	werf	Open Source CI/CD tool for building Docker images and deploying to Kubernetes via GitOps	152	{Linux,Mac,Windows}	https://github.com/werf/werf	\N	1	approved	2026-01-17 17:48:41.265595	\N	\N	Apache-2.0	\N	\N	\N	software
1417	Woodpecker	Community fork of Drone that uses Docker containers	152	{Linux,Mac,Windows}	https://github.com/woodpecker-ci/woodpecker	\N	1	approved	2026-01-17 17:48:41.266427	\N	\N	Apache-2.0	\N	\N	\N	software
1418	Ajenti	Control panel for Linux and BSD	153	{Linux}	https://github.com/ajenti/ajenti	\N	1	approved	2026-01-17 17:48:41.268694	\N	\N	MIT	\N	\N	\N	software
1419	Cockpit	Web-based graphical interface for servers	153	{Linux,Mac,Windows}	https://github.com/cockpit-project/cockpit	\N	1	approved	2026-01-17 17:48:41.269817	\N	\N	LGPL-2.1	\N	\N	\N	software
1420	Froxlor	Lightweight server management software with Nginx and PHP-FPM support	153	{Web}	https://github.com/Froxlor/Froxlor/	\N	1	approved	2026-01-17 17:48:41.271146	\N	\N	GPL-2.0	\N	\N	\N	software
1421	HestiaCP	Web server control panel (fork of VestaCP). ([Demo](https://demo.hestiacp.com:8083/login/), [Source Code](https://github.com/hestiacp/hestiacp)) `GPL-3.0` `PHP/Shell/Other`	153	{Web}	https://github.com/hestiacp/hestiacp	\N	1	approved	2026-01-17 17:48:41.272018	\N	\N	GPL-3.0	\N	\N	\N	software
1422	ISPConfig	Manage Linux servers directly through your browser	153	{Linux}	https://git.ispconfig.org/ispconfig/ispconfig3	\N	1	approved	2026-01-17 17:48:41.274136	\N	\N	BSD-3-Clause	\N	\N	\N	software
1423	Sentora	Open-Source Web hosting control panel for Linux, BSD (fork of ZPanel)	153	{Linux}	https://github.com/sentora/sentora-core	\N	1	approved	2026-01-17 17:48:41.275316	\N	\N	GPL-3.0	\N	\N	\N	software
1424	Virtualmin	Powerful and flexible web hosting control panel for Linux and BSD systems	153	{Linux}	https://github.com/virtualmin	\N	1	approved	2026-01-17 17:48:41.276402	\N	\N	GPL-3.0	\N	\N	\N	software
1425	Webmin	Web-based interface for system administration for Unix	153	{Web}	https://github.com/webmin/webmin	\N	1	approved	2026-01-17 17:48:41.27711	\N	\N	BSD-3-Clause	\N	\N	\N	software
1427	CloudSlang	Flow-based orchestration tool for managing deployed applications, with Docker capabilities	154	{Linux,Mac,Windows}	https://github.com/CloudSlang/score	\N	1	approved	2026-01-17 17:48:41.279268	\N	\N	Apache-2.0	\N	\N	\N	software
1428	CloudStack	Cloud computing software for creating, managing, and deploying infrastructure cloud services	154	{Linux,Mac,Windows}	https://github.com/apache/cloudstack	\N	1	approved	2026-01-17 17:48:41.279996	\N	\N	Apache-2.0	\N	\N	\N	software
1430	Fabric	Python library and cli tool for streamlining the use of SSH for application deployment or systems administration tasks	154	{Linux,Mac,Windows}	https://github.com/fabric/fabric	\N	1	approved	2026-01-17 17:48:41.281948	\N	\N	BSD-2-Clause	\N	\N	\N	software
1431	Genesis	A template framework for multi-environment BOSH deployments. `MIT` `Perl`	154	{Linux}	https://github.com/starkandwayne/genesis	\N	1	approved	2026-01-17 17:48:41.282682	\N	\N	MIT	\N	\N	\N	software
1432	munki	Webserver-based repository of packages and package metadata, that allows macOS administrators to manage software installs	154	{Mac}	https://github.com/munki/munki	\N	1	approved	2026-01-17 17:48:41.283648	\N	\N	Apache-2.0	\N	\N	\N	software
1433	Overcast	Deploy VMs across different cloud providers, and run commands and scripts across any or all of them in parallel via SSH	154	{Linux}	https://github.com/andrewchilds/overcast	\N	1	approved	2026-01-17 17:48:41.284353	\N	\N	MIT	\N	\N	\N	software
1434	Diagrams.net	A.K.A. [Draw.io](https://app.diagrams.net/). Easy to use Diagram UI with a plethora of templates	155	{Linux,Mac,Windows}	https://github.com/jgraph/drawio	\N	1	approved	2026-01-17 17:48:41.285983	\N	\N	Apache-2.0	\N	\N	\N	software
1436	Mermaid	Javascript module with a unique, easy, shorthand syntax. Integrates into several other tools like Grafana	155	{Linux,Mac,Windows}	https://github.com/mermaid-js/mermaid-live-editor	\N	1	approved	2026-01-17 17:48:41.287705	\N	\N	MIT	\N	\N	\N	software
1437	Ceph	Distributed object, block, and file storage platform	156	{Linux,Mac,Windows}	https://github.com/ceph/ceph	\N	1	approved	2026-01-17 17:48:41.289573	\N	\N	LGPL-3.0	\N	\N	\N	software
1438	DRBD	Distributed replicated storage system, implemented as a Linux kernel driver	156	{Linux}	https://github.com/LINBIT/drbd	\N	1	approved	2026-01-17 17:48:41.290452	\N	\N	GPL-2.0	\N	\N	\N	software
1439	GlusterFS	Software-defined distributed storage that can scale to several petabytes, with interfaces for object, block and file storage	156	{Linux,Mac,Windows}	https://github.com/gluster/glusterfs	\N	1	approved	2026-01-17 17:48:41.291164	\N	\N	GPL-2.0/LGPL-3.0	\N	\N	\N	software
1708	/e/	Privacy-focused mobile OS	194	{Linux,Mac,Windows}	https://www.patreon.com/eelo	\N	1	approved	2026-01-18 09:32:25.308677	\N	\N	Open Source	\N	\N	\N	software
1440	Hadoop Distributed Filesystem (HDFS)	Distributed file system that provides high-throughput access to application data	156	{Linux,Mac,Windows}	https://github.com/apache/hadoop	\N	1	approved	2026-01-17 17:48:41.291945	\N	\N	Apache-2.0	\N	\N	\N	software
1441	JuiceFS	Distributed POSIX file system built on top of Redis and S3	156	{Linux,Mac,Windows}	https://github.com/juicedata/juicefs	\N	1	approved	2026-01-17 17:48:41.293216	\N	\N	Apache-2.0	\N	\N	\N	software
1442	Kubo	Implementation of IPFS, a global, versioned, peer-to-peer filesystem that seeks to connect all computing devices with the same system of files. `Apache-2.0/MIT` `Go`	156	{Linux,Mac,Windows}	https://github.com/ipfs/kubo	\N	1	approved	2026-01-17 17:48:41.293978	\N	\N	Apache-2.0/MIT	\N	\N	\N	software
1443	LeoFS	Highly available, distributed, replicated eventually consistent object/blob store	156	{Linux}	https://github.com/leo-project/leofs	\N	1	approved	2026-01-17 17:48:41.294686	\N	\N	Apache-2.0	\N	\N	\N	software
1444	Lustre	Parallel distributed file system, generally used for large-scale cluster computing	156	{Linux,Mac,Windows}	https://git.whamcloud.com/?p=fs/lustre-release.git;a=summary	\N	1	approved	2026-01-17 17:48:41.295384	\N	\N	GPL-2.0	\N	\N	\N	software
1445	Minio	High-performance, S3 compatible object store built for large scale AI/ML, data lake and database workloads	156	{Linux,Mac,Windows}	https://github.com/minio/minio	\N	1	approved	2026-01-17 17:48:41.29613	\N	\N	AGPL-3.0	\N	\N	\N	software
1446	MooseFS	Fault tolerant, network distributed file system	156	{Linux,Mac,Windows}	https://github.com/moosefs/moosefs	\N	1	approved	2026-01-17 17:48:41.296804	\N	\N	GPL-2.0	\N	\N	\N	software
1447	OpenAFS	Distributed network file system with read-only replicas and multi-OS support	156	{Linux,Mac,Windows}	https://git.openafs.org/?p=openafs.git;a=summary	\N	1	approved	2026-01-17 17:48:41.297726	\N	\N	IPL-1.0	\N	\N	\N	software
1448	Openstack Swift	A highly available, distributed, eventually consistent object/blob store	156	{Linux,Mac,Windows}	https://opendev.org/openstack/swift	\N	1	approved	2026-01-17 17:48:41.298443	\N	\N	Apache-2.0	\N	\N	\N	software
1449	Perkeep	A set of open source formats, protocols, and software for modeling, storing, searching, sharing and synchronizing data (previously Camlistore)	156	{Linux,Mac,Windows}	https://github.com/perkeep/perkeep	\N	1	approved	2026-01-17 17:48:41.299379	\N	\N	Apache-2.0	\N	\N	\N	software
1450	TahoeLAFS	Secure, decentralized, fault-tolerant, peer-to-peer distributed data store and distributed file system	156	{Linux,Mac,Windows}	https://github.com/tahoe-lafs/tahoe-lafs	\N	1	approved	2026-01-17 17:48:41.300076	\N	\N	GPL-2.0	\N	\N	\N	software
1451	XtreemFS	Distributed, replicated and fault-tolerant file system for federated IT infrastructures.	156	{Linux,Mac,Windows}	https://github.com/xtreemfs/xtreemfs	\N	1	approved	2026-01-17 17:48:41.300833	\N	\N	BSD-3-Clause	\N	\N	\N	software
1452	Atomia DNS	DNS management system. `ISC` `Perl`	157	{Linux}	https://github.com/atomia/atomiadns/	\N	1	approved	2026-01-17 17:48:41.302098	\N	\N	ISC	\N	\N	\N	software
1453	Designate	DNSaaS services for OpenStack	157	{Linux,Mac,Windows}	https://opendev.org/openstack/designate	\N	1	approved	2026-01-17 17:48:41.302879	\N	\N	Apache-2.0	\N	\N	\N	software
1454	DNSControl	Synchronize your DNS to multiple providers from a simple DSL	157	{Linux,Mac,Windows}	https://github.com/StackExchange/dnscontrol	\N	1	approved	2026-01-17 17:48:41.303662	\N	\N	MIT	\N	\N	\N	software
1455	DomainMOD	Manage your domains and other internet assets in a central location	157	{Web}	https://github.com/domainmod/domainmod	\N	1	approved	2026-01-17 17:48:41.304354	\N	\N	GPL-3.0	\N	\N	\N	software
1456	nsupdate.info	Dynamic DNS service. ([Demo](https://www.nsupdate.info/account/register/), [Source Code](https://github.com/nsupdate-info/nsupdate.info)) `BSD-3-Clause` `Python`	157	{Linux,Mac,Windows}	https://github.com/nsupdate-info/nsupdate.info	\N	1	approved	2026-01-17 17:48:41.30516	\N	\N	BSD-3-Clause	\N	\N	\N	software
1457	octoDNS	DNS as code - Tools for managing DNS across multiple providers. `MIT` `Python`	157	{Linux,Mac,Windows}	https://github.com/github/octodns	\N	1	approved	2026-01-17 17:48:41.305881	\N	\N	MIT	\N	\N	\N	software
1458	Poweradmin	Web-based DNS control panel for PowerDNS server	157	{Web}	https://github.com/poweradmin/poweradmin	\N	1	approved	2026-01-17 17:48:41.30659	\N	\N	GPL-3.0	\N	\N	\N	software
1459	SPF Toolbox	Application to look up DNS records such as SPF, MX, Whois, and more	157	{Web}	https://github.com/charlesabarnes/SPFtoolbox	\N	1	approved	2026-01-17 17:48:41.307274	\N	\N	MIT	\N	\N	\N	software
1460	Bind	Versatile, classic, complete name server software	158	{Linux,Mac,Windows}	https://gitlab.isc.org/isc-projects/bind9	\N	1	approved	2026-01-17 17:48:41.308848	\N	\N	MPL-2.0	\N	\N	\N	software
1461	CoreDNS	Flexible DNS server	158	{Linux,Mac,Windows}	https://github.com/coredns/coredns	\N	1	approved	2026-01-17 17:48:41.309519	\N	\N	Apache-2.0	\N	\N	\N	software
1462	djbdns	A collection of DNS applications, including tinydns	158	{Linux,Mac,Windows}	https://salsa.debian.org/debian/djbdns	\N	1	approved	2026-01-17 17:48:41.310188	\N	\N	CC0-1.0	\N	\N	\N	software
1463	dnsmasq	Provides network infrastructure for small networks: DNS, DHCP, router advertisement and network boot	158	{Linux,Mac,Windows}	https://thekelleys.org.uk/gitweb/?p=dnsmasq.git;a=tree	\N	1	approved	2026-01-17 17:48:41.31088	\N	\N	GPL-2.0	\N	\N	\N	software
1464	Knot	High performance authoritative-only DNS server	158	{Linux,Mac,Windows}	https://gitlab.nic.cz/knot/knot-dns	\N	1	approved	2026-01-17 17:48:41.311563	\N	\N	GPL-3.0	\N	\N	\N	software
1465	NSD	Authoritative DNS name server developed speed, reliability, stability and security	158	{Linux,Mac,Windows}	https://github.com/NLnetLabs/nsd	\N	1	approved	2026-01-17 17:48:41.312307	\N	\N	BSD-3-Clause	\N	\N	\N	software
1466	PowerDNS Authoritative Server	Versatile nameserver which supports a large number of backends	158	{Linux,Mac,Windows}	https://github.com/PowerDNS/pdns	\N	1	approved	2026-01-17 17:48:41.312967	\N	\N	GPL-2.0	\N	\N	\N	software
1467	Unbound	Validating, recursive, and caching DNS resolver	158	{Linux,Mac,Windows}	https://github.com/NLnetLabs/unbound	\N	1	approved	2026-01-17 17:48:41.313653	\N	\N	BSD-3-Clause	\N	\N	\N	software
1468	Yadifa	Clean, small, light and RFC-compliant name server implementation developed from scratch by .eu	158	{Linux,Mac,Windows}	https://github.com/yadifa/yadifa	\N	1	approved	2026-01-17 17:48:41.314405	\N	\N	BSD-3-Clause	\N	\N	\N	software
1469	Atom Community	A fork of [atom](https://github.com/atom/atom) A hackable text editor from Github. `MIT` `JavaScript`	159	{Linux,Mac,Windows}	https://github.com/atom-community/atom	\N	1	approved	2026-01-17 17:48:41.315748	\N	\N	MIT	\N	\N	\N	software
1470	GNU Emacs	An extensible, customizable text editor-and more	159	{Linux,Mac,Windows}	https://github.com/emacs-mirror/emacs	\N	1	approved	2026-01-17 17:48:41.317583	\N	\N	GPL-3.0	\N	\N	\N	software
1471	Haroopad	Markdown editor with live preview	159	{Linux,Mac,Windows}	https://github.com/rhiokim/haroopad	\N	1	approved	2026-01-17 17:48:41.318231	\N	\N	GPL-3.0	\N	\N	\N	software
1475	Apache Directory Server	Extensible and embeddable directory server, certified LDAPv3 compatible, with Kerberos 5 and Change Password Protocol support, triggers, stored procedures, queues and views	160	{Linux,Mac,Windows}	https://github.com/apache/directory-server	\N	1	approved	2026-01-17 17:48:41.324468	\N	\N	Apache-2.0	\N	\N	\N	software
1476	FreeIPA	Integrated security information management solution combining Linux (Fedora), 389 Directory Server, Kerberos, NTP, DNS, and Dogtag Certificate System (web interface and command-line administration tools)	160	{Linux}	https://pagure.io/freeipa	\N	1	approved	2026-01-17 17:48:41.325205	\N	\N	GPL-3.0	\N	\N	\N	software
1477	FreeRADIUS	Multi-protocol policy server (radiusd) that implements RADIUS, DHCP, BFD, and ARP and associated client/PAM library/Apache module	160	{Linux,Mac,Windows}	https://github.com/FreeRADIUS/freeradius-server	\N	1	approved	2026-01-17 17:48:41.325884	\N	\N	GPL-2.0	\N	\N	\N	software
1479	OpenLDAP	Open-source implementation of the Lightweight Directory Access Protocol (server, libraries and clients)	160	{Linux,Mac,Windows}	https://git.openldap.org/openldap/openldap	\N	1	approved	2026-01-17 17:48:41.327295	\N	\N	OLDAP-2.8	\N	\N	\N	software
1480	Authelia	The Single Sign-On Multi-Factor portal for web apps	161	{Linux,Mac,Windows}	https://github.com/authelia/authelia	\N	1	approved	2026-01-17 17:48:41.329015	\N	\N	Apache-2.0	\N	\N	\N	software
1481	Authentik	Flexible identity provider with support for different protocols. (OAuth 2.0, SAML, LDAP and Radius)	161	{Linux,Mac,Windows}	https://github.com/goauthentik/authentik	\N	1	approved	2026-01-17 17:48:41.329676	\N	\N	MIT	\N	\N	\N	software
1482	KeyCloak	Open Source Identity and Access Management	161	{Linux,Mac,Windows}	https://github.com/keycloak/keycloak	\N	1	approved	2026-01-17 17:48:41.330317	\N	\N	Apache-2.0	\N	\N	\N	software
1483	BounCA	A personal SSL Key / Certificate Authority web-based tool for creating self-signed certificates	162	{Linux,Mac,Windows}	https://gitlab.com/bounca/bounca/	\N	1	approved	2026-01-17 17:48:41.331614	\N	\N	Apache-2.0	\N	\N	\N	software
1484	easy-rsa	Bash script to build and manage a PKI CA. `GPL-2.0` `Shell`	162	{Linux}	https://github.com/OpenVPN/easy-rsa	\N	1	approved	2026-01-17 17:48:41.332362	\N	\N	GPL-2.0	\N	\N	\N	software
1485	Fusion Directory	Improve the Management of the services and the company directory based on OpenLDAP	162	{Web}	https://github.com/fusiondirectory/fusiondirectory	\N	1	approved	2026-01-17 17:48:41.333255	\N	\N	GPL-2.0	\N	\N	\N	software
1486	LDAP Account Manager (LAM)	Web frontend for managing entries (e.g. users, groups, DHCP settings) stored in an LDAP directory	162	{Web}	https://github.com/LDAPAccountManager/lam/	\N	1	approved	2026-01-17 17:48:41.333942	\N	\N	GPL-3.0	\N	\N	\N	software
1487	Libravatar	Libravatar is a service which delivers your avatar (profile picture) to other websites	162	{Linux,Mac,Windows}	https://git.linux-kernel.at/oliver/ivatar/	\N	1	approved	2026-01-17 17:48:41.334631	\N	\N	AGPL-3.0	\N	\N	\N	software
1488	Pomerium	An identity and context aware access-proxy inspired by BeyondCorp	162	{Linux,Mac,Windows}	https://github.com/pomerium/pomerium	\N	1	approved	2026-01-17 17:48:41.335391	\N	\N	Apache-2.0	\N	\N	\N	software
1489	Samba	Active Directory and CIFS protocol implementation	162	{Linux,Mac,Windows}	https://download.samba.org/pub/samba/	\N	1	approved	2026-01-17 17:48:41.336098	\N	\N	GPL-3.0	\N	\N	\N	software
1490	Smallstep Certificates	A private certificate authority (X.509 & SSH) and related tools for secure automated certificate management	162	{Linux,Mac,Windows}	https://github.com/smallstep/certificates	\N	1	approved	2026-01-17 17:48:41.336783	\N	\N	Apache-2.0	\N	\N	\N	software
1491	ZITADEL	Cloud-native Identity & Access Management solution providing a platform for secure authentication, authorization and identity management	162	{Linux,Mac,Windows}	https://github.com/zitadel/zitadel	\N	1	approved	2026-01-17 17:48:41.337549	\N	\N	Apache-2.0	\N	\N	\N	software
1492	GLPI	Information Resource-Manager with an additional Administration Interface	163	{Web}	https://github.com/glpi-project/glpi	\N	1	approved	2026-01-17 17:48:41.338885	\N	\N	GPL-3.0	\N	\N	\N	software
1493	OCS Inventory NG	Asset management and deployment solution for all devices in your IT Department	163	{Web}	https://github.com/OCSInventory-NG	\N	1	approved	2026-01-17 17:48:41.339793	\N	\N	GPL-2.0	\N	\N	\N	software
1494	OPSI	Hardware and software inventory, client management, deployment, and patching for Linux and Windows	163	{Windows,Linux}	https://github.com/opsi-org/	\N	1	approved	2026-01-17 17:48:41.340479	\N	\N	GPL-3.0/AGPL-3.0	\N	\N	\N	software
1495	RackTables	Datacenter and server room asset management like document hardware assets, network addresses, space in racks, networks configuration. ([Demo](https://www.racktables.org/demo.php), [Source Code](https://github.com/RackTables/racktables)) `GPL-2.0` `PHP`	163	{Web}	https://github.com/RackTables/racktables	\N	1	approved	2026-01-17 17:48:41.341581	\N	\N	GPL-2.0	\N	\N	\N	software
1496	Ralph	Asset management, DCIM and CMDB system for large Data Centers as well as smaller LAN networks. ([Demo](https://github.com/allegro/ralph#live-demo), [Source Code](https://github.com/allegro/ralph)) `Apache-2.0` `Python/Docker`	163	{Linux,Mac,Windows}	https://github.com/allegro/ralph	\N	1	approved	2026-01-17 17:48:41.342336	\N	\N	Apache-2.0	\N	\N	\N	software
1497	Snipe IT	Asset & license management software	163	{Web}	https://github.com/snipe/snipe-it	\N	1	approved	2026-01-17 17:48:41.343012	\N	\N	AGPL-3.0	\N	\N	\N	software
1498	Fluentd	Data collector for unified logging layer	164	{Linux}	https://github.com/fluent/fluentd	\N	1	approved	2026-01-17 17:48:41.344358	\N	\N	Apache-2.0	\N	\N	\N	software
1499	Flume	Distributed, reliable, and available service for efficiently collecting, aggregating, and moving large amounts of log data	164	{Linux,Mac,Windows}	https://github.com/apache/flume	\N	1	approved	2026-01-17 17:48:41.345089	\N	\N	Apache-2.0	\N	\N	\N	software
1500	GoAccess	Real-time web log analyzer and interactive viewer that runs in a terminal or through the browser	164	{Linux,Mac,Windows}	https://github.com/allinurl/goaccess	\N	1	approved	2026-01-17 17:48:41.34576	\N	\N	MIT	\N	\N	\N	software
1501	Loki	Log aggregation system designed to store and query logs from all your applications and infrastructure	164	{Linux,Mac,Windows}	https://github.com/grafana/loki	\N	1	approved	2026-01-17 17:48:41.346564	\N	\N	AGPL-3.0	\N	\N	\N	software
1502	rsyslog	Rocket-fast system for log processing	164	{Linux,Mac,Windows}	https://github.com/rsyslog/rsyslog	\N	1	approved	2026-01-17 17:48:41.347365	\N	\N	GPL-3.0	\N	\N	\N	software
1503	Claws Mail	Old school email client (and news reader), based on GTK+	165	{Linux,Mac,Windows}	https://git.claws-mail.org/?p=claws.git;a=tree	\N	1	approved	2026-01-17 17:48:41.349456	\N	\N	GPL-3.0	\N	\N	\N	software
1504	ImapSync	Simple IMAP migration tool for copying mailboxes to other servers	165	{Linux}	https://github.com/imapsync/imapsync	\N	1	approved	2026-01-17 17:48:41.350163	\N	\N	NLPL	\N	\N	\N	software
1505	Beats	Single-purpose data shippers that send data from hundreds or thousands of machines and systems to Logstash or Elasticsearch	166	{Linux,Mac,Windows}	https://github.com/elastic/beats	\N	1	approved	2026-01-17 17:48:41.352414	\N	\N	Apache-2.0	\N	\N	\N	software
1506	Collectd	System statistics collection daemon	166	{Linux,Mac,Windows}	https://github.com/collectd/collectd	\N	1	approved	2026-01-17 17:48:41.354049	\N	\N	MIT	\N	\N	\N	software
1507	Diamond	Daemon that collects system metrics and publishes them to Graphite (and others). `MIT` `Python`	166	{Linux,Mac,Windows}	https://github.com/python-diamond/Diamond	\N	1	approved	2026-01-17 17:48:41.354924	\N	\N	MIT	\N	\N	\N	software
1508	Grafana	A Graphite & InfluxDB Dashboard and Graph Editor	166	{Linux,Mac,Windows}	https://github.com/grafana/grafana	\N	1	approved	2026-01-17 17:48:41.35561	\N	\N	AGPL-3.0	\N	\N	\N	software
1509	RRDtool	Industry standard, high performance data logging and graphing system for time series data	166	{Linux,Mac,Windows}	https://github.com/oetiker/rrdtool-1.x	\N	1	approved	2026-01-17 17:48:41.356651	\N	\N	GPL-2.0	\N	\N	\N	software
1510	Statsd	Daemon that listens for statistics like counters and timers, sent over UDP or TCP, and sends aggregates to one or more pluggable backend services. `MIT` `Nodejs`	166	{Linux}	https://github.com/etsy/statsd/	\N	1	approved	2026-01-17 17:48:41.357404	\N	\N	MIT	\N	\N	\N	software
1511	tcollector	Gathers data from local collectors and pushes the data to OpenTSDB	166	{Linux,Mac,Windows}	https://github.com/OpenTSDB/tcollector/	\N	1	approved	2026-01-17 17:48:41.358096	\N	\N	LGPL-3.0/GPL-3.0	\N	\N	\N	software
1512	Telegraf	Plugin-driven server agent for collecting, processing, aggregating, and writing metrics. `MIT` `Go`	166	{Linux,Mac,Windows}	https://github.com/influxdata/telegraf	\N	1	approved	2026-01-17 17:48:41.358796	\N	\N	MIT	\N	\N	\N	software
1513	Chocolatey	The package manager for Windows	167	{Windows}	https://github.com/chocolatey/choco	\N	1	approved	2026-01-17 17:48:41.359978	\N	\N	Apache-2.0	\N	\N	\N	software
1514	DadaMail	Mailing List Manager, written in Perl	167	{Linux}	https://sourceforge.net/projects/dadamail/files/	\N	1	approved	2026-01-17 17:48:41.361009	\N	\N	GPL-2.0	\N	\N	\N	software
1515	Fog	Cloning/imaging solution/rescue suite	167	{Web}	https://github.com/FOGProject/fogproject	\N	1	approved	2026-01-17 17:48:41.361701	\N	\N	GPL-3.0	\N	\N	\N	software
1516	phpList	Newsletter and email marketing software	167	{Web}	https://github.com/phpList/phplist3	\N	1	approved	2026-01-17 17:48:41.36239	\N	\N	AGPL-3.0	\N	\N	\N	software
1518	Alerta	Distributed, scalable and flexible monitoring system	168	{Linux,Mac,Windows}	https://github.com/alerta/alerta	\N	1	approved	2026-01-17 17:48:41.364436	\N	\N	Apache-2.0	\N	\N	\N	software
1519	Beszel	Lightweight server monitoring platform that includes Docker statistics, historical data, and alert functions	168	{Linux,Mac,Windows}	https://github.com/henrygd/beszel	\N	1	approved	2026-01-17 17:48:41.365076	\N	\N	MIT	\N	\N	\N	software
1520	Cacti	Web-based network monitoring and graphing tool	168	{Web}	https://github.com/Cacti/cacti	\N	1	approved	2026-01-17 17:48:41.365734	\N	\N	GPL-2.0	\N	\N	\N	software
1521	cadvisor	Analyzes resource usage and performance characteristics of running containers. `Apache-2.0` `Go`	168	{Linux,Mac,Windows}	https://github.com/google/cadvisor	\N	1	approved	2026-01-17 17:48:41.366385	\N	\N	Apache-2.0	\N	\N	\N	software
1522	checkmk	Comprehensive solution for monitoring of applications, servers, and networks	168	{Linux,Mac,Windows}	https://github.com/Checkmk/checkmk	\N	1	approved	2026-01-17 17:48:41.367043	\N	\N	GPL-2.0	\N	\N	\N	software
1523	dashdot	A simple, modern server dashboard for smaller private servers. ([Demo](https://dash.mauz.dev/)) `MIT` `Nodejs/Docker`	168	{Linux,Mac,Windows}	https://github.com/MauriceNino/dashdot	\N	1	approved	2026-01-17 17:48:41.367982	\N	\N	MIT	\N	\N	\N	software
1524	EdMon	A command-line monitoring application helping you to check that your hosts and services are available, with notifications support. `MIT` `Java`	168	{Linux,Mac,Windows}	https://github.com/Edraens/EdMon	\N	1	approved	2026-01-17 17:48:41.368692	\N	\N	MIT	\N	\N	\N	software
1525	eZ Server Monitor	A lightweight and simple dashboard monitor for Linux, available in Web and Bash application	168	{Linux}	https://github.com/shevabam/ezservermonitor-web	\N	1	approved	2026-01-17 17:48:41.369405	\N	\N	GPL-3.0	\N	\N	\N	software
1526	glances	Open-source, cross-platform real-time monitoring tool with CLI and web dashboard interfaces and many exporting options	168	{Linux,Mac,Windows}	https://github.com/nicolargo/glances	\N	1	approved	2026-01-17 17:48:41.370101	\N	\N	GPL-3.0	\N	\N	\N	software
1527	Icinga	Nagios fork that has since lapped nagios several times. Comes with the possibility of clustered monitoring	168	{Linux,Mac,Windows}	https://github.com/Icinga/icinga2	\N	1	approved	2026-01-17 17:48:41.371245	\N	\N	GPL-2.0	\N	\N	\N	software
1528	LibreNMS	Fully featured network monitoring system that provides a wealth of features and device support	168	{Web}	https://github.com/librenms/librenms	\N	1	approved	2026-01-17 17:48:41.371952	\N	\N	GPL-3.0	\N	\N	\N	software
1529	Linux Dash	A low-overhead monitoring web dashboard for a GNU/Linux machine. `MIT` `Nodejs/Go/Python/PHP`	168	{Linux}	https://github.com/afaqurk/linux-dash	\N	1	approved	2026-01-17 17:48:41.372634	\N	\N	MIT	\N	\N	\N	software
1530	Monit	Small utility for managing and monitoring Unix systems	168	{Linux,Mac,Windows}	https://bitbucket.org/tildeslash/monit/src/master/	\N	1	approved	2026-01-17 17:48:41.373318	\N	\N	AGPL-3.0	\N	\N	\N	software
1531	Munin	Networked resource monitoring tool	168	{Linux}	https://github.com/munin-monitoring/munin	\N	1	approved	2026-01-17 17:48:41.373979	\N	\N	GPL-2.0	\N	\N	\N	software
1532	Naemon	Network monitoring tool based on the Nagios 4 core with performance enhancements and new features	168	{Linux,Mac,Windows}	https://github.com/naemon/naemon-core	\N	1	approved	2026-01-17 17:48:41.374658	\N	\N	GPL-2.0	\N	\N	\N	software
1533	Nagios	Computer system, network and infrastructure monitoring software application	168	{Linux,Mac,Windows}	https://github.com/NagiosEnterprises/nagioscore	\N	1	approved	2026-01-17 17:48:41.375354	\N	\N	GPL-2.0	\N	\N	\N	software
1534	Netdata	Distributed, real-time, performance and health monitoring for systems and applications. Runs on Linux, FreeBSD, and MacOS	168	{Mac,Linux}	https://github.com/netdata/netdata	\N	1	approved	2026-01-17 17:48:41.376098	\N	\N	GPL-3.0	\N	\N	\N	software
1535	NetXMS	Open Source network and infrastructure monitoring and management	168	{Linux,Mac,Windows}	https://github.com/netxms/netxms	\N	1	approved	2026-01-17 17:48:41.376886	\N	\N	LGPL-3.0/GPL-3.0	\N	\N	\N	software
1536	Observium Community Edition	Network monitoring and management platform that provides real-time insight into network health and performance. `QPL-1.0` `PHP`	168	{Web}	http://www.observium.org/	\N	1	approved	2026-01-17 17:48:41.377599	\N	\N	QPL-1.0	\N	\N	\N	software
1537	openITCOCKPIT Community Edition	Monitoring Suite featuring seamless integrations with Naemon, Checkmk, Grafana and more. ([Demo](https://demo.openitcockpit.io/), [Source Code](https://github.com/openITCOCKPIT/openITCOCKPIT)) `GPL-3.0` `deb/Docker`	168	{Linux,Mac,Windows}	https://github.com/openITCOCKPIT/openITCOCKPIT	\N	1	approved	2026-01-17 17:48:41.378333	\N	\N	GPL-3.0	\N	\N	\N	software
1538	Performance Co-Pilot	Lightweight, distributed system performance and analysis framework	168	{Linux,Mac,Windows}	https://github.com/performancecopilot/pcp	\N	1	approved	2026-01-17 17:48:41.379243	\N	\N	LGPL-2.1/GPL-2.0	\N	\N	\N	software
1539	PHP Server Monitor	Open source tool to monitor your servers and websites	168	{Web}	https://github.com/phpservermon/phpservermon	\N	1	approved	2026-01-17 17:48:41.379968	\N	\N	GPL-3.0	\N	\N	\N	software
1540	PhpSysInfo	A customizable PHP script that displays information about your system nicely	168	{Web}	https://github.com/phpsysinfo/phpsysinfo	\N	1	approved	2026-01-17 17:48:41.380616	\N	\N	GPL-2.0	\N	\N	\N	software
1541	Prometheus	Service monitoring system and time series database	168	{Linux,Mac,Windows}	https://github.com/prometheus/prometheus	\N	1	approved	2026-01-17 17:48:41.381243	\N	\N	Apache-2.0	\N	\N	\N	software
1542	Riemann	Flexible and fast events processor allowing complex events/metrics analysis	168	{Linux,Mac,Windows}	https://github.com/riemann/riemann	\N	1	approved	2026-01-17 17:48:41.381922	\N	\N	EPL-1.0	\N	\N	\N	software
1543	rtop	Interactive, remote system monitoring tool based on SSH. `MIT` `Go`	168	{Linux,Mac,Windows}	https://github.com/rapidloop/rtop	\N	1	approved	2026-01-17 17:48:41.382596	\N	\N	MIT	\N	\N	\N	software
1544	ruptime	Classic system status server. `AGPL-3.0` `Shell`	168	{Linux}	https://github.com/alexmyczko/ruptime	\N	1	approved	2026-01-17 17:48:41.383237	\N	\N	AGPL-3.0	\N	\N	\N	software
1545	Scrutiny	Web UI for hard drive S.M.A.R.T monitoring, historical trends & real-world failure thresholds. `MIT` `Go`	168	{Linux,Mac,Windows}	https://github.com/AnalogJ/scrutiny	\N	1	approved	2026-01-17 17:48:41.383937	\N	\N	MIT	\N	\N	\N	software
1546	Sensu	Monitoring tool for ephemeral infrastructure and distributed applications	168	{Linux,Mac,Windows}	https://github.com/sensu/sensu-go	\N	1	approved	2026-01-17 17:48:41.38459	\N	\N	MIT	\N	\N	\N	software
1547	Status	Simple and lightweight system monitoring tool for small homeservers with a pleasant web interface. ([Demo](https://status.enshittification.social/) `MIT` `Python`	168	{Linux,Mac,Windows}	https://github.com/dani3l0/Status	\N	1	approved	2026-01-17 17:48:41.385277	\N	\N	MIT	\N	\N	\N	software
1548	Thruk	Multibackend monitoring web interface with support for Naemon, Nagios, Icinga and Shinken	168	{Web}	https://github.com/sni/Thruk	\N	1	approved	2026-01-17 17:48:41.385927	\N	\N	GPL-1.0	\N	\N	\N	software
1549	Uptime Kuma	Modern, self-hosted monitoring tool with a clean UI and rich notification support	168	{Linux}	https://github.com/louislam/uptime-kuma	\N	1	approved	2026-01-17 17:48:41.386602	\N	\N	MIT	\N	\N	\N	software
1550	Wazuh	Unified XDR and SIEM protection for endpoints and cloud workloads	168	{Linux,Mac,Windows}	https://github.com/wazuh/wazuh	\N	1	approved	2026-01-17 17:48:41.38727	\N	\N	GPL-2.0	\N	\N	\N	software
1551	Zabbix	Enterprise-class software for monitoring of networks and applications	168	{Linux,Mac,Windows}	https://git.zabbix.com/projects/ZBX/repos/zabbix/browse	\N	1	approved	2026-01-17 17:48:41.388049	\N	\N	GPL-2.0	\N	\N	\N	software
1552	GNS3	Graphical network simulator that provides a variety of virtual appliances	169	{Linux,Mac,Windows}	https://github.com/GNS3/gns3-gui/	\N	1	approved	2026-01-17 17:48:41.389399	\N	\N	GPL-3.0	\N	\N	\N	software
1553	OpenWISP	Open Source Network Management System for OpenWRT based routers and access points. ([Demo](https://openwisp.org/demo.html), [Source Code](https://github.com/openwisp)) `GPL-3.0` `Python`	169	{Linux,Mac,Windows}	https://github.com/openwisp	\N	1	approved	2026-01-17 17:48:41.390016	\N	\N	GPL-3.0	\N	\N	\N	software
1554	Oxidized	Network device configuration backup tool. `Apache-2.0` `Ruby`	169	{Linux}	https://github.com/ytti/oxidized	\N	1	approved	2026-01-17 17:48:41.390719	\N	\N	Apache-2.0	\N	\N	\N	software
1555	phpIPAM	Open source IP address management with PowerDNS integration	169	{Web}	https://github.com/phpipam/phpipam	\N	1	approved	2026-01-17 17:48:41.391399	\N	\N	GPL-3.0	\N	\N	\N	software
1556	RANCID	Monitor network devices configuration and maintain history of changes	169	{Linux}	https://github.com/haussli/rancid	\N	1	approved	2026-01-17 17:48:41.392055	\N	\N	BSD-3-Clause	\N	\N	\N	software
1557	rConfig	Network device configuration management tool	169	{Web}	https://github.com/rconfig/rconfig	\N	1	approved	2026-01-17 17:48:41.392842	\N	\N	GPL-3.0	\N	\N	\N	software
1558	CapRover	Build your own PaaS in a few minutes. ([Demo](https://captain.server.demo.caprover.com/#/login), [Source Code](https://github.com/caprover/caprover)) `Apache-2.0` `Docker/Nodejs`	170	{Linux,Mac,Windows}	https://github.com/caprover/caprover	\N	1	approved	2026-01-17 17:48:41.394182	\N	\N	Apache-2.0	\N	\N	\N	software
1559	Coolify	An open-source & self-hostable Heroku / Netlify alternative (and even more)	170	{Linux,Mac,Windows}	https://github.com/coollabsio/coolify	\N	1	approved	2026-01-17 17:48:41.394988	\N	\N	Apache-2.0	\N	\N	\N	software
1560	Dokku	An open-source PaaS (alternative to Heroku)	170	{Linux,Mac,Windows}	https://github.com/dokku/dokku	\N	1	approved	2026-01-17 17:48:41.395708	\N	\N	MIT	\N	\N	\N	software
1561	fx	A tool to help you do Function as a Service with painless on your own servers. `MIT` `Go`	170	{Linux,Mac,Windows}	https://github.com/metrue/fx	\N	1	approved	2026-01-17 17:48:41.39643	\N	\N	MIT	\N	\N	\N	software
1562	Kubero	A self-hosted Heroku PaaS alternative for Kubernetes that implements GitOps. ([Demo](https://demo.kubero.dev/), [Source Code](https://github.com/kubero-dev/kubero)) `GPL-3.0` `K8S/Nodejs/Go`	170	{Linux,Mac,Windows}	https://github.com/kubero-dev/kubero	\N	1	approved	2026-01-17 17:48:41.397105	\N	\N	GPL-3.0	\N	\N	\N	software
1563	LocalStack	LocalStack is a fully functional local AWS cloud stack. This includes Lambda for serverless computation	170	{Linux,Mac,Windows}	https://github.com/localstack/localstack	\N	1	approved	2026-01-17 17:48:41.397845	\N	\N	Apache-2.0	\N	\N	\N	software
1565	OpenFaaS	Serverless Functions Made Simple for Docker & Kubernetes	170	{Linux,Mac,Windows}	https://github.com/openfaas/faas	\N	1	approved	2026-01-17 17:48:41.399308	\N	\N	MIT	\N	\N	\N	software
1566	Tau	Easily build Cloud Computing Platforms with features like Serverless WebAssembly Functions, Frontend Hosting, CI/CD, Object Storage, K/V Database, and Pub-Sub Messaging	170	{Linux,Mac,Windows}	https://github.com/taubyte/tau	\N	1	approved	2026-01-17 17:48:41.400004	\N	\N	BSD-3-Clause	\N	\N	\N	software
1567	Trusted-CGI	Lightweight self-hosted lambda/applications/cgi/serverless-functions platform. `MIT` `Go/deb/Docker`	170	{Linux,Mac,Windows}	https://github.com/reddec/trusted-cgi	\N	1	approved	2026-01-17 17:48:41.400727	\N	\N	MIT	\N	\N	\N	software
1570	omnibus-ruby	Easily create full-stack installers for your project across a variety of platforms. `Apache-2.0` `Ruby`	171	{Linux}	https://github.com/chef/omnibus	\N	1	approved	2026-01-17 17:48:41.403813	\N	\N	Apache-2.0	\N	\N	\N	software
1571	tito	Builds RPMs for git-based projects. `GPL-2.0` `Python`	171	{Linux,Mac,Windows}	https://github.com/dgoodwin/tito	\N	1	approved	2026-01-17 17:48:41.404574	\N	\N	GPL-2.0	\N	\N	\N	software
1572	ActiveMQ	Java message broker	172	{Linux,Mac,Windows}	https://github.com/apache/activemq	\N	1	approved	2026-01-17 17:48:41.405839	\N	\N	Apache-2.0	\N	\N	\N	software
1573	BeanstalkD	A simple, fast work queue	172	{Linux,Mac,Windows}	https://github.com/beanstalkd/beanstalkd	\N	1	approved	2026-01-17 17:48:41.406601	\N	\N	MIT	\N	\N	\N	software
1574	Gearman	Fast multi-language queuing/job processing platform	172	{Linux,Mac,Windows}	https://github.com/gearman/gearmand	\N	1	approved	2026-01-17 17:48:41.407349	\N	\N	BSD-3-Clause	\N	\N	\N	software
1575	NSQ	A realtime distributed messaging platform	172	{Linux,Mac,Windows}	https://github.com/nsqio/nsq	\N	1	approved	2026-01-17 17:48:41.408132	\N	\N	MPL-2.0	\N	\N	\N	software
1576	ZeroMQ	Lightweight queuing system	172	{Linux,Mac,Windows}	https://github.com/zeromq	\N	1	approved	2026-01-17 17:48:41.408793	\N	\N	GPL-3.0	\N	\N	\N	software
1577	Tiger VNC	High-performance, multi-platform VNC client and server	173	{Linux,Mac,Windows}	https://github.com/TigerVNC/tigervnc	\N	1	approved	2026-01-17 17:48:41.41104	\N	\N	GPL-2.0	\N	\N	\N	software
1578	X2go	X2Go is an open source remote desktop software for Linux that uses the NoMachine/NX technology protocol	173	{Linux}	https://code.x2go.org/gitweb	\N	1	approved	2026-01-17 17:48:41.411773	\N	\N	GPL-2.0	\N	\N	\N	software
1579	DD-WRT	A Linux-based firmware for wireless routers and access points, originally designed for the Linksys WRT54G series	174	{Linux}	https://svn.dd-wrt.com/	\N	1	approved	2026-01-17 17:48:41.413162	\N	\N	GPL-2.0	\N	\N	\N	software
1580	IPFire	Free network firewall distribution, based on the Linux operating system with easy-to-use web management console	174	{Linux}	https://github.com/ipfire/ipfire-2.x	\N	1	approved	2026-01-17 17:48:41.414301	\N	\N	GPL-2.0	\N	\N	\N	software
1581	OpenWrt	A Linux-based router featuring Mesh networking, IPS via snort and AQM among many other features	174	{Linux}	https://git.openwrt.org/openwrt/openwrt.git	\N	1	approved	2026-01-17 17:48:41.415065	\N	\N	GPL-2.0	\N	\N	\N	software
1583	pfSense CE	Free network firewall distribution, based on the FreeBSD operating system with a custom kernel and including third party free software packages for additional functionality	174	{Web}	https://github.com/pfsense/pfsense	\N	1	approved	2026-01-17 17:48:41.416804	\N	\N	Apache-2.0	\N	\N	\N	software
1584	Consul	Consul is a tool for service discovery, monitoring and configuration	175	{Linux,Mac,Windows}	https://github.com/hashicorp/consul	\N	1	approved	2026-01-17 17:48:41.418217	\N	\N	MPL-2.0	\N	\N	\N	software
1586	ZooKeeper	ZooKeeper is a centralized service for maintaining configuration information, naming, providing distributed synchronization, and providing group services	175	{Linux,Mac,Windows}	https://github.com/apache/zookeeper	\N	1	approved	2026-01-17 17:48:41.41966	\N	\N	Apache-2.0	\N	\N	\N	software
1587	Docker Compose	Define and run multi-container Docker applications	176	{Linux,Mac,Windows}	https://github.com/docker/compose	\N	1	approved	2026-01-17 17:48:41.420965	\N	\N	Apache-2.0	\N	\N	\N	software
1588	Docker Swarm	Manage cluster of Docker Engines	176	{Linux,Mac,Windows}	https://github.com/moby/swarmkit	\N	1	approved	2026-01-17 17:48:41.421649	\N	\N	Apache-2.0	\N	\N	\N	software
1589	LXC	Userspace interface for the Linux kernel containment features	176	{Linux}	https://github.com/lxc/lxc	\N	1	approved	2026-01-17 17:48:41.422682	\N	\N	GPL-2.0	\N	\N	\N	software
1590	LXD	Container "hypervisor" and a better UX for LXC	176	{Linux,Mac,Windows}	https://github.com/lxc/lxd	\N	1	approved	2026-01-17 17:48:41.423394	\N	\N	Apache-2.0	\N	\N	\N	software
1591	OpenVZ	Container-based virtualization for Linux	176	{Linux}	https://src.openvz.org/projects/OVZ	\N	1	approved	2026-01-17 17:48:41.424088	\N	\N	GPL-2.0	\N	\N	\N	software
1592	Portainer Community Edition	Simple management UI for Docker	176	{Linux,Mac,Windows}	https://github.com/portainer/portainer	\N	1	approved	2026-01-17 17:48:41.425082	\N	\N	Zlib	\N	\N	\N	software
1593	systemd-nspawn	Lightweight, chroot-like, environment to run an OS or command directly under systemd	176	{Linux,Mac,Windows}	https://github.com/systemd/systemd	\N	1	approved	2026-01-17 17:48:41.425764	\N	\N	GPL-2.0	\N	\N	\N	software
1594	grml	Bootable Debian Live CD with powerful CLI tools	177	{Linux}	https://github.com/grml/	\N	1	approved	2026-01-17 17:48:41.427017	\N	\N	GPL-3.0	\N	\N	\N	software
1595	mtr	Network utility that combines traceroute and ping	177	{Linux,Mac,Windows}	https://github.com/traviscross/mtr	\N	1	approved	2026-01-17 17:48:41.428069	\N	\N	GPL-2.0	\N	\N	\N	software
1596	Sysdig	Capture system state and activity from a running Linux instance, then save, filter and analyze	177	{Linux}	https://github.com/draios/sysdig	\N	1	approved	2026-01-17 17:48:41.428865	\N	\N	Apache-2.0	\N	\N	\N	software
1597	Darcs	Cross-platform version control system, like git, mercurial or svn but with a very different approach: focus on changes rather than snapshots	178	{Linux}	https://darcs.net/releases/	\N	1	approved	2026-01-17 17:48:41.43045	\N	\N	GPL-2.0	\N	\N	\N	software
1598	Mercurial	Distributed source control management tool	178	{Linux,Mac,Windows}	https://repo.mercurial-scm.org/hg/file/tip	\N	1	approved	2026-01-17 17:48:41.431736	\N	\N	GPL-2.0	\N	\N	\N	software
1599	Subversion	Client-server revision control system	178	{Linux,Mac,Windows}	https://svn.apache.org/repos/asf/subversion/trunk/	\N	1	approved	2026-01-17 17:48:41.432413	\N	\N	Apache-2.0	\N	\N	\N	software
1600	Ganeti	Cluster virtual server management software tool built on top of KVM and Xen	179	{Linux,Mac,Windows}	https://github.com/ganeti/ganeti	\N	1	approved	2026-01-17 17:48:41.433852	\N	\N	BSD-2-Clause	\N	\N	\N	software
1601	OpenNebula	Build and manage enterprise clouds for virtualized services, containerized applications and serverless computing	179	{Linux,Mac,Windows}	https://github.com/OpenNebula/one	\N	1	approved	2026-01-17 17:48:41.434919	\N	\N	Apache-2.0	\N	\N	\N	software
1602	oVirt	Manages virtual machines, storage and virtual networks	179	{Linux,Mac,Windows}	https://github.com/oVirt	\N	1	approved	2026-01-17 17:48:41.43558	\N	\N	Apache-2.0	\N	\N	\N	software
1680	Funkwhale	A free, federated and social music server	186	{Linux,Mac,Windows}	https://opencollective.com/funkwhale	\N	1	approved	2026-01-18 09:29:54.698593	\N	\N	Open Source	\N	\N	\N	software
1603	Packer	A tool for creating identical machine images for multiple platforms from a single source configuration	179	{Linux,Mac,Windows}	https://github.com/hashicorp/packer	\N	1	approved	2026-01-17 17:48:41.436282	\N	\N	MPL-2.0	\N	\N	\N	software
1604	Proxmox VE	Virtualization management solution	179	{Linux}	https://git.proxmox.com/	\N	1	approved	2026-01-17 17:48:41.437001	\N	\N	GPL-2.0	\N	\N	\N	software
1605	Vagrant	Tool for building complete development environments	179	{Linux}	https://github.com/hashicorp/vagrant	\N	1	approved	2026-01-17 17:48:41.437979	\N	\N	BUSL-1.1	\N	\N	\N	software
1606	XCP-ng	Virtualization platform based on Xen Source and Citrix® Hypervisor (formerly XenServer)	179	{Linux,Mac,Windows}	https://github.com/xcp-ng	\N	1	approved	2026-01-17 17:48:41.438996	\N	\N	GPL-2.0	\N	\N	\N	software
1607	Xen	Virtual machine monitor for 32/64 bit Intel / AMD (IA 64) and PowerPC 970 architectures	179	{Linux,Mac,Windows}	https://xenbits.xenproject.org/gitweb/?p=xen.git;a=tree;hb=HEAD	\N	1	approved	2026-01-17 17:48:41.439671	\N	\N	GPL-2.0	\N	\N	\N	software
1608	DefGuard	True enterprise WireGuard with MFA/2FA and SSO	180	{Linux,Mac,Windows}	https://github.com/DefGuard	\N	1	approved	2026-01-17 17:48:41.440838	\N	\N	Apache-2.0	\N	\N	\N	software
1609	Dockovpn	Out-of-the-box stateless dockerized OpenVPN server which starts in less than 2 seconds	180	{Linux,Mac,Windows}	https://github.com/dockovpn/dockovpn	\N	1	approved	2026-01-17 17:48:41.441467	\N	\N	GPL-2.0	\N	\N	\N	software
1610	Firezone	WireGuard based VPN Server and Firewall	180	{Linux,Mac,Windows}	https://github.com/firezone/firezone	\N	1	approved	2026-01-17 17:48:41.442124	\N	\N	Apache-2.0	\N	\N	\N	software
1611	Gluetun VPN client	VPN client in a thin Docker container for multiple VPN providers, written in Go, and using OpenVPN or Wireguard, DNS over TLS, with a few proxy servers built-in.  `MIT` `docker`	180	{Linux,Mac,Windows}	https://github.com/qdm12/gluetun	\N	1	approved	2026-01-17 17:48:41.442977	\N	\N	MIT	\N	\N	\N	software
1612	Headscale	Self-hostable fork of [Tailscale](https://tailscale.com), cross-platform clients, simple to use, built-in (currently experimental) monitoring tools. `BSD-3-Clause` `Go`	180	{Linux,Mac,Windows}	https://github.com/juanfont/headscale	\N	1	approved	2026-01-17 17:48:41.443665	\N	\N	BSD-3-Clause	\N	\N	\N	software
1613	Nebula	A scalable p2p VPN with a focus on performance, simplicity and security. `MIT` `Go`	180	{Linux,Mac,Windows}	https://github.com/slackhq/nebula	\N	1	approved	2026-01-17 17:48:41.44435	\N	\N	MIT	\N	\N	\N	software
1614	ocserv	Cisco AnyConnect-compatible VPN server	180	{Linux,Mac,Windows}	https://gitlab.com/ocserv/ocserv	\N	1	approved	2026-01-17 17:48:41.44506	\N	\N	GPL-2.0	\N	\N	\N	software
1615	SoftEther	Multi-protocol software VPN with advanced features	180	{Linux,Mac,Windows}	https://github.com/SoftEtherVPN/SoftEtherVPN/	\N	1	approved	2026-01-17 17:48:41.446326	\N	\N	Apache-2.0	\N	\N	\N	software
1616	sshuttle	Poor man's VPN. `LGPL-2.1` `Python`	180	{Linux,Mac,Windows}	https://github.com/sshuttle/sshuttle	\N	1	approved	2026-01-17 17:48:41.447015	\N	\N	LGPL-2.1	\N	\N	\N	software
1617	strongSwan	Complete IPsec implementation for Linux	180	{Linux}	https://github.com/strongswan/strongswan	\N	1	approved	2026-01-17 17:48:41.447643	\N	\N	GPL-2.0	\N	\N	\N	software
1618	ArsTechnica OpenForum	IT Forum which is attached to a large news site	181	{Linux}	https://arstechnica.com/civis/	\N	1	approved	2026-01-17 17:48:41.449157	\N	\N	Unknown	\N	\N	\N	software
1619	Reddit	Really, really large bulletin board system	181	{Linux}	https://www.reddit.com	\N	1	approved	2026-01-17 17:48:41.449777	\N	\N	Unknown	\N	\N	\N	software
1620	/r/Linux	News and information about Linux	181	{Linux}	https://www.reddit.com/r/linux	\N	1	approved	2026-01-17 17:48:41.450367	\N	\N	Unknown	\N	\N	\N	software
1621	Spiceworks Community	General enterprise IT news and small articles	181	{Linux}	https://community.spiceworks.com/start	\N	1	approved	2026-01-17 17:48:41.451028	\N	\N	Unknown	\N	\N	\N	software
1622	StackExchange Network	Q&A communities	181	{Linux}	https://stackexchange.com/sites#technology	\N	1	approved	2026-01-17 17:48:41.451578	\N	\N	Unknown	\N	\N	\N	software
1623	Server Fault	StackExchange community for system and network administrators	181	{Linux}	https://serverfault.com/	\N	1	approved	2026-01-17 17:48:41.452186	\N	\N	Unknown	\N	\N	\N	software
1624	AlternativeTo	Find alternatives to software you know and discover new software	181	{Linux}	https://alternativeto.net	\N	1	approved	2026-01-17 17:48:41.452804	\N	\N	Unknown	\N	\N	\N	software
1625	deb.sury.org	Repository with LAMP updated packages for Debian and Ubuntu	181	{Linux}	https://deb.sury.org/	\N	1	approved	2026-01-17 17:48:41.453436	\N	\N	Unknown	\N	\N	\N	software
1626	ElRepo	Community Repo for Enterprise Linux (RHEL, CentOS, etc)	181	{Linux}	https://elrepo.org/tiki/tiki-index.php	\N	1	approved	2026-01-17 17:48:41.454093	\N	\N	Unknown	\N	\N	\N	software
1627	EPEL	Repository for RHEL and compatibles (CentOS, Scientific Linux)	181	{Linux}	https://fedoraproject.org/wiki/EPEL	\N	1	approved	2026-01-17 17:48:41.454702	\N	\N	Unknown	\N	\N	\N	software
1628	IUS	Community project that provides RPM packages for newer versions of select software for Enterprise Linux distributions	181	{Linux}	https://ius.io/	\N	1	approved	2026-01-17 17:48:41.455325	\N	\N	Unknown	\N	\N	\N	software
1629	Remi	Repository with LAMP updated packages for RHEL/Centos/Fedora	181	{Linux}	http://rpms.famillecollet.com/	\N	1	approved	2026-01-17 17:48:41.455933	\N	\N	Unknown	\N	\N	\N	software
1630	Software Collections	Community Release of [Red Hat Software Collections](https://access.redhat.com/documentation/en/red-hat-software-collections/). Provides updated packages of Ruby, Python, etc. for CentOS/Scientific Linux 6.x	181	{Linux}	https://www.softwarecollections.org	\N	1	approved	2026-01-17 17:48:41.456605	\N	\N	Unknown	\N	\N	\N	software
1631	Cloud Native Software Landscape	Compilation of software and tools for cloud computing	181	{Linux}	https://landscape.cncf.io/?group=projects-and-products&view-mode=card	\N	1	approved	2026-01-17 17:48:41.457226	\N	\N	Unknown	\N	\N	\N	software
1632	ArchWiki	Arch Linux Wiki which has really nice written articles valid for other distros	181	{Linux}	https://wiki.archlinux.org/	\N	1	approved	2026-01-17 17:48:41.458242	\N	\N	Unknown	\N	\N	\N	software
1633	Gentoo Wiki	Gentoo Linux Wiki with a lot in-detail description of Linux components	181	{Linux}	https://wiki.gentoo.org/	\N	1	approved	2026-01-17 17:48:41.45888	\N	\N	Unknown	\N	\N	\N	software
1634	Awesome SysAdmin @ LibHunt	Your go-to SysAdmin Toolbox. Based on the list here	181	{Linux}	https://sysadmin.libhunt.com	\N	1	approved	2026-01-17 17:48:41.459512	\N	\N	Unknown	\N	\N	\N	software
1635	Ops School	Comprehensive program that will help you learn to be an operations engineer	181	{Linux}	https://www.opsschool.org	\N	1	approved	2026-01-17 17:48:41.460244	\N	\N	Unknown	\N	\N	\N	software
1636	Digital Ocean Tutorials	6,000+ tutorials for getting the basics of certain applications/tools/systems administration topics	181	{Linux}	https://www.digitalocean.com/community/tutorials	\N	1	approved	2026-01-17 17:48:41.460879	\N	\N	Unknown	\N	\N	\N	software
1642	F-Droid	An installable catalogue of FOSS applications for the Android platform	185	{Linux,Mac,Windows}	https://opencollective.com/f-droid	\N	1	approved	2026-01-18 09:29:54.652962	\N	\N	Open Source	\N	\N	\N	software
1643	HaxeFlixel	Cross-platform 2D game engine	185	{Linux,Mac,Windows}	https://www.patreon.com/haxeflixel	\N	1	approved	2026-01-18 09:29:54.65661	\N	\N	Open Source	\N	\N	\N	software
1644	Homebrew	Package manager for macOS	185	{Linux,Mac,Windows}	https://www.patreon.com/homebrew	\N	1	approved	2026-01-18 09:29:54.657644	\N	\N	Open Source	\N	\N	\N	software
1645	iTerm2	macOS terminal replacement	185	{Linux,Mac,Windows}	https://www.patreon.com/gnachman	\N	1	approved	2026-01-18 09:29:54.658448	\N	\N	Open Source	\N	\N	\N	software
1646	JHipster	Open Source application platform for creating Spring Boot + Angular/React/Vue projects in seconds	185	{Linux,Mac,Windows}	https://opencollective.com/generator-jhipster	\N	1	approved	2026-01-18 09:29:54.65999	\N	\N	Open Source	\N	\N	\N	software
1647	Kismet	Kismet wireless tool	185	{Linux,Mac,Windows}	https://www.patreon.com/kismetwireless	\N	1	approved	2026-01-18 09:29:54.660835	\N	\N	Open Source	\N	\N	\N	software
1648	Laigter	Automatic normal/specular/occlussion/parallax map generator for 2D game sprites	185	{Linux,Mac,Windows}	https://www.patreon.com/azagaya	\N	1	approved	2026-01-18 09:29:54.661862	\N	\N	Open Source	\N	\N	\N	software
1649	LogSeq	Knowledge management	185	{Linux,Mac,Windows}	https://opencollective.com/logseq	\N	1	approved	2026-01-18 09:29:54.663146	\N	\N	Open Source	\N	\N	\N	software
1650	Memcode	Platform for flashcards	185	{Linux,Mac,Windows}	https://www.patreon.com/memcode	\N	1	approved	2026-01-18 09:29:54.66396	\N	\N	Open Source	\N	\N	\N	software
1651	NativeScript-Vue	Native mobile applications with NativeScript and Vue	185	{Linux,Mac,Windows}	https://www.patreon.com/rigor789	\N	1	approved	2026-01-18 09:29:54.665171	\N	\N	Open Source	\N	\N	\N	software
1652	Open Broadcaster Software	Video recording and live streaming software	185	{Linux,Mac,Windows}	https://www.patreon.com/obsproject	\N	1	approved	2026-01-18 09:29:54.667557	\N	\N	Open Source	\N	\N	\N	software
1653	Open Chemistry	Umbrella of multiple open source chemistry projects including Avogadro, cclib, DeepChem, MSDK, Open Babel, RDKit, and 3DMol.js	185	{Linux,Mac,Windows}	https://opencollective.com/open-chemistry	\N	1	approved	2026-01-18 09:29:54.669877	\N	\N	Open Source	\N	\N	\N	software
1654	Open Source BIM Collective	Tools for building information modeling	185	{Linux,Mac,Windows}	https://opencollective.com/opensourcebim	\N	1	approved	2026-01-18 09:29:54.671142	\N	\N	Open Source	\N	\N	\N	software
1655	openage	Real time strategy game engine	185	{Linux,Mac,Windows}	https://liberapay.com/SFTtech/	\N	1	approved	2026-01-18 09:29:54.671912	\N	\N	Open Source	\N	\N	\N	software
1656	OpenFAAS	Serverless platform	185	{Linux,Mac,Windows}	https://github.com/users/alexellis/sponsorship	\N	1	approved	2026-01-18 09:29:54.672755	\N	\N	Open Source	\N	\N	\N	software
1657	OptiKey	Full computer control and speech with your eyes	185	{Linux,Mac,Windows}	https://www.patreon.com/OptiKey	\N	1	approved	2026-01-18 09:29:54.674099	\N	\N	Open Source	\N	\N	\N	software
1658	Paperwork	Personal document manager	185	{Linux,Mac,Windows}	https://www.patreon.com/openpaper	\N	1	approved	2026-01-18 09:29:54.675369	\N	\N	Open Source	\N	\N	\N	software
1659	PHPStan	PHP static analyzer	185	{Linux,Mac,Windows}	https://github.com/phpstan	\N	1	approved	2026-01-18 09:29:54.676656	\N	\N	Open Source	\N	\N	\N	software
1660	PHPUnit	PHPUnit and related projects	185	{Linux,Mac,Windows}	https://github.com/sponsors/sebastianbergmann	\N	1	approved	2026-01-18 09:29:54.677934	\N	\N	Open Source	\N	\N	\N	software
1661	PlantUML	UML diagram creation software	185	{Linux,Mac,Windows}	https://www.patreon.com/plantuml	\N	1	approved	2026-01-18 09:29:54.679098	\N	\N	Open Source	\N	\N	\N	software
1662	Project Lombok	Java editor plugin	185	{Linux,Mac,Windows}	https://www.patreon.com/lombok	\N	1	approved	2026-01-18 09:29:54.679891	\N	\N	Open Source	\N	\N	\N	software
1663	ShareX Team	Screen capture and screen sharing tool	185	{Linux,Mac,Windows}	https://www.patreon.com/ShareX	\N	1	approved	2026-01-18 09:29:54.68117	\N	\N	Open Source	\N	\N	\N	software
1664	Sonic Pi	Code-based music creation and performance tool	185	{Linux,Mac,Windows}	https://www.patreon.com/samaaron	\N	1	approved	2026-01-18 09:29:54.681983	\N	\N	Open Source	\N	\N	\N	software
1665	SysV init	System V init implementation	185	{Linux,Mac,Windows}	https://www.patreon.com/sysvinit	\N	1	approved	2026-01-18 09:29:54.682736	\N	\N	Open Source	\N	\N	\N	software
1666	Termux	Android terminal emulator	185	{Linux,Mac,Windows}	https://termux.dev/en/donate	\N	1	approved	2026-01-18 09:29:54.683568	\N	\N	Open Source	\N	\N	\N	software
1667	Thirty Bees	Ecommerce software	185	{Linux,Mac,Windows}	https://forum.thirtybees.com/support-thirty-bees/	\N	1	approved	2026-01-18 09:29:54.684318	\N	\N	Open Source	\N	\N	\N	software
1668	Tiled	A 2D game level editor	185	{Linux,Mac,Windows}	https://www.patreon.com/bjorn	\N	1	approved	2026-01-18 09:29:54.685111	\N	\N	Open Source	\N	\N	\N	software
1669	V Programming Language	Statically typed compiled programming language similar to Go, influenced by Oberon, Rust, Swift	185	{Linux,Mac,Windows}	https://www.patreon.com/vlang	\N	1	approved	2026-01-18 09:29:54.68662	\N	\N	Open Source	\N	\N	\N	software
1670	VideoLAN	Maker of the VLC video player	185	{Linux,Mac,Windows}	http://www.videolan.org/contribute.html#paypal	\N	1	approved	2026-01-18 09:29:54.687392	\N	\N	Open Source	\N	\N	\N	software
1671	Vim-Go	Go plugin for VIM	185	{Linux,Mac,Windows}	https://www.patreon.com/bhcleek	\N	1	approved	2026-01-18 09:29:54.688421	\N	\N	Open Source	\N	\N	\N	software
1672	Webpack	JavaScript module bundler	185	{Linux,Mac,Windows}	https://opencollective.com/webpack	\N	1	approved	2026-01-18 09:29:54.689763	\N	\N	Open Source	\N	\N	\N	software
1673	Wiki.js	Wiki platform built with Node.js	185	{Linux,Mac,Windows}	https://github.com/users/NGPixel/sponsorship	\N	1	approved	2026-01-18 09:29:54.690711	\N	\N	Open Source	\N	\N	\N	software
1674	Zig	System programming language which prioritizes robustness, optimality, and clarity	185	{Linux,Mac,Windows}	https://www.patreon.com/andrewrk	\N	1	approved	2026-01-18 09:29:54.692864	\N	\N	Open Source	\N	\N	\N	software
1675	Zrythm	A highly automated and intuitive digital audio workstation	185	{Linux,Mac,Windows}	https://liberapay.com/Zrythm	\N	1	approved	2026-01-18 09:29:54.693656	\N	\N	Open Source	\N	\N	\N	software
1676	Kitbashery	3D kitbashing solution & CC0 model library	185	{Linux,Mac,Windows}	https://github.com/sponsors/Kitbashery	\N	1	approved	2026-01-18 09:29:54.694481	\N	\N	Open Source	\N	\N	\N	software
1677	BookWyrm	Social reading and reviewing, decentralized with ActivityPub	186	{Linux,Mac,Windows}	https://www.patreon.com/bookwyrm	\N	1	approved	2026-01-18 09:29:54.696011	\N	\N	Open Source	\N	\N	\N	software
1682	MissKey	Federated microblogging platform	186	{Linux,Mac,Windows}	https://www.patreon.com/syuilo	\N	1	approved	2026-01-18 09:29:54.701903	\N	\N	Open Source	\N	\N	\N	software
1683	Nitter	Free and open source Twitter client focused on privacy	186	{Linux,Mac,Windows}	https://www.patreon.com/nitter	\N	1	approved	2026-01-18 09:29:54.702781	\N	\N	Open Source	\N	\N	\N	software
1684	PixelFed	Federated image sharing powered by the ActivityPub protocol	186	{Linux,Mac,Windows}	https://www.patreon.com/dansup	\N	1	approved	2026-01-18 09:29:54.703616	\N	\N	Open Source	\N	\N	\N	software
1685	postActiv	Microblogging platform	186	{Linux,Mac,Windows}	https://www.patreon.com/postActiv	\N	1	approved	2026-01-18 09:29:54.704715	\N	\N	Open Source	\N	\N	\N	software
1686	Reddit Enhancement Suite	Reddit browser extension	186	{Linux,Mac,Windows}	https://www.patreon.com/honestbleeps	\N	1	approved	2026-01-18 09:29:54.705501	\N	\N	Open Source	\N	\N	\N	software
1687	Retrospring	A social network following the Q/A (question and answer) principle	186	{Linux,Mac,Windows}	https://patreon.com/retrospring	\N	1	approved	2026-01-18 09:29:54.706295	\N	\N	Open Source	\N	\N	\N	software
1688	Secure Scuttlebutt	A distributed and secure peer-to-peer protocol and social network	186	{Linux,Mac,Windows}	https://opencollective.com/secure-scuttlebutt-consortium	\N	1	approved	2026-01-18 09:29:54.70708	\N	\N	Open Source	\N	\N	\N	software
1689	ApexCharts	JavaScript charts library	187	{Linux,Mac,Windows}	https://opencollective.com/apexchartsjs	\N	1	approved	2026-01-18 09:29:54.708914	\N	\N	Open Source	\N	\N	\N	software
1690	Asset-Importer-Lib	Loads 40+ 3D file formats into one unified and clean data structure for game-developers	187	{Linux,Mac,Windows}	https://www.patreon.com/assimp	\N	1	approved	2026-01-18 09:29:54.709661	\N	\N	Open Source	\N	\N	\N	software
1691	Babel	JavaScript compiler	187	{Linux,Mac,Windows}	https://www.patreon.com/henryzhu	\N	1	approved	2026-01-18 09:29:54.710393	\N	\N	Open Source	\N	\N	\N	software
1692	Dear ImGui	Immediate Mode Graphical User interface for C++	187	{Linux,Mac,Windows}	https://github.com/ocornut/imgui/wiki/Sponsors	\N	1	approved	2026-01-18 09:29:54.711239	\N	\N	Open Source	\N	\N	\N	software
1694	HaxeUI	User interface toolkit	187	{Linux,Mac,Windows}	https://www.patreon.com/haxeui	\N	1	approved	2026-01-18 09:29:54.712988	\N	\N	Open Source	\N	\N	\N	software
1695	Iced	A cross-platform GUI library for Rust, inspired by Elm	187	{Linux,Mac,Windows}	https://github.com/sponsors/hecrj	\N	1	approved	2026-01-18 09:29:54.713892	\N	\N	Open Source	\N	\N	\N	software
1696	Laravel	PHP framework	187	{Linux,Mac,Windows}	https://www.patreon.com/taylorotwell	\N	1	approved	2026-01-18 09:29:54.714575	\N	\N	Open Source	\N	\N	\N	software
1697	LibGDX	Game development framework	187	{Linux,Mac,Windows}	https://www.patreon.com/libgdx	\N	1	approved	2026-01-18 09:29:54.715268	\N	\N	Open Source	\N	\N	\N	software
1698	MicroG	A free-as-in-freedom re-implementation of Google's proprietary Android user space apps and libraries	187	{Linux,Mac,Windows}	https://github.com/sponsors/mar-v-in	\N	1	approved	2026-01-18 09:29:54.716024	\N	\N	Open Source	\N	\N	\N	software
1699	Moleculer	Progressive microservices framework for Node.js	187	{Linux,Mac,Windows}	https://www.patreon.com/moleculer	\N	1	approved	2026-01-18 09:29:54.716837	\N	\N	Open Source	\N	\N	\N	software
1700	Musl libc	The Musl libc project	187	{Linux,Mac,Windows}	https://www.patreon.com/musl	\N	1	approved	2026-01-18 09:29:54.717615	\N	\N	Open Source	\N	\N	\N	software
1701	OpenFL	Cross-platform application framework	187	{Linux,Mac,Windows}	https://www.patreon.com/openfl	\N	1	approved	2026-01-18 09:29:54.718519	\N	\N	Open Source	\N	\N	\N	software
1702	Phalcon	Web framework delivered as a C extension for PHP	187	{Web}	https://opencollective.com/phalcon	\N	1	approved	2026-01-18 09:29:54.719713	\N	\N	Open Source	\N	\N	\N	software
1703	stdlib	Standard library for JavaScript and Node.js with an emphasis on scientific computing	187	{Linux,Mac,Windows}	https://www.patreon.com/athan	\N	1	approved	2026-01-18 09:29:54.720891	\N	\N	Open Source	\N	\N	\N	software
1704	Tabulator	JavaScript library for building interactive tables	187	{Linux,Mac,Windows}	https://www.patreon.com/olifolkerd	\N	1	approved	2026-01-18 09:29:54.722159	\N	\N	Open Source	\N	\N	\N	software
1705	Vapor	Server-side Swift framework	187	{Linux,Mac,Windows}	https://github.com/tanner0101	\N	1	approved	2026-01-18 09:29:54.723327	\N	\N	Open Source	\N	\N	\N	software
1706	Yii framework	PHP framework	187	{Linux,Mac,Windows}	https://www.patreon.com/samdark	\N	1	approved	2026-01-18 09:29:54.726069	\N	\N	Open Source	\N	\N	\N	software
1707	Zappa	A server-less Python framework	187	{Linux,Mac,Windows}	https://www.patreon.com/zappa	\N	1	approved	2026-01-18 09:29:54.727274	\N	\N	Open Source	\N	\N	\N	software
1693	Hapi.js	Node.js framework	187	{Linux,Mac,Windows}	https://opencollective.com/hapijs	\N	1	approved	2026-01-18 09:29:54.712256	\N	\N	Open Source	\N	\N	\N	api
1709	Elementary OS	Ubuntu variant	194	{Linux,Mac,Windows}	https://www.patreon.com/elementary	\N	1	approved	2026-01-18 09:32:25.311438	\N	\N	Open Source	\N	\N	\N	software
1710	FreeDOS	MS-DOS compatible operating system	194	{Linux,Mac,Windows}	https://www.patreon.com/freedos	\N	1	approved	2026-01-18 09:32:25.312665	\N	\N	Open Source	\N	\N	\N	software
1711	GhostBSD	Desktop-focused BSD OS	194	{Linux,Mac,Windows}	https://www.patreon.com/GhostBSD	\N	1	approved	2026-01-18 09:32:25.313511	\N	\N	Open Source	\N	\N	\N	software
1712	GrapheneOS	A privacy and security focused mobile OS with Android app compatibility	194	{Linux,Mac,Windows}	https://github.com/sponsors/thestinger	\N	1	approved	2026-01-18 09:32:25.31438	\N	\N	Open Source	\N	\N	\N	software
1713	Linux Lite	Linux distribution	194	{Linux,Mac,Windows}	https://www.patreon.com/linuxlite	\N	1	approved	2026-01-18 09:32:25.315524	\N	\N	Open Source	\N	\N	\N	software
1714	Mobian	Debian for mobile	194	{Linux,Mac,Windows}	https://liberapay.com/mobian/	\N	1	approved	2026-01-18 09:32:25.316733	\N	\N	Open Source	\N	\N	\N	software
1715	Parrot	Security-related Debian distribution	194	{Linux,Mac,Windows}	https://www.patreon.com/parrot	\N	1	approved	2026-01-18 09:32:25.317504	\N	\N	Open Source	\N	\N	\N	software
1716	PostmarketOS	A real Linux distribution for phones	194	{Linux,Mac,Windows}	https://opencollective.com/postmarketos	\N	1	approved	2026-01-18 09:32:25.318385	\N	\N	Open Source	\N	\N	\N	software
1717	Qubes OS	A reasonably secure operating system	194	{Linux,Mac,Windows}	https://opencollective.com/qubes-os	\N	1	approved	2026-01-18 09:32:25.319224	\N	\N	Open Source	\N	\N	\N	software
1718	ReactOS	A free Windows-compatible Operating System	194	{Linux,Mac,Windows}	https://liberapay.com/ReactOS/	\N	1	approved	2026-01-18 09:32:25.32017	\N	\N	Open Source	\N	\N	\N	software
1719	Redox OS	OS written in Rust	194	{Linux,Mac,Windows}	https://www.patreon.com/redox_os	\N	1	approved	2026-01-18 09:32:25.32096	\N	\N	Open Source	\N	\N	\N	software
1720	Serenity OS	A graphical Unix-like OS for x86, with 90s aesthetics	194	{Linux,Mac,Windows}	https://github.com/sponsors/awesomekling	\N	1	approved	2026-01-18 09:32:25.321725	\N	\N	Open Source	\N	\N	\N	software
1721	Slackware Linux	Linux distribution	194	{Linux,Mac,Windows}	https://www.patreon.com/slackwarelinux	\N	1	approved	2026-01-18 09:32:25.322505	\N	\N	Open Source	\N	\N	\N	software
1722	Solus	Linux distibution	194	{Linux,Mac,Windows}	https://opencollective.com/getsolus	\N	1	approved	2026-01-18 09:32:25.323252	\N	\N	Open Source	\N	\N	\N	software
1723	Ubuntu Mate	Ubuntu variant	194	{Linux,Mac,Windows}	https://www.patreon.com/ubuntu_mate	\N	1	approved	2026-01-18 09:32:25.323992	\N	\N	Open Source	\N	\N	\N	software
1724	Ubuntu Studio	Ubuntu variant for creating audio, video, graphics etc	194	{Linux,Mac,Windows}	https://www.patreon.com/ubuntustudio	\N	1	approved	2026-01-18 09:32:25.324739	\N	\N	Open Source	\N	\N	\N	software
1725	Ubuntu Touch	Touch-friendly mobile version of Ubuntu	194	{Linux,Mac,Windows}	https://www.patreon.com/ubports	\N	1	approved	2026-01-18 09:32:25.325473	\N	\N	Open Source	\N	\N	\N	software
1739	Alexandre Prokoudine	GIMP contributor, editor of Libre Graphics World online magazine	196	{Web}	https://www.patreon.com/prokoudine	\N	1	approved	2026-01-18 09:32:25.346201	\N	\N	Open Source	\N	\N	\N	software
1740	Andrea Ferrero	Developer of PhotoFlow image editor, maintains various Appimage packages	196	{Linux,Mac,Windows}	https://www.patreon.com/andreaferrero	\N	1	approved	2026-01-18 09:32:25.346922	\N	\N	Open Source	\N	\N	\N	software
1741	Duduf	Tools for animations and motion pictures production	196	{Linux,Mac,Windows}	https://www.patreon.com/duduf	\N	1	approved	2026-01-18 09:32:25.347661	\N	\N	Open Source	\N	\N	\N	software
1742	Inochi2D	Opensource editor and libraries for realtime 2D puppet animation and rendering, e.g. VTubers	196	{Linux,Mac,Windows}	https://www.patreon.com/clipsey	\N	1	approved	2026-01-18 09:32:25.348691	\N	\N	Open Source	\N	\N	\N	software
1743	Marc Jeanmougin	Inkscape contributor	196	{Linux,Mac,Windows}	https://www.patreon.com/marcjeanmougin	\N	1	approved	2026-01-18 09:32:25.349551	\N	\N	Open Source	\N	\N	\N	software
1744	Morevna Project	Various contributions to open source animation tools and animated shorts sources released under CC	196	{Linux,Mac,Windows}	https://www.patreon.com/morevna	\N	1	approved	2026-01-18 09:32:25.350268	\N	\N	Open Source	\N	\N	\N	software
1745	MyPaint	Painting and drawing program that works nicely with pressure-sensitive tablets, and its dynamic brush engine library	196	{Linux,Mac,Windows}	https://opencollective.com/mypaint	\N	1	approved	2026-01-18 09:32:25.351025	\N	\N	Open Source	\N	\N	\N	software
1727	Citybound	City building game	273	{Linux,Mac,Windows}	https://www.patreon.com/citybound	\N	1	approved	2026-01-18 09:32:25.328689	\N	\N	Open Source	\N	\N	\N	software
1728	Cxbx-reloaded	Xbox emulator for Windows	273	{Linux,Mac,Windows}	https://www.patreon.com/LukeUsher	\N	1	approved	2026-01-18 09:32:25.329775	\N	\N	Open Source	\N	\N	\N	software
1729	Eigengrau's Generator	TTRPG/Dungeons and Dragons Town and NPC Generator	273	{Linux,Mac,Windows}	https://www.patreon.com/EigengrausGenerator	\N	1	approved	2026-01-18 09:32:25.330862	\N	\N	Open Source	\N	\N	\N	software
1730	Fheroes2	Free Heroes of Might and Magic II engine	273	{Linux,Mac,Windows}	https://www.patreon.com/fheroes2	\N	1	approved	2026-01-18 09:32:25.331984	\N	\N	Open Source	\N	\N	\N	software
1731	Improved Initiative	D&D tabletop role-playing game combat tracker	273	{Linux,Mac,Windows}	https://www.patreon.com/improvedinitiative	\N	1	approved	2026-01-18 09:32:25.333913	\N	\N	Open Source	\N	\N	\N	software
1732	Libretro Team	Libretro, RetroArch and Lakka	273	{Linux,Mac,Windows}	https://www.patreon.com/libretro	\N	1	approved	2026-01-18 09:32:25.335409	\N	\N	Open Source	\N	\N	\N	software
1733	MelonDS	Nintendo DS emulator	273	{Linux,Mac,Windows}	https://www.patreon.com/m/Arisotura	\N	1	approved	2026-01-18 09:32:25.338555	\N	\N	Open Source	\N	\N	\N	software
1734	Rpcs3	PS3 emulator	273	{Linux,Mac,Windows}	https://www.patreon.com/Nekotekina	\N	1	approved	2026-01-18 09:32:25.340416	\N	\N	Open Source	\N	\N	\N	software
1735	Ryujinx	Nintendo Switch emulator	273	{Linux,Mac,Windows}	https://www.patreon.com/ryujinx	\N	1	approved	2026-01-18 09:32:25.341268	\N	\N	Open Source	\N	\N	\N	software
1736	Xemu	Xbox emulator	273	{Linux,Mac,Windows}	https://www.patreon.com/mborgerson	\N	1	approved	2026-01-18 09:32:25.342556	\N	\N	Open Source	\N	\N	\N	software
1737	Xenia	Xbox 360 emulator	273	{Linux,Mac,Windows}	https://www.patreon.com/xenia_project	\N	1	approved	2026-01-18 09:32:25.343355	\N	\N	Open Source	\N	\N	\N	software
1738	yuzu	Nintendo Switch emulator	273	{Linux,Mac,Windows}	https://www.patreon.com/yuzuteam	\N	1	approved	2026-01-18 09:32:25.344789	\N	\N	Open Source	\N	\N	\N	software
1746	Øyvind Kolås	Lead developer of babl & GEGL libraries used in the graphics editor GIMP	196	{Linux,Mac,Windows}	https://www.patreon.com/pippin	\N	1	approved	2026-01-18 09:32:25.352938	\N	\N	Open Source	\N	\N	\N	software
1747	Pablo Dobarro	Sculpting improvements for Blender	196	{Linux,Mac,Windows}	https://www.patreon.com/pablodp606	\N	1	approved	2026-01-18 09:32:25.353821	\N	\N	Open Source	\N	\N	\N	software
1748	Synfig	2D animation software	196	{Linux,Mac,Windows}	https://www.patreon.com/synfig	\N	1	approved	2026-01-18 09:32:25.354691	\N	\N	Open Source	\N	\N	\N	software
1749	Tavmjong Bah	Working on Inkscape vector graphics editor	196	{Linux,Mac,Windows}	https://www.patreon.com/tavmjong	\N	1	approved	2026-01-18 09:32:25.355459	\N	\N	Open Source	\N	\N	\N	software
1750	ZeMarmot	2D animation film project to be released under CC. GIMP contributions from Jehan Pagès, art and direction by Aryeom Han	196	{Linux,Mac,Windows}	https://www.patreon.com/zemarmot	\N	1	approved	2026-01-18 09:32:25.356242	\N	\N	Open Source	\N	\N	\N	software
1751	Damien Maguire	Electric vehicle projects	197	{Linux,Mac,Windows}	https://www.patreon.com/evbmw	\N	1	approved	2026-01-18 09:32:25.357532	\N	\N	Open Source	\N	\N	\N	software
1752	DIGImend	Improving Linux support for (non-Wacom) graphics tablets	197	{Linux,Mac,Windows}	https://www.patreon.com/spbnick	\N	1	approved	2026-01-18 09:32:25.358219	\N	\N	Open Source	\N	\N	\N	software
1753	Espruino	JavaScript interpreter for microcontrollers	197	{Linux,Mac,Windows}	https://www.patreon.com/espruino	\N	1	approved	2026-01-18 09:32:25.358953	\N	\N	Open Source	\N	\N	\N	software
1754	Frank Buss	FPGA and other hardware projects	197	{Linux,Mac,Windows}	https://www.patreon.com/frankbuss	\N	1	approved	2026-01-18 09:32:25.359659	\N	\N	Open Source	\N	\N	\N	software
1755	GitClear	Improved Linux support for touchpads	197	{Linux,Mac,Windows}	https://github.com/sponsors/gitclear	\N	1	approved	2026-01-18 09:32:25.360559	\N	\N	Open Source	\N	\N	\N	software
1756	Geoffrey D. Bennett	Linux Focusrite Scarlett software	197	{Linux,Mac,Windows}	https://liberapay.com/gdb	\N	1	approved	2026-01-18 09:32:25.361259	\N	\N	Open Source	\N	\N	\N	software
1757	Hector Martin "marcan"	Asahi, Linux support for Apple Silicon Macs	197	{Linux,Mac,Windows}	https://www.patreon.com/marcan	\N	1	approved	2026-01-18 09:32:25.361965	\N	\N	Open Source	\N	\N	\N	software
1758	LibrePCB	Software to develop printed circuit boards	197	{Linux,Mac,Windows}	https://www.patreon.com/librepcb	\N	1	approved	2026-01-18 09:32:25.362708	\N	\N	Open Source	\N	\N	\N	software
1759	Martin Povišer	Reverse-engineering and writing Linux drivers for audio hardware on Apple Silicon Macs	197	{Linux,Mac,Windows}	https://github.com/sponsors/povik	\N	1	approved	2026-01-18 09:32:25.363422	\N	\N	Open Source	\N	\N	\N	software
1760	Nefarius Software Solutions	Windows drivers for the Sony DualShock controller and others	197	{Linux,Mac,Windows}	https://www.patreon.com/nefarius	\N	1	approved	2026-01-18 09:32:25.364113	\N	\N	Open Source	\N	\N	\N	software
1761	OctoPrint	Web interface for 3D printers	197	{Web}	https://www.patreon.com/foosel	\N	1	approved	2026-01-18 09:32:25.364811	\N	\N	Open Source	\N	\N	\N	software
1762	Pinout.xyz	Pinout diagrams for various microcontrollers	197	{Linux,Mac,Windows}	https://www.patreon.com/gadgetoid	\N	1	approved	2026-01-18 09:32:25.365794	\N	\N	Open Source	\N	\N	\N	software
1763	Professor Abrasive	Retro gaming	197	{Linux,Mac,Windows}	https://www.patreon.com/prof_abrasive	\N	1	approved	2026-01-18 09:32:25.366451	\N	\N	Open Source	\N	\N	\N	software
1764	Adam King	RLTrader, Tensortrade and other trading related projects	198	{Linux,Mac,Windows}	https://github.com/sponsors/notadamking	\N	1	approved	2026-01-18 09:32:25.36772	\N	\N	Open Source	\N	\N	\N	software
1765	Andreas Heinisch	LibreOffice developer	198	{Linux,Mac,Windows}	https://www.patreon.com/user?u=51471923	\N	1	approved	2026-01-18 09:32:25.368472	\N	\N	Open Source	\N	\N	\N	software
1766	Andreas Kainz	LibreOffice designer	198	{Linux,Mac,Windows}	https://www.patreon.com/user?u=10071325	\N	1	approved	2026-01-18 09:32:25.369166	\N	\N	Open Source	\N	\N	\N	software
1767	Andreas Pardeike	Programming tutorials, games and mods	198	{Linux,Mac,Windows}	https://www.patreon.com/pardeike	\N	1	approved	2026-01-18 09:32:25.369895	\N	\N	Open Source	\N	\N	\N	software
1768	Andrius Štikonas	KDE contributor, mainly KDE Partition Manager	198	{Linux,Mac,Windows}	https://liberapay.com/stikonas	\N	1	approved	2026-01-18 09:32:25.370846	\N	\N	Open Source	\N	\N	\N	software
1769	Attogram Project	Shared Media Tagger, Open Translation Engine, and many more projects	198	{Linux,Mac,Windows}	https://github.com/sponsors/attogram	\N	1	approved	2026-01-18 09:32:25.371621	\N	\N	Open Source	\N	\N	\N	software
1770	Bailey Burnsed	FOSS Nerd developing open source games in Godot and Rust	198	{Linux,Mac,Windows}	https://www.patreon.com/BaileyBurnsed	\N	1	approved	2026-01-18 09:32:25.372719	\N	\N	Open Source	\N	\N	\N	software
1771	Daniel Gultsch	Conversations Jabber client	198	{Linux,Mac,Windows}	https://github.com/users/iNPUTmice/sponsorship	\N	1	approved	2026-01-18 09:32:25.37338	\N	\N	Open Source	\N	\N	\N	software
1772	Daniël Klabbers	Contributor to Flarum and other PHP projects	198	{Linux,Mac,Windows}	https://www.patreon.com/luceos	\N	1	approved	2026-01-18 09:32:25.374056	\N	\N	Open Source	\N	\N	\N	software
1773	Dave Täht	Working on improving the Internet	198	{Linux,Mac,Windows}	https://www.patreon.com/dtaht	\N	1	approved	2026-01-18 09:32:25.374741	\N	\N	Open Source	\N	\N	\N	software
1774	David Hewitt	ElementaryOS contributor, Torrential, Clipped	198	{Linux,Mac,Windows}	https://github.com/users/davidmhewitt/sponsorship	\N	1	approved	2026-01-18 09:32:25.375404	\N	\N	Open Source	\N	\N	\N	software
1775	Dimitri Fontaine	Various contributions to the PostgreSQL ecosystem (pgloader, pg_auto_failover), Emacs libraries (el-get), author	198	{Linux,Mac,Windows}	https://github.com/sponsors/dimitri	\N	1	approved	2026-01-18 09:32:25.376151	\N	\N	Open Source	\N	\N	\N	software
1776	Dominik Honnef	Working on tooling for the Go programming language	198	{Linux,Mac,Windows}	https://www.patreon.com/dominikh	\N	1	approved	2026-01-18 09:32:25.376811	\N	\N	Open Source	\N	\N	\N	software
1777	Dragan Djuric	Creator of Uncomplicate, a family of Clojure libraries for AI, ML, and GPU high performance computing	198	{Linux,Mac,Windows}	https://www.patreon.com/draganrocks	\N	1	approved	2026-01-18 09:32:25.377492	\N	\N	Open Source	\N	\N	\N	software
1778	Drew DeVault	sway, wlroots, sr.ht, scdoc, aerc, and more	198	{Linux,Mac,Windows}	https://www.patreon.com/sircmpwn	\N	1	approved	2026-01-18 09:32:25.378163	\N	\N	Open Source	\N	\N	\N	software
1779	Eevee	Games, applications and articles	198	{Linux,Mac,Windows}	https://www.patreon.com/eevee	\N	1	approved	2026-01-18 09:32:25.378873	\N	\N	Open Source	\N	\N	\N	software
1780	Egoist	Various JavaScript libraries and tools	198	{Linux,Mac,Windows}	https://www.patreon.com/egoist/overview	\N	1	approved	2026-01-18 09:32:25.379533	\N	\N	Open Source	\N	\N	\N	software
1781	Erik Moqvist	Moblin, iOS app for IRL streaming and many other libraries	198	{Linux,Mac,Windows}	https://github.com/sponsors/eerimoq	\N	1	approved	2026-01-18 09:32:25.380177	\N	\N	Open Source	\N	\N	\N	software
1782	Eric S. Raymond	Nethack, GPSd, author of "The Cathedral and the Bazaar"	198	{Linux,Mac,Windows}	https://www.patreon.com/esr	\N	1	approved	2026-01-18 09:32:25.380887	\N	\N	Open Source	\N	\N	\N	software
1783	Ethan Lee	Contributions to FNA, SDL2 C# and other projects	198	{Linux,Mac,Windows}	https://github.com/users/flibitijibibo/sponsorship	\N	1	approved	2026-01-18 09:32:25.381538	\N	\N	Open Source	\N	\N	\N	software
1784	Fabio Zadrozny	Working on PyDev and related projects	198	{Linux,Mac,Windows}	https://www.patreon.com/fabioz	\N	1	approved	2026-01-18 09:32:25.382169	\N	\N	Open Source	\N	\N	\N	software
1785	Felipe Lima	Various projects and libraries like OkReplay, AirMapView, AsymmetricGridView, GifImageView, Wombat	198	{Linux,Mac,Windows}	https://github.com/sponsors/felipecsl	\N	1	approved	2026-01-18 09:32:25.382813	\N	\N	Open Source	\N	\N	\N	software
1786	Feross Aboukhadijeh	WebTorrent, StandardJS, and other JavaScript projects	198	{Web}	https://github.com/sponsors/feross	\N	1	approved	2026-01-18 09:32:25.383559	\N	\N	Open Source	\N	\N	\N	software
1787	Flammie	Apertium, linguistic tools for minority languages	198	{Linux,Mac,Windows}	https://www.patreon.com/flammie	\N	1	approved	2026-01-18 09:32:25.384458	\N	\N	Open Source	\N	\N	\N	software
1788	Franck Nijhof	Creates Home Assistant add-ons and helps out on the main project	198	{Linux,Mac,Windows}	https://www.patreon.com/frenck	\N	1	approved	2026-01-18 09:32:25.385169	\N	\N	Open Source	\N	\N	\N	software
1789	Gabriel Gonzalez	Dhall language, Nix and Haskell educational projects and Haskell libraries and tool	198	{Linux,Mac,Windows}	https://github.com/users/Gabriel439/sponsorship	\N	1	approved	2026-01-18 09:32:25.385874	\N	\N	Open Source	\N	\N	\N	software
1790	Gilbert Pellegrom	Raneto, Vue.js libraries and more	198	{Linux,Mac,Windows}	https://github.com/users/gilbitron/sponsorship	\N	1	approved	2026-01-18 09:32:25.386555	\N	\N	Open Source	\N	\N	\N	software
1791	Jacky Alcine	Projects in the IndieWeb sphere, Koype and contributions to other open source projects	198	{Web}	https://www.patreon.com/jackyalcine	\N	1	approved	2026-01-18 09:32:25.387377	\N	\N	Open Source	\N	\N	\N	software
1792	James 'Purpleidea'	mgmt config, articles and more	198	{Linux,Mac,Windows}	https://github.com/users/purpleidea/sponsorship	\N	1	approved	2026-01-18 09:32:25.388047	\N	\N	Open Source	\N	\N	\N	software
1793	JeanHeyd Meneide	Creates C++ libraries and standards proposals	198	{Linux,Mac,Windows}	https://www.patreon.com/thephd	\N	1	approved	2026-01-18 09:32:25.388686	\N	\N	Open Source	\N	\N	\N	software
1794	Joey Hess	git-annex, keysafe, other Linux software	198	{Linux,Mac,Windows}	https://www.patreon.com/joeyh	\N	1	approved	2026-01-18 09:32:25.389329	\N	\N	Open Source	\N	\N	\N	software
1795	Johann-S	Bootstrap JavaScript developer and various plugins and projects	198	{Linux,Mac,Windows}	https://github.com/sponsors/Johann-S	\N	1	approved	2026-01-18 09:32:25.390001	\N	\N	Open Source	\N	\N	\N	software
1796	Jorge Bucaran	Hyperapp and many other JavaScript projects	198	{Linux,Mac,Windows}	https://github.com/sponsors/jorgebucaran	\N	1	approved	2026-01-18 09:32:25.390673	\N	\N	Open Source	\N	\N	\N	software
1797	Jonathan Müller	Various C++ libraries, tools, articles	198	{Linux,Mac,Windows}	https://www.patreon.com/foonathan	\N	1	approved	2026-01-18 09:32:25.391326	\N	\N	Open Source	\N	\N	\N	software
1798	Kevin Cozens	Contributor to projects such as GIMP, OpenSimulator, KiCad and TinyScheme	198	{Linux,Mac,Windows}	https://www.patreon.com/KevinCozens	\N	1	approved	2026-01-18 09:32:25.392039	\N	\N	Open Source	\N	\N	\N	software
1800	Khoa Pham	A multitude of libraries, applications and articles about iOS/Cocoa,	198	{Linux,Mac,Windows}	https://github.com/users/onmyway133/sponsorship	\N	1	approved	2026-01-18 09:32:25.393369	\N	\N	Open Source	\N	\N	\N	software
1801	Kozec	Syncthing-GTK and SC-Controller	198	{Linux,Mac,Windows}	https://www.patreon.com/kozec	\N	1	approved	2026-01-18 09:32:25.394019	\N	\N	Open Source	\N	\N	\N	software
1802	Kurt Kremitzki	FreeCAD contributor and Debian packager	198	{Linux,Mac,Windows}	https://www.patreon.com/kkremitzki	\N	1	approved	2026-01-18 09:32:25.394654	\N	\N	Open Source	\N	\N	\N	software
1803	Lars Moelleken	Various PHP libraries and OSS contributions	198	{Linux,Mac,Windows}	https://github.com/sponsors/voku	\N	1	approved	2026-01-18 09:32:25.395336	\N	\N	Open Source	\N	\N	\N	software
1804	Luke Dashjr	Author of bfgminer and other substantial contributions to Bitcoin	198	{Linux,Mac,Windows}	https://github.com/sponsors/luke-jr	\N	1	approved	2026-01-18 09:32:25.39622	\N	\N	Open Source	\N	\N	\N	software
1805	Matt Lewis	Angular-calendar and other angular components	198	{Linux,Mac,Windows}	https://github.com/users/mattlewis92/sponsorship	\N	1	approved	2026-01-18 09:32:25.396886	\N	\N	Open Source	\N	\N	\N	software
1806	Matthieu Napoli	Bref, PHP-DI and other PHP libraries	198	{Linux,Mac,Windows}	https://github.com/users/mnapoli/sponsorship	\N	1	approved	2026-01-18 09:32:25.397551	\N	\N	Open Source	\N	\N	\N	software
1807	Max Bridgland	Various pentesting frameworks and tools	198	{Linux,Mac,Windows}	https://github.com/users/M4cs/sponsorship	\N	1	approved	2026-01-18 09:32:25.398197	\N	\N	Open Source	\N	\N	\N	software
1808	Max Howell	Creator of Homebrew, maintainer of PromiseKit and a multitude of other project for Apple platforms	198	{Linux,Mac,Windows}	https://www.patreon.com/mxcl	\N	1	approved	2026-01-18 09:32:25.398892	\N	\N	Open Source	\N	\N	\N	software
1809	Michal Čihař	Contributor to Weblate and phpMyAdmin	198	{Web}	https://liberapay.com/nijel/	\N	1	approved	2026-01-18 09:32:25.399557	\N	\N	Open Source	\N	\N	\N	software
1810	Nate Graham	KDE contributor	198	{Linux,Mac,Windows}	https://liberapay.com/ngraham	\N	1	approved	2026-01-18 09:32:25.400196	\N	\N	Open Source	\N	\N	\N	software
1811	Nick Sweeting	ArchiveBox and OSS contributions but also articles and documentation	198	{Linux,Mac,Windows}	https://github.com/sponsors/pirate	\N	1	approved	2026-01-18 09:32:25.400797	\N	\N	Open Source	\N	\N	\N	software
1812	Nicolas Hafner	Various Common Lisp libraries	198	{Linux,Mac,Windows}	https://github.com/users/Shinmera/sponsorship	\N	1	approved	2026-01-18 09:32:25.401521	\N	\N	Open Source	\N	\N	\N	software
1813	Nils Maier	Download Them All! Firefox and Chrome extension	198	{Linux,Mac,Windows}	https://www.patreon.com/nmaier	\N	1	approved	2026-01-18 09:32:25.402218	\N	\N	Open Source	\N	\N	\N	software
1814	Oleh Krehel	GNU Emacs plugins, maintainer of Ivy/Swiper/Counsel, Hydra, Avy, Lispy, and more	198	{Linux,Mac,Windows}	https://github.com/users/abo-abo/sponsorship	\N	1	approved	2026-01-18 09:32:25.403142	\N	\N	Open Source	\N	\N	\N	software
1815	Ondřej Surý	Debian packager	198	{Linux,Mac,Windows}	https://www.patreon.com/oerdnj	\N	1	approved	2026-01-18 09:32:25.403931	\N	\N	Open Source	\N	\N	\N	software
1816	Patrick Wardle	Owner of Objective-See, various macOS security tools and articles	198	{Linux,Mac,Windows}	https://www.patreon.com/objective_see	\N	1	approved	2026-01-18 09:32:25.404663	\N	\N	Open Source	\N	\N	\N	software
1817	Pedro Piñera	Tuist and XcodeProj libraries, articles	198	{Linux,Mac,Windows}	https://github.com/users/pepibumur/sponsorship	\N	1	approved	2026-01-18 09:32:25.405327	\N	\N	Open Source	\N	\N	\N	software
1818	Pedro Carrasco	Various iOS libraries and projects	198	{Linux,Mac,Windows}	https://github.com/sponsors/pedrommcarrasco	\N	1	approved	2026-01-18 09:32:25.406003	\N	\N	Open Source	\N	\N	\N	software
1820	Raph Levien	druid and other Rust projects	198	{Linux,Mac,Windows}	https://github.com/sponsors/raphlinus	\N	1	approved	2026-01-18 09:32:25.407257	\N	\N	Open Source	\N	\N	\N	software
1821	Reini Urban	Maintaining and developing software such as cperl, parrot, a lot of perl5 modules, safeclib and libredwg	198	{Linux,Mac,Windows}	https://www.patreon.com/rurban	\N	1	approved	2026-01-18 09:32:25.408126	\N	\N	Open Source	\N	\N	\N	software
1822	René Rebe	T2 System Development Environment	198	{Linux,Mac,Windows}	https://www.patreon.com/user?u=9504919	\N	1	approved	2026-01-18 09:32:25.408767	\N	\N	Open Source	\N	\N	\N	software
1823	Rekka Bellum & Devine Lu Linvega	Open source tools and games	198	{Linux,Mac,Windows}	https://www.patreon.com/100	\N	1	approved	2026-01-18 09:32:25.409471	\N	\N	Open Source	\N	\N	\N	software
1824	Rob Landley	Working on Toybox, mkroot and various other projects	198	{Linux,Mac,Windows}	https://www.patreon.com/landley	\N	1	approved	2026-01-18 09:32:25.410166	\N	\N	Open Source	\N	\N	\N	software
1825	Ryan C. Gordon	Linux ports of games, game-related utilities	198	{Linux,Mac,Windows}	https://www.patreon.com/icculus	\N	1	approved	2026-01-18 09:32:25.410825	\N	\N	Open Source	\N	\N	\N	software
1826	Sanjay Madan	Mowglii apps, author of Itsycal and Snk	198	{Linux,Mac,Windows}	https://paypal.me/mowgliiapps	\N	1	approved	2026-01-18 09:32:25.411502	\N	\N	Open Source	\N	\N	\N	software
1827	Scarlett Moore	KDE contributor	198	{Linux,Mac,Windows}	https://www.patreon.com/sgclark	\N	1	approved	2026-01-18 09:32:25.412191	\N	\N	Open Source	\N	\N	\N	software
1828	Scott Lahteine	Contributor to Marlin Firmware for 3D printers	198	{Linux,Mac,Windows}	https://www.patreon.com/thinkyhead	\N	1	approved	2026-01-18 09:32:25.412849	\N	\N	Open Source	\N	\N	\N	software
1829	Sindre Sorhus	Countless open source projects	198	{Linux,Mac,Windows}	https://www.patreon.com/sindresorhus	\N	1	approved	2026-01-18 09:32:25.413525	\N	\N	Open Source	\N	\N	\N	software
1830	skypjack	C++ libraries such as uvw and EnTT	198	{Linux,Mac,Windows}	https://github.com/sponsors/skypjack	\N	1	approved	2026-01-18 09:32:25.414206	\N	\N	Open Source	\N	\N	\N	software
1831	Stéphane Peter	AudioKit contributor, Makeself and other libraries and projects	198	{Linux,Mac,Windows}	https://github.com/sponsors/megastep	\N	1	approved	2026-01-18 09:32:25.414858	\N	\N	Open Source	\N	\N	\N	software
1832	Steve Purcell	MELPA lisp package archive and other software tooling	198	{Linux,Mac,Windows}	https://www.patreon.com/sanityinc	\N	1	approved	2026-01-18 09:32:25.415523	\N	\N	Open Source	\N	\N	\N	software
1833	Steven Troughton-Smith	Various iOS/macOS software	198	{Linux,Mac,Windows}	https://www.patreon.com/steventroughtonsmith	\N	1	approved	2026-01-18 09:32:25.416161	\N	\N	Open Source	\N	\N	\N	software
1834	Thomas M. Edwards	Gaming related projects	198	{Linux,Mac,Windows}	https://www.patreon.com/thomasmedwards	\N	1	approved	2026-01-18 09:32:25.416825	\N	\N	Open Source	\N	\N	\N	software
1835	Tim Oliver	Multitude of iOS libraries and various contribution to the iOS ecosystem	198	{Linux,Mac,Windows}	https://github.com/sponsors/TimOliver	\N	1	approved	2026-01-18 09:32:25.417507	\N	\N	Open Source	\N	\N	\N	software
1836	Timothée Giet	GCompris contributor	198	{Linux,Mac,Windows}	https://www.patreon.com/animtim	\N	1	approved	2026-01-18 09:32:25.418176	\N	\N	Open Source	\N	\N	\N	software
1837	Tobias Koppers	Founder and maintainer of Webpack	198	{Web}	https://github.com/users/sokra/sponsorship	\N	1	approved	2026-01-18 09:32:25.418852	\N	\N	Open Source	\N	\N	\N	software
1838	Yorik van Havre	FreeCAD contributor	198	{Linux,Mac,Windows}	https://www.patreon.com/yorikvanhavre	\N	1	approved	2026-01-18 09:32:25.420001	\N	\N	Open Source	\N	\N	\N	software
1839	Alecaddd	Various programming tutorials	199	{Linux,Mac,Windows}	https://www.patreon.com/alecaddd	\N	1	approved	2026-01-18 09:32:25.421334	\N	\N	Open Source	\N	\N	\N	software
1840	Boiling Steam	Linux gaming news, reviews, guides	199	{Linux,Mac,Windows}	https://www.patreon.com/boiling_steam_linux	\N	1	approved	2026-01-18 09:32:25.421998	\N	\N	Open Source	\N	\N	\N	software
1841	Chris Bradfield	Programming tutorials for kids	199	{Linux,Mac,Windows}	https://www.patreon.com/kidscancode	\N	1	approved	2026-01-18 09:32:25.422668	\N	\N	Open Source	\N	\N	\N	software
1842	DistroWatch	Reviews and tutorials for Linux/BSD	199	{Linux,Mac,Windows}	https://www.patreon.com/distrowatch	\N	1	approved	2026-01-18 09:32:25.423421	\N	\N	Open Source	\N	\N	\N	software
1843	Fluent C++	C++ articles	199	{Linux,Mac,Windows}	https://www.patreon.com/fluentcpp	\N	1	approved	2026-01-18 09:32:25.424061	\N	\N	Open Source	\N	\N	\N	software
1844	GamingOnLinux	articles and videos about Linux, Steam Deck, SteamOS gaming	199	{Linux,Mac,Windows}	https://www.patreon.com/liamdawe	\N	1	approved	2026-01-18 09:32:25.42474	\N	\N	Open Source	\N	\N	\N	software
1845	Kyle Simpson	Author of the "You Don't Know JS" book series. Doing articles, podcasts and OSS contributions	199	{Linux,Mac,Windows}	https://www.patreon.com/getify	\N	1	approved	2026-01-18 09:32:25.42544	\N	\N	Open Source	\N	\N	\N	software
1846	Meeting C++	C++ articles	199	{Linux,Mac,Windows}	https://www.patreon.com/meetingcpp	\N	1	approved	2026-01-18 09:32:25.42616	\N	\N	Open Source	\N	\N	\N	software
1847	Modernes C++	C++ articles	199	{Linux,Mac,Windows}	https://www.patreon.com/rainer_grimm	\N	1	approved	2026-01-18 09:32:25.426852	\N	\N	Open Source	\N	\N	\N	software
1848	Corey Schafer	Python tutorials	200	{Linux,Mac,Windows}	https://www.patreon.com/coreyms	\N	1	approved	2026-01-18 09:32:25.428106	\N	\N	Open Source	\N	\N	\N	software
1849	Fun Fun Function	JavaScript and general programming videos	200	{Linux,Mac,Windows}	https://patreon.com/funfunfunction	\N	1	approved	2026-01-18 09:32:25.428862	\N	\N	Open Source	\N	\N	\N	software
1850	Joel Yliluoma	Programming videos	200	{Linux,Mac,Windows}	https://www.patreon.com/Bisqwit	\N	1	approved	2026-01-18 09:32:25.429543	\N	\N	Open Source	\N	\N	\N	software
1851	LiveOverflow	IT security videos	200	{Linux,Mac,Windows}	https://www.patreon.com/liveoverflow	\N	1	approved	2026-01-18 09:32:25.430218	\N	\N	Open Source	\N	\N	\N	software
1852	The Coding Train	Programming tutorials	200	{Linux,Mac,Windows}	https://www.patreon.com/codingtrain	\N	1	approved	2026-01-18 09:32:25.430895	\N	\N	Open Source	\N	\N	\N	software
1853	ThreatWire	Hak5 security show	200	{Linux,Mac,Windows}	https://www.patreon.com/ThreatWire	\N	1	approved	2026-01-18 09:32:25.431549	\N	\N	Open Source	\N	\N	\N	software
1854	Destination Linux	Linux discussion and news related podcast	201	{Linux,Mac,Windows}	https://www.patreon.com/destinationlinux	\N	1	approved	2026-01-18 09:32:25.432767	\N	\N	Open Source	\N	\N	\N	software
1855	Late Night Linux	Linux and news	201	{Linux,Mac,Windows}	https://www.patreon.com/LateNightLinux	\N	1	approved	2026-01-18 09:32:25.433501	\N	\N	Open Source	\N	\N	\N	software
1856	More Than Just Code	Podcast for iOS developers	201	{Linux,Mac,Windows}	https://www.patreon.com/mtjc	\N	1	approved	2026-01-18 09:32:25.434137	\N	\N	Open Source	\N	\N	\N	software
1857	The Debug Log	Game development	201	{Linux,Mac,Windows}	https://www.patreon.com/thedebuglog	\N	1	approved	2026-01-18 09:32:25.434863	\N	\N	Open Source	\N	\N	\N	software
1858	This Week in Linux	Linux News Podcast, 2-3 times more topics per episode than other podcasts	201	{Linux,Mac,Windows}	https://www.patreon.com/tuxdigital	\N	1	approved	2026-01-18 09:32:25.435593	\N	\N	Open Source	\N	\N	\N	software
1859	Tablacus - Thêm Tab cho Windows (P)	Office & Productivity​ Tablacus - Thêm Tab cho Windows (P) Spoiler	204	{Windows}	https://www.mediafire.com/file/sirvo10idu4iotd/rarreg.key/file	\N	1	approved	2026-01-18 16:23:11.419458	\N	\N	Unknown	\N	\N	Imported from VOZ: https://voz.vn/t/tong-hop-software-can-thiet-cho-may-tinh.2974#post-0\nAuthor: GR666N\nPosted: 2020-03-14T18:57:07+0700	software
1860	Win/Office ISO + MS Toolkit	Win/Office ISO & LT​ Win/Office ISO + MS Toolkit Spoiler	204	{Windows}	https://docs.google.com/spreadsheets/d/e/2PACX-1vRlK-vRwPJHDaANT81EjyG4m5ZnLXdKRYfS0eKXyCzGymEfUDmKHRhxvUbtWYTfVn7MJ3E2jk7v3cGi/pubhtml#	\N	1	approved	2026-01-18 16:23:11.425908	\N	\N	Unknown	\N	\N	Imported from VOZ: https://voz.vn/t/tong-hop-software-can-thiet-cho-may-tinh.2974#post-0\nAuthor: GR666N\nPosted: 2020-03-14T19:02:49+0700\nAdditional links: https://docs.google.com/spreadsheets/d/e/2PACX-1vSScnE8yYzjgTlMiTpoGZ4VwDKHDanTld2_BXXliZg_nTyVVJq0ppvDJHiRFuMEoAO9UKHZqCG2o97T/pubhtml	software
1866	Medium	Access to the data of [medium.com](https://medium.com/)	207	{Web}	https://github.com/Medium/medium-api-docs	\N	1	approved	2026-01-18 16:45:14.236446	\N	\N	Open Tools	\N	\N	\N	software
1867	Weebly	With Weebly Cloud, you provide Weebly’s best-in-class website builder to enable your customers to create their own website, blog or online store in minutes, while you maintain full control over billing, support, and the customer relationship	207	{Web}	https://cloud-developer.weebly.com/	\N	1	approved	2026-01-18 16:45:14.237686	\N	\N	Open Tools	\N	\N	\N	software
1882	Square	Square offers easy credit card processing and complete solutions for every type of business	209	{Web}	https://connect.squareup.com/	\N	1	approved	2026-01-18 16:45:14.262589	\N	\N	Open Tools	\N	\N	\N	software
1886	Lyft	Allows to get real-time ETAs, availability, price estimates, ride status	211	{Web}	https://www.lyft.com/developers	\N	1	approved	2026-01-18 16:45:14.267358	\N	\N	Open Tools	\N	\N	\N	software
1887	Shenzhou	A Chinese carsharing company.(**Missing English Docs**)	211	{Web}	http://developer.10101111.com/resourceCenter/doc?r=api/content	\N	1	approved	2026-01-18 16:45:14.268143	\N	\N	Open Tools	\N	\N	\N	software
1888	Uber	Allows to customize trip experiences, request ride, power logistics, create bot and so much more	211	{Web}	https://developer.uber.com/	\N	1	approved	2026-01-18 16:45:14.26887	\N	\N	Open Tools	\N	\N	\N	software
1889	aliyun	(**Missing English Docs**)	212	{Web}	https://develop.aliyun.com/api/	\N	1	approved	2026-01-18 16:45:14.270571	\N	\N	Open Tools	\N	\N	\N	software
1890	Baidu Cloud	(**Missing English Docs**)	212	{Web}	https://cloud.baidu.com/doc/index.html	\N	1	approved	2026-01-18 16:45:14.271668	\N	\N	Open Tools	\N	\N	\N	software
1891	Bmob	(**Missing English Docs**)	212	{Web}	http://www.bmob.cn/	\N	1	approved	2026-01-18 16:45:14.272871	\N	\N	Open Tools	\N	\N	\N	software
1893	LeanCloud	(**Missing English Docs**)	212	{Web}	https://leancloud.cn/	\N	1	approved	2026-01-18 16:45:14.274464	\N	\N	Open Tools	\N	\N	\N	software
1895	qiniu	(**Missing English Docs**)	212	{Web}	http://www.qiniu.com/	\N	1	approved	2026-01-18 16:45:14.275987	\N	\N	Open Tools	\N	\N	\N	software
1897	wilddog	(**Missing English Docs**)	212	{Web}	https://www.wilddog.com/	\N	1	approved	2026-01-18 16:45:14.278446	\N	\N	Open Tools	\N	\N	\N	software
1898	upyun	(**Missing English Docs**)	212	{Web}	https://www.upyun.com/	\N	1	approved	2026-01-18 16:45:14.27955	\N	\N	Open Tools	\N	\N	\N	software
1900	Box	Search, metadata, granular permission models, enterprise-grade security, retention policies, preview capabilities for 120 file types	213	{Web}	https://developer.box.com/	\N	1	approved	2026-01-18 16:45:14.283624	\N	\N	Open Tools	\N	\N	\N	software
1901	Digital Ocean	Deploy an SSD cloud server in 55 seconds	213	{Web}	https://developers.digitalocean.com/	\N	1	approved	2026-01-18 16:45:14.287558	\N	\N	Open Tools	\N	\N	\N	software
1902	Document Cloud	DocumentCloud runs every document you upload through OpenCalais,giving you access to extensive information about the people, places and organizations mentioned in each	213	{Web}	http://www.documentcloud.org/help/api	\N	1	approved	2026-01-18 16:45:14.289042	\N	\N	Open Tools	\N	\N	\N	software
1904	OneDrive	Access to OneDrive files	213	{Web}	https://dev.onedrive.com/	\N	1	approved	2026-01-18 16:45:14.291326	\N	\N	Open Tools	\N	\N	\N	software
1907	AfterShip	Supports shipment tracking and notifications for over 200 couriers	214	{Web}	https://docs.aftership.com/api/	\N	1	approved	2026-01-18 16:45:14.297163	\N	\N	Open Tools	\N	\N	\N	software
1908	aikuaidi	Supports shipment tracking for over 200 Chinese couriers.(**Missing English Docs**)	214	{Web}	http://www.aikuaidi.cn/api/	\N	1	approved	2026-01-18 16:45:14.29796	\N	\N	Open Tools	\N	\N	\N	software
1909	Aramex	Provides parcel, package, and freight delivery via a global network of shipping providers	214	{Web}	https://www.aramex.com/developers/aramex-apis	\N	1	approved	2026-01-18 16:45:14.298747	\N	\N	Open Tools	\N	\N	\N	software
1910	Canada Post	Allows e-commerce solution providers and online merchants to integrate Canada Post services, such as shipping, rating and tracking data, into a platform or website	214	{Web}	http://www.canadapost.ca/cpo/mc/business/productsservices/developers/services/fundamentals.jsf	\N	1	approved	2026-01-18 16:45:14.299552	\N	\N	Open Tools	\N	\N	\N	software
1911	DHL	DHL XML Services provides developers the ability to integrate DHL's service availability, transit times, rates, shipment tracking and more from more than 140 countries	214	{Web}	http://www.dhl-usa.com/en/express/resource_center/integrated_shipping_solutions.html	\N	1	approved	2026-01-18 16:45:14.300445	\N	\N	Open Tools	\N	\N	\N	software
1912	FedEx	FedEx web services allow businesses to integrate FedEx shipping functionality into their existing warehouse management systems without hosting on-site	214	{Web}	https://www.fedex.com/us/developer/web-services/index.html	\N	1	approved	2026-01-18 16:45:14.301679	\N	\N	Open Tools	\N	\N	\N	software
1913	kuaidi100	Supports shipment tracking for over 100 Chinese couriers and 300 international couriers.(**Missing English Docs**)	214	{Web}	http://www.kuaidi100.com/openapi/	\N	1	approved	2026-01-18 16:45:14.302999	\N	\N	Open Tools	\N	\N	\N	software
1914	kuaidi.com	Supports shipment tracking for over 100 couriers.(**Missing English Docs**)	214	{Web}	http://www.kuaidi.com/openapi.html	\N	1	approved	2026-01-18 16:45:14.30387	\N	\N	Open Tools	\N	\N	\N	software
1915	kdniao	Supports shipment tracking for over 400 couriers.(**Missing English Docs**)	214	{Web}	http://www.kdniao.com/	\N	1	approved	2026-01-18 16:45:14.304684	\N	\N	Open Tools	\N	\N	\N	software
1916	UPS	Provides UPS shipping functionalities to be integrated into websites and enterprise applications	214	{Web}	http://www.ups.com/content/us/en/resources/techsupport/developercenter.html	\N	1	approved	2026-01-18 16:45:14.30547	\N	\N	Open Tools	\N	\N	\N	software
1917	Dribbble	Access to buckets, projects, shots, teams, users, jobs data	215	{Web}	http://developer.dribbble.com/v1/	\N	1	approved	2026-01-18 16:45:14.306803	\N	\N	Open Tools	\N	\N	\N	software
1918	Behance	Get information of projects, creatives to follow, creative fields, users, collections	215	{Web}	https://www.behance.net/dev/api/endpoints/	\N	1	approved	2026-01-18 16:45:14.307491	\N	\N	Open Tools	\N	\N	\N	software
1919	deviantART	Allows to get data of deviantart.com	215	{Web}	https://www.deviantart.com/developers/	\N	1	approved	2026-01-18 16:45:14.308232	\N	\N	Open Tools	\N	\N	\N	software
1922	Bitbucket	Bitbucket is a web-based hosting service that is owned by Atlassian, used for source code and development projects that use either Mercurial or Git revision control systems	216	{Web}	https://developer.atlassian.com/cloud/bitbucket/	\N	1	approved	2026-01-18 16:45:14.311743	\N	\N	Open Tools	\N	\N	\N	software
1923	bitly	bitly is the easiest and most fun way to save, share and discover links from around the web	216	{Web}	https://dev.bitly.com/	\N	1	approved	2026-01-18 16:45:14.31255	\N	\N	Open Tools	\N	\N	\N	software
1924	Buddy	Buddy is a Continuous Integration service. It supports GitHub, Bitbucket, and Gitlab projects. Automate the lifecycle of web & Docker apps: Build, Test & Deploy	216	{Web}	https://buddy.works/api/reference/getting-started/overview	\N	1	approved	2026-01-18 16:45:14.313261	\N	\N	Open Tools	\N	\N	\N	software
1925	Bugzilla	Bugzilla is a Web-based general-purpose bugtracker and testing tool originally developed and used by the Mozilla project, and licensed under the Mozilla Public License	216	{Web}	https://wiki.mozilla.org/Bugzilla:REST_API	\N	1	approved	2026-01-18 16:45:14.313995	\N	\N	Open Tools	\N	\N	\N	software
1927	Coding	Access to https://coding.net/	216	{Web}	https://open.coding.net/	\N	1	approved	2026-01-18 16:45:14.316284	\N	\N	Open Tools	\N	\N	\N	software
1929	diycode	Access to https://www.diycode.cc/	216	{Web}	https://www.diycode.cc/api	\N	1	approved	2026-01-18 16:45:14.317716	\N	\N	Open Tools	\N	\N	\N	software
1931	GitHub	The world's leading software development platform	216	{Web}	https://developer.github.com/v3/	\N	1	approved	2026-01-18 16:45:14.319329	\N	\N	Open Tools	\N	\N	\N	software
1935	MAC Address Vendor Lookup	Retrieve vendor details and other information regarding a given MAC address or an OUI	216	{Web}	https://macaddress.io/api-documentation	\N	1	approved	2026-01-18 16:45:14.323159	\N	\N	Open Tools	\N	\N	\N	software
1939	ProxyCrawl	Scrape and crawl any website without blocks, captchas or proxies	216	{Web}	https://proxycrawl.com	\N	1	approved	2026-01-18 16:45:14.326456	\N	\N	Open Tools	\N	\N	\N	software
1948	ZenHub	ZenHub is the only project management tool that integrates natively within GitHub’s user interface	216	{Web}	https://github.com/ZenHubIO/API	\N	1	approved	2026-01-18 16:45:14.333947	\N	\N	Open Tools	\N	\N	\N	software
1956	Jawbone UP	Harness the power of step, activity, food, and sleep tracking to build your own products and experiences	218	{Web}	https://jawbone.com/up/developer	\N	1	approved	2026-01-18 16:45:14.341758	\N	\N	Open Tools	\N	\N	\N	software
1958	Misfit	You can now leverage a suite of tools to integrate Misfit’s activity tracking, sleep tracking and wearable control functionality into your products and services	218	{Web}	https://build.misfit.com/	\N	1	approved	2026-01-18 16:45:14.343673	\N	\N	Open Tools	\N	\N	\N	software
1959	Nike+	Activity Services return detailed information aggregated from a user’s activity with Nike+. For example, a user’s run details, like average pace, time, distance, NikeFuel earned from his/her Nike+ FuelBand, lifetime achievements and more	218	{Web}	https://developer.nike.com/content/nike-developer-cq/us/en_us/index/documentation/api-docs.html	\N	1	approved	2026-01-18 16:45:14.344468	\N	\N	Open Tools	\N	\N	\N	software
1960	Recon	Access to [Recon instruments](http://www.reconinstruments.com/)'s data	218	{Web}	http://www.reconinstruments.com/developers/develop/for-recon-engage/api-documentation/	\N	1	approved	2026-01-18 16:45:14.345166	\N	\N	Open Tools	\N	\N	\N	software
1964	1Forge.com	Real-time forex and crypto quotes via JSON and WebSocket	220	{Web}	https://1forge.com/	\N	1	approved	2026-01-18 16:45:14.349303	\N	\N	Open Tools	\N	\N	\N	software
2061	LinkedIn	World's largest professional network	232	{Web}	https://developer.linkedin.com/	\N	1	approved	2026-01-18 16:45:14.433197	\N	\N	Open Tools	\N	\N	\N	software
1952	Mandrill	Mandrill is like MailChimp, for apps. Send transactional, triggered, and personalized email, then track results	30	{Web}	https://mandrillapp.com/api/docs/	\N	1	approved	2026-01-18 16:45:14.338007	\N	\N	Open Tools	\N	\N	\N	software
1944	SVN	This documentation covers the public APIs provided by the Subversion libraries. It is intended mainly for programmers, both those working on Subversion itself, as well as developers of 3rd-party applications intending to use these APIs	216	{Web}	https://subversion.apache.org/docs/api/1.8/	\N	1	approved	2026-01-18 16:45:14.330504	\N	\N	Open Tools	\N	\N	\N	api
1945	TravisCI	This is the API used by the official Travis CI web interface, so everything the web ui is able to do can also be accomplished via the API	216	{Web}	https://docs.travis-ci.com/api/	\N	1	approved	2026-01-18 16:45:14.331267	\N	\N	Open Tools	\N	\N	\N	api
1946	V2EX	Access to API of https://www.v2ex.com/ .(**Missing English Docs**)	216	{Web}	https://www.v2ex.com/p/7v9TEc53	\N	1	approved	2026-01-18 16:45:14.332345	\N	\N	Open Tools	\N	\N	\N	api
1977	Google Assistant	Actions on Google let you build for the Google Assistant	222	{Web}	https://developers.google.com/actions/	\N	1	approved	2026-01-18 16:45:14.360133	\N	\N	Open Tools	\N	\N	\N	software
1978	Home8	100% wireless IoT System, Home8 simplifies Smart Alarm systems with DIY installation while providing you with the best Video-Verified Alarm protection	222	{Web}	https://developer.home8systems.com/	\N	1	approved	2026-01-18 16:45:14.360973	\N	\N	Open Tools	\N	\N	\N	software
1987	Philips Hue	Philips Hue connected bulbs and bridge let you to take full control of your lighting	222	{Web}	https://developers.meethue.com/	\N	1	approved	2026-01-18 16:45:14.36813	\N	\N	Open Tools	\N	\N	\N	software
1991	Vinli	Vinli is a platform for easily and quickly building connected car apps	222	{Web}	https://dev.vin.li/#/home	\N	1	approved	2026-01-18 16:45:14.371366	\N	\N	Open Tools	\N	\N	\N	software
1992	Yeelight	Yeelight smart LED products support remote control through WiFi	222	{Web}	http://www.yeelight.com/en_US/developer	\N	1	approved	2026-01-18 16:45:14.372142	\N	\N	Open Tools	\N	\N	\N	software
1993	Amazon Machine Learning	Amazon Machine Learning makes it easy for developers to build smart applications, including applications for fraud detection, demand forecasting, targeted marketing, and click prediction	223	{Web}	https://aws.amazon.com/cn/documentation/machine-learning/	\N	1	approved	2026-01-18 16:45:14.3734	\N	\N	Open Tools	\N	\N	\N	software
1994	BigML	The BigML platform features anomaly detection, cluster analysis, SunBurst visualization for decision trees, text analysis, and more	223	{Web}	https://bigml.com/api	\N	1	approved	2026-01-18 16:45:14.374376	\N	\N	Open Tools	\N	\N	\N	software
1995	Diffbot	The Diffbot platform utilizes a combination of AI, computer vision, machine learning, and natural language processing to automatically extract data from web pages such as text, images, video, product information, and comments	223	{Web}	https://www.diffbot.com/dev/docs/	\N	1	approved	2026-01-18 16:45:14.375126	\N	\N	Open Tools	\N	\N	\N	software
1971	Riot Games	Provides the League of Legends developer community with access to game data in a secure and reliable way	273	{Web}	https://developer.riotgames.com/	\N	1	approved	2026-01-18 16:45:14.355094	\N	\N	Open Tools	\N	\N	\N	software
1972	Steam Web APIs	The Steam Web APIs allow developers to query Steam for information that they can present on their own sites.At the moment the only APIs we offer provide item data for Team Fortress 2, but this list will grow over time	273	{Web}	https://steamcommunity.com/dev	\N	1	approved	2026-01-18 16:45:14.355795	\N	\N	Open Tools	\N	\N	\N	api
1997	IBM Watson	Allow developers to build applications that utilize machine learning technologies such as natural language processing, computer vision, and prediction	223	{Web}	https://developer.ibm.com/watson/	\N	1	approved	2026-01-18 16:45:14.376644	\N	\N	Open Tools	\N	\N	\N	software
1998	Microsoft Azure Machine Learning	The Microsoft Azure Machine Learning platform provides capabilities such as natural language processing, recommendation engine, pattern recognition, computer vision, and predictive modeling	223	{Web}	https://azure.microsoft.com/en-us/services/cognitive-services/	\N	1	approved	2026-01-18 16:45:14.377453	\N	\N	Open Tools	\N	\N	\N	software
2002	Google Maps	The Google Maps web services are a collection of HTTP interfaces to Google services providing geographic data for your maps applications	224	{Web}	https://developers.google.com/maps/web-services/?hl=en	\N	1	approved	2026-01-18 16:45:14.381353	\N	\N	Open Tools	\N	\N	\N	software
2003	Here Maps	Use simple HTTP GET methods providing maps, routing, geocoding, places, positioning, traffic, transit and weather information	224	{Web}	https://developer.here.com/develop/rest-apis	\N	1	approved	2026-01-18 16:45:14.382075	\N	\N	Open Tools	\N	\N	\N	software
2005	Cisco Spark	Create a room and invite people, search for people in your company, post messages into a room, get room history or be notified in real-time when new messages are posted by others	225	{Web}	https://developer.ciscospark.com/	\N	1	approved	2026-01-18 16:45:14.384041	\N	\N	Open Tools	\N	\N	\N	software
2008	Fleep	Fleep is a messenger for all your teams and projects	225	{Web}	https://fleep.io/fleepapi/	\N	1	approved	2026-01-18 16:45:14.386307	\N	\N	Open Tools	\N	\N	\N	software
2011	LINE	LINE is a freeware app for instant communications on electronic devices such as smartphones, tablet computers, and personal computers	225	{Web}	https://developers.line.me/	\N	1	approved	2026-01-18 16:45:14.388465	\N	\N	Open Tools	\N	\N	\N	software
2013	Yo	Yo is the simplest notification platform	225	{Web}	http://docs.justyo.co/	\N	1	approved	2026-01-18 16:45:14.390501	\N	\N	Open Tools	\N	\N	\N	software
2014	Deezer	Deezer is an Internet-based music streaming service	226	{Web}	https://developers.deezer.com/	\N	1	approved	2026-01-18 16:45:14.392178	\N	\N	Open Tools	\N	\N	\N	software
2015	KaolaFM	Allows to access the data of KaolaFM.(**Missing English Docs**)	226	{Web}	https://github.com/kaolafm/api	\N	1	approved	2026-01-18 16:45:14.393118	\N	\N	Open Tools	\N	\N	\N	software
2020	QingtingFM	Allows to access the data fo QingtingFM.(**Missing English Docs**)	226	{Web}	http://open.qingting.fm/	\N	1	approved	2026-01-18 16:45:14.396927	\N	\N	Open Tools	\N	\N	\N	software
2021	Qi'eFM	Allows to access the data of Qi'eFM.(**Missing English Docs**)	226	{Web}	http://wq.qq.com/	\N	1	approved	2026-01-18 16:45:14.397621	\N	\N	Open Tools	\N	\N	\N	software
2022	SearchLy	Similarities search based on song lyrics	226	{Web}	https://github.com/AlbertSuarez/searchly	\N	1	approved	2026-01-18 16:45:14.398326	\N	\N	Open Tools	\N	\N	\N	software
2023	SoundCloud	Allow users to upload and share sounds across the web	226	{Web}	https://developers.soundcloud.com/	\N	1	approved	2026-01-18 16:45:14.399034	\N	\N	Open Tools	\N	\N	\N	software
2025	BrewereyDB	BreweryDB is a database of breweries, beers, beer events and guilds	227	{Web}	http://www.brewerydb.com/developers	\N	1	approved	2026-01-18 16:45:14.401361	\N	\N	Open Tools	\N	\N	\N	software
2033	Narro	Access articles and readings, as well as submit them on behalf of customers	227	{Web}	https://docs.narro.co/#introduction	\N	1	approved	2026-01-18 16:45:14.407465	\N	\N	Open Tools	\N	\N	\N	software
2045	WePay	WePay is designed for platforms like marketplaces, crowdfunding sites & small business tools. Get a seamless user experience & fraud protection	229	{Web}	https://www.wepay.com/	\N	1	approved	2026-01-18 16:45:14.418621	\N	\N	Open Tools	\N	\N	\N	software
2046	Phonepe	PhonePe provides a cashless and seamless payment experience to customers. PhonePe is a multi-instrument payment container and allows customers to pay through UPI, Debit Card, Credit Card, and Wallet	229	{Web}	https://developer.phonepe.com/docs	\N	1	approved	2026-01-18 16:45:14.41943	\N	\N	Open Tools	\N	\N	\N	software
2048	Giphy	The largest GIF library in the world	230	{Web}	https://developers.giphy.com/docs/	\N	1	approved	2026-01-18 16:45:14.421408	\N	\N	Open Tools	\N	\N	\N	software
2051	Unsplash	Access to the most powerful photo engine in the world	230	{Web}	https://unsplash.com/documentation	\N	1	approved	2026-01-18 16:45:14.423622	\N	\N	Open Tools	\N	\N	\N	software
2052	Unsplash It	Beautiful placeholders using images from [unsplash](https://unsplash.com/)	230	{Web}	https://unsplash.it/	\N	1	approved	2026-01-18 16:45:14.42435	\N	\N	Open Tools	\N	\N	\N	software
2056	Disqus	Disqus' platform includes various features, such as social integration, social networking, user profiles, spam and moderation tools, analytics, email notifications, and mobile commenting	232	{Web}	https://disqus.com/api/docs/	\N	1	approved	2026-01-18 16:45:14.429259	\N	\N	Open Tools	\N	\N	\N	software
2057	Facebook	Facebook is an American for-profit corporation and an online social media and social networking service	232	{Web}	https://developers.facebook.com/docs/?locale=en_US	\N	1	approved	2026-01-18 16:45:14.429995	\N	\N	Open Tools	\N	\N	\N	software
2058	Flickr	Almost certainly the best online photo management and sharing application in the world	232	{Web}	https://www.flickr.com/services/api/	\N	1	approved	2026-01-18 16:45:14.430806	\N	\N	Open Tools	\N	\N	\N	software
2060	Instagram	A simple, fun & creative way to capture, edit & share photos, videos & messages with friends & family	232	{Web}	https://www.instagram.com/developer/	\N	1	approved	2026-01-18 16:45:14.432461	\N	\N	Open Tools	\N	\N	\N	software
2063	Tumblr	Tumblr is a place to express yourself, discover yourself, and bond over the stuff you love	232	{Web}	https://www.tumblr.com/docs/en/api/v2	\N	1	approved	2026-01-18 16:45:14.435164	\N	\N	Open Tools	\N	\N	\N	software
2064	Twitter	Access to Twitter's data	232	{Web}	https://dev.twitter.com/	\N	1	approved	2026-01-18 16:45:14.43588	\N	\N	Open Tools	\N	\N	\N	software
2065	Weibo	Access to posts, users, comments, favorites, etc.(**Missing English Docs**)	232	{Web}	http://open.weibo.com/wiki/API	\N	1	approved	2026-01-18 16:45:14.436618	\N	\N	Open Tools	\N	\N	\N	software
2075	Baidu Waimai	Baidu Waimai is a Chinese takeout platform.(**Missing English Docs**)	234	{Web}	http://dev.waimai.baidu.com/	\N	1	approved	2026-01-18 16:45:14.445261	\N	\N	Open Tools	\N	\N	\N	software
2076	Dianping	Dianping is a Chinese takeout platform.(**Missing English Docs**)	234	{Web}	http://developer.dianping.com	\N	1	approved	2026-01-18 16:45:14.446045	\N	\N	Open Tools	\N	\N	\N	software
2077	Eleme	Eleme is a Chinese takeout platform.(**Missing English Docs**)	234	{Web}	http://openapi.eleme.io/v2/quickstart.html	\N	1	approved	2026-01-18 16:45:14.447326	\N	\N	Open Tools	\N	\N	\N	software
2078	Meituan	Meituan is a Chinese takeout platform.(**Missing English Docs**)	234	{Web}	http://developer.waimai.meituan.com/doc/show	\N	1	approved	2026-01-18 16:45:14.448077	\N	\N	Open Tools	\N	\N	\N	software
2079	Asana	Allows you to programmatically update and access much of your data on the platform	235	{Web}	https://asana.com/guide/help/api/api	\N	1	approved	2026-01-18 16:45:14.449847	\N	\N	Open Tools	\N	\N	\N	software
2080	join.me	join.me is the online meeting tool that just gets out of the way so that people can accomplish great things together	235	{Web}	https://developer.join.me/	\N	1	approved	2026-01-18 16:45:14.451044	\N	\N	Open Tools	\N	\N	\N	software
2082	TeamSnap	Empower your users with the world's best team management solution	235	{Web}	http://developer.teamsnap.com/	\N	1	approved	2026-01-18 16:45:14.452946	\N	\N	Open Tools	\N	\N	\N	software
2083	Trello	Trello is a web-based project management application	235	{Web}	https://developers.trello.com/	\N	1	approved	2026-01-18 16:45:14.453805	\N	\N	Open Tools	\N	\N	\N	software
2085	BosonNLP	Chinese text analysis.(**Missing English Docs**)	236	{Web}	http://docs.bosonnlp.com/	\N	1	approved	2026-01-18 16:45:14.456123	\N	\N	Open Tools	\N	\N	\N	software
2087	Tencent NLP	Chinese text analysis.(**Missing English Docs**)	236	{Web}	http://nlp.qq.com/help.cgi	\N	1	approved	2026-01-18 16:45:14.457807	\N	\N	Open Tools	\N	\N	\N	software
2089	Watson Natural Language Understanding	Natural Language Understanding by Watson uses natural language processing to analyze semantic features of any text	236	{Web}	https://www.ibm.com/watson/developercloud/natural-language-understanding/api/v1/	\N	1	approved	2026-01-18 16:45:14.45947	\N	\N	Open Tools	\N	\N	\N	software
2093	ctrip	Access to the data of ctrip.(**Missing English Docs**)	238	{Web}	http://u.ctrip.com/union/help/Termsofuse.aspx	\N	1	approved	2026-01-18 16:45:14.464574	\N	\N	Open Tools	\N	\N	\N	software
2094	elong	Provides access to the data of hotels and air tickets.(**Missing English Docs**)	238	{Web}	http://open.elong.com/home/index	\N	1	approved	2026-01-18 16:45:14.465247	\N	\N	Open Tools	\N	\N	\N	software
2095	qunar	Access to qunar's hotel, train tickets, air tickets and insurance data.(**Missing English Docs**)	238	{Web}	http://open.qunar.com/	\N	1	approved	2026-01-18 16:45:14.465993	\N	\N	Open Tools	\N	\N	\N	software
2096	tuniu	Access to the data of tuniu. Only available to suppliers.(**Missing English Docs**)	238	{Web}	http://open.tuniu.cn/	\N	1	approved	2026-01-18 16:45:14.466746	\N	\N	Open Tools	\N	\N	\N	software
2097	Baidu Translate	Supports translation between multiple languages.(**Missing English Docs**)	239	{Web}	http://api.fanyi.baidu.com/api/trans/product/index	\N	1	approved	2026-01-18 16:45:14.468056	\N	\N	Open Tools	\N	\N	\N	software
2331	LDPlayer	Lightweight Android emulator for gaming on PC. 🪟	275	{Windows}	https://ldplayer.net	\N	1	approved	2026-01-18 16:58:09.370808	\N	\N	Freeware	\N	\N	\N	software
2098	Google Translate	Dynamically translate between thousands of available language pairs	239	{Web}	https://cloud.google.com/translate/docs/	\N	1	approved	2026-01-18 16:45:14.468826	\N	\N	Open Tools	\N	\N	\N	software
2099	iciba	Support simple translation.(**Missing English Docs**)	239	{Web}	http://open.iciba.com/?c=api	\N	1	approved	2026-01-18 16:45:14.469586	\N	\N	Open Tools	\N	\N	\N	software
2100	Microsoft Translator	A cloud-based machine translation service supporting multiple languages that reach more than 95% of world's gross domestic product (GDP)	239	{Web}	https://www.microsoft.com/en-us/translator/translatorapi.aspx	\N	1	approved	2026-01-18 16:45:14.470325	\N	\N	Open Tools	\N	\N	\N	software
2103	Yandex Translate	Supports more than 70 languages and can translate separate words or complete texts	239	{Web}	https://tech.yandex.com/translate/	\N	1	approved	2026-01-18 16:45:14.472453	\N	\N	Open Tools	\N	\N	\N	software
2104	yeekit	Support translation between several languages.(**Missing English Docs**)	239	{Web}	http://api.yeekit.com/	\N	1	approved	2026-01-18 16:45:14.473139	\N	\N	Open Tools	\N	\N	\N	software
2105	Youdao	Support simple translation.(**Missing English Docs**)	239	{Web}	http://fanyi.youdao.com/openapi	\N	1	approved	2026-01-18 16:45:14.473814	\N	\N	Open Tools	\N	\N	\N	software
2119	CamScanner	Allows to digitalize paper documents with cutting-edge image processing technologies	242	{Web}	https://dev.camscanner.com/?language=en-us	\N	1	approved	2026-01-18 16:45:14.487448	\N	\N	Open Tools	\N	\N	\N	software
2123	Face++	Face++ Cognitive Services is a platform offering computer vision technologies that enable your applications to read and understand the world better	242	{Web}	https://console.faceplusplus.com/documents/5678948	\N	1	approved	2026-01-18 16:45:14.490345	\N	\N	Open Tools	\N	\N	\N	software
2124	Watson Visual Recognition	The IBM Watson™ Visual Recognition service identifies scenes, objects, and celebrity faces in images you upload to the service. You can create and train a custom classifier to identify subjects that suit your needs	242	{Web}	https://www.ibm.com/watson/developercloud/visual-recognition/api/v3/#introduction	\N	1	approved	2026-01-18 16:45:14.49105	\N	\N	Open Tools	\N	\N	\N	software
2108	iqiyi	Supports query data of iqiyi.(**Missing English Docs**)	39	{Web}	http://open.iqiyi.com/lib/scheme.html	\N	1	approved	2026-01-18 16:45:14.477743	\N	\N	Open Tools	\N	\N	\N	software
2109	LeTV	Allows to query data, upload, download, etc.(**Missing English Docs**)	39	{Web}	http://www.lecloud.com/zh-cn/help/2016/07/27/150.html?LeftMenu=api_db_guide	\N	1	approved	2026-01-18 16:45:14.478448	\N	\N	Open Tools	\N	\N	\N	software
2111	Sohu TV	Allows to query data.(**Missing English Docs**)	39	{Web}	http://lm.tv.sohu.com/union/open_platform.do	\N	1	approved	2026-01-18 16:45:14.480101	\N	\N	Open Tools	\N	\N	\N	software
2113	TVmaze	TV Show and web series database. Episode guide, cast, crew and character information. Recaps, reviews, episode trailers, celebrity photos and more	39	{Web}	https://www.tvmaze.com/api	\N	1	approved	2026-01-18 16:45:14.481713	\N	\N	Open Tools	\N	\N	\N	software
2114	Vimeo	The web's most supportive community of creators and get high-quality tools for hosting, sharing, and streaming videos in gorgeous HD with no ads	39	{Web}	https://developer.vimeo.com/	\N	1	approved	2026-01-18 16:45:14.482454	\N	\N	Open Tools	\N	\N	\N	software
2115	Youtube	Embed YouTube functionality into your own website and applications	39	{Web}	https://developers.google.com/youtube/documentation/	\N	1	approved	2026-01-18 16:45:14.483128	\N	\N	Open Tools	\N	\N	\N	software
2116	Youku	Allows to upload, download, log in, etc.(**Missing English Docs**)	39	{Web}	https://doc.open.youku.com/	\N	1	approved	2026-01-18 16:45:14.483859	\N	\N	Open Tools	\N	\N	\N	software
2101	Oxford Dictionaries	Access to Oxford Dictionaries' APIs	239	{Web}	https://developer.oxforddictionaries.com/	\N	1	approved	2026-01-18 16:45:14.471042	\N	\N	Open Tools	\N	\N	\N	api
2102	Shanbay	Provides complete APIs which support users in query, adding study records, writing note, etc.(**Missing English Docs**)	239	{Web}	https://www.shanbay.com/help/developer/api_v1/	\N	1	approved	2026-01-18 16:45:14.471738	\N	\N	Open Tools	\N	\N	\N	api
2128	Caiyun Weather	Weather information of China.(**Missing English Docs**)	243	{Web}	https://caiyunapp.com/index.html#api	\N	1	approved	2026-01-18 16:45:14.495056	\N	\N	Open Tools	\N	\N	\N	software
2129	heweather	Weather information of China.(**Missing English Docs**)	243	{Web}	https://www.heweather.com/documents/	\N	1	approved	2026-01-18 16:45:14.495832	\N	\N	Open Tools	\N	\N	\N	software
2131	Weather Underground	Reliable data, accurate forecast, & global coverage in 80 languages	243	{Web}	https://www.wunderground.com/weather/api/	\N	1	approved	2026-01-18 16:45:14.497251	\N	\N	Open Tools	\N	\N	\N	software
2132	Weather Unlocked	Weather driven solutions for digital advertising, eCommerce and developers	243	{Web}	https://developer.weatherunlocked.com/documentation	\N	1	approved	2026-01-18 16:45:14.497982	\N	\N	Open Tools	\N	\N	\N	software
2133	Seniverse	Weather information of China.(**Missing English Docs**)	243	{Web}	https://www.seniverse.com/doc	\N	1	approved	2026-01-18 16:45:14.498866	\N	\N	Open Tools	\N	\N	\N	software
2134	Yandex.Weather	Yandex.Weather uses proprietary forecasting technology Meteum to assess current weather conditions in specific locations on the territory of **Russia** and create forecasts for these geographic coordinates	243	{Web}	https://tech.yandex.com/weather/	\N	1	approved	2026-01-18 16:45:14.499577	\N	\N	Open Tools	\N	\N	\N	software
2135	Yahoo! Weather	Get up-to-date weather information for any location, including 5-day forecast, wind, atmosphere, astronomy conditions, and more	243	{Web}	https://developer.yahoo.com/weather/	\N	1	approved	2026-01-18 16:45:14.500581	\N	\N	Open Tools	\N	\N	\N	software
2153	Foobar2000	Lightweight and highly customizable audio player with support for many formats. 🪟 🍎 ⭐	247	{Windows}	https://foobar2000.org	\N	1	approved	2026-01-18 16:58:09.110711	\N	\N	Freeware	\N	\N	\N	software
2154	AIMP	Music player with a clean interface and powerful features. 🪟	247	{Windows}	https://aimp.ru	\N	1	approved	2026-01-18 16:58:09.111892	\N	\N	Freeware	\N	\N	\N	software
2155	Karafun	Collection of karaoke songs across multiple genres. Play your own CDG files or use downloads from YouTube. 🪟	247	{Windows}	https://karafun.com	\N	1	approved	2026-01-18 16:58:09.11431	\N	\N	Freeware	\N	\N	\N	software
2156	MusicBee	Feature-rich music player and manager. 🪟	247	{Windows}	https://getmusicbee.com	\N	1	approved	2026-01-18 16:58:09.115595	\N	\N	Freeware	\N	\N	\N	software
2157	Strawberry Music Player	Music player for organizing and playing your audio collection. 🪟 🍎 🐧	247	{Windows}	https://strawberrymusicplayer.org	\N	1	approved	2026-01-18 16:58:09.116718	\N	\N	Freeware	\N	\N	\N	software
2158	Wavosaur	Simple audio editor for recording, editing, and processing sound. 🪟	248	{Windows}	https://www.wavosaur.com	\N	1	approved	2026-01-18 16:58:09.120105	\N	\N	Freeware	\N	\N	\N	software
2159	DJ ProDecks	DJ software for mixing music and adding effects. 🪟	249	{Windows}	https://djprodecks.com	\N	1	approved	2026-01-18 16:58:09.123181	\N	\N	Freeware	\N	\N	\N	software
2150	JACK Audio	Audio server for routing and mixing sound between programs. 🪟 🍎 🐧	298	{Windows}	https://jackaudio.org	\N	1	approved	2026-01-18 16:58:09.104167	\N	\N	Freeware	\N	\N	\N	software
2151	EarTrumpet	Advanced volume control for Windows, offering app-specific audio management. 🪟	298	{Windows}	https://eartrumpet.app	\N	1	approved	2026-01-18 16:58:09.106506	\N	\N	Freeware	\N	\N	\N	software
2152	Ambie	Use white noise, nature sounds, & more to boost your productivity. 🪟 🟢	298	{Windows}	https://github.com/jenius-apps/ambie	\N	1	approved	2026-01-18 16:58:09.108425	\N	\N	Freeware	\N	\N	\N	software
2130	Open Weather Map	The OpenWeatherMap service provides free weather data and forecast API suitable for any cartographic services like web and smartphones applications	243	{Web}	https://openweathermap.org/api	\N	1	approved	2026-01-18 16:45:14.496554	\N	\N	Open Tools	\N	\N	\N	api
2160	Serato DJ Lite	DJ software for beginners to mix music with ease. 🪟 🍎	249	{Windows}	https://serato.com/dj/lite	\N	1	approved	2026-01-18 16:58:09.125156	\N	\N	Freeware	\N	\N	\N	software
2161	Rekordbox	Software that enables a comfortable DJ workflow with AI, cloud, and automation tech. 🪟 🍎	249	{Windows}	https://rekordbox.com/en	\N	1	approved	2026-01-18 16:58:09.126962	\N	\N	Freeware	\N	\N	\N	software
2162	VirtualDJ	DJ platform for mixing music, beatmatching, and live performance. 🪟 🍎	249	{Windows}	https://virtualdj.com	\N	1	approved	2026-01-18 16:58:09.127842	\N	\N	Freeware	\N	\N	\N	software
2163	ABCjs	Tool for writing and playing ABC music notation. 🪟 🍎 🐧	250	{Windows}	https://abcjs.net	\N	1	approved	2026-01-18 16:58:09.129887	\N	\N	Freeware	\N	\N	\N	software
2164	Denemo	Music notation software for fast score creation with LilyPond. 🪟 🍎 🐧	250	{Windows}	https://denemo.org	\N	1	approved	2026-01-18 16:58:09.130764	\N	\N	Freeware	\N	\N	\N	software
2165	Frescobaldi	Editor for LilyPond to create music scores quickly. 🪟 🍎 🐧	250	{Windows}	https://frescobaldi.org	\N	1	approved	2026-01-18 16:58:09.131619	\N	\N	Freeware	\N	\N	\N	software
2166	LilyPond	Music notation program for creating high-quality sheet music. 🪟 🍎 🐧	250	{Windows}	https://lilypond.org	\N	1	approved	2026-01-18 16:58:09.132456	\N	\N	Freeware	\N	\N	\N	software
2167	Cakewalk	Full-featured DAW for music recording and editing by BandLab. 🪟	251	{Windows}	https://bandlab.com/products/cakewalk	\N	1	approved	2026-01-18 16:58:09.136496	\N	\N	Freeware	\N	\N	\N	software
2168	Furnace	Multi-system chiptune tracker. 🪟 🍎 🐧 🟢	251	{Windows}	https://github.com/tildearrow/furnace	\N	1	approved	2026-01-18 16:58:09.137815	\N	\N	Freeware	\N	\N	\N	software
2169	MilkyTracker	Cross platform XM tracker. 🪟 🍎 🐧 🟢	251	{Windows}	https://github.com/milkytracker/MilkyTracker	\N	1	approved	2026-01-18 16:58:09.138773	\N	\N	Freeware	\N	\N	\N	software
2170	OpenMPT	Modren tracker software that can open multiple tracker formats. 🪟	251	{Windows}	https://openmpt.org	\N	1	approved	2026-01-18 16:58:09.13956	\N	\N	Freeware	\N	\N	\N	software
2171	Qtractor	Multi-track DAW for Linux for audio and MIDI recording. 🐧	251	{Windows}	https://qtractor.org	\N	1	approved	2026-01-18 16:58:09.140677	\N	\N	Freeware	\N	\N	\N	software
2172	Stargate DAW	Innovation-first DAW, instrument and effect plugins. 🪟 🍎 🐧 🟢	251	{Windows}	https://github.com/stargatedaw/stargate	\N	1	approved	2026-01-18 16:58:09.141576	\N	\N	Freeware	\N	\N	\N	software
2173	Tracktion T7	DAW for music production with advanced editing features. 🪟 🍎 🐧	251	{Windows}	https://tracktion.com/products/t7-daw	\N	1	approved	2026-01-18 16:58:09.14278	\N	\N	Freeware	\N	\N	\N	software
2174	Arc	Vertical tab browser for modern productivity. 🪟 🍎	252	{Windows}	https://arc.net	\N	1	approved	2026-01-18 16:58:09.145208	\N	\N	Freeware	\N	\N	\N	software
2175	Pale Moon	Goanna-based browser. 🪟 🍎 🐧 [🟢](https://repo.palemoon.org/MoonchildProductions/Pale-Moon)	252	{Windows}	https://palemoon.org	\N	1	approved	2026-01-18 16:58:09.149651	\N	\N	Freeware	\N	\N	\N	software
2176	Orion	Lightweight WebKit browser with Chrome/Firefox extension support. 🍎 🐧	252	{Windows}	https://browser.kagi.com	\N	1	approved	2026-01-18 16:58:09.150483	\N	\N	Freeware	\N	\N	\N	software
2177	qutebrowser	Keyboard-driven, vim-like browser in Python and Qt. 🪟 🍎 🐧 [🟢](https://github.com/qutebrowser/qutebrowser)	252	{Windows}	https://qutebrowser.org	\N	1	approved	2026-01-18 16:58:09.151221	\N	\N	Freeware	\N	\N	\N	software
2178	Safari	Native Mac browser with Apple device integration. 🍎	252	{Windows}	https://apple.com/safari	\N	1	approved	2026-01-18 16:58:09.152807	\N	\N	Freeware	\N	\N	\N	software
2179	Station	Browser centralizing web apps in one workspace. 🪟 🍎 🐧	252	{Windows}	https://getstation.com	\N	1	approved	2026-01-18 16:58:09.155819	\N	\N	Freeware	\N	\N	\N	software
2180	Zen Browser	Beautifully designed, privacy-focused browser with custom mods. 🪟 🍎 🐧 [🟢](https://github.com/zen-browser/desktop)	252	{Windows}	https://zen-browser.app	\N	1	approved	2026-01-18 16:58:09.15795	\N	\N	Freeware	\N	\N	\N	software
2182	BlueMail	Cross-platform email client with modern interface. 🪟 🍎 🐧	254	{Windows}	https://bluemail.me/desktop	\N	1	approved	2026-01-18 16:58:09.16402	\N	\N	Freeware	\N	\N	\N	software
2183	CanaryMail	Secure email app with PGP support and AI assistance. 🍎 🐧	254	{Windows}	https://canarymail.io	\N	1	approved	2026-01-18 16:58:09.165033	\N	\N	Freeware	\N	\N	\N	software
2184	Edison Mail	Customizable, intuitive email client with smart features. 🪟 🍎 🐧	254	{Windows}	https://mail.edison.tech/mac	\N	1	approved	2026-01-18 16:58:09.166131	\N	\N	Freeware	\N	\N	\N	software
2185	Eppie Mail	Open-source email client with local AI agents and full support for Gmail, Outlook, and Proton Mail. 🪟 🍎 🐧 🟢	254	{Windows}	https://github.com/Eppie-io/Eppie-App	\N	1	approved	2026-01-18 16:58:09.167544	\N	\N	Freeware	\N	\N	\N	software
2186	eM Client	Modern client to boost your productivity. 🪟	254	{Windows}	https://emclient.com	\N	1	approved	2026-01-18 16:58:09.168484	\N	\N	Freeware	\N	\N	\N	software
2187	Foxmail	Fast, user-friendly email client. 🪟 🍎	254	{Windows}	https://www.foxmail.com	\N	1	approved	2026-01-18 16:58:09.169405	\N	\N	Freeware	\N	\N	\N	software
2188	Mailbird	IMAP/POP3 client with customization options. 🪟	254	{Windows}	https://mailbird.com	\N	1	approved	2026-01-18 16:58:09.170863	\N	\N	Freeware	\N	\N	\N	software
2189	Nylas Mail	Extensible desktop email app based on web technologies. 🪟 🍎 🐧	254	{Windows}	https://nylas.com/nylas-mail	\N	1	approved	2026-01-18 16:58:09.172757	\N	\N	Freeware	\N	\N	\N	software
2190	Postbox	Advanced email management with productivity focus. 🪟 🍎	254	{Windows}	https://postbox-inc.com	\N	1	approved	2026-01-18 16:58:09.173718	\N	\N	Freeware	\N	\N	\N	software
2191	Polymail	Simple, powerful email client with modern features. 🪟 🍎 🐧	254	{Windows}	https://polymail.io	\N	1	approved	2026-01-18 16:58:09.174558	\N	\N	Freeware	\N	\N	\N	software
2192	Wino Mail	Fluent design email client with Mica effect. 🪟	254	{Windows}	https://apps.microsoft.com/detail/9ncrcvjc50wl?hl=en-US	\N	1	approved	2026-01-18 16:58:09.175338	\N	\N	Freeware	\N	\N	\N	software
2193	Spark	Fast email client with team collaboration features. 🍎 🐧	254	{Windows}	https://sparkmailapp.com	\N	1	approved	2026-01-18 16:58:09.176468	\N	\N	Freeware	\N	\N	\N	software
2194	ThunderBird	Email client for easier management. 🪟 🍎 🐧 🟢	254	{Windows}	https://thunderbird.net	\N	1	approved	2026-01-18 16:58:09.177469	\N	\N	Freeware	\N	\N	\N	software
2195	muCommander	Lightweight dual-pane file manager with archive support. 🍎	255	{Windows}	https://www.mucommander.com	\N	1	approved	2026-01-18 16:58:09.17995	\N	\N	Freeware	\N	\N	\N	software
2368	Irfanview	Simple image viewer with some editing abilities. 🪟	281	{Windows}	https://irfanview.com	\N	1	approved	2026-01-18 16:58:09.415065	\N	\N	Freeware	\N	\N	\N	software
2196	NanaZip	7-Zip derivative optimized for Windows 10/11 with added functionality. 🪟	255	{Windows}	https://apps.microsoft.com/detail/9n8g7tscl18r?hl=en-us&gl=US	\N	1	approved	2026-01-18 16:58:09.1811	\N	\N	Freeware	\N	\N	\N	software
2197	PDF Archiver	Tool for tagging and organizing PDFs. 🍎 🟢	255	{Windows}	https://github.com/JulianKahnert/PDF-Archiver	\N	1	approved	2026-01-18 16:58:09.182382	\N	\N	Freeware	\N	\N	\N	software
2198	The Unarchiver	Simple tool for extracting ZIP, RAR, ISO, and other formats. 🍎	255	{Windows}	https://theunarchiver.com	\N	1	approved	2026-01-18 16:58:09.183646	\N	\N	Freeware	\N	\N	\N	software
2199	Unarchive One	Multi-format decompression tool with QuickLook integration. 🍎	255	{Windows}	https://cleanerone.trendmicro.com/unarchiver-one/?utm_source=github&utm_medium=referral&utm_campaign=githubproject	\N	1	approved	2026-01-18 16:58:09.184481	\N	\N	Freeware	\N	\N	\N	software
2200	Winaero	All-in-one app for tuning Windows settings. 🪟	256	{Windows}	https://winaerotweaker.com	\N	1	approved	2026-01-18 16:58:09.186127	\N	\N	Freeware	\N	\N	\N	software
2201	Windhawk	Customization marketplace for Windows and programs. 🪟 [🟢](https://github.com/ramensoftware/windhawk)	256	{Windows}	https://windhawk.net	\N	1	approved	2026-01-18 16:58:09.187508	\N	\N	Freeware	\N	\N	\N	software
2202	HideVolumeOSD	Hides the Windows volume bar. 🪟 [🟢](https://github.com/UnlimitedStack/HideVolumeOSD)	256	{Windows}	https://github.com/UnlimitedStack/HideVolumeOSD	\N	1	approved	2026-01-18 16:58:09.190881	\N	\N	Freeware	\N	\N	\N	software
2204	Flow Launcher	Quick file search and app launcher like Spotlight. 🪟 [🟢](https://github.com/Flow-Launcher/Flow.Launcher)	256	{Windows}	https://flowlauncher.com	\N	1	approved	2026-01-18 16:58:09.19295	\N	\N	Freeware	\N	\N	\N	software
2205	ModernFlyouts	Replaces default flyouts with customizable modern ones. 🪟 [🟢](https://github.com/ModernFlyouts-Community/ModernFlyouts)	256	{Windows}	https://modernflyouts-community.github.io	\N	1	approved	2026-01-18 16:58:09.194022	\N	\N	Freeware	\N	\N	\N	software
2206	Hidden Bar	Simple app to organize and declutter your menu bar. 🍎 [🟢](https://github.com/dwarvesf/hidden)	256	{Windows}	https://github.com/dwarvesf/hidden	\N	1	approved	2026-01-18 16:58:09.194821	\N	\N	Freeware	\N	\N	\N	software
2207	MacPilot	Unlock hidden settings and system tweaks. 🍎	256	{Windows}	https://koingosw.com/products/macpilot	\N	1	approved	2026-01-18 16:58:09.19564	\N	\N	Freeware	\N	\N	\N	software
2208	noMeiryoUI	Tools to freely change system fonts. 🪟 [🟢](https://github.com/Tatsu-syo/noMeiryoUI)	256	{Windows}	https://github.com/Tatsu-syo/noMeiryoUI	\N	1	approved	2026-01-18 16:58:09.196935	\N	\N	Freeware	\N	\N	\N	software
2209	TaskbarX	Personalize the taskbar with center alignment, transparency, and animations. 🪟	256	{Windows}	https://chrisandriessen.nl/taskbarx	\N	1	approved	2026-01-18 16:58:09.197912	\N	\N	Freeware	\N	\N	\N	software
2210	TinkerTool	Utility for enabling hidden system preferences. 🍎	256	{Windows}	https://bresink.com/osx/TinkerTool.html	\N	1	approved	2026-01-18 16:58:09.199022	\N	\N	Freeware	\N	\N	\N	software
2211	Sizer	Resize any window to a predefined size. 🪟	256	{Windows}	https://brianapps.net/sizer	\N	1	approved	2026-01-18 16:58:09.199853	\N	\N	Freeware	\N	\N	\N	software
2212	Sophia Script for Windows	The most powerful PowerShell module for fine-tuning Windows showing how Windows can be configured without making any harm to it. 🪟 [🟢](https://github.com/farag2/Sophia-Script-for-Windows)	256	{Windows}	https://github.com/farag2/Sophia-Script-for-Windows	\N	1	approved	2026-01-18 16:58:09.201191	\N	\N	Freeware	\N	\N	\N	software
2213	RetroBar	Classic Windows 95, 98, Me, 2000, XP, Vista taskbar for modern versions of Windows. 🪟 [🟢](https://github.com/dremin/RetroBar)	256	{Windows}	https://github.com/dremin/RetroBar	\N	1	approved	2026-01-18 16:58:09.203983	\N	\N	Freeware	\N	\N	\N	software
2214	Lively Wallpaper	Tool to set animated and interactive wallpapers. 🪟 🟢 ⭐	257	{Windows}	https://rocksdanister.com/lively	\N	1	approved	2026-01-18 16:58:09.206448	\N	\N	Freeware	\N	\N	\N	software
2215	Rainmeter	Desktop customization tool offering widgets, skins, and live stats. 🪟 🟢 ⭐	257	{Windows}	https://rainmeter.net	\N	1	approved	2026-01-18 16:58:09.207306	\N	\N	Freeware	\N	\N	\N	software
2216	Plash	App to set websites as wallpapers. 🍎 🟢	257	{Windows}	https://sindresorhus.com/plash	\N	1	approved	2026-01-18 16:58:09.208584	\N	\N	Freeware	\N	\N	\N	software
2217	ScreenPlay	Wallpaper and widget engine. 🪟 🐧 🟢	257	{Windows}	https://github.com/kelteseth/ScreenPlay	\N	1	approved	2026-01-18 16:58:09.209495	\N	\N	Freeware	\N	\N	\N	software
2218	WinDynamicDesktop	Port of macOS Mojave Dynamic Desktop feature to Windows. 🪟 🟢	257	{Windows}	https://github.com/t1m0thyj/WinDynamicDesktop	\N	1	approved	2026-01-18 16:58:09.210799	\N	\N	Freeware	\N	\N	\N	software
2219	FastCopy	Copy and move files in batch. 🪟	258	{Windows}	https://fastcopy.jp	\N	1	approved	2026-01-18 16:58:09.213135	\N	\N	Freeware	\N	\N	\N	software
2220	TeraCopy	Copy and move multiple files. 🪟 🍎	258	{Windows}	https://codesector.com/teracopy	\N	1	approved	2026-01-18 16:58:09.214014	\N	\N	Freeware	\N	\N	\N	software
2222	Diffinity	Diff and merging tool with focus on accurate and easy-to-read source code diffs. 🪟	303	{Windows}	https://truehumandesign.se/s_diffinity.php	\N	1	approved	2026-01-18 16:58:09.217931	\N	\N	Freeware	\N	\N	\N	software
2223	TkForge	Drag & drop in Figma to create a Python GUI with ease. 🪟 🍎 🐧 🟢 ⭐	303	{Windows}	https://github.com/Axorax/tkforge	\N	1	approved	2026-01-18 16:58:09.219043	\N	\N	Freeware	\N	\N	\N	software
2224	WinMerge	Windows visual diff and merge for files and directories. 🪟 🟢	303	{Windows}	https://sourceforge.net/projects/winmerge	\N	1	approved	2026-01-18 16:58:09.21993	\N	\N	Freeware	\N	\N	\N	software
2225	x64dbg	Debugger for Windows. 🪟 🟢	303	{Windows}	https://x64dbg.com	\N	1	approved	2026-01-18 16:58:09.220906	\N	\N	Freeware	\N	\N	\N	software
2203	ExplorerPatcher	Restores and enhances the classic taskbar and system elements. 🪟 [🟢](https://github.com/valinet/ExplorerPatcher)	256	{Windows}	https://github.com/valinet/ExplorerPatcher	\N	1	approved	2026-01-18 16:58:09.191954	\N	\N	Freeware	\N	\N	\N	api
2231	HTTP Toolkit	Tool for debugging and mocking HTTP requests. 🪟 🍎 🐧 [🟢](https://github.com/httptoolkit)	261	{Windows}	https://httptoolkit.com	\N	1	approved	2026-01-18 16:58:09.227369	\N	\N	Freeware	\N	\N	\N	software
2235	Paw	Advanced HTTP client. 🍎	261	{Windows}	https://paw.cloud	\N	1	approved	2026-01-18 16:58:09.230503	\N	\N	Freeware	\N	\N	\N	software
2239	Burp Suite Community Edition	Class-leading vulnerability scanning and web app security. 🪟 🍎 🐧	263	{Windows}	https://portswigger.net/burp/communitydownload	\N	1	approved	2026-01-18 16:58:09.235683	\N	\N	Freeware	\N	\N	\N	software
2240	Charles	Debugging proxy to view HTTP and HTTPS traffic. 🪟 🍎 🐧	263	{Windows}	https://charlesproxy.com	\N	1	approved	2026-01-18 16:58:09.236424	\N	\N	Freeware	\N	\N	\N	software
2241	James	Proxy for intercepting HTTP/HTTPS requests. 🪟 🍎 [🟢](https://github.com/james-proxy/james)	263	{Windows}	https://github.com/james-proxy/james	\N	1	approved	2026-01-18 16:58:09.237139	\N	\N	Freeware	\N	\N	\N	software
2242	Proxie	HTTP debugging proxy for tracking requests. 🍎	263	{Windows}	https://proxie.app	\N	1	approved	2026-01-18 16:58:09.238267	\N	\N	Freeware	\N	\N	\N	software
2243	Proxyman	Modern HTTP proxy with an intuitive UI. 🍎	263	{Windows}	https://proxyman.io	\N	1	approved	2026-01-18 16:58:09.239078	\N	\N	Freeware	\N	\N	\N	software
2244	Sniffnet	Tool for monitoring and analyzing network traffic. 🪟 🍎 🐧 [🟢](https://github.com/GyulyVGC/sniffnet)	263	{Windows}	https://sniffnet.net	\N	1	approved	2026-01-18 16:58:09.239975	\N	\N	Freeware	\N	\N	\N	software
2245	Godot	Game engine for 2D and 3D games with an easy-to-learn scripting language. 🪟 🍎 🐧 🟢 ⭐	264	{Windows}	https://godotengine.org	\N	1	approved	2026-01-18 16:58:09.241803	\N	\N	Freeware	\N	\N	\N	software
2246	Amazon Lumberyard	Free, cross-platform 3D game engine integrated with AWS and Twitch for multiplayer games. 🪟 🍎	264	{Windows}	https://aws.amazon.com/lumberyard	\N	1	approved	2026-01-18 16:58:09.242885	\N	\N	Freeware	\N	\N	\N	software
2247	AppGameKit	Flexible game engine for 2D and 3D games with simple scripting. 🪟 🍎 🐧	264	{Windows}	https://appgamekit.com	\N	1	approved	2026-01-18 16:58:09.24369	\N	\N	Freeware	\N	\N	\N	software
2248	Cocos2d	Game engine for mobile and web games, focused on 2D games. 🪟 🍎 🐧 🟢	264	{Windows}	https://www.cocos.com/en	\N	1	approved	2026-01-18 16:58:09.244514	\N	\N	Freeware	\N	\N	\N	software
2249	CryEngine	Advanced game engine with cutting-edge graphics and tools for creating visually stunning games. 🪟	264	{Windows}	https://cryengine.com	\N	1	approved	2026-01-18 16:58:09.245692	\N	\N	Freeware	\N	\N	\N	software
2250	Flixel	2D engine built with Haxe, suitable for platformers and action games. 🪟 🍎 🐧 🟢	264	{Windows}	https://flixel.org	\N	1	approved	2026-01-18 16:58:09.246459	\N	\N	Freeware	\N	\N	\N	software
2251	Gosu	Simple 2D game development library for Ruby or C++. 🪟 🍎 🐧	264	{Windows}	https://libgosu.org	\N	1	approved	2026-01-18 16:58:09.247515	\N	\N	Freeware	\N	\N	\N	software
2252	LÖVE	Simple, easy-to-learn 2D game engine for Lua. 🪟 🍎 🐧 🟢	264	{Windows}	https://github.com/love2d/love	\N	1	approved	2026-01-18 16:58:09.248255	\N	\N	Freeware	\N	\N	\N	software
2253	LÖVR	Simple 3D game engine for Lua, inspired by LÖVE. 🪟 🍎 🐧 🟢	264	{Windows}	https://github.com/bjornbytes/lovr	\N	1	approved	2026-01-18 16:58:09.249045	\N	\N	Freeware	\N	\N	\N	software
2254	Monogame	Framework for cross-platform game development with C#. 🪟 🍎 🐧 🟢	264	{Windows}	https://monogame.net	\N	1	approved	2026-01-18 16:58:09.249787	\N	\N	Freeware	\N	\N	\N	software
2255	PICO-8	Fantasy console for making retro-style small games. 🪟 🍎 🐧	264	{Windows}	https://lexaloffle.com/pico-8.php	\N	1	approved	2026-01-18 16:58:09.250829	\N	\N	Freeware	\N	\N	\N	software
2256	Ren'Py	Popular engine for creating visual novels with a simple scripting language. 🪟 🍎 🐧 🟢	264	{Windows}	https://github.com/renpy/renpy	\N	1	approved	2026-01-18 16:58:09.251545	\N	\N	Freeware	\N	\N	\N	software
2257	Pixel Game Maker MV	Game creation engine for 2D pixel games with no coding required. 🪟	264	{Windows}	https://rpgmakerofficial.com/product/act/en/index.html	\N	1	approved	2026-01-18 16:58:09.252508	\N	\N	Freeware	\N	\N	\N	software
2258	Roblox Studio	Engine for making games on Roblox. 🪟 🍎	264	{Windows}	https://create.roblox.com	\N	1	approved	2026-01-18 16:58:09.253194	\N	\N	Freeware	\N	\N	\N	software
2259	Scirra Construct	Powerful game engine with drag-and-drop and visual scripting for 2D games. 🪟 🍎 🐧	264	{Windows}	https://construct.net	\N	1	approved	2026-01-18 16:58:09.254058	\N	\N	Freeware	\N	\N	\N	software
2260	Lima	Tool for launching Linux VMs with file sharing and port forwarding. 🍎 🟢	265	{Windows}	https://github.com/lima-vm/lima	\N	1	approved	2026-01-18 16:58:09.257049	\N	\N	Freeware	\N	\N	\N	software
2261	Multipass	Quickly launch and manage Ubuntu virtual machines on demand. 🪟 🍎 🐧	265	{Windows}	https://multipass.run	\N	1	approved	2026-01-18 16:58:09.257862	\N	\N	Freeware	\N	\N	\N	software
2262	OrbStack	Lightweight and fast virtualization for running Docker containers and Linux machines. 🍎	265	{Windows}	https://orbstack.dev	\N	1	approved	2026-01-18 16:58:09.258612	\N	\N	Freeware	\N	\N	\N	software
2229	Hoppscotch	Lightweight API development tool for designing, testing, and debugging. 🪟 🍎 🐧 [🟢](https://github.com/hoppscotch/hoppscotch)	261	{Windows}	https://hoppscotch.io	\N	1	approved	2026-01-18 16:58:09.225738	\N	\N	Freeware	\N	\N	\N	api
2263	Podman Desktop	Desktop alternative to Docker for managing containers. 🪟 🍎 🐧	265	{Windows}	https://podman.io	\N	1	approved	2026-01-18 16:58:09.25933	\N	\N	Freeware	\N	\N	\N	software
2264	Rancher Desktop	App for managing containers and Kubernetes on desktop. 🪟 🍎 🐧 🟢	265	{Windows}	https://rancherdesktop.io	\N	1	approved	2026-01-18 16:58:09.260538	\N	\N	Freeware	\N	\N	\N	software
2265	UTM	GUI for QEMU to run various VMs including ARM64 and x64. 🍎	265	{Windows}	https://mac.getutm.app	\N	1	approved	2026-01-18 16:58:09.261274	\N	\N	Freeware	\N	\N	\N	software
2266	VMWare Workstation	Virtualization software with advanced features. 🪟 🍎 🐧	265	{Windows}	https://vmware.com/products/desktop-hypervisor/workstation-and-fusion	\N	1	approved	2026-01-18 16:58:09.262651	\N	\N	Freeware	\N	\N	\N	software
2267	eryph-zero	Tool for building VMs as if they were running in the cloud, but locally on Windows. 🪟 🟢	265	{Windows}	https://eryph.io	\N	1	approved	2026-01-18 16:58:09.263447	\N	\N	Freeware	\N	\N	\N	software
2269	Apache OpenOffice	Suite for documents, spreadsheets, etc. 🪟 🍎 🐧 🟢	267	{Windows}	https://openoffice.org	\N	1	approved	2026-01-18 16:58:09.267027	\N	\N	Freeware	\N	\N	\N	software
2270	Calligra Suite	Office suite with word processing and vector graphics. 🪟 🍎 🐧	267	{Windows}	https://calligra.org	\N	1	approved	2026-01-18 16:58:09.269092	\N	\N	Freeware	\N	\N	\N	software
2271	Collabora Online	Cloud-based LibreOffice for collaboration. 🪟 🍎 🐧	267	{Windows}	https://collaboraoffice.com	\N	1	approved	2026-01-18 16:58:09.275166	\N	\N	Freeware	\N	\N	\N	software
2272	FreeOffice	Suite with compatibility for MS Office formats. 🪟 🍎 🐧	267	{Windows}	https://freeoffice.com	\N	1	approved	2026-01-18 16:58:09.276753	\N	\N	Freeware	\N	\N	\N	software
2273	Google Workspace	Cloud-based suite for document collaboration. 🪟 🍎 🐧	267	{Windows}	https://workspace.google.com	\N	1	approved	2026-01-18 16:58:09.278014	\N	\N	Freeware	\N	\N	\N	software
2274	iChm	CHM reader. 🍎 [🟢](https://github.com/NSGod/ichm)	268	{Windows}	https://github.com/NSGod/ichm	\N	1	approved	2026-01-18 16:58:09.280464	\N	\N	Freeware	\N	\N	\N	software
2275	Kindle App	Official Kindle reader app. 🪟 🍎	268	{Windows}	https://amazon.com/l/16571048011	\N	1	approved	2026-01-18 16:58:09.281162	\N	\N	Freeware	\N	\N	\N	software
2276	Klib	Manage Kindle and iBooks highlights. 🍎	268	{Windows}	https://klib.me	\N	1	approved	2026-01-18 16:58:09.28191	\N	\N	Freeware	\N	\N	\N	software
2277	Koodo Reader	EBook reader supporting 15+ formats. 🪟 🍎 🐧 [🟢](https://github.com/koodo-reader/koodo-reader)	268	{Windows}	https://koodoreader.com/en	\N	1	approved	2026-01-18 16:58:09.282698	\N	\N	Freeware	\N	\N	\N	software
2278	Naps2	Scan documents to PDF and more, as simply as possible. 🪟 🍎 🐧 [🟢](https://github.com/cyanfish/naps2)	268	{Windows}	https://naps2.com	\N	1	approved	2026-01-18 16:58:09.28343	\N	\N	Freeware	\N	\N	\N	software
2279	Readest	Cross-platform eBook reader with tools. 🪟 🍎 🐧 [🟢](https://github.com/readest/readest)	268	{Windows}	https://readest.com	\N	1	approved	2026-01-18 16:58:09.284152	\N	\N	Freeware	\N	\N	\N	software
2280	Simple Comic	Reader for PDF, CBZ, and CBR formats. 🍎	268	{Windows}	https://apps.apple.com/us/app/simple-comic/id1497435571?mt=12	\N	1	approved	2026-01-18 16:58:09.285737	\N	\N	Freeware	\N	\N	\N	software
2281	Sumatra PDF	Fast, lightweight PDF reader. 🪟 [🟢](https://github.com/sumatrapdfreader/sumatrapdf) ⭐	269	{Windows}	https://sumatrapdfreader.org/free-pdf-reader	\N	1	approved	2026-01-18 16:58:09.287228	\N	\N	Freeware	\N	\N	\N	software
2282	Foxit PDF Reader	PDF viewer with annotations. 🪟 🍎	269	{Windows}	https://foxit.com/pdf-reader	\N	1	approved	2026-01-18 16:58:09.288227	\N	\N	Freeware	\N	\N	\N	software
2283	PDF24	Easy PDF tools. 🪟	269	{Windows}	https://pdf24.org/en	\N	1	approved	2026-01-18 16:58:09.290093	\N	\N	Freeware	\N	\N	\N	software
2284	Skim	PDF viewer for annotation. 🍎 [🟢](https://github.com/JackieXie168/skim)	269	{Windows}	https://skim-app.sourceforge.io	\N	1	approved	2026-01-18 16:58:09.291292	\N	\N	Freeware	\N	\N	\N	software
2285	Xournal++	Handwriting and annotation tool for PDFs. 🪟 🍎 🐧 [🟢](https://github.com/xournalpp/xournalpp)	269	{Windows}	https://xournalpp.github.io	\N	1	approved	2026-01-18 16:58:09.292118	\N	\N	Freeware	\N	\N	\N	software
2286	PDFGear	Read, edit, convert, merge, and sign PDF files across devices. 🪟 🍎	269	{Windows}	https://www.pdfgear.com	\N	1	approved	2026-01-18 16:58:09.292926	\N	\N	Freeware	\N	\N	\N	software
2293	Aurora Editor	Fast, lightweight editor with modern design and syntax highlighting. 🍎 [🟢](https://github.com/AuroraEditor/AuroraEditor)	271	{Windows}	https://auroraeditor.com	\N	1	approved	2026-01-18 16:58:09.329049	\N	\N	Freeware	\N	\N	\N	software
2294	CodeEdit	Native macOS editor with live preview, Git integration, and Markdown support. 🍎 [🟢](https://github.com/CodeEditApp/CodeEdit)	271	{Windows}	https://codeedit.app	\N	1	approved	2026-01-18 16:58:09.33109	\N	\N	Freeware	\N	\N	\N	software
2295	CotEditor	Text editor with syntax highlighting, snippets, and regular expression search. 🍎 [🟢](https://github.com/coteditor/CotEditor)	271	{Windows}	https://coteditor.com	\N	1	approved	2026-01-18 16:58:09.331994	\N	\N	Freeware	\N	\N	\N	software
2296	Fastedit	Minimal text editor with a frost glass background and basic text editing tools. 🪟 [🟢](https://github.com/FrozenAssassine/Fastedit)	271	{Windows}	https://fastedit.frozenassassine.de	\N	1	approved	2026-01-18 16:58:09.333163	\N	\N	Freeware	\N	\N	\N	software
2332	KoPlayer	Android emulator optimized for gaming and streaming. 🪟	275	{Windows}	https://koplayerpc.com	\N	1	approved	2026-01-18 16:58:09.371959	\N	\N	Freeware	\N	\N	\N	software
2288	Craft Docs	Beautiful and powerful tool for creating and organizing documents and notes. 🪟 🍎	111	{Windows}	https://craft.do	\N	1	approved	2026-01-18 16:58:09.298174	\N	\N	Freeware	\N	\N	\N	software
2289	Plain Text Editor	Simple, distraction-free text editor for quick note-taking. 🍎	111	{Windows}	https://sindresorhus.com/plain-text-editor	\N	1	approved	2026-01-18 16:58:09.29987	\N	\N	Freeware	\N	\N	\N	software
2290	Tot	Simple, elegant app for collecting and editing text snippets. 🍎	111	{Windows}	https://tot.rocks	\N	1	approved	2026-01-18 16:58:09.300792	\N	\N	Freeware	\N	\N	\N	software
2291	RemNote	Knowledge management app with note-taking and spaced repetition features. 🪟 🍎 🐧	111	{Windows}	https://remnote.io	\N	1	approved	2026-01-18 16:58:09.301646	\N	\N	Freeware	\N	\N	\N	software
2292	fylepad	Lightweight notepad with powerful rich-text editing. 🪟 🍎 🐧 [🟢](https://github.com/imrofayel/fylepad)	111	{Windows}	https://fylepad.vercel.app	\N	1	approved	2026-01-18 16:58:09.302781	\N	\N	Freeware	\N	\N	\N	software
2268	CDisplayEx	Lightweight comic book reader (.cbr, .cbz, .pdf, manga). 🪟	304	{Windows}	https://www.cdisplayex.com	\N	1	approved	2026-01-18 16:58:09.264814	\N	\N	Freeware	\N	\N	\N	software
2297	FluentEdit	Simple code editor with a Fluent design, featuring split view and customizable themes. 🪟	271	{Windows}	https://apps.microsoft.com/detail/9nwl9m9jpq36?hl=en-US&gl=BD	\N	1	approved	2026-01-18 16:58:09.334002	\N	\N	Freeware	\N	\N	\N	software
2298	Haystack Editor	Visual editor with a canvas UI to help navigate and understand code structure. 🪟 🍎 🐧 [🟢](https://github.com/haystackeditor/haystack-editor)	271	{Windows}	https://haystackeditor.com	\N	1	approved	2026-01-18 16:58:09.335496	\N	\N	Freeware	\N	\N	\N	software
2299	LightTable	Code editor offering real-time feedback and live execution of code in an interactive environment. 🪟 🍎 🐧 [🟢](https://github.com/LightTable/LightTable)	271	{Windows}	http://lighttable.com	\N	1	approved	2026-01-18 16:58:09.336964	\N	\N	Freeware	\N	\N	\N	software
2300	micro	Simple, modern terminal-based editor with support for mouse interaction and plugin extensions. 🪟 🍎 🐧 [🟢](https://github.com/zyedidia/micro)	271	{Windows}	https://micro-editor.github.io	\N	1	approved	2026-01-18 16:58:09.337871	\N	\N	Freeware	\N	\N	\N	software
2301	Notepad 3	Fast and light-weight Scintilla-based text editor with syntax highlighting. 🪟 [🟢](https://github.com/rizonesoft/Notepad3)	271	{Windows}	https://rizonesoft.com/downloads/notepad3	\N	1	approved	2026-01-18 16:58:09.339089	\N	\N	Freeware	\N	\N	\N	software
2302	Nova	Editor with an intuitive interface, fast navigation, and built-in Git support. 🍎	271	{Windows}	https://nova.app	\N	1	approved	2026-01-18 16:58:09.33988	\N	\N	Freeware	\N	\N	\N	software
2303	Sublime Text	Fast text editor with powerful search, multi-caret editing, and a strong plugin ecosystem. 🪟 🍎 🐧	271	{Windows}	https://www.sublimetext.com	\N	1	approved	2026-01-18 16:58:09.340769	\N	\N	Freeware	\N	\N	\N	software
2304	SubEthaEdit	Collaborative text editor enabling real-time editing with multiple users. 🍎 [🟢](https://github.com/subethaedit/SubEthaEdit)	271	{Windows}	https://subethaedit.net	\N	1	approved	2026-01-18 16:58:09.341954	\N	\N	Freeware	\N	\N	\N	software
2305	Vimr	Editor offering a refined Vim experience with enhanced UI and modern features. 🍎 [🟢](https://github.com/qvacua/vimr)	271	{Windows}	http://vimr.org	\N	1	approved	2026-01-18 16:58:09.343754	\N	\N	Freeware	\N	\N	\N	software
2306	Zed	High-performance, collaborative editor designed for speed, real-time collaboration, and custom workflows. 🍎 🐧 [🟢](https://github.com/zed-industries/zed)	271	{Windows}	https://zed.dev	\N	1	approved	2026-01-18 16:58:09.344484	\N	\N	Freeware	\N	\N	\N	software
2307	AB Download Manager	Easily download files from anywhere. 🪟 🐧 [🟢](https://github.com/amir1376/ab-download-manager) ⭐	272	{Windows}	https://abdownloadmanager.com	\N	1	approved	2026-01-18 16:58:09.345882	\N	\N	Freeware	\N	\N	\N	software
2308	Aria2	Lightweight, command-line download utility supporting multiple protocols. 🪟 🍎 🐧 [🟢](https://github.com/aria2/aria2)	272	{Windows}	https://aria2.github.io	\N	1	approved	2026-01-18 16:58:09.346975	\N	\N	Freeware	\N	\N	\N	software
2309	Download Master	Download manager by WestByte. 🪟	272	{Windows}	https://downloadmaster.com	\N	1	approved	2026-01-18 16:58:09.347753	\N	\N	Freeware	\N	\N	\N	software
2310	Persepolis Download Manager	GUI for Aria2, providing an intuitive interface. 🪟 🍎 🐧 [🟢](https://github.com/persepolisdm/persepolis)	272	{Windows}	https://persepolisdm.github.io	\N	1	approved	2026-01-18 16:58:09.349187	\N	\N	Freeware	\N	\N	\N	software
2311	Xtreme Download Manager (XDM)	Powerful tool to increase download speed. 🪟 🍎 🐧 [🟢](https://github.com/subhra74/xdm)	272	{Windows}	https://xtremedownloadmanager.com	\N	1	approved	2026-01-18 16:58:09.349942	\N	\N	Freeware	\N	\N	\N	software
2312	Amazon Games	Platform for Prime Gaming titles. 🪟	273	{Windows}	https://gaming.amazon.com	\N	1	approved	2026-01-18 16:58:09.3517	\N	\N	Freeware	\N	\N	\N	software
2313	Bethesda Launcher	Launcher for Fallout and Elder Scrolls. 🪟	273	{Windows}	https://bethesda.net/en/game/bethesda-launcher	\N	1	approved	2026-01-18 16:58:09.352783	\N	\N	Freeware	\N	\N	\N	software
2314	EA App	EA Origin alternative. 🪟	273	{Windows}	https://ea.com/ea-app	\N	1	approved	2026-01-18 16:58:09.353576	\N	\N	Freeware	\N	\N	\N	software
2315	Epic Games Store	Platform for exclusive and free games. 🪟 🍎	273	{Windows}	https://epicgames.com/store/en-US	\N	1	approved	2026-01-18 16:58:09.354289	\N	\N	Freeware	\N	\N	\N	software
2316	GOG Galaxy	DRM-free games and library management. 🪟 🍎	273	{Windows}	https://gog.com/galaxy	\N	1	approved	2026-01-18 16:58:09.355031	\N	\N	Freeware	\N	\N	\N	software
2317	Humble App	Launcher for Humble Bundle games. 🪟	273	{Windows}	https://humblebundle.com/app	\N	1	approved	2026-01-18 16:58:09.356197	\N	\N	Freeware	\N	\N	\N	software
2318	Itch.io	Marketplace for indie games. 🪟 🍎 🐧	273	{Windows}	https://itch.io/app	\N	1	approved	2026-01-18 16:58:09.356929	\N	\N	Freeware	\N	\N	\N	software
2319	Origin	EA game launcher. 🪟 🍎	273	{Windows}	https://origin.com	\N	1	approved	2026-01-18 16:58:09.357935	\N	\N	Freeware	\N	\N	\N	software
2320	Riot Client	Launcher for League of Legends and more. 🪟 🍎	273	{Windows}	https://riotgames.com/en	\N	1	approved	2026-01-18 16:58:09.358912	\N	\N	Freeware	\N	\N	\N	software
2321	Rockstar Games Launcher	Launcher for Rockstar games. 🪟	273	{Windows}	https://socialclub.rockstargames.com/rockstar-games-launcher	\N	1	approved	2026-01-18 16:58:09.359672	\N	\N	Freeware	\N	\N	\N	software
2322	Playnite	Unified game library manager. 🪟 [🟢](https://github.com/JosefNemec/Playnite/)	273	{Windows}	https://playnite.link	\N	1	approved	2026-01-18 16:58:09.360385	\N	\N	Freeware	\N	\N	\N	software
2323	Porting Kit	Install Windows games on Mac. 🍎	273	{Windows}	https://portingkit.com	\N	1	approved	2026-01-18 16:58:09.361467	\N	\N	Freeware	\N	\N	\N	software
2324	Ubisoft Connect	Game launcher for Ubisoft titles. 🪟 🍎	273	{Windows}	https://ubisoftconnect.com	\N	1	approved	2026-01-18 16:58:09.36224	\N	\N	Freeware	\N	\N	\N	software
2325	Antstream Arcade	Free tier with retro games playable via the cloud. 🪟 🍎 🐧	274	{Windows}	https://www.antstream.com	\N	1	approved	2026-01-18 16:58:09.363692	\N	\N	Freeware	\N	\N	\N	software
2326	Boosteroid	Free plan available for limited game streaming. 🪟 🍎 🐧	274	{Windows}	https://boosteroid.com	\N	1	approved	2026-01-18 16:58:09.364417	\N	\N	Freeware	\N	\N	\N	software
2327	NVIDIA GeForce NOW	Free tier for streaming supported games from the cloud. 🪟 🍎 🐧	274	{Windows}	https://www.nvidia.com/en-us/geforce-now	\N	1	approved	2026-01-18 16:58:09.365256	\N	\N	Freeware	\N	\N	\N	software
2328	Xbox Cloud Gaming	Free trial with limited titles via the cloud. 🪟 🍎	274	{Windows}	https://www.xbox.com/en-US/play	\N	1	approved	2026-01-18 16:58:09.366438	\N	\N	Freeware	\N	\N	\N	software
2329	BlueStacks	Android emulator for playing mobile games on PC. 🪟 🍎 ⭐	275	{Windows}	https://www.bluestacks.com	\N	1	approved	2026-01-18 16:58:09.367927	\N	\N	Freeware	\N	\N	\N	software
2330	Andy	Android emulator to run mobile games and apps on PC. 🪟 🍎	275	{Windows}	https://www.andyroid.net	\N	1	approved	2026-01-18 16:58:09.369332	\N	\N	Freeware	\N	\N	\N	software
2333	MEmu Play	Powerful Android emulator with excellent gaming support. 🪟	275	{Windows}	https://memuplay.com	\N	1	approved	2026-01-18 16:58:09.372725	\N	\N	Freeware	\N	\N	\N	software
2334	NoxPlayer	Android emulator optimized for mobile gaming on desktop. 🪟 🍎	275	{Windows}	https://bignox.com	\N	1	approved	2026-01-18 16:58:09.373554	\N	\N	Freeware	\N	\N	\N	software
2335	DOSBox	DOS emulator designed for running old DOS games and applications. 🪟 🍎 🐧	276	{Windows}	https://dosbox.com	\N	1	approved	2026-01-18 16:58:09.377657	\N	\N	Freeware	\N	\N	\N	software
2336	OpenEmu	Multi-system emulator with a clean interface and support for a variety of retro systems. 🍎	276	{Windows}	https://openemu.org	\N	1	approved	2026-01-18 16:58:09.379301	\N	\N	Freeware	\N	\N	\N	software
2337	higan	Multi-system emulator with high accuracy, supporting consoles like SNES and GBA. 🪟 🍎 🐧	276	{Windows}	https://higan.dev	\N	1	approved	2026-01-18 16:58:09.380738	\N	\N	Freeware	\N	\N	\N	software
2338	PCSX-Redux	PlayStation 1 emulator aimed at advanced debugging and better game compatibility. 🪟 🐧 🟢	276	{Windows}	https://github.com/grumpycoders/pcsx-redux	\N	1	approved	2026-01-18 16:58:09.381497	\N	\N	Freeware	\N	\N	\N	software
2339	Mednafen	Multi-system emulator with a focus on precision and compatibility. 🪟 🐧	276	{Windows}	https://mednafen.github.io	\N	1	approved	2026-01-18 16:58:09.382214	\N	\N	Freeware	\N	\N	\N	software
2340	BSNES	SNES emulator with cycle-accurate emulation for high compatibility. 🪟 🍎 🐧	276	{Windows}	https://bsnes.dev	\N	1	approved	2026-01-18 16:58:09.383323	\N	\N	Freeware	\N	\N	\N	software
2341	pngquant	Command-line tool for compressing PNG images without losing quality. 🪟 🍎 🐧	277	{Windows}	https://pngquant.org	\N	1	approved	2026-01-18 16:58:09.385741	\N	\N	Freeware	\N	\N	\N	software
2342	Alchemy	Experimental drawing application focused on conceptual art creation. 🪟 🍎 🐧	277	{Windows}	https://al.chemy.org	\N	1	approved	2026-01-18 16:58:09.386474	\N	\N	Freeware	\N	\N	\N	software
2343	Amadine	Intuitive vector drawing app aimed at graphic designers. 🍎	277	{Windows}	https://amadine.com	\N	1	approved	2026-01-18 16:58:09.38733	\N	\N	Freeware	\N	\N	\N	software
2344	Colorpicker	Color manipulation tool for picking and modifying colors. 🪟 🍎 🐧 🟢	277	{Windows}	https://colorpicker.fr	\N	1	approved	2026-01-18 16:58:09.388067	\N	\N	Freeware	\N	\N	\N	software
2345	Draw.io	Desktop app for creating diagrams and flowcharts. 🪟 🍎 🐧 🟢	277	{Windows}	https://github.com/jgraph/drawio-desktop	\N	1	approved	2026-01-18 16:58:09.38882	\N	\N	Freeware	\N	\N	\N	software
2346	Figma	Collaborative interface design tool for building UI/UX projects. 🪟 🍎 🐧	277	{Windows}	https://figma.com	\N	1	approved	2026-01-18 16:58:09.390038	\N	\N	Freeware	\N	\N	\N	software
2347	inklet	Use your Mac's trackpad as a drawing board for creative work. 🍎	277	{Windows}	https://tenonedesign.com/inklet.php	\N	1	approved	2026-01-18 16:58:09.391183	\N	\N	Freeware	\N	\N	\N	software
2348	macSVG	Design HTML5 SVG art and animations with this easy-to-use tool. 🍎	277	{Windows}	https://macsvg.org	\N	1	approved	2026-01-18 16:58:09.392212	\N	\N	Freeware	\N	\N	\N	software
2349	MagicaVoxel	Lightweight voxel editor and interactive path tracing renderer for 3D models. 🪟 🍎 🐧	277	{Windows}	https://ephtracy.github.io	\N	1	approved	2026-01-18 16:58:09.392969	\N	\N	Freeware	\N	\N	\N	software
2350	Monodraw	ASCII art editor for creating and editing text-based drawings. 🍎	277	{Windows}	https://monodraw.helftone.com	\N	1	approved	2026-01-18 16:58:09.393708	\N	\N	Freeware	\N	\N	\N	software
2351	Paintbrush	Bitmap image editor with basic drawing tools and pixel-level manipulation. 🪟	277	{Windows}	https://paintbrush.sourceforge.net	\N	1	approved	2026-01-18 16:58:09.394487	\N	\N	Freeware	\N	\N	\N	software
2352	Paint.NET	Simple yet powerful image editor for quick edits and designs. 🪟	277	{Windows}	https://getpaint.net/index.html	\N	1	approved	2026-01-18 16:58:09.395288	\N	\N	Freeware	\N	\N	\N	software
2353	PhotoFiltre	Complete image retouching program. 🪟	277	{Windows}	https://photofiltre-studio.com/pf7-en.htm	\N	1	approved	2026-01-18 16:58:09.39641	\N	\N	Freeware	\N	\N	\N	software
2354	Pencil2D	Simple and intuitive tool for creating 2D hand-drawn animations. 🪟 🍎 🐧	277	{Windows}	https://pencil2d.org	\N	1	approved	2026-01-18 16:58:09.397139	\N	\N	Freeware	\N	\N	\N	software
2355	Pixen	Native pixel art and animation editor designed. 🍎	277	{Windows}	https://pixenapp.com/mac	\N	1	approved	2026-01-18 16:58:09.397897	\N	\N	Freeware	\N	\N	\N	software
2356	MakeHuman	3D human modeler for creating realistic character models. 🪟 🍎 🐧 🟢	278	{Windows}	https://static.makehumancommunity.org/makehuman.html	\N	1	approved	2026-01-18 16:58:09.399996	\N	\N	Freeware	\N	\N	\N	software
2357	OpenSCAD	Script-based 3D CAD modeler for creating precise solid geometry. 🪟 🍎 🐧	278	{Windows}	https://openscad.org	\N	1	approved	2026-01-18 16:58:09.400741	\N	\N	Freeware	\N	\N	\N	software
2358	Wings 3D	3D modeling software focusing on subdivision modeling. 🪟 🍎 🐧 🟢	278	{Windows}	https://www.wings3d.com	\N	1	approved	2026-01-18 16:58:09.401435	\N	\N	Freeware	\N	\N	\N	software
2359	Avast	Antivirus to help detect and isolate potential cyberthreats. 🪟 🍎 🐧	279	{Windows}	https://avast.com/free-antivirus-download	\N	1	approved	2026-01-18 16:58:09.402834	\N	\N	Freeware	\N	\N	\N	software
2360	AVG Antivirus	Free antivirus software to protect against viruses, malware, and spyware. 🪟 🍎	279	{Windows}	https://avg.com/en-us/free-antivirus-download	\N	1	approved	2026-01-18 16:58:09.403595	\N	\N	Freeware	\N	\N	\N	software
2361	Bitdefender	Lightweight and powerful antivirus for essential protection. 🪟 🍎	279	{Windows}	https://bitdefender.com/solutions/free.html	\N	1	approved	2026-01-18 16:58:09.405318	\N	\N	Freeware	\N	\N	\N	software
2362	Pareto Security	Check for basic security hygiene of any Windows, Mac or Linux desktop. 🪟 🍎 🐧 [🟢](https://github.com/paretoSecurity/agent)	279	{Windows}	https://paretosecurity.com/apps	\N	1	approved	2026-01-18 16:58:09.407497	\N	\N	Freeware	\N	\N	\N	software
2363	Passbolt	Team-oriented password manager for sharing and storing passwords securely. 🪟 🍎 🐧 🟢	280	{Windows}	https://passbolt.com	\N	1	approved	2026-01-18 16:58:09.410663	\N	\N	Freeware	\N	\N	\N	software
2364	RoboForm	Password manager and form filler with multi-platform synchronization. 🪟 🍎 🐧	280	{Windows}	https://roboform.com	\N	1	approved	2026-01-18 16:58:09.411401	\N	\N	Freeware	\N	\N	\N	software
2365	ProtonPass	Free password manager with end-to-end encryption based in Switzerland. 🪟 🍎 🐧 [🟢](https://github.com/protonpass)	280	{Windows}	https://proton.me/pass	\N	1	approved	2026-01-18 16:58:09.412127	\N	\N	Freeware	\N	\N	\N	software
2366	ImageGlass	Lightweight, versatile image viewer. 🪟 🟢 ⭐	281	{Windows}	https://imageglass.org	\N	1	approved	2026-01-18 16:58:09.41349	\N	\N	Freeware	\N	\N	\N	software
2367	FlowVision	Waterfall-style image viewer. 🍎 🟢	281	{Windows}	https://github.com/netdcy/FlowVision	\N	1	approved	2026-01-18 16:58:09.41427	\N	\N	Freeware	\N	\N	\N	software
2369	JPEGView	Lean, fast and highly configurable viewer/editor for JPEG, BMP, PNG, WEBP, TGA, GIF and TIFF images. 🪟	281	{Windows}	https://sourceforge.net/projects/jpegview	\N	1	approved	2026-01-18 16:58:09.415802	\N	\N	Freeware	\N	\N	\N	software
2370	qView	Visually minimal and space efficient. 🪟 🍎 🐧	281	{Windows}	https://interversehq.com/qview	\N	1	approved	2026-01-18 16:58:09.416577	\N	\N	Freeware	\N	\N	\N	software
2371	XnView	Image resizer, batch image converter. 🪟 🍎 🐧	281	{Windows}	https://xnview.com/en	\N	1	approved	2026-01-18 16:58:09.417235	\N	\N	Freeware	\N	\N	\N	software
2372	Moonlight	GameStream client for Windows, Mac, Linux, and Steam Link. 🪟 🍎 🐧 🟢	282	{Windows}	https://github.com/moonlight-stream/moonlight-qt	\N	1	approved	2026-01-18 16:58:09.418849	\N	\N	Freeware	\N	\N	\N	software
2373	Parsec	High-performance remote desktop solution with 4k streaming at 60fps and low latency. 🪟 🍎 🐧	282	{Windows}	https://parsec.app	\N	1	approved	2026-01-18 16:58:09.419535	\N	\N	Freeware	\N	\N	\N	software
2374	RoyalTSX	Remote access tool for IT professionals, supporting multiple protocols. 🍎	282	{Windows}	https://royalapps.com/ts/mac/features	\N	1	approved	2026-01-18 16:58:09.420278	\N	\N	Freeware	\N	\N	\N	software
2375	RustDesk	Remote desktop software with a focus on simplicity and security. 🪟 🍎 🐧 🟢	282	{Windows}	https://rustdesk.com	\N	1	approved	2026-01-18 16:58:09.4212	\N	\N	Freeware	\N	\N	\N	software
2376	Steam Link	Play your Steam games across devices using the Steam Link app. 🪟 🍎 🐧	282	{Windows}	https://apps.apple.com/us/app/steam-link/id1246969117	\N	1	approved	2026-01-18 16:58:09.422199	\N	\N	Freeware	\N	\N	\N	software
2377	Sunshine	Self-hosted game streaming server for use with Moonlight. 🪟 🍎 🐧 🟢	282	{Windows}	https://github.com/LizardByte/Sunshine	\N	1	approved	2026-01-18 16:58:09.423178	\N	\N	Freeware	\N	\N	\N	software
2378	TeamViewer	Popular remote control software for desktop sharing and file transfer. 🪟 🍎 🐧	282	{Windows}	https://teamviewer.com/en	\N	1	approved	2026-01-18 16:58:09.423964	\N	\N	Freeware	\N	\N	\N	software
2379	Windows Remote Desktop	Connect to remote PCs, virtual apps, and desktops with ease. 🪟	282	{Windows}	https://apps.apple.com/us/app/windows-app/id1295203466	\N	1	approved	2026-01-18 16:58:09.425053	\N	\N	Freeware	\N	\N	\N	software
2380	wmWebStack	Local server stack with one-click live publishing and remote device access. 🪟	282	{Windows}	https://webstack.wikimint.com	\N	1	approved	2026-01-18 16:58:09.425802	\N	\N	Freeware	\N	\N	\N	software
2381	RemSupp	Simple remote desktop. 🪟 🍎 🐧	282	{Windows}	https://remsupp.com	\N	1	approved	2026-01-18 16:58:09.42687	\N	\N	Freeware	\N	\N	\N	software
2382	DaVinci Resolve	Professional video editor with advanced color correction and effects. 🪟 🍎 🐧 ⭐	284	{Windows}	https://blackmagicdesign.com/products/davinciresolve	\N	1	approved	2026-01-18 16:58:09.429041	\N	\N	Freeware	\N	\N	\N	software
2383	Capcut Desktop	Simple video editor with many builtin effects. 🪟 🍎	284	{Windows}	https://capcut.com/tools/desktop-video-editor	\N	1	approved	2026-01-18 16:58:09.430345	\N	\N	Freeware	\N	\N	\N	software
2384	VSDC Free Video Editor	Non-linear video editor with a rich set of editing tools. 🪟	284	{Windows}	https://videosoftdev.com/free-video-editor	\N	1	approved	2026-01-18 16:58:09.432312	\N	\N	Freeware	\N	\N	\N	software
2385	Olive Video Editor	Non-linear video editor with powerful features and an intuitive interface. 🪟 🍎 🐧 [🟢](https://github.com/olive-editor/olive)	284	{Windows}	https://olivevideoeditor.org	\N	1	approved	2026-01-18 16:58:09.433039	\N	\N	Freeware	\N	\N	\N	software
2386	Avidemux	Video editor designed for simple cutting, filtering and encoding tasks. 🪟 🍎 🐧 [🟢](https://github.com/mean00/avidemux2)	284	{Windows}	https://avidemux.sourceforge.net	\N	1	approved	2026-01-18 16:58:09.433753	\N	\N	Freeware	\N	\N	\N	software
2387	lossless-cut	Swiss army knife of lossless video/audio editing. 🪟 🍎 🐧 [🟢](https://github.com/mifi/lossless-cut)	284	{Windows}	https://losslesscut.app	\N	1	approved	2026-01-18 16:58:09.434445	\N	\N	Freeware	\N	\N	\N	software
2388	PotPlayer	Feature-rich video player with advanced playback options. 🪟 ⭐	285	{Windows}	https://potplayer.daum.net	\N	1	approved	2026-01-18 16:58:09.435684	\N	\N	Freeware	\N	\N	\N	software
2389	Clementine Player	Music and video player with a user-friendly interface. 🪟 🍎 🐧	285	{Windows}	https://www.clementine-player.org	\N	1	approved	2026-01-18 16:58:09.436924	\N	\N	Freeware	\N	\N	\N	software
2390	GOM Player	Popular media player with support for most video formats and customizable features. 🪟 🍎	285	{Windows}	https://gomlab.com/gomplayer-media-player	\N	1	approved	2026-01-18 16:58:09.437924	\N	\N	Freeware	\N	\N	\N	software
2391	IINA	Media player that claims to perform better than VLC. 🍎 🟢	285	{Windows}	https://iina.io	\N	1	approved	2026-01-18 16:58:09.43878	\N	\N	Freeware	\N	\N	\N	software
2392	KMPlayer	Media player supporting various video formats and streaming protocols. 🪟 🍎	285	{Windows}	https://kmplayer.com	\N	1	approved	2026-01-18 16:58:09.440711	\N	\N	Freeware	\N	\N	\N	software
2393	MPC-HC	Lightweight video player with support for all common formats. 🪟 🟢	285	{Windows}	https://github.com/clsid2/mpc-hc	\N	1	approved	2026-01-18 16:58:09.445724	\N	\N	Freeware	\N	\N	\N	software
2394	RealPlayer	Versatile media player for playing videos and streaming. 🪟 🍎	285	{Windows}	https://real.com	\N	1	approved	2026-01-18 16:58:09.446524	\N	\N	Freeware	\N	\N	\N	software
2395	ScreenBox	Basically VLC but with a modern UI. 🪟	285	{Windows}	https://apps.microsoft.com/detail/9ntsnmsvcb5l?hl=en-US&gl=US	\N	1	approved	2026-01-18 16:58:09.447729	\N	\N	Freeware	\N	\N	\N	software
2396	Videotape	Simple and minimalist video player for quick playback of local video files. 🪟	285	{Windows}	https://usuaia.com/videotape	\N	1	approved	2026-01-18 16:58:09.449024	\N	\N	Freeware	\N	\N	\N	software
2397	Livestreamer	Command-line tool to stream video from multiple platforms. 🪟 🍎 🐧 🟢	286	{Windows}	https://github.com/chrippa/livestreamer	\N	1	approved	2026-01-18 16:58:09.451357	\N	\N	Freeware	\N	\N	\N	software
2398	Kaltura	Platform for managing and streaming video content. 🪟 🍎 🐧 🟢	286	{Windows}	https://kaltura.com	\N	1	approved	2026-01-18 16:58:09.452075	\N	\N	Freeware	\N	\N	\N	software
2399	Nginx RTMP	RTMP streaming server built with NGINX. 🐧 🟢	286	{Windows}	https://github.com/arut/nginx-rtmp-module	\N	1	approved	2026-01-18 16:58:09.453056	\N	\N	Freeware	\N	\N	\N	software
2400	Streamlabs Desktop	Streaming software with customizable alerts and overlays. 🪟 🍎 🟢	286	{Windows}	https://streamlabs.com	\N	1	approved	2026-01-18 16:58:09.453787	\N	\N	Freeware	\N	\N	\N	software
2401	XSplit Broadcaster	Streaming and recording with advanced features and effects. 🪟	286	{Windows}	https://xsplit.com	\N	1	approved	2026-01-18 16:58:09.454544	\N	\N	Freeware	\N	\N	\N	software
2402	GPU Screen Recorder	Shadowplay-like screen recorder that is fast. 🐧	286	{Windows}	https://flathub.org/apps/com.dec05eba.gpu_screen_recorder	\N	1	approved	2026-01-18 16:58:09.45598	\N	\N	Freeware	\N	\N	\N	software
2403	Shadowplay	Record gameplay videos, screenshots, and livestreams. 🪟	286	{Windows}	https://www.nvidia.com/en-ph/geforce/geforce-experience/shadowplay	\N	1	approved	2026-01-18 16:58:09.456782	\N	\N	Freeware	\N	\N	\N	software
2404	ScreenToGif	Record, edit, and create animated GIFs from your screen. 🪟 [🟢](https://github.com/NickeManarin/ScreenToGif)	286	{Windows}	https://www.screentogif.com/	\N	1	approved	2026-01-18 16:58:09.457602	\N	\N	Freeware	\N	\N	\N	software
2405	Any Video Converter	Supports batch conversion and output to various formats. 🪟 🍎	287	{Windows}	https://any-video-converter.com	\N	1	approved	2026-01-18 16:58:09.459253	\N	\N	Freeware	\N	\N	\N	software
2406	FastFlix	GUI for fast encoding with H.264, HEVC, and AV1 support. 🪟 🟢	287	{Windows}	https://github.com/cdgriffith/FastFlix	\N	1	approved	2026-01-18 16:58:09.45994	\N	\N	Freeware	\N	\N	\N	software
2407	Format Factory	Converts video, audio, and images with customizable settings. 🪟	287	{Windows}	http://www.pcfreetime.com/formatfactory	\N	1	approved	2026-01-18 16:58:09.460614	\N	\N	Freeware	\N	\N	\N	software
2408	HandBrake	Video transcoder with preset profiles for device compatibility. 🪟 🍎 🐧 🟢	287	{Windows}	https://handbrake.fr	\N	1	approved	2026-01-18 16:58:09.46129	\N	\N	Freeware	\N	\N	\N	software
2409	Shutter Encoder	Supports video, audio, and image conversion with extra processing tools. 🪟 🍎	287	{Windows}	https://shutterencoder.com	\N	1	approved	2026-01-18 16:58:09.461936	\N	\N	Freeware	\N	\N	\N	software
2410	XMedia Recode	Multi-format converter with advanced video editing features. 🪟	287	{Windows}	https://xmedia-recode.de/en	\N	1	approved	2026-01-18 16:58:09.462583	\N	\N	Freeware	\N	\N	\N	software
2411	VidCoder	User-friendly HandBrake-based transcoder with batch processing. 🪟 🍎 🟢	287	{Windows}	https://vidcoder.net	\N	1	approved	2026-01-18 16:58:09.46323	\N	\N	Freeware	\N	\N	\N	software
2412	Algo	Simple IPSEC VPN setup for secure cloud connections. 🪟 🍎 🐧 🟢	288	{Windows}	https://github.com/trailofbits/algo	\N	1	approved	2026-01-18 16:58:09.46456	\N	\N	Freeware	\N	\N	\N	software
2413	Cloudflare WARP	VPN and DNS service enhancing privacy and security. 🪟 🍎 🐧	288	{Windows}	https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/download-warp	\N	1	approved	2026-01-18 16:58:09.465232	\N	\N	Freeware	\N	\N	\N	software
2414	FlClash	Multi-platform proxy client based on ClashMeta.  🪟 🍎 🐧 🟢	288	{Windows}	https://github.com/chen08209/FlClash	\N	1	approved	2026-01-18 16:58:09.465874	\N	\N	Freeware	\N	\N	\N	software
2415	Hiddify	Multi-platform proxy toolchain.  🪟 🍎 🐧 🟢	288	{Windows}	https://github.com/hiddify/hiddify-app	\N	1	approved	2026-01-18 16:58:09.4669	\N	\N	Freeware	\N	\N	\N	software
2416	rvc-mac	Secure VPN client from Ribose. 🍎 🟢	288	{Windows}	https://github.com/riboseinc/cryptode-mac	\N	1	approved	2026-01-18 16:58:09.467531	\N	\N	Freeware	\N	\N	\N	software
2418	Proxifier	Windows proxy client that routes applications via a proxy server. 🪟	288	{Windows}	https://proxifier.com	\N	1	approved	2026-01-18 16:58:09.469249	\N	\N	Freeware	\N	\N	\N	software
2419	Psiphon	VPN and proxy tool for bypassing censorship. 🪟 🍎	288	{Windows}	https://psiphon.ca	\N	1	approved	2026-01-18 16:58:09.469987	\N	\N	Freeware	\N	\N	\N	software
2420	SoftEther VPN	Multi-protocol VPN software for secure connections. 🪟 🟢	288	{Windows}	https://www.softether.org	\N	1	approved	2026-01-18 16:58:09.470858	\N	\N	Freeware	\N	\N	\N	software
2421	Sing-box	Universal proxy platform supporting multiple protocols. 🪟 🍎 🐧 🟢	288	{Windows}	https://github.com/SagerNet/sing-box	\N	1	approved	2026-01-18 16:58:09.472078	\N	\N	Freeware	\N	\N	\N	software
2422	ShadowsocksX-NG	Modern Shadowsocks client for enhanced security. 🍎 🟢	288	{Windows}	https://github.com/shadowsocks/ShadowsocksX-NG	\N	1	approved	2026-01-18 16:58:09.472824	\N	\N	Freeware	\N	\N	\N	software
2423	SpechtLite	Minimal proxy tool using rule-based configuration. 🍎 🟢	288	{Windows}	https://github.com/zhuhaow/SpechtLite	\N	1	approved	2026-01-18 16:58:09.47364	\N	\N	Freeware	\N	\N	\N	software
2424	Specht	Rule-based proxy with Network Extension support. 🍎 🟢	288	{Windows}	https://github.com/zhuhaow/Specht	\N	1	approved	2026-01-18 16:58:09.474361	\N	\N	Freeware	\N	\N	\N	software
2425	Twingate	Zero trust access for secure private network connections. 🪟 🍎 🐧	288	{Windows}	https://twingate.com	\N	1	approved	2026-01-18 16:58:09.475094	\N	\N	Freeware	\N	\N	\N	software
2426	Tunnelblick	Easy-to-use OpenVPN client with a macOS-friendly interface. 🍎 🟢	288	{Windows}	https://github.com/Tunnelblick/Tunnelblick	\N	1	approved	2026-01-18 16:58:09.475827	\N	\N	Freeware	\N	\N	\N	software
2427	v2rayN	Open source GUI for Xray and Sing-box. 🪟 🍎 🐧 🟢	288	{Windows}	https://github.com/2dust/v2rayN	\N	1	approved	2026-01-18 16:58:09.476522	\N	\N	Freeware	\N	\N	\N	software
2428	AutoHotkey	Scripting language for task automation and custom hotkeys. 🪟 [🟢](https://github.com/AutoHotkey/AutoHotkey) ⭐	289	{Windows}	https://autohotkey.com	\N	1	approved	2026-01-18 16:58:09.478176	\N	\N	Freeware	\N	\N	\N	software
2429	PowerToys	Utilities for file renaming, resizing, and productivity tools. 🪟 [🟢](https://github.com/microsoft/PowerToys) ⭐	289	{Windows}	https://learn.microsoft.com/en-us/windows/powertoys	\N	1	approved	2026-01-18 16:58:09.47892	\N	\N	Freeware	\N	\N	\N	software
2430	Advanced IP Scanner	Network scanner for detecting and analyzing devices on LAN. 🪟	289	{Windows}	https://advanced-ip-scanner.com	\N	1	approved	2026-01-18 16:58:09.479939	\N	\N	Freeware	\N	\N	\N	software
2431	CookCLI	Recipe manager with web server, shopping lists, and meal planning. 🪟 🍎 🐧 🟢	289	{Windows}	https://github.com/cooklang/CookCLI	\N	1	approved	2026-01-18 16:58:09.480642	\N	\N	Freeware	\N	\N	\N	software
2432	Fan Control	Software for managing and controlling system fans. 🪟	289	{Windows}	https://getfancontrol.com	\N	1	approved	2026-01-18 16:58:09.481401	\N	\N	Freeware	\N	\N	\N	software
2433	Keylock	Lock your keyboard with a click. 🪟 🟢	289	{Windows}	https://github.com/Axorax/keylock	\N	1	approved	2026-01-18 16:58:09.482079	\N	\N	Freeware	\N	\N	\N	software
2434	Legacy Update	Installs updates to fix Windows Update access on unsupported versions. 🪟	289	{Windows}	https://legacyupdate.net	\N	1	approved	2026-01-18 16:58:09.482902	\N	\N	Freeware	\N	\N	\N	software
2435	Locale Emulator	Simulate different system regions and languages. 🪟 🟢	289	{Windows}	https://github.com/xupefei/Locale-Emulator	\N	1	approved	2026-01-18 16:58:09.48472	\N	\N	Freeware	\N	\N	\N	software
2436	Nirsoft	Collection of small utilities for various tasks. 🪟	289	{Windows}	https://nirsoft.net/utils/index.html	\N	1	approved	2026-01-18 16:58:09.488502	\N	\N	Freeware	\N	\N	\N	software
2437	ProcessSpy	Native process monitor for macOS. 🍎	289	{Windows}	https://process-spy.app	\N	1	approved	2026-01-18 16:58:09.493478	\N	\N	Freeware	\N	\N	\N	software
2438	Twinkle Tray	Simple tool to manage brightness across multiple monitors. 🪟	289	{Windows}	https://twinkletray.com	\N	1	approved	2026-01-18 16:58:09.495319	\N	\N	Freeware	\N	\N	\N	software
2439	Rocket	Type and insert emojis anywhere using a colon (:). 🍎	289	{Windows}	https://matthewpalmer.net/rocket	\N	1	approved	2026-01-18 16:58:09.496337	\N	\N	Freeware	\N	\N	\N	software
2440	Winpower	Advanced power settings and management for Windows. 🪟 🟢	289	{Windows}	https://github.com/Axorax/winpower	\N	1	approved	2026-01-18 16:58:09.497252	\N	\N	Freeware	\N	\N	\N	software
2441	Windterm	SSH/Telnet/Serial/Shell/Sftp client for DevOps.  🪟 🍎 🐧 🟢	289	{Windows}	https://github.com/kingToolbox/WindTerm	\N	1	approved	2026-01-18 16:58:09.498104	\N	\N	Freeware	\N	\N	\N	software
2442	UniGetUI	UI for popular package managers like  Winget, NPM, and more. 🪟 [🟢](https://github.com/marticliment/UniGetUI)	289	{Windows}	https://www.marticliment.com/unigetui	\N	1	approved	2026-01-18 16:58:09.498982	\N	\N	Freeware	\N	\N	\N	software
2443	Saga Reader	Blazing-Fast AI Reader that supports sources based on search engines and RSS. 🪟 🍎 [🟢](https://github.com/sopaco/saga-reader)	289	{Windows}	https://github.com/sopaco/saga-reader	\N	1	approved	2026-01-18 16:58:09.499748	\N	\N	Freeware	\N	\N	\N	software
2444	ClipAngel	Clipboard manager supporting rich text and images. 🪟	290	{Windows}	https://sourceforge.net/projects/clip-angel	\N	1	approved	2026-01-18 16:58:09.50118	\N	\N	Freeware	\N	\N	\N	software
2445	Clipboard Fusion	Clipboard manager with data transformation features. 🪟 🍎	290	{Windows}	https://clipboardfusion.com	\N	1	approved	2026-01-18 16:58:09.501904	\N	\N	Freeware	\N	\N	\N	software
2446	Clipy	Simple clipboard manager. 🍎 🟢	290	{Windows}	https://clipy-app.com	\N	1	approved	2026-01-18 16:58:09.502735	\N	\N	Freeware	\N	\N	\N	software
2447	Diodon	Simple and minimal clipboard manager. 🐧 🟢	290	{Windows}	https://github.com/diodon-dev/diodon	\N	1	approved	2026-01-18 16:58:09.504192	\N	\N	Freeware	\N	\N	\N	software
2448	Ditto	Advanced clipboard manager with extended functionality for Windows. 🪟	290	{Windows}	https://ditto-cp.sourceforge.io	\N	1	approved	2026-01-18 16:58:09.504993	\N	\N	Freeware	\N	\N	\N	software
2449	EcoPaste	Cross-platform modern clipboard management tool.  🪟 🍎 🐧 🟢	290	{Windows}	https://github.com/EcoPasteHub/EcoPaste	\N	1	approved	2026-01-18 16:58:09.506244	\N	\N	Freeware	\N	\N	\N	software
2450	Maccy	Minimal clipboard manager. 🍎 🟢	290	{Windows}	https://maccy.app	\N	1	approved	2026-01-18 16:58:09.5071	\N	\N	Freeware	\N	\N	\N	software
2451	Parcellite	Basic clipboard manager. 🐧	290	{Windows}	https://parcellite.sourceforge.io	\N	1	approved	2026-01-18 16:58:09.507846	\N	\N	Freeware	\N	\N	\N	software
2452	Qopy	Minimalist clipboard manager with unique features. 🪟 🍎 🐧 🟢	290	{Windows}	https://github.com/0pandadev/qopy	\N	1	approved	2026-01-18 16:58:09.508703	\N	\N	Freeware	\N	\N	\N	software
2453	ExifTool	Command-line tool for editing metadata in various file types. 🪟 🍎 🐧 ⭐	291	{Windows}	https://exiftool.org	\N	1	approved	2026-01-18 16:58:09.510078	\N	\N	Freeware	\N	\N	\N	software
2454	Metadata++	View, edit, and remove metadata from files and photos. 🪟	291	{Windows}	https://metadata.en.softonic.com	\N	1	approved	2026-01-18 16:58:09.510852	\N	\N	Freeware	\N	\N	\N	software
2455	MP3Tag	Edit and manage metadata for audio files. 🪟	291	{Windows}	https://mp3tag.de/en	\N	1	approved	2026-01-18 16:58:09.511632	\N	\N	Freeware	\N	\N	\N	software
2456	PhotoME	View and edit EXIF metadata for photos. 🪟	291	{Windows}	https://photome.de	\N	1	approved	2026-01-18 16:58:09.512355	\N	\N	Freeware	\N	\N	\N	software
2457	FancyZones	Snap and arrange windows in multi-monitor setups. 🪟 🟢 ⭐	292	{Windows}	https://github.com/microsoft/PowerToys	\N	1	approved	2026-01-18 16:58:09.513657	\N	\N	Freeware	\N	\N	\N	software
2458	Rectangle	Efficient window manager with keyboard shortcut support. 🍎 ⭐	292	{Windows}	https://rectangleapp.com	\N	1	approved	2026-01-18 16:58:09.515538	\N	\N	Freeware	\N	\N	\N	software
2459	AltSnap	Snap windows to positions using keyboard shortcuts. 🪟 🟢	292	{Windows}	https://github.com/RamonUnch/AltSnap	\N	1	approved	2026-01-18 16:58:09.516329	\N	\N	Freeware	\N	\N	\N	software
2460	AquaSnap	Window snapping, docking, and stretching features. 🪟	292	{Windows}	https://nurgo-software.com/products/aquasnap	\N	1	approved	2026-01-18 16:58:09.517174	\N	\N	Freeware	\N	\N	\N	software
2461	GlazeWM	Tiling window manager inspired by i3. 🪟 🟢	292	{Windows}	https://github.com/glzr-io/glazewm	\N	1	approved	2026-01-18 16:58:09.517956	\N	\N	Freeware	\N	\N	\N	software
2462	i3	Keyboard-driven tiling window manager. 🐧 [🟢](https://github.com/i3/i3)	292	{Windows}	https://i3wm.org	\N	1	approved	2026-01-18 16:58:09.518727	\N	\N	Freeware	\N	\N	\N	software
2463	KDE Mover-Sizer	Move and resize windows like in Linux. 🪟	292	{Windows}	https://corz.org/windows/software/accessories/KDE-resizing-moving-for-Windows.php#section-Download	\N	1	approved	2026-01-18 16:58:09.519499	\N	\N	Freeware	\N	\N	\N	software
2464	KWin	Tiling window manager with advanced features. 🐧	292	{Windows}	https://kde.org/plasma-desktop	\N	1	approved	2026-01-18 16:58:09.520286	\N	\N	Freeware	\N	\N	\N	software
2465	Magnet	Snap windows into organized tiles. 🍎	292	{Windows}	https://apps.apple.com/us/app/magnet/id441258766?mt=12	\N	1	approved	2026-01-18 16:58:09.521481	\N	\N	Freeware	\N	\N	\N	software
2466	OnTopReplica	Display part of a window on top of others. 🪟 🟢	292	{Windows}	https://github.com/LorenzCK/OnTopReplica	\N	1	approved	2026-01-18 16:58:09.523138	\N	\N	Freeware	\N	\N	\N	software
2467	XMonad	Customizable tiling window manager. 🐧	292	{Windows}	https://xmonad.org	\N	1	approved	2026-01-18 16:58:09.524384	\N	\N	Freeware	\N	\N	\N	software
2468	YASB	Highly configurable Windows status bar. 🪟 🟢	292	{Windows}	https://github.com/amnweb/yasb	\N	1	approved	2026-01-18 16:58:09.525202	\N	\N	Freeware	\N	\N	\N	software
2469	Everything	Fast file search tool indexing the entire file system. 🪟 ⭐	293	{Windows}	https://voidtools.com	\N	1	approved	2026-01-18 16:58:09.526972	\N	\N	Freeware	\N	\N	\N	software
2470	Far Manager	File and archive manager with advanced functionality. 🪟	293	{Windows}	https://farmanager.com	\N	1	approved	2026-01-18 16:58:09.528229	\N	\N	Freeware	\N	\N	\N	software
2471	Files	Modern file manager for easy file organization. 🪟 [🟢](https://github.com/files-community/Files)	293	{Windows}	https://files.community/download	\N	1	approved	2026-01-18 16:58:09.528982	\N	\N	Freeware	\N	\N	\N	software
2472	Free Commander	Alternative file manager with added features. 🪟	293	{Windows}	https://freecommander.com/en/summary	\N	1	approved	2026-01-18 16:58:09.529736	\N	\N	Freeware	\N	\N	\N	software
2473	Listary	Free file search tool & app launcher. 🪟	293	{Windows}	https://www.listary.com	\N	1	approved	2026-01-18 16:58:09.530892	\N	\N	Freeware	\N	\N	\N	software
2474	Q-Dir	Multi-pane file manager with up to four directory views. 🪟	293	{Windows}	https://softwareok.com/?seite=Freeware/Q-Dir	\N	1	approved	2026-01-18 16:58:09.531892	\N	\N	Freeware	\N	\N	\N	software
2475	Xftp 7	Flexible SFTP/FTP client for efficient file transfers. 🪟	293	{Windows}	https://netsarang.com/en/xftp	\N	1	approved	2026-01-18 16:58:09.533095	\N	\N	Freeware	\N	\N	\N	software
2476	Bulk Crap Uninstaller	Powerful tool for uninstalling multiple applications and cleaning leftovers. 🪟 🟢 ⭐	294	{Windows}	https://www.bcuninstaller.com	\N	1	approved	2026-01-18 16:58:09.534897	\N	\N	Freeware	\N	\N	\N	software
2477	Revo Uninstaller	Advanced uninstaller to remove programs and residual files with free tier. 🪟	294	{Windows}	https://www.revouninstaller.com/revo-uninstaller-free-download	\N	1	approved	2026-01-18 16:58:09.535623	\N	\N	Freeware	\N	\N	\N	software
2478	Capter	Super simple screenshot tool. 🪟 🍎 🟢	295	{Windows}	https://github.com/decipher3114/Capter	\N	1	approved	2026-01-18 16:58:09.537942	\N	\N	Freeware	\N	\N	\N	software
2479	Greenshot	Screenshot tool for Windows that allows capturing, annotating, and editing screenshots. 🪟 🟢	295	{Windows}	https://getgreenshot.org	\N	1	approved	2026-01-18 16:58:09.539559	\N	\N	Freeware	\N	\N	\N	software
2480	Lightshot	Fast and intuitive screenshot tool that allows capturing and editing images instantly. 🪟 🍎	295	{Windows}	https://app.prntscr.com/en/index.html	\N	1	approved	2026-01-18 16:58:09.540721	\N	\N	Freeware	\N	\N	\N	software
2481	Monosnap	Simple screenshot tool that includes cloud integration for easy sharing. 🪟 🍎	295	{Windows}	https://monosnap.com	\N	1	approved	2026-01-18 16:58:09.541767	\N	\N	Freeware	\N	\N	\N	software
2482	Pixpin	Elegant screen capture with an integrated editor. 🪟	295	{Windows}	https://pixpin.cn	\N	1	approved	2026-01-18 16:58:09.54298	\N	\N	Freeware	\N	\N	\N	software
2483	Snipaste	Free, Customizable, Portable snipping tool.	295	{Windows}	https://snipaste.com	\N	1	approved	2026-01-18 16:58:09.544077	\N	\N	Freeware	\N	\N	\N	software
2484	WizTree	Fast disk space analyzer that scans drives and shows file size distribution. 🪟 ⭐	296	{Windows}	https://diskanalyzer.com	\N	1	approved	2026-01-18 16:58:09.545976	\N	\N	Freeware	\N	\N	\N	software
2485	DiskSavvy	Disk space analyzer with various reporting and filtering options. 🪟	296	{Windows}	https://disksavvy.com	\N	1	approved	2026-01-18 16:58:09.557057	\N	\N	Freeware	\N	\N	\N	software
2486	JDiskReport	Tool for visualizing disk usage with a variety of charts and graphs. 🪟 🐧	296	{Windows}	https://www.jgoodies.com/freeware/jdiskreport	\N	1	approved	2026-01-18 16:58:09.562567	\N	\N	Freeware	\N	\N	\N	software
2487	SpaceSniffer	Identify large files and folders with an intuitive tree map. 🪟	296	{Windows}	http://www.uderzo.it/main_products/space_sniffer	\N	1	approved	2026-01-18 16:58:09.563555	\N	\N	Freeware	\N	\N	\N	software
2488	TreeSize Free	Visualizes disk space usage in a tree-like structure for easy file management. 🪟	296	{Windows}	https://jam-software.com/treesize_free	\N	1	approved	2026-01-18 16:58:09.564423	\N	\N	Freeware	\N	\N	\N	software
2489	AudioNodes	Modular audio production suite with multi-track audio mixing, audio effects, parameter automation, MIDI editing, synthesis, cloud production, and more.	298	{Windows}	https://audionodes.com/	\N	1	approved	2026-01-18 17:15:00.587071	\N	\N	Freeware	\N	\N	\N	software
2490	CDex	CD Ripper (French site, English program).	298	{Windows}	http://www.cdex.fr/	\N	1	approved	2026-01-18 17:15:00.597122	\N	\N	Freeware	\N	\N	\N	software
2491	Dopamine	An audio player which tries to make organizing and listening to music as simple and pretty as possible.	298	{Windows}	http://www.digimezzo.com/software/dopamine/	\N	1	approved	2026-01-18 17:15:00.598757	\N	\N	Freeware	\N	\N	\N	software
2492	Exact Audio Copy	Transfer files from your CDs to your PC in almost every format.Comes with some pretty nifty features too.	298	{Windows}	http://www.exactaudiocopy.de/	\N	1	approved	2026-01-18 17:15:00.600341	\N	\N	Unknown	\N	\N	\N	software
2493	K-Lite Codecs	Collection of DirectShow filters, VFW/ACM codecs, and tools.	298	{Windows}	http://www.codecguide.com/download_kl.htm	\N	1	approved	2026-01-18 17:15:00.602582	\N	\N	Freeware	\N	\N	\N	software
2494	Musicbee	Like iTunes but better than iTunes.	298	{Windows}	http://getmusicbee.com/	\N	1	approved	2026-01-18 17:15:00.60512	\N	\N	Unknown	\N	\N	\N	software
2495	Resonic	Fast and free audio player.	298	{Windows}	https://resonic.at/	\N	1	approved	2026-01-18 17:15:00.607631	\N	\N	Unknown	\N	\N	\N	software
2496	WACUP	An extension/improvement to Winamp, providing bugfixes and more features such as a better MOD player and YouTube support.	298	{Windows}	https://getwacup.com/preview	\N	1	approved	2026-01-18 17:15:00.608759	\N	\N	Freeware	\N	\N	\N	software
2497	Winamp	Music player capable of playing MP3s, MP2s, WAVs, VOCs and MIDI files.	298	{Windows}	http://www.winamp.com/	\N	1	approved	2026-01-18 17:15:00.609867	\N	\N	Freeware	\N	\N	\N	software
2498	Hexchat	IRC client based on XChat [](https://hexchat.github.io/)	299	{Windows}	https://hexchat.github.io/	\N	1	approved	2026-01-18 17:15:00.61267	\N	\N	Open Source	\N	\N	\N	software
2499	LimeChat	Instant messaging application.	299	{Windows}	http://limechat.net	\N	1	approved	2026-01-18 17:15:00.61358	\N	\N	Freeware	\N	\N	\N	software
2500	mIRC	An Internet Relay Chat (IRC) client.	299	{Windows}	http://www.mirc.com/	\N	1	approved	2026-01-18 17:15:00.614462	\N	\N	Unknown	\N	\N	\N	software
2501	Quassel	Quassel IRC is a modern, cross-platform, distributed IRC client. [](http://quassel-irc.org/)	299	{Windows}	http://quassel-irc.org/	\N	1	approved	2026-01-18 17:15:00.615501	\N	\N	Open Source	\N	\N	\N	software
2502	Riot	A decentralised encrypted comms app for the Matrix.org ecosystem. [](https://github.com/vector-im/riot-web)	299	{Windows}	https://about.riot.im/	\N	1	approved	2026-01-18 17:15:00.616342	\N	\N	Open Source	\N	\N	\N	software
2503	Waow	Awesome WhatsApp Web Client to deliver you the best WhatsApp experience.	299	{Windows}	http://dedg3.com/wao/	\N	1	approved	2026-01-18 17:15:00.617721	\N	\N	Freeware	\N	\N	\N	software
2504	7+ Taskbar Tweaker	Allows to customize and extend Windows taskbar functionality with various productivity enhancements.	301	{Windows}	http://rammichael.com/7-taskbar-tweaker	\N	1	approved	2026-01-18 17:15:00.622896	\N	\N	Freeware	\N	\N	\N	software
2505	Classic Start	Use Start Menu and Explorer like it's 2000. [](https://github.com/passionate-coder/Classic-Start)	301	{Windows}	https://github.com/passionate-coder/Classic-Start	\N	1	approved	2026-01-18 17:15:00.623896	\N	\N	Open Source	\N	\N	\N	software
2506	Clover	Add multi-tab functionality to Windows Explorer.	301	{Windows}	http://en.ejie.me/	\N	1	approved	2026-01-18 17:15:00.624896	\N	\N	Freeware	\N	\N	\N	software
2507	QTTabBar	Extends Explorer by tabs and extra folder views.	301	{Windows}	http://qttabbar.wikidot.com/	\N	1	approved	2026-01-18 17:15:00.626564	\N	\N	Freeware	\N	\N	\N	software
2508	TranslucentTB	Make your Windows task bar transparent. [](https://github.com/TranslucentTB/TranslucentTB)	301	{Windows}	https://github.com/TranslucentTB/TranslucentTB	\N	1	approved	2026-01-18 17:15:00.628726	\N	\N	Open Source	\N	\N	\N	software
2509	Windows 10 Login Background Changer	Lets you change the Windows 10 login screen background. [](https://github.com/PFCKrutonium/Windows-10-Login-Background-Changer)	301	{Windows}	https://github.com/PFCKrutonium/Windows-10-Login-Background-Changer	\N	1	approved	2026-01-18 17:15:00.629624	\N	\N	Open Source	\N	\N	\N	software
2510	ZBar	If you use multiple monitors, it lets you display a separate taskbar on each monitor.	301	{Windows}	https://www.zhornsoftware.co.uk/archive/index.html#zbar	\N	1	approved	2026-01-18 17:15:00.630511	\N	\N	Unknown	\N	\N	\N	software
2511	Data Rescue	Comprehensive and professional Hard drive recovery software that can recover your photos, videos, documents.	302	{Windows}	https://www.prosofteng.com/datarescuepc3/	\N	1	approved	2026-01-18 17:15:00.632763	\N	\N	Unknown	\N	\N	\N	software
2512	Ontrach EasyRecovery	Has filtering tools to help sort the large amount of data the software can recover.	302	{Windows}	http://www.krollontrack.com/data-recovery/recovery-software/	\N	1	approved	2026-01-18 17:15:00.633617	\N	\N	Unknown	\N	\N	\N	software
2513	PartitionGuru ｜ Eassos Recovery	Data recovery with partition recovery.	302	{Windows}	http://www.eassos.com/	\N	1	approved	2026-01-18 17:15:00.634493	\N	\N	Freeware	\N	\N	\N	software
2514	Recuva	Recover your deleted files quickly and easily.	302	{Windows}	https://www.piriform.com/recuva	\N	1	approved	2026-01-18 17:15:00.635372	\N	\N	Unknown	\N	\N	\N	software
2515	Stellar Phoenix Windows Data Recovery	Remote recovery option to recover data from another computer over a network.	302	{Windows}	http://www.stellarinfo.com/windows-data-recovery.php	\N	1	approved	2026-01-18 17:15:00.636236	\N	\N	Unknown	\N	\N	\N	software
2516	Cacher	Cloud-based, team-enabled code snippet manager with Gist sync, VSCode/Atom/Sublime packages and full-featured web client.	303	{Windows}	https://www.cacher.io/	\N	1	approved	2026-01-18 17:15:00.638251	\N	\N	Unknown	\N	\N	\N	software
2517	DB Browser for SQLite	High quality, visual, open source tool to create, design, and edit database files compatible with SQLite [](http://sqlitebrowser.org/)	303	{Windows}	http://sqlitebrowser.org/	\N	1	approved	2026-01-18 17:15:00.639124	\N	\N	Open Source	\N	\N	\N	software
2519	Fiddler	Web debugging proxy.	303	{Windows}	http://www.telerik.com/fiddler	\N	1	approved	2026-01-18 17:15:00.641042	\N	\N	Unknown	\N	\N	\N	software
2520	Fork	A fast & friendly Git client for Windows (and Mac).	303	{Windows}	https://git-fork.com/	\N	1	approved	2026-01-18 17:15:00.642548	\N	\N	Freeware	\N	\N	\N	software
2521	Git Extensions	A powerful and easy to use UI for Git. [](https://github.com/gitextensions/gitextensions)	303	{Windows}	https://gitextensions.github.io/	\N	1	approved	2026-01-18 17:15:00.643735	\N	\N	Open Source	\N	\N	\N	software
2522	GitHub Desktop	GitHub Desktop is an open source Electron-based GitHub app. [](https://github.com/desktop/desktop)	303	{Windows}	https://desktop.github.com/	\N	1	approved	2026-01-18 17:15:00.644597	\N	\N	Open Source	\N	\N	\N	software
2523	HeidiSQL	Powerful and easy client for MySQL, MariaDB, Microsoft SQL Server and PostgreSQL.	303	{Windows}	http://www.heidisql.com/	\N	1	approved	2026-01-18 17:15:00.646046	\N	\N	Unknown	\N	\N	\N	software
2525	Keylord	Cross-platform GUI client for Redis, LevelDB and Memcached key-value databases.	303	{Windows}	https://protonail.com/products/keylord	\N	1	approved	2026-01-18 17:15:00.64874	\N	\N	Unknown	\N	\N	\N	software
2526	Mamp	Local server environment.	303	{Windows}	https://www.mamp.info/en/	\N	1	approved	2026-01-18 17:15:00.649562	\N	\N	Freeware	\N	\N	\N	software
2527	NSudo	A Powerful System Administration Tool. [](https://github.com/M2Team/NSudo/)	303	{Windows}	https://github.com/M2Team/NSudo/	\N	1	approved	2026-01-18 17:15:00.650717	\N	\N	Open Source	\N	\N	\N	software
2528	Open Server	Portable server platform and software environment (like MAMP, XAMPP, WAMP and very user friendly).	303	{Windows}	https://ospanel.io/	\N	1	approved	2026-01-18 17:15:00.651565	\N	\N	Freeware	\N	\N	\N	software
2529	Pixie	A simple color picker for developers.	303	{Windows}	http://www.nattyware.com/pixie.php	\N	1	approved	2026-01-18 17:15:00.652368	\N	\N	Unknown	\N	\N	\N	software
2530	PostgreSQL Database	A comprehensive list of tools.	303	{Windows}	http://wiki.postgresql.org/wiki/Community_Guide_to_PostgreSQL_GUI_Tools	\N	1	approved	2026-01-18 17:15:00.653529	\N	\N	Unknown	\N	\N	\N	software
2531	Process Explorer	A powerful task manager.	303	{Windows}	https://technet.microsoft.com/en-us/sysinternals/processexplorer.aspx	\N	1	approved	2026-01-18 17:15:00.6546	\N	\N	Freeware	\N	\N	\N	software
2532	Process Hacker	Excellent full blown task manager.	303	{Windows}	http://processhacker.sourceforge.net/	\N	1	approved	2026-01-18 17:15:00.655443	\N	\N	Unknown	\N	\N	\N	software
2533	Process Monitor	A sysinternal tool shows real-time file system, Registry, network and process/thread activity.	303	{Windows}	https://docs.microsoft.com/en-us/sysinternals/downloads/procmon	\N	1	approved	2026-01-18 17:15:00.656261	\N	\N	Freeware	\N	\N	\N	software
2534	RazorSQL	A GUI for managing SQLite databases which requires major work.	303	{Windows}	http://www.razorsql.com/	\N	1	approved	2026-01-18 17:15:00.657099	\N	\N	Unknown	\N	\N	\N	software
2535	Redis Desktop Manager	Cross-platform open source Redis DB management tool.	303	{Windows}	http://redisdesktop.com/	\N	1	approved	2026-01-18 17:15:00.657915	\N	\N	Unknown	\N	\N	\N	software
2536	Robo 3T	A lightweight GUI for MongoDB enthusiasts.	303	{Windows}	https://robomongo.org/	\N	1	approved	2026-01-18 17:15:00.658826	\N	\N	Unknown	\N	\N	\N	software
2537	Sql Wave	A MySQL database manager.	303	{Windows}	http://www.valentina-db.com/en/sqlwave	\N	1	approved	2026-01-18 17:15:00.660082	\N	\N	Unknown	\N	\N	\N	software
2538	SSLyog	A powerful MySQL administration tool	303	{Windows}	https://www.webyog.com/	\N	1	approved	2026-01-18 17:15:00.661063	\N	\N	Unknown	\N	\N	\N	software
2539	TailBlazer	A small fast tool for browsing through logs [](https://github.com/RolandPheasant/TailBlazer)	303	{Windows}	https://github.com/RolandPheasant/TailBlazer	\N	1	approved	2026-01-18 17:15:00.661947	\N	\N	Open Source	\N	\N	\N	software
2540	TortoiseGit	Git client with full shell integration. [](https://github.com/tortoisegit/tortoisegit/)	303	{Windows}	https://tortoisegit.org/	\N	1	approved	2026-01-18 17:15:00.662751	\N	\N	Open Source	\N	\N	\N	software
2541	Tower	Tower - the most powerful Git client for Mac and Windows.	303	{Windows}	https://www.git-tower.com/windows	\N	1	approved	2026-01-18 17:15:00.663718	\N	\N	Unknown	\N	\N	\N	software
2543	Visual Studio	Ultimate Microsoft Developer Tool.	303	{Windows}	https://www.visualstudio.com/	\N	1	approved	2026-01-18 17:15:00.666049	\N	\N	Unknown	\N	\N	\N	software
2544	Wamp	Web development environment.	303	{Windows}	http://www.wampserver.com/en/	\N	1	approved	2026-01-18 17:15:00.666985	\N	\N	Unknown	\N	\N	\N	software
2613	Carnac	The easiest way to record keystrokes during any screen recording.	315	{Windows}	http://code52.org/carnac/	\N	1	approved	2026-01-18 17:15:00.751683	\N	\N	Unknown	\N	\N	\N	software
2545	WMI Explorer	Provides the ability to browse and view WMI namespaces/classes/instances/properties in a single pane of view. [](https://github.com/vinaypamnani/wmie2/)	303	{Windows}	https://github.com/vinaypamnani/wmie2/	\N	1	approved	2026-01-18 17:15:00.668614	\N	\N	Open Source	\N	\N	\N	software
2546	Xampp	Apache driven web development environment.	303	{Windows}	https://www.apachefriends.org/index.html	\N	1	approved	2026-01-18 17:15:00.66949	\N	\N	Freeware	\N	\N	\N	software
2547	Xftp 5	Flexible and lightweight SFTP/FTP client.	303	{Windows}	https://www.netsarang.com/products/xfp_overview.html	\N	1	approved	2026-01-18 17:15:00.670295	\N	\N	Freeware	\N	\N	\N	software
2548	Microsoft Office	Microsoft's own productivity suite.	304	{Windows}	http://www.office.com	\N	1	approved	2026-01-18 17:15:00.672814	\N	\N	Unknown	\N	\N	\N	software
2549	NitroPDF	The best PDF Reader you'll ever get.	304	{Windows}	https://www.gonitro.com/pdf-reader	\N	1	approved	2026-01-18 17:15:00.673637	\N	\N	Unknown	\N	\N	\N	software
2550	OpenOffice	Software suite for word processing, spreadsheets, presentations, graphics, databases and more. [](http://openoffice.apache.org/source.html)	304	{Windows}	https://www.openoffice.org/	\N	1	approved	2026-01-18 17:15:00.674721	\N	\N	Open Source	\N	\N	\N	software
2558	Gimp	Open source image editor. [](http://www.gimp.org/source/)	308	{Windows}	http://www.gimp.org/	\N	1	approved	2026-01-18 17:15:00.690527	\N	\N	Open Source	\N	\N	\N	software
2559	Paint.net	how can you live without paint.net?	308	{Windows}	http://www.getpaint.net/index.html	\N	1	approved	2026-01-18 17:15:00.6923	\N	\N	Freeware	\N	\N	\N	software
2565	IntelliJ IDEA	A modern Java IDE with free community edition. [](https://github.com/JetBrains/intellij-community)	310	{Windows}	https://www.jetbrains.com/idea/	\N	1	approved	2026-01-18 17:15:00.702199	\N	\N	Open Source	\N	\N	\N	software
2566	NetBeans IDE	A free and open-source IDE. [](https://netbeans.org/community/sources/)	310	{Windows}	https://netbeans.org/	\N	1	approved	2026-01-18 17:15:00.703067	\N	\N	Open Source	\N	\N	\N	software
2567	PhpStorm	Lightning-smart PHP IDE with major frameworks support.	310	{Windows}	https://www.jetbrains.com/phpstorm/	\N	1	approved	2026-01-18 17:15:00.703824	\N	\N	Unknown	\N	\N	\N	software
2568	PyCharm	Python IDE for professional developers with free community edition. [](https://github.com/JetBrains/intellij-community/tree/master/python)	310	{Windows}	https://www.jetbrains.com/pycharm	\N	1	approved	2026-01-18 17:15:00.704581	\N	\N	Open Source	\N	\N	\N	software
2569	Rider	A cross-platform .NET/Mono IDE.	310	{Windows}	https://www.jetbrains.com/rider/	\N	1	approved	2026-01-18 17:15:00.705336	\N	\N	Unknown	\N	\N	\N	software
2570	WebStorm	A smart JavaScript IDE that uses the full power of the modern JavaScript ecosystem.	310	{Windows}	https://www.jetbrains.com/webstorm/	\N	1	approved	2026-01-18 17:15:00.706812	\N	\N	Unknown	\N	\N	\N	software
2571	pCloud	A swiss based privacy first cloud provider. Also offers one time payment lifetime plans.	311	{Windows}	https://www.pcloud.com	\N	1	approved	2026-01-18 17:15:00.709281	\N	\N	Unknown	\N	\N	\N	software
2572	Sync	Encrypted file storage that stores all files in canadian datacenters	311	{Windows}	https://www.sync.com/	\N	1	approved	2026-01-18 17:15:00.710273	\N	\N	Unknown	\N	\N	\N	software
2573	Mega	Encrypted file storage.	311	{Windows}	https://mega.nz/	\N	1	approved	2026-01-18 17:15:00.711042	\N	\N	Unknown	\N	\N	\N	software
2574	Mozy	Mozy for Windows	311	{Windows}	https://mozy.com/product/download	\N	1	approved	2026-01-18 17:15:00.711802	\N	\N	Unknown	\N	\N	\N	software
2575	Arq	Backs up your files to your own cloud account (Amazon Cloud Drive, AWS, Dropbox, Google Drive, Google Cloud Storage, OneDrive, and SFTP).	312	{Windows}	https://www.arqbackup.com/	\N	1	approved	2026-01-18 17:15:00.714067	\N	\N	Unknown	\N	\N	\N	software
2576	Bvckup 2	Light, versatile data replication software.	312	{Windows}	https://bvckup2.com/	\N	1	approved	2026-01-18 17:15:00.714836	\N	\N	Unknown	\N	\N	\N	software
2577	Aperture Control	Windows environment automation tool with a number of [premade recipes](https://github.com/Lieturd/aperture-control-recipes) and [examples](https://github.com/Lieturd/aperture-control-example) available. [](https://github.com/Lieturd/aperture-control)	313	{Windows}	https://github.com/Lieturd/aperture-control	\N	1	approved	2026-01-18 17:15:00.716497	\N	\N	Open Source	\N	\N	\N	software
2578	Cold Turkey	The only blocker for distracting websites that actually works. (even doesn't let you uninstall it when blocking is active).	313	{Windows}	https://getcoldturkey.com	\N	1	approved	2026-01-18 17:15:00.718011	\N	\N	Unknown	\N	\N	\N	software
2554	Freeciv	A Free and Open Source empire-building strategy game inspired by the history of human civilization. [](https://github.com/freeciv/)	273	{Windows}	http://www.freeciv.org/	\N	1	approved	2026-01-18 17:15:00.684355	\N	\N	Open Source	\N	\N	\N	software
2555	GOG	DRM-free game store with a lot of old games but also has a rich collection of new games.	273	{Windows}	https://www.gog.com/	\N	1	approved	2026-01-18 17:15:00.685472	\N	\N	Unknown	\N	\N	\N	software
2557	Warsow	Free & fast-paced FPS game for Windows.	273	{Windows}	https://www.warsow.net/	\N	1	approved	2026-01-18 17:15:00.688762	\N	\N	Freeware	\N	\N	\N	software
2551	Bookviser	Awesome application for Windows 8 devices to read eBooks in a simple way.	27	{Windows}	http://apps.microsoft.com/windows/en-us/app/bookviser-reader/42d4527a-b1fe-479b-ad04-150303dc056f	\N	1	approved	2026-01-18 17:15:00.677306	\N	\N	Freeware	\N	\N	\N	software
2552	kobo	Incredibly ugly but powerful software for ebook management and conversion.	27	{Windows}	https://www.kobo.com/desktop	\N	1	approved	2026-01-18 17:15:00.678418	\N	\N	Freeware	\N	\N	\N	software
2560	GVim	(G)Vim is a highly configurable text editor built to enable efficient text editing. [](https://github.com/vim/vim)	271	{Windows}	http://www.vim.org/download.php#pc	\N	1	approved	2026-01-18 17:15:00.695252	\N	\N	Open Source	\N	\N	\N	software
2561	Light Table	A customizable editor with instant feedback and showing data values flow through your code. [](https://github.com/LightTable/LightTable)	271	{Windows}	http://lighttable.com/	\N	1	approved	2026-01-18 17:15:00.696039	\N	\N	Open Source	\N	\N	\N	software
2562	Notepad2	Tiny and fast Notepad replacement with many useful features.	271	{Windows}	http://www.flos-freeware.ch/notepad2.html	\N	1	approved	2026-01-18 17:15:00.69743	\N	\N	Open Source	\N	\N	\N	software
2563	Oni	Modern Modal Editing - powered by Neovim [](https://github.com/onivim/oni)	271	{Windows}	http://onivim.io/	\N	1	approved	2026-01-18 17:15:00.698213	\N	\N	Open Source	\N	\N	\N	software
2564	Sublime Text 3	The sophisticated text editor.	271	{Windows}	http://www.sublimetext.com/3	\N	1	approved	2026-01-18 17:15:00.699342	\N	\N	Unknown	\N	\N	\N	software
2579	CommandTrayHost	A Command Line program monitor systray for Windows. [](https://github.com/rexdf/CommandTrayHost)	313	{Windows}	https://github.com/rexdf/CommandTrayHost	\N	1	approved	2026-01-18 17:15:00.718724	\N	\N	Open Source	\N	\N	\N	software
2580	Easy Window Switcher	Switch between application instances, fast.	313	{Windows}	https://neosmart.net/EasySwitch/	\N	1	approved	2026-01-18 17:15:00.720197	\N	\N	Unknown	\N	\N	\N	software
2581	Executor.dk	A free multi purpose customizable and light-weight launcher.	313	{Windows}	http://executor.dk/	\N	1	approved	2026-01-18 17:15:00.721313	\N	\N	Freeware	\N	\N	\N	software
2583	File Juggler	Organize files automatically. Monitor folders and execute actions like rename, delete, unzip and more. Finds dates in PDFs and much more.	313	{Windows}	https://www.filejuggler.com/	\N	1	approved	2026-01-18 17:15:00.723133	\N	\N	Unknown	\N	\N	\N	software
2584	KatMouse	Utility that enables "universal scrolling" in Windows: scrolling does not need the window to be active/clicked first (i.e. how it works in macOS and Linux)	313	{Windows}	http://www.ehiti.de/katmouse/	\N	1	approved	2026-01-18 17:15:00.724609	\N	\N	Freeware	\N	\N	\N	software
2585	Keypirinha	A fast launcher for keyboard ninjas on Windows. You can think of Keypirinha as an alternative to _Launchy_ and a cousin of _Alfred_.	313	{Windows}	http://keypirinha.com/	\N	1	approved	2026-01-18 17:15:00.72533	\N	\N	Freeware	\N	\N	\N	software
2586	Launchy	The Open Source Keystroke Launcher. [](https://github.com/OpenNingia/Launchy)	313	{Windows}	http://www.launchy.net/	\N	1	approved	2026-01-18 17:15:00.726038	\N	\N	Open Source	\N	\N	\N	software
2587	Luna	Automatic dark mode for Windows 10.	313	{Windows}	https://github.com/adrianmteo/Luna	\N	1	approved	2026-01-18 17:15:00.727126	\N	\N	Unknown	\N	\N	\N	software
2588	MultiCommander	File Manager for Professionals.	313	{Windows}	http://multicommander.com/	\N	1	approved	2026-01-18 17:15:00.727832	\N	\N	Freeware	\N	\N	\N	software
2589	Ninite	The easiest, fastest way to update or install software.	313	{Windows}	https://ninite.com/	\N	1	approved	2026-01-18 17:15:00.728592	\N	\N	Freeware	\N	\N	\N	software
2590	One Commander	File manager featuring miller columns and dual-pane views.	313	{Windows}	http://onecommander.com/	\N	1	approved	2026-01-18 17:15:00.729313	\N	\N	Freeware	\N	\N	\N	software
2591	Scoop	A command-line installer for Windows. [](https://github.com/lukesampson/scoop)	313	{Windows}	https://github.com/lukesampson/scoop	\N	1	approved	2026-01-18 17:15:00.730291	\N	\N	Open Source	\N	\N	\N	software
2592	Total Commander	The best file manager for Windows.	313	{Windows}	https://www.ghisler.com/	\N	1	approved	2026-01-18 17:15:00.731829	\N	\N	Unknown	\N	\N	\N	software
2593	WordWeb	A very good English dictionary for windows.	313	{Windows}	http://wordweb.info/	\N	1	approved	2026-01-18 17:15:00.732575	\N	\N	Freeware	\N	\N	\N	software
2594	Wox	An effective launcher for windows. [](https://github.com/Wox-launcher/Wox/)	313	{Windows}	http://www.wox.one/	\N	1	approved	2026-01-18 17:15:00.733371	\N	\N	Open Source	\N	\N	\N	software
2607	A-Z of Windows Terminal Commands	A-Z of Windows Terminal Commands for Windows	315	{Windows}	http://ss64.com/nt/	\N	1	approved	2026-01-18 17:15:00.746711	\N	\N	Unknown	\N	\N	\N	software
2608	Acrosync	The only native rsync client for Windows (no cygwin required). It supports automatic uploads on file changes and incremental hourly backups.	315	{Windows}	https://acrosync.com/windows.html	\N	1	approved	2026-01-18 17:15:00.747727	\N	\N	Unknown	\N	\N	\N	software
2609	AddToSendTo	This script lets you add your favorite Folder to Send To option, when you right-click. [](https://aashutoshrathi.github.io/Python-Scripts-and-Games/AddToSendTo/)	315	{Windows}	https://aashutoshrathi.github.io/Python-Scripts-and-Games/AddToSendTo/	\N	1	approved	2026-01-18 17:15:00.748501	\N	\N	Open Source	\N	\N	\N	software
2610	Advanced Renamer	Advanced batch renaming program, with support for renaming based on GPS data from images, ID3 tags from music files, TV show data and regular expressions.	315	{Windows}	https://www.advancedrenamer.com/	\N	1	approved	2026-01-18 17:15:00.749328	\N	\N	Freeware	\N	\N	\N	software
2611	Bandicam	Recording software allowing easy video recording of both desktop and 3D apps simultaneously.	315	{Windows}	https://www.bandicam.com	\N	1	approved	2026-01-18 17:15:00.750087	\N	\N	Unknown	\N	\N	\N	software
2612	BCUninstaller	Bulk Crap Uninstaller - A free and open-source app uninstaller. Remove large amounts of unwanted applications quickly. [](https://github.com/Klocman/Bulk-Crap-Uninstaller)	315	{Windows}	https://www.bcuninstaller.com/	\N	1	approved	2026-01-18 17:15:00.750832	\N	\N	Open Source	\N	\N	\N	software
2596	Cmder	Console emulator package with clink shell. [](https://github.com/cmderdev/cmder)	37	{Windows}	https://cmder.net	\N	1	approved	2026-01-18 17:15:00.736027	\N	\N	Open Source	\N	\N	\N	software
2598	ConEmu	Customizable terminal with tabs, splits, quake-style and more.	37	{Windows}	https://github.com/Maximus5/ConEmu	\N	1	approved	2026-01-18 17:15:00.73746	\N	\N	Unknown	\N	\N	\N	software
2599	ConsoleZ	Modified version of Console 2 for a better experience and a better visual rendering.	37	{Windows}	https://github.com/cbucher/console	\N	1	approved	2026-01-18 17:15:00.738181	\N	\N	Unknown	\N	\N	\N	software
2600	FluentTerminal	A Terminal Emulator based on UWP and web technologies.	37	{Windows}	https://github.com/felixse/FluentTerminal	\N	1	approved	2026-01-18 17:15:00.738956	\N	\N	Unknown	\N	\N	\N	software
2601	MobaXterm	Xserver and tabbed SSH client.	37	{Windows}	http://mobaxterm.mobatek.net/	\N	1	approved	2026-01-18 17:15:00.740355	\N	\N	Unknown	\N	\N	\N	software
2602	mRemoteNG	The next generation of mRemote, open source, tabbed, multi-protocol, remote connections manager. [](https://mremoteng.org/)	37	{Windows}	https://mremoteng.org/	\N	1	approved	2026-01-18 17:15:00.741097	\N	\N	Open Source	\N	\N	\N	software
2603	MTPuTTY	Multi-Tabbed PuTTY.	37	{Windows}	http://ttyplus.com/multi-tabbed-putty/	\N	1	approved	2026-01-18 17:15:00.741871	\N	\N	Unknown	\N	\N	\N	software
2604	Putty	SSH and telnet client.	37	{Windows}	http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html	\N	1	approved	2026-01-18 17:15:00.743286	\N	\N	Unknown	\N	\N	\N	software
2605	Terminus	modern, highly configurable terminal app based on web technologies. [](https://github.com/Eugeny/terminus)	37	{Windows}	https://eugeny.github.io/terminus/	\N	1	approved	2026-01-18 17:15:00.744028	\N	\N	Open Source	\N	\N	\N	software
2606	Windows Terminal	Microsoft's official new terminal for Windows. [](https://github.com/microsoft/terminal)	37	{Windows}	https://www.microsoft.com/en-us/p/windows-terminal-preview/9n0dx20hk701	\N	1	approved	2026-01-18 17:15:00.745278	\N	\N	Open Source	\N	\N	\N	software
2582	EyeRest	A lightweight Windows tray application that gently reminds you to follow the 20–20–20 rule:	313	{Windows}	https://github.com/necdetsanli/EyeRest	\N	1	approved	2026-01-18 17:15:00.722075	\N	\N	Unknown	\N	\N	\N	api
2614	CleanMyPC	A clean computer in no time.	315	{Windows}	http://macpaw.com/cleanmypc	\N	1	approved	2026-01-18 17:15:00.752429	\N	\N	Unknown	\N	\N	\N	software
2615	Econap	Prevent sleep mode while your system is busy.	315	{Windows}	https://econap.de	\N	1	approved	2026-01-18 17:15:00.753502	\N	\N	Freeware	\N	\N	\N	software
2616	Ext2Fsd	Open source ext3/4 file system driver for Windows. [](https://github.com/matt-wu/Ext3Fsd)	315	{Windows}	http://www.ext2fsd.com/	\N	1	approved	2026-01-18 17:15:00.754198	\N	\N	Open Source	\N	\N	\N	software
2617	Far	File and Archive manager. Clone of the Norton Commander. [](http://sourceforge.net/projects/farmanager/)	315	{Windows}	http://www.farmanager.com/index.php?l=en	\N	1	approved	2026-01-18 17:15:00.755193	\N	\N	Open Source	\N	\N	\N	software
2618	FileOptimizer	A lossless file size optimizer supporting a wide array of formats.	315	{Windows}	https://nikkhokkho.sourceforge.io/static.php?page=FileOptimizer	\N	1	approved	2026-01-18 17:15:00.755903	\N	\N	Unknown	\N	\N	\N	software
2619	Fraps	Video game capture screen recorder that can be used with all games using DirectX or OpenGL technology.	315	{Windows}	http://www.fraps.com/	\N	1	approved	2026-01-18 17:15:00.756663	\N	\N	Unknown	\N	\N	\N	software
2620	fselect	Command-line tool to search files with SQL-like queries.	315	{Windows}	https://github.com/jhspetersson/fselect	\N	1	approved	2026-01-18 17:15:00.757668	\N	\N	Unknown	\N	\N	\N	software
2621	GPU-Z	A free all-in-one GPU monitoring tool.	315	{Windows}	http://www.techpowerup.com/gpuz/	\N	1	approved	2026-01-18 17:15:00.758706	\N	\N	Freeware	\N	\N	\N	software
2622	HTTrack	Offline browser utility, allowing you to download a website from the Internet to a local directory. [](https://github.com/xroche/httrack/tree/master)	315	{Windows}	https://www.httrack.com/page/2/en/index.html	\N	1	approved	2026-01-18 17:15:00.759864	\N	\N	Open Source	\N	\N	\N	software
2623	IrfanView	A very fast, small, compact and innovative graphic viewer for Windows.	315	{Windows}	http://www.irfanview.com/	\N	1	approved	2026-01-18 17:15:00.760877	\N	\N	Unknown	\N	\N	\N	software
2624	LICEcap	Animated screen captures and save them directly to .GIF	315	{Windows}	http://www.cockos.com/licecap/	\N	1	approved	2026-01-18 17:15:00.761586	\N	\N	Unknown	\N	\N	\N	software
2625	LightBulb	Reduces eyestrain by adjusting gamma based on the current time	315	{Windows}	https://github.com/Tyrrrz/LightBulb	\N	1	approved	2026-01-18 17:15:00.762286	\N	\N	Unknown	\N	\N	\N	software
2626	Link Shell Extension	Create symlinks from Explorer.	315	{Windows}	http://schinagl.priv.at/nt/hardlinkshellext/hardlinkshellext.html	\N	1	approved	2026-01-18 17:15:00.762976	\N	\N	Unknown	\N	\N	\N	software
2627	PowerPlanSwitcher	Provides a quick UI for switching power schemas & automatic switch on AC-plug-in on Windows10. [](https://github.com/petrroll/PowerSwitcher)	315	{Windows}	https://www.microsoft.com/en-us/store/p/powerplanswitcher/9nblggh556l3	\N	1	approved	2026-01-18 17:15:00.76373	\N	\N	Open Source	\N	\N	\N	software
2628	Retroshare	A platform for secure communications and file sharing between friends. [](https://github.com/RetroShare/RetroShare)	315	{Windows}	https://retroshare.cc/	\N	1	approved	2026-01-18 17:15:00.765594	\N	\N	Open Source	\N	\N	\N	software
2629	rimraf	A deep deletion module for node. Help to delete files and folders with very long paths	315	{Windows}	https://www.npmjs.com/package/rimraf	\N	1	approved	2026-01-18 17:15:00.766386	\N	\N	Unknown	\N	\N	\N	software
2630	Rufus	Create bootable USB drives the easy way.	315	{Windows}	https://rufus.akeo.ie/	\N	1	approved	2026-01-18 17:15:00.7673	\N	\N	Unknown	\N	\N	\N	software
2631	SDelete	A command line utility that can securely delete a file, or clean the slack space.	315	{Windows}	https://technet.microsoft.com/en-us/sysinternals/sdelete.aspx	\N	1	approved	2026-01-18 17:15:00.768108	\N	\N	Unknown	\N	\N	\N	software
2632	SetToStartup	This script will help you to add your favorite programs or self made scripts/folders to startup. [](https://aashutoshrathi.github.io/Python-Scripts-and-Games/SetToStartup/)	315	{Windows}	https://aashutoshrathi.github.io/Python-Scripts-and-Games/SetToStartup/	\N	1	approved	2026-01-18 17:15:00.768867	\N	\N	Open Source	\N	\N	\N	software
2633	Snipping Tool	/ [Snip & Sketch](https://support.microsoft.com/en-us/help/4488540/windows-10-how-to-take-and-annotate-screenshots) - Windows 10 utility to easily capture and edit selected area in screen.	315	{Windows}	https://support.microsoft.com/en-in/help/13776/windows-use-snipping-tool-to-capture-screenshots	\N	1	approved	2026-01-18 17:15:00.769877	\N	\N	Unknown	\N	\N	\N	software
2634	SpaceMonger	A graphical utility to display folders and files in blocks relative to their disk usage.	315	{Windows}	https://spacemonger.en.softonic.com/download	\N	1	approved	2026-01-18 17:15:00.77171	\N	\N	Unknown	\N	\N	\N	software
2635	Speccy	Detailed statistics on every piece of hardware in your computer.	315	{Windows}	https://www.piriform.com/speccy	\N	1	approved	2026-01-18 17:15:00.772483	\N	\N	Unknown	\N	\N	\N	software
2636	Sysinternals Suite	Tool suite by Mark Russinovich that provides access to Windows internals for troubleshooting: processes, physical ports, disk activity etc.	315	{Windows}	https://technet.microsoft.com/en-us/sysinternals/bb842062	\N	1	approved	2026-01-18 17:15:00.773571	\N	\N	Unknown	\N	\N	\N	software
2637	ueli	A powerful keystroke launcher for Windows.	315	{Windows}	https://ueli.app/#/	\N	1	approved	2026-01-18 17:15:00.774359	\N	\N	Unknown	\N	\N	\N	software
2638	Unlocker	Unlock files Windows won't let you delete	315	{Windows}	http://www.softpedia.com/get/System/System-Miscellaneous/Unlocker.shtml	\N	1	approved	2026-01-18 17:15:00.775975	\N	\N	Unknown	\N	\N	\N	software
2639	Waltr	Transfer any movie or music file to your iPhone w/o iTunes.	315	{Windows}	http://softorino.com/waltr/	\N	1	approved	2026-01-18 17:15:00.776748	\N	\N	Unknown	\N	\N	\N	software
2640	WinDirStat	It is a disk usage statistics viewer and cleanup too.	315	{Windows}	https://windirstat.info/	\N	1	approved	2026-01-18 17:15:00.777492	\N	\N	Unknown	\N	\N	\N	software
2641	WindowsWidgets	Application for adding and managing customizable desktop widgets for Windows 10 and 11. [](https://github.com/emretulek/WindowsWidgets)	315	{Windows}	https://github.com/emretulek/WindowsWidgets	\N	1	approved	2026-01-18 17:15:00.778212	\N	\N	Open Source	\N	\N	\N	software
2642	Windows 10 Login Screen Changer	Changes the Windows 10 Login Screen Background. [](https://github.com/PFCKrutonium/Windows-10-Login-Background-Changer)	315	{Windows}	https://github.com/PFCKrutonium/Windows-10-Login-Background-Changer/releases/	\N	1	approved	2026-01-18 17:15:00.778937	\N	\N	Open Source	\N	\N	\N	software
2644	Yacy	A general search engine by corporations of people, including the search web page, general crawlers, indexing, and ranking functions.[](https://github.com/yacy/yacy_search_server)	315	{Windows}	https://github.com/yacy/yacy_search_server	\N	1	approved	2026-01-18 17:15:00.781047	\N	\N	Open Source	\N	\N	\N	software
862	Tcpdump	TCP Debugging/Capture Tool.	263	{linux}	https://www.tcpdump.org/#source	\N	13	approved	2026-01-17 17:04:29.302895	\N	\N	Open Source	\N	https://www.tcpdump.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
2645	ZoomIt	It is a screen zoom and annotation tool for technical presentations. It runs unobtrusively in the tray and activates with customizable hotkeys to zoom in on an area of the screen, move around while zoomed, and draw on the zoomed image.	315	{Windows}	https://technet.microsoft.com/en-us/sysinternals/zoomit.aspx	\N	1	approved	2026-01-18 17:15:00.782299	\N	\N	Unknown	\N	\N	\N	software
2647	Win10-Initial-Setup-Script	Powershell script to turn off or on various defaults in Windows	318	{Windows}	https://github.com/Disassembler0/Win10-Initial-Setup-Script	\N	1	approved	2026-01-18 17:15:00.790269	\N	\N	Unknown	\N	\N	\N	software
2648	Acrylic DNS Proxy	A local DNS proxy which caches the responses coming from your DNS servers and helps you fight unwanted ads through a custom HOSTS file.	319	{Windows}	http://mayakron.altervista.org/wikibase/show.php?id=AcrylicHome	\N	1	approved	2026-01-18 17:15:00.791872	\N	\N	Freeware	\N	\N	\N	software
2649	AdwCleaner	Free removal tool for adware, PUP/LPI, Toolbars and Hijacker.	319	{Windows}	https://toolslib.net/downloads/viewdownload/1-adwcleaner/	\N	1	approved	2026-01-18 17:15:00.792785	\N	\N	Freeware	\N	\N	\N	software
2650	Disable Data Logging	Make Windows 10 more private and safe.	319	{Windows}	https://www.reddit.com/r/Windows10/comments/3f38ed/guide_how_to_disable_data_logging_in_w10	\N	1	approved	2026-01-18 17:15:00.794467	\N	\N	Freeware	\N	\N	\N	software
2651	ENCRYPTO	Encrypt your files in an elegant way.	319	{Windows}	http://macpaw.com/encrypto	\N	1	approved	2026-01-18 17:15:00.795383	\N	\N	Freeware	\N	\N	\N	software
2652	GlassWire	Network security monitoring tool and analyzer that visualizes your network activity.	319	{Windows}	https://www.glasswire.com/	\N	1	approved	2026-01-18 17:15:00.796491	\N	\N	Unknown	\N	\N	\N	software
2653	IIS Crypto	A utility for configuring encryption protocols, cyphers, hashing methods, and key exchanges for Windows components (eg TLS/AES/SHA for Remote Desktop)	319	{Windows}	https://www.nartac.com/Products/IISCrypto	\N	1	approved	2026-01-18 17:15:00.797487	\N	\N	Unknown	\N	\N	\N	software
2654	NetLimiter	Internet traffic control and monitoring tool.	319	{Windows}	https://www.netlimiter.com	\N	1	approved	2026-01-18 17:15:00.79951	\N	\N	Freeware	\N	\N	\N	software
2655	SpyBot	Search and destroy malware, spyware and viruses.	319	{Windows}	https://www.safer-networking.org/	\N	1	approved	2026-01-18 17:15:00.804114	\N	\N	Freeware	\N	\N	\N	software
2656	System Explorer	An enhanced task manager with support for monitoring and modifying system processes, start-up programs, system services, drivers, shell extensions, and more.	319	{Windows}	http://systemexplorer.net	\N	1	approved	2026-01-18 17:15:00.805635	\N	\N	Unknown	\N	\N	\N	software
2657	Tor Project	Enable anonymous communication. [](https://github.com/TheTorProject)	319	{Windows}	https://www.torproject.org/	\N	1	approved	2026-01-18 17:15:00.806359	\N	\N	Open Source	\N	\N	\N	software
2658	UnChecky	automatically unchecks unrelated offers from installers.	319	{Windows}	https://unchecky.com/	\N	1	approved	2026-01-18 17:15:00.807117	\N	\N	Unknown	\N	\N	\N	software
2659	Viscosity	Fully-featured OpenVPN client, ready for enterprise deployment.	319	{Windows}	https://www.sparklabs.com/viscosity/	\N	1	approved	2026-01-18 17:15:00.808928	\N	\N	Freeware	\N	\N	\N	software
2660	Windows 10 Paranoid's Guide	Windows 10 Paranoid's Guide for Windows	319	{Windows}	http://www.zdnet.com/article/how-to-secure-windows-10-the-paranoids-guide/	\N	1	approved	2026-01-18 17:15:00.810392	\N	\N	Unknown	\N	\N	\N	software
2661	Show hidden files	Show hidden files for Windows	319	{Windows}	http://www.windows.microsoft.com/en-in/windows/show-hidden-files	\N	1	approved	2026-01-18 17:15:00.811595	\N	\N	Unknown	\N	\N	\N	software
2662	list of Shortcut keys	list of Shortcut keys for Windows	319	{Windows}	http://imgur.com/a/TIXvm	\N	1	approved	2026-01-18 17:15:00.812408	\N	\N	Unknown	\N	\N	\N	software
2663	Windows Support Communities	Windows Support Communities for Windows	319	{Windows}	http://answers.microsoft.com/en-us/windows	\N	1	approved	2026-01-18 17:15:00.813196	\N	\N	Unknown	\N	\N	\N	software
146	cava	Cava is a Cross-platform Audio Visualizer.	315	{linux}	https://github.com/karlstav/cava	\N	13	approved	2026-01-17 17:04:28.777344	\N	\N	Open Source	\N	https://github.com/karlstav/cava	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
149	fre:ac	fre:ac is a free audio converter and CD ripper with support for various popular formats and encoders. It currently converts between MP3, MP4/M4A, WMA, Ogg Vorbis, FLAC, AAC, WAV and Bonk formats.	315	{linux}	https://github.com/enzo1982/freac	\N	13	approved	2026-01-17 17:04:28.779618	\N	\N	Open Source	\N	https://www.freac.org	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
153	Mousai	Mousai is a simple application that can identify songs similar to Shazam.	315	{linux}	https://github.com/SeaDve/Mousai	\N	13	approved	2026-01-17 17:04:28.782187	\N	\N	Open Source	\N	https://apps.gnome.org/app/io.github.seadve.Mousai/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
160	Spicetify	Command-line tool to customize the official Spotify client. Supports Windows, MacOS and Linux.	315	{linux}	https://github.com/spicetify/spicetify-cli	\N	13	approved	2026-01-17 17:04:28.78678	\N	\N	Open Source	\N	https://spicetify.app/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
2646	mpv	Media player. [](https://github.com/mpv-player/mpv)	39	{Windows}	http://mpv.io/	\N	1	approved	2026-01-18 17:15:00.78616	\N	\N	Open Source	\N	\N	\N	software
1376	Burp	Network backup and restore program	147	{Linux,Mac,Windows}	https://github.com/grke/burp	\N	1	approved	2026-01-17 17:48:41.222874	\N	\N	AGPL-3.0	\N	\N	\N	api
1378	Minarca	Client–server backup platform with a centralized web console to manage and restore Linux, Windows, and macOS backups via GUI or CLI	147	{Windows,Mac,Linux}	https://gitlab.com/ikus-soft/minarca	\N	1	approved	2026-01-17 17:48:41.226083	\N	\N	AGPL-3.0	\N	\N	\N	api
1381	Restic	Easy, fast, verifiable, secure and efficient remote backup tool	147	{Linux,Mac,Windows}	https://github.com/restic/restic	\N	1	approved	2026-01-17 17:48:41.230045	\N	\N	BSD-2-Clause	\N	\N	\N	api
1383	Shield	A pluggable architecture for backup and restore of database systems. `MIT` `Go`	147	{Linux,Mac,Windows}	https://github.com/starkandwayne/shield	\N	1	approved	2026-01-17 17:48:41.231916	\N	\N	MIT	\N	\N	\N	api
1426	Capistrano	Deploy your application to any number of machines simultaneously, in sequence or as a rolling set via SSH (rake based)	154	{Linux}	https://github.com/capistrano/capistrano	\N	1	approved	2026-01-17 17:48:41.278584	\N	\N	MIT	\N	\N	\N	api
1429	Cobbler	Cobbler is a Linux installation server that allows for rapid setup of network installation environments	154	{Linux}	https://github.com/cobbler/cobbler	\N	1	approved	2026-01-17 17:48:41.280941	\N	\N	GPL-2.0	\N	\N	\N	api
1435	Kroki	API for generating diagrams from textual descriptions	155	{Linux,Mac,Windows}	https://github.com/yuzutech/kroki	\N	1	approved	2026-01-17 17:48:41.286856	\N	\N	MIT	\N	\N	\N	api
1896	Tencent Cloud	API for Cloud	212	{Web}	https://cloud.tencent.com/document/api?lang=en	\N	1	approved	2026-01-18 16:45:14.276787	\N	\N	Open Tools	\N	\N	\N	api
1332	Grayscale Mode	An open source macOS app that lets you quickly toggle grayscale filter right from your menu bar or using a keyboard shortcut (⌥⌘G).	315	{windows,mac,linux,web}	https://github.com/rkbhochalya/grayscale-mode	\N	13	approved	2026-01-17 17:08:48.437158	\N	\N	MIT	\N	https://github.com/rkbhochalya/grayscale-mode	Imported from awesome-free-software. License: MIT	software
2595	Babun	Alternative Windows shell based on Cygwin. [](https://github.com/babun/babun)	37	{Windows}	http://babun.github.io	\N	1	approved	2026-01-18 17:15:00.735257	\N	\N	Open Source	\N	\N	\N	software
2597	ColorTool	Set custom color schemes for the Windows Console with support for iTerm color schemes.	37	{Windows}	https://github.com/Microsoft/Console/tree/master/tools/ColorTool	\N	1	approved	2026-01-18 17:15:00.736746	\N	\N	Unknown	\N	\N	\N	software
1726	Citra	Nintendo 3DS emulator	273	{Linux,Mac,Windows}	https://www.patreon.com/citraemu	\N	1	approved	2026-01-18 09:32:25.327798	\N	\N	Open Source	\N	\N	\N	software
2553	Awesome Games	List of games hosted on Github.	273	{Windows}	https://github.com/leereilly/games	\N	1	approved	2026-01-18 17:15:00.683488	\N	\N	Freeware	\N	\N	\N	software
2556	LuaStudio	Free game development tool/engine. Create games and other graphic focused apps on Windows using Lua/LuaJIT programming language. Export them to many platforms including iOS, Android and Mac.	273	{Windows}	http://scormpool.com/luastudio	\N	1	approved	2026-01-18 17:15:00.686646	\N	\N	Unknown	\N	\N	\N	software
5	Steam	Gaming platform for purchasing, downloading, and playing games.	273	{windows,mac,linux}	https://store.steampowered.com/about	https://store.cloudflare.steamstatic.com/public/shared/images/header/logo_steam.svg	1	approved	2025-08-01 10:42:11.218774	\N	\N	\N	\N	\N	\N	software
2221	livewinsize	Visualize window size in pixels and other units. 🪟 🟢 ⭐	303	{Windows}	https://github.com/Axorax/livewinsize	\N	1	approved	2026-01-18 16:58:09.216977	\N	\N	Freeware	\N	\N	\N	software
2106	Dailymotion	Dailymotion is the second largest video hosting platform in the world	39	{Web}	https://developer.dailymotion.com/api	\N	1	approved	2026-01-18 16:45:14.475759	\N	\N	Open Tools	\N	\N	\N	software
2287	Inkless	Minimal, shortcut based app to take notes and use for light coding. 🪟 [🟢](https://github.com/Axorax/inkless) ⭐	111	{Windows}	https://github.com/Axorax/inkless	\N	1	approved	2026-01-18 16:58:09.296238	\N	\N	Freeware	\N	\N	\N	software
293	Bevy Engine	A refreshingly simple data-driven game engine built in Rust.	264	{linux}	https://github.com/bevyengine/bevy	\N	13	approved	2026-01-17 17:04:28.875655	\N	\N	Open Source	\N	https://bevyengine.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
294	Defold	Defold is a completely free to use game engine for development of desktop, mobile and web games.	264	{linux}	https://github.com/defold/defold	\N	13	approved	2026-01-17 17:04:28.876254	\N	\N	Open Source	\N	https://defold.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
300	Haxeflixel	2D game engine written in [Haxe](https://github.com/HaxeFoundation/haxe).	264	{linux}	https://github.com/haxeflixel/flixel	\N	13	approved	2026-01-17 17:04:28.880008	\N	\N	Open Source	\N	https://haxeflixel.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
301	Heaps	Heaps is a cross platform graphics engine designed for high performance games. It's designed to leverage modern GPUs that are commonly available on desktop, mobile and consoles.	264	{linux}	https://github.com/HeapsIO/heaps	\N	13	approved	2026-01-17 17:04:28.880636	\N	\N	Open Source	\N	https://heaps.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
2238	Beekeeper Studio	Modern, lightweight SQL client supporting MySQL, Postgres, SQLite, SQL Server, etc. 🪟 🍎 🐧	64	{Windows}	https://beekeeperstudio.io	\N	1	approved	2026-01-18 16:58:09.233779	\N	\N	Freeware	\N	\N	\N	software
1314	Debian	One of the earliest UNIX-like operating systems with a commitment to keeping nonfree software out of its system.	194	{windows,mac,linux,web}	https://www.debian.org/	\N	13	approved	2026-01-17 17:08:48.414091	\N	\N	DFSG	\N	https://www.debian.org/	Imported from awesome-free-software. License: DFSG	software
2149	FXSound	Boost sound quality, volume, and bass. Has a beautiful modern UI. 🪟 🟢 ⭐	298	{Windows}	https://fxsound.com	\N	1	approved	2026-01-18 16:58:09.095289	\N	\N	Freeware	\N	\N	\N	software
1289	mStream	Suite of software for syncing and streaming music across multiple devices.	298	{windows,mac,linux,web}	http://mstream.io/	\N	13	approved	2026-01-17 17:08:48.383233	\N	\N	GNU GPLv3	\N	http://mstream.io/	Imported from awesome-free-software. License: GNU GPLv3	software
4	Microsoft Excel	Powerful spreadsheet application for data analysis and visualization.	209	{windows,mac,web}	https://office.microsoft.com/excel	https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg	1	approved	2025-08-01 10:42:11.218774	\N	\N	free	\N	\N	\N	software
677	Flameshot	Powerful yet simple to use screenshot software.	295	{linux}	https://github.com/lupoDharkael/flameshot	\N	13	approved	2026-01-17 17:04:29.133003	\N	\N	Open Source	\N	https://flameshot.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
678	Ksnip	Ksnip is a Qt-based cross-platform screenshot tool that provides many annotation features for your screenshots.	295	{linux}	https://github.com/ksnip/ksnip	\N	13	approved	2026-01-17 17:04:29.133589	\N	\N	Open Source	\N	https://github.com/ksnip/ksnip#ksnip	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
2181	WhatsApp	Free messaging app with text, voice, video calls, and multimedia sharing. 🪟 🍎	225	{Windows}	https://whatsapp.com	\N	1	approved	2026-01-18 16:58:09.160442	\N	\N	Freeware	\N	\N	\N	software
864	Wireshark	Wireshark is the world's foremost network protocol analyzer. It lets you see what's happening on your network at a microscopic level. It is the de facto (and often de jure) standard across many industries and educational institutions.	263	{linux}	https://gitlab.com/wireshark/wireshark/-/tree/master	\N	13	approved	2026-01-17 17:04:29.304293	\N	\N	Open Source	\N	https://www.wireshark.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
736	Caligra Office	Offers a comprehensive set of 8 applications which satisfies the office, graphics and management needs.	267	{linux}	https://invent.kde.org/office/calligra	\N	13	approved	2026-01-17 17:04:29.175254	\N	\N	Open Source	\N	https://www.calligra.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	software
77	OpenGL 4.6	Cross-platform graphics API for rendering 2D and 3D vector graphics	12	{windows,mac,linux}	https://www.opengl.org/	https://www.opengl.org/img/opengl_logo.jpg	1	approved	2025-08-01 17:07:30.207287	\N	\N	\N	\N	\N	\N	api
216	Qt-fsarchiver	Qt-fsarchiver is a GUI for the fsarchiver program to save/restore partitions, folders and even the MBR/GPT table. The program is for systems based on Debian, OpenSuse or Fedora.	25	{linux}	https://sourceforge.net/projects/qt-fsarchiver/	\N	13	approved	2026-01-17 17:04:28.825064	\N	\N	Open Source	\N	https://sourceforge.net/projects/qt-fsarchiver/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
218	restic	restic is a backup program that is fast, efficient and secure. It supports the three major operating systems (Linux, macOS, Windows) and a few smaller ones (FreeBSD, OpenBSD).	25	{linux}	https://github.com/restic/restic	\N	13	approved	2026-01-17 17:04:28.826476	\N	\N	Open Source	\N	https://restic.net/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
222	Timeshift	System restore tool for Linux. Creates filesystem snapshots using rsync+hardlinks, or BTRFS snapshots. Supports scheduled snapshots, multiple backup levels, and exclude filters. Snapshots can be restored while system is running or from Live CD/USB.	25	{linux}	https://github.com/linuxmint/timeshift	\N	13	approved	2026-01-17 17:04:28.829509	\N	\N	Open Source	\N	https://github.com/linuxmint/timeshift	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
227	La Capitaine Icon Theme	A macOS and Material design inspired icon theme designed to fit into most desktop environments.	59	{linux}	https://github.com/keeferrourke/la-capitaine-icon-theme	\N	13	approved	2026-01-17 17:04:28.833528	\N	\N	Open Source	\N	https://github.com/keeferrourke/la-capitaine-icon-theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
230	Papirus Icon Theme	SVG icon theme for Linux systems, based on Paper with a few extras like (hardcode-tray support, kde-color-scheme support, libreoffice icon theme, filezilla theme, smplayer themes, ...) and other modifications. The theme is available for GTK and KDE.	59	{linux}	https://github.com/PapirusDevelopmentTeam/papirus-icon-theme	\N	13	approved	2026-01-17 17:04:28.835897	\N	\N	Open Source	\N	https://github.com/PapirusDevelopmentTeam/papirus-icon-theme	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
260	Themix GUI designer	A Graphical application for generating different color variations of Oomox (Numix-based) and Materia (ex-Flat-Plat) themes (GTK2, GTK3, Cinnamon, GNOME, Openbox, Xfwm), Archdroid, Gnome-Color, Numix, Papirus and Suru++ icon themes.	61	{linux}	https://github.com/themix-project/themix-gui	\N	13	approved	2026-01-17 17:04:28.854678	\N	\N	Open Source	\N	https://github.com/themix-project/themix-gui	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
271	CouchDB	Seamless multi-master sync, that scales from Big Data to Mobile, with an Intuitive HTTP/JSON API and designed for Reliability.	64	{linux}	https://github.com/apache/couchdb	\N	13	approved	2026-01-17 17:04:28.86193	\N	\N	Open Source	\N	https://couchdb.apache.org/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
367	Insomnia	A simple, beautiful, and free REST API client.	77	{linux}	https://github.com/Kong/insomnia	\N	13	approved	2026-01-17 17:04:28.922057	\N	\N	Open Source	\N	https://insomnia.rest/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
377	Postman	Postman, allows a user to develop and test APIs quickly.	77	{linux}	https://www.postman.com/	\N	13	approved	2026-01-17 17:04:28.929096	\N	\N	Freeware	\N	https://www.postman.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: true	api
566	Steam Deck Repo Manager	Install boot videos to your Steam Deck using Steam Deck Repo website API.	90	{linux}	https://github.com/CapitaineJSparrow/steam-repo-manager	\N	13	approved	2026-01-17 17:04:29.058979	\N	\N	Open Source	\N	https://steamdeckrepo.com/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
575	ProtonUp	CLI program and API to automate the installation and update of GE-Proton.	90	{linux}	https://github.com/AUNaseef/protonup	\N	13	approved	2026-01-17 17:04:29.064894	\N	\N	Open Source	\N	https://github.com/AUNaseef/protonup	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
792	Inkdrop	The Note-Taking App for Markdown Lovers with simple interface, seemless security and powerful APIs.	111	{linux}	https://inkdrop.app/	\N	13	approved	2026-01-17 17:04:29.222037	\N	\N	Commercial	\N	https://inkdrop.app/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	api
861	Portmaster	Portmaster is a free and open-source application firewall that does the heavy lifting for you. Restore privacy and take back control over all your computer's network activity.	117	{linux}	https://github.com/safing/portmaster	\N	13	approved	2026-01-17 17:04:29.302274	\N	\N	Open Source	\N	https://safing.io/	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
1032	Nala	Nala is a front-end for libapt-pkg. Specifically we interface using the python-apt api.Especially for newer users it can be hard to understand what apt is trying to do when installing or upgrading.	131	{linux}	https://gitlab.com/volian/nala	\N	13	approved	2026-01-17 17:04:29.422711	\N	\N	Open Source	\N	https://gitlab.com/volian/nala	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
1133	NordVPN	NordVPN gives you military-grade protection online, and you can access all your favorite sites without restriction.	40	{linux}	https://nordvpn.com/	\N	13	approved	2026-01-17 17:04:29.496319	\N	\N	Commercial	\N	https://nordvpn.com/	Imported from Awesome-Linux-Software. Open Source: false, Free: false	api
1171	yewtube	Terminal based YouTube player and downloader. No Youtube API key required. Forked from mps-youtube. Can be installed using pip as described [here](https://github.com/iamtalhaasghar/yewtube#using-pip).	33	{linux}	https://github.com/iamtalhaasghar/yewtube	\N	13	approved	2026-01-17 17:04:29.521513	\N	\N	Open Source	\N	https://github.com/iamtalhaasghar/yewtube	Imported from Awesome-Linux-Software. Open Source: true, Free: true	api
1373	Backrest	Backrest is a web UI and orchestrator for restic backup	147	{Linux,Mac,Windows}	https://github.com/garethgeorge/backrest	\N	1	approved	2026-01-17 17:48:41.218755	\N	\N	GPL-3.0	\N	\N	\N	api
1478	lldap	Light (simplified) LDAP implementation with a simple, intuitive web interface and GraphQL support. `GPL-3.0` `Rust`	160	{Linux,Mac,Windows}	https://github.com/nitnelave/lldap	\N	1	approved	2026-01-17 17:48:41.326598	\N	\N	GPL-3.0	\N	\N	\N	api
1517	Adagios	Web based Nagios interface for configuration and monitoring (replacement to the standard interface), and a REST interface	168	{Linux,Mac,Windows}	https://github.com/opinkerfi/adagios	\N	1	approved	2026-01-17 17:48:41.363685	\N	\N	AGPL-3.0	\N	\N	\N	api
1564	Nhost	Firebase Alternative with GraphQL. Get a database and backend configured and ready in minutes	170	{Linux,Mac,Windows}	https://github.com/nhost/nhost	\N	1	approved	2026-01-17 17:48:41.398551	\N	\N	MIT	\N	\N	\N	api
1582	OPNsense	An open source FreeBSD-based firewall and router with traffic shaping, load balancing, and virtual private network capabilities	174	{Linux,Mac,Windows}	https://github.com/opnsense	\N	1	approved	2026-01-17 17:48:41.415892	\N	\N	BSD-2-Clause	\N	\N	\N	api
1585	etcd	Distributed K/V-Store, authenticating via SSL PKI and a REST HTTP Api for shared configuration and service discovery	175	{Linux,Mac,Windows}	https://github.com/coreos/etcd	\N	1	approved	2026-01-17 17:48:41.418974	\N	\N	Apache-2.0	\N	\N	\N	api
1799	Kévin Dunglas	API Platform, Vulcain, Mercure and Symfony contributions	198	{Linux,Mac,Windows}	https://github.com/sponsors/dunglas	\N	1	approved	2026-01-18 09:32:25.392716	\N	\N	Open Source	\N	\N	\N	api
1819	Povilas Kanapickas	X server, Buildbot CI, Barrier and many others	198	{Linux,Mac,Windows}	https://www.patreon.com/p12tic	\N	1	approved	2026-01-18 09:32:25.406642	\N	\N	Open Source	\N	\N	\N	api
1861	AcgClub	AcgClub API provides ACG-related aggregation services	206	{Web}	https://github.com/Rabtman/AcgClub/wiki/%E5%AE%85%E7%A4%BEAcgClub-API	\N	1	approved	2026-01-18 16:45:14.225616	\N	\N	Open Tools	\N	\N	\N	api
1862	AniList	The AniList GraphQL Api provides quick and powerful access to over 500k anime and manga entries, including character, staff, and live airing data	206	{Web}	https://github.com/AniList/ApiV2-GraphQL-Docs	\N	1	approved	2026-01-18 16:45:14.230561	\N	\N	Open Tools	\N	\N	\N	api
1863	hitokoto	hitokoto API provides a one-word service, which can be a line in anime, or a variety of small paragraphs on the network	206	{Web}	https://hitokoto.cn/api	\N	1	approved	2026-01-18 16:45:14.231924	\N	\N	Open Tools	\N	\N	\N	api
1864	Kitsu API	Kitsu is a modern anime discovery platform that helps you track the anime you're watching, discover new anime and socialize with other fans	206	{Web}	https://kitsu.docs.apiary.io/#	\N	1	approved	2026-01-18 16:45:14.23312	\N	\N	Open Tools	\N	\N	\N	api
1865	Blogger	The Blogger API v3 allows you to create new blog posts, edit or delete existing posts, and query for posts that match particular criteria	207	{Web}	https://developers.google.com/blogger/	\N	1	approved	2026-01-18 16:45:14.235226	\N	\N	Open Tools	\N	\N	\N	api
1868	Telegraph	Access to Telegraph's APIs, Telegram's publishing service	207	{Web}	http://telegra.ph/api	\N	1	approved	2026-01-18 16:45:14.240383	\N	\N	Open Tools	\N	\N	\N	api
1869	An API Of Ice And Fire	The An API of Ice And Fire provide data about all Book, Characters, Houses from the universe of 'A Song of Ice and Fire' in JSON format. Authentication is not required. Node and Swift libraries available	208	{Web}	https://anapioficeandfire.com/	\N	1	approved	2026-01-18 16:45:14.242888	\N	\N	Open Tools	\N	\N	\N	api
1870	Open Library Books API	Open Library is an open, editable library catalog, building towards a web page for every book ever published	208	{Web}	https://openlibrary.org/developers/api	\N	1	approved	2026-01-18 16:45:14.243933	\N	\N	Open Tools	\N	\N	\N	api
1871	The New York Public Library Digital Collections API	For more than a century, The NY Public Library has amassed an extraordinary trove of rare and unique material covering the full spectrum of recorded knowledge	208	{Web}	http://api.repo.nypl.org/	\N	1	approved	2026-01-18 16:45:14.245235	\N	\N	Open Tools	\N	\N	\N	api
1872	Bookshare	The Bookshare API allows our partners to enable their customers with qualified print disabilities to search,browse and download books and periodicals	208	{Web}	http://developer.bookshare.org/	\N	1	approved	2026-01-18 16:45:14.247755	\N	\N	Open Tools	\N	\N	\N	api
1873	Airtable	The Airtable Standard API allows you to create, read, update, and destroy records	209	{Web}	https://airtable.com/api	\N	1	approved	2026-01-18 16:45:14.249727	\N	\N	Open Tools	\N	\N	\N	api
1874	Buffer	The Buffer API provides access to user's pending and sent updates, social media profiles, scheduled times and more	209	{Web}	https://buffer.com/developers/api	\N	1	approved	2026-01-18 16:45:14.250723	\N	\N	Open Tools	\N	\N	\N	api
1875	Concur Labs	Access to Concur's RESTful API	209	{Web}	https://developer.concur.com/api-reference/	\N	1	approved	2026-01-18 16:45:14.25344	\N	\N	Open Tools	\N	\N	\N	api
1876	Envoy	Access to Envoy's API	209	{Web}	https://developers.envoy.com/	\N	1	approved	2026-01-18 16:45:14.254394	\N	\N	Open Tools	\N	\N	\N	api
1877	JotForm	The JotForm API makes it possible to connect to your form data without using the JotForm web site	209	{Web}	http://api.jotform.com/docs/	\N	1	approved	2026-01-18 16:45:14.255375	\N	\N	Open Tools	\N	\N	\N	api
1878	MailChimp	Access to MailChimp's API	209	{Web}	https://developer.mailchimp.com/	\N	1	approved	2026-01-18 16:45:14.256569	\N	\N	Open Tools	\N	\N	\N	api
1879	Pruvan	Access to Pruvan's API	209	{Web}	https://pruvan.com/resources/pruvan-api/	\N	1	approved	2026-01-18 16:45:14.258094	\N	\N	Open Tools	\N	\N	\N	api
1880	Quip	The Quip REST API enables you to automate processes and integrate Quip with other products you or your company uses	209	{Web}	https://quip.com/api/	\N	1	approved	2026-01-18 16:45:14.259191	\N	\N	Open Tools	\N	\N	\N	api
1881	Salesforce	Access to Salesforce's API	209	{Web}	https://developer.salesforce.com/page/Salesforce_APIs	\N	1	approved	2026-01-18 16:45:14.260135	\N	\N	Open Tools	\N	\N	\N	api
1883	Wolfram Data Drop	Access to Wolfram Data Drop's RESTful API	209	{Web}	https://www.wolfram.com/datadrop/quick-reference/web-api/	\N	1	approved	2026-01-18 16:45:14.263471	\N	\N	Open Tools	\N	\N	\N	api
1884	Google Calendar	The Google Calendar API lets you integrate your app with Google Calendar, creating new ways for you to engage your users	210	{Web}	https://developers.google.com/google-apps/calendar/	\N	1	approved	2026-01-18 16:45:14.265105	\N	\N	Open Tools	\N	\N	\N	api
1885	Outlook Calendar	The Calendar API provides access to events, calendar, and calendar group data secured by Azure Active Directory on Office 365, and to similar data in Microsoft accounts specifically in these domains: Hotmail.com, Live.com, MSN.com, Outlook.com, and Passport.com	210	{Web}	https://msdn.microsoft.com/en-us/office/office365/api/calendar-rest-operations	\N	1	approved	2026-01-18 16:45:14.265896	\N	\N	Open Tools	\N	\N	\N	api
1892	Google Cloud Platform	API for Cloud	212	{Web}	https://cloud.google.com/apis/docs/overview	\N	1	approved	2026-01-18 16:45:14.273664	\N	\N	Open Tools	\N	\N	\N	api
1894	Oracle Cloud	API for Cloud	212	{Web}	https://cloud.oracle.com/home	\N	1	approved	2026-01-18 16:45:14.275241	\N	\N	Open Tools	\N	\N	\N	api
1899	Amazon Cloud Drive	With the Amazon Cloud Drive's updated RESTful API and SDKs for Android and iOS, Amazon Drive is moving to an invite-only developer offering to ensure they can provide a consistently viable cloud drive service available for supported use-cases	213	{Web}	https://developer.amazon.com/amazon-drive	\N	1	approved	2026-01-18 16:45:14.281896	\N	\N	Open Tools	\N	\N	\N	api
1903	Google Drive	Google Drive APIs allow you to read, write, and sync files stored in Google Drive from your mobile and web apps	213	{Web}	https://developers.google.com/drive/	\N	1	approved	2026-01-18 16:45:14.290517	\N	\N	Open Tools	\N	\N	\N	api
1905	QNAP	With QNAP Development Toolkit (API & SDK), developers can design applications that can run on a client’s device (such as a smart phone or PC) and remotely manage and access files and documents stored on the NAS	213	{Web}	https://www.qnap.com/event/dev/useng/p_about.php	\N	1	approved	2026-01-18 16:45:14.292538	\N	\N	Open Tools	\N	\N	\N	api
1906	Verizon Cloud	Upload, retrieve, and manage large amounts of data, access data through an API call, view prepackaged reports, rely on Verizon security to keep data safe and accessible at all times	213	{Web}	http://www.verizonenterprise.com/cloud/documentation/StorageAPIReference.htm	\N	1	approved	2026-01-18 16:45:14.295037	\N	\N	Open Tools	\N	\N	\N	api
1920	ARTIK Cloud	The ARTIK Cloud API provides access to the ARTIK Cloud platform	216	{Web}	https://developer.artik.cloud/documentation/api-reference/	\N	1	approved	2026-01-18 16:45:14.309984	\N	\N	Open Tools	\N	\N	\N	api
1921	AT&T M2X	M2X's RESTful API streamlines the connection between devices and the M2X service, allowing you to build applications and services that leverage time-series data analytics and distributed, high-availability time-series data storage, to deliver meaningful information to your customers and end-users and build IOT and M2M solutions without managing your own storage infrastructure	216	{Web}	https://m2x.att.com/developer/documentation/v2/overview	\N	1	approved	2026-01-18 16:45:14.310759	\N	\N	Open Tools	\N	\N	\N	api
1926	CircleCI	The CircleCI API is a RESTful, fully-featured API that allows you to access all information and trigger all actions in CircleCI	216	{Web}	https://circleci.com/docs/api/v1-reference/	\N	1	approved	2026-01-18 16:45:14.315129	\N	\N	Open Tools	\N	\N	\N	api
1928	Dataflow kit	Dataflow kit is a Web Scraping framework for Gophers. It helps to extract data from web pages, following the specified CSS Selectors	216	{Web}	https://github.com/slotix/dataflowkit	\N	1	approved	2026-01-18 16:45:14.317	\N	\N	Open Tools	\N	\N	\N	api
1930	gank.io	Access to API of http://gank.io/ .(**Missing English Docs**)	216	{Web}	http://gank.io/api	\N	1	approved	2026-01-18 16:45:14.318468	\N	\N	Open Tools	\N	\N	\N	api
1932	Google Play Developer	The Google Play Developer API allows you to perform a number of publishing and app-management tasks	216	{Web}	https://developers.google.com/android-publisher/	\N	1	approved	2026-01-18 16:45:14.320804	\N	\N	Open Tools	\N	\N	\N	api
1933	IPInfo.io	Use the ipinfo.io IP lookup API to quickly and simply integrate IP geolocation into your script or website	216	{Web}	https://ipinfo.io/developers	\N	1	approved	2026-01-18 16:45:14.321555	\N	\N	Open Tools	\N	\N	\N	api
1934	Laravel China	Access to API of https://laravel-china.org/ .(**Missing English Docs**)	216	{Web}	https://laravel-china.org/topics/3097	\N	1	approved	2026-01-18 16:45:14.322396	\N	\N	Open Tools	\N	\N	\N	api
1936	openHAB	The REST API of openHAB serves different purposes. It can be used to integrate openHAB with other systems as it allows read access to items and item states as well as status updates or the sending of commands for items. Furthermore, it gives access to the sitemaps, so that it is the interface to be used by remote user interfaces (e.g. fat clients or fully Javascript based web clients)	216	{Web}	https://github.com/openhab/openhab1-addons/wiki/REST-API	\N	1	approved	2026-01-18 16:45:14.323921	\N	\N	Open Tools	\N	\N	\N	api
1937	oschina	Access to API of https://oschina.net/ .(**Missing English Docs**)	216	{Web}	http://www.oschina.net/openapi	\N	1	approved	2026-01-18 16:45:14.324799	\N	\N	Open Tools	\N	\N	\N	api
1938	Particle	The Particle Cloud API is a REST API	216	{Web}	https://docs.particle.io/reference/api/	\N	1	approved	2026-01-18 16:45:14.325691	\N	\N	Open Tools	\N	\N	\N	api
1940	QR Code Generator	You can generate and decode / read QR code graphics with the QR code generator web API at api.qrserver.com	216	{Web}	http://goqr.me/api/	\N	1	approved	2026-01-18 16:45:14.327381	\N	\N	Open Tools	\N	\N	\N	api
1941	Ruby China	Access to API of https://ruby-china.org/ .(**Missing English Docs**)	216	{Web}	https://ruby-china.org/api-doc/	\N	1	approved	2026-01-18 16:45:14.328078	\N	\N	Open Tools	\N	\N	\N	api
1942	Scraper API	Easily build scalable web scrapers with Scraper API	216	{Web}	https://www.scraperapi.com/documentation	\N	1	approved	2026-01-18 16:45:14.329104	\N	\N	Open Tools	\N	\N	\N	api
1943	StackExchange	Access to Stack Exchange API	216	{Web}	https://api.stackexchange.com/docs	\N	1	approved	2026-01-18 16:45:14.329759	\N	\N	Open Tools	\N	\N	\N	api
1947	W3C	In response to demand from developers in W3C community wanting to interact with [W3C](http://www.w3.org/)'s data, the W3C Systems Team has developed a Web API. Through it they are making available data on Specifications, Groups, Organizations and Users.The W3C API is a read-only Web API based on the JSON format exposing only public data	216	{Web}	https://github.com/w3c/w3c-api	\N	1	approved	2026-01-18 16:45:14.333056	\N	\N	Open Tools	\N	\N	\N	api
1949	Context.IO	Context.IO is a modern, scalable email API that simplifies working with email data	30	{Web}	http://context.io/	\N	1	approved	2026-01-18 16:45:14.335822	\N	\N	Open Tools	\N	\N	\N	api
1950	Gmail	Modern, easy, fast, RESTful	30	{Web}	https://developers.google.com/gmail/api/	\N	1	approved	2026-01-18 16:45:14.336574	\N	\N	Open Tools	\N	\N	\N	api
1951	Inbox	Inbox provides modern RESTful APIs for working with mail providers. Stop fighting the old protocols and focus on building great apps	30	{Web}	https://www.inboxapp.com/docs	\N	1	approved	2026-01-18 16:45:14.337267	\N	\N	Open Tools	\N	\N	\N	api
1954	Adidas AG	Access to Adidas AG's API	218	{Web}	https://developers.adidas.com/services	\N	1	approved	2026-01-18 16:45:14.340277	\N	\N	Open Tools	\N	\N	\N	api
1955	Fitbit	The Fitbit API allows developers to interact with Fitbit data in their own applications, products and services	218	{Web}	https://dev.fitbit.com/	\N	1	approved	2026-01-18 16:45:14.340994	\N	\N	Open Tools	\N	\N	\N	api
1957	Lifelog	Sony’s Lifelog API gives you secure access to your users’ lifestyle, fitness and health data, collected through sensors in their smartphone and connected SmartWear devices. Use it to create innovative new use cases in your app or service	218	{Web}	https://developer.sony.com/develop/services/lifelog-api/	\N	1	approved	2026-01-18 16:45:14.342869	\N	\N	Open Tools	\N	\N	\N	api
1961	Strava	The Strava V3 API is a publicly available interface allowing developers access to the rich Strava dataset	218	{Web}	https://strava.github.io/api/	\N	1	approved	2026-01-18 16:45:14.345885	\N	\N	Open Tools	\N	\N	\N	api
1962	Withings	The Withings API allows developers to create applications that take advantage of the Withings devices and the data they record	218	{Web}	http://www.withings.com/us/en/developers	\N	1	approved	2026-01-18 16:45:14.346587	\N	\N	Open Tools	\N	\N	\N	api
1963	Order Pizza REST API	🍕 A RESTful API as pizza restaurant ordering system	219	{Web}	https://order-pizza-api.herokuapp.com/api/ui	\N	1	approved	2026-01-18 16:45:14.347894	\N	\N	Open Tools	\N	\N	\N	api
1965	CurrencyScoop.com	Free Real-time and historical currency rates JSON API	220	{Web}	https://currencyscoop.com/	\N	1	approved	2026-01-18 16:45:14.350017	\N	\N	Open Tools	\N	\N	\N	api
1967	Clash of Clans	The Clash of Clans API provides near real­time access to game related data	273	{Web}	https://developer.clashofclans.com/#/	\N	1	approved	2026-01-18 16:45:14.352061	\N	\N	Open Tools	\N	\N	\N	api
1968	EVE Online	EVE Online is one of the most popular science fiction massively multiplayer online role-playing games (MMORPG). The EVE Online CREST and XML APIs provide programmatic access to characters, industries, markets, solar system, alliances and corporations, and other game data	273	{Web}	https://developers.eveonline.com/	\N	1	approved	2026-01-18 16:45:14.352754	\N	\N	Open Tools	\N	\N	\N	api
1969	Facebook Games Services	The Facebook Games Developer Center features a variety of services for game developers including (but not limited to) Achievements API, Scores API, App Notifications, Requests, Feed Gaming, and Facebook SDK for Unity	273	{Web}	https://developers.facebook.com/docs/games	\N	1	approved	2026-01-18 16:45:14.353512	\N	\N	Open Tools	\N	\N	\N	api
1973	Giant Bomb	The Giant Bomb API provides programmatic access to a lot of the information available on the Giant Bomb Web site such as game titles, ratings, videos, companies, themes, genres, and much more	273	{Web}	http://www.giantbomb.com/api/	\N	1	approved	2026-01-18 16:45:14.356505	\N	\N	Open Tools	\N	\N	\N	api
1974	Guild Wars 2	The Guild Wars 2 API is an interface that enables third-party applications to access data directly from the Guild Wars 2 servers	273	{Web}	https://wiki.guildwars2.com/wiki/API:Main	\N	1	approved	2026-01-18 16:45:14.35719	\N	\N	Open Tools	\N	\N	\N	api
1975	Automatic	Provides REST API, Real-time Event API and Streaming API for interacting with Automatic data	222	{Web}	https://developer.automatic.com/	\N	1	approved	2026-01-18 16:45:14.358538	\N	\N	Open Tools	\N	\N	\N	api
1976	Amazon Alexa	The Alexa Voice Service API allows developers to voice-enable connected products with a microphone and speaker	222	{Web}	https://developer.amazon.com/public/solutions/alexa/alexa-voice-service/content/avs-api-overview	\N	1	approved	2026-01-18 16:45:14.359374	\N	\N	Open Tools	\N	\N	\N	api
1979	Homey	Access to Homey's API	222	{Web}	https://developers.athom.com/api/	\N	1	approved	2026-01-18 16:45:14.361734	\N	\N	Open Tools	\N	\N	\N	api
1980	HP Print	Access to HP Print's API	222	{Web}	https://developers.hp.com/printos/printos	\N	1	approved	2026-01-18 16:45:14.362447	\N	\N	Open Tools	\N	\N	\N	api
1981	LIFX	LIFX is a multi-color smart WiFi-enabled LED lightbulb. The LIFX HTTP API lets you control LIFX devices over the internet and is REST inspired API for interacting with LIFX devices	222	{Web}	https://api.developer.lifx.com/	\N	1	approved	2026-01-18 16:45:14.363184	\N	\N	Open Tools	\N	\N	\N	api
1982	LightwaveRF	This API outlines the local command protocols currently in use in the LightwaveRF system	222	{Web}	https://api.lightwaverf.com/	\N	1	approved	2026-01-18 16:45:14.363945	\N	\N	Open Tools	\N	\N	\N	api
1983	microBees	Easily execute REST APIs and subscribe for real-time messaging	222	{Web}	http://developers.microbees.com/documentation/#reference	\N	1	approved	2026-01-18 16:45:14.364669	\N	\N	Open Tools	\N	\N	\N	api
1984	Mojio	Use the REST endpoints for request and response type integrations and the PUSH API to push data in real-time	222	{Web}	https://www.moj.io/developer/	\N	1	approved	2026-01-18 16:45:14.365381	\N	\N	Open Tools	\N	\N	\N	api
1985	myStrom	The myStrom WLAN Energy Control Switch offers a REST API which allows you to access/control the switch from directly from your local network independent from myStrom	222	{Web}	https://mystrom.ch/de/mystrom-api	\N	1	approved	2026-01-18 16:45:14.366513	\N	\N	Open Tools	\N	\N	\N	api
1986	Neurio	Neurio is an open platform with a public API so you can extend it any way you like. Connect it to web services, or write your own applications	222	{Web}	http://neur.io/developers/	\N	1	approved	2026-01-18 16:45:14.367234	\N	\N	Open Tools	\N	\N	\N	api
1988	Smappee	Access to Smappee's API which helps you measure your electrical energy consumption and solar production	222	{Web}	https://smappee.atlassian.net/wiki/display/DEVAPI/SmappeeDevAPI+Home	\N	1	approved	2026-01-18 16:45:14.368813	\N	\N	Open Tools	\N	\N	\N	api
1989	SmartThins	Access to SmartThings' API	222	{Web}	https://developers.athom.com/api/	\N	1	approved	2026-01-18 16:45:14.369549	\N	\N	Open Tools	\N	\N	\N	api
1990	Stack Lighting	The Stack API is a REST API, which defines a set of functions that allow developers to perform requests and to receive responses via the HTTP protocol. This API provides developers with the ability to control brightness, color temperature, motion settings, ambient light sensing settings, and other features to tailor Stack’s responsive lighting to one's unique preferences	222	{Web}	http://developers.stacklighting.com/	\N	1	approved	2026-01-18 16:45:14.370414	\N	\N	Open Tools	\N	\N	\N	api
1996	Google Cloud Prediction	Google Cloud Prediction API provides a RESTful API to build Machine Learning models. Prediction's cloud-based machine learning tools can help analyze your data to add various features to your applications, such as customer sentiment analysis, spam detection, recommendation systems, and more	223	{Web}	https://cloud.google.com/prediction/docs/	\N	1	approved	2026-01-18 16:45:14.375826	\N	\N	Open Tools	\N	\N	\N	api
1999	Amap	Access to Amap's web APIs.(**Missing English Docs**)	224	{Web}	http://lbs.amap.com/	\N	1	approved	2026-01-18 16:45:14.379184	\N	\N	Open Tools	\N	\N	\N	api
2000	Baidu Map	Access to Baidu Map's web APIs.(**Missing English Docs**)	224	{Web}	http://lbsyun.baidu.com/index.php?title=webapi	\N	1	approved	2026-01-18 16:45:14.379918	\N	\N	Open Tools	\N	\N	\N	api
2001	Bing maps	Access to Bing maps' APIs	224	{Web}	https://www.microsoft.com/maps/choose-your-bing-maps-API.aspx	\N	1	approved	2026-01-18 16:45:14.380656	\N	\N	Open Tools	\N	\N	\N	api
2004	Tencent Map	Access to Tencent Map's WebService APIs.(**Missing English Docs**)	224	{Web}	http://lbs.qq.com/webservice_v1/index.html	\N	1	approved	2026-01-18 16:45:14.382805	\N	\N	Open Tools	\N	\N	\N	api
2006	Dingtalk	Access to Dingtalk's APIs.(**Missing English Docs**)	225	{Web}	https://open-doc.dingtalk.com/	\N	1	approved	2026-01-18 16:45:14.384807	\N	\N	Open Tools	\N	\N	\N	api
2007	dondeEsta Family	Access to dondeEsta family API	225	{Web}	http://docs.dondeesta.apiary.io/#introduction/api	\N	1	approved	2026-01-18 16:45:14.385523	\N	\N	Open Tools	\N	\N	\N	api
2009	GroupMe	The GroupMe API will enable you to enhance existing apps with our group messaging abilities, build interesting new experiences, or simply add a little spice to your existing groups	225	{Web}	https://dev.groupme.com/docs/v3	\N	1	approved	2026-01-18 16:45:14.387007	\N	\N	Open Tools	\N	\N	\N	api
2010	indoona	The indoona RESTful API over HTTPS that lets you: send messages to indoona users and groups, create special address book contacts to let indoona users chat with your application	225	{Web}	https://developer.indoona.com/	\N	1	approved	2026-01-18 16:45:14.38772	\N	\N	Open Tools	\N	\N	\N	api
2012	MessageBird	The MessageBird API connects your website or application to operators around the world. With the API you can integrate SMS, Chat & Voice	225	{Web}	https://developers.messagebird.com/	\N	1	approved	2026-01-18 16:45:14.38918	\N	\N	Open Tools	\N	\N	\N	api
2016	Last.fm	The Last.fm API allows anyone to build their own programs using Last.fm data, whether they're on the web, the desktop or mobile devices	226	{Web}	http://www.last.fm/zh/api?setlang=en	\N	1	approved	2026-01-18 16:45:14.393887	\N	\N	Open Tools	\N	\N	\N	api
2017	MusicGraph	MusicGraph API, launched by Senzari, is the world's first knowledge engine for music, which will be available as a powerful 'graph API' that can be leveraged by developers to enhance their applications with deep musical intelligence	226	{Web}	https://developer.musicgraph.com/	\N	1	approved	2026-01-18 16:45:14.394758	\N	\N	Open Tools	\N	\N	\N	api
2018	Musixmatch	Bring lyrics on your application with the Musixmatch API	226	{Web}	https://developer.musixmatch.com/	\N	1	approved	2026-01-18 16:45:14.395539	\N	\N	Open Tools	\N	\N	\N	api
2019	One Music	OneMusicAPI is able to provide metadata about an astonishing range of music because it aggregates existing, well maintained, online databases	226	{Web}	http://www.onemusicapi.com/	\N	1	approved	2026-01-18 16:45:14.396255	\N	\N	Open Tools	\N	\N	\N	api
2024	aztro	aztro is a REST API for retrieving horoscope information	227	{Web}	https://aztro.sameerkumar.website	\N	1	approved	2026-01-18 16:45:14.40065	\N	\N	Open Tools	\N	\N	\N	api
2026	Diigo	The Diigo API allows you to build apps that interact with the Diigo service	227	{Web}	https://www.diigo.com/api_dev	\N	1	approved	2026-01-18 16:45:14.40204	\N	\N	Open Tools	\N	\N	\N	api
2027	feedly	Access to feedly's API	227	{Web}	https://developer.feedly.com/	\N	1	approved	2026-01-18 16:45:14.402745	\N	\N	Open Tools	\N	\N	\N	api
2028	Genius	The Genius API to help build the world's greatest public knowledge project since Wikipedia	227	{Web}	https://docs.genius.com/	\N	1	approved	2026-01-18 16:45:14.403482	\N	\N	Open Tools	\N	\N	\N	api
2029	goodreads	The Goodreads API allows developers access to Goodreads data in order to help websites or applications that deal with books be more personalized, social, and engaging	227	{Web}	https://www.goodreads.com/api	\N	1	approved	2026-01-18 16:45:14.40421	\N	\N	Open Tools	\N	\N	\N	api
2030	HackerNews	Documentation and Samples for the Official HN API	227	{Web}	https://github.com/HackerNews/API	\N	1	approved	2026-01-18 16:45:14.405317	\N	\N	Open Tools	\N	\N	\N	api
2031	Inoreader	The Inoreader API allows you to help users subscribe to feeds, read articles or catalogue them for viewing later	227	{Web}	https://www.inoreader.com/developers/	\N	1	approved	2026-01-18 16:45:14.406021	\N	\N	Open Tools	\N	\N	\N	api
2032	Instapaper	The Instapaper API allows third-party applications to add URLs to Instapaper	227	{Web}	https://www.instapaper.com/api	\N	1	approved	2026-01-18 16:45:14.406766	\N	\N	Open Tools	\N	\N	\N	api
2034	Newsblur	NewsBlur's API allows users to retrieve their feeds, feed counts, feed icons, feed statistics, and individual feed stories	227	{Web}	https://newsblur.com/api	\N	1	approved	2026-01-18 16:45:14.408444	\N	\N	Open Tools	\N	\N	\N	api
2035	NPR	NPR's API provides a flexible, powerful way to access your favorite NPR content	227	{Web}	http://www.npr.org/api/index	\N	1	approved	2026-01-18 16:45:14.409185	\N	\N	Open Tools	\N	\N	\N	api
2036	Pinboard	The Pinboard API is a way to interact programmatically with your bookmarks, notes and other Pinboard data	227	{Web}	https://pinboard.in/api	\N	1	approved	2026-01-18 16:45:14.409974	\N	\N	Open Tools	\N	\N	\N	api
2037	Pocket	Bring the power of save for later to your users and applications by integrating the Pocket API	227	{Web}	https://getpocket.com/developer/	\N	1	approved	2026-01-18 16:45:14.410796	\N	\N	Open Tools	\N	\N	\N	api
2038	Product Hunt	Access to [producthunt.com](https://www.producthunt.com/)'s API	227	{Web}	https://api.producthunt.com/v1/docs	\N	1	approved	2026-01-18 16:45:14.411482	\N	\N	Open Tools	\N	\N	\N	api
2039	The New York Times	Access to The New York Times's API	227	{Web}	https://developer.nytimes.com/	\N	1	approved	2026-01-18 16:45:14.412211	\N	\N	Open Tools	\N	\N	\N	api
2040	USA TODAY	Access to the latest news and most interesting stories from USA TODAY	227	{Web}	https://developer.usatoday.com/docs/	\N	1	approved	2026-01-18 16:45:14.412896	\N	\N	Open Tools	\N	\N	\N	api
2041	Youdao Note	Access to Youdao Note's web APIs.(**Missing English Docs**)	228	{Web}	http://note.youdao.com/open/	\N	1	approved	2026-01-18 16:45:14.414918	\N	\N	Open Tools	\N	\N	\N	api
2042	PayPal	Access to PayPal's REST APIs	229	{Web}	https://developer.paypal.com/docs/api/	\N	1	approved	2026-01-18 16:45:14.416168	\N	\N	Open Tools	\N	\N	\N	api
2043	Paymill	Access the full API reference and get any information you need to know to implement PAYMILL	229	{Web}	https://developers.paymill.com/index	\N	1	approved	2026-01-18 16:45:14.416841	\N	\N	Open Tools	\N	\N	\N	api
2044	Paytm	Access to the details of the APIs you need to work with to take payments on your app/website using Paytm Wallet and for handling operational issues related to payments (eg: refunds, transaction status check)	229	{Web}	https://paytm.com/business/payments/developers	\N	1	approved	2026-01-18 16:45:14.417516	\N	\N	Open Tools	\N	\N	\N	api
2047	500px	500px API provides programmatic access to 500px functionality and content	230	{Web}	https://github.com/500px/api-documentation	\N	1	approved	2026-01-18 16:45:14.420646	\N	\N	Open Tools	\N	\N	\N	api
2049	Imgur	Using Imgur's RESTful API, you can do just about anything you can do on [imgur.com](http://imgur.com/)	230	{Web}	https://api.imgur.com/	\N	1	approved	2026-01-18 16:45:14.422123	\N	\N	Open Tools	\N	\N	\N	api
2050	Pixabay	The pixabay API is a RESTful interface for searching and retrieving Pixabay images and videos released under Creative Commons CC0	230	{Web}	https://pixabay.com/api/docs/	\N	1	approved	2026-01-18 16:45:14.422866	\N	\N	Open Tools	\N	\N	\N	api
2053	Unsplash Resource	A simple API for embedding [Unsplash](https://unsplash.com/) photos	230	{Web}	https://source.unsplash.com/	\N	1	approved	2026-01-18 16:45:14.42529	\N	\N	Open Tools	\N	\N	\N	api
2054	Yelp	Access to Yelp's API	231	{Web}	https://www.yelp.com/developers/documentation/v2/overview	\N	1	approved	2026-01-18 16:45:14.426808	\N	\N	Open Tools	\N	\N	\N	api
2055	Zomato	Zomato APIs give you access to the freshest and most exhaustive information for over 1.5 million restaurants across 10,000 cities globally	231	{Web}	https://developers.zomato.com/api	\N	1	approved	2026-01-18 16:45:14.427688	\N	\N	Open Tools	\N	\N	\N	api
2059	Foursquare	The Foursquare API gives you access to our world-class places database and the ability to interact with Foursquare users and merchants	232	{Web}	https://developer.foursquare.com/	\N	1	approved	2026-01-18 16:45:14.431488	\N	\N	Open Tools	\N	\N	\N	api
2062	Pinterest	The Pinterest API lets you access users' Pinterest data, like their boards, Pins, followers and more	232	{Web}	https://developers.pinterest.com/	\N	1	approved	2026-01-18 16:45:14.4339	\N	\N	Open Tools	\N	\N	\N	api
2066	Amazon	Access to Amazon's APIs	233	{Web}	https://developer.amazon.com/services-and-apis	\N	1	approved	2026-01-18 16:45:14.437937	\N	\N	Open Tools	\N	\N	\N	api
2067	Best Buy	Access to Best Buy's APIs	233	{Web}	https://developer.bestbuy.com/	\N	1	approved	2026-01-18 16:45:14.438673	\N	\N	Open Tools	\N	\N	\N	api
2068	Dangdang	Access to Dangdang's APIs	233	{Web}	http://open.dangdang.com/	\N	1	approved	2026-01-18 16:45:14.439393	\N	\N	Open Tools	\N	\N	\N	api
2069	eBay	Access to eBay's APIs	233	{Web}	https://go.developer.ebay.com/	\N	1	approved	2026-01-18 16:45:14.440073	\N	\N	Open Tools	\N	\N	\N	api
2070	Home Depot	Access to Home Depot's APIs	233	{Web}	https://developer.homedepot.com/	\N	1	approved	2026-01-18 16:45:14.440789	\N	\N	Open Tools	\N	\N	\N	api
2071	JD	Access to JD's APIs	233	{Web}	https://jos.jd.com/api/index.htm	\N	1	approved	2026-01-18 16:45:14.441602	\N	\N	Open Tools	\N	\N	\N	api
2072	Semantics3	Access to Semantics3's RESTful APIs	233	{Web}	http://docs.semantics3.com/reference	\N	1	approved	2026-01-18 16:45:14.442347	\N	\N	Open Tools	\N	\N	\N	api
2073	Slice	Access to Slice's REST APIs	233	{Web}	https://developer.slice.com/	\N	1	approved	2026-01-18 16:45:14.443108	\N	\N	Open Tools	\N	\N	\N	api
2074	Taobao	Access to Taobao's APIs	233	{Web}	https://open.taobao.com/doc2/api_list.htm	\N	1	approved	2026-01-18 16:45:14.443889	\N	\N	Open Tools	\N	\N	\N	api
2081	Teambition	Teambition's Open Platform offers complete set of Open API for data acquisition. Building an app based on project data will make the most use of your collaboration data, such as project tracking, data mining and more	235	{Web}	https://www.teambition.com/developer/open-platform	\N	1	approved	2026-01-18 16:45:14.451992	\N	\N	Open Tools	\N	\N	\N	api
2084	Worktile	Access to Worktile's APIs.(**Missing English Docs**)	235	{Web}	https://dev.worktile.com/document/overview	\N	1	approved	2026-01-18 16:45:14.454624	\N	\N	Open Tools	\N	\N	\N	api
2086	Detect Language API	Automatic language identification for any texts	236	{Web}	https://rapidapi.com/BigLobster/api/language-identification-prediction	\N	1	approved	2026-01-18 16:45:14.456971	\N	\N	Open Tools	\N	\N	\N	api
2088	Text Analytics API	The Text Analytics API is a suite of text analytics web services built with best-in-class Microsoft machine learning algorithms	236	{Web}	https://azure.microsoft.com/en-us/services/cognitive-services/text-analytics/	\N	1	approved	2026-01-18 16:45:14.458652	\N	\N	Open Tools	\N	\N	\N	api
2090	Beeminder	Access to Beeminder's APIs	237	{Web}	https://www.beeminder.com/api	\N	1	approved	2026-01-18 16:45:14.461312	\N	\N	Open Tools	\N	\N	\N	api
2091	FollowUp.cc	Access to FollowUp.cc's APIs	237	{Web}	http://docs.followup.cc/	\N	1	approved	2026-01-18 16:45:14.462223	\N	\N	Open Tools	\N	\N	\N	api
2092	Toodledo	The Toodledo API is free to use and provides access to a user's tasks, notes, outlines and lists	237	{Web}	https://api.toodledo.com/3/	\N	1	approved	2026-01-18 16:45:14.46331	\N	\N	Open Tools	\N	\N	\N	api
2107	Narrative	Customize your clip, get players, badges, and play with the Narrative API	39	{Web}	http://open.getnarrative.com/	\N	1	approved	2026-01-18 16:45:14.476972	\N	\N	Open Tools	\N	\N	\N	api
2112	The Movie Database (TMDb)	The Movie Database API provides access to Top rated movies, Upcoming movies, Now playing movies, Popular movies, Popular TV shows, Top rated TV shows, On the air TV shows, Airing today TV shows, Popular people and more	39	{Web}	https://developers.themoviedb.org	\N	1	approved	2026-01-18 16:45:14.480838	\N	\N	Open Tools	\N	\N	\N	api
2117	Baidu Yuyin	Access to Baidu Yuyin's voice analysis REST APIs.(**Missing English Docs**)	241	{Web}	http://yuyin.baidu.com/docs	\N	1	approved	2026-01-18 16:45:14.485267	\N	\N	Open Tools	\N	\N	\N	api
2118	Cloud Speech API	Google Cloud Speech API enables developers to convert audio to text by applying powerful neural network models in an easy to use API	241	{Web}	https://cloud.google.com/speech/	\N	1	approved	2026-01-18 16:45:14.486067	\N	\N	Open Tools	\N	\N	\N	api
2120	clarifai	The Clarifai API offers image and video recognition as a service	242	{Web}	https://clarifai.com/developer/guide/	\N	1	approved	2026-01-18 16:45:14.48807	\N	\N	Open Tools	\N	\N	\N	api
2121	Cloud Vision API	Google Cloud Vision API enables developers to understand the content of an image by encapsulating powerful machine learning models in an easy to use REST API	242	{Web}	https://cloud.google.com/vision/	\N	1	approved	2026-01-18 16:45:14.488766	\N	\N	Open Tools	\N	\N	\N	api
2122	Computer Vision API	The Computer Vision API by Microsoft provides state-of-the-art algorithms to process images and return information	242	{Web}	https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/	\N	1	approved	2026-01-18 16:45:14.489471	\N	\N	Open Tools	\N	\N	\N	api
2125	wozhitu	Access to wozhitu's vision analysis APIs.(**Missing English Docs**)	242	{Web}	http://api1.wozhitu.com/	\N	1	approved	2026-01-18 16:45:14.491974	\N	\N	Open Tools	\N	\N	\N	api
2126	AccuWeather	The AccuWeather API provides subscribers access to location based weather data via a simple RESTful web interface	243	{Web}	http://apidev.accuweather.com/developers/	\N	1	approved	2026-01-18 16:45:14.493528	\N	\N	Open Tools	\N	\N	\N	api
2127	Aeris Weather	An advanced weather API to power all of your custom applications, offering a breath of fresh air from the basic to the most complex solutions	243	{Web}	http://www.aerisweather.com/develop/	\N	1	approved	2026-01-18 16:45:14.494358	\N	\N	Open Tools	\N	\N	\N	api
2136	Alidayu	Provides APIs which are available in China.(**Missing English Docs**)	244	{Web}	http://www.alidayu.com/	\N	1	approved	2026-01-18 16:45:14.502243	\N	\N	Open Tools	\N	\N	\N	api
2137	Amazon Developer	Allows to build software about the Amazon Apps&Games, the Alexa, the AWS, the Amazon Services&APIs and the Amazon Devices	244	{Web}	https://developer.amazon.com/	\N	1	approved	2026-01-18 16:45:14.503148	\N	\N	Open Tools	\N	\N	\N	api
2138	APiX	Provides some credit APIs which are available in China.(**Missing English Docs**)	244	{Web}	https://www.apix.cn/	\N	1	approved	2026-01-18 16:45:14.503889	\N	\N	Open Tools	\N	\N	\N	api
2139	Avatar Data	Provides APIs which are available in China.(**Missing English Docs**)	244	{Web}	http://www.avatardata.cn/Docs	\N	1	approved	2026-01-18 16:45:14.504574	\N	\N	Open Tools	\N	\N	\N	api
2140	Baidu API STORE	Provides APIs which are available in China.(**Missing English Docs**)	244	{Web}	http://apistore.baidu.com/	\N	1	approved	2026-01-18 16:45:14.505252	\N	\N	Open Tools	\N	\N	\N	api
2141	Datayes	Provides some financial APIs which are available in China.(**Missing English Docs**)	244	{Web}	https://m.datayes.com/	\N	1	approved	2026-01-18 16:45:14.505968	\N	\N	Open Tools	\N	\N	\N	api
2142	Google API Library	The Google API Library contains more than 100 apis such as the Google Cloud APIs, the Google Maps APIs, the Google Apps APIs, the Mobile APIs, the Social Media APIs, the Youtube APIs, the Advertising APIs, and the Other popular APIs	244	{Web}	https://console.developers.google.com/apis/library	\N	1	approved	2026-01-18 16:45:14.506931	\N	\N	Open Tools	\N	\N	\N	api
2143	HaoService	Provides APIs which are available in China.(**Missing English Docs**)	244	{Web}	http://www.haoservice.com/	\N	1	approved	2026-01-18 16:45:14.507719	\N	\N	Open Tools	\N	\N	\N	api
2144	iTunes Search API	Allows to place search fields in the website to search for content within the iTunes Store, App Store, iBooks Store and Mac App Store	244	{Web}	https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/	\N	1	approved	2026-01-18 16:45:14.508518	\N	\N	Open Tools	\N	\N	\N	api
2145	Microsoft Developer	Access to Microsoft's public APIs	244	{Web}	https://developer.microsoft.com/en-us/	\N	1	approved	2026-01-18 16:45:14.509173	\N	\N	Open Tools	\N	\N	\N	api
2146	Juhe Data	Provides APIs which are available in China.(**Missing English Docs**)	244	{Web}	https://www.juhe.cn/	\N	1	approved	2026-01-18 16:45:14.509967	\N	\N	Open Tools	\N	\N	\N	api
2147	ProgrammableWeb	The leading source of news & information about APIs, chronicling the evolution of the global API economy & providing the web's most relied-on API Directory	244	{Web}	https://www.programmableweb.com/	\N	1	approved	2026-01-18 16:45:14.510822	\N	\N	Open Tools	\N	\N	\N	api
2148	Yahoo! Developer Network	The Yahoo Developer Network offers APIs and tools to make it easy for developers to build, advertise, enhance applications and earn money with Yahoo	244	{Web}	https://developer.yahoo.com/everything.html	\N	1	approved	2026-01-18 16:45:14.511568	\N	\N	Open Tools	\N	\N	\N	api
2226	Apidog	All-in-one workspace for API design, testing, and documentation. 🪟 🍎 🐧	261	{Windows}	https://apidog.com	\N	1	approved	2026-01-18 16:58:09.223302	\N	\N	Freeware	\N	\N	\N	api
2227	Bruno	Offline API client that is fast, Git-friendly, and open source. 🪟 🍎 🐧 [🟢](https://github.com/usebruno/bruno)	261	{Windows}	https://www.usebruno.com	\N	1	approved	2026-01-18 16:58:09.224175	\N	\N	Freeware	\N	\N	\N	api
2228	Cocoa Rest Client	Native app for testing REST APIs. 🍎 [🟢](https://github.com/mmattozzi/cocoa-rest-client)	261	{Windows}	https://mmattozzi.github.io/cocoa-rest-client	\N	1	approved	2026-01-18 16:58:09.224952	\N	\N	Freeware	\N	\N	\N	api
2230	HTTPie	Command-line and GUI tool to simplify working with APIs. 🪟 🍎 🐧 [🟢](https://github.com/httpie)	261	{Windows}	https://httpie.io	\N	1	approved	2026-01-18 16:58:09.226595	\N	\N	Freeware	\N	\N	\N	api
2232	Katalon Studio	Testing automation for APIs, web, and mobile apps. 🪟 🍎 🐧	261	{Windows}	https://katalon.com	\N	1	approved	2026-01-18 16:58:09.22821	\N	\N	Freeware	\N	\N	\N	api
2233	Mockoon	Desktop tool for creating and testing mock REST APIs. 🪟 🍎 🐧 [🟢](https://github.com/mockoon/mockoon)	261	{Windows}	https://mockoon.com	\N	1	approved	2026-01-18 16:58:09.228974	\N	\N	Freeware	\N	\N	\N	api
2234	SoapUI Open Source	For testing REST and SOAP APIs with scripting support. 🪟 🍎 🐧 [🟢](https://github.com/SmartBear/soapui)	261	{Windows}	https://soapui.org	\N	1	approved	2026-01-18 16:58:09.22977	\N	\N	Freeware	\N	\N	\N	api
2236	Yaak	An offline and Git friendly API tester for HTTP, GraphQL, WebSockets, SSE, and gRPC. 🪟 🍎 🐧 [🟢](https://github.com/mountain-loop/yaak)	261	{Windows}	https://yaak.app	\N	1	approved	2026-01-18 16:58:09.23126	\N	\N	Freeware	\N	\N	\N	api
2237	Endpoint	Native macOS API client with WebSocket support, performance testing, and customizable themes. 🍎	261	{Windows}	https://apps.apple.com/tr/app/endpoint-http-client/id6755891816?mt=12	\N	1	approved	2026-01-18 16:58:09.231971	\N	\N	Freeware	\N	\N	\N	api
2417	Lantern	Internet freedom tool to bypass restrictions. 🪟 🍎 🐧	288	{Windows}	https://getlantern.org	\N	1	approved	2026-01-18 16:58:09.468168	\N	\N	Freeware	\N	\N	\N	api
2518	ExtendsClass	Online tools for developers (REST/SOAP clients, SQLite browser, Regex tester, XPath tester)	303	{Windows}	https://extendsclass.com/	\N	1	approved	2026-01-18 17:15:00.640147	\N	\N	Freeware	\N	\N	\N	api
2524	I'm Only Resting	A feature-rich WinForms-based HTTP client [](https://github.com/swensensoftware/im-only-resting)	303	{Windows}	https://github.com/SwensenSoftware/im-only-resting	\N	1	approved	2026-01-18 17:15:00.647367	\N	\N	Open Source	\N	\N	\N	api
2542	Velocity	Offline API Documentation Tool. (like [Dash](https://kapeli.com/dash) for macOS)	303	{Windows}	http://velocity.silverlakesoftware.com/	\N	1	approved	2026-01-18 17:15:00.664929	\N	\N	Unknown	\N	\N	\N	api
2643	`winreg-cli`	Command line tool with a fluent API for modifying Windows registry. ](https://github.com/notlmn/winreg-cli)	315	{Windows}	https://github.com/notlmn/winreg-cli	\N	1	approved	2026-01-18 17:15:00.779723	\N	\N	Freeware	\N	\N	\N	api
1966	Battle.net	Battle.net is an online video game Web site that features a collection of games developed by Blizzard Entertainment. The available Battle.net APIs include D3, WoW, SC2, Community APIs, and Game Data APIs	273	{Web}	https://dev.battle.net/	\N	1	approved	2026-01-18 16:45:14.351398	\N	\N	Open Tools	\N	\N	\N	api
1970	Google Play Games Services	The Google Developers Games site provides a variety of APIs, SDKs, and services including (but not limited to) game publishing API, Unity Plugin, Play Games Services (achievements, leaderboards, player stats, etc.), and Google AdMob	273	{Web}	https://developers.google.com/games/	\N	1	approved	2026-01-18 16:45:14.354265	\N	\N	Open Tools	\N	\N	\N	api
2110	Rotten Tomatoes	The Rotten Tomatoes API provides access to Rotten Tomatoes' ratings and reviews, allowing approved companies and individuals to enrich their applications and widgets with Rotten Tomatoes data	39	{Web}	https://developer.fandango.com/Rotten_Tomatoes	\N	1	approved	2026-01-18 16:45:14.479171	\N	\N	Open Tools	\N	\N	\N	api
1953	Outlook Mail	The Outlook Mail API lets you read, create, and send messages and attachments, view and respond to event messages, and manage folders that are secured by Azure Active Directory in Office 365. It also provides the same functionality in Microsoft accounts specifically in these domains: Hotmail.com, Live.com, MSN.com, Outlook.com, and Passport.com	30	{Web}	https://msdn.microsoft.com/en-us/office/office365/api/mail-rest-operations	\N	1	approved	2026-01-18 16:45:14.33883	\N	\N	Open Tools	\N	\N	\N	api
\.


--
-- TOC entry 3884 (class 0 OID 25961)
-- Dependencies: 263
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_tickets (id, order_id, buyer_id, seller_id, subject, description, status, priority, created_at, updated_at) FROM stdin;
pg_dump: processing data for table "public.support_tickets"
pg_dump: dumping contents of table "public.support_tickets"
\.


--
-- TOC entry 3886 (class 0 OID 25971)
-- Dependencies: 265
-- Data for Name: user_downloads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_downloads (id, user_id, software_id, version, downloaded_at) FROM stdin;
pg_dump: processing data for table "public.user_downloads"
pg_dump: dumping contents of table "public.user_downloads"
\.


--
-- TOC entry 3888 (class 0 OID 25978)
-- Dependencies: 267
-- Data for Name: user_presence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_presence (id, user_id, is_online, last_seen, socket_id, created_at, updated_at) FROM stdin;
pg_dump: processing data for table "public.user_presence"
pg_dump: dumping contents of table "public.user_presence"
pg_dump: processing data for table "public.users"
pg_dump: dumping contents of table "public.users"
65	2	f	2025-08-09 11:43:53.172	f3pb1xOjSX96a55RAAAD	2025-08-07 16:33:26.021544	2025-08-07 16:33:26.021544
58	2	f	2025-08-09 11:43:53.172	ifx9__vEmWREHBwSAAAD	2025-08-07 16:27:45.557939	2025-08-07 16:27:45.557939
6	2	f	2025-08-09 11:43:53.172	oFawfusIHxDfpL0TAAAF	2025-08-06 13:34:46.264817	2025-08-06 13:34:46.264817
45	2	f	2025-08-09 11:43:53.172	bYI0RHixiZ08_845AAAH	2025-08-07 16:08:22.858473	2025-08-07 16:08:22.858473
46	2	f	2025-08-09 11:43:53.172	UqaLNwDFUA2-RvwwAAAJ	2025-08-07 16:08:26.973612	2025-08-07 16:08:26.973612
48	2	f	2025-08-09 11:43:53.172	fZt7Blf0f4lTdyd-AAAN	2025-08-07 16:08:47.292903	2025-08-07 16:08:47.292903
52	2	f	2025-08-09 11:43:53.172	y-L3xnuMlfupHNAzAAAD	2025-08-07 16:14:09.046089	2025-08-07 16:14:09.046089
55	2	f	2025-08-09 11:43:53.172	01VJSeTCfeoGkNPPAAAJ	2025-08-07 16:16:09.264286	2025-08-07 16:16:09.264286
60	2	f	2025-08-09 11:43:53.172	UoSnBsKZwpAZLsd9AAAH	2025-08-07 16:30:03.8255	2025-08-07 16:30:03.8255
62	2	f	2025-08-09 11:43:53.172	3EMDAWrNg0S7cvf4AAAL	2025-08-07 16:30:07.903029	2025-08-07 16:30:07.903029
66	2	f	2025-08-09 11:43:53.172	vHwtApolCGyZe7eUAAAF	2025-08-07 16:33:31.471385	2025-08-07 16:33:31.471385
68	2	f	2025-08-09 11:43:53.172	71L9Dw7XjriaxQIbAAAJ	2025-08-07 16:36:13.831333	2025-08-07 16:36:13.831333
74	2	f	2025-08-09 11:43:53.172	274AgTm4HZlj0DgqAAAF	2025-08-07 16:37:52.055773	2025-08-07 16:37:52.055773
79	2	f	2025-08-09 11:43:53.172	2I3PVPze6PmsqXPmAAAB	2025-08-09 11:43:50.785616	2025-08-09 11:43:50.785616
73	2	f	2025-08-09 11:43:53.172	3N7QRVsmsJ0d3Ns1AAAD	2025-08-07 16:37:49.311171	2025-08-07 16:37:49.311171
43	2	f	2025-08-09 11:43:53.172	j9Vg_3CLKaHDLfu2AAAD	2025-08-07 16:06:51.001361	2025-08-07 16:06:51.001361
44	2	f	2025-08-09 11:43:53.172	cnSlqoJQK3SMiRylAAAF	2025-08-07 16:06:58.132854	2025-08-07 16:06:58.132854
47	2	f	2025-08-09 11:43:53.172	AgRWfKgmuEjEjeFxAAAL	2025-08-07 16:08:42.657197	2025-08-07 16:08:42.657197
49	2	f	2025-08-09 11:43:53.172	tm7hJK_aXelyrnNwAAAP	2025-08-07 16:11:44.140616	2025-08-07 16:11:44.140616
53	2	f	2025-08-09 11:43:53.172	5-kbLtArNh4sR96hAAAF	2025-08-07 16:14:24.400548	2025-08-07 16:14:24.400548
54	2	f	2025-08-09 11:43:53.172	2MCIB7A6mXiuND5VAAAH	2025-08-07 16:14:31.094767	2025-08-07 16:14:31.094767
56	2	f	2025-08-09 11:43:53.172	M5U4EO50du_lXgy0AAAL	2025-08-07 16:16:12.535194	2025-08-07 16:16:12.535194
59	2	f	2025-08-09 11:43:53.172	YUMhJXdY5yJIHDHHAAAF	2025-08-07 16:27:54.879078	2025-08-07 16:27:54.879078
70	2	f	2025-08-09 11:43:53.172	Qixuz8wkQud2Lg96AAAN	2025-08-07 16:36:17.824343	2025-08-07 16:36:17.824343
76	2	f	2025-08-09 11:43:53.172	tFg0MHj5SLuGzOqvAAAJ	2025-08-07 16:48:53.950775	2025-08-07 16:48:53.950775
77	2	f	2025-08-09 11:43:53.172	C_V8r6715A-7qoE2AAAL	2025-08-07 16:55:45.501847	2025-08-07 16:55:45.501847
78	2	f	2025-08-09 11:43:53.172	CFW2p5mE0uJHmyA4AAAN	2025-08-07 17:09:42.236274	2025-08-07 17:09:42.236274
72	1	f	2025-08-23 15:35:01.264	t74YlxgACmWBwS6bAAAB	2025-08-07 16:37:25.926567	2025-08-07 16:37:25.926567
41	1	f	2025-08-23 15:35:01.264	G1q4u4RvN_QbKqD1AAAB	2025-08-07 14:50:18.773781	2025-08-07 14:50:18.773781
42	1	f	2025-08-23 15:35:01.264	FJ_4lCQ7emmNu1TVAAAB	2025-08-07 16:05:47.74164	2025-08-07 16:05:47.74164
50	1	f	2025-08-23 15:35:01.264	v5LJQGjKahzK2SZ_AAAR	2025-08-07 16:11:46.836378	2025-08-07 16:11:46.836378
61	1	f	2025-08-23 15:35:01.264	7tadh7M7pUSvIS7oAAAJ	2025-08-07 16:30:06.955882	2025-08-07 16:30:06.955882
69	1	f	2025-08-23 15:35:01.264	Gyf3DmwDfFGX7dZ1AAAL	2025-08-07 16:36:14.823926	2025-08-07 16:36:14.823926
64	1	f	2025-08-23 15:35:01.264	Zd5ELIiOk1Fqps4iAAAB	2025-08-07 16:32:55.796954	2025-08-07 16:32:55.796954
57	1	f	2025-08-23 15:35:01.264	fit1dmdm_liNd2RHAAAB	2025-08-07 16:27:05.349722	2025-08-07 16:27:05.349722
51	1	f	2025-08-23 15:35:01.264	bvM2ENk-jiJ7t9vTAAAB	2025-08-07 16:13:38.878692	2025-08-07 16:13:38.878692
63	1	f	2025-08-23 15:35:01.264	FA6oQAu5K28itqDUAAAN	2025-08-07 16:30:30.826814	2025-08-07 16:30:30.826814
67	1	f	2025-08-23 15:35:01.264	QOM25xpJX7tu0KfoAAAH	2025-08-07 16:33:59.911009	2025-08-07 16:33:59.911009
71	1	f	2025-08-23 15:35:01.264	lhcL7AoBSl0D2XehAAAP	2025-08-07 16:36:19.822088	2025-08-07 16:36:19.822088
75	1	f	2025-08-23 15:35:01.264	LAbhuLPYwnzgVcDjAAAH	2025-08-07 16:38:36.374862	2025-08-07 16:38:36.374862
80	1	f	2025-08-23 15:35:01.264	Yf8lhLDUg-gOlivOAAAB	2025-08-23 14:11:04.04754	2025-08-23 14:11:04.04754
81	1	f	2025-08-23 15:35:01.264	vi9IPWO6jeaA1lDDAAAD	2025-08-23 14:11:06.570111	2025-08-23 14:11:06.570111
82	1	f	2025-08-23 15:35:01.264	x2Ig4kX-j-1yTbipAAAF	2025-08-23 14:11:22.729745	2025-08-23 14:11:22.729745
83	1	f	2025-08-23 15:35:01.264	A0gfIYCntSRUeSCcAAAH	2025-08-23 14:11:27.938791	2025-08-23 14:11:27.938791
84	1	f	2025-08-23 15:35:01.264	UP3VQ9vddei4fk_pAAAB	2025-08-23 14:24:09.822172	2025-08-23 14:24:09.822172
85	1	f	2025-08-23 15:35:01.264	7seQJSx49n9h_gO2AAAD	2025-08-23 14:24:22.610525	2025-08-23 14:24:22.610525
86	1	f	2025-08-23 15:35:01.264	8uwSk_Bm-W_CTD2gAAAF	2025-08-23 14:24:24.864319	2025-08-23 14:24:24.864319
\.


--
-- TOC entry 3890 (class 0 OID 25988)
-- Dependencies: 269
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, profile_data, updated_at, created_at, phone, email_verified, phone_verified, reset_token, reset_token_expires) FROM stdin;
2	Test Seller	seller@test.com	testpassword	seller	\N	2025-08-02 06:54:50.055965	2025-08-02 06:54:50.055965	\N	f	f	\N	\N
3	Test Buyer	buyer@test.com	testpassword	buyer	\N	2025-08-02 06:54:50.055965	2025-08-02 06:54:50.055965	\N	f	f	\N	\N
13	Test Admin	test@admin.com	3745ea500285146bd710103ffa96074740dfbf8b11be893880936d3b50c9cc479b3ebababe9f856f03cf90d8fd66e3180ae20a180d9c7b647ff0c7e3be60c34.d84debb4b45eafe9c660e3c0496b4875	admin	\N	2025-09-02 08:42:28.402049	2025-09-02 08:42:28.402049	\N	t	f	\N	\N
12	tran manh cuong	cuongtm2012@gmail.com	Cuongtm2012$	seller	\N	2025-08-10 03:50:34.486592	2025-08-10 03:50:34.486592	\N	f	f	5e14cab874db9a6a515ea0385e519017bafdbee0982e95d6d039d6d994c8ac0c	2026-01-04 03:20:55.598
1	Administrator	cuongeurovnn@gmail.com	a1308afa92c062f113d233772b673f6fc8d5cb415553340d1a411c195c26f51a662f95953f57b0323ae78e5d00f868a391410864dfd8b9bf64d058119fc75035.666e97961ee31d2db66528751ed8514e	admin	\N	2025-08-01 10:38:37.709281	2025-08-01 10:38:37.709281	\N	f	f	2e8d431d5e6c05dd201db7cf1b7f19cd26eff6992a8fc006d06b324a49f487e6	2026-01-04 03:22:57.957
\.


--
-- TOC entry 3936 (class 0 OID 0)
-- Dependencies: 215
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 1, false);


--
-- TOC entry 3937 (class 0 OID 0)
-- Dependencies: 217
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 319, true);


--
-- TOC entry 3938 (class 0 OID 0)
-- Dependencies: 219
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 37, true);


--
-- TOC entry 3939 (class 0 OID 0)
-- Dependencies: 221
-- Name: chat_room_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chat_room_members_id_seq', 4, true);


--
-- TOC entry 3940 (class 0 OID 0)
-- Dependencies: 223
-- Name: chat_rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chat_rooms_id_seq', 2, true);


--
-- TOC entry 3941 (class 0 OID 0)
-- Dependencies: 273
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_id_seq', 294, true);


--
-- TOC entry 3942 (class 0 OID 0)
-- Dependencies: 225
-- Name: external_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.external_requests_id_seq', 17, true);


--
-- TOC entry 3943 (class 0 OID 0)
-- Dependencies: 271
-- Name: fcm_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fcm_tokens_id_seq', 2, true);


--
-- TOC entry 3944 (class 0 OID 0)
-- Dependencies: 227
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- TOC entry 3945 (class 0 OID 0)
-- Dependencies: 229
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 5, true);


--
-- TOC entry 3946 (class 0 OID 0)
-- Dependencies: 231
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 16, true);


--
-- TOC entry 3947 (class 0 OID 0)
-- Dependencies: 233
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 16, true);


--
-- TOC entry 3948 (class 0 OID 0)
-- Dependencies: 235
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 16, true);


--
-- TOC entry 3949 (class 0 OID 0)
-- Dependencies: 237
-- Name: portfolio_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.portfolio_reviews_id_seq', 1, false);


--
-- TOC entry 3950 (class 0 OID 0)
-- Dependencies: 239
-- Name: portfolios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.portfolios_id_seq', 1, false);


--
-- TOC entry 3951 (class 0 OID 0)
-- Dependencies: 241
-- Name: product_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_reviews_id_seq', 1, false);


--
-- TOC entry 3952 (class 0 OID 0)
-- Dependencies: 243
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 9, true);


pg_dump: executing SEQUENCE SET cart_items_id_seq
pg_dump: executing SEQUENCE SET categories_id_seq
pg_dump: executing SEQUENCE SET chat_messages_id_seq
pg_dump: executing SEQUENCE SET chat_room_members_id_seq
pg_dump: executing SEQUENCE SET chat_rooms_id_seq
pg_dump: executing SEQUENCE SET courses_id_seq
pg_dump: executing SEQUENCE SET external_requests_id_seq
pg_dump: executing SEQUENCE SET fcm_tokens_id_seq
pg_dump: executing SEQUENCE SET messages_id_seq
pg_dump: executing SEQUENCE SET notifications_id_seq
pg_dump: executing SEQUENCE SET order_items_id_seq
pg_dump: executing SEQUENCE SET orders_id_seq
pg_dump: executing SEQUENCE SET payments_id_seq
pg_dump: executing SEQUENCE SET portfolio_reviews_id_seq
pg_dump: executing SEQUENCE SET portfolios_id_seq
pg_dump: executing SEQUENCE SET product_reviews_id_seq
pg_dump: executing SEQUENCE SET products_id_seq
pg_dump: executing SEQUENCE SET quotes_id_seq
pg_dump: executing SEQUENCE SET reviews_id_seq
pg_dump: executing SEQUENCE SET sales_analytics_id_seq
pg_dump: executing SEQUENCE SET seller_profiles_id_seq
--
-- TOC entry 3953 (class 0 OID 0)
-- Dependencies: 245
-- Name: quotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quotes_id_seq', 1, false);


--
-- TOC entry 3954 (class 0 OID 0)
-- Dependencies: 247
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- TOC entry 3955 (class 0 OID 0)
-- Dependencies: 249
-- Name: sales_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_analytics_id_seq', 1, false);


--
-- TOC entry 3956 (class 0 OID 0)
-- Dependencies: 251
-- Name: seller_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seller_profiles_id_seq', 2, true);


pg_dump: executing SEQUENCE SET service_payments_id_seq
pg_dump: executing SEQUENCE SET service_projects_id_seq
pg_dump: executing SEQUENCE SET service_quotations_id_seq
--
-- TOC entry 3957 (class 0 OID 0)
-- Dependencies: 253
-- Name: service_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.service_payments_id_seq', 1, false);


--
-- TOC entry 3958 (class 0 OID 0)
-- Dependencies: 255
-- Name: service_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.service_projects_id_seq', 1, false);


--
-- TOC entry 3959 (class 0 OID 0)
-- Dependencies: 257
-- Name: service_quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.service_quotations_id_seq', 1, false);


pg_dump: executing SEQUENCE SET service_requests_id_seq
pg_dump: executing SEQUENCE SET softwares_id_seq
--
-- TOC entry 3960 (class 0 OID 0)
-- Dependencies: 259
-- Name: service_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.service_requests_id_seq', 1, false);


--
-- TOC entry 3961 (class 0 OID 0)
-- Dependencies: 262
-- Name: softwares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.softwares_id_seq', 2672, true);


--
-- TOC entry 3962 (class 0 OID 0)
-- Dependencies: 264
-- Name: support_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.support_tickets_id_seq', 1, false);


--
-- TOC entry 3963 (class 0 OID 0)
-- Dependencies: 266
-- Name: user_downloads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_downloads_id_seq', 1, false);


--
-- TOC entry 3964 (class 0 OID 0)
-- Dependencies: 268
-- Name: user_presence_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_presence_id_seq', 86, true);


--
-- TOC entry 3965 (class 0 OID 0)
-- Dependencies: 270
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- TOC entry 3566 (class 2606 OID 26028)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3568 (class 2606 OID 26030)
-- Name: categories categories_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_unique UNIQUE (name);


--
-- TOC entry 3570 (class 2606 OID 26032)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3572 (class 2606 OID 26034)
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 3574 (class 2606 OID 26036)
-- Name: chat_room_members chat_room_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_members
    ADD CONSTRAINT chat_room_members_pkey PRIMARY KEY (id);


--
-- TOC entry 3576 (class 2606 OID 26038)
-- Name: chat_rooms chat_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT chat_rooms_pkey PRIMARY KEY (id);


--
-- TOC entry 3644 (class 2606 OID 34575)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- TOC entry 3578 (class 2606 OID 26040)
-- Name: external_requests external_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_requests
    ADD CONSTRAINT external_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 3637 (class 2606 OID 26338)
-- Name: fcm_tokens fcm_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fcm_tokens
    ADD CONSTRAINT fcm_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3639 (class 2606 OID 26340)
-- Name: fcm_tokens fcm_tokens_user_id_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fcm_tokens
    ADD CONSTRAINT fcm_tokens_user_id_token_key UNIQUE (user_id, token);


--
-- TOC entry 3580 (class 2606 OID 26042)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 3585 (class 2606 OID 26044)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3587 (class 2606 OID 26046)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3589 (class 2606 OID 26048)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3591 (class 2606 OID 26050)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 3593 (class 2606 OID 26052)
-- Name: portfolio_reviews portfolio_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_reviews
    ADD CONSTRAINT portfolio_reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 3595 (class 2606 OID 26054)
-- Name: portfolios portfolios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_pkey PRIMARY KEY (id);


pg_dump: executing SEQUENCE SET support_tickets_id_seq
pg_dump: executing SEQUENCE SET user_downloads_id_seq
pg_dump: executing SEQUENCE SET user_presence_id_seq
pg_dump: executing SEQUENCE SET users_id_seq
pg_dump: creating CONSTRAINT "public.cart_items cart_items_pkey"
pg_dump: creating CONSTRAINT "public.categories categories_name_unique"
pg_dump: creating CONSTRAINT "public.categories categories_pkey"
pg_dump: creating CONSTRAINT "public.chat_messages chat_messages_pkey"
pg_dump: creating CONSTRAINT "public.chat_room_members chat_room_members_pkey"
pg_dump: creating CONSTRAINT "public.chat_rooms chat_rooms_pkey"
pg_dump: creating CONSTRAINT "public.courses courses_pkey"
pg_dump: creating CONSTRAINT "public.external_requests external_requests_pkey"
pg_dump: creating CONSTRAINT "public.fcm_tokens fcm_tokens_pkey"
pg_dump: creating CONSTRAINT "public.fcm_tokens fcm_tokens_user_id_token_key"
pg_dump: creating CONSTRAINT "public.messages messages_pkey"
pg_dump: creating CONSTRAINT "public.notifications notifications_pkey"
pg_dump: creating CONSTRAINT "public.order_items order_items_pkey"
pg_dump: creating CONSTRAINT "public.orders orders_pkey"
pg_dump: creating CONSTRAINT "public.payments payments_pkey"
pg_dump: creating CONSTRAINT "public.portfolio_reviews portfolio_reviews_pkey"
pg_dump: creating CONSTRAINT "public.portfolios portfolios_pkey"
pg_dump: creating CONSTRAINT "public.product_reviews product_reviews_pkey"
pg_dump: creating CONSTRAINT "public.products products_pkey"
pg_dump: creating CONSTRAINT "public.quotes quotes_pkey"
pg_dump: creating CONSTRAINT "public.reviews reviews_pkey"
pg_dump: creating CONSTRAINT "public.sales_analytics sales_analytics_pkey"
pg_dump: creating CONSTRAINT "public.seller_profiles seller_profiles_pkey"
pg_dump: creating CONSTRAINT "public.seller_profiles seller_profiles_user_id_key"
pg_dump: creating CONSTRAINT "public.service_payments service_payments_pkey"
--
-- TOC entry 3597 (class 2606 OID 26056)
-- Name: product_reviews product_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 3599 (class 2606 OID 26058)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 3603 (class 2606 OID 26060)
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- TOC entry 3605 (class 2606 OID 26062)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 3607 (class 2606 OID 26064)
-- Name: sales_analytics sales_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_analytics
    ADD CONSTRAINT sales_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 3609 (class 2606 OID 26066)
-- Name: seller_profiles seller_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_profiles
    ADD CONSTRAINT seller_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 3611 (class 2606 OID 26068)
-- Name: seller_profiles seller_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_profiles
    ADD CONSTRAINT seller_profiles_user_id_key UNIQUE (user_id);


--
-- TOC entry 3613 (class 2606 OID 26070)
-- Name: service_payments service_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_payments
    ADD CONSTRAINT service_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 3615 (class 2606 OID 26072)
-- Name: service_projects service_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_projects
    ADD CONSTRAINT service_projects_pkey PRIMARY KEY (id);


pg_dump: creating CONSTRAINT "public.service_projects service_projects_pkey"
pg_dump: creating CONSTRAINT "public.service_quotations service_quotations_pkey"
pg_dump: creating CONSTRAINT "public.service_requests service_requests_pkey"
--
-- TOC entry 3617 (class 2606 OID 26074)
-- Name: service_quotations service_quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_quotations
    ADD CONSTRAINT service_quotations_pkey PRIMARY KEY (id);


--
-- TOC entry 3619 (class 2606 OID 26076)
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 3622 (class 2606 OID 26078)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 3625 (class 2606 OID 26080)
-- Name: softwares softwares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.softwares
    ADD CONSTRAINT softwares_pkey PRIMARY KEY (id);


--
-- TOC entry 3627 (class 2606 OID 26082)
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 3629 (class 2606 OID 26084)
-- Name: user_downloads user_downloads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_downloads
    ADD CONSTRAINT user_downloads_pkey PRIMARY KEY (id);


--
-- TOC entry 3631 (class 2606 OID 26086)
-- Name: user_presence user_presence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_presence
    ADD CONSTRAINT user_presence_pkey PRIMARY KEY (id);


--
-- TOC entry 3633 (class 2606 OID 26088)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 3635 (class 2606 OID 26090)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3620 (class 1259 OID 26091)
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- TOC entry 3645 (class 1259 OID 34577)
-- Name: idx_courses_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courses_status ON public.courses USING btree (status);


--
-- TOC entry 3646 (class 1259 OID 34576)
-- Name: idx_courses_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courses_topic ON public.courses USING btree (topic);


--
-- TOC entry 3640 (class 1259 OID 26342)
-- Name: idx_fcm_tokens_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fcm_tokens_active ON public.fcm_tokens USING btree (active);


--
-- TOC entry 3641 (class 1259 OID 26346)
-- Name: idx_fcm_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fcm_tokens_token ON public.fcm_tokens USING btree (token);


pg_dump: creating CONSTRAINT "public.session session_pkey"
pg_dump: creating CONSTRAINT "public.softwares softwares_pkey"
pg_dump: creating CONSTRAINT "public.support_tickets support_tickets_pkey"
pg_dump: creating CONSTRAINT "public.user_downloads user_downloads_pkey"
pg_dump: creating CONSTRAINT "public.user_presence user_presence_pkey"
pg_dump: creating CONSTRAINT "public.users users_email_unique"
pg_dump: creating CONSTRAINT "public.users users_pkey"
pg_dump: creating INDEX "public.IDX_session_expire"
pg_dump: creating INDEX "public.idx_courses_status"
pg_dump: creating INDEX "public.idx_courses_topic"
pg_dump: creating INDEX "public.idx_fcm_tokens_active"
pg_dump: creating INDEX "public.idx_fcm_tokens_token"
pg_dump: creating INDEX "public.idx_fcm_tokens_user_id"
--
-- TOC entry 3642 (class 1259 OID 26341)
-- Name: idx_fcm_tokens_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fcm_tokens_user_id ON public.fcm_tokens USING btree (user_id);


--
-- TOC entry 3581 (class 1259 OID 26344)
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);


--
-- TOC entry 3582 (class 1259 OID 26345)
-- Name: idx_notifications_read_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_read_at ON public.notifications USING btree (read_at);


--
-- TOC entry 3583 (class 1259 OID 26343)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- TOC entry 3600 (class 1259 OID 26348)
-- Name: idx_quotes_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quotes_project_id ON public.quotes USING btree (project_id);


--
-- TOC entry 3601 (class 1259 OID 26349)
-- Name: idx_quotes_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quotes_status ON public.quotes USING btree (status);


--
-- TOC entry 3623 (class 1259 OID 42738)
-- Name: idx_softwares_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_softwares_type ON public.softwares USING btree (type);


--
-- TOC entry 3647 (class 2606 OID 26092)
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3648 (class 2606 OID 26097)
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3649 (class 2606 OID 26102)
-- Name: chat_messages chat_messages_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id);


--
-- TOC entry 3650 (class 2606 OID 26107)
-- Name: chat_messages chat_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- TOC entry 3651 (class 2606 OID 26112)
-- Name: chat_room_members chat_room_members_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_members
    ADD CONSTRAINT chat_room_members_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id);


--
-- TOC entry 3652 (class 2606 OID 26117)
-- Name: chat_room_members chat_room_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room_members
    ADD CONSTRAINT chat_room_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3653 (class 2606 OID 26122)
-- Name: chat_rooms chat_rooms_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT chat_rooms_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3654 (class 2606 OID 26127)
-- Name: external_requests external_requests_assigned_developer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_requests
    ADD CONSTRAINT external_requests_assigned_developer_id_fkey FOREIGN KEY (assigned_developer_id) REFERENCES public.users(id);


--
-- TOC entry 3655 (class 2606 OID 26132)
-- Name: external_requests external_requests_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_requests
    ADD CONSTRAINT external_requests_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- TOC entry 3656 (class 2606 OID 26137)
-- Name: messages messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- TOC entry 3657 (class 2606 OID 26142)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3658 (class 2606 OID 26147)
-- Name: order_items order_items_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 3659 (class 2606 OID 26152)
-- Name: order_items order_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3660 (class 2606 OID 26157)
-- Name: orders orders_buyer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_buyer_id_users_id_fk FOREIGN KEY (buyer_id) REFERENCES public.users(id);


--
-- TOC entry 3661 (class 2606 OID 26162)
-- Name: orders orders_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- TOC entry 3662 (class 2606 OID 26167)
-- Name: payments payments_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 3663 (class 2606 OID 26172)
-- Name: portfolio_reviews portfolio_reviews_portfolio_id_portfolios_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_reviews
    ADD CONSTRAINT portfolio_reviews_portfolio_id_portfolios_id_fk FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id);


--
-- TOC entry 3664 (class 2606 OID 26177)
-- Name: portfolio_reviews portfolio_reviews_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_reviews
    ADD CONSTRAINT portfolio_reviews_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3665 (class 2606 OID 26182)
-- Name: portfolios portfolios_developer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_developer_id_users_id_fk FOREIGN KEY (developer_id) REFERENCES public.users(id);


--
-- TOC entry 3666 (class 2606 OID 26187)
-- Name: product_reviews product_reviews_buyer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_buyer_id_users_id_fk FOREIGN KEY (buyer_id) REFERENCES public.users(id);


--
-- TOC entry 3667 (class 2606 OID 26192)
-- Name: product_reviews product_reviews_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 3668 (class 2606 OID 26197)
-- Name: product_reviews product_reviews_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3669 (class 2606 OID 26202)
-- Name: products products_seller_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_seller_id_users_id_fk FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- TOC entry 3670 (class 2606 OID 26207)
-- Name: quotes quotes_developer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_developer_id_users_id_fk FOREIGN KEY (developer_id) REFERENCES public.users(id);


--
-- TOC entry 3671 (class 2606 OID 26212)
-- Name: reviews reviews_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3672 (class 2606 OID 26217)
-- Name: sales_analytics sales_analytics_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_analytics
    ADD CONSTRAINT sales_analytics_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3673 (class 2606 OID 26222)
-- Name: sales_analytics sales_analytics_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_analytics
    ADD CONSTRAINT sales_analytics_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- TOC entry 3674 (class 2606 OID 26227)
-- Name: seller_profiles seller_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_profiles
    ADD CONSTRAINT seller_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3675 (class 2606 OID 26232)
-- Name: service_payments service_payments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_payments
    ADD CONSTRAINT service_payments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- TOC entry 3676 (class 2606 OID 26237)
-- Name: service_payments service_payments_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_payments
    ADD CONSTRAINT service_payments_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.service_quotations(id);


--
-- TOC entry 3677 (class 2606 OID 26242)
-- Name: service_payments service_payments_service_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_payments
    ADD CONSTRAINT service_payments_service_project_id_fkey FOREIGN KEY (service_project_id) REFERENCES public.service_projects(id);


--
-- TOC entry 3678 (class 2606 OID 26247)
-- Name: service_projects service_projects_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_projects
    ADD CONSTRAINT service_projects_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- TOC entry 3679 (class 2606 OID 26252)
-- Name: service_projects service_projects_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_projects
    ADD CONSTRAINT service_projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- TOC entry 3680 (class 2606 OID 26257)
-- Name: service_projects service_projects_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_projects
    ADD CONSTRAINT service_projects_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.service_quotations(id);


--
-- TOC entry 3681 (class 2606 OID 26262)
-- Name: service_projects service_projects_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_projects
    ADD CONSTRAINT service_projects_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id);


pg_dump: creating INDEX "public.idx_notifications_created_at"
pg_dump: creating INDEX "public.idx_notifications_read_at"
pg_dump: creating INDEX "public.idx_notifications_user_id"
pg_dump: creating INDEX "public.idx_quotes_project_id"
pg_dump: creating INDEX "public.idx_quotes_status"
pg_dump: creating INDEX "public.idx_softwares_type"
pg_dump: creating FK CONSTRAINT "public.cart_items cart_items_product_id_fkey"
pg_dump: creating FK CONSTRAINT "public.cart_items cart_items_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.chat_messages chat_messages_room_id_fkey"
pg_dump: creating FK CONSTRAINT "public.chat_messages chat_messages_sender_id_fkey"
pg_dump: creating FK CONSTRAINT "public.chat_room_members chat_room_members_room_id_fkey"
pg_dump: creating FK CONSTRAINT "public.chat_room_members chat_room_members_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.chat_rooms chat_rooms_created_by_fkey"
pg_dump: creating FK CONSTRAINT "public.external_requests external_requests_assigned_developer_id_fkey"
pg_dump: creating FK CONSTRAINT "public.external_requests external_requests_client_id_fkey"
pg_dump: creating FK CONSTRAINT "public.messages messages_sender_id_users_id_fk"
pg_dump: creating FK CONSTRAINT "public.notifications notifications_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.order_items order_items_order_id_orders_id_fk"
pg_dump: creating FK CONSTRAINT "public.order_items order_items_product_id_products_id_fk"
pg_dump: creating FK CONSTRAINT "public.orders orders_buyer_id_users_id_fk"
pg_dump: creating FK CONSTRAINT "public.orders orders_seller_id_fkey"
pg_dump: creating FK CONSTRAINT "public.payments payments_order_id_orders_id_fk"
pg_dump: creating FK CONSTRAINT "public.portfolio_reviews portfolio_reviews_portfolio_id_portfolios_id_fk"
pg_dump: creating FK CONSTRAINT "public.portfolio_reviews portfolio_reviews_user_id_users_id_fk"
pg_dump: creating FK CONSTRAINT "public.portfolios portfolios_developer_id_users_id_fk"
pg_dump: creating FK CONSTRAINT "public.product_reviews product_reviews_buyer_id_users_id_fk"
pg_dump: creating FK CONSTRAINT "public.product_reviews product_reviews_order_id_orders_id_fk"
pg_dump: creating FK CONSTRAINT "public.product_reviews product_reviews_product_id_products_id_fk"
pg_dump: creating FK CONSTRAINT "public.products products_seller_id_users_id_fk"
pg_dump: creating FK CONSTRAINT "public.quotes quotes_developer_id_users_id_fk"
pg_dump: creating FK CONSTRAINT "public.reviews reviews_user_id_users_id_fk"
pg_dump: creating FK CONSTRAINT "public.sales_analytics sales_analytics_product_id_fkey"
pg_dump: creating FK CONSTRAINT "public.sales_analytics sales_analytics_seller_id_fkey"
pg_dump: creating FK CONSTRAINT "public.seller_profiles seller_profiles_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.service_payments service_payments_client_id_fkey"
pg_dump: creating FK CONSTRAINT "public.service_payments service_payments_quotation_id_fkey"
pg_dump: creating FK CONSTRAINT "public.service_payments service_payments_service_project_id_fkey"
pg_dump: creating FK CONSTRAINT "public.service_projects service_projects_admin_id_fkey"
pg_dump: creating FK CONSTRAINT "public.service_projects service_projects_client_id_fkey"
pg_dump: creating FK CONSTRAINT "public.service_projects service_projects_quotation_id_fkey"
pg_dump: creating FK CONSTRAINT "public.service_projects service_projects_service_request_id_fkey"
pg_dump: creating FK CONSTRAINT "public.service_quotations service_quotations_admin_id_fkey"
pg_dump: creating FK CONSTRAINT "public.service_quotations service_quotations_service_request_id_fkey"
pg_dump: creating FK CONSTRAINT "public.service_requests service_requests_client_id_fkey"
pg_dump: creating FK CONSTRAINT "public.softwares softwares_category_id_categories_id_fk"
pg_dump: creating FK CONSTRAINT "public.softwares softwares_created_by_users_id_fk"
--
-- TOC entry 3682 (class 2606 OID 26267)
-- Name: service_quotations service_quotations_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_quotations
    ADD CONSTRAINT service_quotations_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- TOC entry 3683 (class 2606 OID 26272)
-- Name: service_quotations service_quotations_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_quotations
    ADD CONSTRAINT service_quotations_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id);


--
-- TOC entry 3684 (class 2606 OID 26277)
-- Name: service_requests service_requests_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- TOC entry 3685 (class 2606 OID 26282)
-- Name: softwares softwares_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.softwares
    ADD CONSTRAINT softwares_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


pg_dump: creating FK CONSTRAINT "public.support_tickets support_tickets_buyer_id_fkey"
pg_dump: creating FK CONSTRAINT "public.support_tickets support_tickets_order_id_fkey"
pg_dump: creating FK CONSTRAINT "public.support_tickets support_tickets_seller_id_fkey"
--
-- TOC entry 3686 (class 2606 OID 26287)
-- Name: softwares softwares_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.softwares
    ADD CONSTRAINT softwares_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3687 (class 2606 OID 26292)
-- Name: support_tickets support_tickets_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id);


--
-- TOC entry 3688 (class 2606 OID 26297)
-- Name: support_tickets support_tickets_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 3689 (class 2606 OID 26302)
-- Name: support_tickets support_tickets_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- TOC entry 3690 (class 2606 OID 26307)
-- Name: user_downloads user_downloads_software_id_softwares_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_downloads
    ADD CONSTRAINT user_downloads_software_id_softwares_id_fk FOREIGN KEY (software_id) REFERENCES public.softwares(id);


pg_dump: creating FK CONSTRAINT "public.user_downloads user_downloads_software_id_softwares_id_fk"
pg_dump: creating FK CONSTRAINT "public.user_downloads user_downloads_user_id_users_id_fk"
pg_dump: creating FK CONSTRAINT "public.user_presence user_presence_user_id_fkey"
--
-- TOC entry 3691 (class 2606 OID 26312)
-- Name: user_downloads user_downloads_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_downloads
    ADD CONSTRAINT user_downloads_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3692 (class 2606 OID 26317)
-- Name: user_presence user_presence_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_presence
    ADD CONSTRAINT user_presence_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2026-01-29 15:23:57 UTC

--
-- PostgreSQL database dump complete
--

\unrestrict WJ1E1813hlabeoLpOmh2gqVPBcnH4aLOcrtSrPuwZkumJ9cn833ontZQhIVAGsd

