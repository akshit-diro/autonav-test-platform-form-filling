/**
 * Post-flow validation: input value updated, model/state updated, form payload correct.
 * Uses picker registry validate() and optional DOM checks. Works across portals and shadow roots.
 */

import type { DetectionResult, ValidationResult as PickerValidationResult } from '../picker-registry'
import type { ExecutionResult } from './types'
import { pickerRegistry } from '../picker-registry'
import { getSearchableRoots, querySelectorInRoot } from '../picker-registry'

const formatIso = (d: Date): string => d.toISOString().slice(0, 10)

/**
 * Validates after picker flow:
 * - Input value updated: registry validate() and/or visible input has expected value.
 * - Model updated: same as input for most pickers.
 * - Form payload correct: values that would be submitted match expected (checks common input selectors in scope).
 */
export function validateAfterFlow(
  context: DetectionResult,
  expectedStart: Date,
  expectedEnd: Date,
  scope: Document | Element
): NonNullable<ExecutionResult['validation']> {
  const doc = scope instanceof Document ? scope : scope.ownerDocument ?? document
  const pickerValid: PickerValidationResult = pickerRegistry.validate(context)

  const expectedStartStr = formatIso(expectedStart)
  const expectedEndStr = formatIso(expectedEnd)

  let inputValueUpdated = pickerValid.valid
  let payloadCorrect = false

  const roots = getSearchableRoots(doc)
  const dateInputSelectors = [
    'input[id="date-start"]',
    'input[data-testid="date-start"]',
    'input[name="date-start"]',
    'input[id="date-from"]',
    'input[data-testid="date-from"]',
    'input[id="date-end"]',
    'input[data-testid="date-end"]',
    'input[name="date-end"]',
    'input[id="date-to"]',
    'input[data-testid="date-to"]',
    '.flatpickr-input',
    'input[type="date"]',
  ]
  const seen = new WeakSet<HTMLInputElement>()
  const inputs: HTMLInputElement[] = []
  for (const root of roots) {
    for (const sel of dateInputSelectors) {
      try {
        const el = querySelectorInRoot(root, sel) as HTMLInputElement | null
        if (el && !seen.has(el)) {
          seen.add(el)
          inputs.push(el)
        }
      } catch {
        /* skip */
      }
    }
  }

  if (inputs.length > 0) {
    const startInput = inputs[0]
    const endInput = inputs.length > 1 ? inputs[1] : startInput
    const startVal = (startInput.value ?? '').trim().slice(0, 10)
    const endVal = (endInput.value ?? '').trim().slice(0, 10)
    inputValueUpdated = inputValueUpdated || startVal === expectedStartStr
    payloadCorrect = startVal === expectedStartStr && (expectedStartStr === expectedEndStr ? true : endVal === expectedEndStr)
  } else if (pickerValid.value) {
    const v = (pickerValid.value ?? '').slice(0, 10)
    inputValueUpdated = true
    payloadCorrect = v === expectedStartStr || v.includes(expectedStartStr)
  }

  return {
    inputValueUpdated,
    modelUpdated: inputValueUpdated,
    payloadCorrect,
    message: pickerValid.message,
  }
}
