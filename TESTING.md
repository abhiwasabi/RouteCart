# RouteCart automated regression tests

This package moves the classifier and route optimizer into shared modules so the app and the automated tests execute the same logic.

## One-time setup

From the RouteCart project folder:

```bash
npm install --save-dev tsx
```

## Run all RouteCart tests

```bash
npx tsx --test tests/*.test.ts
```

The classifier suite currently contains 205 unique validated shopping inputs and runs each against both Oviedo and Coral Ridge, plus parser checks.

The optimizer suite checks that:
- every required department is retained,
- duplicate items in one department stay grouped,
- item order inside a department is stable,
- obviously inefficient routes are improved,
- frozen items are preferred later when practical,
- cold-item handling remains a soft preference rather than a hard rule.

When adding a new bug fix, add the item to `tests/classifier-regression.test.ts` so the same regression cannot silently return later.
