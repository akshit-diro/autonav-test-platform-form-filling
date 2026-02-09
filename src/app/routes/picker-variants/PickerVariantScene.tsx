import { getScenario } from '../../../config/scenarioMatrix'
import { VariantPresetsLayout } from './VariantPresetsLayout'
import { VariantFromToLayout } from './VariantFromToLayout'
import { VariantDualLayout } from './VariantDualLayout'
import { VariantInlineLayout } from './VariantInlineLayout'

interface PickerVariantSceneProps {
  scenarioId: string
}

/**
 * Renders the appropriate layout for a picker-specific scenario (DS1-FLATPICKR, etc.)
 * using metadata.baseScenario and metadata.pickerType. Only DS1, DS2, DS3, DS6 have
 * picker variants; month-year and year-only (DS4, DS5) have no variants.
 */
export function PickerVariantScene({ scenarioId }: PickerVariantSceneProps) {
  const scenario = getScenario(scenarioId)
  if (!scenario?.metadata) return null

  const { baseScenario, pickerType } = scenario.metadata
  const picker = pickerType ?? ''

  switch (baseScenario) {
    case 'DS1':
      return <VariantPresetsLayout pickerType={picker} />
    case 'DS2':
      return <VariantFromToLayout pickerType={picker} />
    case 'DS3':
      return <VariantDualLayout pickerType={picker} />
    case 'DS6':
      return <VariantInlineLayout pickerType={picker} />
    default:
      return <VariantPresetsLayout pickerType={picker} />
  }
}
