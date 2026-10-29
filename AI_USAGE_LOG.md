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

### 2026-10-13 — Review luồng xác thực trước PR

- **Người thực hiện:** Hải Dương
- **Công cụ:** Codex
- **Mục đích và phạm vi:** Review diff frontend trước PR, tập trung vào luồng đăng nhập, đăng ký, xác minh email, đặt lại mật khẩu, JWT session, refresh token và contract API với backend.
- **Prompt chính:** Review git diff hiện tại trước khi mở PR; đề xuất branch, commit, tiêu đề và mô tả PR theo template của repo.
- **Đầu ra AI được sử dụng:** Kết quả review và metadata PR đề xuất; không dùng mã AI sinh trong lần review này. Đối chiếu `src/modules/auth/services/auth.api.ts`, `auth.config.ts`, `src/proxy-policy.ts` và các form/hook xác thực với backend.
- **Phần tự làm hoặc đã chỉnh sửa:** Người thực hiện chấp nhận edge case logout khi nhiều request refresh dùng token cũ và chốt yêu cầu logout trước khi reset mật khẩu.
- **Cách kiểm chứng:** `pnpm check` và `pnpm build` đều pass; `git diff --check` pass tại thời điểm review. Tái hiện bằng script gọi mã nguồn với mock backend dùng refresh token một lần: lần refresh đầu thành công, request đến sau dùng token cũ thất bại. Kiểm tra policy xác nhận link reset mật khẩu và xác minh email bị redirect về trang chủ khi có session.
- **Lỗi hoặc đề xuất sai của AI đã phát hiện:** AI ban đầu đề xuất xem việc chặn reset mật khẩu khi còn đăng nhập là lỗi cần sửa; người thực hiện xác nhận đây là hành vi chủ đích, nên đã bỏ finding này. Rủi ro refresh token được chấp nhận và không coi là blocker cho PR.
- **Minh chứng:** Diff được review trên branch `feat/setup-api-query-client`; branch đề xuất `feat/auth-account-flows`, commit đề xuất `feat(auth): add account flows and JWT session integration`.

### 2026-10-27 — Dọn hạ tầng API cũ sau khi tích hợp Orval

- **Người thực hiện:** Hải Dương
- **Công cụ:** Codex
- **Mục đích và phạm vi:** Rà soát `src/shared/api` và dọn các thành phần của kiến trúc gọi API trước Orval.
- **Prompt chính:** Chấp thuận thực hiện bốn đề xuất: bỏ `api-request.ts`, bỏ barrel `api/index.ts`, thống nhất cách đọc lỗi và gom cấu hình HTTP dùng chung.
- **Đầu ra AI được sử dụng:** Xóa `src/shared/api/api-request.ts` và `src/shared/api/index.ts` sau khi kiểm tra không còn nơi sử dụng; thêm `axios-config.ts` để chia sẻ base URL, JSON headers và timeout; cập nhật `axios-client.ts` và `orval-request.ts` dùng cấu hình chung. Nhánh auth dùng `getApiErrorMessage()` để đọc message giống các request khác và vẫn giữ error code trong `Error.cause` cho Auth.js. Bảng `authResponses` và validation response auth được giữ lại.
- **Phần tự làm hoặc đã chỉnh sửa:** Người thực hiện xác nhận các lớp cần bỏ thuộc kiến trúc cũ trước Orval và chốt phạm vi thực hiện ở các mục 1–4; mục cân nhắc bảng `authResponses` chưa được chấp thuận thay đổi.
- **Cách kiểm chứng:** `pnpm check` pass (TypeScript và ESLint); `pnpm test` pass với một test schema auth; `git diff --check` pass. `pnpm build` ban đầu dừng ở cảnh báo bảo mật của Next.js 16.4.0, chạy lại thành công nhưng cảnh báo vẫn còn. Chưa kiểm tra đăng nhập với backend thật, Google OAuth, email delivery hoặc E2E dùng database seed; test hiện có không xác minh transport bằng request thật.
- **Lỗi hoặc đề xuất sai của AI đã phát hiện:** Chưa phát hiện lỗi trong phần cleanup này qua các kiểm tra đã chạy; kiểm chứng runtime với backend thật vẫn chưa thực hiện.
- **Minh chứng:** [PR #3](https://github.com/buihaiduongdev/rewear-fe/pull/3), commit [c0ac958](https://github.com/buihaiduongdev/rewear-fe/commit/c0ac958) trên branch `refactor/auth-orval-cleanup`.

### 2026-10-27 — Triển khai trang Home từ Figma

- **Người thực hiện:** Hải Dương
- **Công cụ:** Codex, Figwright MCP
- **Mục đích và phạm vi:** Triển khai Home desktop/mobile theo thiết kế Re.wear, ưu tiên trang chủ và dùng API backend thật.
- **Prompt chính:** Làm trang chủ trước; kết nối Figwright sau khi cập nhật plugin và triển khai thiết kế.
- **Đầu ra AI được sử dụng:** Module `src/features/home`, header/footer, hero, danh sách sản phẩm và cửa hàng, tìm kiếm/lọc qua URL, phân trang, xem nhanh sản phẩm, trạng thái tải/rỗng/lỗi; sử dụng Orval hooks và model types có sẵn. Ảnh editorial và wordmark được xuất từ Figma. Cho phép khách truy cập `/`, giữ policy bảo vệ các route khác. Không thêm mock API hoặc dữ liệu sản phẩm giả.
- **Phần tự làm hoặc đã chỉnh sửa:** Phạm vi được người thực hiện chốt ở Home. Orders, Cart, Messages và công cụ đăng bán chưa triển khai nên các nút tương ứng được vô hiệu hóa; khách có thể đến đăng ký từ CTA bán hàng. Chưa triển khai luồng mua hàng hoặc trang chi tiết sản phẩm đầy đủ.
- **Cách kiểm chứng:** `pnpm check`, `pnpm test` (2 file, 4 test), `pnpm build` và `git diff --check` pass. Kiểm tra Chrome ở 1280px và 390px: không tràn ngang, không có JavaScript exception, API products trả 200 và trạng thái rỗng hiển thị đúng. Backend chưa có sản phẩm/cửa hàng, nên chưa kiểm chứng thẻ sản phẩm, ảnh media và modal bằng dữ liệu thật; chưa chạy E2E với database seed. Tìm kiếm cập nhật URL, xóa filter và focus ô tìm kiếm mobile đã được kiểm tra trên bản production; trong lượt này backend port 5001 đã ngừng lắng nghe nên chưa xác minh kết quả tìm kiếm bằng API production.
- **Lỗi hoặc đề xuất sai của AI đã phát hiện:** Khối theme mới ban đầu chưa sinh utility màu trong dev; sau khi gom vào `@theme inline`, màu đã hiển thị đúng. Đã bỏ chiều cao tối thiểu thừa ở danh sách rỗng. Next.js vẫn cảnh báo phiên bản hiện tại có lỗ hổng bảo mật; chưa nâng cấp dependency trong phạm vi này.
- **Minh chứng:** Branch `feat/homepage`; Figma Home desktop `1:4134`, mobile `48:2525`. Chưa tạo PR.

### 2026-10-28 — Đồng bộ Home với product contract và kiểm tra bằng seed thật

- **Người thực hiện:** Hải Dương
- **Công cụ:** Codex, Orval, Cypress, Chrome DevTools Protocol
- **Prompt chính:** Tiếp tục Home FE; phối hợp trực tiếp với agent cart BE, giữ phạm vi source ở `rewear-fe`; sau đó tạo PR Home theo yêu cầu “ok lên 2 PR đi”.
- **Đầu ra AI được sử dụng:** Lưu OpenAPI đầy đủ từ backend product PR #18 và regenerate Axios functions, React Query hooks, model types, Zod schemas. Home dùng `coverUrl` từ danh sách sản phẩm cho thẻ, ảnh shop và xem nhanh, bỏ request media riêng từng thẻ; xử lý title/condition/price nullable. Xem nhanh dùng `Dialog.Trigger`/handle của Base UI. Đưa DM Sans lên layout chung để font trong portal đúng với trang; sửa font token tự tham chiếu và metadata mặc định. Tìm kiếm dùng được trên cả mobile/tablet. Thêm E2E dùng API thật, tsconfig Cypress riêng và hướng dẫn tại `docs/home-testing.md`.
- **Kiểm chứng:** `pnpm check`, `pnpm test` (2 file, 4 test), `pnpm test:e2e:typecheck`, `pnpm build`, Prettier và `git diff --check` pass. Cypress Chrome 143: 4/4 E2E pass với API Nest thật và PostgreSQL `rewear_home_test` riêng, gồm mở/đóng xem nhanh bằng chuột/Escape, không có request media từng thẻ, search/empty/clear/reload URL, category/shop filters, pagination và mobile/tablet search. Kiểm tra Chrome ở 1280/768/390px: không tràn ngang, ảnh sản phẩm hiển thị; inspector không có FAIL. Native Chrome input xác nhận trả focus về thẻ sau đóng bằng chuột/keyboard, font popup DM Sans, mobile popup không tràn ngang và không có JS exception.
- **Điều chỉnh khi kiểm tra:** Assertion focus bên trong Cypress iframe không khớp với input thật của Chrome. E2E giữ kiểm tra mở/đóng và các luồng catalog; focus được xác minh riêng bằng native Chrome, không dùng assertion iframe làm bằng chứng. Font popup ban đầu rơi về Times New Roman do font chỉ đặt ở wrapper Home và token sans tự tham chiếu; đã sửa ở layout/font token chung.
- **Giới hạn:** Chưa triển khai Cart/Orders/Messages, công cụ seller hoặc trang product detail đầy đủ. Chưa chạy luồng đăng nhập/đăng ký, upload R2, checkout/payment trong E2E Home. Backend QA chạy từ build của worktree product PR #18, dùng DB local riêng và cấu hình SSL false chỉ trong bootstrap tạm; không sửa source BE hoặc DB của agent cart. Next.js 16.4.0 vẫn phát cảnh báo bảo mật; build chạy lại thành công theo hướng dẫn CLI, chưa nâng dependency.
- **Minh chứng:** [PR #4](https://github.com/buihaiduongdev/rewear-fe/pull/4), branch `feat/homepage`, commit code [657e14f](https://github.com/buihaiduongdev/rewear-fe/commit/657e14f); base `refactor/auth-orval-cleanup` do FE PR #3 chưa merge. PR phụ thuộc product contract của BE #18; chưa merge. Runtime QA: frontend `http://localhost:5000`, API `http://localhost:5001/api`, PostgreSQL riêng port 55440. Không thêm mock API, dữ liệu giả ở FE hoặc dependency mới.

### 2026-10-29 — Cart frontend

- **Phạm vi:** Nối API giỏ hàng qua Orval, thêm sản phẩm từ quick view, xem giỏ theo người bán, xử lý trạng thái không khả dụng và xóa sản phẩm. Checkout chưa triển khai.
- **Kiểm chứng:** TypeScript, ESLint, unit tests và production build; Cypress Chrome đăng nhập bằng tài khoản seed rồi thêm, xem và xóa sản phẩm qua backend và PostgreSQL riêng.
- **Giới hạn:** Chưa đối chiếu màn Cart với Figma trong phiên này; chưa kiểm thử checkout hoặc thanh toán. Next.js cảnh báo phiên bản hiện tại có lỗ hổng và đề nghị nâng cấp.

### 2026-10-29 — Checkout reservation UI

- **Yêu cầu:** Nối BE/FE checkout, viết test và kiểm tra trực tiếp trên Chrome.
- **Đầu ra:** Chọn món và địa chỉ đã lưu, bắt đầu giữ hàng, URL khôi phục lượt checkout, đồng hồ đếm ngược, hiển thị snapshot theo người bán và xác nhận hủy. Sinh Axios/React Query/Zod bằng Orval từ OpenAPI backend. Khóa lựa chọn khi đang gửi; lưu request ID cho retry mất phản hồi.
- **Kiểm chứng:** TypeScript, ESLint và build đạt; Cypress Chrome với BE/PostgreSQL thật kiểm tra giữ hàng, tải lại deadline, hủy và giữ lại bằng checkout ID mới. Chrome MCP kiểm tra trực tiếp trạng thái HELD, deadline không đổi sau reload và CANCELLED sau hủy.
- **Giới hạn:** Chỉ chọn địa chỉ hiện có; chưa có màn tạo địa chỉ, quote shipping hoặc payment. Màn hình dùng cấu trúc/tokens của Figma checkout nhưng không giả lập giá ship hay cổng thanh toán. Next.js phiên bản hiện tại có cảnh báo bảo mật; cần nâng cấp riêng.
