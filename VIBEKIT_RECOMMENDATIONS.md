# Vibekit Improvement Recommendations

Issues discovered while building DreamDocs on the vibekit foundation.

## Critical: Shoelace Integration is Broken

### Problem
The `scripts/setup-shoelace.js` copies Shoelace files from `node_modules` to `client/vendor/shoelace/`, but these files contain bare module imports like:

```javascript
import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
```

Browsers cannot resolve bare module specifiers. This results in:
```
TypeError: Module name, 'lit' does not resolve to a valid URL.
```

### Solutions (pick one)

**Option A: Add a build step (recommended)**
```javascript
// scripts/build-client.js
import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['client/app.js'],
  bundle: true,
  format: 'esm',
  outdir: 'client/dist',
});
```

Update `index.html` to load `/dist/app.js` instead of `/app.js`.

**Option B: Use import maps**
```html
<script type="importmap">
{
  "imports": {
    "lit": "/vendor/lit/lit.all.min.js",
    "lit/": "/vendor/lit/",
    "@lit/reactive-element": "/vendor/lit/reactive-element.js",
    "@lit/reactive-element/": "/vendor/lit/"
  }
}
</script>
```

This requires also copying Lit's bundled distribution to vendor.

**Option C: Use CDN**
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/shoelace-autoloader.js"></script>
```

Simple but adds external dependency.

---

## Medium: Unused Demo Code

The vibekit template includes demo features that should be removed or clearly marked:

- `server/storage/items.ts` - Demo CRUD storage
- `server/routes/api/items.ts` - Demo API routes
- `server/utils/llm.ts` - LLM abstraction (not used by default)
- `client/views/items/` - Demo item list/form views

**Recommendation:** Either remove these or move to an `examples/` directory.

---

## Medium: Missing Form Builder Utilities

Creating Shoelace components requires verbose boilerplate:

```javascript
const input = document.createElement('sl-input');
input.label = 'Email';
input.type = 'email';
input.placeholder = 'Enter email';
input.addEventListener('sl-input', handleChange);
```

**Recommendation:** Add a helper library:

```javascript
// client/lib/shoelace.js
export function slInput({ label, type, placeholder, onChange, ...props }) {
  const el = document.createElement('sl-input');
  Object.assign(el, { label, type, placeholder, ...props });
  if (onChange) el.addEventListener('sl-input', onChange);
  return el;
}
```

---

## Low: Server-Client Path Matching Duplication

Both `server/utils/http.ts` and `client/lib/router.js` implement nearly identical path matching logic for extracting route parameters.

**Recommendation:** Create a shared utility or document that this is intentional for isomorphic routing.

---

## Low: No TypeScript for Client

The server uses TypeScript but the client uses plain JavaScript. This creates an inconsistency and loses type safety benefits on the client.

**Recommendation:** Either:
- Add TypeScript to client with the esbuild build step
- Or document that plain JS is intentional for simplicity

---

## Summary

| Issue | Severity | Fix Effort |
|-------|----------|------------|
| Shoelace bare imports don't work | Critical | Medium (add build step) |
| Unused demo code | Medium | Low (delete files) |
| Missing form utilities | Medium | Low (add helper) |
| Duplicated path matching | Low | Low (refactor or document) |
| No client TypeScript | Low | Medium (add to build) |
