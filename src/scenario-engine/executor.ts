/**
 * Scenario execution engine: runs picker flow (detect → open → setDate → confirm → validate)
 * for picker-specific scenarios. Core is picker-agnostic; behavior from metadata.baseScenario.
 */

import { getScenario } from '../config/scenarioMatrix'
import { pickerRegistry } from '../picker-registry'
import type { ExecutionResult, StepLog, FailureReason, RunOptions } from './types'
import { getDefaultDatesForBaseScenario } from './behavior-map'
import { validateAfterFlow } from './validation'

function createStepLog(
  scenarioId: string,
  pickerType: string,
  strategy: StepLog['strategy'],
  outcome: 'success' | FailureReason,
  detail?: string
): StepLog {
  return {
    scenario: scenarioId,
    picker: pickerType,
    strategy,
    outcome,
    detail,
    at: Date.now(),
  }
}

function emitLog(log: StepLog, onStep?: (l: StepLog) => void): void {
  onStep?.(log)
}

/**
 * Runs the picker flow for a picker-specific scenario.
 * Uses metadata.baseScenario to determine behavior (dates/range); executes
 * detect → open → setDate → confirm → validate; classifies failures and returns structured logs.
 */
export function runPickerScenario(scenarioId: string, options: RunOptions = {}): ExecutionResult {
  const { scope = typeof document !== 'undefined' ? document : undefined, startDate, endDate, onStep } = options
  const doc = scope instanceof Document ? scope : scope?.ownerDocument

  const logs: StepLog[] = []
  const push = (log: StepLog) => {
    logs.push(log)
    emitLog(log, onStep)
  }

  const scenario = getScenario(scenarioId)
  if (!scenario) {
    const log = createStepLog(scenarioId, 'unknown', 'detect', 'detection_failed', 'Scenario not found')
    push(log)
    return {
      scenarioId,
      pickerType: 'unknown',
      baseScenario: '',
      success: false,
      failureReason: 'detection_failed',
      logs,
    }
  }

  const metadata = scenario.metadata
  const pickerType = metadata?.pickerType ?? ''
  const baseScenario = metadata?.baseScenario ?? ''

  if (!metadata?.pickerType) {
    const log = createStepLog(scenarioId, pickerType || scenarioId, 'detect', 'detection_failed', 'Not a picker-specific scenario')
    push(log)
    return {
      scenarioId,
      pickerType,
      baseScenario,
      success: false,
      failureReason: 'detection_failed',
      logs,
    }
  }

  const dates = startDate != null && endDate != null
    ? { start: startDate, end: endDate }
    : getDefaultDatesForBaseScenario(baseScenario)
  const start = startDate ?? dates.start
  const end = endDate ?? dates.end

  let detection = doc ? pickerRegistry.detect(doc) : null

  push(createStepLog(scenarioId, pickerType, 'detect', detection ? 'success' : 'detection_failed', detection ? undefined : 'No picker found in scope'))
  if (!detection) {
    return {
      scenarioId,
      pickerType,
      baseScenario,
      success: false,
      failureReason: 'detection_failed',
      logs,
    }
  }

  if (detection.pickerType !== pickerType) {
    push(createStepLog(scenarioId, pickerType, 'detect', 'detection_failed', `Expected ${pickerType}, found ${detection.pickerType}`))
    return {
      scenarioId,
      pickerType,
      baseScenario,
      success: false,
      failureReason: 'detection_failed',
      logs,
      detection,
    }
  }

  try {
    pickerRegistry.open(detection)
    push(createStepLog(scenarioId, pickerType, 'open', 'success'))
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)
    push(createStepLog(scenarioId, pickerType, 'open', 'interaction_failed', detail))
    return {
      scenarioId,
      pickerType,
      baseScenario,
      success: false,
      failureReason: 'interaction_failed',
      logs,
      detection,
    }
  }

  try {
    pickerRegistry.setDate(detection, start, start.getTime() !== end.getTime() ? end : undefined)
    push(createStepLog(scenarioId, pickerType, 'setDate', 'success'))
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)
    push(createStepLog(scenarioId, pickerType, 'setDate', 'interaction_failed', detail))
    return {
      scenarioId,
      pickerType,
      baseScenario,
      success: false,
      failureReason: 'interaction_failed',
      logs,
      detection,
    }
  }

  try {
    pickerRegistry.confirm(detection)
    push(createStepLog(scenarioId, pickerType, 'confirm', 'success'))
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)
    push(createStepLog(scenarioId, pickerType, 'confirm', 'interaction_failed', detail))
    return {
      scenarioId,
      pickerType,
      baseScenario,
      success: false,
      failureReason: 'interaction_failed',
      logs,
      detection,
    }
  }

  try {
    const pickerValid = pickerRegistry.validate(detection)
    if (!pickerValid.valid) {
      push(createStepLog(scenarioId, pickerType, 'validate', 'validation_failed', pickerValid.message))
      return {
        scenarioId,
        pickerType,
        baseScenario,
        success: false,
        failureReason: 'validation_failed',
        logs,
        detection,
        validation: {
          inputValueUpdated: false,
          modelUpdated: false,
          payloadCorrect: false,
          message: pickerValid.message,
        },
      }
    }

    const validationResult: NonNullable<ExecutionResult['validation']> = doc
      ? validateAfterFlow(detection, start, end, doc)
      : {
          inputValueUpdated: pickerValid.valid,
          modelUpdated: pickerValid.valid,
          payloadCorrect: pickerValid.valid,
        }

    const validOk = validationResult.inputValueUpdated && validationResult.modelUpdated && validationResult.payloadCorrect
    if (!validOk) {
      push(createStepLog(scenarioId, pickerType, 'validate', 'validation_failed', validationResult.message ?? 'Input/model/payload check failed'))
      return {
        scenarioId,
        pickerType,
        baseScenario,
        success: false,
        failureReason: 'validation_failed',
        logs,
        detection,
        validation: validationResult,
      }
    }

    push(createStepLog(scenarioId, pickerType, 'validate', 'success'))
    return {
      scenarioId,
      pickerType,
      baseScenario,
      success: true,
      logs,
      detection,
      validation: validationResult,
    }
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)
    push(createStepLog(scenarioId, pickerType, 'validate', 'silent_failure', detail))
    return {
      scenarioId,
      pickerType,
      baseScenario,
      success: false,
      failureReason: 'silent_failure',
      logs,
      detection,
    }
  }
}
