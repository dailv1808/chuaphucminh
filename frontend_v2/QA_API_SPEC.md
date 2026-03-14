# QA API spec (đề xuất) – server-side pagination, filter, sort, export

Tài liệu này mô tả **đề xuất** để tối ưu trang admin `qa.html` bằng cách chuyển phần lớn filter/search/sort/pagination sang backend, giảm tải dữ liệu và giảm xử lý nặng phía client.

## 1) List questions

### Endpoint
- `GET /api/questions/`

### Query params
- **pagination**
  - `page` (int, default: 1)
  - `page_size` (int, default: 20–50; max: 200)
- **search**
  - `search` (string): tìm theo `name`, `display_name`, `content`, `edited_content`, `short_content`, `answer`, `group`, `tags`, `contact`
  - Khuyến nghị backend chuẩn hóa (lowercase + bỏ dấu) để search tiếng Việt tốt hơn.
- **filters**
  - `status` (one of: `answered|pending|archive|reject|review`)
  - `priority` (one of: `high|medium|low`)
  - `slideshow` (bool: `true|false`)
  - `is_faq` (bool: `true|false`)
  - `group` (string)
  - `tags` (string; hoặc tách thành `tags__contains`, tùy backend)
  - `updated_by` (id)
  - `created_by` (id)
- **sorting**
  - `ordering` (string):
    - `updated_at`, `-updated_at`
    - `created_at`, `-created_at`
    - `priority`, `-priority` (nếu có mapping)

### Response (khuyến nghị)
```json
{
  "results": [
    {
      "id": 123,
      "name": "abc",
      "display_name": "abc (bản sao 1)",
      "content": "...",
      "edited_content": "...",
      "short_content": "...",
      "contact": "...",
      "answer": "...",
      "answered_at": "2026-03-14T10:00:00Z",
      "status": "pending",
      "priority": "medium",
      "slideshow": false,
      "is_faq": false,
      "group": "A",
      "tags": "x,y",
      "created_at": "2026-03-14T10:00:00Z",
      "updated_at": "2026-03-14T10:00:00Z",
      "created_by": {"id": 1, "username": "u", "full_name": "User"},
      "updated_by": {"id": 1, "username": "u", "full_name": "User"}
    }
  ],
  "count": 1234,
  "page": 1,
  "page_size": 50
}
```

## 2) Export (CSV/Excel)

### Endpoint
- `GET /api/questions/export/`

### Query params
- Nhận **y hệt** các params như list (`search`, `status`, `priority`, `slideshow`, `is_faq`, `group`, `tags`, `ordering`).

### Response
- Trả file download:
  - CSV: `Content-Type: text/csv; charset=utf-8`
  - hoặc Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

## 3) Bulk delete

### Endpoint
- `DELETE /api/questions/bulk/`

### Body
```json
{ "ids": [1,2,3] }
```

### Response
```json
{ "deleted": [1,2,3] }
```

## 4) Notes triển khai (backend)
- **Indexing**: tạo index cho `status`, `priority`, `created_at`, `updated_at`.
- **Search**: cân nhắc full-text search (Postgres `GIN` + `to_tsvector`) hoặc dùng trigram (`pg_trgm`) nếu search substring nhiều.
- **Performance**: backend nên giới hạn `page_size` tối đa để tránh trả dữ liệu quá lớn.

