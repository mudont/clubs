# UI/UX Principles

## Accessibility
- Follow WCAG 2.1 AA guidelines
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

## Design Patterns
- Use consistent component patterns
- Implement loading states
- Use proper error states
- Maintain responsive design
- Follow modern UI/UX practices

## Styling Standards
- **Component styles:** Use CSS Modules (`.module.css`) for all React component styles to ensure local scoping and maintainability.
- **Layout & design system:** Use Tailwind CSS utility classes for layout, spacing, color, and design system consistency.
- **Dynamic/themed styles:** Use CSS-in-JS (e.g., Emotion, styled-components) only for components that require dynamic or theme-based styling.
- **Best Practices:**
  - Co-locate `.module.css` files with their components.
  - Use Tailwind for rapid prototyping and consistent design tokens.
  - Avoid global CSS except for base styles and Tailwind imports.
  - Prefer CSS Modules for custom component styles over plain `.css` files.
  - Use CSS-in-JS sparingly, only when dynamic logic is required.
