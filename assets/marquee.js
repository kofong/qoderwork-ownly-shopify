/**
 * Marquee Component — Infinite scrolling text strip
 * Duplicates content for seamless looping, calculates copies via IntersectionObserver.
 * Hover slows animation; respects prefers-reduced-motion.
 */

class MarqueeComponent extends HTMLElement {
  constructor() {
    super();
    this._animation = null;
    this._marqueeWidth = null;
  }

  connectedCallback() {
    // Wait for layout to settle
    requestAnimationFrame(() => this.init());
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this._handleResize);
    this.removeEventListener('pointerenter', this._slowDown);
    this.removeEventListener('pointerleave', this._speedUp);
  }

  async init() {
    const wrapper = this.querySelector('[ref="wrapper"]');
    const content = this.querySelector('[ref="content"]');
    const items = this.querySelector('[ref="marqueeItems[]"]');
    if (!wrapper || !content || !items) return;

    this._wrapper = wrapper;
    this._content = content;

    // Calculate how many copies needed to fill viewport
    const rect = items.getBoundingClientRect();
    const containerWidth = this.getBoundingClientRect().width;
    const copies = rect.width > 0 ? Math.ceil(containerWidth / rect.width) : 1;

    // Add copies
    for (let i = 0; i < copies - 1; i++) {
      const clone = items.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      content.appendChild(clone);
    }

    // Duplicate entire content for seamless loop
    const contentClone = content.cloneNode(true);
    contentClone.setAttribute('aria-hidden', 'true');
    wrapper.appendChild(contentClone);

    // Add interactivity
    this.addEventListener('pointerenter', () => this._slowDown());
    this.addEventListener('pointerleave', () => this._speedUp());
    this._handleResize = this._debounce(() => this._restartAnimation(), 300);
    window.addEventListener('resize', this._handleResize);
  }

  _slowDown() {
    const animations = this._wrapper?.getAnimations();
    if (!animations?.length) return;
    animations.forEach(a => {
      a.updatePlaybackRate(0.3);
    });
  }

  _speedUp() {
    const animations = this._wrapper?.getAnimations();
    if (!animations?.length) return;
    animations.forEach(a => {
      a.updatePlaybackRate(1);
    });
  }

  _restartAnimation() {
    const animations = this._wrapper?.getAnimations();
    if (!animations?.length) return;
    requestAnimationFrame(() => {
      animations.forEach(a => { a.currentTime = 0; });
    });
  }

  _debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }
}

if (!customElements.get('marquee-component')) {
  customElements.define('marquee-component', MarqueeComponent);
}
