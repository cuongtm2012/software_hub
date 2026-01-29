# Hướng Dẫn Import Database vào Docker

Tài liệu này hướng dẫn cách import database dump vào PostgreSQL Docker container.

## Yêu Cầu

- Docker Desktop đã được cài đặt và đang chạy
- PostgreSQL container đang chạy (`softwarehub-postgres`)
- Database dumps trong thư mục `database/dumps/`

## Cách 1: Sử Dụng Script Tự Động (Khuyến Nghị)

### Bước 1: Chạy script import

```bash
./scripts/import-database.sh
```

Script sẽ:
1. Kiểm tra Docker container có đang chạy không
2. Tìm file dump mới nhất
3. Yêu cầu xác nhận trước khi xóa database hiện tại
4. Import database dump
5. Xác minh kết quả

### Bước 2: Xác nhận import

Script sẽ hiển thị số lượng bảng và dữ liệu đã import.

## Cách 2: Import Thủ Công

### Bước 1: Khởi động Docker containers

```bash
docker-compose up -d postgres
```

### Bước 2: Kiểm tra container đang chạy

```bash
docker ps --filter "name=softwarehub-postgres"
```

### Bước 3: Import Schema

```bash
docker exec -i softwarehub-postgres psql -U postgres -d softwarehub < database/dumps/schema_20260129_222356.sql
```

### Bước 4: Import Data

```bash
docker exec -i softwarehub-postgres psql -U postgres -d softwarehub < database/dumps/data_20260129_222356.sql
```

### Bước 5: Xác minh import

```bash
docker exec softwarehub-postgres psql -U postgres -d softwarehub -c "\dt"
```

Kiểm tra số lượng records:

```bash
docker exec softwarehub-postgres psql -U postgres -d softwarehub -c "
SELECT 'users' as table_name, COUNT(*) as count FROM users 
UNION ALL SELECT 'products', COUNT(*) FROM products 
UNION ALL SELECT 'categories', COUNT(*) FROM categories 
UNION ALL SELECT 'softwares', COUNT(*) FROM softwares 
UNION ALL SELECT 'courses', COUNT(*) FROM courses;"
```

## Cách 3: Import Full Dump (Alternative)

Nếu bạn muốn import toàn bộ database (schema + data) cùng lúc:

```bash
docker exec -i softwarehub-postgres psql -U postgres -d postgres < database/dumps/software_hub_dump_20260129_222356.sql
```

**Lưu ý**: Cách này có thể gặp lỗi nếu database đã tồn tại. Nên xóa database trước:

```bash
docker exec softwarehub-postgres psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS softwarehub;"
docker exec softwarehub-postgres psql -U postgres -d postgres -c "CREATE DATABASE softwarehub;"
```

## Cách 4: Import từ Custom Format Dump

Nếu bạn có file `.dump` (custom format):

```bash
docker exec -i softwarehub-postgres pg_restore -U postgres -d softwarehub -c < database/dumps/software_hub_dump_20260129_222356.dump
```

## Kết Quả Mong Đợi

Sau khi import thành công, bạn sẽ có:

- **27 bảng** trong database
- **Dữ liệu mẫu**:
  - 5 users (admin, seller, buyer)
  - 8 products
  - 270 categories
  - 2449 softwares
  - 294 courses
  - 16 orders

## Thông Tin Kết Nối

Sau khi import, bạn có thể kết nối đến database:

- **Host**: localhost
- **Port**: 5432
- **Database**: softwarehub
- **User**: postgres
- **Password**: password

### Kết nối qua psql

```bash
docker exec -it softwarehub-postgres psql -U postgres -d softwarehub
```

### Kết nối qua GUI Tool

Sử dụng các công cụ như:
- pgAdmin
- DBeaver
- TablePlus
- DataGrip

## Tài Khoản Test

Sau khi import, bạn có thể đăng nhập với các tài khoản:

1. **Admin**:
   - Email: `cuongeurovnn@gmail.com`
   - Role: admin

2. **Test Admin**:
   - Email: `test@admin.com`
   - Role: admin

3. **Seller**:
   - Email: `seller@test.com`
   - Role: seller

4. **Buyer**:
   - Email: `buyer@test.com`
   - Role: buyer

**Lưu ý**: Mật khẩu đã được hash trong database. Bạn cần reset password hoặc tạo user mới để đăng nhập.

## Xử Lý Lỗi

### Lỗi: "relation does not exist"

Nguyên nhân: Schema chưa được tạo
Giải pháp: Import schema trước, sau đó mới import data

```bash
docker exec -i softwarehub-postgres psql -U postgres -d softwarehub < database/dumps/schema_20260129_222356.sql
docker exec -i softwarehub-postgres psql -U postgres -d softwarehub < database/dumps/data_20260129_222356.sql
```

### Lỗi: "duplicate key value"

Nguyên nhân: Dữ liệu đã tồn tại
Giải pháp: Xóa database và tạo lại

```bash
docker exec softwarehub-postgres psql -U postgres -d postgres -c "DROP DATABASE softwarehub;"
docker exec softwarehub-postgres psql -U postgres -d postgres -c "CREATE DATABASE softwarehub;"
```

### Lỗi: "container not running"

Nguyên nhân: Docker container chưa được khởi động
Giải pháp:

```bash
docker-compose up -d postgres
```

## Export Database Mới

Để tạo dump mới từ database hiện tại:

```bash
./scripts/export-database.sh
```

Script sẽ tạo các file:
- `software_hub_dump_YYYYMMDD_HHMMSS.sql` - Full dump (SQL format)
- `software_hub_dump_YYYYMMDD_HHMMSS.dump` - Full dump (Custom format, compressed)
- `schema_YYYYMMDD_HHMMSS.sql` - Schema only
- `data_YYYYMMDD_HHMMSS.sql` - Data only
- `latest.sql` - Symlink to latest dump

## Tham Khảo

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)
- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [pg_restore Documentation](https://www.postgresql.org/docs/current/app-pgrestore.html)
