# Decision: Fix Evolution Card Size with Fixed Stage Width

Date: 2026-05-11

## Context

Evolution cards had inconsistent widths due to content-driven sizing (longer names produced wider cards).

## Decision

Normalize size at the layout level:

- each stage column has a fixed width (`7rem`, `8.5rem` on `sm+`)
- card containers stretch to column width (`width: 100%`)

## Why

- keeps all cards visually uniform
- avoids brittle per-card text truncation hacks
- preserves existing tree structure and GSAP animation selectors

## Consequences

- long names wrap inside the card instead of widening it
- evolution columns stay predictable for connector alignment
