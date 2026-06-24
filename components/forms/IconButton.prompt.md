Icon-only square button — toolbars, card overflow (`⋮`) menus, notification bells, view-mode toggles.

```jsx
<IconButton label="More" variant="ghost"><MoreVerticalIcon/></IconButton>
<IconButton label="Grid view" variant="accent" active><GridIcon/></IconButton>
```

Variants: `ghost` (default, transparent), `solid` (raised), `accent` (violet tint, for active tools). Sizes `sm|md|lg` → 30/36/42px. Always pass `label` for accessibility.
