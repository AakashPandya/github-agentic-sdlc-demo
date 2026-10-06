// Draws connectors for the PNG diagrams. Each connector is an empty element:
//   <i data-wire data-from="id:side[:pos]" data-to="id:side[:pos]" ...></i>
// side is l, r, t or b; pos is a 0..1 fraction along that side (default 0.5).
// Optional attributes:
//   data-route   straight | h | v | hv | vh | hvh | vhv (default straight)
//   data-via     x for hvh, y for vhv (defaults to the midpoint)
//   data-points  extra bend points "x,y x,y" placed between the two anchors
//   data-tone    agent | actions | human | model | guard | fail | repo
//   data-dash    dashed stroke
//   data-both    arrowheads on both ends
//   data-label   text; data-label-at (0..1 along the path), data-label-dx, data-label-dy
const SVG_NS = 'http://www.w3.org/2000/svg'
const TONE_COLORS = {
  agent: '#8250df',
  actions: '#0969da',
  human: '#1a7f37',
  model: '#0b7a75',
  guard: '#9a6700',
  fail: '#cf222e',
  repo: '#8c959f',
}

function anchor(canvasRect, spec) {
  const [id, side = 'r', pos = '0.5'] = spec.split(':')
  const el = document.getElementById(id)
  if (!el) throw new Error(`Missing element #${id}`)
  const r = el.getBoundingClientRect()
  const left = r.left - canvasRect.left
  const top = r.top - canvasRect.top
  const t = Number(pos)
  if (side === 'l') return { x: left, y: top + r.height * t }
  if (side === 'r') return { x: left + r.width, y: top + r.height * t }
  if (side === 't') return { x: left + r.width * t, y: top }
  return { x: left + r.width * t, y: top + r.height }
}

function routePoints(a, b, route, via, extra) {
  if (extra.length) return [a, ...extra, b]
  if (route === 'h') return [a, { x: b.x, y: a.y }]
  if (route === 'v') return [a, { x: a.x, y: b.y }]
  if (route === 'hv') return [a, { x: b.x, y: a.y }, b]
  if (route === 'vh') return [a, { x: a.x, y: b.y }, b]
  if (route === 'hvh') {
    const x = via ?? (a.x + b.x) / 2
    return [a, { x, y: a.y }, { x, y: b.y }, b]
  }
  if (route === 'vhv') {
    const y = via ?? (a.y + b.y) / 2
    return [a, { x: a.x, y }, { x: b.x, y }, b]
  }
  return [a, b]
}

function roundedPath(pts, radius) {
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length - 1; i++) {
    const p0 = pts[i - 1]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const d1 = Math.hypot(p1.x - p0.x, p1.y - p0.y)
    const d2 = Math.hypot(p2.x - p1.x, p2.y - p1.y)
    const r = Math.min(radius, d1 / 2, d2 / 2)
    if (r < 0.5) {
      d += ` L ${p1.x} ${p1.y}`
      continue
    }
    const q0x = p1.x + ((p0.x - p1.x) * r) / d1
    const q0y = p1.y + ((p0.y - p1.y) * r) / d1
    const q2x = p1.x + ((p2.x - p1.x) * r) / d2
    const q2y = p1.y + ((p2.y - p1.y) * r) / d2
    d += ` L ${q0x} ${q0y} Q ${p1.x} ${p1.y} ${q2x} ${q2y}`
  }
  const last = pts[pts.length - 1]
  return `${d} L ${last.x} ${last.y}`
}

function pointAlong(pts, fraction) {
  const lengths = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y))
  let remaining = lengths.reduce((sum, n) => sum + n, 0) * fraction
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] || i === lengths.length - 1) {
      const t = lengths[i] ? remaining / lengths[i] : 0
      return {
        x: pts[i].x + (pts[i + 1].x - pts[i].x) * t,
        y: pts[i].y + (pts[i + 1].y - pts[i].y) * t,
      }
    }
    remaining -= lengths[i]
  }
  return pts[0]
}

function addMarkers(svg) {
  const defs = document.createElementNS(SVG_NS, 'defs')
  for (const [tone, color] of Object.entries(TONE_COLORS)) {
    const marker = document.createElementNS(SVG_NS, 'marker')
    marker.setAttribute('id', `arrow-${tone}`)
    marker.setAttribute('viewBox', '0 0 12 12')
    marker.setAttribute('refX', '11')
    marker.setAttribute('refY', '6')
    marker.setAttribute('markerWidth', '12')
    marker.setAttribute('markerHeight', '12')
    marker.setAttribute('markerUnits', 'userSpaceOnUse')
    marker.setAttribute('orient', 'auto-start-reverse')
    const head = document.createElementNS(SVG_NS, 'path')
    head.setAttribute('d', 'M 1 1.5 L 11 6 L 1 10.5 Z')
    head.setAttribute('fill', color)
    marker.appendChild(head)
    defs.appendChild(marker)
  }
  svg.appendChild(defs)
}

function drawWires(canvas) {
  const canvasRect = canvas.getBoundingClientRect()
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('class', 'wires')
  addMarkers(svg)
  canvas.appendChild(svg)

  for (const el of canvas.querySelectorAll('[data-wire]')) {
    const tone = el.dataset.tone || 'repo'
    const a = anchor(canvasRect, el.dataset.from)
    const b = anchor(canvasRect, el.dataset.to)
    const via = el.dataset.via === undefined ? undefined : Number(el.dataset.via)
    const extra = (el.dataset.points || '')
      .split(/\s+/)
      .filter(Boolean)
      .map((pair) => {
        const [x, y] = pair.split(',').map(Number)
        return { x, y }
      })
    const pts = routePoints(a, b, el.dataset.route || 'straight', via, extra)

    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', roundedPath(pts, 12))
    path.setAttribute('class', `wire tone-${tone}${el.hasAttribute('data-dash') ? ' dash' : ''}`)
    path.setAttribute('marker-end', `url(#arrow-${tone})`)
    if (el.hasAttribute('data-both')) path.setAttribute('marker-start', `url(#arrow-${tone})`)
    svg.appendChild(path)

    if (el.dataset.label) {
      const at = pointAlong(pts, Number(el.dataset.labelAt ?? 0.5))
      const label = document.createElement('div')
      label.className = `wire-label tone-${tone}`
      label.innerHTML = el.dataset.label
      label.style.left = `${at.x + Number(el.dataset.labelDx ?? 0)}px`
      label.style.top = `${at.y + Number(el.dataset.labelDy ?? 0)}px`
      canvas.appendChild(label)
    }
  }
}

for (const canvas of document.querySelectorAll('.canvas')) drawWires(canvas)
