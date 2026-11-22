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

### 2026-10-29 — Delivery address during checkout

- **Yêu cầu:** Tiếp tục vòng triển khai, kiểm thử Chrome và PR/review.
- **Đầu ra:** Dialog thêm địa chỉ dùng API và Zod sinh từ OpenAPI; chọn tỉnh/phường thật, reset phường khi đổi tỉnh, validate và focus trường lỗi, chọn ngay địa chỉ mới từ cache theo tài khoản. Tái sử dụng BaseInputField và token sẵn có; bố cục tham chiếu frame Figma 48:646.
- **Kiểm chứng:** E2E Chrome gọi backend/PostgreSQL thật, kiểm tra trường bắt buộc/điện thoại, đổi tỉnh, lưu mặc định, tự chọn địa chỉ mới, snapshot checkout và hủy. Đã mở dialog trên Chrome MCP để kiểm tra bố cục.
- **Giới hạn:** Chỉ địa chỉ Việt Nam; sửa/xóa địa chỉ và màn address book chưa nằm trong PR này. Không sửa contract backend hoặc client sinh tự động.

### 2026-10-30 — Seller khai báo thông số đóng gói

- **Yêu cầu và quyết định:** Seller được chọn khoảng hoặc tự nhập khối lượng/kích thước. Người thực hiện yêu cầu dùng agent-browser MCP để test thay Chrome DevTools; chưa xác nhận tự đọc toàn bộ diff.
- **Phần AI hỗ trợ:** Form tại /selling/packages, chọn tin thuộc seller, API/Zod sinh qua Orval, preview upper bounds/làm tròn cm, trạng thái lưu/gửi duyệt và khóa tin HELD/SOLD/SUSPENDED. Dùng chung component/logic với CSS responsive.
- **Thiết kế:** Figwright đọc editor 48:985 và Field 41:30, kiểm tra screenshot Field. Tái sử dụng token/header/input; chưa có frame Figma riêng cho page package, không coi là khớp toàn màn seller editor.
- **Kiểm chứng:** Agent-browser MCP dùng login seed thật, lưu khoảng/custom, reload, gửi duyệt, khóa tin đã bán và screenshot desktop/mobile. Viewport 390×912 được đặt qua CLI agent-browser cùng session vì MCP core chưa có viewport tool; đo kích thước và thao tác qua MCP. Cypress luồng package với BE/PostgreSQL thật qua, gồm invalid input không gọi save, persistence, DRAFT/PENDING_REVIEW và không tràn ngang.
- **Giới hạn:** Chưa có quote vận chuyển hoặc gộp kiện; đây là tiện ích package, chưa phải seller editor hoàn chỉnh. Branch gồm dependency checkout-addresses và merge fix/next-security để chạy Next 16.4.1.
- **Kiểm tra mã:** TypeScript ứng dụng/Cypress, ESLint, 4 unit tests và production build Next 16.4.1 qua. Không chỉnh tay các file API sinh tự động.

### 2026-10-30 — Địa chỉ lấy hàng cá nhân và shop

- **Yêu cầu:** Phát triển, test và review pickup address. Người thực hiện chốt tiếp tục dùng agent-browser headless; chưa xác nhận đã tự đọc toàn bộ diff.
- **AI hỗ trợ:** Form /selling/pickup, scope cá nhân/shop owner, directory tỉnh/phường thật, validate/focus lỗi, cache theo user/source và khóa khi lưu. Sinh API/React Query/Zod qua Orval; liên kết từ account và package workspace.
- **Thiết kế:** Figwright đọc đầy đủ frame 63:2315, screenshot, component/token map và motion inventory. Tái sử dụng BaseInputField/Button; form 720px và nút 360×52 trên desktop. Selector nguồn bán bổ sung và geometry shared field được ghi rõ, không nhận là pixel-identical toàn frame.
- **Kiểm chứng:** Typecheck ứng dụng/Cypress, ESLint và 4 unit tests qua. Cypress 2 ca gọi BE/PostgreSQL/JWT thật: validate không lưu, reset ward, personal save/edit/reload, shop riêng và không lộ contact qua public shop. Agent-browser MCP kiểm tra lưu/reload và screenshot 1280px/390px, không tràn ngang. Viewport đặt qua CLI cùng session vì MCP core chưa có tool tương ứng.
- **Giới hạn:** Chỉ cấu hình địa chỉ; chưa carrier registration, availability, quote hoặc shipment. Không dùng Chrome DevTools MCP. Thử headed bị thiếu DISPLAY trong môi trường MCP; quay lại headless theo yêu cầu, không đổi cấu hình MCP toàn cục.
- **Production:** Build Next 16.4.1 qua; agent-browser mở bản production và sửa/lưu địa chỉ thành công.
- **Tự review:** Tách cache key personal và shop kể cả khi shop hook bị tắt/chưa chọn shop, tránh hai queryFn khác nhau cùng key. Production build lại qua; 2 E2E chạy lại trên bản production đều qua cho thay đổi này.

### 2026-10-31 — Sandbox shipping estimate

- **Yêu cầu/quyết định:** Hoàn tất BE/FE, test, tự review và mở PR. Một seller/shop là một kiện, một phí; test bằng agent-browser MCP headless. Người thực hiện chưa xác nhận đọc toàn bộ diff.
- **AI hỗ trợ:** Sinh OpenAPI/Axios/React Query/Zod bằng Orval; UI phí/kiện/tổng theo nguồn bán, refresh, TTL, partial/unavailable/invalidated và giữ payment disabled. Tham chiếu Figma checkout 53:2098 và summary 53:2127, dùng shared component/token; không nhận toàn frame là pixel-identical.
- **Kiểm chứng:** 5 unit tests, TypeScript ứng dụng/Cypress, ESLint phần thay đổi và production build Next 16.4.1 qua. Test đồng hồ quan sát RED (150 thay vì 120 giây sau quote đến muộn), sửa và GREEN. Cypress bản production cuối gọi JWT/API/PostgreSQL thật + GHN sandbox qua: hai món một kiện 800g/30×20×25cm, phí 20.900đ và tổng bằng subtotal + fee, reload, 390px, hết hạn/hủy ẩn tổng cũ. Các intercept chỉ quan sát, không stub API. Agent-browser MCP kiểm tra bản cuối desktop 1280 và mobile 390, screenshot, reload giữ quote; đồng hồ bắt đầu 119 giây, không tràn ngang. Viewport đặt qua CLI cùng session vì MCP core thiếu viewport tool.
- **Giới hạn:** Sandbox preview; chưa production carrier/booking/payment. DB QA local riêng cổng 55441, API 5014/UI 5015; không chạy fixture vào DB dev dùng chung. Cypress sửa thời điểm gắn fake clock sau fixture để tránh đóng băng mốc trước lúc quote được tạo.

### 2026-11-19 — Trang chi tiết sản phẩm, skeletons chống layout shift và tinh gọn proxy

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash).
- **Mục đích và phạm vi:** Triển khai trang chi tiết sản phẩm đầy đủ (/products/[id]), thay thế các placeholder text loading đơn điệu bằng các skeleton component chuyên biệt theo từng feature để chống giật layout (CLS), tinh chỉnh hệ thống Toast notification và mở quyền truy cập công khai (public access) cho khách vãng lai duyệt sản phẩm.
- **Prompt chính:** Làm trang chi tiết sản phẩm, thay thế toàn bộ text loading bằng skeleton trong folder skeletons/ riêng biệt, tinh chỉnh toast, cấu hình gitignore cho graphify, và sửa proxy-policy cho phép khách truy cập /products và /products/[id].
- **Phần AI hỗ trợ:** Triển khai dynamic route `src/app/products/[id]/page.tsx` và component `ProductDetailPage` kết nối API `useProductControllerFindOne` + `useMediaControllerFindAll`, cấu trúc gallery ảnh, thuộc tính chi tiết, tích hợp `AddToCartAction`; tạo `ProductDetailSkeleton`, `CheckoutSkeleton`, `CatalogSkeleton`, `CartSkeleton`; tinh chỉnh style `toast.tsx` và `toast.store.ts`; sửa logic `isPublicMarketplaceRoute` trong `proxy-policy.ts` và viết unit test.
- **Phần tự làm hoặc đã chỉnh sửa:** Định hướng trải nghiệm responsive mobile/desktop, phân tách thư mục skeletons ngang cấp components, xác nhận quy tắc giỏ hàng và nghiệm thu toàn bộ chất lượng mã nguồn.
- **Cách kiểm chứng:** Chạy `pnpm lint` (0 lỗi, 0 cảnh báo), `pnpm test` (3/3 suites, 5 tests pass 100%), `pnpm build` (compile và static prerender 14 routes thành công), Vercel CI/CD preview deployment ready.
- **Lỗi hoặc đề xuất sai của AI đã phát hiện:** Đề xuất ban đầu gom skeletons trực tiếp trong components/ gây loãng danh sách component; đã điều chỉnh tách ra thư mục `skeletons/` độc lập theo yêu cầu.
- **Minh chứng:** Nhánh `feat/product-detail-page`, PR #12 (rewear-fe).

### 2026-11-19 — Nâng cấp bảo mật Next.js 16.4.1 lên 16.4.6 theo khuyến cáo an ninh

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash), Next.js CLI (`next upgrade --agent=security`).
- **Mục đích và phạm vi:** Thực hiện cập nhật bảo mật cùng phiên bản chính (same-major security upgrade) từ Next.js `16.4.1` lên `16.4.6` nhằm vá các lỗ hổng bảo mật được công bố theo security advisory chính thức của Next.js; đồng thời cập nhật `eslint-config-next` đồng bộ và cấu hình `experimental.agentUpgrade = 'security'`.
- **Prompt chính:** Khởi chạy `next upgrade --agent=security`, rà soát các kiểm tra trùng lặp trên GitHub PR/nhánh, cập nhật Next.js lên phiên bản đích 16.4.6 trong worktree độc lập, bật cờ cấu hình experimental tương ứng và thực hiện đầy đủ quy trình kiểm chứng.
- **Phần AI hỗ trợ:** Quét và kiểm tra trùng lặp PR/nhánh, cập nhật `next` và `eslint-config-next` lên `16.4.6`, bổ sung `agentUpgrade: 'security'` vào `experimental` trong `next.config.ts`, chạy telemetry báo cáo kết quả `success` và thực hiện kiểm thử tự động.
- **Phần tự làm hoặc đã chỉnh sửa:** Thiết lập worktree độc lập `fix/security-upgrade-next-16.4.6`, đồng bộ biến môi trường `.env` cho tiến trình build static pages, rà soát typecheck và chạy toàn bộ bộ kiểm thử.
- **Cách kiểm chứng:** Chạy `next --version` xác nhận `16.4.6`, `pnpm check` (tsc + eslint) 0 lỗi, `pnpm test` pass 3/3 test suites (5 tests), `pnpm build` biên dịch và prerender thành công 14/14 static pages qua Turbopack.
- **Lỗi hoặc đề xuất sai của AI đã phát hiện:** Không phát hiện.
- **Minh chứng:** Nhánh `fix/security-upgrade-next-16.4.6`.

### 2026-11-19 — Tái cấu trúc tách module Address và Shop dùng chung chống lặp mã (DRY)

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash).
- **Mục đích và phạm vi:** Chuẩn hóa kiến trúc module tầng frontend theo nguyên tắc DRY và ranh giới ESLint; bóc tách logic chọn địa giới hành chính và quản lý địa chỉ từ checkout và pickup thành `src/modules/address`; bóc tách thẻ thông tin người bán và huy hiệu xác thực thành `src/modules/shop` để các feature sử dụng chéo mà không vi phạm quy tắc cô lập layer; chuyển đổi các thành phần UI viết thủ công sang component chuẩn shadcn (`Skeleton`, `Badge`, `Dialog`, `Combobox` có ô search địa chỉ hỗ trợ tiếng Việt); chuẩn hóa toàn bộ form địa chỉ sang `react-hook-form` + `zodResolver` với hook và form component độc lập; tối ưu hóa luồng mua hàng thành 2 màn hình chuẩn mực (tích chọn sản phẩm, tính tổng tiền real-time và chọn địa chỉ nhận hàng trực tiếp tại Giỏ hàng `/cart`, tự động gọi API giữ hàng chuyển thẳng sang `/checkout?id=...`).
- **Prompt chính:** Rà soát các thành phần bị trùng lặp logic hoặc vi phạm nguyên tắc DRY trên frontend, tiến hành bóc tách các domain dùng chung thành các module chuẩn mực trong thư mục `src/modules/` (Address và Shop), thay thế các thành phần viết thủ công bằng component shadcn có sẵn kèm ô search cho địa chỉ, chuyển đổi toàn bộ form thủ công sang react-hook-form bóc tách thành hook và component riêng biệt; gộp bước giữ hàng pre-reserve vào luôn giỏ hàng (/cart), bổ sung checkbox chọn món cấp toàn bộ/shop/sản phẩm, tính subtotal trực tiếp và chọn địa chỉ nhận hàng để chuyển thẳng sang checkout giữ hàng.
- **Phần AI hỗ trợ:** Khởi tạo module `src/modules/address` với hook `useAdministrativeDivisions`, hook `useUserAddressForm`, UI component `AdministrativeDivisionFields`, `UserAddressForm` và `AddAddressDialog`; khởi tạo hook `usePickupAddressForm` cho `features/pickup`; khởi tạo module `src/modules/shop` với `ShopCard`, `ShopSummaryCard` và `SellerVerifiedBadge`; tích hợp shadcn `Skeleton`, `Badge`, `Dialog`, `Combobox` và nâng cấp bộ chọn Tỉnh/Thành, Phường/Xã có ô tìm kiếm gõ lọc tiếng Việt; chuẩn hoá toàn bộ các skeleton (`CatalogSkeleton`, `ProductDetailSkeleton`, `CartSkeleton`, `CheckoutSkeleton`); cập nhật `PickupAddressForm`, `AddDeliveryAddress`, `HomePage` và `ProductDetailPage` dùng module mới; di chuyển `CartPage` sang `src/features/cart` bổ sung checkbox đa cấp (select all, shop, item), tính tổng linh hoạt theo các món được tick, tích hợp chọn địa chỉ giao hàng và gọi mutation `useCheckoutControllerCreate` chuyển thẳng sang `/checkout?id=...`.
- **Phần tự làm hoặc đã chỉnh sửa:** Định nghĩa ranh giới trách nhiệm giữa `shared` và `modules`, tối ưu kiểu dữ liệu component để tránh phụ thuộc chặt vào generic TanStack Query, giữ nguyên tương thích ngược cho các import hiện tại.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint architecture zones với 0 lỗi, 0 cảnh báo), `pnpm test` (3/3 test suites pass), `pnpm build` (compile và prerender 14/14 static routes thành công).
- **Lỗi hoặc đề xuất sai của AI đã phát hiện:** Lỗi type checking do ép kiểu generic chặt của `UseQueryResult` với `unknown`; đã nới lỏng interface dữ liệu đầu vào của `AdministrativeDivisionFields` để component thuần túy nhận data/error mà không phụ thuộc sâu vào TanStack Query type.
- **Minh chứng:** [PR #13](https://github.com/buihaiduongdev/rewear-fe/pull/13) trên branch `refactor/extract-shared-modules` (rewear-fe).

### 2026-11-19 — Hoàn thiện luồng Cart & Checkout khớp 100% thiết kế Figma

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash).
- **Mục đích và phạm vi:** Đồng bộ hóa toàn diện giao diện Giỏ hàng và Thanh toán (`CartPage` và `CheckoutPage`) khớp 100% với Figma (Section `06 · Buyer / Cart & checkout`), loại bỏ màn hình trung gian thừa, kết nối modal chọn địa chỉ, chọn phương thức vận chuyển theo shop và phương thức thanh toán, tối ưu hóa luồng thoát thanh toán 1-click mượt mà.
- **Prompt chính:** Rà soát và chỉnh sửa giao diện Giỏ hàng (/cart) và Checkout (/checkout) theo đúng thiết kế Figma: bỏ các checkbox thừa trong giỏ, xóa bỏ màn hình checkout trung gian pre-reserve; khi bấm Continue to checkout ở giỏ thì tự động giữ chỗ bằng địa chỉ mặc định và chuyển thẳng sang checkout; tạo custom DeliveryAddressModal, DeliveryMethodModal cho từng shop, PaymentMethodModal với các cổng thanh toán chưa kích hoạt được làm mờ; loại bỏ popup xác nhận Leave checkout và màn hình trung gian Checkout cancelled để quay về giỏ hàng mượt mà 1-click; kết nối cước và ngày giao hàng dự kiến từ API GHN Sandbox thực tế.
- **Phần AI hỗ trợ:** Khởi tạo `DeliveryAddressModal` (Figma `48:174`), `DeliveryMethodModal` (Figma `75:453`), `PaymentMethodModal` (Figma `47:1414`); cập nhật `CartPage.tsx` bỏ checkbox/dropdown địa chỉ và cấu hình nút "Continue to checkout" tự động reserve chuyển thẳng sang `/checkout?id=...`; cập nhật `CheckoutPage.tsx` xóa hơn 160 dòng giao diện trung gian cũ, kết nối các modal và xử lý hủy đơn chuyển thẳng về giỏ hàng; cập nhật `ShippingEstimate.tsx` đọc thời gian giao dự kiến `estimatedDeliveryAt` và kết nối các nút mở modal.
- **Phần tự làm hoặc đã chỉnh sửa:** Định hướng trải nghiệm người dùng, quyết định loại bỏ các bước xác nhận rườm rà khi thoát checkout, kiểm tra đối chiếu trực quan từng frame Figma qua MCP figwright và kiểm chứng toàn bộ mã nguồn.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint với 0 lỗi, 0 cảnh báo), `pnpm test` (5/5 unit tests pass 100%), `pnpm build` (compile và static prerender 14/14 static pages thành công).
- **Lỗi hoặc đề xuất sai của AI đã phát hiện:** Ban đầu AI vẫn giữ lại khung giao diện pre-reserve và popup hỏi xác nhận hủy checkout gây gián đoạn luồng người dùng; đã phát hiện và yêu cầu dọn dẹp triệt để để người dùng chuyển trang mượt mà 1-click.
- **Minh chứng:** [PR #13](https://github.com/buihaiduongdev/rewear-fe/pull/13) trên branch `refactor/extract-shared-modules` (rewear-fe).

### 2026-11-20 — Triển khai tính năng Wishlist và Lưu để mua sau (Save for later)

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash).
- **Mục đích và phạm vi:** Triển khai tính năng Wishlist (Danh sách yêu thích) thành trang riêng biệt (`/wishlist`) độc lập với giỏ hàng (`/cart`) để giữ chuẩn Figma; kết nối đồng bộ giữa Backend NestJS và Frontend Next.js; tích hợp nút lưu trên trang chi tiết sản phẩm và liên kết luồng chuyển qua lại giữa Giỏ hàng và Trang Wishlist.
- **Prompt chính:** Triển khai tính năng Wishlist trang riêng, không nhét vào cart; kết nối nút "Save for later" trên giỏ hàng; bổ sung nút bookmark/lưu trên trang chi tiết sản phẩm; thêm điều hướng Wishlist trên header và mobile navigation.
- **Phần AI hỗ trợ:**
  - Backend (`rewear-be`): Thiết kế `WishlistItem` entity, migration TypeORM, Zod schemas, `WishlistService` và `WishlistController` với các endpoint `GET /api/wishlist`, `PUT /api/wishlist/items/:productId`, `DELETE /api/wishlist/items/:productId`; viết unit test `wishlist.service.spec.ts` đạt 100% test pass.
  - Frontend (`rewear-fe`): Tái tạo API client và React Query hooks thông qua Orval; xây dựng hook `useWishlist`, `useAddToWishlist`, `useRemoveFromWishlist`; tạo component `SaveToWishlistButton` tích hợp vào `ProductDetailPage`; tạo route `/wishlist`, component `WishlistPage` và `WishlistSkeleton`; cập nhật `CartPage.tsx` gắn action "Save for later" chuyển sản phẩm từ giỏ sang Wishlist; bổ sung liên kết Wishlist trên `MarketplaceHeader` và `MobileNavigation`.
- **Phần tự làm hoặc đã chỉnh sửa:** Định hướng trải nghiệm tách riêng trang Wishlist thay vì nhúng trong giỏ hàng; xử lý ranh giới kiến trúc restricted zone giữa `src/shared` và `src/modules`; kiểm soát ranh giới xác thực JWT, chuẩn hóa định dạng dữ liệu trả về theo quy chuẩn API của dự án.
- **Cách kiểm chứng:** Chạy `pnpm check` và `test:unit` trên cả BE và FE; chạy `pnpm build` trên FE thành công 15/15 static pages; kiểm thử tích hợp thực tế bằng HTTP request thêm/xóa/truy vấn sản phẩm trong danh sách lưu.
- **Lỗi hoặc đề xuất sai của AI đã phát hiện:** Lỗi sai tên biến param khi đồng bộ Orval (`productId` thay vì `id`) trong `PackageForm` và `ShippingPackagesPage`; lỗi vi phạm import restricted zone trong `MobileNavigation`; đã kịp thời hiệu chỉnh để `pnpm check` pass hoàn toàn.
- **Minh chứng:** Branch `feat/wishlist` (rewear-be) và [PR #13](https://github.com/buihaiduongdev/rewear-fe/pull/13) trên branch `refactor/extract-shared-modules` (rewear-fe).

### 2026-11-20 — Triển khai luồng Mở shop (Shop Onboarding) và Seller Dashboard

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash).
- **Mục đích và phạm vi:** Triển khai luồng Mở shop / Thiết lập cửa hàng người bán (`/selling/open`, `/selling/new`) và Bảng điều khiển người bán (`/selling`) khớp 100% với Figma Design (Section `12 · Seller / Open shop & pickup` Frame `63:2226`, `66:311` và Section `11 · Seller / Dashboard` Frame `1:1162`); kết nối gọi API tạo shop `POST /api/shops`, tự động chuyển hướng và điền `shopId` vào trang thiết lập địa chỉ lấy hàng GHN (`/selling/pickup?shopId=...`); liên kết điều hướng từ trang chủ và header.
- **Prompt chính:** Mở shop / tạo shopid và làm seller dashboard theo đúng Figma design; kết nối luồng tạo shop sang cấu hình địa chỉ lấy hàng; hiển thị trạng thái shop đã có và thông số hoạt động của người bán.
- **Phần AI hỗ trợ:**
  - Khởi tạo `OpenShopPage.tsx` và route `/selling/open`, `/selling/new`: Stepper timeline 3 bước (`Shop details`, `Pickup address`, `Shop ready`), form nhập tên shop, tự động sinh slug URL `rewear.vn/shops/[slug]` hỗ trợ tiếng Việt có dấu kèm nút copy, mô tả shop, avatar chữ cái đầu; thẻ xem trước trực quan `Your shop, at a glance` và nút `Continue to pickup address` gọi API `useShopControllerCreate`; hỗ trợ thông báo `Your shop is already set up` (Figma `66:311`) khi user đã sở hữu shop.
  - Cập nhật `PickupAddressPage.tsx` và route `/selling/pickup`: Tự động đọc và chọn `shopId` từ URL search parameters, tối ưu hóa việc suy diễn `shopId` trong render để tránh re-render cascading theo chuẩn React 19; bao bọc `Suspense` trên route.
  - Khởi tạo `SellerDashboardPage.tsx` và route `/selling`: Banner chào mừng không gian làm việc (`● SELLER WORKSPACE`, tên shop, huy hiệu `VERIFIED BOUTIQUE`, nút thêm sản phẩm `+ List New Archive Piece` và `Pickup Settings`), 4 thẻ chỉ số hiệu suất (`NET REVENUE (MTD)`, `ORDERS TO DISPATCH`, `ACTIVE LISTINGS`, `AUTHENTICITY PASS`), bảng danh sách đơn hàng cần xử lý `Orders Awaiting Action` kèm SLA đếm ngược, thẻ chấm điểm chất lượng `Quality Scorecard` và khối liên kết cài đặt workspace; hỗ trợ giao diện zero-state hướng dẫn mở shop khi tài khoản chưa có shop.
  - Cập nhật `MarketplaceHeader.tsx` và `HomePage.tsx`: Thêm liên kết `Seller workspace` vào menu tài khoản, kích hoạt nút "Start selling" chuyển thẳng vào dashboard người bán khi đã đăng nhập.
  - Bổ sung unit tests `tests/shop-onboarding.test.ts` kiểm thử logic sinh URL slug tiếng Việt và avatar monogram.
- **Phần tự làm hoặc đã chỉnh sửa:** Định hướng trải nghiệm liền mạch từ tạo shop sang cài đặt địa chỉ lấy hàng GHN; xử lý cấu trúc derive state thay vì `useEffect` lồng `setState` theo đúng khuyến nghị của React Compiler / ESLint; kiểm chứng giao diện so với Figma frame gốc.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (4/4 test suites, 7/7 unit tests pass 100%), `pnpm build` (compile và static prerender 18/18 static pages thành công).
- **Lỗi hoặc đề xuất sai của AI đã phát hiện:** Lỗi type checking do ép kiểu `unknown` trong biểu thức JSX `{createShop.error && ...}` (đã sửa thành `!!createShop.error`); lỗi cảnh báo ESLint `react-hooks/set-state-in-effect` khi cập nhật `shopId` từ URL trong effect (đã chuyển sang `useMemo` suy diễn trực tiếp trong render); thiếu header `X-Shop-Id` khi truy cập endpoint cấu hình địa chỉ kho lấy hàng GHN của shop dẫn đến lỗi NestJS PermissionGuard 400 `X-Shop-Id must be a UUID` (đã bổ sung interceptor tự động trích xuất `x-shop-id` từ route `/shops/:shopId` trong `axios-client.ts` và gán tường minh trong `usePickupLocationControllerFindShop` / `usePickupLocationControllerSaveShop`); thiếu cơ chế interceptor tự làm mới (auto-refresh) session và access token khi hết hạn (đã bổ sung route `/api/auth/refresh-session` gọi `unstable_update`, cơ chế chủ động xin lại token trước 60 giây hết hạn trong request interceptor, và interceptor 401 tự gọi refresh rồi retry request mượt mà không làm gián đoạn người dùng); loại bỏ dropdown thừa `Selling as`, chuyển toàn bộ placeholder của Combobox tỉnh thành / phường xã sang full tiếng Anh, bổ sung placeholder chuẩn Figma cho các trường nhập liệu trên `/selling/pickup` và đồng bộ layout với Frame `63:2256` / `63:2291`; đồng bộ layout live preview card 2 cột và bổ sung placeholder sang `PackageForm` (`/selling/packages`) và `UserAddressForm`; sửa lỗi Combobox tìm kiếm Tỉnh / Thành phố và Phường / Xã không lọc danh sách theo text nhập do render tĩnh bằng `map()` thay vì dùng `ComboboxCollection` render callback của Base UI, đồng thời bổ sung unit test `tests/administrative-division-fields.test.tsx` kiểm thử tự động; sửa lỗi không load được danh sách Phường / Xã khi chọn Tỉnh / Thành phố do `useAdministrativeDivisions` chỉ khởi tạo state 1 lần mà không đồng bộ theo `provinceCode` thay đổi ở parent, kèm lỗi validate sớm `wardCode` rỗng kích hoạt thông báo regex thô `Invalid string: must match pattern /^\d{5}$/` (đã đồng bộ `provinceCode` dạng controlled trong `useAdministrativeDivisions`, tắt validate sớm khi reset ward và chuẩn hóa thông báo lỗi người dùng sang tiếng Anh thân thiện).
- **Minh chứng:** [PR #15](https://github.com/buihaiduongdev/rewear-fe/pull/15) trên branch `feat/seller-dashboard` (rewear-fe).

### 2026-11-21 — Đồng bộ hóa luồng Mở shop và Cài đặt địa chỉ lấy hàng theo Figma (Frames 63:2315, 63:2256, 63:2291)

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash) kết nối Figwright MCP Server.
- **Mục đích và phạm vi:** Khắc phục triệt để các bất cập trong luồng người bán (`/selling/pickup`, `/selling/new`, `/selling`) và dọn dẹp điều hướng trên `MarketplaceHeader`: phân tách rành mạch chế độ Thiết lập lần đầu (Onboarding - Figma `63:2256`) và Cập nhật địa chỉ kho khi đã có shop (Settings - Figma `63:2315`); sửa lỗi form địa chỉ bị trắng do mất đồng bộ bất đồng bộ khi nạp dữ liệu từ API; gỡ bỏ liên kết sai trỏ nhầm vào `/selling/packages` và chuẩn hóa điểm đến cho nút *"Create your first listing"* và *"+ List New Archive Piece"*.
- **Prompt chính:** figwright đang mở á, làm theo figma 90% thấy thiết kế có gì bất logic gì báo tôi; ok lên branch hiện tại luôn.
- **Phần AI hỗ trợ:**
  - Đối chiếu trực tiếp cấu trúc cây node Figma qua Figwright MCP: phát hiện Frame `63:2315` (*Seller / Update pickup address*) dành riêng cho việc cập nhật địa chỉ kho khi shop đã tồn tại, đối lập với Frame `63:2256` (*Seller / Set your pickup address*) chỉ dùng khi mở shop lần đầu; phát hiện luồng `Package` trong Figma vốn nằm trong flow xử lý đơn hàng (`Order → package → review → label` - Figma `66:329`, `63:2410`), không phải trang độc lập nhét trên Header.
  - Tái cấu trúc `PickupAddressPage.tsx`: nhận diện trạng thái `isSettingsMode` dựa trên địa chỉ kho hiện có và cờ `onboarding`. Khi ở chế độ cài đặt (Figma `63:2315`), ẩn Stepper 3 bước, hiển thị breadcrumb `Shop settings / Pickup`, tiêu đề `Update pickup address`, form chuyển sang `isEditing={true}`, nút submit `Save pickup address`, và thẻ bối cảnh `Keep existing shipments intact`; khi lưu thành công không bị chuyển màn hình sang "Your shop is ready".
  - Cập nhật `use-pickup-address-form.ts`: bổ sung `useEffect` và `reset()` từ `react-hook-form` để tự động điền lại dữ liệu địa chỉ khi `initial` được query tải về từ backend, giải quyết dứt điểm lỗi bị "nhập lại từ đầu".
  - Sửa lỗi điều hướng ở `Your shop is ready` (Figma `63:2291`): nút chính đổi thành `Open seller workspace` (`/selling`) và nút phụ là `Manage pickup address` (`/selling/pickup`).
  - Dọn dẹp `MarketplaceHeader.tsx`: loại bỏ các liên kết nội bộ người bán (`Listing packages`, `Pickup address`) khỏi dropdown tài khoản người mua, chỉ giữ `Seller workspace` làm đầu mối duy nhất.
  - Cập nhật `SellerDashboardPage.tsx`: gỡ bỏ `Listing packages` khỏi thanh điều hướng chính, trỏ nút `+ List New Archive Piece` sang `/selling/new`.
  - Khởi tạo trang tạm `/selling/new` với giao diện thông báo chu đáo thay vì tái sử dụng nhầm `OpenShopPage`.
- **Phần tự làm hoặc đã chỉnh sửa:** Định hướng cấu trúc phân nhánh hiển thị theo ngữ cảnh người dùng (người dùng mới mở shop vs người bán đã có shop đang quản lý kho); kiểm chứng toàn bộ thông tin hiển thị trên Figma và đảm bảo tuân thủ thiết kế design system.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (5/5 suites, 9/9 unit tests pass 100%), `pnpm build` (compile và static prerender 19/19 routes thành công).
- **Lỗi hoặc đề xuất sai của AI đã phát hiện:** Nhầm lẫn ban đầu khi xem `/selling/packages` là trang độc lập cho người bán mới đăng ký; sau khi tra cứu Figma qua Figwright đã phát hiện trang này chỉ thuộc khâu xác nhận đơn hàng (`Confirm package`), từ đó dọn dẹp các đường link gây rối rắm.
- **Minh chứng:** Commit trên branch `feat/seller-dashboard` thuộc [PR #15](https://github.com/buihaiduongdev/rewear-fe/pull/15) (rewear-fe).

### 2026-11-21 — Tinh gọn Marketplace Header và chuẩn hóa Footer 1 dòng theo Figma 48:684

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash) kết nối Figwright MCP Server.
- **Mục đích và phạm vi:** Khắc phục phản hồi thiết kế trên trang chủ (`/`): gỡ bỏ chuyển đổi ngôn ngữ `EN / VI` khỏi `MarketplaceHeader`; loại bỏ chữ `across Vietnam` trong lời giới thiệu trên `HomePage`; chuẩn hóa Footer trang chủ sang mẫu 1 dòng tối giản thanh lịch đúng chuẩn Figma (`UX / Footer` Frame `48:684`, `48:314`), xóa bỏ khối Footer 2 tầng cồng kềnh trước đó.
- **Prompt chính:** figma chỉ có 1 dòng mà đúng ko; bỏ khỏi header; bỏ text vietnam; sao tới tận 2 footer.
- **Phần AI hỗ trợ:**
  - Kiểm tra trực tiếp qua Figwright MCP trên node Figma `48:684` (*UX / Footer*) và `1:4134`: xác nhận thiết kế chuẩn của Figma toàn bộ hệ thống đều dùng Footer 1 dòng ngang (`layout: HORIZONTAL`, `height: 64px`, `justify-between`) gồm `© 2026 RE.WEAR` bên trái và `Help · Returns · Privacy` bên phải; khối Footer 2 tầng trước đây là do triển khai nhầm từ các bản nháp cũ.
  - Tái cấu trúc [MarketplaceFooter.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/shared/components/marketplace/MarketplaceFooter.tsx) thành chuẩn 1 dòng thanh lịch đồng bộ với các trang Cart, Checkout, Wishlist.
  - Cập nhật [MarketplaceHeader.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/shared/components/marketplace/MarketplaceHeader.tsx): gỡ bỏ thẻ `<span>EN / VI</span>`.
  - Cập nhật [HomePage.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/HomePage.tsx): xóa cụm từ `across Vietnam` trong subtitle hero.
- **Phần tự làm hoặc đã chỉnh sửa:** Định hướng chuyển đổi toàn bộ footer về chuẩn tối giản thống nhất của dự án.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (5/5 suites, 9/9 unit tests pass 100%), `pnpm build` (compile và static prerender 19/19 routes thành công).
- **Minh chứng:** Commit trên branch `feat/seller-dashboard` thuộc [PR #15](https://github.com/buihaiduongdev/rewear-fe/pull/15) (rewear-fe).

### 2026-11-21 — Đồng bộ icon mũi tên Start selling theo Figma Node 53:644

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash) kết nối Figwright MCP Server.
- **Mục đích và phạm vi:** Thay thế ký tự Unicode `↗` bị vỡ/lệch font trên trình duyệt bằng vector icon `ArrowUpRight` (kích thước 16px, `strokeWidth: 2.5`) khớp chính xác với thiết kế Figma Node `53:644` (*Start selling  ↗*).
- **Prompt chính:** https://www.figma.com/design/xjyTlIecBwx0SdTILgBkFL/Re.wear-design?node-id=53-644&t=S07OybIvWfKNzBCm-11 dùng đúng icon mũi tên.
- **Phần AI hỗ trợ:**
  - Kiểm tra trực tiếp qua Figwright MCP trên node `53:644` và xuất ảnh chụp kiểm chứng (`media_0.png`): xác định độ dày nét, hướng nghiêng góc 45 độ và vị trí căn hàng ngang với chữ `Start selling`.
  - Cập nhật [HomePage.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/HomePage.tsx): tích hợp icon `ArrowUpRight` từ `lucide-react` kèm căn chỉnh `inline-flex items-center gap-1`.
- **Phần tự làm hoặc đã chỉnh sửa:** Định hướng cấu trúc flex và kích thước icon đảm bảo nét vẽ tương đồng với font SemiBold của DM Sans.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (5/5 suites, 9/9 unit tests pass 100%), `pnpm build` (compile và static prerender 19/19 routes thành công).
- **Minh chứng:** Commit trên branch `feat/seller-dashboard` thuộc [PR #15](https://github.com/buihaiduongdev/rewear-fe/pull/15) (rewear-fe).

### 2026-11-21 — Tích hợp Modal Trợ giúp mua hàng và Đổi trả (Figma 67:419 / 48:114) vào Footer

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash) kết nối Figwright MCP Server.
- **Mục đích và phạm vi:** Kết nối các liên kết ở Footer (`Help`, `Returns`, `Privacy`) mở trực tiếp Modal thông tin chính sách chuẩn thiết kế Figma Node `48:114` (*Buying secondhand*) và Node `71:2174` thuộc Section `03 · Shared / Buying help` (Node `67:419`); loại bỏ các liên kết chết (404), giúp người mua dễ dàng tra cứu quyền lợi đổi trả trong 72h và cam kết bảo vệ thanh toán ký quỹ (escrow).
- **Prompt chính:** https://www.figma.com/design/xjyTlIecBwx0SdTILgBkFL/Re.wear-design?node-id=67-419&t=S07OybIvWfKNzBCm-11 footer thì cho xem các modal này nhỉ.
- **Phần AI hỗ trợ:**
  - Khảo sát trực tiếp cấu trúc cây node Figma qua Figwright MCP trên Node `67:419`, `48:114` và `71:2174`: trích xuất chính xác toàn bộ nội dung bản quyền, thông báo kiểm tra đồ cũ trước khi mua (*Check photos, measurements and disclosed flaws*), thời hạn báo cáo sự cố 72h (*Within 72h of delivery*), chính sách hoàn tiền sau xác minh (*Returns & refunds*).
  - Khởi tạo [PolicyModals.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/shared/components/marketplace/PolicyModals.tsx): triển khai Modal `Buying secondhand` chuẩn Figma `48:114` và Modal `Privacy policy` theo ngôn ngữ thiết kế tối giản góc cạnh của RE.WEAR.
  - Cập nhật [MarketplaceFooter.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/shared/components/marketplace/MarketplaceFooter.tsx): chuyển các thẻ `Link` thành các nút bấm tương tác mở Modal tương ứng.
- **Phần tự làm hoặc đã chỉnh sửa:** Định hướng trải nghiệm tại chỗ không reload trang, tối ưu hóa hiển thị trên cả desktop và mobile.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (5/5 suites, 9/9 unit tests pass 100%), `pnpm build` (compile và static prerender 19/19 routes thành công).
- **Minh chứng:** Commit trên branch `feat/seller-dashboard` thuộc [PR #15](https://github.com/buihaiduongdev/rewear-fe/pull/15) (rewear-fe).

### 2026-11-21 — Triển khai bộ lọc sản phẩm (Search & Filters) và Filter Modal chuẩn Figma 53:1061 & 48:143

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash) kết nối Figwright MCP Server.
- **Mục đích và phạm vi:** Triển khai đầy đủ thanh công cụ tìm kiếm và lọc sản phẩm (*Search and filters* - Figma Node `53:1061`) trên trang danh mục All clothing (`/products`), tích hợp Modal lọc chi tiết (*Filters modal* - Figma Node `48:143` desktop & `48:2559` mobile) bao gồm Category, Size, Condition, Price và menu sắp xếp Sort: Newest / Price low to high / Price high to low.
- **Prompt chính:** https://www.figma.com/design/xjyTlIecBwx0SdTILgBkFL/Re.wear-design?node-id=53-1061&t=S07OybIvWfKNzBCm-11 thiếu filter.
- **Phần AI hỗ trợ:**
  - Khảo sát trực tiếp cấu trúc cây node Figma qua Figwright MCP trên Node `53:1052` (*Refined / All clothing*), `53:1061` (*Search and filters*), `53:1065` (*Filter controls*), `48:143` (*Filters modal*): xác định đầy đủ các trường thuộc tính lọc (Category, Size, Condition, Price), nút hành động chính *Show items*, liên kết mở modal `Filters  ↓` và menu `Sort: Newest  ↓`.
  - Khởi tạo component [ProductFilterModal.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductFilterModal.tsx): triển khai Modal lọc chuẩn Figma với 4 trường `RE.WEAR/Field` (Category, Size, Condition, Price) và nút bấm `Show items` màu xanh neon `bg-rewear-accent`. Nâng cấp bộ lọc Price sang dạng linh hoạt: kết hợp 2 ô nhập tùy chỉnh `Từ (₫)` – `Đến (₫)` cùng hàng nút chọn nhanh 1 chạm theo phân khúc secondhand (`Dưới 300k`, `300k - 600k`, `600k - 1tr`, `Trên 1tr`).
  - Cập nhật hook [use-home-catalog.ts](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/hooks/use-home-catalog.ts): mở rộng hỗ trợ nhận và đồng bộ các query parameters `size`, `condition`, `minPrice`, `maxPrice`, `sortBy` khớp với API contract phân trang của backend (`filter.price=$gte:min`, `filter.price=$lte:max`).
  - Tái cấu trúc [ProductsPage.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductsPage.tsx): đổi tiêu đề thành `All clothing` chuẩn Figma `53:1053`, bổ sung khung Search lớn (Figma `53:1062`), tích hợp nút mở bộ lọc `Filters  ↓`, menu sắp xếp giá/mới nhất `Sort  ↓` và dải ruy-băng hiển thị các tag lọc đang kích hoạt kèm nút xóa tiện lợi.
- **Phần tự làm hoặc đã chỉnh sửa:** Định hướng cấu trúc form tách biệt trong modal để tránh cascading renders theo chuẩn React 19; kiểm tra khớp nối chính xác với NestJS `nestjs-paginate` backend.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (5/5 suites, 9/9 unit tests pass 100%), `pnpm build` (compile và static prerender 19/19 routes thành công). Kiểm tra gọi trực tiếp API `filter.condition`, `filter.size`, `filter.price`, `sortBy` trên backend.
- **Minh chứng:** Commit trên branch `feat/seller-dashboard` thuộc [PR #15](https://github.com/buihaiduongdev/rewear-fe/pull/15) (rewear-fe).

### 2026-11-21 — Tích hợp shadcn pagination và tùy biến chuẩn Pagination Footer Figma 86:1606

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash) kết nối Figwright MCP Server & shadcn CLI.
- **Mục đích và phạm vi:** Tải component phân trang shadcn (`@/shared/components/ui/pagination.tsx`) và tùy biến lại giao diện theo đúng Figma Node `86:1606` (*Pagination footer*): gồm cụm bên trái điều khiển `Items per page` (12, 24, 48) và cụm bên phải gồm các nút thẻ `‹ Previous`, các số trang (active trang nền xanh neon `#c3f832`), và `Next ›`.
- **Prompt chính:** ok tai paginate shadcn ve roi custom lai thoi cho it code.
- **Phần AI hỗ trợ:**
  - Chạy `pnpm dlx shadcn@latest add pagination` tải component nền tảng chuẩn của thư viện.
  - Tùy biến [pagination.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/shared/components/ui/pagination.tsx): bổ sung sub-component `PaginationPageSize` theo chuẩn thiết kế Figma Node `86:1607`, tùy biến các nút `PaginationLink`, `PaginationPrevious`, `PaginationNext` theo phong cách `RE.WEAR/Button/Secondary` vuông góc (cao 40px, padding 20px, trạng thái disabled `opacity-45`).
  - Cập nhật [use-home-catalog.ts](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/hooks/use-home-catalog.ts) hỗ trợ param `limit` (12, 24, 48).
  - Tích hợp component vào [ProductsPage.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductsPage.tsx) thay thế phân trang viết tay cũ.
- **Phần tự làm hoặc đã chỉnh sửa:** Định hướng giữ nguyên `button.tsx` gốc của dự án khi shadcn CLI nhắc ghi đè, thuật toán chia trang thông minh `getPageNumbers` với dấu chấm lửng `ellipsis`.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (5/5 suites, 9/9 unit tests pass 100%), `pnpm build` (compile và static prerender 19/19 routes thành công).
- **Minh chứng:** Commit trên branch `feat/seller-dashboard` thuộc [PR #15](https://github.com/buihaiduongdev/rewear-fe/pull/15) (rewear-fe).

### 2026-11-21 — Chuẩn hóa toàn bộ giao diện và mã nguồn sang 100% tiếng Anh (Full English UI Standardization)

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash).
- **Mục đích và phạm vi:** Rà soát và loại bỏ toàn bộ các chuỗi văn bản tiếng Việt còn sót lại trên giao diện frontend (UI text, placeholder, aria-label, metadata, toast notification, form buttons và badges), chuẩn hóa 100% giao diện dự án sang tiếng Anh thống nhất theo đúng yêu cầu dự án RE.WEAR.
- **Prompt chính:** full english mà sao bạn cứ code vie vào v.
- **Phần AI hỗ trợ:**
  - Rà soát tự động toàn bộ codebase trong thư mục `src/` bằng script quét ký tự Unicode và từ vựng tiếng Việt.
  - Chuẩn hóa [ProductFilterModal.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductFilterModal.tsx): chuyển các tag giá nhanh sang tiếng Anh (`Under 300k`, `300k – 600k`, `600k – 1M`, `Over 1M`), nhãn `From (₫)` và `To (₫)`.
  - Chuẩn hóa [ProductDetailPage.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/product-detail/components/ProductDetailPage.tsx): chuyển toàn bộ thông báo share toast, 404 text, button labels, breadcrumbs, status labels, attributes, measurements, condition notes, shipping inspection sang tiếng Anh.
  - Chuẩn hóa các skeleton component: [CatalogSkeleton.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/skeletons/CatalogSkeleton.tsx), [ProductDetailSkeleton.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/product-detail/skeletons/ProductDetailSkeleton.tsx), [CartSkeleton.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/modules/cart/skeletons/CartSkeleton.tsx), [CheckoutSkeleton.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/checkout/skeletons/CheckoutSkeleton.tsx) (cập nhật các aria-label và sr-only loading text).
  - Chuẩn hóa shared components: [toast.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/shared/components/ui/toast.tsx) (`View details`, `Close notification`), [SellerVerifiedBadge.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/modules/shop/components/SellerVerifiedBadge.tsx) (`Verified`), [ShopSummaryCard.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/modules/shop/components/ShopSummaryCard.tsx) (`Seller`), [UserAddressForm.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/modules/address/components/UserAddressForm.tsx) (`Cancel`), [ProductPreview.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductPreview.tsx) (`View full piece details`), [LoginShell.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/access-account/components/LoginShell.tsx), [app/products/[id]/page.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/app/products/[id]/page.tsx).
- **Phần tự làm hoặc đã chỉnh sửa:** Định hướng giữ lại các hàm slugify / chuẩn hóa ký tự tiếng Việt trong bộ tìm kiếm địa chỉ GHN để phục vụ người dùng nhập địa chỉ Việt Nam mà không ảnh hưởng đến ngôn ngữ hiển thị.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (5/5 suites, 9/9 unit tests pass 100%), `pnpm build` (compile và static prerender 19/19 routes thành công). Quét lại toàn bộ codebase xác nhận không còn chuỗi tiếng Việt trên UI.
- **Minh chứng:** Commit trên branch `feat/seller-dashboard` thuộc [PR #15](https://github.com/buihaiduongdev/rewear-fe/pull/15) (rewear-fe).

### 2026-11-21 — Tinh gọn Filter Modal, loại bỏ nút Clear all filters trùng lặp theo Figma 48:143

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash).
- **Mục đích và phạm vi:** Loại bỏ nút "Clear all filters" bên trong `ProductFilterModal` để giao diện modal gọn gàng, chuẩn xác theo thiết kế gốc Figma Node `48:143` (chỉ có duy nhất nút hành động `Show items`); hành động xóa toàn bộ bộ lọc đã có sẵn tại thanh ruy-băng active filter tags trên trang `/products`.
- **Prompt chính:** bỏ cái này vì có clear bên ngoài page rồi nhỉ? (Feedback về nút Clear all filters trong FilterForm).
- **Phần AI hỗ trợ:**
  - Cập nhật [ProductFilterModal.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductFilterModal.tsx): loại bỏ nút bấm `Clear all filters`, lược bỏ logic `hasAnyFilter` và `handleReset` dư thừa bên trong modal, giữ lại nút chính `Show items`.
  - Cập nhật [ProductsPage.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductsPage.tsx): đồng bộ interface gọi modal không cần truyền `onReset`.
- **Phần tự làm hoặc đã chỉnh sửa:** Đối chiếu với Figma Node `48:143` xác nhận thiết kế gốc không có nút clear trong modal.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (5/5 suites, 9/9 unit tests pass 100%), `pnpm build` (compile và static prerender 19/19 routes thành công).
- **Minh chứng:** Commit trên branch `feat/seller-dashboard` thuộc [PR #15](https://github.com/buihaiduongdev/rewear-fe/pull/15) (rewear-fe).

### 2026-11-21 — Tối ưu UX thanh tìm kiếm Search và chuẩn hóa token màu bg-rewear-soft

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash).
- **Mục đích và phạm vi:** Tối ưu hóa UX của thanh tìm kiếm Search trên trang `/products`, giải quyết triệt để vấn đề ô tìm kiếm bị chìm/hòa vào nền trắng do thiếu affordance; sửa lỗi class màu `bg-rewear-card` không tồn tại trong cấu hình Tailwind v4 sang `bg-rewear-soft` (`#f3f3f5`) kèm viền `border border-rewear-border` và tương tác `focus-within:border-rewear-text`.
- **Prompt chính:** search bị hoà vào background có tốt ux -> người dùng chọn Phương án 1 (chuẩn Figma + viền + focus contrast).
- **Phần AI hỗ trợ:**
  - Bổ sung `--color-rewear-card: #f3f3f5;` vào `@theme inline` trong [globals.css](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/app/globals.css).
  - Tinh chỉnh ô Search trong [ProductsPage.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductsPage.tsx): gán `bg-rewear-soft border border-rewear-border focus-within:border-rewear-text transition-colors`, cập nhật màu các filter pill tags và menu sort.
  - Chuẩn hóa các trường input trong [ProductFilterModal.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductFilterModal.tsx) và nút trang trong [pagination.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/shared/components/ui/pagination.tsx).
- **Phần tự làm hoặc đã chỉnh sửa:** Đánh giá affordance & accessibility theo chuẩn WCAG và Figma Node `53:1062`.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (5/5 suites, 9/9 unit tests pass 100%), `pnpm build` (compile và static prerender 19/19 routes thành công).
- **Minh chứng:** Commit trên branch `feat/seller-dashboard` thuộc [PR #15](https://github.com/buihaiduongdev/rewear-fe/pull/15) (rewear-fe).

### 2026-11-21 — Tinh gọn ô Search thành thanh tìm kiếm 1 dòng (48px) kèm icon kính lúp

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash).
- **Mục đích và phạm vi:** Thu gọn ô tìm kiếm Search trên trang `/products` từ khối 80px (`h-20`) cồng kềnh với label trùng lặp thành thanh tìm kiếm 1 dòng chuẩn mực 48px (`h-12`), bổ sung icon kính lúp (`Search` từ `lucide-react`) và chuyển label sang `sr-only` cho accessibility.
- **Prompt chính:** chắc bỏ label khỏi field nhỉ, nhìn field to quá.
- **Phần AI hỗ trợ:** Cập nhật [ProductsPage.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductsPage.tsx), tích hợp icon kính lúp và bố cục 1 dòng gọn gàng, cân đối hoàn hảo với các nút `Filters` và `Sort`.
- **Phần tự làm hoặc đã chỉnh sửa:** Đảm bảo nhãn accessibility cho screen reader (`sr-only`), kiểm tra responsive trên mobile và desktop.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (5/5 suites, 9/9 unit tests pass 100%), `pnpm build` (compile và static prerender 19/19 routes thành công).
- **Minh chứng:** Commit trên branch `feat/seller-dashboard` thuộc [PR #15](https://github.com/buihaiduongdev/rewear-fe/pull/15) (rewear-fe).

### 2026-11-21 — Khởi tạo hook dùng chung useDebounce và áp dụng Instant Search cho ô tìm kiếm

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash).
- **Mục đích và phạm vi:** Tạo hook dùng chung toàn cục `useDebounce` trong `src/shared/hooks/` phục vụ lọc dữ liệu thời gian thực; áp dụng cơ chế tự động tìm kiếm sau 350ms ngừng gõ kết hợp Enter tức thì cho ô Search trên trang `/products`, viết bộ unit test toàn diện cho hook.
- **Prompt chính:** ok thêm hook debounce cho share global nhỉ.
- **Phần AI hỗ trợ:**
  - Khởi tạo [use-debounce.ts](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/shared/hooks/use-debounce.ts) và barrel export [index.ts](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/shared/hooks/index.ts).
  - Viết 3 unit tests cho hook trong [use-debounce.test.ts](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/tests/use-debounce.test.ts) (kiểm tra trả về giá trị tức thì, debounce đúng thời gian delay và tự hủy timer cũ khi gõ nhanh liên tục).
  - Tích hợp hook vào [ProductsPage.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductsPage.tsx): tự động gọi `updateFilters` sau 350ms không cần ấn Enter, đồng thời giữ nguyên hỗ trợ bấm Enter hoặc nút Clear `✕` phản hồi lập tức.
- **Phần tự làm hoặc đã chỉnh sửa:** Thiết kế cờ `isInitialMount` để tránh trigger lọc thừa khi vừa mở trang lần đầu.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (6/6 suites, 12/12 unit tests pass 100%), `pnpm build` (compile và static prerender 19/19 routes thành công).
- **Minh chứng:** Commit trên branch `feat/seller-dashboard` thuộc [PR #15](https://github.com/buihaiduongdev/rewear-fe/pull/15) (rewear-fe).

### 2026-11-22 — Hiển thị Shop trên ProductCard, nâng cấp Slider khoảng giá và tối ưu bộ lọc

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash).
- **Mục đích và phạm vi:** Thể hiện rõ tính chất sàn thương mại đa người bán (multi-vendor marketplace) trên danh mục sản phẩm: bổ sung avatar logo shop và định dạng `@shop_name` gọn gàng trên thẻ ProductCard, cho phép bấm trực tiếp vào tên Shop để lọc nhanh; nâng cấp bộ chọn giá Price thành Dual Range Slider trực quan cùng lưới ô gợi ý giá nhanh lấp đầy chiều rộng modal.
- **Prompt chính:** Hoàn thiện giao diện thẻ sản phẩm với avatar logo và tên người bán, hỗ trợ bấm vào shop để lọc ngay danh mục, nâng cấp trường chọn giá trong modal lọc thành Dual Range Slider và lưới ô gợi ý giá nhanh toàn màn hình.
- **Phần AI hỗ trợ:**
  - Cập nhật [ProductCard.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductCard.tsx): hiển thị `[Avatar] @{product.shop.name} · {size} · {condition}`, tự động đọc `logoUrl` từ server (kèm fallback chữ cái đầu), gắn sự kiện click có `e.stopPropagation()` gọi callback `onSelectShop` để lọc nhanh mà không mở popup xem trước.
  - Cập nhật [ProductFilterModal.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductFilterModal.tsx): thay thế 2 ô nhập văn bản bằng Dual Range Slider từ `@base-ui/react/slider` (từ `0₫` đến `2.000.000₫+`), hiển thị khoảng giá động linh hoạt; chuyển 4 mức giá gợi ý thành lưới ô chữ nhật sắc nét lấp đầy 100% container.
  - Cập nhật [ProductsPage.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductsPage.tsx): tính `shopId` vào `activeFilterCount`, kết nối `onSelectShop` và dải ruy-băng tag lọc `Shop: @name ✕`.
  - Cập nhật [HomePage.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/HomePage.tsx): kết nối `onSelectShop` để chuyển hướng mượt mà sang catalog lọc theo shop.
  - Cập nhật [ProductPreview.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/home/components/ProductPreview.tsx): chuyển dòng "Sold by {shop}" thành đường link lọc trực tiếp theo shop.
  - Viết 5 unit tests trong [product-card.test.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/tests/product-card.test.tsx) kiểm thử hiển thị chi tiết sản phẩm, logo từ server, fallback initials, sự kiện lọc shop và sản phẩm không có shop.
- **Phần tự làm hoặc đã chỉnh sửa:** Rà soát trải nghiệm người dùng, gỡ bỏ dropdown chọn shop thừa trong modal lọc để tránh quá tải danh sách shop sàn, tinh chỉnh responsive và khoảng cách thanh slider.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (7/7 suites, 17/17 unit tests pass 100%), `pnpm build` (compile và static prerender 19/19 routes thành công).
- **Minh chứng:** Commit trên branch `feat/seller-dashboard` thuộc [PR #15](https://github.com/buihaiduongdev/rewear-fe/pull/15) (rewear-fe).

### 2026-11-22 — Tái cấu trúc giao diện Seller Workspace theo chuẩn Figma (Products & Listing Editor)

- **Người thực hiện:** Bùi Hải Dương.
- **Công cụ:** Antigravity (Gemini 3.8 Flash), Figwright MCP.
- **Mục đích và phạm vi:** Triển khai lại toàn diện giao diện không gian làm việc của người bán (Seller Workspace) theo thiết kế Figma node `67-422` ("13 · Seller / Products & listings"), bao gồm màn hình quản lý sản phẩm Products (Frame `1:2`), trình tạo/chỉnh sửa listing sản phẩm (Frame `43:24` / `48:985`), và 3 modal nghiệp vụ chuẩn mực: Listing checklist (Frame `48:242`), Draft saved (Frame `56:2067`), Submitted for review (Frame `56:2060`).
- **Prompt chính:** https://www.figma.com/design/xjyTlIecBwx0SdTILgBkFL/Re.wear-design?node-id=67-422&t=BTz0EyGZWS9O3zhB-11 sua lai seller theo thiet ke.
- **Phần AI hỗ trợ:**
  - Khởi tạo [SellerWorkspaceLayout.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/seller-dashboard/components/SellerWorkspaceLayout.tsx): khung layout chia cột chuẩn mực với sidebar điều hướng cố định (RE.WEAR, tên shop, các mục Overview, Products với highlight xanh chanh `#C3F832`, Orders, Returns, Funds, Shop settings, Messages, liên kết View marketplace ↗), thanh top header với chuông thông báo và avatar profile người bán, chân trang chuẩn bản quyền.
  - Khởi tạo [SellerProductsPage.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/seller-dashboard/components/SellerProductsPage.tsx): giao diện bảng danh sách sản phẩm với thanh tìm kiếm tiêu đề/mã, dropdown lọc trạng thái (Active, Held, In review, Draft), nút Create listing xanh chanh, bảng danh sách sản phẩm (ảnh thu nhỏ, tiêu đề, size/condition, giá, trạng thái, nút Edit / Locked khi bị giữ hàng) và phân trang. Tích hợp dữ liệu API `useProductControllerFindMine` với fallback dữ liệu mẫu từ thiết kế.
  - Khởi tạo [SellerListingEditorPage.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/seller-dashboard/components/SellerListingEditorPage.tsx): trình tạo sản phẩm 2 cột với các trường thông tin chuẩn xác (Title, Category & Size, Condition & Price, Measurements, Disclosed defects / repairs), khu vực tải lên 4 ảnh chi tiết kèm liên kết mở checklist, cùng thẻ xem trước bản nháp (Draft card) dính bên phải hỗ trợ 2 hành động: Submit for review và Save draft.
  - Khởi tạo [SellerModals.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/seller-dashboard/components/SellerModals.tsx): 3 popup Base UI Dialog chuẩn thiết kế gồm `ListingChecklistModal`, `DraftSavedModal` và `SubmittedForReviewModal`.
  - Cập nhật [SellerDashboardPage.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/features/seller-dashboard/components/SellerDashboardPage.tsx) và [new/page.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/src/app/selling/new/page.tsx) kết nối layout và xử lý routing mượt mà.
  - Viết 7 unit tests mới trong [seller-components.test.tsx](file:///Users/buihaiduong/Workspace/projects/rewear/rewear-fe/tests/seller-components.test.tsx) kiểm thử bảng sản phẩm, tìm kiếm, lọc trạng thái, form editor và đóng mở cả 3 modal.
- **Phần tự làm hoặc đã chỉnh sửa:** Kiểm tra responsive cho thiết bị di động với menu trượt, bọc `React.Suspense` cho các trang dùng `useSearchParams()`, trích xuất tài nguyên hình ảnh mẫu chính xác từ Figma vào `public/images/seller/`.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (8/8 suites, 24/24 unit tests pass 100%), `pnpm build` (compile và static prerender 19/19 routes thành công).
- **Minh chứng:** Commit trên branch `feat/seller-dashboard` thuộc [PR #15](https://github.com/buihaiduongdev/rewear-fe/pull/15) (rewear-fe).

### 2026-11-22 — Thay thế dữ liệu mock trong seller dashboard bằng API thật

- **Người thực hiện:** Bùi Hải Dương
- **Công cụ:** Antigravity (Claude Opus 4.6)
- **Mục đích và phạm vi:** Loại bỏ toàn bộ dữ liệu giả lập (mock orders, hardcoded KPI, sản phẩm mẫu, localStorage logo) trong luồng seller dashboard và thay bằng dữ liệu thật từ API backend, đồng thời bổ sung các trạng thái tải, rỗng, lỗi cho giao diện.
- **Prompt chính:** Rà soát và thay thế các danh sách mock (orders, products, chỉ số KPI) trong seller dashboard bằng dữ liệu thật từ API backend. Nối luồng tạo/sửa/gửi duyệt sản phẩm qua API, bỏ localStorage logo và chuyển sang đọc logoUrl từ server, thêm trạng thái tải và lỗi cho từng phần.
- **Đầu ra AI được sử dụng:**
  - Tạo component SellerPendingOrders gọi API lấy đơn chờ xác nhận, hỗ trợ chấp nhận/từ chối đơn và phân trang.
  - Cập nhật SellerProductsPage đọc sản phẩm theo shop từ API, bỏ fallback bốn sản phẩm mẫu.
  - Cập nhật SellerListingEditorPage nối luồng tạo/sửa/gửi duyệt và upload ảnh sản phẩm qua API.
  - Cập nhật SellerDashboardPage bỏ bốn thẻ KPI giả, dùng số lượng sản phẩm thật.
  - Cập nhật OpenShopPage chuyển logo từ localStorage sang nhập URL công khai.
  - Trích hook useShopMemberships để giảm logic trùng lặp giữa các trang seller.
  - Viết 6 test mới cho pending orders và listing editor.
- **Phần tự làm hoặc đã chỉnh sửa:** Quyết định giữ placeholder Hanoi Archive chỉ ở gợi ý nhập liệu, loại bỏ ở mọi fallback hiển thị. Kiểm tra luồng FE–BE thực tế với dữ liệu seed.
- **Cách kiểm chứng:** Chạy `pnpm check` (pass TypeScript và ESLint 0 lỗi), `pnpm test` (10/10 suites, 30/30 unit tests pass 100%).
- **Lỗi hoặc đề xuất sai của AI đã phát hiện:** Không phát hiện.
- **Minh chứng:** PR [#16](https://github.com/buihaiduongdev/rewear-fe/pull/16), branch `buihaiduongdev/fe-cleanup-review`, commit `46e6b9d`.

### 2026-11-22 — Bổ sung đơn mua và sửa tính toán giỏ hàng

- **Người thực hiện:** Bùi Hải Dương
- **Công cụ:** Codex (OpenAI)
- **Mục đích và phạm vi:** Bổ sung danh sách đơn hàng của người mua và sửa các trường hợp giỏ hàng hiển thị hoặc xử lý không đúng.
- **Prompt chính:** Tiếp tục hoàn thiện frontend và gộp các thay đổi vào cùng worktree và PR dọn code FE.
- **Đầu ra AI được sử dụng:** Trang đơn hàng sử dụng API buyer, lọc trạng thái, phân trang, trạng thái tải/rỗng/lỗi; liên kết điều hướng; sửa tổng tiền giỏ hàng và thứ tự chuyển sản phẩm sang wishlist; bổ sung kiểm thử.
- **Phần tự làm hoặc đã chỉnh sửa:** Người dùng yêu cầu gộp các thay đổi frontend vào cùng worktree và PR hiện có.
- **Cách kiểm chứng:** `pnpm check`, `pnpm test` (12 suites, 36 tests), `pnpm build` đạt. Kiểm tra trình duyệt với buyer seed: danh sách ba đơn và lọc trạng thái gọi API thành công; phiên kiểm thử dùng CORS nới riêng.
- **Giới hạn:** Chưa có trang chi tiết đơn hoặc luồng thanh toán hoàn chỉnh; kiểm thử trình duyệt không xác nhận cấu hình CORS triển khai.
- **Minh chứng:** PR #16, branch `buihaiduongdev/fe-cleanup-review`.
