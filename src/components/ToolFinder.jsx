import { useEffect, useMemo, useState } from 'react'

const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function ToolFinder() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [freeOnly, setFreeOnly] = useState(true)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState('')

  const [newTool, setNewTool] = useState({
    name: '',
    url: '',
    category: '',
    description: '',
    tags: '',
    is_free: true
  })
  const [adding, setAdding] = useState(false)
  const [addMsg, setAddMsg] = useState('')

  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (query) p.set('q', query)
    if (category) p.set('category', category)
    if (freeOnly) p.set('free_only', 'true')
    return p.toString()
  }, [query, category, freeOnly])

  const search = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/tools?${params}`)
      if (!res.ok) throw new Error('Failed to fetch tools')
      const data = await res.json()
      setResults(data.items || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    search()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddTool = async (e) => {
    e.preventDefault()
    setAdding(true)
    setAddMsg('')
    try {
      const payload = {
        name: newTool.name.trim(),
        url: newTool.url.trim(),
        category: newTool.category.trim() || 'general',
        description: newTool.description.trim(),
        tags: newTool.tags.split(',').map(t => t.trim()).filter(Boolean),
        is_free: newTool.is_free
      }
      const res = await fetch(`${apiBase}/api/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to add tool')
      setAddMsg('✅ Tool added')
      setNewTool({ name: '', url: '', category: '', description: '', tags: '', is_free: true })
      await search()
    } catch (e) {
      setAddMsg('❌ ' + e.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Find free tools</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, tag, or description"
            className="col-span-2 md:col-span-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Category (e.g., design, ai, writing)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={freeOnly} onChange={e => setFreeOnly(e.target.checked)} />
              <span className="text-sm">Free only</span>
            </label>
            <button onClick={search} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        {error && <p className="text-red-600 mt-3">{error}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Results</h3>
          {results.length === 0 ? (
            <p className="text-gray-500">No tools yet. Try adding one below.</p>
          ) : (
            <ul className="divide-y">
              {results.map(t => (
                <li key={t.id} className="py-3 flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <a href={t.url} target="_blank" rel="noreferrer" className="text-blue-700 font-medium hover:underline">{t.name}</a>
                      {t.is_free && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Free</span>}
                      {t.category && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{t.category}</span>}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{t.description}</p>
                    {t.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {t.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Add a tool</h3>
          <form onSubmit={handleAddTool} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <input required value={newTool.name} onChange={e => setNewTool(v => ({...v, name: e.target.value}))} placeholder="Tool name" className="border border-gray-300 rounded-lg px-3 py-2" />
              <input required type="url" value={newTool.url} onChange={e => setNewTool(v => ({...v, url: e.target.value}))} placeholder="https://" className="border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <input value={newTool.category} onChange={e => setNewTool(v => ({...v, category: e.target.value}))} placeholder="Category" className="border border-gray-300 rounded-lg px-3 py-2" />
              <input value={newTool.tags} onChange={e => setNewTool(v => ({...v, tags: e.target.value}))} placeholder="Tags (comma separated)" className="border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <textarea value={newTool.description} onChange={e => setNewTool(v => ({...v, description: e.target.value}))} placeholder="Short description" className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={newTool.is_free} onChange={e => setNewTool(v => ({...v, is_free: e.target.checked}))} />
              <span>Free plan available</span>
            </label>
            <div className="flex items-center gap-3">
              <button disabled={adding} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">
                {adding ? 'Adding...' : 'Add tool'}
              </button>
              {addMsg && <span className="text-sm">{addMsg}</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
