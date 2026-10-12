# Nhật ký sử dụng AI

Ghi một mục cho mỗi task có dùng AI. Cập nhật liên kết PR/commit sau khi thay đổi được lưu vào Git. Chỉ ghi những gì đã thực sự làm; không dán prompt chứa dữ liệu nhạy cảm.

## Mẫu ghi nhận

### [Ngày] — [Tên task]

- **Người thực hiện:** [Tên thành viên]
- **Công cụ:** [Ví dụ: ChatGPT, Codex; ghi phiên bản nếu biết]
- **Mục đích và phạm vi:** [AI hỗ trợ việc gì, ở phần nào của dự án]
- **Prompt chính:** [Tóm tắt yêu cầu đã đưa cho AI, đủ để hiểu AI được giao việc gì]
- **Đầu ra AI được sử dụng:** [Tài liệu, ý tưởng, test hoặc đường dẫn file/hàm/đoạn mã; ghi "không dùng mã AI sinh" nếu phù hợp]
- **Phần tự làm hoặc đã chỉnh sửa:** [Các quyết định nghiệp vụ, sửa mã, bổ sung kiểm thử... do thành viên thực hiện]
- **Cách kiểm chứng:** [Review, tài liệu chính thức đã đối chiếu, lệnh/test đã chạy và kết quả; kiểm tra giấy phép nguồn tham khảo nếu có]
- **Lỗi hoặc đề xuất sai của AI đã phát hiện:** [Mô tả lỗi, nguyên nhân và cách sửa; ghi "không phát hiện" nếu không có]
- **Minh chứng:** [Link PR, commit liên quan, commit sửa lỗi, issue hoặc tài liệu]

<!-- Sao chép mục trên cho task tiếp theo. Không ghi nhận lỗi/kiểm thử chưa xảy ra. -->

### 2026-10-12 — Thiết lập API client và TanStack Query

- **Người thực hiện:** Hải Dương
- **Công cụ:** Codex
- **Mục đích và phạm vi:** Tham khảo cấu trúc Axios và TanStack Query của Postline frontend để thiết lập hạ tầng gọi API dùng chung cho Rewear frontend.
- **Prompt chính:** Hỗ trợ cấu hình Axios và query.
- **Đầu ra AI được sử dụng:** Cấu hình Axios client, API request/error helpers, QueryClient, QueryProvider và tích hợp provider vào root layout.
- **Phần tự làm hoặc đã chỉnh sửa:** Cấu hình biến môi trường API có sẵn được giữ lại và tích hợp vào API client; phạm vi triển khai được giới hạn ở hạ tầng dùng chung.
- **Cách kiểm chứng:** Đã chạy `pnpm check`, `pnpm build` và `git diff --check`; tất cả đều thành công.
- **Lỗi hoặc đề xuất sai của AI đã phát hiện:** Không phát hiện.
- **Minh chứng:** Các thay đổi trong branch triển khai API client và TanStack Query; cập nhật liên kết PR/commit sau khi tạo.
