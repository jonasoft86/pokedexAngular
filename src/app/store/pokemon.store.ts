import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { PokemonDetail, PokemonListItem, SortOrder } from '../models/pokemon.models';
import { PokeApiService } from '../services/poke-api.service';
import { PAGE_SIZE } from '../shared/pokemon.helpers';

interface PokemonState {
  catalog: PokemonListItem[];
  total: number;
  selected: PokemonDetail | null;
  favoriteDetails: PokemonDetail[];
  selectedId: number;
  search: string;
  type: string;
  typeIds: number[];
  sort: SortOrder;
  page: number;
  favorites: number[];
  viewed: number[];
  darkMode: boolean;
  loadingCatalog: boolean;
  loadingDetail: boolean;
  loadingFavorites: boolean;
  error: string | null;
}

const initialState: PokemonState = {
  catalog: [],
  total: 0,
  selected: null,
  favoriteDetails: [],
  selectedId: 25,
  search: '',
  type: 'all',
  typeIds: [],
  sort: 'number-asc',
  page: 1,
  favorites: readStorage('pokedex-favorites'),
  viewed: readStorage('pokedex-viewed'),
  darkMode: localStorage.getItem('pokedex-theme') === 'dark',
  loadingCatalog: false,
  loadingDetail: false,
  loadingFavorites: false,
  error: null,
};

function readStorage(key: string): number[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as number[];
  } catch {
    return [];
  }
}

function saveStorage(key: string, value: number[]): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const PokemonStore = signalStore(
  withState(initialState),
  withComputed((store) => {
    const filtered = computed(() => {
      const query = store.search().trim().toLocaleLowerCase('es');
      const typeIds = new Set(store.typeIds());
      const list = store.catalog().filter((pokemon) => {
        const matchesSearch = pokemon.name.includes(query) || pokemon.id.toString().includes(query);
        const matchesType = store.type() === 'all' || typeIds.has(pokemon.id);
        return matchesSearch && matchesType;
      });

      return [...list].sort((a, b) => {
        if (store.sort() === 'number-desc') return b.id - a.id;
        if (store.sort() === 'name-asc') return a.name.localeCompare(b.name);
        if (store.sort() === 'name-desc') return b.name.localeCompare(a.name);
        return a.id - b.id;
      });
    });

    const pageCount = computed(() => Math.max(1, Math.ceil(filtered().length / PAGE_SIZE)));
    const currentPage = computed(() => Math.min(store.page(), pageCount()));

    return {
      filtered,
      pageCount,
      currentPage,
      pageItems: computed(() => {
        const start = (currentPage() - 1) * PAGE_SIZE;
        return filtered().slice(start, start + PAGE_SIZE);
      }),
      pages: computed(() => {
        const total = pageCount();
        const current = currentPage();

        if (total <= 5) {
          return Array.from({ length: total }, (_, index) => index + 1);
        }

        if (current <= 3) {
          return [1, 2, 3, 'ellipsis', total] as const;
        }

        if (current >= total - 2) {
          return [1, 'ellipsis', total - 2, total - 1, total] as const;
        }

        return [1, 'ellipsis', current, 'ellipsis', total] as const;
      }),
      favoriteCount: computed(() => store.favorites().length),
      viewedCount: computed(() => store.viewed().length),
      isFavorite: computed(() => store.favorites().includes(store.selectedId())),
    };
  }),
  withMethods((store, api = inject(PokeApiService)) => ({
    loadCatalog: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loadingCatalog: true, error: null })),
        switchMap(() => api.getCatalog().pipe(
          tap(({ items, total }) => patchState(store, { catalog: items, total })),
          catchError(() => {
            patchState(store, { error: 'No pudimos cargar la lista de Pokémon.' });
            return EMPTY;
          }),
          finalize(() => patchState(store, { loadingCatalog: false })),
        )),
      ),
    ),
    selectPokemon: rxMethod<number>(
      pipe(
        tap((id) => {
          const viewed = store.viewed().includes(id) ? store.viewed() : [...store.viewed(), id];
          saveStorage('pokedex-viewed', viewed);
          patchState(store, { selectedId: id, viewed, loadingDetail: true, error: null });
        }),
        switchMap((id) => api.getPokemonDetail(id).pipe(
          tap((selected) => patchState(store, { selected })),
          catchError(() => {
            patchState(store, { error: 'No pudimos cargar el detalle de este Pokémon.' });
            return EMPTY;
          }),
          finalize(() => patchState(store, { loadingDetail: false })),
        )),
      ),
    ),
    loadFavorites: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loadingFavorites: true, error: null })),
        switchMap(() => api.getFavoriteDetails(store.favorites()).pipe(
          tap((favoriteDetails) => patchState(store, { favoriteDetails })),
          catchError(() => {
            patchState(store, { error: 'No pudimos cargar tus Pokémon favoritos.' });
            return EMPTY;
          }),
          finalize(() => patchState(store, { loadingFavorites: false })),
        )),
      ),
    ),
    setSearch(search: string): void {
      patchState(store, { search, page: 1 });
    },
    setSort(sort: SortOrder): void {
      patchState(store, { sort, page: 1 });
    },
    setPage(page: number): void {
      if (page >= 1 && page <= store.pageCount()) patchState(store, { page });
    },
    setType: rxMethod<string>(
      pipe(
        tap((type) => patchState(store, { type, typeIds: [], page: 1 })),
        switchMap((type) => api.getPokemonIdsByType(type).pipe(
          tap((typeIds) => patchState(store, { typeIds })),
          catchError(() => {
            patchState(store, { error: 'No pudimos aplicar el filtro por tipo.' });
            return EMPTY;
          }),
        )),
      ),
    ),
    toggleFavorite(): void {
      const id = store.selectedId();
      const favorites = store.favorites().includes(id)
        ? store.favorites().filter((item) => item !== id)
        : [...store.favorites(), id];
      saveStorage('pokedex-favorites', favorites);
      patchState(store, { favorites });
    },
    removeFavorite(id: number): void {
      const favorites = store.favorites().filter((item) => item !== id);
      saveStorage('pokedex-favorites', favorites);
      patchState(store, {
        favorites,
        favoriteDetails: store.favoriteDetails().filter((detail) => detail.pokemon.id !== id),
      });
    },
    toggleTheme(): void {
      const darkMode = !store.darkMode();
      localStorage.setItem('pokedex-theme', darkMode ? 'dark' : 'light');
      patchState(store, { darkMode });
    },
  })),
);
