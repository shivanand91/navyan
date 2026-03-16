# Navyan Frontend Design System

## Direction

Navyan now uses a dark-first premium product language that blends:

- Perplexity-style clarity and information hierarchy
- Grok-style atmosphere, contrast, and futuristic presence
- Warm premium gold for action and trust
- Controlled violet and cyan for depth and signal, not noise

The system is split into two modes:

- Public experience: cinematic, immersive, high-contrast, brand-forward
- Dashboard experience: calmer, denser, workflow-focused, still premium

## Color Tokens

Dark-first core:

- `background`: `#0B0D10`
- `backgroundSecondary`: `#111418`
- `tertiary`: `#171B21`
- `surface`: `#14181D`
- `elevated`: `#1A2027`
- `sidebar`: `#0F1318`
- `border`: `rgba(255,255,255,0.08)`
- `softBorder`: `rgba(255,255,255,0.05)`
- `textPrimary`: `#F5F7FA`
- `textSecondary`: `#B7C0CC`
- `textMuted`: `#7E8794`

Accent system:

- `primary`: `#D4A85F`
- `secondary`: `#E3B76F`
- `accent`: `#8B5CF6`
- `plum`: `#6D28D9`
- `cyan`: `#67E8F9`
- `success`: `#22C55E`
- `warning`: `#F59E0B`
- `danger`: `#F43F5E`

Light mode:

- warm ivory background layers
- stone-toned panels
- charcoal text
- same gold accent preserved in softer surfaces

## Typography

Fonts:

- Body: `Manrope`
- Display/headings: `Space Grotesk`

Rules:

- display headings use tighter tracking and higher density
- body copy uses wider leading for readability
- labels use uppercase microcopy with tracked spacing
- dashboard titles stay compact, public headlines stay expansive

## Spacing and Layout

- Public sections use `py-14` to `py-20`
- Cards use `24px` to `28px` radius
- Dashboard shells use `navyan-panel` to keep calmer information grouping
- Public headers and hero compositions use more whitespace than dashboard content

## Surface Rules

Primary utility classes:

- `.navyan-shell`: full app background with layered radial depth
- `.navyan-card`: premium card surface with soft highlight
- `.navyan-panel`: elevated workspace shell for dashboards and grouped content
- `.navyan-hero-panel`: cinematic glass-like surface for hero and premium CTA blocks
- `.navyan-pill`: small premium gold badge
- `.navyan-grid-mask`: subtle grid treatment for premium sections
- `.navyan-spotlight`: blurred accent light for selected sections

## Buttons

Variants in `src/components/ui/button.jsx`:

- `solid`: primary gold CTA
- `outline`: elevated dark/light secondary action
- `ghost`: low-emphasis navigation action
- `subtle`: tinted accent button
- `success`: positive workflow action
- `danger`: destructive workflow action
- `icon`: compact icon action for toolbars

## Cards and Badges

Cards:

- `Card`: general content grouping with hover-lift and premium shadow
- `MetricCard`: KPI/stat-focused dashboard tile

Status badges:

- application and workflow states map to gold, violet, cyan, green, amber, and rose signals
- subdued neutral states stay readable without disappearing

## Forms

Inputs and textareas use:

- dark premium field surfaces
- soft inner highlights
- gold-tinted focus ring
- rounded `2xl` geometry
- muted placeholders with strong contrast

## Motion Principles

- fade-up with blur-to-sharp reveal for sections
- restrained hover lift on cards and buttons
- progress animations on timelines and bars
- no bounce, no neon pulsing, no unnecessary loops
- easing favors premium, calm movement over playful motion

Primary motion utilities:

- `RevealInView`
- `framer-motion` entrance transitions on hero and section content

## 3D Strategy

Implemented via:

- `three`
- `@react-three/fiber`
- `@react-three/drei`

Current usage:

- `HeroScene` provides an abstract premium orbital scene
- used on the public home hero
- used on login/signup for consistent futuristic depth

3D rules:

- abstract, calm, expensive-looking
- no game UI styling
- no chaotic animation
- supports the brand instead of overpowering content

## Dashboard Patterns

Student:

- readiness and profile completion
- active internship tracker
- document quick actions
- milestone and reward cues
- next-move guidance

Admin:

- analytics header
- status distribution charts
- workflow pulse snapshot
- recent candidate movement
- service pipeline visibility

## Navigation

Public:

- sticky glass navbar
- premium CTA emphasis
- mobile drawer navigation via `vaul`

Dashboard:

- premium vertical rail on desktop
- mobile drawer for smaller screens
- command palette via `cmdk`

## Reusable Premium Components

Located in `src/components/premium`:

- `HeroScene`
- `SectionHeading`
- `RevealInView`
- `MetricCard`
- `CommandPalette`
- `MobileDrawerNav`
- `TestimonialCarousel`

## Responsive Behavior

- public hero collapses into content-first layout on smaller screens
- dashboards retain rail on desktop and drawer on mobile
- content grids degrade from 3-4 columns down to 1 clean column
- 3D hero falls back to lighter gradient-only composition on smaller screens

## Implementation Notes

- routes are lazy-loaded in `src/App.jsx`
- major visual chunks are split so 3D and chart surfaces load only where needed
- the design system is tokenized in `tailwind.config.mjs`
- global surfaces and layered backgrounds live in `src/index.css`
