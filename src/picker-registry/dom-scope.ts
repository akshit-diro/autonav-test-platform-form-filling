/**
 * DOM scope utilities for picker detection across document, shadow roots, and iframes.
 * Detection must be resilient to portals, shadow DOM, and iframe embedding.
 * No hardcoded delays; purely structural traversal.
 */

export type PickerRoot = Document | ShadowRoot

/**
 * Collects all roots where a picker might render: the given document,
 * all descendant shadow roots, and all same-origin iframe documents.
 * querySelectorAll on Document only returns elements in the document tree
 * (not shadow trees), so we explicitly descend into each element's shadowRoot
 * and each iframe's contentDocument.
 */
export function getSearchableRoots(scope: Document | Element): PickerRoot[] {
  const doc = scope instanceof Document ? scope : scope.ownerDocument
  if (!doc) return []

  const roots: PickerRoot[] = []
  const seen = new WeakSet<Document | ShadowRoot>()

  function addRoot(r: PickerRoot): void {
    if (seen.has(r)) return
    seen.add(r)
    roots.push(r)
    try {
      const list = r.querySelectorAll('*')
      list.forEach((el) => {
        if (el.shadowRoot) addRoot(el.shadowRoot)
        if (el.tagName === 'IFRAME') {
          try {
            const subDoc = (el as HTMLIFrameElement).contentDocument
            if (subDoc) addRoot(subDoc)
          } catch {
            /* cross-origin iframe */
          }
        }
      })
    } catch {
      /* access denied */
    }
  }

  addRoot(doc)
  return roots
}

/**
 * Runs a querySelector in the given root. Works for both Document and ShadowRoot.
 */
export function querySelectorInRoot(root: PickerRoot, selector: string): Element | null {
  return root.querySelector(selector)
}

/**
 * Runs querySelectorAll in the given root.
 */
export function querySelectorAllInRoot(root: PickerRoot, selector: string): Element[] {
  return Array.from(root.querySelectorAll(selector))
}

/**
 * Checks if an element matches any of the class patterns (string substring or RegExp).
 */
export function elementMatchesClassPatterns(element: Element, patterns: Array<string | RegExp>): boolean {
  const className = element.className ?? ''
  if (typeof className !== 'string') return false
  return patterns.some((p) => (typeof p === 'string' ? className.includes(p) : p.test(className)))
}

/**
 * Checks if element has any of the given data attributes present.
 */
export function elementHasDataAttributes(element: Element, attributes: string[]): boolean {
  return attributes.some((attr) => element.hasAttribute(attr) || element.hasAttribute(`data-${attr}`))
}
