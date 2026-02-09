import { PDFDocument, StandardFonts } from 'pdf-lib'
import { addDays } from 'date-fns'
import { formatDate } from '../config/dateLocale'

/** Fixed timestamp so same inputs produce identical PDF bytes. */
const FIXED_DATE = new Date('2020-01-01T00:00:00.000Z')

/** Fake account info — fixed for deterministic output. */
const FAKE_ACCOUNT = {
  holderName: 'Test Account Holder',
  accountNumber: '**** 4567',
  sortCode: '12-34-56',
  branch: 'Test Branch',
}

/**
 * Deterministic fake transactions for a date range.
 * Same (start, end) always returns the same list.
 */
function getPredictableTransactions(start: Date, end: Date): Array<{ date: Date; description: string; amount: number }> {
  const out: Array<{ date: Date; description: string; amount: number }> = []
  const descriptions = ['Payment - Merchant A', 'Transfer In', 'Payment - Merchant B', 'Refund', 'Transfer Out', 'Fee', 'Interest']
  let d = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  let i = 0
  while (d <= endOnly) {
    const descIndex = i % descriptions.length
    const amount = ((i * 17 + 3) % 41) - 20
    out.push({ date: new Date(d), description: descriptions[descIndex], amount })
    d = addDays(d, 1)
    i++
  }
  return out
}

/**
 * Generates a PDF report in the browser. Same (start, end) produces identical bytes.
 * Includes date range, fake account info, and predictable fake transactions.
 */
export async function generateDateRangeReport(start: Date, end: Date): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setCreationDate(FIXED_DATE)
  doc.setModificationDate(FIXED_DATE)

  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const margin = 50
  const bodySize = 10
  const lineHeight = bodySize * 1.3
  const titleSize = 16

  let currentPage = doc.addPage([612, 792])
  let y = currentPage.getHeight() - margin

  function drawLine(text: string, opts?: { bold?: boolean }) {
    if (y < margin + lineHeight) {
      currentPage = doc.addPage([612, 792])
      y = currentPage.getHeight() - margin
    }
    const f = opts?.bold ? fontBold : font
    currentPage.drawText(text, { x: margin, y, size: bodySize, font: f })
    y -= lineHeight
  }

  currentPage.drawText('Date Range Report', { x: margin, y, size: titleSize, font: fontBold })
  y -= lineHeight * 1.5

  currentPage.drawText(`From: ${formatDate(start)}  To: ${formatDate(end)}`, {
    x: margin,
    y,
    size: bodySize,
    font,
  })
  y -= lineHeight * 1.5

  drawLine('Account details', { bold: true })
  drawLine(`Account holder: ${FAKE_ACCOUNT.holderName}`)
  drawLine(`Account number: ${FAKE_ACCOUNT.accountNumber}`)
  drawLine(`Sort code: ${FAKE_ACCOUNT.sortCode}`)
  drawLine(`Branch: ${FAKE_ACCOUNT.branch}`)
  y -= lineHeight

  drawLine('Transactions', { bold: true })
  const transactions = getPredictableTransactions(start, end)
  for (const t of transactions) {
    const amtStr = t.amount >= 0 ? `+${t.amount.toFixed(2)}` : t.amount.toFixed(2)
    drawLine(`${formatDate(t.date)}  ${t.description}  ${amtStr}`)
  }

  const pdfBytes = await doc.save({ useObjectStreams: false })
  return pdfBytes
}

/**
 * Triggers a browser download of the PDF. Call this from the Download button handler.
 */
export function downloadPdf(bytes: Uint8Array, filename: string = 'date-range-report.pdf'): void {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
