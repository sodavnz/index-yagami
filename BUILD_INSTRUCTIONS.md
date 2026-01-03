# 🚀 Hướng dẫn Build và Deploy cho Nhiều Chi nhánh

## 📋 Chuẩn bị

### 1. Thêm Chi nhánh trong Admin Dashboard

1. Đăng nhập Admin: `https://yagami.online/rachsoi/admin/login`
2. Vào tab **"Chi nhánh"**
3. Thêm chi nhánh mới:
   - **Tên:** YAGAMI Cái Tắc
   - **Slug:** `caitac` (quan trọng!)
   - **Địa chỉ:** Địa chỉ chi nhánh
   - **Số điện thoại:** 0123456789

### 2. Thiết lập Dữ liệu cho Chi nhánh Mới

Sau khi tạo chi nhánh, bạn cần thêm dữ liệu cho chi nhánh đó:

1. **Site Settings** - Cài đặt website
2. **Navigation Links** - Menu điều hướng
3. **Social Links** - Liên kết mạng xã hội
4. **Contact Info** - Thông tin liên hệ
5. **Menu Images** - Hình ảnh menu
6. **Space Images** - Hình ảnh không gian

---

## 🔨 Build cho Từng Chi nhánh

### Chi nhánh Rạch Sỏi

```bash
cd D:\rachsoi\web

# Set base path
set BASE_PATH=/rachsoi/

# Build
npm run build

# Kết quả: thư mục out/
```

### Chi nhánh Cái Tắc

```bash
cd D:\rachsoi\web

# Set base path
set BASE_PATH=/caitac/

# Build
npm run build

# Kết quả: thư mục out/
```

---

## 📤 Upload lên Hosting

### Cấu trúc thư mục trên hosting:

```
public_html/
├── rachsoi/          # Chi nhánh Rạch Sỏi
│   ├── index.html
│   ├── assets/
│   └── ...
├── caitac/           # Chi nhánh Cái Tắc
│   ├── index.html
│   ├── assets/
│   └── ...
└── .htaccess         # File cấu hình chung
```

### Các bước upload:

#### 1. Upload Chi nhánh Rạch Sỏi

1. Build với `BASE_PATH=/rachsoi/`
2. Vào cPanel → File Manager
3. Vào `public_html/rachsoi/`
4. Xóa toàn bộ file cũ
5. Upload toàn bộ từ `D:\rachsoi\web\out/`

#### 2. Upload Chi nhánh Cái Tắc

1. Build với `BASE_PATH=/caitac/`
2. Vào cPanel → File Manager
3. Tạo thư mục `public_html/caitac/`
4. Upload toàn bộ từ `D:\rachsoi\web\out/`

#### 3. Cấu hình .htaccess

Tạo file `.htaccess` trong `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Redirect to HTTPS (optional)
  # RewriteCond %{HTTPS} off
  # RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # Handle React Router for rachsoi
  RewriteCond %{REQUEST_URI} ^/rachsoi/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /rachsoi/index.html [L]
  
  # Handle React Router for caitac
  RewriteCond %{REQUEST_URI} ^/caitac/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /caitac/index.html [L]
</IfModule>

# Protect .env file
<Files ".env">
  Order allow,deny
  Deny from all
</Files>

# Enable CORS
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>
```

---

## ✅ Kiểm tra

### 1. Truy cập các URL:

- **Rạch Sỏi:** `https://yagami.online/rachsoi/`
- **Cái Tắc:** `https://yagami.online/caitac/`

### 2. Kiểm tra dữ liệu:

- Mỗi chi nhánh hiển thị dữ liệu riêng
- Navigation links khác nhau
- Hình ảnh khác nhau
- Thông tin liên hệ khác nhau

### 3. Kiểm tra Console (F12):

- Không có lỗi 404
- Không có lỗi CORS
- Dữ liệu load thành công

---

## 🔄 Khi Thêm Chi nhánh Mới

### Ví dụ: Thêm chi nhánh "Hà Tiên"

1. **Thêm trong Admin Dashboard:**
   - Slug: `hatien`
   - Thêm đầy đủ dữ liệu

2. **Build:**
   ```bash
   set BASE_PATH=/hatien/
   npm run build
   ```

3. **Upload:**
   - Tạo thư mục `public_html/hatien/`
   - Upload từ `out/`

4. **Cập nhật .htaccess:**
   ```apache
   # Handle React Router for hatien
   RewriteCond %{REQUEST_URI} ^/hatien/
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /hatien/index.html [L]
   ```

5. **Truy cập:**
   - `https://yagami.online/hatien/`

---

## 📝 Lưu ý Quan trọng

1. **Slug phải khớp với BASE_PATH:**
   - Slug trong database: `rachsoi`
   - BASE_PATH khi build: `/rachsoi/`
   - Thư mục upload: `public_html/rachsoi/`

2. **Mỗi lần build chỉ cho 1 chi nhánh:**
   - Không thể build 1 lần cho tất cả chi nhánh
   - Phải build riêng từng chi nhánh

3. **Dữ liệu độc lập:**
   - Mỗi chi nhánh có dữ liệu riêng trong Supabase
   - Không ảnh hưởng lẫn nhau

4. **Admin Dashboard:**
   - Có thể truy cập từ bất kỳ chi nhánh nào
   - Ví dụ: `/rachsoi/admin/login` hoặc `/caitac/admin/login`

---

## 🆘 Troubleshooting

### Lỗi: "Không tìm thấy chi nhánh"

**Nguyên nhân:** Slug trong database không khớp với URL

**Giải pháp:**
1. Kiểm tra slug trong Admin Dashboard
2. Đảm bảo slug khớp với đường dẫn URL

### Lỗi: 404 Not Found

**Nguyên nhân:** .htaccess chưa cấu hình đúng

**Giải pháp:**
1. Kiểm tra file .htaccess trong `public_html/`
2. Đảm bảo có RewriteRule cho chi nhánh đó

### Lỗi: Hiển thị dữ liệu sai chi nhánh

**Nguyên nhân:** Cache trình duyệt

**Giải pháp:**
1. Xóa cache (Ctrl + Shift + Delete)
2. Hard reload (Ctrl + F5)

---

## 🎉 Hoàn tất!

Bây giờ bạn có thể:
- ✅ Tạo nhiều chi nhánh
- ✅ Mỗi chi nhánh có URL riêng
- ✅ Mỗi chi nhánh có dữ liệu riêng
- ✅ Quản lý tập trung trong Admin Dashboard
