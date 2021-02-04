import * as React from 'react';

const DEFAULT_CLASS_NAMES = {
  sticky: 'ReactStickyHeader__sticky',
  stuck: 'ReactStickyHeader__stuck',
  lastStuck: 'ReactStickyHeader__lastStuck',
};

/**
 * A `<Sticky>` component sticks its content to the top of the parent scrolling element
 * as it scrolls by. Subsequent `<Sticky>` elements are stacked below it.
 *
 * To use it, nest any number of `<Sticky>` elements inside a `<StickyHost>`, which manages
 * the stacking behavior.
 *
 * ## Example
 *
 * ```tsx
 * <App style={{overflow: 'scroll'}}>
 *   <header>Site header</header>
 *   <Sticky><NavigationBar /></Sticky>
 *   <main>
 *     <div>Some content</div>
 *     <Sticky><Alert>A sticky alert that sticks below the nav bar</Alert></Sticky>
 *   <main>
 * </App>
 * ```
 *
 * ## Styling
 *
 * `<Sticky>` applies the following classes by default:
 *
 * * **ReactStickyHeader__stuck**: applied to elements which are currently stuck.
 * * **ReactStickyHeader__lastStuck**: applied to the last element in the stack of
 *   stuck elements, which is useful for applying a shadow or border to the entire
 *   stack.
 * * **ReactStickyHeader__sticky**: applied to all `<Sticky>` elements.
 *
 * ### Recommended styles
 *
 * See `src/recommended.css`. The currently recommended approach is to copy these styles
 * into your app and override them as you see fit.
 *
 * ### Overriding default class names
 *
 * To override default class names call `Sticky.setClasses(classes)`, which plays nicely
 * with CSS modules:
 *
 * ```tsx
 * import Sticky, { StickyCssClasses } from '@xper/react-sticky-header';
 * import appClasses from 'app.module.css';
 *
 * Sticky.setClassNames(appClasses as StickyCssClasses);
 * ```
 *
 * ## Design
 *
 * _Why is `<ScrollHost>` needed?_ `<ScrollHost>` helps improve performance, in that
 * `<ScrollHost>` only sets up the parent scrolling element once, as opposed to each
 * `<Sticky>` element having to detect which scrolling element it's in and then maybe
 * register a listener to it.
 */
export default class Sticky extends React.Component<
  JSX.IntrinsicElements['div']
> {
  private static classNames = DEFAULT_CLASS_NAMES;

  static setClassNames(classNames: StickyClassNames) {
    for (const key of Object.keys(
      Sticky.classNames
    ) as (keyof StickyClassNames)[]) {
      Sticky.classNames[key] = classNames[key];
    }
  }

  static className(className: keyof StickyClassNames) {
    return Sticky.classNames[className];
  }

  render() {
    const { className, style, ...props } = this.props;
    return (
      <div
        className={`${Sticky.className('sticky')} ${className || ''}`}
        style={{ position: 'sticky', ...style }}
        {...props}
      />
    );
  }
}

/** Class names used for sticky components. */
export type StickyClassNames = typeof DEFAULT_CLASS_NAMES;

/**
 * `<StickyHost>` manages the stickiness of descendant `<Sticky>` components.
 */
export class StickyHost extends React.Component<JSX.IntrinsicElements['div']> {
  private root = React.createRef<HTMLDivElement>();
  private dispose?: () => void;

  componentDidMount() {
    this.setupScrollListener();
  }

  componentWillUnmount() {
    this.dispose?.();
  }

  private setupScrollListener() {
    const host = findScrollingAncestor(this.root.current!);
    console.log({ host });

    if (!host) return;
    const scrollListener = this.onHostScroll.bind(this);
    const target = host === document.scrollingElement ? window : host;
    target.addEventListener('scroll', scrollListener);
    this.dispose = () => {
      target?.removeEventListener('scroll', scrollListener);
    };
  }

  private onHostScroll(e: Event) {
    const scrollingElement = e.target as HTMLElement;
    const scrollTop = scrollingElement.scrollTop;

    let stackHeight = 0;
    let lastStuckEl: HTMLElement | null = null;

    // Recalculate sticky classes.
    for (const stickyEl of Array.from(
      scrollingElement.getElementsByClassName(Sticky.className('sticky'))
    ) as HTMLElement[]) {
      const stuck = scrollTop + stackHeight >= stickyEl.offsetTop;
      stickyEl.style.top = `${stackHeight}px`;
      stickyEl.classList.toggle(Sticky.className('stuck'), stuck);
      stickyEl.classList.remove(Sticky.className('lastStuck'));
      stackHeight += stickyEl.clientHeight;
      if (stuck) lastStuckEl = stickyEl;
    }
    lastStuckEl?.classList.add(Sticky.className('lastStuck'));
  }

  render() {
    return <div ref={this.root} {...this.props} />;
  }
}

const isScrollable = (style: CSSStyleDeclaration) =>
  ['auto', 'scroll'].some((value) =>
    [style.overflow, style.overflowY, style.overflowX].includes(value)
  );

const findScrollingAncestor = (element: HTMLElement): Element | null => {
  let style = getComputedStyle(element);
  if (style.position === 'fixed') return document.scrollingElement;

  const excludeStaticParent = style.position === 'absolute';

  let parent: HTMLElement | null = element;
  while (parent) {
    style = getComputedStyle(parent);
    if (excludeStaticParent && style.position === 'static') continue;
    if (isScrollable(style)) return parent;
    parent = parent.parentElement;
  }
  return document.scrollingElement;
};
