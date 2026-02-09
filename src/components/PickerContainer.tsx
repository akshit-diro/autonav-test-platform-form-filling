import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { getPickerContainerStrategy } from '../config/pickerContainer'
import { PICKER_CONTAINER_STYLES } from './pickerContainerStyles'

export interface PickerContainerProps {
  children: ReactNode
}

/**
 * When USE_IFRAME_PICKER or USE_SHADOW_DOM is enabled, renders children inside
 * an iframe or shadow root so the date picker is isolated. Otherwise renders
 * children in normal DOM. Used only in selected scenarios (Presets, From-To,
 * Dual Calendar, Inline Calendar).
 */
export function PickerContainer({ children }: PickerContainerProps) {
  const strategy = getPickerContainerStrategy()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const rootRef = useRef<ReturnType<typeof createRoot> | null>(null)
  const [mounted, setMounted] = useState(false)

  if (strategy === 'normal') {
    return <>{children}</>
  }

  // Shadow DOM: attach shadow root, inject styles, render children with a second React root
  if (strategy === 'shadow') {
    useEffect(() => {
      const host = hostRef.current
      if (!host) return
      const shadow = host.attachShadow({ mode: 'open' })
      const style = document.createElement('style')
      style.textContent = PICKER_CONTAINER_STYLES
      shadow.appendChild(style)
      const wrap = document.createElement('div')
      wrap.setAttribute('data-picker-root', 'shadow')
      shadow.appendChild(wrap)
      const root = createRoot(wrap)
      root.render(children)
      rootRef.current = root
      setMounted(true)
      return () => {
        root.unmount()
        rootRef.current = null
      }
    }, [strategy])

    useEffect(() => {
      if (!mounted || !rootRef.current) return
      rootRef.current.render(children)
    }, [mounted, children])

    return (
      <div
        ref={hostRef}
        className="picker-container picker-container--shadow"
        data-testid="picker-container-shadow"
      />
    )
  }

  // Iframe: create iframe, on load inject styles and render children into its document
  if (strategy === 'iframe') {
    useEffect(() => {
      const iframe = iframeRef.current
      if (!iframe) return
      const onLoad = () => {
        const doc = iframe.contentDocument
        if (!doc?.body) return
        const style = doc.createElement('style')
        style.textContent = PICKER_CONTAINER_STYLES
        doc.head.appendChild(style)
        const wrap = doc.createElement('div')
        wrap.setAttribute('data-picker-root', 'iframe')
        doc.body.appendChild(wrap)
        const root = createRoot(wrap)
        root.render(children)
        rootRef.current = root
        setMounted(true)
      }
      iframe.addEventListener('load', onLoad)
      // about:blank iframe may already be loaded
      if (iframe.contentDocument?.body) {
        onLoad()
      }
      return () => {
        iframe.removeEventListener('load', onLoad)
        rootRef.current?.unmount()
        rootRef.current = null
      }
    }, [strategy])

    useEffect(() => {
      if (!mounted || !rootRef.current) return
      rootRef.current.render(children)
    }, [mounted, children])

    return (
      <iframe
        ref={iframeRef}
        className="picker-container picker-container--iframe"
        title="Date picker"
        data-testid="picker-container-iframe"
        style={{ border: '1px solid var(--bank-border, #d4d8dc)', borderRadius: 4, minHeight: 280 }}
      />
    )
  }

  return <>{children}</>
}
