# Eagles Inventory — Design System & Interface Patterns

## 1. Product Identity & Feel

- **Product:** Eagles Inventory (نظام إيجلز لإدارة المخزون والمستودعات).
- **Domain:** Enterprise warehouse logistics, material requisitions, inbound procurement invoices, inventory cycle counting, stock adjustments, and role-based user directory.
- **Feel:** Authoritative, industrial-grade enterprise portal. Deep navy slate structural frame (`#0f172a`), royal eagle blue primary (`#1d4ed8`), crisp bordered white cards on `#f8fafc` canvas, and native RTL Arabic typography.
- **Language & Direction:** Native Arabic (RTL), `direction="rtl"`, `arEG` locale.

---

## 2. Depth Strategy & Spatial Grid

- **Depth Strategy:** Borders-first with subtle transparent lift (`variant="outlined"`, `border: 1px solid #e2e8f0`, `box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03)`).
- **Base Spacing Grid:** 4px / 8px multiples.
    - Micro gaps (icons & tags): 6px – 8px
    - Form & control gaps: 12px – 16px
    - Card & table padding: 16px – 24px
    - Page section rhythm: 20px – 28px
- **Border Radius:**
    - Small (tags, badges, inline controls): 6px – 8px
    - Medium (inputs, buttons, dropdowns, table): 8px – 10px
    - Large (cards, metric tiles): 12px – 14px
    - Container (modals, hero banners): 16px

---

## 3. Typography & Hierarchy

- **Typeface:** `'IBM Plex Sans Arabic', 'Cairo', system-ui, -apple-system, sans-serif`
- **Ratio & Scale:**
    - Metric Heroes: 24px – 32px / 700 / `font-variant-numeric: tabular-nums`
    - Page Titles (H2): 22px – 24px / 700 / `#0f172a`
    - Section Titles (H4): 16px – 18px / 600–700 / `#0f172a`
    - Body & Table Data: 13px – 14px / 400–500 / `#0f172a`
    - Labels & Subtitles: 12px – 13px / 400–500 / `#64748b` (Text `type="secondary"`)
    - Badges & Micro-meta: 11px – 12px / 500 / centered
- **Tabular Numbers:** Applied to counters, dates, quantities, and balances to avoid layout shifts.

---

## 4. Color Palette & Semantic Tokens

- **Canvas:** `#f8fafc` (Slate 50)
- **Surfaces & Cards:** `#ffffff` (Pure white)
- **Primary / Eagle Blue:** `#1d4ed8` (Hover: `#1e40af`, Active: `#1e3a8a`, Soft Tint: `#eff6ff`)
- **Structural Frame / Sidebar:** `#0f172a` (Slate 900), Border: `rgba(255, 255, 255, 0.08)`
- **Dividers & Borders:** `#e2e8f0` (Slate 200)
- **Semantic Colors:**
    - **Success / Active:** `#059669` (Emerald 600, Soft Tint: `#ecfdf5`)
    - **Warning / Pending:** `#d97706` (Amber 600, Soft Tint: `#fffbeb`)
    - **Danger / Deactivated / Delete:** `#dc2626` (Red 600, Soft Tint: `#fef2f2`)
    - **Info / Logistics:** `#7c3aed` (Purple 600, Soft Tint: `#faf5ff`)
- **Text:**
    - Primary text: `#0f172a`
    - Secondary text: `#64748b`
    - Inverted / Light text: `#f8fafc`

---

## 5. Reusable Component Patterns

### Root ConfigProvider Baseline

```tsx
<ConfigProvider
    direction="rtl"
    locale={arEG}
    theme={{
        token: {
            fontFamily:
                "'IBM Plex Sans Arabic', 'Cairo', system-ui, -apple-system, sans-serif",
            colorPrimary: '#1d4ed8',
            colorInfo: '#2563eb',
            colorSuccess: '#059669',
            colorWarning: '#d97706',
            colorError: '#dc2626',
            borderRadius: 8,
            wireframe: false,
        },
        components: {
            Button: { controlHeight: 38, borderRadius: 8 },
            Input: { controlHeight: 38, borderRadius: 8 },
            Table: { borderRadius: 8 },
            Card: { borderRadius: 12 },
        },
    }}
>
    <AntdApp>{children}</AntdApp>
</ConfigProvider>
```

### Metric Card Pattern

- Ant Design `Card` with `variant="outlined"`, `borderColor: '#e2e8f0'`.
- Header label: 12px/500 text-secondary.
- Main value: 24–32px/700 with `tabular-nums`.
- Side icon badge: 44×44px with 10px radius and tinted background.

### Data Table Pattern

- Ant Design `Table` with `rowKey="id"`, `size="middle"`.
- User Avatar with initial + Name + secondary Email (with `direction: ltr`).
- Status tags: `Tag` with `color="success"` or `color="warning"`, pill radius (12px).
- Date cells formatted in Arabic with tabular digits.
- Actions column with tooltipped icon buttons (`EditOutlined`, `DeleteOutlined`).

### Modal & Dialogs Pattern

- Ant Design `Modal` with `destroyOnHidden={true}`, `centered={true}`.
- Title includes an icon badge + bold title text.
- Form inputs with icon prefixes (`MailOutlined`, `LockOutlined`, `UserOutlined`).
- Primary submit button: `#1d4ed8` fill, 38–42px height.

### Deletion Safety Pattern

- Ant Design `Popconfirm` with danger button styling and explicit Arabic confirmation warnings.
- Backend safeguards preventing self-deletion and cascading constraint errors.
