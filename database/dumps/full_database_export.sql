--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

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
-- Name: external_request_status; Type: TYPE; Schema: public; Owner: -
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


--
-- Name: order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'completed',
    'cancelled'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);


--
-- Name: platform; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.platform AS ENUM (
    'windows',
    'mac',
    'linux',
    'android',
    'ios',
    'web'
);


--
-- Name: project_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'cancelled'
);


--
-- Name: quote_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quote_status AS ENUM (
    'pending',
    'accepted',
    'rejected'
);


--
-- Name: role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.role AS ENUM (
    'user',
    'admin',
    'developer',
    'client',
    'seller',
    'buyer'
);


--
-- Name: service_payment_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.service_payment_type AS ENUM (
    'deposit',
    'final',
    'full'
);


--
-- Name: service_quotation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.service_quotation_status AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'expired'
);


--
-- Name: service_request_status; Type: TYPE; Schema: public; Owner: -
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


--
-- Name: status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: verification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.verification_status AS ENUM (
    'pending',
    'verified',
    'rejected'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    parent_id integer
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: external_requests; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: external_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.external_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: external_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.external_requests_id_seq OWNED BY public.external_requests.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    project_id integer NOT NULL,
    sender_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric NOT NULL
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: portfolio_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio_reviews (
    id integer NOT NULL,
    portfolio_id integer NOT NULL,
    user_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: portfolio_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.portfolio_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: portfolio_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.portfolio_reviews_id_seq OWNED BY public.portfolio_reviews.id;


--
-- Name: portfolios; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: portfolios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.portfolios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: portfolios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.portfolios_id_seq OWNED BY public.portfolios.id;


--
-- Name: product_reviews; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: product_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_reviews_id_seq OWNED BY public.product_reviews.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotes (
    id integer NOT NULL,
    project_id integer NOT NULL,
    developer_id integer NOT NULL,
    price numeric NOT NULL,
    timeline text NOT NULL,
    message text,
    status public.quote_status DEFAULT 'pending'::public.quote_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: quotes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quotes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quotes_id_seq OWNED BY public.quotes.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: seller_profiles; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: seller_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seller_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seller_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.seller_profiles_id_seq OWNED BY public.seller_profiles.id;


--
-- Name: service_payments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: service_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_payments_id_seq OWNED BY public.service_payments.id;


--
-- Name: service_projects; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: service_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_projects_id_seq OWNED BY public.service_projects.id;


--
-- Name: service_quotations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: service_quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_quotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_quotations_id_seq OWNED BY public.service_quotations.id;


--
-- Name: service_requests; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: service_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_requests_id_seq OWNED BY public.service_requests.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: softwares; Type: TABLE; Schema: public; Owner: -
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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: softwares_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.softwares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: softwares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.softwares_id_seq OWNED BY public.softwares.id;


--
-- Name: user_downloads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_downloads (
    id integer NOT NULL,
    user_id integer NOT NULL,
    software_id integer NOT NULL,
    version text NOT NULL,
    downloaded_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: user_downloads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_downloads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_downloads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_downloads_id_seq OWNED BY public.user_downloads.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
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
    phone_verified boolean DEFAULT false NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: external_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_requests ALTER COLUMN id SET DEFAULT nextval('public.external_requests_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: portfolio_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_reviews ALTER COLUMN id SET DEFAULT nextval('public.portfolio_reviews_id_seq'::regclass);


--
-- Name: portfolios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios ALTER COLUMN id SET DEFAULT nextval('public.portfolios_id_seq'::regclass);


--
-- Name: product_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews ALTER COLUMN id SET DEFAULT nextval('public.product_reviews_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: quotes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes ALTER COLUMN id SET DEFAULT nextval('public.quotes_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: seller_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_profiles ALTER COLUMN id SET DEFAULT nextval('public.seller_profiles_id_seq'::regclass);


--
-- Name: service_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_payments ALTER COLUMN id SET DEFAULT nextval('public.service_payments_id_seq'::regclass);


--
-- Name: service_projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_projects ALTER COLUMN id SET DEFAULT nextval('public.service_projects_id_seq'::regclass);


--
-- Name: service_quotations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_quotations ALTER COLUMN id SET DEFAULT nextval('public.service_quotations_id_seq'::regclass);


--
-- Name: service_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests ALTER COLUMN id SET DEFAULT nextval('public.service_requests_id_seq'::regclass);


--
-- Name: softwares id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.softwares ALTER COLUMN id SET DEFAULT nextval('public.softwares_id_seq'::regclass);


--
-- Name: user_downloads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_downloads ALTER COLUMN id SET DEFAULT nextval('public.user_downloads_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, parent_id) FROM stdin;
1	Utilities	\N
2	Media	\N
3	Communication	\N
4	Business	\N
5	Games	\N
6	Development	\N
7	Productivity	\N
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
\.


--
-- Data for Name: external_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.external_requests (id, name, email, phone, project_description, status, created_at, title, requirements, technology_stack, timeline, budget_range, budget, deadline, client_id, assigned_developer_id, priority, admin_notes, contact_email, contact_phone, updated_at) FROM stdin;
1	tran	cuong@gmail.com	03892342342	Project Name: lsdflasjdflasdjfas dfa sdf \nCompany: slasjdfasdf\nDescription: asdfasd dfas df á dfa \nRequirements: asdfa sd fa sdf asdf   asdf a sdf  asdf   ádf\nBudget: 1000000\nTimeline: 3 ngay	pending	2025-08-03 15:44:48.700399	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
2	Test Seller	seller@test.com	+843892342342	Project Name: lsdflasjdflasdjfas dfa sdf \nCompany: N/A\nDescription: alsfjalsdfasdf asd fa sdf á df asd fa sdf á dfa sd fas dfa\nRequirements: - Next.js\n- Python\nBudget: 1000000\nTimeline: 3 ngay	pending	2025-08-03 16:11:03.766457	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
3	Test Seller	seller@test.com	+841234567890	Project Name: lsdflasjdflasdjfas dfa sdf \nCompany: slasjdfasdf\nDescription: lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf \nRequirements: - AWS\n- AWS\n- AWS\n- AWS\nBudget: 1000000\nTimeline: 3 ngay	pending	2025-08-04 03:32:06.476881	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
4	Test Seller	seller@test.com	0378246333	Project Name: lsdflasjdflasdjfas dfa sdf \nCompany: slasjdfasdf\nDescription: asdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdf\nRequirements: - Python\n- Python\n- Python\n- Python\n- Python\nBudget: 1000000\nTimeline: 3 ngay	pending	2025-08-04 03:42:52.714536	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
6	Test User	test@example.com	+84378246333	Test project with Vietnamese phone number - React, Node.js, PostgreSQL	pending	2025-08-04 03:59:14.10611	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
5	Test Seller	seller@test.com	0378246333	Project Name: Test 4. toi muon tao web app\nCompany: fpt\nDescription: toi muon tao web app doc baotoi muon tao web app doc baotoi muon tao web app doc baotoi muon tao web app doc bao\nRequirements: - TypeScript\n- Redis\n- Laravel\n- Docker\nBudget: 1000000\nTimeline: 3 ngay	pending	2025-08-04 03:44:07.786565	\N	\N	\N	\N	\N	\N	\N	2	\N	normal	\N	\N	\N	\N
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, project_id, sender_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, quantity, price) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, buyer_id, status, total_amount, shipping_info, created_at, updated_at, seller_id, commission_amount, payment_method, download_links, buyer_info) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, order_id, project_id, amount, payment_method, status, escrow_release, transaction_id, created_at) FROM stdin;
\.


--
-- Data for Name: portfolio_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portfolio_reviews (id, portfolio_id, user_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portfolios (id, developer_id, title, description, images, demo_link, technologies, created_at) FROM stdin;
\.


--
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_reviews (id, order_id, product_id, buyer_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, seller_id, title, description, price, images, category, created_at, updated_at, price_type, stock_quantity, download_link, product_files, tags, license_info, status, featured, total_sales, avg_rating) FROM stdin;
2	2	Advanced Captcha Solver Tool	AI-powered captcha solving tool with 99% success rate. Supports reCAPTCHA v2, v3, hCaptcha, and FunCaptcha. Includes API access and documentation.	500000	{https://via.placeholder.com/300x200?text=Captcha+Solver}	Captcha Solvers	2025-08-02 06:55:39.432431	2025-08-02 06:55:39.432431	fixed	1	\N	\N	\N	\N	approved	f	0	\N
3	2	Social Media Marketing Bot	Automated social media management tool for Instagram, Facebook, and TikTok. Features auto-posting, engagement automation, and analytics dashboard.	1200000	{https://via.placeholder.com/300x200?text=Social+Bot}	Marketing Tools	2025-08-02 06:55:39.432431	2025-08-02 06:55:39.432431	fixed	1	\N	\N	\N	\N	approved	f	0	\N
4	2	Crypto Trading Bot Premium	Professional cryptocurrency trading bot with AI algorithms. Supports Binance, Bybit, and other major exchanges. Includes risk management and backtesting.	8000000	{https://via.placeholder.com/300x200?text=Crypto+Bot}	Crypto Tools	2025-08-02 06:55:39.432431	2025-08-02 06:55:39.432431	fixed	1	\N	\N	\N	\N	approved	f	0	\N
5	2	Test Product API Fixed	This is a comprehensive test product description with sufficient length to meet requirements	29.99	\N	Software Licenses	2025-08-02 16:51:09.691862	2025-08-02 16:51:09.691862	fixed	10	\N	\N	{test,software,licenses}	\N	pending	f	0	\N
1	2	Updated Product Title	Updated comprehensive test product description with sufficient length to meet requirements	39.99	{https://via.placeholder.com/300x200?text=Gmail+Accounts}	Software Licenses	2025-08-02 06:55:39.432431	2025-08-02 06:55:39.432431	fixed	5	\N	\N	\N	\N	approved	f	0	\N
6	2	Test Product	Test description	29.99	\N	Software Licenses	2025-08-03 10:54:36.64279	2025-08-03 10:54:36.64279	fixed	10	\N	\N	\N	\N	pending	f	0	\N
7	2	Frontend Test Product	This is a test product created from the frontend form	19.99	\N	Software Licenses	2025-08-03 10:55:01.009814	2025-08-03 10:55:01.009814	fixed	5	\N	\N	\N	\N	pending	f	0	\N
9	2	ban Gmail gia re	san pham Gmail gia re nhat thi thuong	10000	\N	Software Licenses	2025-08-04 08:25:47.867482	2025-08-04 08:25:47.867482	fixed	1	https://1000logos.net/wp-content/uploads/2021/05/Gmail-logo-500x281.png	\N	{gmail}	san pham gmail gia re an toan tuyet doi	pending	f	0	\N
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quotes (id, project_id, developer_id, price, timeline, message, status, created_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, user_id, target_type, target_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: seller_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seller_profiles (id, user_id, business_name, business_type, tax_id, business_address, bank_account, verification_status, verification_documents, commission_rate, total_sales, rating, total_reviews, created_at, updated_at) FROM stdin;
1	2	Test Seller Business	individual	\N	\N	\N	verified	\N	0.10	0	\N	0	2025-08-02 13:18:12.626063	2025-08-02 13:18:12.626063
\.


--
-- Data for Name: service_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_payments (id, quotation_id, service_project_id, client_id, amount, payment_type, status, stripe_payment_intent_id, payment_method, transaction_fee, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_projects (id, quotation_id, service_request_id, client_id, admin_id, status, progress_percentage, milestones, deliverables_submitted, client_feedback, admin_notes, started_at, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_quotations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_quotations (id, service_request_id, admin_id, title, description, deliverables, total_price, deposit_amount, timeline_days, terms_conditions, status, client_response, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_requests (id, client_id, title, description, requirements, budget_range, timeline, status, admin_notes, priority, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
DKpauh5vjTdn8Ej2UsoN-TBx4JUnPBMg	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T11:23:17.577Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-08-31 11:26:07
1jQa9dXXi9aGA3K26xcDSw_BpDsTL-Pl	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T10:52:37.789Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-08-31 10:54:18
la_6H60osVlzSnioyL7w90V0cbdlxR-i	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T10:48:45.418Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-08-31 10:48:52
eETs7AxDQm5BKOTSmnvSv_LyaXFLXO_n	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T11:26:44.227Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-08-31 11:29:20
s09KsDmA1_DbCkiiIembVx-PhzVsZvHj	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T10:49:35.832Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-08-31 10:51:54
mH_M3ICN23nATgj7U_nXltk2KWrSbDdp	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T10:56:58.482Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-08-31 10:59:23
xi2cTkOxKs-tR3cfnSumGZUMj_mACT7S	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T11:30:32.431Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-08-31 11:31:25
Sx8qUWaZq3s5hfpKWC3Mmw_m4n3EE8lv	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-09-01T07:06:04.965Z","httpOnly":true,"path":"/"},"userId":2,"user":{"id":2,"name":"Test Seller","email":"seller@test.com","password":"testpassword","role":"seller","profile_data":null,"phone":null,"email_verified":false,"phone_verified":false,"updated_at":"2025-08-02T06:54:50.055Z","created_at":"2025-08-02T06:54:50.055Z"}}	2025-09-01 07:06:06
sKVPbahO60vBWjmUdCJoOY0xNQ6hy23p	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T11:03:38.924Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-08-31 11:20:38
dg7bBf8IWyEQ83q8yMQlmvrYwtA6zks-	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-09-01T07:06:12.609Z","httpOnly":true,"path":"/"},"userId":2,"user":{"id":2,"name":"Test Seller","email":"seller@test.com","password":"testpassword","role":"seller","profile_data":null,"phone":null,"email_verified":false,"phone_verified":false,"updated_at":"2025-08-02T06:54:50.055Z","created_at":"2025-08-02T06:54:50.055Z"}}	2025-09-01 07:06:18
PFIkkbVGWgE4Om4ATCiU6xkIkKCkg0u3	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T11:00:01.365Z","httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-08-31 11:01:29
\.


--
-- Data for Name: softwares; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.softwares (id, name, description, category_id, platform, download_link, image_url, created_by, status, created_at) FROM stdin;
2	Adobe Photoshop	Professional image editing software with advanced features for digital art and photography.	2	{windows,mac}	https://adobe.com/photoshop	https://www.adobe.com/content/dam/acom/en/products/photoshop/pdp/photoshop-app-icon.svg	1	approved	2025-08-01 10:42:11.218774
3	Slack	Team collaboration hub that brings conversations, tools, and files together.	3	{windows,mac,linux,ios,android,web}	https://slack.com/downloads	https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_256.png	1	approved	2025-08-01 10:42:11.218774
4	Microsoft Excel	Powerful spreadsheet application for data analysis and visualization.	4	{windows,mac,web}	https://office.microsoft.com/excel	https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg	1	approved	2025-08-01 10:42:11.218774
5	Steam	Gaming platform for purchasing, downloading, and playing games.	5	{windows,mac,linux}	https://store.steampowered.com/about	https://store.cloudflare.steamstatic.com/public/shared/images/header/logo_steam.svg	1	approved	2025-08-01 10:42:11.218774
6	Node.js	JavaScript runtime built on Chrome V8 engine for building scalable applications.	6	{windows,mac,linux}	https://nodejs.org/download	https://nodejs.org/static/images/logo.svg	1	approved	2025-08-01 10:42:11.218774
8	Malwarebytes	Anti-malware software for detecting and removing malicious software.	8	{windows,mac,android}	https://malwarebytes.com/download	https://www.malwarebytes.com/images/brand/mb-logo-dark.svg	1	approved	2025-08-01 10:42:11.218774
1	Visual Studio Code	A powerful code editor with IntelliSense, debugging, and Git integration.	6	{windows,mac,linux}	https://code.visualstudio.com/download	https://code.visualstudio.com/assets/images/code-stable.png	1	approved	2025-08-01 10:42:11.218774
7	Notion	All-in-one workspace for notes, tasks, wikis, and databases.	7	{windows,mac,web,ios,android}	https://www.notion.com/desktop/windows/download	https://www.notion.so/images/logo-ios.png	1	approved	2025-08-01 10:42:11.218774
9	LibreOffice	Free and open-source office suite with word processor, spreadsheet, presentation, and database applications	9	{windows,mac,linux}	https://www.libreoffice.org/download/	https://www.libreoffice.org/assets/Uploads/LibreOffice-Initial-Artwork-Logo-ColorLogoBasic-500px.png	1	approved	2025-08-01 16:56:05.323518
10	OnlyOffice	Comprehensive office suite for document editing, collaboration, and project management	9	{windows,mac,linux,web}	https://www.onlyoffice.com/download.aspx	https://www.onlyoffice.com/blog/content/images/2021/04/onlyoffice-logo.png	1	approved	2025-08-01 16:56:05.323518
11	WPS Office	Lightweight office suite compatible with Microsoft Office formats	9	{windows,mac,linux,android,ios}	https://www.wps.com/download/	https://www.wps.com/images/wps-logo.png	1	approved	2025-08-01 16:56:05.323518
12	Zoho Office Suite	Cloud-based office suite with document, spreadsheet, and presentation tools	9	{web,android,ios}	https://www.zoho.com/docs/	https://www.zoho.com/img/zoho-logo.svg	1	approved	2025-08-01 16:56:05.323518
13	Notion	All-in-one workspace for note-taking, collaboration, and project management	9	{windows,mac,web,android,ios}	https://www.notion.so/desktop	https://www.notion.so/images/logo-ios.png	1	approved	2025-08-01 16:56:05.323518
14	Evernote	Note-taking and organization app for capturing and organizing information	9	{windows,mac,web,android,ios}	https://evernote.com/download	https://evernote.com/img/evernote-logo.svg	1	approved	2025-08-01 16:56:05.323518
15	VLC Media Player	Free and open-source multimedia player and framework that plays most multimedia files	10	{windows,mac,linux,android,ios}	https://www.videolan.org/vlc/	https://images.videolan.org/images/VLC-IconSmall.png	1	approved	2025-08-01 16:56:13.983007
16	MPV Player	Free, open-source, and cross-platform media player with advanced features	10	{windows,mac,linux}	https://mpv.io/installation/	https://mpv.io/images/mpv-logo-128.png	1	approved	2025-08-01 16:56:13.983007
17	Audacity	Free, open-source, cross-platform audio software for multi-track recording and editing	10	{windows,mac,linux}	https://www.audacityteam.org/download/	https://www.audacityteam.org/wp-content/themes/wp_audacity/img/logo.png	1	approved	2025-08-01 16:56:13.983007
18	Shotcut	Free, open-source, cross-platform video editor with comprehensive features	10	{windows,mac,linux}	https://shotcut.org/download/	https://shotcut.org/assets/img/shotcut-logo-64.png	1	approved	2025-08-01 16:56:13.983007
19	OBS Studio	Free and open-source software for video recording and live streaming	10	{windows,mac,linux}	https://obsproject.com/download	https://obsproject.com/assets/images/new_icon_small-r.png	1	approved	2025-08-01 16:56:13.983007
20	GIMP	GNU Image Manipulation Program - free and open-source raster graphics editor	10	{windows,mac,linux}	https://www.gimp.org/downloads/	https://www.gimp.org/images/frontpage/wilber-big.png	1	approved	2025-08-01 16:56:13.983007
21	Inkscape	Professional vector graphics editor for creating scalable graphics	10	{windows,mac,linux}	https://inkscape.org/release/	https://media.inkscape.org/static/images/inkscape-logo.svg	1	approved	2025-08-01 16:56:13.983007
22	7-Zip	Free and open-source file archiver with high compression ratio	11	{windows,linux}	https://www.7-zip.org/download.html	https://www.7-zip.org/7ziplogo.png	1	approved	2025-08-01 16:56:19.845734
23	PeaZip	Free file archiver utility with support for 200+ archive formats	11	{windows,linux}	https://peazip.github.io/peazip-download.html	https://peazip.github.io/peazip-64.png	1	approved	2025-08-01 16:56:19.845734
24	WinRAR	Powerful archiver and archive manager with compression and encryption features	11	{windows,mac}	https://www.win-rar.com/download.html	https://www.win-rar.com/fileadmin/images/winrar_logo.png	1	approved	2025-08-01 16:56:19.845734
25	Bandizip	Lightweight, fast, and free archiver for Windows with clean interface	11	{windows}	https://en.bandisoft.com/bandizip/	https://en.bandisoft.com/img/bandizip/bandizip-icon-256.png	1	approved	2025-08-01 16:56:19.845734
26	Visual Studio Code	Lightweight but powerful source code editor with extensive extension support	12	{windows,mac,linux}	https://code.visualstudio.com/download	https://code.visualstudio.com/assets/images/code-stable.png	1	approved	2025-08-01 16:56:29.449493
27	IntelliJ IDEA Community Edition	Free and open-source IDE for Java development with intelligent code assistance	12	{windows,mac,linux}	https://www.jetbrains.com/idea/download/	https://resources.jetbrains.com/storage/products/intellij-idea/img/meta/intellij-idea_logo_300x300.png	1	approved	2025-08-01 16:56:29.449493
28	Eclipse IDE	Free and open-source integrated development environment primarily for Java	12	{windows,mac,linux}	https://www.eclipse.org/downloads/	https://www.eclipse.org/eclipse.org-common/themes/solstice/public/images/logo/eclipse-426x100.png	1	approved	2025-08-01 16:56:29.449493
29	Atom Editor	Free and open-source text and source code editor with customizable interface	12	{windows,mac,linux}	https://github.com/atom/atom/releases	https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png	1	approved	2025-08-01 16:56:29.449493
30	GitKraken	Powerful Git client with intuitive interface for version control management	12	{windows,mac,linux}	https://www.gitkraken.com/download	https://www.gitkraken.com/img/gk-logo.svg	1	approved	2025-08-01 16:56:29.449493
31	SourceTree	Free Git client for Windows and Mac with visual interface for repositories	12	{windows,mac}	https://www.sourcetreeapp.com/	https://wac-cdn.atlassian.com/dam/jcr:580b2cc1-1d37-4e96-9e3a-46e71e3a4076/sourcetree-icon-blue.svg	1	approved	2025-08-01 16:56:29.449493
32	BleachBit	Free system cleaner that removes unnecessary files and protects privacy	13	{windows,linux}	https://www.bleachbit.org/download	https://www.bleachbit.org/sites/default/files/zen_logo.png	1	approved	2025-08-01 16:56:39.775967
33	Duplicati	Free backup client that stores encrypted, compressed backups online	13	{windows,mac,linux}	https://www.duplicati.com/download	https://www.duplicati.com/img/duplicati_logo.png	1	approved	2025-08-01 16:56:39.775967
34	Glary Utilities	All-in-one system cleaner and performance optimizer for Windows	13	{windows}	https://www.glarysoft.com/glary-utilities/	https://www.glarysoft.com/img/gu-logo.png	1	approved	2025-08-01 16:56:39.775967
35	CPU-Z	System information software that provides detailed hardware information	13	{windows}	https://www.cpuid.com/softwares/cpu-z.html	https://www.cpuid.com/medias/images/logos/cpuz.png	1	approved	2025-08-01 16:56:39.775967
36	HWMonitor	Hardware monitoring program that reads health sensors of systems	13	{windows}	https://www.cpuid.com/softwares/hwmonitor.html	https://www.cpuid.com/medias/images/logos/hwmonitor.png	1	approved	2025-08-01 16:56:39.775967
37	Everything Search Engine	Lightning-fast file search utility for Windows based on filename indexing	13	{windows}	https://www.voidtools.com/downloads/	https://www.voidtools.com/Everything.ico	1	approved	2025-08-01 16:56:39.775967
38	Signal	Private messenger with end-to-end encryption for secure communication	14	{windows,mac,linux,android,ios}	https://signal.org/download/	https://signal.org/assets/images/header/signal-logo.png	1	approved	2025-08-01 16:56:47.063157
39	Thunderbird	Free and open-source email client with calendar and chat features	14	{windows,mac,linux}	https://www.thunderbird.net/download/	https://www.thunderbird.net/media/img/thunderbird/logos/logo.png	1	approved	2025-08-01 16:56:47.063157
40	Zoom	Video conferencing platform for meetings, webinars, and collaboration	14	{windows,mac,linux,android,ios,web}	https://zoom.us/download	https://st1.zoom.us/static/6.3.5/image/new/topNav/Zoom_logo.svg	1	approved	2025-08-01 16:56:47.063157
41	Microsoft Teams	Collaboration platform combining workplace chat, meetings, and file sharing	14	{windows,mac,linux,android,ios,web}	https://www.microsoft.com/microsoft-teams/download-app	https://www.microsoft.com/favicon.ico	1	approved	2025-08-01 16:56:47.063157
42	Jitsi Meet	Open-source video conferencing solution with privacy focus	14	{web,android,ios}	https://jitsi.org/downloads/	https://jitsi.org/wp-content/uploads/2017/11/jitsi-logo-blue-grey-text.png	1	approved	2025-08-01 16:56:47.063157
43	VeraCrypt	Free open-source disk encryption software for creating encrypted volumes	15	{windows,mac,linux}	https://www.veracrypt.fr/en/Downloads.html	https://www.veracrypt.fr/en/VeraCrypt_Logo.png	1	approved	2025-08-01 16:56:53.125143
44	Bitwarden	Open-source password manager with cross-platform synchronization	15	{windows,mac,linux,android,ios,web}	https://bitwarden.com/download/	https://bitwarden.com/images/icons/logo.svg	1	approved	2025-08-01 16:56:53.125143
45	Tor Browser	Privacy-focused web browser that routes traffic through the Tor network	15	{windows,mac,linux,android}	https://www.torproject.org/download/	https://www.torproject.org/static/images/tor-project-logo-onions.png	1	approved	2025-08-01 16:56:53.125143
46	KeePass	Free, open-source password manager that stores passwords in encrypted databases	15	{windows,mac,linux}	https://keepass.info/download.html	https://keepass.info/screenshots/keepass_2x_mainwnd_big.png	1	approved	2025-08-01 16:56:53.125143
47	TensorFlow	Open-source machine learning framework for developing and training ML models	16	{windows,mac,linux}	https://www.tensorflow.org/install	https://www.tensorflow.org/images/tf_logo_social.png	1	approved	2025-08-01 16:56:59.045671
48	PyTorch	Open-source machine learning library based on Torch for deep learning applications	16	{windows,mac,linux}	https://pytorch.org/get-started/locally/	https://pytorch.org/assets/images/pytorch-logo.png	1	approved	2025-08-01 16:56:59.045671
49	Apache Spark	Unified analytics engine for large-scale data processing and machine learning	16	{windows,mac,linux}	https://spark.apache.org/downloads.html	https://spark.apache.org/images/spark-logo-trademark.png	1	approved	2025-08-01 16:56:59.045671
50	Jupyter Notebook	Open-source web application for creating and sharing computational documents	16	{windows,mac,linux}	https://jupyter.org/install	https://jupyter.org/assets/logos/rectanglelogo-greytext-orangebody-greymoons.svg	1	approved	2025-08-01 16:56:59.045671
51	OpenCV	Open-source computer vision and machine learning software library	16	{windows,mac,linux}	https://opencv.org/releases/	https://opencv.org/wp-content/uploads/2020/07/OpenCV_logo_no_text_.png	1	approved	2025-08-01 16:56:59.045671
52	Mozilla Firefox	Free and open-source web browser with privacy features and customization options	17	{windows,mac,linux,android,ios}	https://www.mozilla.org/firefox/download/	https://www.mozilla.org/media/img/logos/firefox/logo-quantum.png	1	approved	2025-08-01 16:57:10.00909
53	Google Chrome	Fast and secure web browser built for the modern web with Google integration	17	{windows,mac,linux,android,ios}	https://www.google.com/chrome/	https://www.google.com/chrome/static/images/chrome-logo.svg	1	approved	2025-08-01 16:57:10.00909
54	Brave Browser	Privacy-focused web browser that blocks ads and trackers by default	17	{windows,mac,linux,android,ios}	https://brave.com/download/	https://brave.com/static-assets/images/brave-logo.svg	1	approved	2025-08-01 16:57:10.00909
55	Microsoft Edge	Modern web browser built on Chromium with Microsoft services integration	17	{windows,mac,linux,android,ios}	https://www.microsoft.com/edge/download	https://www.microsoft.com/favicon.ico	1	approved	2025-08-01 16:57:10.00909
56	Lutris	Open-source gaming platform for Linux that manages game installations	18	{linux}	https://lutris.net/downloads/	https://lutris.net/static/images/lutris-logo.png	1	approved	2025-08-01 16:57:12.819875
57	RetroArch	Frontend for emulators, game engines and media players with unified interface	18	{windows,mac,linux,android,ios}	https://www.retroarch.com/index.php?page=platforms	https://www.retroarch.com/images/retroarch-logo.png	1	approved	2025-08-01 16:57:12.819875
58	Nextcloud	Self-hosted productivity platform with file sync, share, and collaboration features	19	{windows,mac,linux,android,ios,web}	https://nextcloud.com/install/	https://nextcloud.com/media/nextcloud-logo-blue.svg	1	approved	2025-08-01 16:57:17.539974
59	Syncthing	Continuous file synchronization program that syncs files between devices	19	{windows,mac,linux,android}	https://syncthing.net/downloads/	https://syncthing.net/img/logo-horizontal.svg	1	approved	2025-08-01 16:57:17.539974
60	Resilio Sync	Peer-to-peer file synchronization tool for sharing data across devices	19	{windows,mac,linux,android,ios}	https://www.resilio.com/individuals/	https://www.resilio.com/img/logo.svg	1	approved	2025-08-01 16:57:17.539974
61	Anki	Spaced repetition flashcard program for efficient learning and memorization	20	{windows,mac,linux,android,ios}	https://apps.ankiweb.net/	https://apps.ankiweb.net/favicon.ico	1	approved	2025-08-01 16:57:22.879038
62	Moodle	Open-source learning platform for creating personalized learning environments	20	{web}	https://moodle.org/download/	https://moodle.org/theme/image.php/boost/theme_moodleorg/1638360480/moodlelogo	1	approved	2025-08-01 16:57:22.879038
63	Khan Academy	Free online courses and practice exercises for personalized learning	20	{web,android,ios}	https://www.khanacademy.org/	https://cdn.kastatic.org/images/khan-logo-dark-background.png	1	approved	2025-08-01 16:57:22.879038
64	Blender	Free and open-source 3D computer graphics software for modeling, animation, and rendering	21	{windows,mac,linux}	https://www.blender.org/download/	https://www.blender.org/wp-content/uploads/2015/03/blender_logo_socket.png	1	approved	2025-08-01 16:57:26.381129
65	Krita	Free and open-source digital painting application designed for concept artists and illustrators	21	{windows,mac,linux}	https://krita.org/en/download/krita-desktop/	https://krita.org/images/krita-logo.svg	1	approved	2025-08-01 16:57:26.381129
66	Canva	Web-based graphic design platform with templates for social media, presentations, and more	21	{web,android,ios}	https://www.canva.com/	https://www.canva.com/img/logos/canva-logo.svg	1	approved	2025-08-01 16:57:26.381129
67	Scratch 3.29	Visual programming language and online community for creating interactive stories, games, and animations	12	{windows,mac,linux,web}	https://scratch.mit.edu/download	https://scratch.mit.edu/images/scratch-logo.svg	1	approved	2025-08-01 17:06:12.175092
68	Microsoft Visual C++ Redistributable	Runtime components of Visual C++ Libraries required for running applications developed with Visual C++	12	{windows}	https://docs.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist	https://www.microsoft.com/favicon.ico	1	approved	2025-08-01 17:06:12.175092
69	Python 3.13	High-level programming language with dynamic semantics and powerful data structures	12	{windows,mac,linux}	https://www.python.org/downloads/	https://www.python.org/static/img/python-logo.png	1	approved	2025-08-01 17:06:12.175092
70	Visual Studio 2022	Comprehensive IDE for developing applications across multiple platforms and languages	12	{windows,mac}	https://visualstudio.microsoft.com/downloads/	https://www.microsoft.com/favicon.ico	1	approved	2025-08-01 17:06:12.175092
71	Notepad++	Free source code editor and Notepad replacement with syntax highlighting and tabbed interface	12	{windows}	https://notepad-plus-plus.org/downloads/	https://notepad-plus-plus.org/images/logo.svg	1	approved	2025-08-01 17:06:12.175092
72	Microsoft SQL Server 2019	Relational database management system developed by Microsoft for enterprise applications	12	{windows,linux}	https://www.microsoft.com/sql-server/sql-server-downloads	https://www.microsoft.com/favicon.ico	1	approved	2025-08-01 17:06:12.175092
73	Code::Blocks	Free, open-source, cross-platform C/C++ IDE built around a plugin framework	12	{windows,mac,linux}	https://www.codeblocks.org/downloads/	https://www.codeblocks.org/images/logo160.png	1	approved	2025-08-01 17:06:12.175092
74	MATLAB R2024b	Multi-paradigm programming language and computing environment for algorithm development and data analysis	12	{windows,mac,linux}	https://www.mathworks.com/products/matlab.html	https://www.mathworks.com/etc/designs/mathworks/images/pic-header-mathworks-logo.svg	1	approved	2025-08-01 17:06:12.175092
75	Arduino IDE	Open-source electronics platform based on easy-to-use hardware and software for microcontroller programming	12	{windows,mac,linux}	https://www.arduino.cc/en/software	https://www.arduino.cc/arduino_logo.svg	1	approved	2025-08-01 17:06:12.175092
76	Visual Studio Community 2019	Free, full-featured IDE for students, open-source contributors, and individual developers	12	{windows}	https://visualstudio.microsoft.com/vs/older-downloads/	https://www.microsoft.com/favicon.ico	1	approved	2025-08-01 17:06:12.175092
77	OpenGL 4.6	Cross-platform graphics API for rendering 2D and 3D vector graphics	12	{windows,mac,linux}	https://www.opengl.org/	https://www.opengl.org/img/opengl_logo.jpg	1	approved	2025-08-01 17:07:30.207287
78	Microsoft Visual Studio 2017 Express	Free version of Visual Studio IDE for individual developers and small teams	12	{windows}	https://visualstudio.microsoft.com/vs/older-downloads/	https://www.microsoft.com/favicon.ico	1	approved	2025-08-01 17:07:30.207287
79	Free Pascal 3.2	Open source Pascal compiler with Object Pascal support for multiple platforms	12	{windows,mac,linux}	https://www.freepascal.org/download.html	https://www.freepascal.org/pic/logo.gif	1	approved	2025-08-01 17:07:30.207287
80	PyCharm 2025.1	Professional Python IDE with intelligent code assistance and debugging tools	12	{windows,mac,linux}	https://www.jetbrains.com/pycharm/download/	https://resources.jetbrains.com/storage/products/pycharm/img/meta/pycharm_logo_300x300.png	1	approved	2025-08-01 17:07:30.207287
81	Adobe Animate CC 2019	Professional animation software for creating interactive animations and multimedia content	21	{windows,mac}	https://www.adobe.com/products/animate.html	https://www.adobe.com/content/dam/acom/en/products/animate/pdp/animate-app-icon.svg	1	approved	2025-08-01 17:07:30.207287
82	XAMPP 8.2	Free and open-source cross-platform web server solution stack with Apache, MySQL, PHP and Perl	12	{windows,mac,linux}	https://www.apachefriends.org/download.html	https://www.apachefriends.org/images/xampp-logo.svg	1	approved	2025-08-01 17:07:30.207287
83	Android Studio 2024.2	Official integrated development environment for Android app development	12	{windows,mac,linux}	https://developer.android.com/studio	https://developer.android.com/images/brand/Android_Robot.png	1	approved	2025-08-01 17:07:30.207287
84	Resource Hacker 5.1	Resource compiler and decompiler for Windows applications	13	{windows}	http://www.angusj.com/resourcehacker/	https://www.angusj.com/resourcehacker/resource_hacker.png	1	approved	2025-08-01 17:07:30.207287
85	MySQL 8.0	Open-source relational database management system for web applications and data storage	12	{windows,mac,linux}	https://dev.mysql.com/downloads/	https://labs.mysql.com/common/logos/mysql-logo.svg	1	approved	2025-08-01 17:07:30.207287
\.


--
-- Data for Name: user_downloads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_downloads (id, user_id, software_id, version, downloaded_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password, role, profile_data, updated_at, created_at, phone, email_verified, phone_verified) FROM stdin;
1	Administrator	admin@gmail.com	a1308afa92c062f113d233772b673f6fc8d5cb415553340d1a411c195c26f51a662f95953f57b0323ae78e5d00f868a391410864dfd8b9bf64d058119fc75035.666e97961ee31d2db66528751ed8514e	admin	\N	2025-08-01 10:38:37.709281	2025-08-01 10:38:37.709281	\N	f	f
2	Test Seller	seller@test.com	testpassword	seller	\N	2025-08-02 06:54:50.055965	2025-08-02 06:54:50.055965	\N	f	f
3	Test Buyer	buyer@test.com	testpassword	buyer	\N	2025-08-02 06:54:50.055965	2025-08-02 06:54:50.055965	\N	f	f
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 21, true);


--
-- Name: external_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.external_requests_id_seq', 6, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: portfolio_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.portfolio_reviews_id_seq', 1, false);


--
-- Name: portfolios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.portfolios_id_seq', 1, false);


--
-- Name: product_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_reviews_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 9, true);


--
-- Name: quotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quotes_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: seller_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seller_profiles_id_seq', 1, true);


--
-- Name: service_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_payments_id_seq', 1, false);


--
-- Name: service_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_projects_id_seq', 1, false);


--
-- Name: service_quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_quotations_id_seq', 1, false);


--
-- Name: service_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_requests_id_seq', 1, false);


--
-- Name: softwares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.softwares_id_seq', 85, true);


--
-- Name: user_downloads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_downloads_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: categories categories_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_unique UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: external_requests external_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_requests
    ADD CONSTRAINT external_requests_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: portfolio_reviews portfolio_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_reviews
    ADD CONSTRAINT portfolio_reviews_pkey PRIMARY KEY (id);


--
-- Name: portfolios portfolios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_pkey PRIMARY KEY (id);


--
-- Name: product_reviews product_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: seller_profiles seller_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_profiles
    ADD CONSTRAINT seller_profiles_pkey PRIMARY KEY (id);


--
-- Name: seller_profiles seller_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_profiles
    ADD CONSTRAINT seller_profiles_user_id_key UNIQUE (user_id);


--
-- Name: service_payments service_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_payments
    ADD CONSTRAINT service_payments_pkey PRIMARY KEY (id);


--
-- Name: service_projects service_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_projects
    ADD CONSTRAINT service_projects_pkey PRIMARY KEY (id);


--
-- Name: service_quotations service_quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_quotations
    ADD CONSTRAINT service_quotations_pkey PRIMARY KEY (id);


--
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: softwares softwares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.softwares
    ADD CONSTRAINT softwares_pkey PRIMARY KEY (id);


--
-- Name: user_downloads user_downloads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_downloads
    ADD CONSTRAINT user_downloads_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: external_requests external_requests_assigned_developer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_requests
    ADD CONSTRAINT external_requests_assigned_developer_id_fkey FOREIGN KEY (assigned_developer_id) REFERENCES public.users(id);


--
-- Name: external_requests external_requests_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_requests
    ADD CONSTRAINT external_requests_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- Name: messages messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: order_items order_items_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items order_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_buyer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_buyer_id_users_id_fk FOREIGN KEY (buyer_id) REFERENCES public.users(id);


--
-- Name: orders orders_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- Name: payments payments_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: portfolio_reviews portfolio_reviews_portfolio_id_portfolios_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_reviews
    ADD CONSTRAINT portfolio_reviews_portfolio_id_portfolios_id_fk FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id);


--
-- Name: portfolio_reviews portfolio_reviews_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_reviews
    ADD CONSTRAINT portfolio_reviews_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: portfolios portfolios_developer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_developer_id_users_id_fk FOREIGN KEY (developer_id) REFERENCES public.users(id);


--
-- Name: product_reviews product_reviews_buyer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_buyer_id_users_id_fk FOREIGN KEY (buyer_id) REFERENCES public.users(id);


--
-- Name: product_reviews product_reviews_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: product_reviews product_reviews_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: products products_seller_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_seller_id_users_id_fk FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- Name: quotes quotes_developer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_developer_id_users_id_fk FOREIGN KEY (developer_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: seller_profiles seller_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_profiles
    ADD CONSTRAINT seller_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: service_payments service_payments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_payments
    ADD CONSTRAINT service_payments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- Name: service_payments service_payments_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_payments
    ADD CONSTRAINT service_payments_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.service_quotations(id);


--
-- Name: service_payments service_payments_service_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_payments
    ADD CONSTRAINT service_payments_service_project_id_fkey FOREIGN KEY (service_project_id) REFERENCES public.service_projects(id);


--
-- Name: service_projects service_projects_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_projects
    ADD CONSTRAINT service_projects_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: service_projects service_projects_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_projects
    ADD CONSTRAINT service_projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- Name: service_projects service_projects_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_projects
    ADD CONSTRAINT service_projects_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.service_quotations(id);


--
-- Name: service_projects service_projects_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_projects
    ADD CONSTRAINT service_projects_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id);


--
-- Name: service_quotations service_quotations_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_quotations
    ADD CONSTRAINT service_quotations_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: service_quotations service_quotations_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_quotations
    ADD CONSTRAINT service_quotations_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id);


--
-- Name: service_requests service_requests_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- Name: softwares softwares_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.softwares
    ADD CONSTRAINT softwares_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: softwares softwares_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.softwares
    ADD CONSTRAINT softwares_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: user_downloads user_downloads_software_id_softwares_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_downloads
    ADD CONSTRAINT user_downloads_software_id_softwares_id_fk FOREIGN KEY (software_id) REFERENCES public.softwares(id);


--
-- Name: user_downloads user_downloads_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_downloads
    ADD CONSTRAINT user_downloads_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

