import './assets/scss/index.scss'

interface Pokemon {
  id: number
  name: string
  frontSprite: string
  types: Array<{ slot: number; type: { name: string } }>
  stats: Array<{ base_stat: number; stat: { name: string } }>
  height: number
  weight: number
}

const app = document.querySelector<HTMLElement>('#app')
if (!app) throw new Error('Root element not found')

app.innerHTML = `
  <div class="pokedex">
    <header class="topbar">
      <div class="brand">
        <span class="pokeball"><span></span></span>
        <div>
          <h1>Pokédex</h1>
          <p>Datos de placeholder cargados desde <code>data.json</code></p>
        </div>
      </div>
      <div class="search-box">
        <input id="search" type="search" placeholder="Buscar Pokémon..." aria-label="Buscar Pokémon" />
      </div>
    </header>
    <main>
      <section class="pokemon-grid" id="pokemon-grid"></section>
    </main>
  </div>
`

const pokemonGrid = document.getElementById('pokemon-grid')
const searchInput = document.getElementById('search') as HTMLInputElement
let pokemons: Pokemon[] = []

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function renderCard(pokemon: Pokemon) {
  const types = pokemon.types
    .map((item) => `<span class="type">${item.type.name}</span>`)
    .join('')
  const hpStat = pokemon.stats.find((stat) => stat.stat.name === 'hp')?.base_stat ?? '--'

  return `
    <article class="pokemon-card">
      <img src="${pokemon.frontSprite}" alt="${pokemon.name}" />
      <div class="pokemon-card-body">
        <div class="card-header">
          <strong>#${pokemon.id.toString().padStart(3, '0')}</strong>
          <h2>${capitalize(pokemon.name)}</h2>
        </div>
        <div class="card-types">${types}</div>
        <div class="card-stats">
          <span>HP ${hpStat}</span>
          <span>Alt ${pokemon.height}</span>
          <span>Peso ${pokemon.weight}</span>
        </div>
      </div>
    </article>
  `
}

function renderPokemons(list: Pokemon[]) {
  if (!pokemonGrid) return
  pokemonGrid.innerHTML = list.map(renderCard).join('')
}

async function loadData() {
  try {
    const response = await fetch('/data.json')
    if (!response.ok) throw new Error('No se pudo cargar data.json')
    pokemons = await response.json()
    renderPokemons(pokemons)
  } catch (error) {
    if (!pokemonGrid) return
    pokemonGrid.innerHTML = `<p class="error">Error al cargar datos.</p>`
    console.error(error)
  }
}

searchInput?.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase()
  const filtered = pokemons.filter(
    (pokemon) => pokemon.name.toLowerCase().includes(query) || pokemon.id.toString().includes(query)
  )
  renderPokemons(filtered)
})

loadData()
