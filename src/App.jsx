import { useEffect, useMemo, useState } from 'react'

function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-sm transition-all ${
        active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
      }`}
    >
      {label}
    </button>
  )
}

function SlideCard({ slide, index, onSelect, selected }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-md border mb-2 bg-white hover:shadow ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <p className="text-xs text-gray-500">Slide {index + 1}</p>
      <h4 className="font-semibold text-gray-800 truncate">{slide.heading || 'Untitled'}</h4>
      <p className="text-xs text-gray-600 line-clamp-2">{slide.content?.slice(0, 100) || 'Add content...'}</p>
    </button>
  )
}

function App() {
  // Presentation state (client-side before saving)
  const [title, setTitle] = useState('My Presentation')
  const [description, setDescription] = useState('Quick slides you can create in minutes')
  const [slides, setSlides] = useState([
    { heading: 'Welcome', content: 'Introduce your topic and objectives.', notes: '' }
  ])
  const [activeIndex, setActiveIndex] = useState(0)

  // Tools search state
  const [tools, setTools] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [freeOnly, setFreeOnly] = useState(true)
  const [loadingTools, setLoadingTools] = useState(false)

  const backend = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  const addSlide = () => {
    setSlides(s => [...s, { heading: '', content: '', notes: '' }])
    setActiveIndex(slides.length)
  }

  const updateSlide = (key, value) => {
    setSlides(s => s.map((sl, i) => i === activeIndex ? { ...sl, [key]: value } : sl))
  }

  const deleteSlide = () => {
    setSlides(s => s.filter((_, i) => i !== activeIndex))
    setActiveIndex(i => Math.max(0, i - 1))
  }

  const savePresentation = async () => {
    try {
      const payload = { title, description, slides, tags: [] }
      const res = await fetch(`${backend}/api/presentations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      alert(`Saved! ID: ${data.id}`)
    } catch (e) {
      alert(`Save failed: ${e.message}`)
    }
  }

  const fetchTools = async () => {
    try {
      setLoadingTools(true)
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (category) params.set('category', category)
      if (freeOnly) params.set('free_only', 'true')
      const res = await fetch(`${backend}/api/tools?${params.toString()}`)
      const data = await res.json()
      setTools(data.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingTools(false)
    }
  }

  useEffect(() => {
    fetchTools()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const categories = ['design', 'writing', 'developer', 'ai', 'presentation']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">QuickSlides + Free Tool Finder</h1>
          <div className="flex gap-2">
            <button onClick={savePresentation} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">Save</button>
            <a href="/test" className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50">Check Backend</a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Slides list */}
        <aside className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Slides</h3>
              <button onClick={addSlide} className="text-sm px-3 py-1 bg-slate-800 text-white rounded-md">Add</button>
            </div>
            <div>
              {slides.map((sl, i) => (
                <SlideCard key={i} slide={sl} index={i} selected={i === activeIndex} onSelect={() => setActiveIndex(i)} />
              ))}
            </div>
          </div>
        </aside>

        {/* Middle: Editor */}
        <section className="lg:col-span-2">
          <div className="bg-white border rounded-lg p-4">
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Presentation title" className="w-full border rounded-md px-3 py-2" />
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" className="w-full border rounded-md px-3 py-2" />
            </div>

            {slides[activeIndex] && (
              <div className="space-y-3">
                <input value={slides[activeIndex].heading} onChange={e => updateSlide('heading', e.target.value)} placeholder="Slide heading" className="w-full border rounded-md px-3 py-2" />
                <textarea value={slides[activeIndex].content} onChange={e => updateSlide('content', e.target.value)} placeholder="Write slide content..." rows={8} className="w-full border rounded-md px-3 py-2" />
                <textarea value={slides[activeIndex].notes} onChange={e => updateSlide('notes', e.target.value)} placeholder="Presenter notes (optional)" rows={3} className="w-full border rounded-md px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <button onClick={deleteSlide} className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50">Delete slide</button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Full-width: Tool Finder */}
        <section className="lg:col-span-3">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search free tools (name, tags, description)" className="flex-1 min-w-[200px] border rounded-md px-3 py-2" />
              <select value={category} onChange={e => setCategory(e.target.value)} className="border rounded-md px-3 py-2">
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={freeOnly} onChange={e => setFreeOnly(e.target.checked)} />
                Free only
              </label>
              <button onClick={fetchTools} className="bg-slate-800 text-white px-4 py-2 rounded-md">Search</button>
            </div>

            {loadingTools ? (
              <p className="text-sm text-gray-500">Searching tools...</p>
            ) : tools.length === 0 ? (
              <p className="text-sm text-gray-500">No tools found yet. Try a different search.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map(tool => (
                  <a key={tool.id} href={tool.url} target="_blank" rel="noreferrer" className="block border rounded-lg p-4 hover:shadow transition bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-800 truncate pr-2">{tool.name}</h4>
                      {tool.is_free && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Free</span>}
                    </div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{tool.category}</p>
                    <p className="text-sm text-gray-700 line-clamp-3 mb-2">{tool.description}</p>
                    {tool.tags && tool.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tool.tags.slice(0, 5).map((t, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{t}</span>
                        ))}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-gray-500 py-6">
        Built to help you make presentations fast and discover free tools.
      </footer>
    </div>
  )
}

export default App
