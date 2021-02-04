# React Sticky Headers

Pixel-perfect stackable sticky headers for React!

![](https://media1.giphy.com/media/jjN4kxU04p9YBPoPB4/giphy.gif)

## Install

```bash
# With yarn:
yarn install @xper/react-sticky-headers

# With npm:
npm install @xper/react-sticky-headers
```

## Usage

```tsx
import Sticky, { StickyHost } from '@xper/react-sticky-headers';
// Import the default styles (optional).
import '@xper/react-sticky-headers/dist/style.css';

export default function MyApp() {
  return (
    // Wrap your scrolling content with <StickyHost>, then add <Sticky> children.
    <StickyHost>
      {/* This sticky will stick to the top of the page. */}
      <Sticky>...</Sticky>
      {/* This non-sticky content will be scrolled past. */}
      <div>...</div>
      {/* This sticky content will stack below the first sticky. */}
      <Sticky>...</Sticky>
    </StickyHost>
  );
}
```

## More documentation

See the docs in [src/index.tsx](src/index.tsx).
