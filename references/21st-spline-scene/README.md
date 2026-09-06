# 21st.dev reference: Spline Scene

This folder is a read-only implementation reference. Nothing here is wired into
the portfolio application.

## Source metadata

- Component: **Spline Scene**
- Author: **Serafim** (`@serafimcloud`)
- Component page: <https://21st.dev/@serafimcloud/components/splite>
- Spline community source: <https://app.spline.design/community/file/615b9422-9985-43f6-8593-d7d7bc3b0be1>
- Published date shown by 21st.dev: **2025-01-05**
- License shown by 21st.dev: **MIT License**
- Dependencies shown by 21st.dev:
  - `@splinetool/runtime`
  - `@splinetool/react-spline`

## Files exposed by 21st.dev

The copy-action menu lists two files:

- `splite.tsx`
- `demo.tsx`

The component page labels these as `Component.tsx` and `Usage.tsx`.
`demo.tsx` in this folder is a formatting-normalized transcription of the fully
visible `Usage.tsx` source.

After explicit user approval, the last remaining daily free view was used to
unlock `Component.tsx`. Its complete displayed source is saved as `splite.tsx`
in this folder. The confirmation dialog stated there would be **0 free views
remaining after this action**. The header counter did not refresh immediately,
so that predicted remainder was not independently re-verified.

The component is a small client-side wrapper that lazy-loads
`@splinetool/react-spline` and renders it inside React `Suspense`. Its loading
fallback expects a project-defined `.loader` CSS class; that CSS was not included
among the two files exposed on this component page.

## Preview observations

- This is a single reusable hero/card component, not a full-page template.
- The card uses a two-column layout: gradient headline and supporting copy on
  the left; an embedded Spline robot scene on the right.
- The palette is black with white/neutral text and a white spotlight.
- The robot pose changed between passive captures, confirming an animated scene.
  Pointer-driven behavior was not tested.
- The reference can be adapted to the portfolio's charcoal/black and purple
  system by tinting the spotlight and surrounding accents while preserving the
  existing RZ/AURA copy, ID/EN controls, and routes.

## Copy prompt status

The **Copy prompt** action was invoked and briefly displayed `Copying prompt`,
then returned to its normal state. The supported browser clipboard API returned
an empty clipboard, so the prompt text could not be verified or saved. It was
not attempted again after the free views reached zero, and no prompt instructions
were executed.
