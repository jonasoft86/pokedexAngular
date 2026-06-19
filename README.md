# Pokédex Angular

Aplicación responsive para explorar Pokémon con datos reales de
[PokéAPI](https://pokeapi.co/), desarrollada con Angular 22, componentes
standalone, signals y NgRx SignalStore.

> La documentación detallada y actualizada está disponible en
> [README.angular.md](./README.angular.md).

## Inicio rápido

Requiere Node.js `22.22.3` o superior.

```bash
nvm install
nvm use
npm install
npm start
```

La aplicación estará disponible normalmente en `http://localhost:4200`.

## Funcionalidades

- Búsqueda, filtros, orden y paginación.
- Detalle con estadísticas, evoluciones, movimientos y ubicaciones.
- Página `/favoritos` vinculada con el home.
- Favoritos, Pokémon vistos y tema persistidos en `localStorage`.
- Modo oscuro y diseño responsive.

## Stack

- Angular 22
- Angular Router y HttpClient
- Angular Signals
- NgRx SignalStore
- TypeScript, RxJS y Sass

## ¿Por qué Signals + SignalStore?

Angular Signals se usa para el estado reactivo local y derivado porque se
integra directamente con la detección de cambios zoneless de Angular 22. La
plantilla lee signals y Angular actualiza únicamente sus consumidores, sin
suscripciones manuales para el estado síncrono.

NgRx SignalStore aporta una estructura predecible al estado compartido:

- `withState` define una única fuente de verdad.
- `withComputed` deriva filtros, páginas y contadores sin duplicar datos.
- `withMethods` agrupa las acciones que modifican el estado.
- `rxMethod` conecta RxJS y las peticiones HTTP con estados de carga, éxito y
  error.

Esta combinación mantiene los componentes enfocados en presentación, evita
propagar estado por varios niveles y conserva RxJS donde aporta más valor:
operaciones asíncronas, cancelación y composición de llamadas a PokéAPI.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm start` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run watch` | Compilación automática |
| `npm test` | Ejecuta una vez los tests con Vitest |
| `npm run test:watch` | Ejecuta los tests en modo observación |

## Tests

La suite usa Vitest, el runner predeterminado de Angular 22, y cubre:

- Helpers puros y transformación de datos.
- Requests del servicio mediante `HttpTestingController`.
- Carga, filtrado, orden, favoritos y paginación del SignalStore.

```bash
npm test
npm run test:watch
```

---

## Documentación anterior

Aplicación web responsive para explorar Pokémon mediante datos obtenidos desde
[PokéAPI](https://pokeapi.co/). Permite consultar información detallada, filtrar
el listado, revisar estadísticas y ubicaciones reales, y guardar Pokémon
favoritos en el navegador.

## Características

- Listado paginado de Pokémon.
- Búsqueda por nombre o número.
- Filtro por tipo.
- Orden por número o nombre.
- Ficha detallada del Pokémon seleccionado.
- Tipos, altura, peso, habilidad y forma.
- Estadísticas base con barras y gráfico radar.
- Vista previa de evoluciones.
- Movimientos principales.
- Ubicaciones reales obtenidas desde PokéAPI.
- Probabilidad máxima de encuentro por ubicación.
- Lista persistente de favoritos mediante `localStorage`.
- Modo claro y oscuro.
- Diseño responsive para escritorio, tablet y móvil.
- Estados de carga, error y ausencia de resultados.

## Tecnologías

- [Vue 3](https://vuejs.org/) con Composition API
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/vue/overview)
- [Axios](https://axios-http.com/)
- [Sass](https://sass-lang.com/)
- [Iconify](https://iconify.design/)
- [PokéAPI](https://pokeapi.co/)

## Requisitos

- Node.js `20.19+` o `22.12+`
- npm

El proyecto fue verificado con Node.js 22.

## Instalación

```bash
git clone <URL_DEL_REPOSITORIO>
cd pokePrueba4
npm install
```

## Desarrollo

```bash
npm run dev
```

Vite mostrará en la terminal la URL local de la aplicación.

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Ejecuta el chequeo de tipos y genera la versión de producción |
| `npm run build-only` | Genera la versión de producción sin ejecutar el chequeo de tipos |
| `npm run type-check` | Valida los tipos con `vue-tsc` |
| `npm run lint` | Analiza y corrige archivos con ESLint |
| `npm run format` | Formatea el contenido de `src/` con Prettier |
| `npm run preview` | Sirve localmente el build generado |

## Rutas

| Ruta | Vista |
| --- | --- |
| `/` | Pokédex principal |
| `/team` | Lista de Pokémon favoritos |
| `/team/:id` | Vista de detalle heredada |

## Estructura principal

```text
src/
├── assets/
│   └── scss/
│       └── pages/               # Estilos de Pokédex y favoritos
├── pokemons/
│   ├── api/                     # Cliente Axios de PokéAPI
│   ├── components/
│   │   ├── PokedexDashboard.vue # Coordinación de la pantalla principal
│   │   └── pokedex/             # Paneles visuales de la Pokédex
│   ├── composables/             # Consultas reactivas con TanStack Query
│   ├── helpers/                 # Llamadas API y funciones de presentación
│   ├── interfaces/              # Contratos TypeScript
│   ├── store/                   # Estado de listado y favoritos
│   └── views/                   # Vistas asociadas al router
└── router/                      # Configuración de rutas
```

## Datos y endpoints

La aplicación consume principalmente:

```text
GET /pokemon
GET /pokemon/{id}
GET /pokemon/{id}/encounters
```

Las ubicaciones se ordenan usando el valor `max_chance` más alto disponible
entre las versiones de juego informadas por PokéAPI. La interfaz muestra las
cuatro zonas con mayor probabilidad.

Algunos Pokémon no poseen encuentros salvajes registrados. En esos casos se
muestra un estado vacío en lugar de ubicaciones.

## Favoritos

Los Pokémon marcados con el corazón se almacenan en:

```text
localStorage["pokedex-liked-pokemon"]
```

Esto permite conservar los favoritos después de recargar o cerrar la página en
el mismo navegador. No se requiere autenticación ni una base de datos.

## Diseño responsive

La interfaz adapta su comportamiento según el ancho disponible:

- Escritorio: sidebar y ficha de detalle en paralelo.
- Tablet: listado horizontal y ficha principal debajo.
- Móvil: cabecera compacta, controles táctiles y paneles de una columna.

También se respeta `prefers-reduced-motion` para reducir animaciones cuando el
usuario lo solicita desde el sistema operativo.

## Generar el build

```bash
npm run build
```

Los archivos optimizados se generan dentro de:

```text
dist/
```

Para comprobarlos localmente:

```bash
npm run preview
```

## Fuente de los datos

Los datos e imágenes pertenecen a sus respectivos propietarios y son
proporcionados por [PokéAPI](https://pokeapi.co/).
