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
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.categories VALUES (1, 'Utilities', NULL);
INSERT INTO public.categories VALUES (2, 'Media', NULL);
INSERT INTO public.categories VALUES (3, 'Communication', NULL);
INSERT INTO public.categories VALUES (4, 'Business', NULL);
INSERT INTO public.categories VALUES (5, 'Games', NULL);
INSERT INTO public.categories VALUES (6, 'Development', NULL);
INSERT INTO public.categories VALUES (7, 'Productivity', NULL);
INSERT INTO public.categories VALUES (8, 'Security', NULL);
INSERT INTO public.categories VALUES (9, 'Office & Productivity', NULL);
INSERT INTO public.categories VALUES (10, 'Media Players & Editors', NULL);
INSERT INTO public.categories VALUES (11, 'Compression & Archiving Tools', NULL);
INSERT INTO public.categories VALUES (12, 'Development Tools & IDEs', NULL);
INSERT INTO public.categories VALUES (13, 'Utilities & System Tools', NULL);
INSERT INTO public.categories VALUES (14, 'Communication & Collaboration', NULL);
INSERT INTO public.categories VALUES (15, 'Security & Privacy', NULL);
INSERT INTO public.categories VALUES (16, 'AI & Big Data Tools', NULL);
INSERT INTO public.categories VALUES (17, 'Web Browsers', NULL);
INSERT INTO public.categories VALUES (18, 'Gaming & Entertainment', NULL);
INSERT INTO public.categories VALUES (19, 'Cloud & Storage', NULL);
INSERT INTO public.categories VALUES (20, 'Education & Learning Software', NULL);
INSERT INTO public.categories VALUES (21, 'Design & Creativity', NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (1, 'Administrator', 'admin@gmail.com', 'a1308afa92c062f113d233772b673f6fc8d5cb415553340d1a411c195c26f51a662f95953f57b0323ae78e5d00f868a391410864dfd8b9bf64d058119fc75035.666e97961ee31d2db66528751ed8514e', 'admin', NULL, '2025-08-01 10:38:37.709281', '2025-08-01 10:38:37.709281', NULL, false, false);
INSERT INTO public.users VALUES (2, 'Test Seller', 'seller@test.com', 'testpassword', 'seller', NULL, '2025-08-02 06:54:50.055965', '2025-08-02 06:54:50.055965', NULL, false, false);
INSERT INTO public.users VALUES (3, 'Test Buyer', 'buyer@test.com', 'testpassword', 'buyer', NULL, '2025-08-02 06:54:50.055965', '2025-08-02 06:54:50.055965', NULL, false, false);


--
-- Data for Name: external_requests; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.external_requests VALUES (1, 'tran', 'cuong@gmail.com', '03892342342', 'Project Name: lsdflasjdflasdjfas dfa sdf 
Company: slasjdfasdf
Description: asdfasd dfas df á dfa 
Requirements: asdfa sd fa sdf asdf   asdf a sdf  asdf   ádf
Budget: 1000000
Timeline: 3 ngay', 'pending', '2025-08-03 15:44:48.700399', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'normal', NULL, NULL, NULL, NULL);
INSERT INTO public.external_requests VALUES (2, 'Test Seller', 'seller@test.com', '+843892342342', 'Project Name: lsdflasjdflasdjfas dfa sdf 
Company: N/A
Description: alsfjalsdfasdf asd fa sdf á df asd fa sdf á dfa sd fas dfa
Requirements: - Next.js
- Python
Budget: 1000000
Timeline: 3 ngay', 'pending', '2025-08-03 16:11:03.766457', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'normal', NULL, NULL, NULL, NULL);
INSERT INTO public.external_requests VALUES (3, 'Test Seller', 'seller@test.com', '+841234567890', 'Project Name: lsdflasjdflasdjfas dfa sdf 
Company: slasjdfasdf
Description: lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf lsdflasjdflasdjfas dfa sdf 
Requirements: - AWS
- AWS
- AWS
- AWS
Budget: 1000000
Timeline: 3 ngay', 'pending', '2025-08-04 03:32:06.476881', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'normal', NULL, NULL, NULL, NULL);
INSERT INTO public.external_requests VALUES (4, 'Test Seller', 'seller@test.com', '0378246333', 'Project Name: lsdflasjdflasdjfas dfa sdf 
Company: slasjdfasdf
Description: asdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdfasdfasd asdf asdf asdfa sdf
Requirements: - Python
- Python
- Python
- Python
- Python
Budget: 1000000
Timeline: 3 ngay', 'pending', '2025-08-04 03:42:52.714536', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'normal', NULL, NULL, NULL, NULL);
INSERT INTO public.external_requests VALUES (6, 'Test User', 'test@example.com', '+84378246333', 'Test project with Vietnamese phone number - React, Node.js, PostgreSQL', 'pending', '2025-08-04 03:59:14.10611', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'normal', NULL, NULL, NULL, NULL);
INSERT INTO public.external_requests VALUES (5, 'Test Seller', 'seller@test.com', '0378246333', 'Project Name: Test 4. toi muon tao web app
Company: fpt
Description: toi muon tao web app doc baotoi muon tao web app doc baotoi muon tao web app doc baotoi muon tao web app doc bao
Requirements: - TypeScript
- Redis
- Laravel
- Docker
Budget: 1000000
Timeline: 3 ngay', 'pending', '2025-08-04 03:44:07.786565', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, 'normal', NULL, NULL, NULL, NULL);


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.products VALUES (2, 2, 'Advanced Captcha Solver Tool', 'AI-powered captcha solving tool with 99% success rate. Supports reCAPTCHA v2, v3, hCaptcha, and FunCaptcha. Includes API access and documentation.', 500000, '{https://via.placeholder.com/300x200?text=Captcha+Solver}', 'Captcha Solvers', '2025-08-02 06:55:39.432431', '2025-08-02 06:55:39.432431', 'fixed', 1, NULL, NULL, NULL, NULL, 'approved', false, 0, NULL);
INSERT INTO public.products VALUES (3, 2, 'Social Media Marketing Bot', 'Automated social media management tool for Instagram, Facebook, and TikTok. Features auto-posting, engagement automation, and analytics dashboard.', 1200000, '{https://via.placeholder.com/300x200?text=Social+Bot}', 'Marketing Tools', '2025-08-02 06:55:39.432431', '2025-08-02 06:55:39.432431', 'fixed', 1, NULL, NULL, NULL, NULL, 'approved', false, 0, NULL);
INSERT INTO public.products VALUES (4, 2, 'Crypto Trading Bot Premium', 'Professional cryptocurrency trading bot with AI algorithms. Supports Binance, Bybit, and other major exchanges. Includes risk management and backtesting.', 8000000, '{https://via.placeholder.com/300x200?text=Crypto+Bot}', 'Crypto Tools', '2025-08-02 06:55:39.432431', '2025-08-02 06:55:39.432431', 'fixed', 1, NULL, NULL, NULL, NULL, 'approved', false, 0, NULL);
INSERT INTO public.products VALUES (5, 2, 'Test Product API Fixed', 'This is a comprehensive test product description with sufficient length to meet requirements', 29.99, NULL, 'Software Licenses', '2025-08-02 16:51:09.691862', '2025-08-02 16:51:09.691862', 'fixed', 10, NULL, NULL, '{test,software,licenses}', NULL, 'pending', false, 0, NULL);
INSERT INTO public.products VALUES (1, 2, 'Updated Product Title', 'Updated comprehensive test product description with sufficient length to meet requirements', 39.99, '{https://via.placeholder.com/300x200?text=Gmail+Accounts}', 'Software Licenses', '2025-08-02 06:55:39.432431', '2025-08-02 06:55:39.432431', 'fixed', 5, NULL, NULL, NULL, NULL, 'approved', false, 0, NULL);
INSERT INTO public.products VALUES (6, 2, 'Test Product', 'Test description', 29.99, NULL, 'Software Licenses', '2025-08-03 10:54:36.64279', '2025-08-03 10:54:36.64279', 'fixed', 10, NULL, NULL, NULL, NULL, 'pending', false, 0, NULL);
INSERT INTO public.products VALUES (7, 2, 'Frontend Test Product', 'This is a test product created from the frontend form', 19.99, NULL, 'Software Licenses', '2025-08-03 10:55:01.009814', '2025-08-03 10:55:01.009814', 'fixed', 5, NULL, NULL, NULL, NULL, 'pending', false, 0, NULL);
INSERT INTO public.products VALUES (9, 2, 'ban Gmail gia re', 'san pham Gmail gia re nhat thi thuong', 10000, NULL, 'Software Licenses', '2025-08-04 08:25:47.867482', '2025-08-04 08:25:47.867482', 'fixed', 1, 'https://1000logos.net/wp-content/uploads/2021/05/Gmail-logo-500x281.png', NULL, '{gmail}', 'san pham gmail gia re an toan tuyet doi', 'pending', false, 0, NULL);


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: portfolio_reviews; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: seller_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.seller_profiles VALUES (1, 2, 'Test Seller Business', 'individual', NULL, NULL, NULL, 'verified', NULL, 0.10, 0, NULL, 0, '2025-08-02 13:18:12.626063', '2025-08-02 13:18:12.626063');


--
-- Data for Name: service_requests; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: service_quotations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: service_projects; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: service_payments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.session VALUES ('DKpauh5vjTdn8Ej2UsoN-TBx4JUnPBMg', '{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T11:23:17.577Z","httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-08-31 11:26:07');
INSERT INTO public.session VALUES ('1jQa9dXXi9aGA3K26xcDSw_BpDsTL-Pl', '{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T10:52:37.789Z","httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-08-31 10:54:18');
INSERT INTO public.session VALUES ('la_6H60osVlzSnioyL7w90V0cbdlxR-i', '{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T10:48:45.418Z","httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-08-31 10:48:52');
INSERT INTO public.session VALUES ('eETs7AxDQm5BKOTSmnvSv_LyaXFLXO_n', '{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T11:26:44.227Z","httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-08-31 11:29:20');
INSERT INTO public.session VALUES ('s09KsDmA1_DbCkiiIembVx-PhzVsZvHj', '{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T10:49:35.832Z","httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-08-31 10:51:54');
INSERT INTO public.session VALUES ('mH_M3ICN23nATgj7U_nXltk2KWrSbDdp', '{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T10:56:58.482Z","httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-08-31 10:59:23');
INSERT INTO public.session VALUES ('xi2cTkOxKs-tR3cfnSumGZUMj_mACT7S', '{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T11:30:32.431Z","httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-08-31 11:31:25');
INSERT INTO public.session VALUES ('Sx8qUWaZq3s5hfpKWC3Mmw_m4n3EE8lv', '{"cookie":{"originalMaxAge":2592000000,"expires":"2025-09-01T07:06:04.965Z","httpOnly":true,"path":"/"},"userId":2,"user":{"id":2,"name":"Test Seller","email":"seller@test.com","password":"testpassword","role":"seller","profile_data":null,"phone":null,"email_verified":false,"phone_verified":false,"updated_at":"2025-08-02T06:54:50.055Z","created_at":"2025-08-02T06:54:50.055Z"}}', '2025-09-01 07:06:06');
INSERT INTO public.session VALUES ('sKVPbahO60vBWjmUdCJoOY0xNQ6hy23p', '{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T11:03:38.924Z","httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-08-31 11:20:38');
INSERT INTO public.session VALUES ('dg7bBf8IWyEQ83q8yMQlmvrYwtA6zks-', '{"cookie":{"originalMaxAge":2592000000,"expires":"2025-09-01T07:06:12.609Z","httpOnly":true,"path":"/"},"userId":2,"user":{"id":2,"name":"Test Seller","email":"seller@test.com","password":"testpassword","role":"seller","profile_data":null,"phone":null,"email_verified":false,"phone_verified":false,"updated_at":"2025-08-02T06:54:50.055Z","created_at":"2025-08-02T06:54:50.055Z"}}', '2025-09-01 07:06:18');
INSERT INTO public.session VALUES ('PFIkkbVGWgE4Om4ATCiU6xkIkKCkg0u3', '{"cookie":{"originalMaxAge":2592000000,"expires":"2025-08-31T11:00:01.365Z","httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-08-31 11:01:29');


--
-- Data for Name: softwares; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.softwares VALUES (2, 'Adobe Photoshop', 'Professional image editing software with advanced features for digital art and photography.', 2, '{windows,mac}', 'https://adobe.com/photoshop', 'https://www.adobe.com/content/dam/acom/en/products/photoshop/pdp/photoshop-app-icon.svg', 1, 'approved', '2025-08-01 10:42:11.218774');
INSERT INTO public.softwares VALUES (3, 'Slack', 'Team collaboration hub that brings conversations, tools, and files together.', 3, '{windows,mac,linux,ios,android,web}', 'https://slack.com/downloads', 'https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_256.png', 1, 'approved', '2025-08-01 10:42:11.218774');
INSERT INTO public.softwares VALUES (4, 'Microsoft Excel', 'Powerful spreadsheet application for data analysis and visualization.', 4, '{windows,mac,web}', 'https://office.microsoft.com/excel', 'https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg', 1, 'approved', '2025-08-01 10:42:11.218774');
INSERT INTO public.softwares VALUES (5, 'Steam', 'Gaming platform for purchasing, downloading, and playing games.', 5, '{windows,mac,linux}', 'https://store.steampowered.com/about', 'https://store.cloudflare.steamstatic.com/public/shared/images/header/logo_steam.svg', 1, 'approved', '2025-08-01 10:42:11.218774');
INSERT INTO public.softwares VALUES (6, 'Node.js', 'JavaScript runtime built on Chrome V8 engine for building scalable applications.', 6, '{windows,mac,linux}', 'https://nodejs.org/download', 'https://nodejs.org/static/images/logo.svg', 1, 'approved', '2025-08-01 10:42:11.218774');
INSERT INTO public.softwares VALUES (8, 'Malwarebytes', 'Anti-malware software for detecting and removing malicious software.', 8, '{windows,mac,android}', 'https://malwarebytes.com/download', 'https://www.malwarebytes.com/images/brand/mb-logo-dark.svg', 1, 'approved', '2025-08-01 10:42:11.218774');
INSERT INTO public.softwares VALUES (1, 'Visual Studio Code', 'A powerful code editor with IntelliSense, debugging, and Git integration.', 6, '{windows,mac,linux}', 'https://code.visualstudio.com/download', 'https://code.visualstudio.com/assets/images/code-stable.png', 1, 'approved', '2025-08-01 10:42:11.218774');
INSERT INTO public.softwares VALUES (7, 'Notion', 'All-in-one workspace for notes, tasks, wikis, and databases.', 7, '{windows,mac,web,ios,android}', 'https://www.notion.com/desktop/windows/download', 'https://www.notion.so/images/logo-ios.png', 1, 'approved', '2025-08-01 10:42:11.218774');
INSERT INTO public.softwares VALUES (9, 'LibreOffice', 'Free and open-source office suite with word processor, spreadsheet, presentation, and database applications', 9, '{windows,mac,linux}', 'https://www.libreoffice.org/download/', 'https://www.libreoffice.org/assets/Uploads/LibreOffice-Initial-Artwork-Logo-ColorLogoBasic-500px.png', 1, 'approved', '2025-08-01 16:56:05.323518');
INSERT INTO public.softwares VALUES (10, 'OnlyOffice', 'Comprehensive office suite for document editing, collaboration, and project management', 9, '{windows,mac,linux,web}', 'https://www.onlyoffice.com/download.aspx', 'https://www.onlyoffice.com/blog/content/images/2021/04/onlyoffice-logo.png', 1, 'approved', '2025-08-01 16:56:05.323518');
INSERT INTO public.softwares VALUES (11, 'WPS Office', 'Lightweight office suite compatible with Microsoft Office formats', 9, '{windows,mac,linux,android,ios}', 'https://www.wps.com/download/', 'https://www.wps.com/images/wps-logo.png', 1, 'approved', '2025-08-01 16:56:05.323518');
INSERT INTO public.softwares VALUES (12, 'Zoho Office Suite', 'Cloud-based office suite with document, spreadsheet, and presentation tools', 9, '{web,android,ios}', 'https://www.zoho.com/docs/', 'https://www.zoho.com/img/zoho-logo.svg', 1, 'approved', '2025-08-01 16:56:05.323518');
INSERT INTO public.softwares VALUES (13, 'Notion', 'All-in-one workspace for note-taking, collaboration, and project management', 9, '{windows,mac,web,android,ios}', 'https://www.notion.so/desktop', 'https://www.notion.so/images/logo-ios.png', 1, 'approved', '2025-08-01 16:56:05.323518');
INSERT INTO public.softwares VALUES (14, 'Evernote', 'Note-taking and organization app for capturing and organizing information', 9, '{windows,mac,web,android,ios}', 'https://evernote.com/download', 'https://evernote.com/img/evernote-logo.svg', 1, 'approved', '2025-08-01 16:56:05.323518');
INSERT INTO public.softwares VALUES (15, 'VLC Media Player', 'Free and open-source multimedia player and framework that plays most multimedia files', 10, '{windows,mac,linux,android,ios}', 'https://www.videolan.org/vlc/', 'https://images.videolan.org/images/VLC-IconSmall.png', 1, 'approved', '2025-08-01 16:56:13.983007');
INSERT INTO public.softwares VALUES (16, 'MPV Player', 'Free, open-source, and cross-platform media player with advanced features', 10, '{windows,mac,linux}', 'https://mpv.io/installation/', 'https://mpv.io/images/mpv-logo-128.png', 1, 'approved', '2025-08-01 16:56:13.983007');
INSERT INTO public.softwares VALUES (17, 'Audacity', 'Free, open-source, cross-platform audio software for multi-track recording and editing', 10, '{windows,mac,linux}', 'https://www.audacityteam.org/download/', 'https://www.audacityteam.org/wp-content/themes/wp_audacity/img/logo.png', 1, 'approved', '2025-08-01 16:56:13.983007');
INSERT INTO public.softwares VALUES (18, 'Shotcut', 'Free, open-source, cross-platform video editor with comprehensive features', 10, '{windows,mac,linux}', 'https://shotcut.org/download/', 'https://shotcut.org/assets/img/shotcut-logo-64.png', 1, 'approved', '2025-08-01 16:56:13.983007');
INSERT INTO public.softwares VALUES (19, 'OBS Studio', 'Free and open-source software for video recording and live streaming', 10, '{windows,mac,linux}', 'https://obsproject.com/download', 'https://obsproject.com/assets/images/new_icon_small-r.png', 1, 'approved', '2025-08-01 16:56:13.983007');
INSERT INTO public.softwares VALUES (20, 'GIMP', 'GNU Image Manipulation Program - free and open-source raster graphics editor', 10, '{windows,mac,linux}', 'https://www.gimp.org/downloads/', 'https://www.gimp.org/images/frontpage/wilber-big.png', 1, 'approved', '2025-08-01 16:56:13.983007');
INSERT INTO public.softwares VALUES (21, 'Inkscape', 'Professional vector graphics editor for creating scalable graphics', 10, '{windows,mac,linux}', 'https://inkscape.org/release/', 'https://media.inkscape.org/static/images/inkscape-logo.svg', 1, 'approved', '2025-08-01 16:56:13.983007');
INSERT INTO public.softwares VALUES (22, '7-Zip', 'Free and open-source file archiver with high compression ratio', 11, '{windows,linux}', 'https://www.7-zip.org/download.html', 'https://www.7-zip.org/7ziplogo.png', 1, 'approved', '2025-08-01 16:56:19.845734');
INSERT INTO public.softwares VALUES (23, 'PeaZip', 'Free file archiver utility with support for 200+ archive formats', 11, '{windows,linux}', 'https://peazip.github.io/peazip-download.html', 'https://peazip.github.io/peazip-64.png', 1, 'approved', '2025-08-01 16:56:19.845734');
INSERT INTO public.softwares VALUES (24, 'WinRAR', 'Powerful archiver and archive manager with compression and encryption features', 11, '{windows,mac}', 'https://www.win-rar.com/download.html', 'https://www.win-rar.com/fileadmin/images/winrar_logo.png', 1, 'approved', '2025-08-01 16:56:19.845734');
INSERT INTO public.softwares VALUES (25, 'Bandizip', 'Lightweight, fast, and free archiver for Windows with clean interface', 11, '{windows}', 'https://en.bandisoft.com/bandizip/', 'https://en.bandisoft.com/img/bandizip/bandizip-icon-256.png', 1, 'approved', '2025-08-01 16:56:19.845734');
INSERT INTO public.softwares VALUES (26, 'Visual Studio Code', 'Lightweight but powerful source code editor with extensive extension support', 12, '{windows,mac,linux}', 'https://code.visualstudio.com/download', 'https://code.visualstudio.com/assets/images/code-stable.png', 1, 'approved', '2025-08-01 16:56:29.449493');
INSERT INTO public.softwares VALUES (27, 'IntelliJ IDEA Community Edition', 'Free and open-source IDE for Java development with intelligent code assistance', 12, '{windows,mac,linux}', 'https://www.jetbrains.com/idea/download/', 'https://resources.jetbrains.com/storage/products/intellij-idea/img/meta/intellij-idea_logo_300x300.png', 1, 'approved', '2025-08-01 16:56:29.449493');
INSERT INTO public.softwares VALUES (28, 'Eclipse IDE', 'Free and open-source integrated development environment primarily for Java', 12, '{windows,mac,linux}', 'https://www.eclipse.org/downloads/', 'https://www.eclipse.org/eclipse.org-common/themes/solstice/public/images/logo/eclipse-426x100.png', 1, 'approved', '2025-08-01 16:56:29.449493');
INSERT INTO public.softwares VALUES (29, 'Atom Editor', 'Free and open-source text and source code editor with customizable interface', 12, '{windows,mac,linux}', 'https://github.com/atom/atom/releases', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', 1, 'approved', '2025-08-01 16:56:29.449493');
INSERT INTO public.softwares VALUES (30, 'GitKraken', 'Powerful Git client with intuitive interface for version control management', 12, '{windows,mac,linux}', 'https://www.gitkraken.com/download', 'https://www.gitkraken.com/img/gk-logo.svg', 1, 'approved', '2025-08-01 16:56:29.449493');
INSERT INTO public.softwares VALUES (31, 'SourceTree', 'Free Git client for Windows and Mac with visual interface for repositories', 12, '{windows,mac}', 'https://www.sourcetreeapp.com/', 'https://wac-cdn.atlassian.com/dam/jcr:580b2cc1-1d37-4e96-9e3a-46e71e3a4076/sourcetree-icon-blue.svg', 1, 'approved', '2025-08-01 16:56:29.449493');
INSERT INTO public.softwares VALUES (32, 'BleachBit', 'Free system cleaner that removes unnecessary files and protects privacy', 13, '{windows,linux}', 'https://www.bleachbit.org/download', 'https://www.bleachbit.org/sites/default/files/zen_logo.png', 1, 'approved', '2025-08-01 16:56:39.775967');
INSERT INTO public.softwares VALUES (33, 'Duplicati', 'Free backup client that stores encrypted, compressed backups online', 13, '{windows,mac,linux}', 'https://www.duplicati.com/download', 'https://www.duplicati.com/img/duplicati_logo.png', 1, 'approved', '2025-08-01 16:56:39.775967');
INSERT INTO public.softwares VALUES (34, 'Glary Utilities', 'All-in-one system cleaner and performance optimizer for Windows', 13, '{windows}', 'https://www.glarysoft.com/glary-utilities/', 'https://www.glarysoft.com/img/gu-logo.png', 1, 'approved', '2025-08-01 16:56:39.775967');
INSERT INTO public.softwares VALUES (35, 'CPU-Z', 'System information software that provides detailed hardware information', 13, '{windows}', 'https://www.cpuid.com/softwares/cpu-z.html', 'https://www.cpuid.com/medias/images/logos/cpuz.png', 1, 'approved', '2025-08-01 16:56:39.775967');
INSERT INTO public.softwares VALUES (36, 'HWMonitor', 'Hardware monitoring program that reads health sensors of systems', 13, '{windows}', 'https://www.cpuid.com/softwares/hwmonitor.html', 'https://www.cpuid.com/medias/images/logos/hwmonitor.png', 1, 'approved', '2025-08-01 16:56:39.775967');
INSERT INTO public.softwares VALUES (37, 'Everything Search Engine', 'Lightning-fast file search utility for Windows based on filename indexing', 13, '{windows}', 'https://www.voidtools.com/downloads/', 'https://www.voidtools.com/Everything.ico', 1, 'approved', '2025-08-01 16:56:39.775967');
INSERT INTO public.softwares VALUES (38, 'Signal', 'Private messenger with end-to-end encryption for secure communication', 14, '{windows,mac,linux,android,ios}', 'https://signal.org/download/', 'https://signal.org/assets/images/header/signal-logo.png', 1, 'approved', '2025-08-01 16:56:47.063157');
INSERT INTO public.softwares VALUES (39, 'Thunderbird', 'Free and open-source email client with calendar and chat features', 14, '{windows,mac,linux}', 'https://www.thunderbird.net/download/', 'https://www.thunderbird.net/media/img/thunderbird/logos/logo.png', 1, 'approved', '2025-08-01 16:56:47.063157');
INSERT INTO public.softwares VALUES (40, 'Zoom', 'Video conferencing platform for meetings, webinars, and collaboration', 14, '{windows,mac,linux,android,ios,web}', 'https://zoom.us/download', 'https://st1.zoom.us/static/6.3.5/image/new/topNav/Zoom_logo.svg', 1, 'approved', '2025-08-01 16:56:47.063157');
INSERT INTO public.softwares VALUES (41, 'Microsoft Teams', 'Collaboration platform combining workplace chat, meetings, and file sharing', 14, '{windows,mac,linux,android,ios,web}', 'https://www.microsoft.com/microsoft-teams/download-app', 'https://www.microsoft.com/favicon.ico', 1, 'approved', '2025-08-01 16:56:47.063157');
INSERT INTO public.softwares VALUES (42, 'Jitsi Meet', 'Open-source video conferencing solution with privacy focus', 14, '{web,android,ios}', 'https://jitsi.org/downloads/', 'https://jitsi.org/wp-content/uploads/2017/11/jitsi-logo-blue-grey-text.png', 1, 'approved', '2025-08-01 16:56:47.063157');
INSERT INTO public.softwares VALUES (43, 'VeraCrypt', 'Free open-source disk encryption software for creating encrypted volumes', 15, '{windows,mac,linux}', 'https://www.veracrypt.fr/en/Downloads.html', 'https://www.veracrypt.fr/en/VeraCrypt_Logo.png', 1, 'approved', '2025-08-01 16:56:53.125143');
INSERT INTO public.softwares VALUES (44, 'Bitwarden', 'Open-source password manager with cross-platform synchronization', 15, '{windows,mac,linux,android,ios,web}', 'https://bitwarden.com/download/', 'https://bitwarden.com/images/icons/logo.svg', 1, 'approved', '2025-08-01 16:56:53.125143');
INSERT INTO public.softwares VALUES (45, 'Tor Browser', 'Privacy-focused web browser that routes traffic through the Tor network', 15, '{windows,mac,linux,android}', 'https://www.torproject.org/download/', 'https://www.torproject.org/static/images/tor-project-logo-onions.png', 1, 'approved', '2025-08-01 16:56:53.125143');
INSERT INTO public.softwares VALUES (46, 'KeePass', 'Free, open-source password manager that stores passwords in encrypted databases', 15, '{windows,mac,linux}', 'https://keepass.info/download.html', 'https://keepass.info/screenshots/keepass_2x_mainwnd_big.png', 1, 'approved', '2025-08-01 16:56:53.125143');
INSERT INTO public.softwares VALUES (47, 'TensorFlow', 'Open-source machine learning framework for developing and training ML models', 16, '{windows,mac,linux}', 'https://www.tensorflow.org/install', 'https://www.tensorflow.org/images/tf_logo_social.png', 1, 'approved', '2025-08-01 16:56:59.045671');
INSERT INTO public.softwares VALUES (48, 'PyTorch', 'Open-source machine learning library based on Torch for deep learning applications', 16, '{windows,mac,linux}', 'https://pytorch.org/get-started/locally/', 'https://pytorch.org/assets/images/pytorch-logo.png', 1, 'approved', '2025-08-01 16:56:59.045671');
INSERT INTO public.softwares VALUES (49, 'Apache Spark', 'Unified analytics engine for large-scale data processing and machine learning', 16, '{windows,mac,linux}', 'https://spark.apache.org/downloads.html', 'https://spark.apache.org/images/spark-logo-trademark.png', 1, 'approved', '2025-08-01 16:56:59.045671');
INSERT INTO public.softwares VALUES (50, 'Jupyter Notebook', 'Open-source web application for creating and sharing computational documents', 16, '{windows,mac,linux}', 'https://jupyter.org/install', 'https://jupyter.org/assets/logos/rectanglelogo-greytext-orangebody-greymoons.svg', 1, 'approved', '2025-08-01 16:56:59.045671');
INSERT INTO public.softwares VALUES (51, 'OpenCV', 'Open-source computer vision and machine learning software library', 16, '{windows,mac,linux}', 'https://opencv.org/releases/', 'https://opencv.org/wp-content/uploads/2020/07/OpenCV_logo_no_text_.png', 1, 'approved', '2025-08-01 16:56:59.045671');
INSERT INTO public.softwares VALUES (52, 'Mozilla Firefox', 'Free and open-source web browser with privacy features and customization options', 17, '{windows,mac,linux,android,ios}', 'https://www.mozilla.org/firefox/download/', 'https://www.mozilla.org/media/img/logos/firefox/logo-quantum.png', 1, 'approved', '2025-08-01 16:57:10.00909');
INSERT INTO public.softwares VALUES (53, 'Google Chrome', 'Fast and secure web browser built for the modern web with Google integration', 17, '{windows,mac,linux,android,ios}', 'https://www.google.com/chrome/', 'https://www.google.com/chrome/static/images/chrome-logo.svg', 1, 'approved', '2025-08-01 16:57:10.00909');
INSERT INTO public.softwares VALUES (54, 'Brave Browser', 'Privacy-focused web browser that blocks ads and trackers by default', 17, '{windows,mac,linux,android,ios}', 'https://brave.com/download/', 'https://brave.com/static-assets/images/brave-logo.svg', 1, 'approved', '2025-08-01 16:57:10.00909');
INSERT INTO public.softwares VALUES (55, 'Microsoft Edge', 'Modern web browser built on Chromium with Microsoft services integration', 17, '{windows,mac,linux,android,ios}', 'https://www.microsoft.com/edge/download', 'https://www.microsoft.com/favicon.ico', 1, 'approved', '2025-08-01 16:57:10.00909');
INSERT INTO public.softwares VALUES (56, 'Lutris', 'Open-source gaming platform for Linux that manages game installations', 18, '{linux}', 'https://lutris.net/downloads/', 'https://lutris.net/static/images/lutris-logo.png', 1, 'approved', '2025-08-01 16:57:12.819875');
INSERT INTO public.softwares VALUES (57, 'RetroArch', 'Frontend for emulators, game engines and media players with unified interface', 18, '{windows,mac,linux,android,ios}', 'https://www.retroarch.com/index.php?page=platforms', 'https://www.retroarch.com/images/retroarch-logo.png', 1, 'approved', '2025-08-01 16:57:12.819875');
INSERT INTO public.softwares VALUES (58, 'Nextcloud', 'Self-hosted productivity platform with file sync, share, and collaboration features', 19, '{windows,mac,linux,android,ios,web}', 'https://nextcloud.com/install/', 'https://nextcloud.com/media/nextcloud-logo-blue.svg', 1, 'approved', '2025-08-01 16:57:17.539974');
INSERT INTO public.softwares VALUES (59, 'Syncthing', 'Continuous file synchronization program that syncs files between devices', 19, '{windows,mac,linux,android}', 'https://syncthing.net/downloads/', 'https://syncthing.net/img/logo-horizontal.svg', 1, 'approved', '2025-08-01 16:57:17.539974');
INSERT INTO public.softwares VALUES (60, 'Resilio Sync', 'Peer-to-peer file synchronization tool for sharing data across devices', 19, '{windows,mac,linux,android,ios}', 'https://www.resilio.com/individuals/', 'https://www.resilio.com/img/logo.svg', 1, 'approved', '2025-08-01 16:57:17.539974');
INSERT INTO public.softwares VALUES (61, 'Anki', 'Spaced repetition flashcard program for efficient learning and memorization', 20, '{windows,mac,linux,android,ios}', 'https://apps.ankiweb.net/', 'https://apps.ankiweb.net/favicon.ico', 1, 'approved', '2025-08-01 16:57:22.879038');
INSERT INTO public.softwares VALUES (62, 'Moodle', 'Open-source learning platform for creating personalized learning environments', 20, '{web}', 'https://moodle.org/download/', 'https://moodle.org/theme/image.php/boost/theme_moodleorg/1638360480/moodlelogo', 1, 'approved', '2025-08-01 16:57:22.879038');
INSERT INTO public.softwares VALUES (63, 'Khan Academy', 'Free online courses and practice exercises for personalized learning', 20, '{web,android,ios}', 'https://www.khanacademy.org/', 'https://cdn.kastatic.org/images/khan-logo-dark-background.png', 1, 'approved', '2025-08-01 16:57:22.879038');
INSERT INTO public.softwares VALUES (64, 'Blender', 'Free and open-source 3D computer graphics software for modeling, animation, and rendering', 21, '{windows,mac,linux}', 'https://www.blender.org/download/', 'https://www.blender.org/wp-content/uploads/2015/03/blender_logo_socket.png', 1, 'approved', '2025-08-01 16:57:26.381129');
INSERT INTO public.softwares VALUES (65, 'Krita', 'Free and open-source digital painting application designed for concept artists and illustrators', 21, '{windows,mac,linux}', 'https://krita.org/en/download/krita-desktop/', 'https://krita.org/images/krita-logo.svg', 1, 'approved', '2025-08-01 16:57:26.381129');
INSERT INTO public.softwares VALUES (66, 'Canva', 'Web-based graphic design platform with templates for social media, presentations, and more', 21, '{web,android,ios}', 'https://www.canva.com/', 'https://www.canva.com/img/logos/canva-logo.svg', 1, 'approved', '2025-08-01 16:57:26.381129');
INSERT INTO public.softwares VALUES (67, 'Scratch 3.29', 'Visual programming language and online community for creating interactive stories, games, and animations', 12, '{windows,mac,linux,web}', 'https://scratch.mit.edu/download', 'https://scratch.mit.edu/images/scratch-logo.svg', 1, 'approved', '2025-08-01 17:06:12.175092');
INSERT INTO public.softwares VALUES (68, 'Microsoft Visual C++ Redistributable', 'Runtime components of Visual C++ Libraries required for running applications developed with Visual C++', 12, '{windows}', 'https://docs.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist', 'https://www.microsoft.com/favicon.ico', 1, 'approved', '2025-08-01 17:06:12.175092');
INSERT INTO public.softwares VALUES (69, 'Python 3.13', 'High-level programming language with dynamic semantics and powerful data structures', 12, '{windows,mac,linux}', 'https://www.python.org/downloads/', 'https://www.python.org/static/img/python-logo.png', 1, 'approved', '2025-08-01 17:06:12.175092');
INSERT INTO public.softwares VALUES (70, 'Visual Studio 2022', 'Comprehensive IDE for developing applications across multiple platforms and languages', 12, '{windows,mac}', 'https://visualstudio.microsoft.com/downloads/', 'https://www.microsoft.com/favicon.ico', 1, 'approved', '2025-08-01 17:06:12.175092');
INSERT INTO public.softwares VALUES (71, 'Notepad++', 'Free source code editor and Notepad replacement with syntax highlighting and tabbed interface', 12, '{windows}', 'https://notepad-plus-plus.org/downloads/', 'https://notepad-plus-plus.org/images/logo.svg', 1, 'approved', '2025-08-01 17:06:12.175092');
INSERT INTO public.softwares VALUES (72, 'Microsoft SQL Server 2019', 'Relational database management system developed by Microsoft for enterprise applications', 12, '{windows,linux}', 'https://www.microsoft.com/sql-server/sql-server-downloads', 'https://www.microsoft.com/favicon.ico', 1, 'approved', '2025-08-01 17:06:12.175092');
INSERT INTO public.softwares VALUES (73, 'Code::Blocks', 'Free, open-source, cross-platform C/C++ IDE built around a plugin framework', 12, '{windows,mac,linux}', 'https://www.codeblocks.org/downloads/', 'https://www.codeblocks.org/images/logo160.png', 1, 'approved', '2025-08-01 17:06:12.175092');
INSERT INTO public.softwares VALUES (74, 'MATLAB R2024b', 'Multi-paradigm programming language and computing environment for algorithm development and data analysis', 12, '{windows,mac,linux}', 'https://www.mathworks.com/products/matlab.html', 'https://www.mathworks.com/etc/designs/mathworks/images/pic-header-mathworks-logo.svg', 1, 'approved', '2025-08-01 17:06:12.175092');
INSERT INTO public.softwares VALUES (75, 'Arduino IDE', 'Open-source electronics platform based on easy-to-use hardware and software for microcontroller programming', 12, '{windows,mac,linux}', 'https://www.arduino.cc/en/software', 'https://www.arduino.cc/arduino_logo.svg', 1, 'approved', '2025-08-01 17:06:12.175092');
INSERT INTO public.softwares VALUES (76, 'Visual Studio Community 2019', 'Free, full-featured IDE for students, open-source contributors, and individual developers', 12, '{windows}', 'https://visualstudio.microsoft.com/vs/older-downloads/', 'https://www.microsoft.com/favicon.ico', 1, 'approved', '2025-08-01 17:06:12.175092');
INSERT INTO public.softwares VALUES (77, 'OpenGL 4.6', 'Cross-platform graphics API for rendering 2D and 3D vector graphics', 12, '{windows,mac,linux}', 'https://www.opengl.org/', 'https://www.opengl.org/img/opengl_logo.jpg', 1, 'approved', '2025-08-01 17:07:30.207287');
INSERT INTO public.softwares VALUES (78, 'Microsoft Visual Studio 2017 Express', 'Free version of Visual Studio IDE for individual developers and small teams', 12, '{windows}', 'https://visualstudio.microsoft.com/vs/older-downloads/', 'https://www.microsoft.com/favicon.ico', 1, 'approved', '2025-08-01 17:07:30.207287');
INSERT INTO public.softwares VALUES (79, 'Free Pascal 3.2', 'Open source Pascal compiler with Object Pascal support for multiple platforms', 12, '{windows,mac,linux}', 'https://www.freepascal.org/download.html', 'https://www.freepascal.org/pic/logo.gif', 1, 'approved', '2025-08-01 17:07:30.207287');
INSERT INTO public.softwares VALUES (80, 'PyCharm 2025.1', 'Professional Python IDE with intelligent code assistance and debugging tools', 12, '{windows,mac,linux}', 'https://www.jetbrains.com/pycharm/download/', 'https://resources.jetbrains.com/storage/products/pycharm/img/meta/pycharm_logo_300x300.png', 1, 'approved', '2025-08-01 17:07:30.207287');
INSERT INTO public.softwares VALUES (81, 'Adobe Animate CC 2019', 'Professional animation software for creating interactive animations and multimedia content', 21, '{windows,mac}', 'https://www.adobe.com/products/animate.html', 'https://www.adobe.com/content/dam/acom/en/products/animate/pdp/animate-app-icon.svg', 1, 'approved', '2025-08-01 17:07:30.207287');
INSERT INTO public.softwares VALUES (82, 'XAMPP 8.2', 'Free and open-source cross-platform web server solution stack with Apache, MySQL, PHP and Perl', 12, '{windows,mac,linux}', 'https://www.apachefriends.org/download.html', 'https://www.apachefriends.org/images/xampp-logo.svg', 1, 'approved', '2025-08-01 17:07:30.207287');
INSERT INTO public.softwares VALUES (83, 'Android Studio 2024.2', 'Official integrated development environment for Android app development', 12, '{windows,mac,linux}', 'https://developer.android.com/studio', 'https://developer.android.com/images/brand/Android_Robot.png', 1, 'approved', '2025-08-01 17:07:30.207287');
INSERT INTO public.softwares VALUES (84, 'Resource Hacker 5.1', 'Resource compiler and decompiler for Windows applications', 13, '{windows}', 'http://www.angusj.com/resourcehacker/', 'https://www.angusj.com/resourcehacker/resource_hacker.png', 1, 'approved', '2025-08-01 17:07:30.207287');
INSERT INTO public.softwares VALUES (85, 'MySQL 8.0', 'Open-source relational database management system for web applications and data storage', 12, '{windows,mac,linux}', 'https://dev.mysql.com/downloads/', 'https://labs.mysql.com/common/logos/mysql-logo.svg', 1, 'approved', '2025-08-01 17:07:30.207287');


--
-- Data for Name: user_downloads; Type: TABLE DATA; Schema: public; Owner: -
--



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
-- PostgreSQL database dump complete
--

