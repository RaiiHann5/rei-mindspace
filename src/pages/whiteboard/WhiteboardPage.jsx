import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Eraser, Download, Undo2, Redo, Trash2, PenTool, Palette, Brush, Eye, EyeOff,
  Lock, Unlock, Plus, Menu, PaintBucket, Pipette, Minus, Square, Circle,
  ZoomIn, ZoomOut, Maximize, Copy, ChevronUp, ChevronDown, Settings2,
  SprayCan, FlipHorizontal,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader, Card, Button } from '@/components/ui'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'meridian_whiteboard_project_v2'
const MAX_HISTORY = 20
const MIN_ZOOM = 0.1
const MAX_ZOOM = 8

// Pen colours. Canvas 2D `fillStyle` cannot resolve a CSS custom property, so
// these stay literal — but they are chosen from the Space+ palette so the
// default drawer matches the app: the two inks first, then the ember ramp the
// user actually draws with, then the desaturated status hues. Saturated pens
// are fine here — this is user content, not UI chrome.
const SWATCHES = [
  '#121016', '#ffffff', // ink + paper
  '#FF7A29', '#FFB343', '#C1400D', // ember ramp
  '#A8535F', '#6E8C88', '#C0A876', '#8D89A6', // rose, teal, amber, dusk
]

const TOOLS = [
  { id: 'pen', label: 'Pen', icon: PenTool },
  { id: 'pencil', label: 'Pencil', icon: PenTool },
  { id: 'brush', label: 'Brush', icon: Brush },
  { id: 'airbrush', label: 'Airbrush', icon: SprayCan },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
  { id: 'fill', label: 'Fill', icon: PaintBucket },
  { id: 'eyedropper', label: 'Picker', icon: Pipette },
  { id: 'line', label: 'Line', icon: Minus },
  { id: 'rect', label: 'Rectangle', icon: Square },
  { id: 'ellipse', label: 'Ellipse', icon: Circle },
]

const TOOL_DEFAULTS = {
  pen: { size: 4, opacity: 1, hardness: 1 },
  pencil: { size: 2, opacity: 0.85, hardness: 1 },
  brush: { size: 18, opacity: 0.7, hardness: 0.3 },
  airbrush: { size: 26, opacity: 0.25, hardness: 0 },
  eraser: { size: 20, opacity: 1, hardness: 1 },
  fill: { size: 1, opacity: 1, hardness: 1 },
  eyedropper: { size: 1, opacity: 1, hardness: 1 },
  line: { size: 4, opacity: 1, hardness: 1 },
  rect: { size: 4, opacity: 1, hardness: 1 },
  ellipse: { size: 4, opacity: 1, hardness: 1 },
}

const CANVAS_PRESETS = [
  { label: 'Standard 1000×700', w: 1000, h: 700 },
  { label: 'Square 1080×1080', w: 1080, h: 1080 },
  { label: 'Portrait 700×1000', w: 700, h: 1000 },
  { label: 'HD 1920×1080', w: 1920, h: 1080 },
  { label: 'Pixel Art 32×32', w: 32, h: 32 },
  { label: 'Pixel Art 64×64', w: 64, h: 64 },
]

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const bigint = parseInt(full, 16)
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 }
}

function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

function createLayerCanvas(width, height, fillWhite = false) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, width)
  c.height = Math.max(1, height)
  if (fillWhite) {
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, c.width, c.height)
  }
  return c
}

let layerIdCounter = 1
function nextLayerId() { return `layer_${Date.now()}_${layerIdCounter++}` }

const INITIAL_LAYER_ID = 'layer_bg'

export default function WhiteboardPage() {
  const wrapRef = useRef(null)
  const displayCanvasRef = useRef(null)
  const overlayCanvasRef = useRef(null) // shape-preview canvas, sits on top
  const layerCanvasesRef = useRef({}) // layerId -> offscreen <canvas>
  const drawingRef = useRef(false)
  const lastPointRef = useRef(null)
  const shapeStartRef = useRef(null)
  const historySuppressRef = useRef(false)

  const [canvasSize, setCanvasSizeState] = useState({ width: 1000, height: 700 })
  const [sizeInputs, setSizeInputs] = useState({ width: 1000, height: 700 })
  const [showCanvasSettings, setShowCanvasSettings] = useState(false)

  const [color, setColor] = useState('#121016')
  const [tool, setTool] = useState('pen')
  const [size, setSize] = useState(TOOL_DEFAULTS.pen.size)
  const [opacity, setOpacity] = useState(TOOL_DEFAULTS.pen.opacity)
  const [hardness, setHardness] = useState(TOOL_DEFAULTS.pen.hardness)
  const [symmetry, setSymmetry] = useState(false)

  const [layers, setLayers] = useState([
    { id: INITIAL_LAYER_ID, name: 'Background', status: 'visible', lock: 'unlocked', opacity: 1 },
  ])
  const [activeLayerId, setActiveLayerId] = useState(INITIAL_LAYER_ID)
  const [isLayersExpanded, setIsLayersExpanded] = useState(false)

  const [scale, setScale] = useState(1)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [ready, setReady] = useState(false)

  // ---------------------------------------------------------------------
  // Compositing: every layer now owns its own offscreen canvas. To show
  // the final picture we draw the visible layers (bottom -> top) onto the
  // single on-screen "display" canvas. This is what actually makes layers
  // (visibility / opacity / order / lock) do something — in the previous
  // version `layers` was just bookkeeping and every tool always drew onto
  // one shared canvas, so hiding/locking/reordering a layer had no effect.
  // ---------------------------------------------------------------------
  const compositeLayers = useCallback(() => {
    const display = displayCanvasRef.current
    if (!display) return
    const ctx = display.getContext('2d')
    ctx.clearRect(0, 0, display.width, display.height)
    layers.forEach((l) => {
      if (l.status !== 'visible') return
      const lc = layerCanvasesRef.current[l.id]
      if (!lc) return
      ctx.globalAlpha = l.opacity ?? 1
      ctx.globalCompositeOperation = 'source-over'
      ctx.drawImage(lc, 0, 0)
    })
    ctx.globalAlpha = 1
  }, [layers])

  useEffect(() => { compositeLayers() }, [layers, compositeLayers])

  useEffect(() => {
    const display = displayCanvasRef.current
    const overlay = overlayCanvasRef.current
    if (display) { display.width = canvasSize.width; display.height = canvasSize.height }
    if (overlay) { overlay.width = canvasSize.width; overlay.height = canvasSize.height }
    compositeLayers()
  }, [canvasSize, compositeLayers])

  // ---------------------------------------------------------------------
  // Init + load autosaved project
  // ---------------------------------------------------------------------
  useEffect(() => {
    layerCanvasesRef.current[INITIAL_LAYER_ID] = createLayerCanvas(canvasSize.width, canvasSize.height, true)

    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const saved = JSON.parse(raw)
        if (saved?.layers?.length && saved?.canvasSize) {
          const loads = saved.layers.map((l) => new Promise((resolve) => {
            const c = createLayerCanvas(saved.canvasSize.width, saved.canvasSize.height)
            const img = new Image()
            img.onload = () => { c.getContext('2d').drawImage(img, 0, 0); resolve() }
            img.onerror = () => resolve()
            img.src = l.dataURL
            layerCanvasesRef.current[l.id] = c
          }))
          Promise.all(loads).then(() => {
            setCanvasSizeState(saved.canvasSize)
            setSizeInputs(saved.canvasSize)
            setLayers(saved.layers.map(({ dataURL, ...rest }) => rest))
            setActiveLayerId(saved.activeLayerId || saved.layers[0].id)
            setReady(true)
          })
          return
        }
      } catch { /* corrupted save, ignore */ }
    }
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------------------------------------------------------------------
  // Autosave (debounced)
  // ---------------------------------------------------------------------
  const saveTimeoutRef = useRef(null)
  const persist = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const data = {
          canvasSize,
          activeLayerId,
          layers: layers.map((l) => ({
            ...l,
            dataURL: layerCanvasesRef.current[l.id]?.toDataURL('image/png') || '',
          })),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch { /* storage quota exceeded */ }
    }, 500)
  }, [canvasSize, activeLayerId, layers])

  // ---------------------------------------------------------------------
  // History (undo/redo) — snapshots the whole project (all layers).
  // BUG FIX: previously the snapshot was taken *after* the first dot of a
  // stroke was already painted, so pressing Undo right after a click did
  // nothing useful (it "restored" a state that already contained the dot).
  // Now every mutating action snapshots the project first, then mutates.
  // ---------------------------------------------------------------------
  const snapshotProject = useCallback(() => ({
    canvasSize,
    activeLayerId,
    layers: layers.map((l) => ({
      ...l,
      dataURL: layerCanvasesRef.current[l.id]?.toDataURL('image/png') || '',
    })),
  }), [canvasSize, activeLayerId, layers])

  const restoreProject = useCallback((snap) => new Promise((resolve) => {
    const loads = snap.layers.map((l) => new Promise((res) => {
      const c = createLayerCanvas(snap.canvasSize.width, snap.canvasSize.height)
      const img = new Image()
      img.onload = () => { c.getContext('2d').drawImage(img, 0, 0); res() }
      img.onerror = () => res()
      img.src = l.dataURL
      layerCanvasesRef.current[l.id] = c
    }))
    Promise.all(loads).then(() => {
      historySuppressRef.current = true
      setCanvasSizeState(snap.canvasSize)
      setSizeInputs(snap.canvasSize)
      setLayers(snap.layers.map(({ dataURL, ...rest }) => rest))
      setActiveLayerId(snap.activeLayerId)
      resolve()
    })
  }), [])

  const pushHistory = useCallback(() => {
    const snap = snapshotProject()
    setUndoStack((prev) => {
      const trimmed = prev.length >= MAX_HISTORY ? prev.slice(-(MAX_HISTORY - 1)) : prev
      return [...trimmed, snap]
    })
    setRedoStack([])
  }, [snapshotProject])

  const undo = useCallback(() => {
    if (undoStack.length === 0) return
    const prevSnap = undoStack[undoStack.length - 1]
    const currentSnap = snapshotProject()
    setUndoStack((s) => s.slice(0, -1))
    setRedoStack((s) => [...s, currentSnap])
    restoreProject(prevSnap).then(compositeLayers)
  }, [undoStack, snapshotProject, restoreProject, compositeLayers])

  const redo = useCallback(() => {
    if (redoStack.length === 0) return
    const nextSnap = redoStack[redoStack.length - 1]
    const currentSnap = snapshotProject()
    setRedoStack((s) => s.slice(0, -1))
    setUndoStack((s) => [...s, currentSnap])
    restoreProject(nextSnap).then(compositeLayers)
  }, [redoStack, snapshotProject, restoreProject, compositeLayers])

  useEffect(() => {
    if (historySuppressRef.current) {
      historySuppressRef.current = false
      compositeLayers()
    }
  }, [layers, compositeLayers])

  // ---------------------------------------------------------------------
  // Layer operations (now real: each layer is an actual offscreen canvas)
  // ---------------------------------------------------------------------
  const getActiveLayer = useCallback(() => layers.find((l) => l.id === activeLayerId), [layers, activeLayerId])

  const addLayer = useCallback(() => {
    pushHistory()
    const id = nextLayerId()
    layerCanvasesRef.current[id] = createLayerCanvas(canvasSize.width, canvasSize.height)
    setLayers((prev) => [...prev, { id, name: `Layer ${prev.length + 1}`, status: 'visible', lock: 'unlocked', opacity: 1 }])
    setActiveLayerId(id)
  }, [canvasSize, pushHistory])

  const renameLayer = useCallback((id, newName) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, name: newName } : l)))
  }, [])

  const deleteLayer = useCallback((id) => {
    if (layers.length <= 1) { toast.error('Cannot delete the only layer'); return }
    pushHistory()
    delete layerCanvasesRef.current[id]
    setLayers((prev) => {
      const next = prev.filter((l) => l.id !== id)
      if (activeLayerId === id) setActiveLayerId(next[0].id)
      return next
    })
  }, [layers.length, activeLayerId, pushHistory])

  const duplicateLayer = useCallback((id) => {
    const layer = layers.find((l) => l.id === id)
    const source = layerCanvasesRef.current[id]
    if (!layer || !source) return
    pushHistory()
    const newId = nextLayerId()
    const c = createLayerCanvas(canvasSize.width, canvasSize.height)
    c.getContext('2d').drawImage(source, 0, 0)
    layerCanvasesRef.current[newId] = c
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id)
      const next = [...prev]
      next.splice(idx + 1, 0, { ...layer, id: newId, name: `${layer.name} copy` })
      return next
    })
    setActiveLayerId(newId)
  }, [layers, canvasSize, pushHistory])

  const toggleLayerVisibility = useCallback((id) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, status: l.status === 'visible' ? 'hidden' : 'visible' } : l)))
  }, [])

  const toggleLayerLock = useCallback((id) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, lock: l.lock === 'locked' ? 'unlocked' : 'locked' } : l)))
  }, [])

  const setLayerOpacity = useCallback((id, value) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, opacity: value } : l)))
  }, [])

  // direction: 'up' moves the layer higher in the stack (rendered later/on top)
  const reorderLayer = useCallback((id, direction) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id)
      const swapWith = direction === 'up' ? idx + 1 : idx - 1
      if (swapWith < 0 || swapWith >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
      return next
    })
  }, [])

  const clearActiveLayer = useCallback(() => {
    const layer = getActiveLayer()
    if (!layer || layer.lock === 'locked') { toast.error('Layer is locked'); return }
    pushHistory()
    const c = layerCanvasesRef.current[layer.id]
    if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height)
    compositeLayers()
    persist()
  }, [getActiveLayer, pushHistory, compositeLayers, persist])

  const clearBoard = useCallback(() => {
    if (!confirm('Clear the whole board? This cannot be undone.')) return
    pushHistory()
    layers.forEach((l, idx) => {
      const c = layerCanvasesRef.current[l.id]
      if (!c) return
      const ctx = c.getContext('2d')
      ctx.clearRect(0, 0, c.width, c.height)
      if (idx === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height) }
    })
    compositeLayers()
    persist()
    toast.success('Board cleared')
  }, [layers, pushHistory, compositeLayers, persist])

  // ---------------------------------------------------------------------
  // Canvas (pixel) size — set/resize the actual working resolution.
  // ---------------------------------------------------------------------
  const applyCanvasSize = useCallback((w, h, mode = 'scale') => {
    w = Math.max(1, Math.min(4000, Math.round(w)))
    h = Math.max(1, Math.min(4000, Math.round(h)))
    if (w === canvasSize.width && h === canvasSize.height && mode === 'scale') return
    pushHistory()
    layers.forEach((l, idx) => {
      const old = layerCanvasesRef.current[l.id]
      const c = createLayerCanvas(w, h)
      const ctx = c.getContext('2d')
      if (mode === 'blank') {
        if (idx === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h) }
      } else if (old) {
        ctx.drawImage(old, 0, 0, old.width, old.height, 0, 0, w, h)
      }
      layerCanvasesRef.current[l.id] = c
    })
    setCanvasSizeState({ width: w, height: h })
    setUndoStack([]); setRedoStack([])
    toast.success(`Canvas set to ${w}×${h}px`)
  }, [canvasSize, layers, pushHistory])

  // ---------------------------------------------------------------------
  // Coordinate mapping
  // BUG FIX: the old code applied the pan/zoom math twice — once implicitly
  // (because the CSS `transform: scale(...) translate(...)` on the canvas
  // already changes what getBoundingClientRect() returns) and once again
  // explicitly (`(x - translateX) / scale`). That double transform made
  // strokes land in the wrong place as soon as you zoomed or panned.
  // Now the canvas is positioned with plain left/top + width/height (no
  // CSS `transform`), so getBoundingClientRect() is the *only* place the
  // current pan/zoom is reflected, and a single conversion is correct.
  // ---------------------------------------------------------------------
  const getPoint = useCallback((e) => {
    const canvas = displayCanvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * canvasSize.width
    const y = ((e.clientY - rect.top) / rect.height) * canvasSize.height
    return { x, y }
  }, [canvasSize])

  // ---------------------------------------------------------------------
  // Brush engine
  // ---------------------------------------------------------------------
  const drawSegment = useCallback((ctx, from, to, opts) => {
    const { toolId, colorHex, brushSize, brushOpacity, brushHardness } = opts

    if (toolId === 'eraser') {
      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = brushSize
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
      ctx.restore()
      return
    }

    if (toolId === 'pen' || toolId === 'pencil') {
      ctx.save()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = brushSize
      ctx.globalAlpha = brushOpacity
      ctx.strokeStyle = colorHex
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
      ctx.restore()
      return
    }

    // brush (soft round) & airbrush: stamp dabs along the segment
    const dist = Math.hypot(to.x - from.x, to.y - from.y)
    const spacing = toolId === 'airbrush' ? Math.max(3, brushSize * 0.3) : Math.max(1, brushSize * 0.18)
    const steps = Math.max(1, Math.floor(dist / spacing))
    ctx.save()
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = from.x + (to.x - from.x) * t
      const y = from.y + (to.y - from.y) * t
      if (toolId === 'airbrush') {
        for (let j = 0; j < 3; j++) {
          const angle = Math.random() * Math.PI * 2
          const r = Math.random() * (brushSize / 2)
          ctx.fillStyle = rgba(colorHex, brushOpacity * 0.5)
          ctx.beginPath()
          ctx.arc(x + Math.cos(angle) * r, y + Math.sin(angle) * r, Math.max(0.6, brushSize * 0.06), 0, Math.PI * 2)
          ctx.fill()
        }
      } else {
        const radius = brushSize / 2
        const grad = ctx.createRadialGradient(x, y, radius * brushHardness, x, y, radius)
        grad.addColorStop(0, rgba(colorHex, brushOpacity))
        grad.addColorStop(1, rgba(colorHex, 0))
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.restore()
  }, [])

  const mirrorPoint = useCallback((p) => ({ x: canvasSize.width - p.x, y: p.y }), [canvasSize])

  // ---------------------------------------------------------------------
  // Fill bucket (flood fill)
  // ---------------------------------------------------------------------
  const floodFill = useCallback((layerCanvas, startX, startY, fillHex, fillOpacity) => {
    const ctx = layerCanvas.getContext('2d')
    const { width, height } = layerCanvas
    const sx = Math.floor(startX), sy = Math.floor(startY)
    if (sx < 0 || sy < 0 || sx >= width || sy >= height) return
    const imgData = ctx.getImageData(0, 0, width, height)
    const data = imgData.data
    const idx = (x, y) => (y * width + x) * 4
    const start = idx(sx, sy)
    const tR = data[start], tG = data[start + 1], tB = data[start + 2], tA = data[start + 3]
    const { r: fr, g: fg, b: fb } = hexToRgb(fillHex)
    const fa = Math.round(fillOpacity * 255)
    if (tR === fr && tG === fg && tB === fb && tA === fa) return
    const tolerance = 32
    const matches = (i) => (
      Math.abs(data[i] - tR) <= tolerance &&
      Math.abs(data[i + 1] - tG) <= tolerance &&
      Math.abs(data[i + 2] - tB) <= tolerance &&
      Math.abs(data[i + 3] - tA) <= tolerance
    )
    const stack = [[sx, sy]]
    const visited = new Uint8Array(width * height)
    while (stack.length) {
      const [x, y] = stack.pop()
      if (x < 0 || y < 0 || x >= width || y >= height) continue
      const vIdx = y * width + x
      if (visited[vIdx]) continue
      const i = idx(x, y)
      if (!matches(i)) continue
      visited[vIdx] = 1
      data[i] = fr; data[i + 1] = fg; data[i + 2] = fb; data[i + 3] = fa
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }
    ctx.putImageData(imgData, 0, 0)
  }, [])

  // ---------------------------------------------------------------------
  // Eyedropper
  // ---------------------------------------------------------------------
  const pickColorAt = useCallback((p) => {
    const display = displayCanvasRef.current
    if (!display) return
    const ctx = display.getContext('2d')
    const x = Math.min(display.width - 1, Math.max(0, Math.floor(p.x)))
    const y = Math.min(display.height - 1, Math.max(0, Math.floor(p.y)))
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
    const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
    setColor(hex)
    setTool('pen')
    toast.success(`Picked ${hex}`)
  }, [])

  // ---------------------------------------------------------------------
  // Pointer handlers
  // ---------------------------------------------------------------------
  const onPointerDown = useCallback((e) => {
    if (e.button === 2 || e.button === 1) return // reserved for panning
    e.preventDefault()
    const layer = getActiveLayer()
    if (!layer) return
    if (layer.lock === 'locked') { toast.error('Layer is locked'); return }
    const p = getPoint(e)
    if (!p) return

    if (tool === 'eyedropper') { pickColorAt(p); return }

    if (tool === 'fill') {
      pushHistory()
      const lc = layerCanvasesRef.current[layer.id]
      if (lc) floodFill(lc, p.x, p.y, color, opacity)
      compositeLayers()
      persist()
      return
    }

    displayCanvasRef.current?.setPointerCapture?.(e.pointerId)
    const pressure = (e.pointerType === 'pen' && e.pressure > 0) ? e.pressure : 1

    if (tool === 'line' || tool === 'rect' || tool === 'ellipse') {
      pushHistory()
      shapeStartRef.current = p
      drawingRef.current = true
      return
    }

    pushHistory()
    const lc = layerCanvasesRef.current[layer.id]
    const ctx = lc?.getContext('2d')
    if (!ctx) return
    const opts = { toolId: tool, colorHex: color, brushSize: size, brushOpacity: opacity * pressure, brushHardness: hardness }
    drawSegment(ctx, p, p, opts)
    if (symmetry) {
      const mp = mirrorPoint(p)
      drawSegment(ctx, mp, mp, opts)
    }
    compositeLayers()
    drawingRef.current = true
    lastPointRef.current = p
  }, [tool, color, size, opacity, hardness, symmetry, getActiveLayer, getPoint, pushHistory, drawSegment, mirrorPoint, compositeLayers, persist, floodFill, pickColorAt])

  const onPointerMove = useCallback((e) => {
    if (!drawingRef.current) return
    e.preventDefault()
    const p = getPoint(e)
    if (!p) return

    if (tool === 'line' || tool === 'rect' || tool === 'ellipse') {
      const overlay = overlayCanvasRef.current
      const octx = overlay?.getContext('2d')
      const start = shapeStartRef.current
      if (!octx || !start) return
      octx.clearRect(0, 0, overlay.width, overlay.height)
      octx.save()
      octx.strokeStyle = color
      octx.lineWidth = size
      octx.globalAlpha = opacity
      octx.lineCap = 'round'
      octx.lineJoin = 'round'
      octx.beginPath()
      if (tool === 'line') {
        octx.moveTo(start.x, start.y); octx.lineTo(p.x, p.y)
      } else if (tool === 'rect') {
        octx.rect(Math.min(start.x, p.x), Math.min(start.y, p.y), Math.abs(p.x - start.x), Math.abs(p.y - start.y))
      } else {
        const rx = Math.abs(p.x - start.x) / 2, ry = Math.abs(p.y - start.y) / 2
        const cx = (start.x + p.x) / 2, cy = (start.y + p.y) / 2
        octx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      }
      octx.stroke()
      octx.restore()
      return
    }

    const layer = getActiveLayer()
    if (!layer) return
    const lc = layerCanvasesRef.current[layer.id]
    const ctx = lc?.getContext('2d')
    const last = lastPointRef.current
    if (!ctx || !last) { lastPointRef.current = p; return }
    const pressure = (e.pointerType === 'pen' && e.pressure > 0) ? e.pressure : 1
    const opts = { toolId: tool, colorHex: color, brushSize: size, brushOpacity: opacity * pressure, brushHardness: hardness }
    drawSegment(ctx, last, p, opts)
    if (symmetry) drawSegment(ctx, mirrorPoint(last), mirrorPoint(p), opts)
    lastPointRef.current = p
    compositeLayers()
  }, [tool, color, size, opacity, hardness, symmetry, getActiveLayer, getPoint, drawSegment, mirrorPoint, compositeLayers])

  const onPointerUp = useCallback((e) => {
    if (!drawingRef.current) return
    drawingRef.current = false

    if (tool === 'line' || tool === 'rect' || tool === 'ellipse') {
      const overlay = overlayCanvasRef.current
      const octx = overlay?.getContext('2d')
      const start = shapeStartRef.current
      const p = getPoint(e)
      const layer = getActiveLayer()
      if (octx && start && p && layer) {
        const lc = layerCanvasesRef.current[layer.id]
        const ctx = lc?.getContext('2d')
        if (ctx) {
          ctx.save()
          ctx.strokeStyle = color
          ctx.lineWidth = size
          ctx.globalAlpha = opacity
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.beginPath()
          if (tool === 'line') {
            ctx.moveTo(start.x, start.y); ctx.lineTo(p.x, p.y)
          } else if (tool === 'rect') {
            ctx.rect(Math.min(start.x, p.x), Math.min(start.y, p.y), Math.abs(p.x - start.x), Math.abs(p.y - start.y))
          } else {
            const rx = Math.abs(p.x - start.x) / 2, ry = Math.abs(p.y - start.y) / 2
            const cx = (start.x + p.x) / 2, cy = (start.y + p.y) / 2
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
          }
          ctx.stroke()
          ctx.restore()
        }
        octx.clearRect(0, 0, overlay.width, overlay.height)
      }
      shapeStartRef.current = null
      compositeLayers()
      persist()
      return
    }

    lastPointRef.current = null
    persist()
  }, [tool, color, size, opacity, getPoint, getActiveLayer, compositeLayers, persist])

  // ---------------------------------------------------------------------
  // Zoom & pan
  // ---------------------------------------------------------------------
  const zoomBy = useCallback((factor, originX, originY) => {
    setScale((prevScale) => {
      const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevScale * factor))
      const ratio = newScale / prevScale
      setTranslateX((prevX) => originX - (originX - prevX) * ratio)
      setTranslateY((prevY) => originY - (originY - prevY) * ratio)
      return newScale
    })
  }, [])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    const wrap = wrapRef.current
    if (!wrap) return
    const rect = wrap.getBoundingClientRect()
    const originX = e.clientX - rect.left
    const originY = e.clientY - rect.top
    zoomBy(e.deltaY > 0 ? 0.9 : 1.1, originX, originY)
  }, [zoomBy])

  const resetView = useCallback(() => {
    const wrap = wrapRef.current
    if (!wrap) { setScale(1); setTranslateX(0); setTranslateY(0); return }
    const rect = wrap.getBoundingClientRect()
    const fitScale = Math.min(rect.width / canvasSize.width, rect.height / canvasSize.height, 1)
    setScale(fitScale)
    setTranslateX((rect.width - canvasSize.width * fitScale) / 2)
    setTranslateY((rect.height - canvasSize.height * fitScale) / 2)
  }, [canvasSize])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) resetView() }, [ready])

  const onMouseDownPan = useCallback((e) => {
    if (e.button === 2 || e.button === 1) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [])
  const onMouseMovePan = useCallback((e) => {
    if (!isPanning) return
    e.preventDefault()
    setTranslateX((prev) => prev + (e.clientX - panStart.x))
    setTranslateY((prev) => prev + (e.clientY - panStart.y))
    setPanStart({ x: e.clientX, y: e.clientY })
  }, [isPanning, panStart])
  const onMouseUpPan = useCallback(() => setIsPanning(false), [])
  const onContextMenu = useCallback((e) => e.preventDefault(), [])

  useEffect(() => {
    window.addEventListener('mousedown', onMouseDownPan)
    window.addEventListener('mousemove', onMouseMovePan)
    window.addEventListener('mouseup', onMouseUpPan)
    return () => {
      window.removeEventListener('mousedown', onMouseDownPan)
      window.removeEventListener('mousemove', onMouseMovePan)
      window.removeEventListener('mouseup', onMouseUpPan)
    }
  }, [onMouseDownPan, onMouseMovePan, onMouseUpPan])

  // ---------------------------------------------------------------------
  const selectTool = useCallback((id) => {
    setTool(id)
    const d = TOOL_DEFAULTS[id]
    if (d) { setSize(d.size); setOpacity(d.opacity); setHardness(d.hardness) }
  }, [])

  const download = useCallback(() => {
    const display = displayCanvasRef.current
    if (!display) return
    const link = document.createElement('a')
    link.download = `whiteboard-${Date.now()}.png`
    link.href = display.toDataURL('image/png')
    link.click()
    toast.success('Downloaded as PNG')
  }, [])

  const activeLayer = getActiveLayer()
  const zoomPct = Math.round(scale * 100)
  const showSize = !['fill', 'eyedropper'].includes(tool)
  const showOpacity = tool !== 'eyedropper'
  const showHardness = tool === 'brush' || tool === 'airbrush'
  const displayedLayers = [...layers].reverse()

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <PageHeader
        title="Whiteboard"
        description="Sketch ideas, diagrams, or full illustrations across layers. Autosaves in your browser."
        actions={
          <>
            <Button variant="secondary" size="icon" onClick={undo} disabled={undoStack.length === 0} title="Undo">
              <Undo2 size={16} />
            </Button>
            <Button variant="secondary" size="icon" onClick={redo} disabled={redoStack.length === 0} title="Redo">
              <Redo size={16} />
            </Button>
            <Button variant="secondary" size="icon" onClick={clearBoard} title="Clear board">
              <Trash2 size={16} />
            </Button>
            <Button onClick={download}><Download size={16} /> Download PNG</Button>
          </>
        }
      />

      <Card className="p-3 sm:p-4">
        {/* Tools */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 px-1 pb-2 border-b border-border-light dark:border-border-dark">
          {TOOLS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => selectTool(id)}
              title={label}
              className={cn(
                'flex items-center gap-1.5 text-xs px-2 py-1.5 rounded border transition-colors',
                tool === id
                  ? 'bg-primary-500/20 border-primary-500/40 text-primary-600 dark:text-primary-300'
                  : 'border-border-light dark:border-border-dark hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
              )}
            >
              <Icon size={13} /> <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
          <button
            onClick={() => setSymmetry((s) => !s)}
            title="Mirror drawing (vertical symmetry)"
            className={cn(
              'flex items-center gap-1.5 text-xs px-2 py-1.5 rounded border transition-colors ml-1',
              symmetry
                ? 'bg-primary-500/20 border-primary-500/40 text-primary-600 dark:text-primary-300'
                : 'border-border-light dark:border-border-dark hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
            )}
          >
            <FlipHorizontal size={13} /> <span className="hidden sm:inline">Symmetry</span>
          </button>
        </div>

        {/* Color + size/opacity/hardness */}
        <div className="flex flex-wrap items-center gap-4 mb-3 px-1 pb-2 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center gap-1.5">
            <Palette size={14} className="text-muted-light dark:text-muted-dark mr-0.5" />
            {SWATCHES.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn('h-6 w-6 rounded-full border transition-transform', color === c ? 'scale-110 border-ember-500 ring-2 ring-ember-500/25' : 'border-transparent hover:scale-105')}
                style={{ backgroundColor: c, boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px rgba(0,0,0,0.12)' : undefined }}
                title={c}
              />
            ))}
            <label className="relative h-6 w-6 rounded-full overflow-hidden border border-[color:var(--line-strong)] cursor-pointer" title="Custom color">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute -inset-1 cursor-pointer" />
            </label>
          </div>

          {showSize && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-light dark:text-muted-dark">Size</span>
              <input type="range" min={1} max={80} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-24 accent-primary-500" />
              <span className="text-xs text-primary font-medium w-6 tabular-nums">{size}</span>
            </div>
          )}

          {showOpacity && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-light dark:text-muted-dark">Opacity</span>
              <input type="range" min={0} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-24 accent-primary-500" />
              <span className="text-xs text-primary font-medium w-9 tabular-nums">{Math.round(opacity * 100)}%</span>
            </div>
          )}

          {showHardness && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-light dark:text-muted-dark">Hardness</span>
              <input type="range" min={0} max={1} step={0.1} value={hardness} onChange={(e) => setHardness(Number(e.target.value))} className="w-24 accent-primary-500" />
              <span className="text-xs text-primary font-medium">{hardness >= 0.7 ? 'Hard' : 'Soft'}</span>
            </div>
          )}

          {/* Zoom */}
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => zoomBy(0.83, canvasSize.width * scale / 2, canvasSize.height * scale / 2)} className="p-1.5 rounded border border-border-light dark:border-border-dark hover:bg-black/[0.03] dark:hover:bg-white/[0.05]" title="Zoom out">
              <ZoomOut size={14} />
            </button>
            <span className="text-xs w-10 text-center tabular-nums text-muted-light dark:text-muted-dark">{zoomPct}%</span>
            <button onClick={() => zoomBy(1.2, canvasSize.width * scale / 2, canvasSize.height * scale / 2)} className="p-1.5 rounded border border-border-light dark:border-border-dark hover:bg-black/[0.03] dark:hover:bg-white/[0.05]" title="Zoom in">
              <ZoomIn size={14} />
            </button>
            <button onClick={resetView} className="p-1.5 rounded border border-border-light dark:border-border-dark hover:bg-black/[0.03] dark:hover:bg-white/[0.05]" title="Fit to view">
              <Maximize size={14} />
            </button>
          </div>
        </div>

        {/* Canvas size + layers toggles */}
        <div className="flex flex-wrap items-center gap-2 mb-2 px-1">
          <button onClick={() => setShowCanvasSettings((s) => !s)} className="flex items-center gap-1.5 text-xs text-muted-light dark:text-muted-dark hover:text-primary">
            <Settings2 size={14} /> Canvas size ({canvasSize.width}×{canvasSize.height}px)
          </button>
          <button onClick={() => setIsLayersExpanded((p) => !p)} className="ml-auto flex items-center gap-1.5 text-xs text-muted-light dark:text-muted-dark hover:text-primary">
            <Menu size={14} /> Layers ({layers.length})
          </button>
        </div>

        {showCanvasSettings && (
          <div className="mb-3 p-3 rounded-lg border border-[color:var(--line)] bg-black/[0.03] dark:bg-white/[0.03] space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-muted-light dark:text-muted-dark">Width</label>
              <input
                type="number" min={1} max={4000} value={sizeInputs.width}
                onChange={(e) => setSizeInputs((s) => ({ ...s, width: Number(e.target.value) }))}
                className="w-20 text-xs px-2 py-1 rounded border border-border-light dark:border-border-dark bg-transparent"
              />
              <label className="text-xs text-muted-light dark:text-muted-dark">Height</label>
              <input
                type="number" min={1} max={4000} value={sizeInputs.height}
                onChange={(e) => setSizeInputs((s) => ({ ...s, height: Number(e.target.value) }))}
                className="w-20 text-xs px-2 py-1 rounded border border-border-light dark:border-border-dark bg-transparent"
              />
              <button onClick={() => applyCanvasSize(sizeInputs.width, sizeInputs.height, 'scale')} className="text-xs px-2 py-1 rounded border border-primary-500/40 text-primary-600 dark:text-primary-300 hover:bg-primary-500/10">
                Resize (scale content)
              </button>
              <button
                onClick={() => { if (confirm('Start a new blank canvas at this size? This discards current artwork.')) applyCanvasSize(sizeInputs.width, sizeInputs.height, 'blank') }}
                className="text-xs px-2 py-1 rounded border border-border-light dark:border-border-dark hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              >
                New blank canvas
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CANVAS_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setSizeInputs({ width: p.w, height: p.h })}
                  className="text-[11px] px-2 py-1 rounded border border-border-light dark:border-border-dark hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLayersExpanded && (
          <div className="space-y-1 p-2 mb-3 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] max-h-80 overflow-y-auto">
            {displayedLayers.map((layer) => {
              const idx = layers.findIndex((l) => l.id === layer.id)
              const isActive = layer.id === activeLayerId
              return (
                <div
                  key={layer.id}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={cn(
                    'flex items-center gap-2 p-1.5 rounded border cursor-pointer',
                    isActive ? 'border-ember-500/60 bg-primary-500/10' : 'border-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                  )}
                >
                  <button onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id) }} className="p-1" title={layer.status === 'visible' ? 'Hide' : 'Show'}>
                    {layer.status === 'visible' ? <Eye size={14} /> : <EyeOff size={14} className="opacity-50" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id) }} className="p-1" title={layer.lock === 'locked' ? 'Unlock' : 'Lock'}>
                    {layer.lock === 'locked' ? <Lock size={14} className="text-red-500" /> : <Unlock size={14} className="opacity-40" />}
                  </button>
                  <input
                    value={layer.name}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => renameLayer(layer.id, e.target.value)}
                    className={cn('flex-1 min-w-0 bg-transparent text-sm outline-none', layer.status === 'hidden' && 'line-through opacity-60')}
                  />
                  <input
                    type="range" min={0} max={1} step={0.05} value={layer.opacity ?? 1}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setLayerOpacity(layer.id, Number(e.target.value))}
                    className="w-14 accent-primary-500"
                    title="Layer opacity"
                  />
                  <div className="flex gap-0.5">
                    <button onClick={(e) => { e.stopPropagation(); reorderLayer(layer.id, 'up') }} disabled={idx === layers.length - 1} className="p-1 disabled:opacity-30" title="Move up" aria-label="Pindah layer ke atas"><ChevronUp size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); reorderLayer(layer.id, 'down') }} disabled={idx === 0} className="p-1 disabled:opacity-30" title="Move down" aria-label="Pindah layer ke bawah"><ChevronDown size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id) }} className="p-1 text-primary" title="Duplicate" aria-label="Duplikat layer"><Copy size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id) }} className="p-1 text-destructive" title="Delete"><Trash2 size={12} /></button>
                  </div>
                </div>
              )
            })}
            <div className="flex gap-2 pt-1">
              <button onClick={addLayer} className="flex-1 text-xs text-primary text-center hover:underline py-1"><Plus size={12} className="inline mr-1" />Add layer</button>
              <button onClick={clearActiveLayer} className="flex-1 text-xs text-destructive text-center hover:underline py-1">Clear active layer</button>
            </div>
          </div>
        )}

        {/* Canvas viewport */}
        <div
          ref={wrapRef}
          className="relative w-full h-[60vh] sm:h-[70vh] rounded-2xl overflow-hidden border border-[color:var(--line)] bg-black/[0.06] dark:bg-black/40 shadow-card"
          onWheel={onWheel}
          onContextMenu={onContextMenu}
        >
          <canvas
            ref={displayCanvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            className="absolute touch-none shadow-pop bg-white"
            style={{
              left: translateX,
              top: translateY,
              width: canvasSize.width * scale,
              height: canvasSize.height * scale,
              cursor: activeLayer?.lock === 'locked' ? 'not-allowed' : (isPanning ? 'grabbing' : 'crosshair'),
            }}
          />
          <canvas
            ref={overlayCanvasRef}
            className="absolute pointer-events-none"
            style={{
              left: translateX,
              top: translateY,
              width: canvasSize.width * scale,
              height: canvasSize.height * scale,
            }}
          />
        </div>
        <p className="text-center pt-2 text-xs text-muted-light dark:text-muted-dark">
          Right-click / middle-click drag to pan &middot; scroll to zoom &middot; drawing on layer: <strong>{activeLayer?.name}</strong>
        </p>
      </Card>
    </div>
  )
}