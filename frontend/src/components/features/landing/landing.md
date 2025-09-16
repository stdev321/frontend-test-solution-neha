# Landing Page Components Analysis

This document outlines the purpose and functionality of each component within the `frontend/src/components/features/landing/` directory to identify potential overlaps.

## 1. `LandingAnimatedTitle.jsx`

*   **Purpose:** Renders the main animated title "Simply Better Medicine."
*   **Functionality:**
    *   Defines the words (`TITLE_WORDS`) and their corresponding colors (`TITLE_COLORS`) based on the theme's `brandColors`.
    *   Uses `useState` (`visibleWords`) and `useEffect` to animate the words appearing sequentially with a delay (`ANIMATION_DELAY`).
    *   Applies `transform` and `opacity` transitions for the animation effect.
    *   Uses `display: 'inline-flex'` and `gap` to space the words.
    *   Applies a negative `em` margin to the period (`.`) to counteract the `gap` and bring it closer to "Medicine".
    *   Renders within a `<Box>` constrained to 80% width.
*   **Overlap:** Standalone component for the title animation. No direct functional overlap with others, but provides the main visual heading.

## 2. `LandingConditionalContent.jsx`

*   **Purpose:** Displays different content (image, text, button) based on whether a "patient" or a specific "provider" type is selected.
*   **Functionality:**
    *   Receives `activeUserType`, `providerType`, and `getProviderImage` function as props.
    *   Returns `null` if `activeUserType` is not set.
    *   Determines image source, alt text, descriptive text (`textContent`), and button text/link based on `activeUserType` and `providerType`.
    *   Renders a `<Paper>` containing an image (`<Box component="img">`) and text content (`Typography`, `Button`).
    *   The containing `<Box>` has `id="user-content-area"` which might be used for scrolling targets.
    *   Uses `useNavigate` for the "Learn More" button action.
    *   Includes simple fade/translate animation based on `activeUserType`.
*   **Overlap:** This component is designed to work closely with `LandingUserTypeSelector`. It consumes the state managed by the parent page and updated via `LandingUserTypeSelector`. It was likely removed from the main `LandingPage` during refactoring.

## 3. `LandingEvidenceSection.jsx`

*   **Purpose:** Displays four evidence cards (Radiology, Pathology, Dermatology, Cardiology) with statistics and citations, along with a "Back to Top" button.
*   **Functionality:**
    *   Defines `evidenceItems` array containing data (icon, title, text, citation) for the four cards.
    *   Uses MUI `Grid` for responsive layout (1, 2, or 4 columns).
    *   Renders each item within a styled `<Paper>` component, applying hover effects (transform, shadow).
    *   Includes an icon section with a colored background derived from `CARD_ICON_COLOR`.
    *   Renders a "Back to Top" button (`<Box>` with `KeyboardArrowUpIcon`) that calls `window.scrollTo({ top: 0, behavior: 'smooth' })`.
*   **Overlap:** This component was likely part of the original `LandingPage` content that was moved to `EvidencePage1.jsx` and `EvidencePage2.jsx`. The card styling is similar to other card components but uses `<Paper>` instead of `<Card>`. Contains its own "scroll to top" logic.

## 4. `LandingFeatureCards.jsx`

*   **Purpose:** Displays four feature cards (Real-time Analysis, Multi-modal Integration, Collaborative Validation, Continuous Learning) with descriptions and icons.
*   **Functionality:**
    *   Defines `featureCardsData` array with data (title, description, icon, link) for the four cards.
    *   Defines `CARD_COLORS` for the card backgrounds.
    *   Contains a `renderCard` helper function to create each styled MUI `<Card>` with a `<CardActionArea>`.
    *   Uses a specific `Box` with `display: 'grid'` and fixed `aspectRatio` for layout instead of MUI `Grid`.
    *   Includes a title "How VirtualMD AI Enhances Diagnostic Accuracy".
    *   Card clicks currently log to the console (`handleCardClick`).
*   **Overlap:** This component was likely part of the original `LandingPage` content moved to `FeaturesPage1.jsx` and `FeaturesPage2.jsx`. The card rendering logic (`renderCard`) is very similar to the navigation cards remaining on `LandingPage.jsx` and the cards in `FeaturesPage1/2`.

## 5. `LandingGetStartedSection.jsx`

*   **Purpose:** Renders the main "Try Now" call-to-action button.
*   **Functionality:**
    *   Uses `useAuth` to check `currentUser`.
    *   Uses `useNavigate` to handle button clicks:
        *   Navigates to `/chat` if a user is logged in.
        *   Navigates to `/login` if no user is logged in.
    *   Renders a single large, styled MUI `<Button>` within a `<Container>`.
    *   Uses a specific bright purple color.
*   **Overlap:** Standalone component for the main CTA button. Was present on `LandingPage.jsx` before recent edits removed it. The scroll logic in `LandingPage.jsx` previously targeted this button.

## 6. `LandingHeroAndIntro.jsx`

*   **Purpose:** Displays the main hero section with the background image, overlay, title ("Revolutionizing Healthcare..."), tagline ("AI-powered medical chatroom..."), and the "Try it out" button that links to `/dashboard`.
*   **Functionality:**
    *   Imports and uses `HeroImage`.
    *   Applies `linear-gradient` overlays (light purple and dark) to the background image. The dark overlay opacity was recently adjusted.
    *   Uses MUI `Stack` to position the title and tagline text over the image.
    *   Text uses specific font sizes and `textShadow`.
    *   Renders a "Try it out" button (distinct from the "Try Now" button in `LandingGetStartedSection`) that navigates to `/dashboard`. This button uses brand colors and specific styling.
*   **Overlap:** Provides the primary visual introduction and a call-to-action button. It's currently used on `LandingPage.jsx`. It was temporarily moved to `EvidencePage1.jsx` but then restored.

## 7. `LandingInfoBox.jsx`

*   **Purpose:** Displays an informational box with an icon, title ("The Future of Healthcare is Here"), and descriptive paragraph about VirtualMD AI.
*   **Functionality:**
    *   Renders content within a styled `<Paper>` component.
    *   Uses `flex` layout to position an `<InfoIcon>` (inside a styled circular `<Box>`) next to the text content (`Typography`).
    *   Uses brand colors for the icon background and title.
*   **Overlap:** Seems like a standalone informational section. It's not currently imported or used in `LandingPage.jsx` or the new Evidence/Features pages, suggesting it might be unused or intended for a different location.

## 8. `LandingPage.jsx` (Located in `/pages/`, not `/components/features/landing/`)

*   **Note:** This file is the main page component located in `frontend/src/pages/`, not within the `components/features/landing` directory. Its analysis is included for context.
*   **Purpose:** Serves as the main landing page structure, coordinating various components.
*   **Functionality:**
    *   Imports and renders `Header`, `LandingAnimatedTitle`, `LandingHeroAndIntro`, and `Footer`.
    *   Defines `navCardsData` for the four main navigation cards (Evidence-Based, Expert Performance, etc.).
    *   Renders these four cards using MUI `<Card>` and `<CardActionArea>`, handling navigation via `useNavigate` on click.
    *   Includes state (`showInitialDownArrow`, `showUpDownArrows`) and `useEffect` hooks to manage the visibility of floating scroll arrows.
    *   Includes the `scrollPage` function using `requestAnimationFrame` for smooth scrolling (up scrolls to top, down scrolls towards where the now-removed `LandingGetStartedSection` button *was*).
    *   Renders the floating scroll arrows (`KeyboardArrowUpIcon`, `KeyboardArrowDownIcon`) wrapped in `<Fade>` transitions.
*   **Overlap:** Acts as the orchestrator for the current landing page view. It duplicates the card rendering logic seen in `LandingFeatureCards.jsx` for its navigation cards. It contains the scroll logic that interacts with the (now removed) `LandingGetStartedSection`.

## 9. `LandingUserTypeSelector.jsx`

*   **Purpose:** Renders the "Patients" and "Providers" (with dropdown) buttons used for selecting the user type to display conditional content.
*   **Functionality:**
    *   Receives `activeUserType`, `providerType`, `anchorEl`, `menuOpen`, and various callback functions (`onUserTypeSelect`, `onProviderMenuClick`, `onProviderMenuClose`) as props.
    *   Renders a "Patients" button.
    *   Renders a "split button" for Providers:
        *   One part displays the current `providerType` and calls `onUserTypeSelect('provider')`.
        *   The other part has a dropdown arrow (`KeyboardArrowDownIcon`) and calls `onProviderMenuClick`.
    *   Renders an MUI `<Menu>` component controlled by `anchorEl` and `menuOpen` props.
    *   Maps `PROVIDER_TYPES` to `<MenuItem>` components within the menu, calling `onProviderMenuClose` with the selected type when an item is clicked.
    *   Applies active styling based on `activeUserType`.
*   **Overlap:** Works directly with `LandingConditionalContent`. Designed to update state in a parent component which then affects `LandingConditionalContent`. Likely removed from the main `LandingPage` during refactoring.

---

**Summary of Potential Overlaps/Issues:**

*   **Card Rendering:** Logic for rendering styled cards is duplicated/similar in `LandingPage.jsx` (for nav cards) and `LandingFeatureCards.jsx`. Ideally, a single reusable `FeatureCard` or `InfoCard` component could be created in `components/common` or similar.
*   **Unused Components:** `LandingConditionalContent.jsx`, `LandingEvidenceSection.jsx`, `LandingFeatureCards.jsx`, `LandingUserTypeSelector.jsx`, and `LandingInfoBox.jsx` are not currently imported or used in the main `LandingPage.jsx` or the new Evidence/Features pages. They contain content/functionality that was either moved or is now potentially obsolete. `LandingGetStartedSection.jsx` was also removed from `LandingPage.jsx`.
*   **Scroll Logic Dependency:** The `scrollPage` function in `LandingPage.jsx` still attempts to find the button from the removed `LandingGetStartedSection.jsx` for its downward scroll calculation, leading to fallback behavior. This needs correction based on the desired scroll target.
*   **Component Placement:** `LandingPage.jsx` is incorrectly listed in the user query as being in the `components/features/landing` directory; it resides in `pages`.
