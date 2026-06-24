Text field — search bars, forms, filters. Pass `iconLeft={<SearchIcon/>}` for the global search pattern.

```jsx
<Input iconLeft={<SearchIcon/>} placeholder="Search study spaces, notes, flashcards…" />
<Input size="sm" invalid placeholder="Required" />
```

Sizes `sm|md|lg` → 34/40/46px. Focus shows a violet ring; `invalid` switches to the danger border.
