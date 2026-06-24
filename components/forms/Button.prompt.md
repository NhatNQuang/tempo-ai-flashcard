Primary action control — use for any user-triggered action; `primary` is the violet gradient CTA, reserve one per view.

```jsx
<Button variant="primary" iconLeft={<UploadIcon/>}>Upload</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost" size="sm">View all</Button>
```

Variants: `primary` (gradient CTA, glows on hover), `secondary` (raised surface), `ghost` (transparent, nav-like), `outline` (violet hairline), `danger` (red). Sizes `sm|md|lg` → 32/40/48px. Pass `loading` for a spinner, `fullWidth` to stretch.
