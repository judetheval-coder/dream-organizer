// PDF Export utility for dreams
import { Dream, calculateDreamStats } from './enhanced-store'

export async function exportDreamsAsPDF(dreams: Dream[], filename: string = 'dream-journal.pdf') {
  // This uses jsPDF - you'll need to: npm install jspdf html2canvas
  
  try {
    const jsPDFModule = await import('jspdf')
    const jsPDF = jsPDFModule.default

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    let yPosition = margin

    // Title Page
    doc.setFontSize(28)
    doc.text('Dream Journal', pageWidth / 2, yPosition + 30, { align: 'center' })
    
    doc.setFontSize(12)
    const exportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    doc.text(`Exported: ${exportDate}`, pageWidth / 2, yPosition + 45, { align: 'center' })
    doc.text(`Total Dreams: ${dreams.length}`, pageWidth / 2, yPosition + 55, { align: 'center' })

    // Statistics Page
    const stats = calculateDreamStats()
    doc.addPage()
    yPosition = margin

    doc.setFontSize(18)
    doc.text('Statistics', margin, yPosition)
    yPosition += 15

    doc.setFontSize(11)
    const statsText = [
      `Total Dreams: ${stats.totalDreams}`,
      `Lucid Dreams: ${stats.totalLucidDreams} (${((stats.totalLucidDreams / Math.max(1, stats.totalDreams)) * 100).toFixed(1)}%)`,
      `Nightmares: ${stats.totalNightmares}`,
      `Average Lucidity: ${stats.averageLucidityScore.toFixed(1)}/10`,
      `Average Mood: ${stats.averageMoodScore.toFixed(1)}/10`,
      `Current Streak: ${stats.dreamStreak} days`,
      `Longest Streak: ${stats.longestStreak} days`
    ]

    statsText.forEach(text => {
      doc.text(text, margin, yPosition)
      yPosition += 8
    })

    // Dreams Pages
    dreams.forEach((dream, index) => {
      doc.addPage()
      yPosition = margin

      // Dream number and date
      doc.setFontSize(14)
      doc.setTextColor(88, 86, 214)
      const dreamDate = new Date(dream.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
      doc.text(`Dream ${index + 1} - ${dreamDate}`, margin, yPosition)
      doc.setTextColor(0, 0, 0)
      yPosition += 12

      // Dream text
      doc.setFontSize(11)
      const dreamLines = doc.splitTextToSize(dream.text, pageWidth - 2 * margin)
      doc.text(dreamLines, margin, yPosition)
      yPosition += dreamLines.length * 5 + 8

      // Scores
      doc.setFontSize(10)
      const scoresText = [
        `Lucidity Score: ${dream.lucidityScore}/10`,
        `Mood: ${dream.moodScore}/10`
      ]
      scoresText.forEach(text => {
        doc.text(text, margin, yPosition)
        yPosition += 6
      })
      yPosition += 4

      // Tags
      if (dream.tags?.length) {
        doc.setFontSize(10)
        const tagText = `Tags: ${dream.tags.join(', ')}`
        const tagLines = doc.splitTextToSize(tagText, pageWidth - 2 * margin)
        doc.text(tagLines, margin, yPosition)
        yPosition += tagLines.length * 5 + 4
      }

      // Notes
      if (dream.notes) {
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text('Notes:', margin, yPosition)
        yPosition += 6
        const noteLines = doc.splitTextToSize(dream.notes, pageWidth - 2 * margin)
        doc.text(noteLines, margin, yPosition)
      }
    })

    doc.save(filename)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF. Please ensure jsPDF is installed.')
  }
}

export function exportDreamsAsJSON(dreams: Dream[], filename: string = 'dream-journal.json') {
  const stats = calculateDreamStats()
  const data = {
    exportedAt: new Date().toISOString(),
    statistics: stats,
    dreams: dreams,
    totalCount: dreams.length
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportDreamsAsCSV(dreams: Dream[], filename: string = 'dream-journal.csv') {
  const headers = ['Date', 'Dream Description', 'Lucidity', 'Mood', 'Tags', 'Notes']
  const rows = dreams.map(dream => [
    new Date(dream.createdAt).toISOString().split('T')[0],
    `"${dream.text.replace(/"/g, '""')}"`,
    dream.lucidityScore,
    dream.moodScore,
    dream.tags?.join(';') || '',
    `"${(dream.notes || '').replace(/"/g, '""')}"`
  ])

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
