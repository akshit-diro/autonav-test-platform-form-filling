/**
 * Picker registry implementation: detection across roots (document, shadow, iframe)
 * and strategy-based open/setDate/confirm/validate. No hardcoded delays; picker
 * logic isolated via PickerConfig.
 */

import type {
  PickerConfig,
  DetectionResult,
  PickerRoot,
  ValidationResult,
  OpenStrategy,
  ConfirmStrategy,
} from './types'
import { getSearchableRoots, querySelectorInRoot, querySelectorAllInRoot, elementMatchesClassPatterns, elementHasDataAttributes } from './dom-scope'

function getWindowForRoot(root: PickerRoot): Window | null {
  if (root instanceof Document) return root.defaultView
  const doc = (root as ShadowRoot).host?.ownerDocument
  return doc?.defaultView ?? null
}

function runDetectionInRoot(root: PickerRoot, config: PickerConfig): DetectionResult | null {
  const { detection } = config
  let confidence = 0.5
  let triggerElement: Element | undefined
  let panelElement: Element | undefined

  if (detection.selectors?.length) {
    for (const sel of detection.selectors) {
      try {
        const el = querySelectorInRoot(root, sel)
        if (el) {
          triggerElement = panelElement = el
          confidence = 0.9
          break
        }
      } catch {
        /* invalid selector */
      }
    }
    if (!triggerElement && !panelElement) return null
  }

  if (detection.classPatterns?.length) {
    if (triggerElement ?? panelElement) {
      const el = triggerElement ?? panelElement!
      if (!elementMatchesClassPatterns(el, detection.classPatterns)) confidence -= 0.1
    } else {
      const all = querySelectorAllInRoot(root, '*')
      const match = all.find((el) => elementMatchesClassPatterns(el, detection.classPatterns!))
      if (match) {
        triggerElement = panelElement = match
        confidence = 0.85
      } else return null
    }
  }

  if (detection.dataAttributes?.length && (triggerElement || panelElement)) {
    const el = triggerElement ?? panelElement!
    if (!elementHasDataAttributes(el, detection.dataAttributes)) confidence -= 0.05
  }

  if (detection.globalCheck) {
    const win = getWindowForRoot(root)
    const hasGlobal = win && (win as unknown as Record<string, unknown>)[detection.globalCheck] != null
    if (hasGlobal) confidence = Math.min(1, confidence + 0.1)
  }

  return {
    pickerType: config.pickerType,
    root,
    triggerElement,
    panelElement,
    confidence,
  }
}

function findTrigger(root: PickerRoot, strategy: OpenStrategy): Element | null {
  const sel = strategy.triggerSelector ?? strategy.fallbackTriggerSelector
  if (!sel) return null
  const el = querySelectorInRoot(root, sel)
  if (el) return el
  if (strategy.fallbackTriggerSelector && strategy.fallbackTriggerSelector !== sel) {
    return querySelectorInRoot(root, strategy.fallbackTriggerSelector)
  }
  return null
}

function executeOpen(context: DetectionResult, config: PickerConfig): void {
  const { root, triggerElement } = context
  const strategy = config.openStrategy
  const fallbacks = config.fallbackStrategies?.open ?? []

  function tryOpen(s: OpenStrategy): boolean {
    if (s.type === 'already_inline') return true
    const trigger = triggerElement ?? findTrigger(root, s)
    if (!trigger) return false

    if (s.type === 'focus_input' || s.type === 'focus_then_click') {
      ;(trigger as HTMLInputElement).focus?.()
      if (s.type === 'focus_then_click') trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      return true
    }
    if (s.type === 'click_trigger') {
      trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      return true
    }
    if (s.type === 'api_open' && s.apiMethod) {
      const api = (trigger as unknown as Record<string, () => void>)[s.apiMethod]
      if (typeof api === 'function') {
        api.call(trigger)
        return true
      }
    }
    return false
  }

  if (tryOpen(strategy)) return
  for (const fb of fallbacks) {
    if (tryOpen(fb)) return
  }
}

function executeSetDate(context: DetectionResult, date: Date, endDate?: Date, config?: PickerConfig): void {
  if (!config) return
  const { root, triggerElement } = context
  const strategy = config.setDateStrategy
  const format = strategy.inputFormat ?? 'yyyy-MM-dd'

  function simpleFormat(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return format.replace('yyyy', String(y)).replace('MM', m).replace('dd', day)
  }

  if (strategy.type === 'input_value' && strategy.inputSelector) {
    const input = querySelectorInRoot(root, strategy.inputSelector) as HTMLInputElement | null
    if (input) {
      input.value = simpleFormat(date)
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
    if (endDate && strategy.endInputSelector) {
      const endInput = querySelectorInRoot(root, strategy.endInputSelector) as HTMLInputElement | null
      if (endInput) {
        endInput.value = simpleFormat(endDate)
        endInput.dispatchEvent(new Event('input', { bubbles: true }))
        endInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }
    return
  }

  if (strategy.type === 'click_day' && strategy.daySelector) {
    const cells = querySelectorAllInRoot(root, strategy.daySelector)
    const dateStr = simpleFormat(date)
    const target = cells.find((el) => {
      const d = el.getAttribute('data-date') ?? (el as HTMLElement).textContent?.trim()
      return d === dateStr || el.getAttribute('aria-label')?.includes(dateStr)
    })
    if (target) {
      target.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    }
    if (endDate) {
      const endStr = simpleFormat(endDate)
      const endTarget = cells.find((el) => {
        const d = el.getAttribute('data-date') ?? (el as HTMLElement).textContent?.trim()
        return d === endStr || el.getAttribute('aria-label')?.includes(endStr)
      })
      if (endTarget) endTarget.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    }
    return
  }

  if (strategy.type === 'api_setDate' && strategy.apiMethod && triggerElement) {
    const api = (triggerElement as unknown as Record<string, (d: Date) => void>)[strategy.apiMethod]
    if (typeof api === 'function') {
      api.call(triggerElement, date)
      if (endDate && strategy.endInputSelector) {
        const endEl = querySelectorInRoot(root, strategy.endInputSelector)
        if (endEl) {
          const endApi = (endEl as unknown as Record<string, (d: Date) => void>)[strategy.apiMethod!]
          if (typeof endApi === 'function') endApi.call(endEl, endDate)
        }
      }
    }
  }
}

function executeConfirm(context: DetectionResult, config: PickerConfig): void {
  const { root } = context
  const strategy = config.confirmStrategy
  const fallbacks = config.fallbackStrategies?.confirm ?? []

  function tryConfirm(s: ConfirmStrategy): boolean {
    if (s.type === 'none') return true
    const sel = s.buttonSelector ?? s.fallbackButtonSelector
    if (!sel) return false
    const btn = querySelectorInRoot(root, sel)
    if (btn) {
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      return true
    }
    if (s.type === 'press_enter') {
      const active = (root instanceof Document ? root : (root as ShadowRoot).host.ownerDocument).activeElement
      if (active) {
        active.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        return true
      }
    }
    return false
  }

  if (tryConfirm(strategy)) return
  for (const fb of fallbacks) {
    if (tryConfirm(fb)) return
  }
}

function executeValidate(context: DetectionResult, config: PickerConfig): ValidationResult {
  const { root, triggerElement } = context
  const strategy = config.validateStrategy

  if (strategy.type === 'input_has_value') {
    const sel = strategy.inputSelector ?? (triggerElement ? null : undefined)
    const input = (sel ? querySelectorInRoot(root, sel) : triggerElement) as HTMLInputElement | null | undefined
    if (!input) return { valid: false, message: 'Input not found' }
    const value = input?.value?.trim()
    return { valid: !!value, value: value ?? undefined }
  }

  if (strategy.type === 'class_has_selected' && strategy.selectedDaySelector) {
    const el = querySelectorInRoot(root, strategy.selectedDaySelector)
    return { valid: !!el }
  }

  if (strategy.type === 'aria_selected' && strategy.selectedDaySelector) {
    const el = querySelectorInRoot(root, strategy.selectedDaySelector)
    return { valid: !!el }
  }

  return { valid: true }
}

export function createPickerRegistry(configs: PickerConfig[]) {
  const byType = new Map(configs.map((c) => [c.pickerType, c]))

  return {
    detect(scope?: Document | Element): DetectionResult | null {
      const doc = scope instanceof Document ? scope : scope?.ownerDocument ?? (typeof document !== 'undefined' ? document : undefined)
      if (!doc) return null
      const roots = getSearchableRoots(doc)
      let best: DetectionResult | null = null
      for (const root of roots) {
        for (const config of configs) {
          const result = runDetectionInRoot(root, config)
          if (result && (!best || result.confidence > best.confidence)) best = result
        }
      }
      return best
    },

    open(context: DetectionResult): void {
      const config = byType.get(context.pickerType)
      if (config) executeOpen(context, config)
    },

    setDate(context: DetectionResult, date: Date, endDate?: Date): void {
      const config = byType.get(context.pickerType)
      executeSetDate(context, date, endDate, config)
    },

    confirm(context: DetectionResult): void {
      const config = byType.get(context.pickerType)
      if (config) executeConfirm(context, config)
    },

    validate(context: DetectionResult): ValidationResult {
      const config = byType.get(context.pickerType)
      if (!config) return { valid: false, message: 'Unknown picker type' }
      return executeValidate(context, config)
    },
  }
}

export type PickerRegistry = ReturnType<typeof createPickerRegistry>
