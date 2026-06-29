import { useState } from "react";

// Generic, reusable column sorting for dashboard tables.
//
// `accessors` maps a column key -> function(row) => comparable value
// (string | number | null). Clicking a header cycles: asc -> desc -> off.
//
// `defaultCompare` (optional) is a comparator applied when no column header is
// active, letting a table define its own initial ordering. Clicking a header
// takes over; the table reverts to `defaultCompare` when sorting is cleared.
//
// Returns:
//   sort      → current { key, dir } or null
//   toggle    → (key) => void   (wire to a header click)
//   sortRows  → (rows) => rows  (returns a sorted copy; pass any subset,
//                                handy for grouped tables like the HOD view)
export function useSort(accessors, defaultCompare = null) {
  const [sort, setSort] = useState(null);

  const compare = (av, bv) => {
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number" && typeof bv === "number") return av - bv;
    return String(av).localeCompare(String(bv), undefined, { numeric: true });
  };

  const sortRows = (rows) => {
    if (!sort) return defaultCompare ? [...rows].sort(defaultCompare) : rows;
    const acc = accessors[sort.key];
    if (!acc) return defaultCompare ? [...rows].sort(defaultCompare) : rows;
    const arr = [...rows].sort((a, b) => compare(acc(a), acc(b)));
    return sort.dir === "desc" ? arr.reverse() : arr;
  };

  const toggle = (key) =>
    setSort((s) =>
      !s || s.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null
    );

  return { sort, toggle, sortRows };
}
