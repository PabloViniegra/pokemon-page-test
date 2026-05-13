# Suggestions Tab Icon Path Consistency

Date: 2026-05-13

## Lesson

For stroke-only tab icons (`fill="none"`), use a path designed for outlined rendering.
Solid-style or ad hoc star paths can look broken or cramped when converted to stroke-only display.

## Application

In `TeamBuilderView.vue`, replacing the previous `Suggestions` icon path with a standard outline sparkles path fixed the visual inconsistency while preserving current icon sizing and color classes.
