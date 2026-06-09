-- Legacy DB cart (replaced by client localStorage via useCart hook)
-- Run once on environments that still have cart_items table.

DROP TABLE IF EXISTS cart_items CASCADE;
