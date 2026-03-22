-- Production seed: users, categories, softwares (for Drizzle schema)
SET session_replication_role = replica;

COPY public.users (id, name, email, password, role, profile_data, updated_at, created_at, phone, email_verified, phone_verified, reset_token, reset_token_expires) FROM stdin;
2	Test Seller	seller@test.com	testpassword	seller	\N	2025-08-02 06:54:50.055965	2025-08-02 06:54:50.055965	\N	f	f	\N	\N
3	Test Buyer	buyer@test.com	testpassword	buyer	\N	2025-08-02 06:54:50.055965	2025-08-02 06:54:50.055965	\N	f	f	\N	\N
1	Administrator	cuongeurovnn@gmail.com	a1308afa92c062f113d233772b673f6fc8d5cb415553340d1a411c195c26f51a662f95953f57b0323ae78e5d00f868a391410864dfd8b9bf64d058119fc75035.666e97961ee31d2db66528751ed8514e	admin	\N	2025-08-01 10:38:37.709281	2025-08-01 10:38:37.709281	\N	f	f	\N	\N
12	tran manh cuong	cuongtm2012@gmail.com	Cuongtm2012$	seller	\N	2025-08-10 03:50:34.486592	2025-08-10 03:50:34.486592	\N	f	f	\N	\N
7	tran manh cuong	phiyenvnn@gmail.com	Sam@30092019	user	\N	2025-08-09 03:32:35.347637	2025-08-09 03:32:35.347637	\N	f	f	a5fe7f7fa41fc68be9524d11f94062f370e6337cef562420a48c8808f7c7c319	2025-08-10 11:15:04.731
\.

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

SET session_replication_role = DEFAULT;
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('softwares_id_seq', (SELECT MAX(id) FROM softwares));
