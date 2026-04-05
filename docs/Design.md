# Design System Document: The Collaborative Canvas

## 1. Overview & Creative North Star: "The Ethereal Workshop"
The "Ethereal Workshop" is our creative North Star. Most Scrum tools feel like spreadsheets—rigid, gray, and uninspiring. This design system rejects the "enterprise-standard" aesthetic in favor of a high-end, editorial experience. We create focus through **Atmospheric Depth** rather than structural rigidity.

By utilizing oversized typography, intentional white space, and a "soft-touch" philosophy, we transform a high-stakes estimation session into a fluid, collaborative ritual. We break the template look by using asymmetrical layouts for participant lists and overlapping card elements that suggest a physical, tabletop presence.

## 2. Colors & Surface Philosophy
Our palette moves away from flat white and heavy grays. We use a sophisticated lavender-tinted base (`background: #f9f4ff`) to provide warmth and reduce eye strain during long grooming sessions.

### The "No-Line" Rule
**Borders are a failure of hierarchy.** Within this system, 1px solid borders are prohibited for sectioning. Contrast and containment must be achieved through:
- **Tonal Shifts:** Placing a `surface-container-highest` card on a `surface-container-low` background.
- **Negative Space:** Using generous padding to define the edges of a functional area.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers.
- **Base Layer:** `surface` (#f9f4ff) for the main application backdrop.
- **Sectional Layer:** `surface-container-low` (#f3eeff) for secondary sidebars or participant trays.
- **Action Layer:** `surface-container-lowest` (#ffffff) for the poker cards themselves, creating a "pop" of pure white against the tinted background.

### The "Glass & Gradient" Rule
To add visual "soul," primary action areas (like the "Reveal Cards" button) should utilize a subtle linear gradient from `primary` (#4652b0) to `primary-container` (#8c99fc) at a 135-degree angle. Floating modals or "Who's Voting" overlays must use Glassmorphism: `surface-variant` at 60% opacity with a `24px` backdrop-blur.

## 3. Typography: Editorial Authority
We pair **Plus Jakarta Sans** (Display/Headlines) with **Manrope** (Body/Labels) to balance tech-forward modernism with high readability.

- **The Power of Scale:** Use `display-lg` for the final point average reveal. It should feel like a headline in a premium magazine—confident and clear.
- **Functional Clarity:** `title-md` (Manrope, 1.125rem) is the workhorse for participant names and card values, providing a sturdy, professional weight.
- **Hierarchical Contrast:** Always pair a `headline-sm` title with `body-sm` metadata in `on-surface-variant` to create a clear visual "anchor" for the eye.

## 4. Elevation & Depth
We eschew traditional drop shadows for **Tonal Layering**. Depth is a feeling, not a line.

- **The Layering Principle:** To lift a voting card, do not add a shadow. Instead, transition from a `surface-container` background to a `surface-container-lowest` card. The subtle shift in hex value creates a "soft lift."
- **Ambient Shadows:** For floating elements (like an avatar picker), use a "Cloud Shadow": `box-shadow: 0 20px 40px rgba(46, 42, 80, 0.06)`. The tint is derived from `on-background` (#2e2a50) to ensure the shadow feels like a natural obstruction of light.
- **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in high-contrast modes), use `outline-variant` (#aea8d7) at **15% opacity**. It should be felt, not seen.

## 5. Components

### Voting Cards (The Hero Component)
- **Geometry:** `rounded-md` (1.5rem) for a friendly, approachable feel.
- **State Change:** When a card is "Selected," do not just change the border. Fill the container with `secondary-container` (#85f6e5) and transition the text to `on-secondary-container`. This "energetic" teal signals action.
- **Layout:** Cards should be arranged in a non-linear "fanned" layout or an asymmetrical grid to mimic a real deck of cards.

### Playful Avatars
- **Style:** Minimalist geometric shapes (circles, soft squares) using the `tertiary-fixed` palette.
- **Interaction:** On hover, avatars should scale by 1.1x and display a `tooltip` using the `inverse-surface` (#0d072e) background for maximum contrast.

### Buttons
- **Primary:** Gradient-filled (`primary` to `primary-container`), `rounded-full` (9999px), and `title-sm` typography.
- **Secondary:** Transparent background with a `Ghost Border` and `primary` colored text.
- **Forced Spacing:** Buttons must have a minimum horizontal padding of `2rem` to maintain the "High-End Editorial" look.

### Input Fields (Story URL / Title)
- **Style:** Forgo the box. Use a `surface-container-highest` background with a bottom-only 2px "thick" accent in `outline-variant`. On focus, the bottom accent transitions to `primary`.

## 6. Do’s and Don’ts

### Do:
- **Do** use `display-lg` for "revealed" numbers to create a moment of celebration.
- **Do** use `surface-dim` for "Empty State" card slots to suggest where a card *should* go.
- **Do** lean into `xl` (3rem) rounded corners for main container wraps to soften the "app" feel.

### Don’t:
- **Don’t** use a divider line between participants. Use `1.5rem` of vertical white space instead.
- **Don’t** use pure black (#000000) for text. Use `on-surface` (#2e2a50) to keep the palette sophisticated and "deep."
- **Don’t** use "Standard" blue. Use our `primary` (#4652b0) which has a hint of indigo to feel more premium and custom.