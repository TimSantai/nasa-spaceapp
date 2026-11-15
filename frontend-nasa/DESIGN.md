# AgriPluse Design System — Extracted from Reference

## Color Palette

### Primary
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#1a7a6d` | Primary brand — buttons, icons, active nav, accents |
| `--color-primary-hover` | `#15665b` | Primary hover state |
| `--color-primary-dark` | `#0f5347` | CTA banner background, deep contrast |
| `--color-primary-light` | `#e8f5f2` | Light teal tint for badges, selected states |

### Neutral
| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `#111827` | Near-black headings, primary text |
| `--color-text-secondary` | `#6b7280` | Body text, descriptions |
| `--color-text-muted` | `#9ca3af` | Captions, metadata |
| `--color-bg-page` | `#f7f8fa` | Page canvas background |
| `--color-bg-card` | `#ffffff` | Card/surface background |
| `--color-border` | `#e5e7eb` | Card borders, dividers |
| `--color-border-subtle` | `#f3f4f6` | Very subtle dividers |

### Semantic
| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#1a7a6d` | Same as primary — checkmarks, positive |
| `--color-warning` | `#d97706` | Amber warnings, caution indicators |
| `--color-danger` | `#dc2626` | Error, high risk |
| `--color-info` | `#2563eb` | Informational |

### Accent
| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent-amber` | `#d97706` | Stat highlights, soil fertility |
| `--color-accent-water` | `#0891b2` | Hydrometeorology, water metrics |

## Typography

- **Font Family**: `'Inter', system-ui, -apple-system, sans-serif`
- **Heading Weight**: 700 (bold), with italic emphasis for key words
- **Body Weight**: 400
- **Section Label**: 12px uppercase tracking-wider, with teal checkmark prefix `✓`

### Scale
| Level | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| H1 | 36px | 700 | 1.2 | -0.025em |
| H2 | 24px | 700 | 1.3 | -0.025em |
| H3 | 18px | 600 | 1.4 | -0.015em |
| Body | 14px | 400 | 1.6 | 0 |
| Small | 12px | 400 | 1.5 | 0 |
| Label | 11px | 600 | 1.4 | 0.05em |

## Spacing Scale
- `4px` / `8px` / `12px` / `16px` / `24px` / `32px` / `48px` / `64px` / `80px`

## Border Radius
- Cards: `16px` (rounded-2xl)
- Buttons (pill): `9999px` (rounded-full)
- Icon circles: `9999px`
- Input fields: `12px`
- Images: `16px`
- Small badges: `9999px`

## Shadows
- `--shadow-xs`: `0 1px 2px rgba(0,0,0,0.04)`
- `--shadow-sm`: `0 1px 3px rgba(0,0,0,0.06)`
- `--shadow-md`: `0 4px 12px rgba(0,0,0,0.06)`
- `--shadow-lg`: `0 12px 28px rgba(0,0,0,0.10)`

## Component Patterns

### Buttons
- **Primary**: Pill shape, solid teal bg, white text, right arrow icon
- **Secondary**: Pill shape, white bg, teal border, teal text
- **CTA Banner**: White outline pill on dark teal background

### Cards
- White background, subtle border `#e5e7eb`, radius 16px, subtle shadow
- Internal padding 24-32px
- No card-in-card nesting

### Section Labels
- Small uppercase tracking-wider text
- Teal slash/checkmark prefix (`✓ SECTION NAME`)
- Tight gap (8px) to heading below

### Stat Displays
- Large bold number (24-32px, font-weight 800)
- Small unit/label below (12px, color secondary)

### Navigation
- Clean horizontal nav with medium weight text
- Active: teal underline or pill highlight
- Pill-shaped "Contact Us" CTA button
