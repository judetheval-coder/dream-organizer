import { getDreams, getUserData, getAchievements, getSettings } from './store'

export function exportData() {
  const data = {
    dreams: getDreams(),
    user: getUserData(),
    achievements: getAchievements(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0'
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dream-journal-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportCSV() {
  const dreams = getDreams()
  
  const headers = ['Title', 'Description', 'Category', 'Sleep Date', 'Vividness', 'Mood', 'Lucid', 'Nightmare', 'Recurring', 'Tags', 'Created']
  const rows = dreams.map(d => [
    d.title,
    d.description.replace(/,/g, ';'), // Escape commas
    d.category,
    d.sleepDate,
    d.vividness.toString(),
    d.mood,
    d.isLucid ? 'Yes' : 'No',
    d.isNightmare ? 'Yes' : 'No',
    d.isRecurring ? 'Yes' : 'No',
    d.tags.join('; '),
    new Date(d.createdAt).toLocaleDateString()
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dreams-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importData(jsonData: string) {
  try {
    const data = JSON.parse(jsonData)
    if (data.dreams) localStorage.setItem('dreamOrganizer_dreams', JSON.stringify(data.dreams))
    if (data.achievements) localStorage.setItem('dreamOrganizer_achievements', JSON.stringify(data.achievements))
    if (data.user) localStorage.setItem('dreamOrganizer_user', JSON.stringify(data.user))
    if (data.settings) localStorage.setItem('dreamOrganizer_settings', JSON.stringify(data.settings))
    return true
  } catch (error) {
    console.error('Import failed:', error)
    return false
  }
}
