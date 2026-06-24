Big-number KPI tile for dashboards. Grid several across the top of an analytics view.

```jsx
<StatTile label="Total Study Time" value="128h 45m" delta="18%" trend="up"
          caption="vs May 5 – May 18" icon={<ClockIcon/>} iconTone="violet" />
```

`value` is a node so you can format units. Trend arrow + color come from `trend`.
