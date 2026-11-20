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
