-- SoftwareHub Complete Database Export
-- Generated on: August 10, 2025 11:34:52 AM
-- Database: PostgreSQL

-- =====================================================
-- USERS TABLE
-- =====================================================
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    profile_data JSONB,
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert users data
INSERT INTO users (id, name, email, password, role, profile_data, updated_at, created_at, phone, email_verified, phone_verified, reset_token, reset_token_expires) VALUES
(2, 'Test Seller', 'seller@test.com', 'testpassword', 'seller', NULL, '2025-08-02 06:54:50.055965', '2025-08-02 06:54:50.055965', NULL, false, false, NULL, NULL),
(3, 'Test Buyer', 'buyer@test.com', 'testpassword', 'buyer', NULL, '2025-08-02 06:54:50.055965', '2025-08-02 06:54:50.055965', NULL, false, false, NULL, NULL),
(1, 'Administrator', 'cuongeurovnn@gmail.com', 'a1308afa92c062f113d233772b673f6fc8d5cb415553340d1a411c195c26f51a662f95953f57b0323ae78e5d00f868a391410864dfd8b9bf64d058119fc75035.666e97961ee31d2db66528751ed8514e', 'admin', NULL, '2025-08-01 10:38:37.709281', '2025-08-01 10:38:37.709281', NULL, false, false, NULL, NULL),
(12, 'tran manh cuong', 'cuongtm2012@gmail.com', 'Cuongtm2012$', 'seller', NULL, '2025-08-10 03:50:34.486592', '2025-08-10 03:50:34.486592', NULL, false, false, NULL, NULL),
(7, 'tran manh cuong', 'phiyenvnn@gmail.com', 'Sam@30092019', 'user', NULL, '2025-08-09 03:32:35.347637', '2025-08-09 03:32:35.347637', NULL, false, false, 'a5fe7f7fa41fc68be9524d11f94062f370e6337cef562420a48c8808f7c7c319', '2025-08-10 11:15:04.731');

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
DROP TABLE IF EXISTS categories CASCADE;
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES categories(id)
);

-- Insert categories data
INSERT INTO categories (id, name, parent_id) VALUES
(1, 'Utilities', NULL),
(2, 'Media', NULL),
(3, 'Communication', NULL),
(4, 'Business', NULL),
(5, 'Games', NULL),
(6, 'Development', NULL),
(7, 'Productivity', NULL),
(8, 'Security', NULL),
(9, 'Office & Productivity', NULL),
(10, 'Media Players & Editors', NULL),
(11, 'Compression & Archiving Tools', NULL),
(12, 'Development Tools & IDEs', NULL),
(13, 'Utilities & System Tools', NULL),
(14, 'Communication & Collaboration', NULL),
(15, 'Security & Privacy', NULL),
(16, 'AI & Big Data Tools', NULL),
(17, 'Web Browsers', NULL),
(18, 'Gaming & Entertainment', NULL),
(19, 'Cloud & Storage', NULL),
(20, 'Education & Learning Software', NULL),
(21, 'Design & Creativity', NULL);

-- =====================================================
-- PRODUCTS TABLE (MARKETPLACE)
-- =====================================================
DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    images TEXT[],
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    price_type VARCHAR(50) DEFAULT 'fixed',
    stock_quantity INTEGER DEFAULT 0,
    download_link TEXT,
    product_files TEXT[],
    tags TEXT[],
    license_info TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    featured BOOLEAN DEFAULT FALSE,
    total_sales INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2)
);

-- Insert products data
INSERT INTO products (id, seller_id, title, description, price, images, category, created_at, updated_at, price_type, stock_quantity, download_link, product_files, tags, license_info, status, featured, total_sales, avg_rating) VALUES
(2, 2, 'Advanced Captcha Solver Tool', 'AI-powered captcha solving tool with 99% success rate. Supports reCAPTCHA v2, v3, hCaptcha, and FunCaptcha. Includes API access and documentation.', 500000, ARRAY['https://via.placeholder.com/300x200?text=Captcha+Solver'], 'Captcha Solvers', '2025-08-02 06:55:39.432431', '2025-08-02 06:55:39.432431', 'fixed', 10, NULL, NULL, NULL, NULL, 'approved', false, 1, NULL),
(1, 2, 'Updated Product Title', 'Updated comprehensive test product description with sufficient length to meet requirements', 39.99, ARRAY['https://via.placeholder.com/300x200?text=Gmail+Accounts'], 'Software Licenses', '2025-08-02 06:55:39.432431', '2025-08-02 06:55:39.432431', 'fixed', 10, NULL, NULL, NULL, NULL, 'approved', false, 5, NULL),
(5, 2, 'Test Product API Fixed', 'This is a comprehensive test product description with sufficient length to meet requirements', 29.99, NULL, 'Software Licenses', '2025-08-02 16:51:09.691862', '2025-08-02 16:51:09.691862', 'fixed', 10, NULL, NULL, ARRAY['test','software','licenses'], NULL, 'pending', false, 0, NULL),
(6, 2, 'Test Product', 'Test description', 29.99, NULL, 'Software Licenses', '2025-08-03 10:54:36.64279', '2025-08-03 10:54:36.64279', 'fixed', 10, NULL, NULL, NULL, NULL, 'pending', false, 0, NULL),
(7, 2, 'Frontend Test Product', 'This is a test product created from the frontend form', 19.99, NULL, 'Software Licenses', '2025-08-03 10:55:01.009814', '2025-08-03 10:55:01.009814', 'fixed', 5, NULL, NULL, NULL, NULL, 'pending', false, 0, NULL),
(9, 2, 'ban Gmail gia re', 'san pham Gmail gia re nhat thi thuong', 10000, NULL, 'Software Licenses', '2025-08-04 08:25:47.867482', '2025-08-04 08:25:47.867482', 'fixed', 1, 'https://1000logos.net/wp-content/uploads/2021/05/Gmail-logo-500x281.png', NULL, ARRAY['gmail'], 'san pham gmail gia re an toan tuyet doi', 'pending', false, 0, NULL),
(4, 2, 'Crypto Trading Bot Premium', 'Professional cryptocurrency trading bot with AI algorithms. Supports Binance, Bybit, and other major exchanges. Includes risk management and backtesting.', 8000000, ARRAY['https://via.placeholder.com/300x200?text=Crypto+Bot'], 'Crypto Tools', '2025-08-02 06:55:39.432431', '2025-08-02 06:55:39.432431', 'fixed', 4, NULL, NULL, NULL, NULL, 'approved', false, 7, NULL),
(3, 2, 'Social Media Marketing Bot', 'Automated social media management tool for Instagram, Facebook, and TikTok. Features auto-posting, engagement automation, and analytics dashboard.', 1200000, ARRAY['https://via.placeholder.com/300x200?text=Social+Bot'], 'Marketing Tools', '2025-08-02 06:55:39.432431', '2025-08-02 06:55:39.432431', 'fixed', 8, NULL, NULL, NULL, NULL, 'approved', false, 3, NULL);

-- Reset sequences
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- =====================================================
-- END OF EXPORT
-- =====================================================