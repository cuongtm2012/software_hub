# Database Export Guide

## Tổng quan

Script `export-database.sh` được tạo để export toàn bộ database PostgreSQL ra folder `/database` với nhiều định dạng khác nhau.

## Tính năng

✅ **Tự động phát hiện môi trường**
- Tự động phát hiện PostgreSQL chạy trong Docker container hoặc local
- Hỗ trợ nhiều tên container khác nhau (`software-hub-db`, `softwarehub-postgres`, `postgres`)

✅ **Xóa dữ liệu cũ**
- Tự động xóa các file dump cũ trong folder `/database/dumps`
- Giữ lại các file quan trọng như `schema.prisma`, `migrations/`, `init/`

✅ **Nhiều định dạng export**
1. **Full dump (SQL)** - File `.sql` đầy đủ, có thể restore bằng `psql`
2. **Full dump (Custom)** - File `.dump` nén, có thể restore bằng `pg_restore`
3. **Schema only** - Chỉ cấu trúc bảng, không có dữ liệu
4. **Data only** - Chỉ dữ liệu, không có cấu trúc

✅ **Symlink latest**
- Tạo symlink `latest.sql` trỏ đến file dump mới nhất

## Cách sử dụng

### Phương pháp 1: Sử dụng Makefile (Khuyến nghị)

```bash
make db-export
```

### Phương pháp 2: Chạy script trực tiếp

```bash
./scripts/export-database.sh
```

### Phương pháp 3: Tự động hóa với Cron

Thêm vào crontab để export tự động:

```bash
# Export database mỗi ngày lúc 2 giờ sáng
0 2 * * * cd /path/to/software_hub && ./scripts/export-database.sh >> logs/db-export.log 2>&1
```

## Cấu trúc thư mục sau khi export

```
database/
├── dumps/
│   ├── latest.sql                              # Symlink → dump mới nhất
│   ├── software_hub_dump_20260129_222356.sql   # Full dump (951K)
│   ├── software_hub_dump_20260129_222356.dump  # Full dump compressed (299K)
│   ├── schema_20260129_222356.sql              # Schema only (61K)
│   └── data_20260129_222356.sql                # Data only (1.6M)
├── backups/                                     # Backup files
├── migrations/                                  # Database migrations
├── init/                                        # Init scripts
├── scripts/                                     # Database scripts
├── schema.prisma                                # Prisma schema
└── README.md                                    # Documentation
```

## Restore Database

### Restore từ SQL dump (Full)

```bash
# Từ Docker container
docker exec -i softwarehub-postgres psql -U postgres -d postgres < database/dumps/latest.sql

# Từ local PostgreSQL
psql -h localhost -U postgres -d postgres < database/dumps/latest.sql
```

### Restore từ Custom dump (Compressed)

```bash
# Từ Docker container
docker exec -i softwarehub-postgres pg_restore -U postgres -d softwarehub -c < database/dumps/software_hub_dump_*.dump

# Từ local PostgreSQL
pg_restore -h localhost -U postgres -d softwarehub -c database/dumps/software_hub_dump_*.dump
```

### Restore chỉ Schema

```bash
psql -h localhost -U postgres -d softwarehub < database/dumps/schema_*.sql
```

### Restore chỉ Data

```bash
psql -h localhost -U postgres -d softwarehub < database/dumps/data_*.sql
```

## Yêu cầu

- PostgreSQL client tools (`pg_dump`, `pg_restore`, `psql`)
- Docker (nếu database chạy trong container)
- Quyền truy cập database

## Xử lý lỗi

### Lỗi: "PostgreSQL is not running or not accessible"

**Nguyên nhân:** PostgreSQL không chạy hoặc không thể kết nối

**Giải pháp:**
1. Kiểm tra PostgreSQL đang chạy: `docker ps` hoặc `pg_isready`
2. Kiểm tra thông tin kết nối trong file `.env`
3. Đảm bảo port 5432 không bị chặn

### Lỗi: "server version mismatch"

**Nguyên nhân:** Version của `pg_dump` khác với PostgreSQL server

**Giải pháp:**
- Script tự động sử dụng Docker exec nếu phát hiện container
- Nếu vẫn lỗi, cập nhật PostgreSQL client tools

### Lỗi: "Permission denied"

**Nguyên nhân:** Không có quyền ghi vào folder `/database`

**Giải pháp:**
```bash
chmod +x scripts/export-database.sh
chmod -R 755 database/
```

## Best Practices

1. **Export định kỳ**: Thiết lập cron job để export tự động hàng ngày
2. **Backup off-site**: Copy các file dump ra ngoài server (S3, Google Drive, etc.)
3. **Kiểm tra dump**: Thỉnh thoảng test restore để đảm bảo dump hoạt động
4. **Quản lý dung lượng**: Xóa các dump cũ để tiết kiệm không gian
5. **Bảo mật**: Đảm bảo file dump được mã hóa nếu chứa dữ liệu nhạy cảm

## Ví dụ Output

```
=== Database Export Script ===
Project Root: /Users/jack/Desktop/1.PROJECT/software_hub
Database Directory: /Users/jack/Desktop/1.PROJECT/software_hub/database

Loading .env...
✓ Detected PostgreSQL running in Docker container: softwarehub-postgres
Database: softwarehub
User: postgres
Host: localhost:5432

Step 1: Cleaning old data in /database folder...
Removing old files...
✓ Old data cleaned

Step 2: Creating directory structure...
✓ Directories created

Step 3: Exporting database dump...
Using Docker container: softwarehub-postgres
Exporting SQL dump...
✓ SQL dump exported successfully
✓ Latest dump symlink created

Exporting custom format dump (compressed)...
✓ Custom format dump exported successfully

Exporting schema only...
✓ Schema dump exported successfully

Exporting data only...
✓ Data dump exported successfully

Step 4: Creating README...
✓ README created

=== Export Complete ===

Summary:
  Database: softwarehub
  Timestamp: 20260129_222356

Files created:
  - data_20260129_222356.sql (1.6M)
  - latest.sql (37B)
  - schema_20260129_222356.sql (61K)
  - software_hub_dump_20260129_222356.dump (299K)
  - software_hub_dump_20260129_222356.sql (951K)

✓ All dumps exported successfully!
```

## Liên hệ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs trong `/tmp/export-db.log`
2. Kiểm tra file `.env` có đầy đủ thông tin
3. Đảm bảo PostgreSQL đang chạy và accessible
