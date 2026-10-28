import cssContent from './index.css?inline';

const STYLE_ID = 'relly-ui-stylesheet';

export function injectStyles(targetRoot?: Document | ShadowRoot): void {
  const root = targetRoot || (typeof document !== 'undefined' ? document : null);
  if (!root) return;

  // Check if style already exists in this root
  if ('getElementById' in root && root.getElementById(STYLE_ID)) return;
  if ('querySelector' in root && root.querySelector(`#${STYLE_ID}`)) return;

  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = cssContent;

  if ('head' in root && root.head) {
    root.head.appendChild(styleEl);
  } else {
    root.appendChild(styleEl);
  }
}
