# Tempo × Astryx — Khảo sát UI & Kế hoạch thay thế

> Ngày khảo sát: 19/07/2026 · Astryx `@astryxdesign/core@0.1.6` (Beta)

---

## 1. Astryx là gì?

Design system mã nguồn mở của **Meta**, phát triển nội bộ 8 năm, đang chạy cho **13.000+ ứng dụng**. Mở nguồn theo giấy phép MIT, xây trên **React + StyleX**.

**Cung cấp:**

| Hạng mục | Nội dung |
|---|---|
| Components | 150+ component có sẵn accessibility (a11y), TypeScript đầy đủ |
| Themes | 7 theme dựng sẵn: neutral, butter, chocolate, matcha, stone, gothic, y2k |
| Templates | Mẫu trang hoàn chỉnh: dashboard, settings, form wizard, detail page |
| CLI | `astryx component/template/docs/swizzle/upgrade` — tra cứu & sinh code |
| Tokens | Spacing, color, radius, typography dưới dạng CSS custom properties |

**Đặc điểm đáng giá cho Tempo:**

- **Không khóa styling.** Astryx viết style bằng StyleX nhưng người dùng không cần biết — override bằng `className` với Tailwind/CSS thường đều được.
- **Theme = ghi đè CSS variables.** Đổi nhận diện thương hiệu không cần fork hay bọc lại component. Tempo đang dùng CSS variables (`--violet-500`, `--radius-md`…) nên mô hình này khớp tư duy sẵn có.
- **`swizzle`** — eject source một component vào project để tự sở hữu khi cần đi sâu.
- **Thiết kế cho cả người và AI** — có CLI index cho agent tra cứu.

**Trạng thái:** đang **Beta** (v0.1.6, chưa 1.0). API có thể còn đổi; có codemod `astryx upgrade` để migrate.

---

## 2. Kiểm kê UI hiện tại của Tempo

### 2.1 Kiến trúc

| Yếu tố | Hiện trạng |
|---|---|
| React | **18.3.1** (UMD, từ unpkg) |
| Build step | **Không có** — JSX transpile bằng Babel standalone ngay trên trình duyệt |
| Design system | Nội bộ `TempoDesignSystem_e112f2` (`_ds_bundle.js`, 146 KB) |
| Icons | Lucide UMD |
| Tổng JSX | **6.613 dòng** / 18 file |

### 2.2 Component từ DS nội bộ (14 cái, theo tần suất dùng)

| Component | Số file dùng | | Component | Số file dùng |
|---|---|---|---|---|
| Button | 14 | | Chip | 3 |
| Card | 9 | | Switch | 1 |
| Badge | 7 | | StatTile | 1 |
| Avatar | 5 | | ProgressRing | 1 |
| Input | 4 | | ProgressBar | 1 |
| Tabs | 3 | | NavItem | 1 |
| IconButton | 3 | | AvatarGroup | 1 |

### 2.3 Component tự viết tại chỗ (49 cái)

**Layout/khung:** App, Sidebar, TopBar, SectionTitle, LandingNav, FooterSection

**Overlay/dialog:** AuthModal, BillingPlansModal, PreviewDialog, ShareDialog, PublicDialog, DeleteConfirm, OverflowMenu, DropdownPill

**Nội dung học:** LearnScreen, LibraryScreen, FlashcardCard, FlashcardStudy, NoteCard, NotesView, UploadFlow, MaterialLoading, TempoAssistant, TempoTrigger

**Khác:** AnalyticsScreen, Donut, ChartHeader, StatPill, TodaysGoal, RecentActivity, ExploreScreen, GroupsScreen, Placeholder, SpacesPlaceholder, EmptyState thủ công, FAQItem, FeatureCard, PricingCard, BillingPlanCard, UsageBar, CardActions, ExportBtn, Constellation, Icon, LucideIcon, GoogleIcon, HeroSection, FeaturesSection, PricingSection, FAQSection, AuthModal, Sidebar

### 2.4 Bằng chứng "ngây thơ" — đo được

| Chỉ số | Số lượng | Vấn đề |
|---|---|---|
| `style={{...}}` inline | **741** | Không có token nhất quán, sửa 1 chỗ không lan ra hệ thống |
| Modal tự dựng (`position:fixed; inset:0`) | **7** | Không focus trap, không khóa scroll, ESC/aria không đồng nhất |
| `<button>` thô | **65** | Bỏ qua Button của chính DS mình → mỗi nút một kiểu |
| `alert()` | **20** | Chặn luồng, không thể style, cảm giác rất nghiệp dư |
| `onMouseEnter` đổi style thủ công | **20** | Hover state viết tay thay vì CSS/`:hover` |
| `<input>` thô | **8** | Không label/error state chuẩn, a11y kém |

Đây chính xác là nguyên nhân UI "xấu và không thân thiện": **không phải thiếu component, mà là component có sẵn bị bỏ qua** và mọi thứ được vá bằng inline style.

---

## 3. Bản đồ thay thế Tempo → Astryx

### 3.1 Thay thế 1-1 (DS nội bộ → Astryx)

| Tempo | Astryx | Ghi chú |
|---|---|---|
| Button | `Button` | Có variant, size, loading sẵn |
| IconButton | `IconButton` | ✓ |
| Card | `Card` / `ClickableCard` | ClickableCard cho card bấm được |
| Badge | `Badge` | ✓ |
| Avatar / AvatarGroup | `Avatar` / `AvatarGroup` | ✓ |
| Input | `TextInput` + `Field` | Field lo label/error/help text |
| Switch | `Switch` | ✓ |
| Chip | `Token` | Astryx gọi là Token |
| Tabs | `TabList` | ✓ |
| NavItem | `Item` / `NavIcon` | Dùng trong SideNav |
| ProgressBar | `ProgressBar` | Có variant accent/success/warning/error |
| **ProgressRing** | *(không có)* | Giữ custom hoặc đổi sang ProgressBar |
| **StatTile** | *(không có)* | Compose `Card` + `Text` |

### 3.2 Thay thế có giá trị cao nhất (component tự viết → Astryx)

| Tempo hiện tại | Astryx | Vì sao đáng đổi |
|---|---|---|
| 7 modal tự dựng | **`Dialog`** | Focus trap, khóa scroll, ESC, aria — miễn phí |
| DeleteConfirm | **`AlertDialog`** | Đúng ngữ nghĩa hành động phá hủy |
| **20 × `alert()`** | **`Toast`** | Thắng lớn nhất về cảm nhận chuyên nghiệp |
| TempoAssistant | **`Chat`** | Bộ primitive dựng sẵn cho chat AI |
| UploadFlow | **`FileInput`** (`mode="dropzone"`) | Drag-drop + status error/success sẵn |
| Placeholder / SpacesPlaceholder | **`EmptyState`** | Trạng thái rỗng đúng chuẩn |
| MaterialLoading | **`Spinner`** / **`Skeleton`** | Skeleton cho cảm giác nhanh hơn |
| NotesView | **`Markdown`** | Render markdown theo style hệ thống |
| Sidebar | **`SideNav`** | Có collapsible + resizable |
| TopBar | **`TopNav`** | ✓ |
| App (khung ngoài) | **`AppShell`** | Slot sẵn cho nav/side/content |
| OverflowMenu / DropdownPill | **`DropdownMenu`** / **`MoreMenu`** | ✓ |
| FAQItem | **`Collapsible`** | ✓ |
| UsageBar (mới viết) | **`ProgressBar`** | ✓ |
| StatPill | **`Badge`** / **`StatusDot`** | ✓ |
| Toggle Monthly/Yearly | **`SegmentedControl`** | Đúng pattern hơn 2 button tự chế |
| Tooltip thủ công (`title=`) | **`Tooltip`** | ✓ |
| Banner thông báo | **`Banner`** | Cho cảnh báo hết quota |
| Tìm kiếm ở TopBar | **`PowerSearch`** / **`CommandPalette`** | Nâng cấp UX rõ rệt |
| Bảng dữ liệu | **`Table`** | density/dividers sẵn |

### 3.3 Không có sẵn — phải giữ custom

- **DotField** (canvas nền landing) — hiệu ứng riêng, giữ nguyên
- **Donut / biểu đồ Analytics** — `@astryxdesign/charts` mới chỉ có bản `@canary`, chưa ổn định
- **FlashcardStudy** (lật thẻ 3D) — logic đặc thù; có thể mượn `Carousel` cho phần điều hướng
- **ProgressRing**, **StatTile**, **Constellation**

---

## 4. Điểm chặn kỹ thuật (quan trọng)

| Vấn đề | Chi tiết |
|---|---|
| **React version** | Astryx yêu cầu **React ≥ 19.0.0**; Tempo đang chạy **18.3.1** |
| **Không có build step** | Astryx phân phối qua npm/ESM; Tempo transpile JSX trên browser bằng Babel standalone |
| **Astryx còn Beta** | v0.1.6, API có thể đổi (có codemod hỗ trợ) |

Astryx **có** đường CDN (UMD `window.Astryx` hoặc esm.sh) chạy không cần bundler — nhưng vẫn phải nâng React lên 19.

---

## 5. Ba hướng đi

### Hướng A — Nâng React 19 + Astryx qua CDN *(ít xáo trộn nhất)*
Giữ nguyên kiến trúc no-build. Đổi 2 thẻ `<script>` React sang v19, thêm CSS + UMD của Astryx, rồi thay dần từng component.
- ✅ Không cần dựng lại toàn bộ dự án; thay được từng phần, deploy liên tục
- ⚠️ Babel standalone transpile runtime vẫn chậm; React 19 có breaking change cần rà (chủ yếu `ReactDOM.render`, refs, `propTypes`)

### Hướng B — Dựng build step (Vite) + Astryx chuẩn *(bài bản nhất)*
- ✅ Tree-shaking, TypeScript, hết Babel runtime → tải nhanh hơn hẳn
- ⚠️ Phải cấu trúc lại toàn bộ 18 file JSX + đổi cách Vercel serve; rủi ro cao, mất nhiều thời gian

### Hướng C — Không dùng Astryx, chuẩn hóa DS sẵn có
Bắt buộc dùng 14 component sẵn có, xóa 741 inline style, thay `alert()` bằng toast tự viết.
- ✅ Zero rủi ro tương thích
- ⚠️ Vẫn phải tự viết Dialog/Toast/Chat/FileInput — tốn công mà chất lượng khó bằng

---

## 6. Đề xuất

**Hướng A, làm theo lát cắt ưu tiên theo tác động/công sức:**

1. **`alert()` → `Toast`** (20 chỗ) — tác động cảm nhận lớn nhất, sửa cực nhanh
2. **7 modal → `Dialog` / `AlertDialog`** — sửa luôn lỗi a11y và focus
3. **UploadFlow → `FileInput`**, **TempoAssistant → `Chat`** — 2 màn hình lõi của sản phẩm
4. **Khung app → `AppShell` + `SideNav` + `TopNav`**
5. **Dọn 741 inline style** sang token/`className` trong lúc đụng tới từng file
6. **EmptyState / Skeleton** cho các trạng thái rỗng và đang tải

Bước 1–3 đã đủ để UI "hết nghiệp dư" mà chưa cần viết lại toàn bộ.
