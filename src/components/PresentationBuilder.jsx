import { useState } from 'react'

export default function PresentationBuilder() {
  const [title, setTitle] = useState('My Presentation')
  const [desc, setDesc] = useState('A quick deck built in your browser')
  const [slides, setSlides] = useState([
    { heading: 'Welcome', content: 'Introduce the topic', notes: '' }
  ])

  const addSlide = () => setSlides(s => [...s, { heading: 'New Slide', content: '', notes: '' }])
  const removeSlide = (idx) => setSlides(s => s.filter((_, i) => i !== idx))
  const updateSlide = (idx, field, value) => setSlides(s => s.map((sl, i) => i === idx ? { ...sl, [field]: value } : sl))

  const exportJSON = () => {
    const data = { title, description: desc, slides }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const printDeck = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Build your presentation</h2>
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="border border-gray-300 rounded-lg px-3 py-2" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={addSlide} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Add slide</button>
          <button onClick={exportJSON} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">Export JSON</button>
          <button onClick={printDeck} className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg">Print/PDF</button>
        </div>
      </div>

      <div className="grid gap-4">
        {slides.map((sl, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <input value={sl.heading} onChange={e => updateSlide(idx, 'heading', e.target.value)} placeholder="Heading" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                <textarea value={sl.content} onChange={e => updateSlide(idx, 'content', e.target.value)} placeholder="Content" rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                <input value={sl.notes} onChange={e => updateSlide(idx, 'notes', e.target.value)} placeholder="Presenter notes (private)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600" />
              </div>
              <button onClick={() => removeSlide(idx)} className="text-red-600 hover:text-red-700 font-medium">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="print:block hidden">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600 mb-4">{desc}</p>
        {slides.map((sl, idx) => (
          <section key={idx} className="mb-6 break-inside-avoid">
            <h2 className="text-2xl font-semibold">{sl.heading}</h2>
            <p className="mt-2 whitespace-pre-wrap">{sl.content}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
