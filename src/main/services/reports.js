import ExcelJS from 'exceljs'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { report as reportDb } from '../db/queries.js'
import { dialog } from 'electron'
import fs from 'fs'

function formatEuro(n) {
  return n != null ? `€ ${parseFloat(n).toFixed(2)}` : '-'
}

// ── EXCEL ─────────────────────────────────────────────────────────────────────

export async function esportaExcel({ tipo, anno, immobile_id, immobile_nome }) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Immobili Manager'

  if (tipo === 'spese' || tipo === 'tutto') {
    const spese = reportDb.speseAnnuali(anno, immobile_id)
    const ws = wb.addWorksheet('Spese')
    ws.columns = [
      { header: 'Data', key: 'data', width: 14 },
      { header: 'Immobile', key: 'immobile', width: 22 },
      { header: 'Categoria', key: 'categoria', width: 20 },
      { header: 'Descrizione', key: 'descrizione', width: 30 },
      { header: 'Fornitore', key: 'fornitore', width: 20 },
      { header: 'Importo €', key: 'importo', width: 14 },
      { header: 'Stato', key: 'stato', width: 14 },
      { header: 'Pagata il', key: 'pagata', width: 14 }
    ]
    ws.getRow(1).font = { bold: true }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

    spese.forEach(s => {
      ws.addRow({
        data: s.data_scadenza || s.data_documento || '',
        immobile: s.immobile_nome || '',
        categoria: s.categoria_nome || '',
        descrizione: s.descrizione,
        fornitore: s.fornitore || '',
        importo: parseFloat(s.importo) || 0,
        stato: s.stato,
        pagata: s.data_pagamento || ''
      })
    })

    const totRow = ws.addRow({ descrizione: 'TOTALE', importo: spese.reduce((a, s) => a + (parseFloat(s.importo) || 0), 0) })
    totRow.font = { bold: true }
    ws.getColumn('importo').numFmt = '€#,##0.00'
  }

  if (tipo === 'affitti' || tipo === 'tutto') {
    const affitti = reportDb.affittiAnnuali(anno, immobile_id)
    const ws = wb.addWorksheet('Affitti')
    ws.columns = [
      { header: 'Mese', key: 'mese', width: 14 },
      { header: 'Immobile', key: 'immobile', width: 22 },
      { header: 'Unità', key: 'unita', width: 18 },
      { header: 'Inquilino', key: 'inquilino', width: 24 },
      { header: 'Importo €', key: 'importo', width: 14 },
      { header: 'Scadenza', key: 'scadenza', width: 14 },
      { header: 'Pagata il', key: 'pagata', width: 14 },
      { header: 'Stato', key: 'stato', width: 14 }
    ]
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } }

    affitti.forEach(a => {
      ws.addRow({
        mese: a.mese_riferimento,
        immobile: a.immobile_nome,
        unita: a.unita_nome,
        inquilino: a.inquilino_nome,
        importo: parseFloat(a.importo),
        scadenza: a.data_scadenza,
        pagata: a.data_pagamento || '',
        stato: a.stato
      })
    })
    ws.getColumn('importo').numFmt = '€#,##0.00'
  }

  const { filePath } = await dialog.showSaveDialog({
    title: 'Salva report Excel',
    defaultPath: `Report_Immobili_${anno}.xlsx`,
    filters: [{ name: 'Excel', extensions: ['xlsx'] }]
  })

  if (!filePath) return null
  await wb.xlsx.writeFile(filePath)
  return filePath
}

// ── PDF ───────────────────────────────────────────────────────────────────────

export async function esportaPdf({ tipo, anno, immobile_id, immobile_nome }) {
  const doc = new jsPDF({ orientation: 'landscape' })
  const titolo = `Report ${tipo === 'spese' ? 'Spese' : tipo === 'affitti' ? 'Affitti' : 'Completo'} ${anno}`
  const sottotitolo = immobile_nome ? `Immobile: ${immobile_nome}` : 'Tutti gli immobili'

  doc.setFontSize(18)
  doc.text(titolo, 14, 15)
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(sottotitolo, 14, 23)

  let y = 30

  if (tipo === 'spese' || tipo === 'tutto') {
    const spese = reportDb.speseAnnuali(anno, immobile_id)
    doc.autoTable({
      startY: y,
      head: [['Data', 'Immobile', 'Categoria', 'Descrizione', 'Fornitore', 'Importo', 'Stato']],
      body: spese.map(s => [
        s.data_scadenza || s.data_documento || '-',
        s.immobile_nome || '-',
        s.categoria_nome || '-',
        s.descrizione,
        s.fornitore || '-',
        formatEuro(s.importo),
        s.stato
      ]),
      foot: [['', '', '', '', 'TOTALE', formatEuro(spese.reduce((a, s) => a + (parseFloat(s.importo) || 0), 0)), '']],
      headStyles: { fillColor: [30, 58, 138] },
      footStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' }
    })
    y = doc.lastAutoTable.finalY + 10
  }

  if (tipo === 'affitti' || tipo === 'tutto') {
    const affitti = reportDb.affittiAnnuali(anno, immobile_id)
    if (tipo === 'tutto' && y > 160) { doc.addPage(); y = 15 }
    doc.autoTable({
      startY: y,
      head: [['Mese', 'Immobile', 'Unità', 'Inquilino', 'Importo', 'Scadenza', 'Stato']],
      body: affitti.map(a => [
        a.mese_riferimento, a.immobile_nome, a.unita_nome,
        a.inquilino_nome, formatEuro(a.importo), a.data_scadenza, a.stato
      ]),
      headStyles: { fillColor: [6, 95, 70] }
    })
  }

  const { filePath } = await dialog.showSaveDialog({
    title: 'Salva report PDF',
    defaultPath: `Report_Immobili_${anno}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  })

  if (!filePath) return null
  const buffer = Buffer.from(doc.output('arraybuffer'))
  fs.writeFileSync(filePath, buffer)
  return filePath
}
