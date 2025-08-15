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
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, name, email, password, role, profile_data, updated_at, created_at, phone, email_verified, phone_verified, reset_token, reset_token_expires) FROM stdin;
2	Test Seller	seller@test.com	testpassword	seller	\N	2025-08-02 06:54:50.055965	2025-08-02 06:54:50.055965	\N	f	f	\N	\N
3	Test Buyer	buyer@test.com	testpassword	buyer	\N	2025-08-02 06:54:50.055965	2025-08-02 06:54:50.055965	\N	f	f	\N	\N
1	Administrator	cuongeurovnn@gmail.com	a1308afa92c062f113d233772b673f6fc8d5cb415553340d1a411c195c26f51a662f95953f57b0323ae78e5d00f868a391410864dfd8b9bf64d058119fc75035.666e97961ee31d2db66528751ed8514e	admin	\N	2025-08-01 10:38:37.709281	2025-08-01 10:38:37.709281	\N	f	f	\N	\N
12	tran manh cuong	cuongtm2012@gmail.com	Cuongtm2012$	seller	\N	2025-08-10 03:50:34.486592	2025-08-10 03:50:34.486592	\N	f	f	\N	\N
7	tran manh cuong	phiyenvnn@gmail.com	Sam@30092019	user	\N	2025-08-09 03:32:35.347637	2025-08-09 03:32:35.347637	\N	f	f	a5fe7f7fa41fc68be9524d11f94062f370e6337cef562420a48c8808f7c7c319	2025-08-10 11:15:04.731
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, seller_id, title, description, price, images, category, created_at, updated_at, price_type, stock_quantity, download_link, product_files, tags, license_info, status, featured, total_sales, avg_rating) FROM stdin;
2	2	Advanced Captcha Solver Tool	AI-powered captcha solving tool with 99% success rate. Supports reCAPTCHA v2, v3, hCaptcha, and FunCaptcha. Includes API access and documentation.	500000	{https://via.placeholder.com/300x200?text=Captcha+Solver}	Captcha Solvers	2025-08-02 06:55:39.432431	2025-08-02 06:55:39.432431	fixed	10	\N	\N	\N	\N	approved	f	1	\N
1	2	Updated Product Title	Updated comprehensive test product description with sufficient length to meet requirements	39.99	{https://via.placeholder.com/300x200?text=Gmail+Accounts}	Software Licenses	2025-08-02 06:55:39.432431	2025-08-02 06:55:39.432431	fixed	10	\N	\N	\N	\N	approved	f	5	\N
5	2	Test Product API Fixed	This is a comprehensive test product description with sufficient length to meet requirements	29.99	\N	Software Licenses	2025-08-02 16:51:09.691862	2025-08-02 16:51:09.691862	fixed	10	\N	\N	{test,software,licenses}	\N	pending	f	0	\N
6	2	Test Product	Test description	29.99	\N	Software Licenses	2025-08-03 10:54:36.64279	2025-08-03 10:54:36.64279	fixed	10	\N	\N	\N	\N	pending	f	0	\N
7	2	Frontend Test Product	This is a test product created from the frontend form	19.99	\N	Software Licenses	2025-08-03 10:55:01.009814	2025-08-03 10:55:01.009814	fixed	5	\N	\N	\N	\N	pending	f	0	\N
9	2	ban Gmail gia re	san pham Gmail gia re nhat thi thuong	10000	\N	Software Licenses	2025-08-04 08:25:47.867482	2025-08-04 08:25:47.867482	fixed	1	https://1000logos.net/wp-content/uploads/2021/05/Gmail-logo-500x281.png	\N	{gmail}	san pham gmail gia re an toan tuyet doi	pending	f	0	\N
4	2	Crypto Trading Bot Premium	Professional cryptocurrency trading bot with AI algorithms. Supports Binance, Bybit, and other major exchanges. Includes risk management and backtesting.	8000000	{https://via.placeholder.com/300x200?text=Crypto+Bot}	Crypto Tools	2025-08-02 06:55:39.432431	2025-08-02 06:55:39.432431	fixed	4	\N	\N	\N	\N	approved	f	7	\N
3	2	Social Media Marketing Bot	Automated social media management tool for Instagram, Facebook, and TikTok. Features auto-posting, engagement automation, and analytics dashboard.	1200000	{https://via.placeholder.com/300x200?text=Social+Bot}	Marketing Tools	2025-08-02 06:55:39.432431	2025-08-02 06:55:39.432431	fixed	8	\N	\N	\N	\N	approved	f	3	\N
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cart_items (id, user_id, product_id, quantity, created_at) FROM stdin;
1	3	4	2	2025-08-11 14:43:17.448608
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
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
-- Data for Name: chat_rooms; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.chat_rooms (id, name, type, created_by, created_at, updated_at) FROM stdin;
1	\N	direct	1	2025-08-06 13:29:46.600022	2025-08-06 13:29:46.600022
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
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
\.


--
-- Data for Name: chat_room_members; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.chat_room_members (id, room_id, user_id, joined_at, last_read_at, is_admin) FROM stdin;
1	1	1	2025-08-06 13:29:46.638052	\N	f
2	1	2	2025-08-06 13:29:46.638052	\N	f
\.


--
-- Data for Name: external_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.external_requests (id, name, email, phone, project_description, status, created_at, title, requirements, technology_stack, timeline, budget_range, budget, deadline, client_id, assigned_developer_id, priority, admin_notes, contact_email, contact_phone, updated_at) FROM stdin;
6	Test User	test@example.com	+84378246333	Test project with Vietnamese phone number - React, Node.js, PostgreSQL	in_progress	2025-08-04 03:59:14.10611	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
5	Test Seller	seller@test.com	0378246333	Project Name: Test 4. toi muon tao web app\nCompany: fpt\nDescription: toi muon tao web app doc baotoi muon tao web app doc baotoi muon tao web app doc baotoi muon tao web app doc bao\nRequirements: - TypeScript\n- Redis\n- Laravel\n- Docker\nBudget: 1000000\nTimeline: 3 ngay	cancelled	2025-08-04 03:44:07.786565	\N	\N	\N	\N	\N	\N	\N	2	\N	normal	\N	\N	\N	\N
4	Test Seller	seller@test.com	0378246333	Project Name: lsdflasjdflasdjfas dfa sdf \nCompany: slasjdfasdf\nDescription: asdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdf\nRequirements: - Python\n- Python\n- Python\n- Python\n- Python\nBudget: 1000000\nTimeline: 3 ngay	completed	2025-08-04 03:42:52.714536	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
3	Test Seller	seller@test.com	+841234567890	Project Name: lsdflasjdflasdjfas dfa sdf \nCompany: slasjdfasdf\nDescription: lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf \nRequirements: - AWS\n- AWS\n- AWS\n- AWS\nBudget: 1000000\nTimeline: 3 ngay	in_progress	2025-08-04 03:32:06.476881	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
2	Test Seller	seller@test.com	+843892342342	Project Name: lsdflasjdflasdjfas dfa sdf \nCompany: N/A\nDescription: alsfjalsdfasdf asd fa sdf á df asd fa sdf á dfa sd fas dfa\nRequirements: - Next.js\n- Python\nBudget: 1000000\nTimeline: 3 ngay	in_progress	2025-08-03 16:11:03.766457	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
1	tran	cuong@gmail.com	03892342342	Project Name: lsdflasjdflasdjfas dfa sdf \nCompany: slasjdfasdf\nDescription: asdfasd dfas df á dfa \nRequirements: asdfa sd fa sdf asdf   asdf a sdf  asdf   ádf\nBudget: 1000000\nTimeline: 3 ngay	in_progress	2025-08-03 15:44:48.700399	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
7	Test Seller	seller@test.com	0378246333	Project Name: lam web app don gian\nCompany: fpt\nDescription: lam web app don gianlam web app don gianlam web app don gianlam web app don gian\nRequirements: - Node.js\n- Python\n- AWS\n- Docker\nBudget: 10000000\nTimeline: 3 ngay	in_progress	2025-08-09 03:08:45.253079	\N	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.messages (id, project_id, sender_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, user_id, title, message, type, is_read, link_url, metadata, created_at, read_at) FROM stdin;
1	1	Welcome to SoftwareHub!	Thank you for joining our platform. Explore our software catalog and start downloading today.	success	f	\N	\N	2025-08-10 08:27:02.417542	\N
2	1	New Feature Alert	We've added a new notification system to keep you updated on important events.	info	f	\N	\N	2025-08-10 07:27:02.417542	\N
3	1	System Maintenance	Scheduled maintenance on Sunday 2:00 AM - 4:00 AM EST.	warning	t	\N	\N	2025-08-10 06:27:02.417542	\N
4	2	Welcome to SoftwareHub!	Thank you for joining our platform. Explore our software catalog and start downloading today.	success	f	\N	\N	2025-08-10 08:30:25.89762	\N
5	2	New Feature Alert	We've added a new notification system to keep you updated on important events.	info	f	\N	\N	2025-08-10 07:30:25.89762	\N
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.orders (id, buyer_id, status, total_amount, shipping_info, created_at, updated_at, seller_id, commission_amount, payment_method, download_links, buyer_info) FROM stdin;
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
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.order_items (id, order_id, product_id, quantity, price) FROM stdin;
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
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payments (id, order_id, project_id, amount, payment_method, status, escrow_release, transaction_id, created_at) FROM stdin;
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
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.portfolios (id, developer_id, title, description, images, demo_link, technologies, created_at) FROM stdin;
\.


--
-- Data for Name: portfolio_reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.portfolio_reviews (id, portfolio_id, user_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.product_reviews (id, order_id, product_id, buyer_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quotes (id, project_id, developer_id, price, timeline, message, status, created_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reviews (id, user_id, target_type, target_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: sales_analytics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sales_analytics (id, seller_id, product_id, date, revenue, units_sold, commission_paid, created_at) FROM stdin;
\.


--
-- Data for Name: seller_profiles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.seller_profiles (id, user_id, business_name, business_type, tax_id, business_address, bank_account, verification_status, verification_documents, commission_rate, total_sales, rating, total_reviews, created_at, updated_at) FROM stdin;
1	2	Test Seller Business	individual	\N	\N	\N	verified	\N	0.10	0	\N	0	2025-08-02 13:18:12.626063	2025-08-02 13:18:12.626063
2	12	Mua ban San Pham	individual	888888	zxmzxmzxmzxmzxm	{"bank_code":"VCB","bank_name":"Vietcombank","account_number":"91293912391923","account_holder_name":"Tran Manh Cuong"}	verified	{verification-documents/12/1754809473012-z6224429011579_e99562d6adca5eb65942b84dc9fe8404.jpg,verification-documents/12/1754809476696-z6221566336300_dc1eeea0124ed7fc8886658b103e720f.jpg,verification-documents/12/1754809481555-cmt_Front.jpg}	0.10	0	\N	0	2025-08-10 07:04:58.743184	2025-08-10 07:30:14.366
\.


--
-- Data for Name: service_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_requests (id, client_id, title, description, requirements, budget_range, timeline, status, admin_notes, priority, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_quotations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_quotations (id, service_request_id, admin_id, title, description, deliverables, total_price, deposit_amount, timeline_days, terms_conditions, status, client_response, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_projects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_projects (id, quotation_id, service_request_id, client_id, admin_id, status, progress_percentage, milestones, deliverables_submitted, client_feedback, admin_notes, started_at, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_payments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_payments (id, quotation_id, service_project_id, client_id, amount, payment_type, status, stripe_payment_intent_id, payment_method, transaction_fee, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
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
-- Data for Name: softwares; Type: TABLE DATA; Schema: public; Owner: neondb_owner
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
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.support_tickets (id, order_id, buyer_id, seller_id, subject, description, status, priority, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_downloads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_downloads (id, user_id, software_id, version, downloaded_at) FROM stdin;
\.


--
-- Data for Name: user_presence; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_presence (id, user_id, is_online, last_seen, socket_id, created_at, updated_at) FROM stdin;
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
72	1	f	2025-08-07 16:39:00.516	t74YlxgACmWBwS6bAAAB	2025-08-07 16:37:25.926567	2025-08-07 16:37:25.926567
41	1	f	2025-08-07 16:39:00.516	G1q4u4RvN_QbKqD1AAAB	2025-08-07 14:50:18.773781	2025-08-07 14:50:18.773781
42	1	f	2025-08-07 16:39:00.516	FJ_4lCQ7emmNu1TVAAAB	2025-08-07 16:05:47.74164	2025-08-07 16:05:47.74164
50	1	f	2025-08-07 16:39:00.516	v5LJQGjKahzK2SZ_AAAR	2025-08-07 16:11:46.836378	2025-08-07 16:11:46.836378
61	1	f	2025-08-07 16:39:00.516	7tadh7M7pUSvIS7oAAAJ	2025-08-07 16:30:06.955882	2025-08-07 16:30:06.955882
69	1	f	2025-08-07 16:39:00.516	Gyf3DmwDfFGX7dZ1AAAL	2025-08-07 16:36:14.823926	2025-08-07 16:36:14.823926
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
64	1	f	2025-08-07 16:39:00.516	Zd5ELIiOk1Fqps4iAAAB	2025-08-07 16:32:55.796954	2025-08-07 16:32:55.796954
57	1	f	2025-08-07 16:39:00.516	fit1dmdm_liNd2RHAAAB	2025-08-07 16:27:05.349722	2025-08-07 16:27:05.349722
51	1	f	2025-08-07 16:39:00.516	bvM2ENk-jiJ7t9vTAAAB	2025-08-07 16:13:38.878692	2025-08-07 16:13:38.878692
63	1	f	2025-08-07 16:39:00.516	FA6oQAu5K28itqDUAAAN	2025-08-07 16:30:30.826814	2025-08-07 16:30:30.826814
67	1	f	2025-08-07 16:39:00.516	QOM25xpJX7tu0KfoAAAH	2025-08-07 16:33:59.911009	2025-08-07 16:33:59.911009
71	1	f	2025-08-07 16:39:00.516	lhcL7AoBSl0D2XehAAAP	2025-08-07 16:36:19.822088	2025-08-07 16:36:19.822088
75	1	f	2025-08-07 16:39:00.516	LAbhuLPYwnzgVcDjAAAH	2025-08-07 16:38:36.374862	2025-08-07 16:38:36.374862
\.


--
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 1, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.categories_id_seq', 21, true);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 28, true);


--
-- Name: chat_room_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.chat_room_members_id_seq', 2, true);


--
-- Name: chat_rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.chat_rooms_id_seq', 1, true);


--
-- Name: external_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.external_requests_id_seq', 7, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.notifications_id_seq', 5, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.order_items_id_seq', 16, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.orders_id_seq', 16, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.payments_id_seq', 16, true);


--
-- Name: portfolio_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.portfolio_reviews_id_seq', 1, false);


--
-- Name: portfolios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.portfolios_id_seq', 1, false);


--
-- Name: product_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.product_reviews_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.products_id_seq', 9, true);


--
-- Name: quotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.quotes_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: sales_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sales_analytics_id_seq', 1, false);


--
-- Name: seller_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.seller_profiles_id_seq', 2, true);


--
-- Name: service_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_payments_id_seq', 1, false);


--
-- Name: service_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_projects_id_seq', 1, false);


--
-- Name: service_quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_quotations_id_seq', 1, false);


--
-- Name: service_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_requests_id_seq', 1, false);


--
-- Name: softwares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.softwares_id_seq', 85, true);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.support_tickets_id_seq', 1, false);


--
-- Name: user_downloads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_downloads_id_seq', 1, false);


--
-- Name: user_presence_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_presence_id_seq', 79, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 12, true);


--
-- PostgreSQL database dump complete
--

