import './assets/scss/pokedex-app.scss'

document.title = 'Pokédex'

interface Pokemon {
  id: number
  name: string
  frontSprite: string
  types: Array<{ slot: number; type: { name: string } }>
  sprites?: { other?: { 'official-artwork'?: { front_default?: string } } }
  stats: Array<{ base_stat: number; stat: { name: string } }>
  height: number
  weight: number
  abilities?: Array<{ ability: { name: string }; is_hidden: boolean }>
  forms?: Array<{ name: string }>
}

type SortOrder = 'number-asc' | 'number-desc' | 'name-asc' | 'name-desc'

const root = document.querySelector<HTMLElement>('#app')
if (!root) throw new Error('No se encontró el elemento raíz')
const app: HTMLElement = root

const PAGE_SIZE = 8
const KEYS = { favorites: 'pokedex-favorites', theme: 'pokedex-theme', viewed: 'pokedex-viewed' }

const typeNames: Record<string, string> = {
  normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico',
  grass: 'Planta', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
  ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
  rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
  steel: 'Acero', fairy: 'Hada',
}

const typeIcons: Record<string, string> = {
  electric: 'ϟ', fire: '◆', water: '●', grass: '✦', poison: '◉',
  flying: '⌁', normal: '○', ground: '▲', psychic: '✺',
}

const speciesLabels: Record<number, string> = {
  1: 'Pokémon Semilla', 4: 'Pokémon Lagartija', 7: 'Pokémon Tortuguita',
  25: 'Pokémon Ratón', 39: 'Pokémon Globo', 43: 'Pokémon Hierbajo',
  50: 'Pokémon Topo', 52: 'Pokémon Gato Araña', 54: 'Pokémon Pato',
  69: 'Pokémon Flor', 129: 'Pokémon Pez', 133: 'Pokémon Evolución',
  143: 'Pokémon Dormilón',
}

const evolutionChains: Record<number, number[]> = {
  1: [1, 2, 3], 4: [4, 5, 6], 7: [7, 8, 9], 25: [172, 25, 26],
  39: [174, 39, 40], 43: [43, 44, 45], 50: [50, 51], 52: [52, 53],
  54: [54, 55], 69: [69, 70, 71], 129: [129, 130],
  133: [133, 134, 135, 136], 143: [446, 143],
}

const pokemonNames: Record<number, string> = {
  1: 'Bulbasaur', 2: 'Ivysaur', 3: 'Venusaur', 4: 'Charmander', 5: 'Charmeleon',
  6: 'Charizard', 7: 'Squirtle', 8: 'Wartortle', 9: 'Blastoise', 25: 'Pikachu',
  26: 'Raichu', 39: 'Jigglypuff', 40: 'Wigglytuff', 43: 'Oddish', 44: 'Gloom',
  45: 'Vileplume', 50: 'Diglett', 51: 'Dugtrio', 52: 'Meowth', 53: 'Persian',
  54: 'Psyduck', 55: 'Golduck', 69: 'Bellsprout', 70: 'Weepinbell',
  71: 'Victreebel', 129: 'Magikarp', 130: 'Gyarados', 133: 'Eevee',
  134: 'Vaporeon', 135: 'Jolteon', 136: 'Flareon', 143: 'Snorlax',
  172: 'Pichu', 174: 'Igglybuff', 446: 'Munchlax',
}

const movesByType: Record<string, Array<[string, string, number]>> = {
  electric: [['Impactrueno', 'electric', 30], ['Ataque Rápido', 'normal', 30], ['Onda Trueno', 'electric', 20], ['Chispa', 'electric', 20]],
  fire: [['Ascuas', 'fire', 25], ['Arañazo', 'normal', 35], ['Colmillo Ígneo', 'fire', 15], ['Pantalla de Humo', 'normal', 20]],
  water: [['Pistola Agua', 'water', 25], ['Placaje', 'normal', 35], ['Burbuja', 'water', 30], ['Mordisco', 'normal', 25]],
  grass: [['Látigo Cepa', 'grass', 25], ['Placaje', 'normal', 35], ['Hoja Afilada', 'grass', 25], ['Drenadoras', 'grass', 10]],
  normal: [['Placaje', 'normal', 35], ['Ataque Rápido', 'normal', 30], ['Golpe Cuerpo', 'normal', 15], ['Gruñido', 'normal', 40]],
  poison: [['Ácido', 'poison', 30], ['Absorber', 'grass', 25], ['Polvo Veneno', 'poison', 35], ['Dulce Aroma', 'normal', 20]],
  ground: [['Bofetón Lodo', 'ground', 10], ['Arañazo', 'normal', 35], ['Excavar', 'ground', 10], ['Impresionar', 'normal', 15]],
  psychic: [['Confusión', 'psychic', 25], ['Arañazo', 'normal', 35], ['Anulación', 'normal', 20], ['Psicorrayo', 'psychic', 20]],
}

let pokemons: Pokemon[] = []
let selectedId = 25
let searchQuery = ''
let selectedType = 'all'
let sortOrder: SortOrder = 'number-asc'
let currentPage = 1
let favorites = readSet(KEYS.favorites)
let viewed = readSet(KEYS.viewed)
let isDark = localStorage.getItem(KEYS.theme) === 'dark'

function readSet(key: string): Set<number> {
  try {
    return new Set<number>(JSON.parse(localStorage.getItem(key) ?? '[]'))
  } catch {
    return new Set<number>()
  }
}

function saveSet(key: string, value: Set<number>) {
  localStorage.setItem(key, JSON.stringify([...value]))
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function prettyName(value: string) {
  return value.split('-').map(capitalize).join(' ')
}

function pokemonNumber(id: number) {
  return `#${id.toString().padStart(3, '0')}`
}

function artwork(pokemon: Pokemon) {
  return pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.frontSprite
}

function artworkById(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

function getFilteredPokemons() {
  const query = searchQuery.toLocaleLowerCase('es')
  const list = pokemons.filter((pokemon) => {
    const matchesSearch = pokemon.name.toLowerCase().includes(query) || pokemon.id.toString().includes(query)
    const matchesType = selectedType === 'all' || pokemon.types.some(({ type }) => type.name === selectedType)
    return matchesSearch && matchesType
  })
  return list.sort((a, b) => {
    if (sortOrder === 'number-desc') return b.id - a.id
    if (sortOrder === 'name-asc') return a.name.localeCompare(b.name)
    if (sortOrder === 'name-desc') return b.name.localeCompare(a.name)
    return a.id - b.id
  })
}

const searchIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
const chevronIcon = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 9.5 5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`

function renderShell() {
  app.innerHTML = `
    <div class="pokedex${isDark ? ' is-dark' : ''}">
      <header class="topbar">
        <div class="brand"><span class="pokeball"><span></span></span><span>POKÉDEX</span></div>
        <label class="search-box">
          <input id="search" type="search" placeholder="Buscar Pokémon..." aria-label="Buscar Pokémon" autocomplete="off">
          ${searchIcon}
        </label>
        <div class="theme-control">
          <span class="likes-link"><span>♡ Favoritos</span><strong id="favorite-count">${favorites.size}</strong></span>
          <span aria-hidden="true">${isDark ? '☾' : '☀'}</span>
          <button class="theme-switch${isDark ? ' active' : ''}" id="theme-toggle" type="button" aria-label="Cambiar tema"><span></span></button>
          <strong>${isDark ? 'Claro' : 'Oscuro'}</strong>
        </div>
      </header>
      <main class="workspace">
        <aside class="pokemon-sidebar">
          <div class="sidebar-summary">
            <div><span>Total</span><strong>${pokemons.length}</strong></div>
            <div><span>Vistos</span><strong id="viewed-count">${viewed.size}</strong></div>
          </div>
          <div class="filters">
            <label><select id="type-filter" aria-label="Filtrar por tipo"></select>${chevronIcon}</label>
            <label><select id="sort-order" aria-label="Ordenar Pokémon">
              <option value="number-asc">Orden: Número (Asc)</option>
              <option value="number-desc">Orden: Número (Desc)</option>
              <option value="name-asc">Orden: Nombre (A-Z)</option>
              <option value="name-desc">Orden: Nombre (Z-A)</option>
            </select>${chevronIcon}</label>
          </div>
          <div class="pokemon-list" id="pokemon-list"></div>
          <nav class="pagination" id="pagination" aria-label="Paginación"></nav>
        </aside>
        <section class="detail-column" id="pokemon-detail"></section>
      </main>
      <footer><span>© 2026 Pokédex — Datos proporcionados por la PokéAPI</span></footer>
    </div>`

  const types = [...new Set(pokemons.flatMap((pokemon) => pokemon.types.map(({ type }) => type.name)))].sort()
  const typeFilter = document.querySelector<HTMLSelectElement>('#type-filter')
  if (typeFilter) {
    typeFilter.innerHTML = `<option value="all">Todos los tipos</option>${types
      .map((type) => `<option value="${type}">${typeNames[type] ?? capitalize(type)}</option>`).join('')}`
    typeFilter.value = selectedType
  }
  const sortSelect = document.querySelector<HTMLSelectElement>('#sort-order')
  if (sortSelect) sortSelect.value = sortOrder
  bindEvents()
  selectPokemon(selectedId)
}

function renderList() {
  const listElement = document.querySelector<HTMLElement>('#pokemon-list')
  const paginationElement = document.querySelector<HTMLElement>('#pagination')
  if (!listElement || !paginationElement) return

  const filtered = getFilteredPokemons()
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  currentPage = Math.min(currentPage, pageCount)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  listElement.innerHTML = pageItems.length
    ? pageItems.map((pokemon) => `
      <button class="pokemon-list-item${pokemon.id === selectedId ? ' active' : ''}" type="button" data-pokemon-id="${pokemon.id}">
        <span class="list-image"><img src="${pokemon.frontSprite}" alt="" loading="lazy"></span>
        <span class="list-copy"><small>${pokemonNumber(pokemon.id)}</small><strong>${capitalize(pokemon.name)}</strong></span>
      </button>`).join('')
    : `<p class="empty-result">No encontramos ningún Pokémon.</p>`

  paginationElement.innerHTML = `
    <button type="button" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Página anterior">‹</button>
    ${Array.from({ length: pageCount }, (_, index) => index + 1).map((page) =>
      `<button type="button" data-page="${page}" class="${page === currentPage ? 'active' : ''}">${page}</button>`).join('')}
    <button type="button" data-page="${currentPage + 1}" ${currentPage === pageCount ? 'disabled' : ''} aria-label="Página siguiente">›</button>`
}

function renderTypeBadges(pokemon: Pokemon) {
  return pokemon.types.map(({ type }) => `
    <span class="type-badge type-${type.name}">
      <span aria-hidden="true">${typeIcons[type.name] ?? '●'}</span>${typeNames[type.name] ?? type.name}
    </span>`).join('')
}

function radarPoints(stats: number[]) {
  return stats.map((stat, index) => {
    const angle = (-90 + index * 60) * Math.PI / 180
    const radius = Math.min(stat / 150, 1) * 64
    return `${100 + Math.cos(angle) * radius},${100 + Math.sin(angle) * radius}`
  }).join(' ')
}

function renderRadar(stats: number[]) {
  return `
    <div class="radar-chart" aria-label="Gráfico de estadísticas">
      <svg viewBox="0 0 200 200" role="img">
        <polygon class="radar-grid" points="100,28 162,64 162,136 100,172 38,136 38,64"/>
        <polygon class="radar-grid" points="100,52 141,76 141,124 100,148 59,124 59,76"/>
        <polygon class="radar-grid" points="100,76 121,88 121,112 100,124 79,112 79,88"/>
        <path class="radar-line" d="M100 28v144M38 64l124 72M162 64 38 136"/>
        <polygon class="radar-value" points="${radarPoints(stats)}"/>
      </svg>
      <span class="radar-label label-hp">PS</span><span class="radar-label label-attack">Ataque</span>
      <span class="radar-label label-defense">Defensa</span><span class="radar-label label-special-defense">Def. Esp.</span>
      <span class="radar-label label-special-attack">Atq. Esp.</span><span class="radar-label label-speed">Velocidad</span>
    </div>`
}

function renderEvolutions(pokemon: Pokemon) {
  return (evolutionChains[pokemon.id] ?? [pokemon.id]).map((id, index) => `
    ${index ? '<span class="evolution-arrow" aria-hidden="true">→</span>' : ''}
    <article class="evolution-card">
      <div><img src="${artworkById(id)}" alt="${pokemonNames[id] ?? `Pokémon ${id}`}" loading="lazy"></div>
      <strong>${pokemonNames[id] ?? `#${id}`}</strong>
      ${id === pokemon.id ? '<span title="Pokémon seleccionado">◆</span>' : ''}
    </article>`).join('')
}

function renderMoves(pokemon: Pokemon) {
  const primaryType = pokemon.types[0]?.type.name ?? 'normal'
  return (movesByType[primaryType] ?? movesByType.normal).map(([name, type, pp], index) => `
    <div class="move-item">
      <strong>${name}</strong>
      <span class="move-type type-${type}">${typeIcons[type] ?? '○'} ${typeNames[type] ?? type}</span>
      <small>PP ${Math.max(5, pp - index * 5)}/${pp}</small>
    </div>`).join('')
}

function renderDetail(pokemon: Pokemon) {
  const detail = document.querySelector<HTMLElement>('#pokemon-detail')
  if (!detail) return
  const stats = pokemon.stats.map((stat) => stat.base_stat)
  const statLabels = ['PS', 'Ataque', 'Defensa', 'Ataque Especial', 'Defensa Especial', 'Velocidad']
  const primaryType = pokemon.types[0]?.type.name ?? 'normal'
  const ability = prettyName(pokemon.abilities?.find((item) => !item.is_hidden)?.ability.name ?? 'Desconocida')
  const form = prettyName(pokemon.forms?.[0]?.name ?? 'Normal')
  const isFavorite = favorites.has(pokemon.id)

  detail.innerHTML = `
    <article class="panel hero-panel halo-${primaryType}">
      <button class="favorite-button${isFavorite ? ' active' : ''}" id="favorite-toggle" type="button" aria-label="${isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}">${isFavorite ? '♥' : '♡'}</button>
      <div class="hero-copy">
        <span class="pokemon-number">${pokemonNumber(pokemon.id)}</span>
        <h1>${capitalize(pokemon.name)}</h1>
        <p>${speciesLabels[pokemon.id] ?? 'Pokémon singular'}</p>
        <div class="type-row">${renderTypeBadges(pokemon)}</div>
      </div>
      <div class="artwork-wrap"><span class="artwork-halo"></span><img src="${artwork(pokemon)}" alt="${capitalize(pokemon.name)}"></div>
      <div class="quick-facts">
        <div><span>Altura</span><strong>${(pokemon.height / 10).toFixed(1)} m</strong></div>
        <div><span>Peso</span><strong>${(pokemon.weight / 10).toFixed(1)} kg</strong></div>
        <div><span>Habilidad</span><strong>${ability}</strong></div>
        <div><span>Forma</span><strong>${form}</strong></div>
      </div>
    </article>
    <article class="panel stats-panel">
      <div><h2>Estadísticas base</h2><div class="stat-list">
        ${stats.map((stat, index) => `<div class="stat-item"><span>${statLabels[index]}</span><span class="stat-track"><span class="stat-color-${index}" style="width:${Math.min(stat / 1.5, 100)}%"></span></span><strong>${stat}</strong></div>`).join('')}
        <div class="stat-total"><span>Total</span><strong>${stats.reduce((total, stat) => total + stat, 0)}</strong></div>
      </div></div>${renderRadar(stats)}
    </article>
    <article class="panel evolution-panel"><h2>Evoluciones</h2><div class="evolution-row">${renderEvolutions(pokemon)}</div></article>
    <article class="panel info-panel">
      <section class="moves-column"><h2>Movimientos principales</h2><div class="moves-list">${renderMoves(pokemon)}</div><span class="text-link">Ver todos los movimientos <span>→</span></span></section>
      <section class="locations-column"><h2>Hábitat habitual</h2><div class="location-list">
        <div><span>Praderas y bosques</span><strong>40%</strong></div><div><span>Rutas Pokémon</span><strong>30%</strong></div>
        <div><span>Zonas especiales</span><strong>20%</strong></div><div><span>Encuentro poco común</span><strong>10%</strong></div>
      </div><span class="text-link">Ver todas las ubicaciones <span>→</span></span></section>
    </article>`
  document.querySelector('#favorite-toggle')?.addEventListener('click', toggleFavorite)
}

function selectPokemon(id: number) {
  const pokemon = pokemons.find((item) => item.id === id)
  if (!pokemon) return
  selectedId = id
  viewed.add(id)
  saveSet(KEYS.viewed, viewed)
  renderList()
  renderDetail(pokemon)
  const viewedCount = document.querySelector('#viewed-count')
  if (viewedCount) viewedCount.textContent = String(viewed.size)
}

function toggleFavorite() {
  if (favorites.has(selectedId)) favorites.delete(selectedId)
  else favorites.add(selectedId)
  saveSet(KEYS.favorites, favorites)
  const pokemon = pokemons.find((item) => item.id === selectedId)
  if (pokemon) renderDetail(pokemon)
  const count = document.querySelector('#favorite-count')
  if (count) count.textContent = String(favorites.size)
}

function bindEvents() {
  document.querySelector<HTMLInputElement>('#search')?.addEventListener('input', (event) => {
    searchQuery = (event.target as HTMLInputElement).value.trim()
    currentPage = 1
    renderList()
  })
  document.querySelector<HTMLSelectElement>('#type-filter')?.addEventListener('change', (event) => {
    selectedType = (event.target as HTMLSelectElement).value
    currentPage = 1
    renderList()
  })
  document.querySelector<HTMLSelectElement>('#sort-order')?.addEventListener('change', (event) => {
    sortOrder = (event.target as HTMLSelectElement).value as SortOrder
    currentPage = 1
    renderList()
  })
  document.querySelector('#pokemon-list')?.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-pokemon-id]')
    if (button?.dataset.pokemonId) selectPokemon(Number(button.dataset.pokemonId))
  })
  document.querySelector('#pagination')?.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-page]')
    if (!button || button.disabled) return
    currentPage = Number(button.dataset.page)
    renderList()
  })
  document.querySelector('#theme-toggle')?.addEventListener('click', () => {
    isDark = !isDark
    localStorage.setItem(KEYS.theme, isDark ? 'dark' : 'light')
    renderShell()
  })
}

async function loadData() {
  app.innerHTML = `<div class="state-message"><span class="loader"></span>Cargando Pokédex...</div>`
  try {
    const response = await fetch('/data.json')
    if (!response.ok) throw new Error('No se pudo cargar data.json')
    pokemons = await response.json()
    if (!pokemons.some((pokemon) => pokemon.id === selectedId)) selectedId = pokemons[0]?.id
    renderShell()
  } catch (error) {
    app.innerHTML = `<div class="state-message"><p>No pudimos cargar los datos de la Pokédex.</p></div>`
    console.error(error)
  }
}

loadData()
