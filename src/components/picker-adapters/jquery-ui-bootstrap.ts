/**
 * Must run before jquery-ui-dist so the UMD bundle sees global jQuery.
 * Import this first, then jquery-ui-dist, in JQueryUIDatepickerAdapter.
 */
import $ from 'jquery'
if (typeof window !== 'undefined') {
  ;(window as unknown as { jQuery: JQueryStatic; $: JQueryStatic }).jQuery = $
  ;(window as unknown as { $: JQueryStatic }).$ = $
}
