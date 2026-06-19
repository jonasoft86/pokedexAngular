import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { PokeApiService } from '../services/poke-api.service';
import { PokemonStore } from './pokemon.store';

describe('PokemonStore', () => {
  const apiMock = {
    getCatalog: vi.fn(() => of({
      total: 2,
      items: [
        { id: 25, name: 'pikachu', sprite: 'pikachu.png' },
        { id: 1, name: 'bulbasaur', sprite: 'bulbasaur.png' },
      ],
    })),
    getPokemonDetail: vi.fn(),
    getFavoriteDetails: vi.fn(() => of([])),
    getPokemonIdsByType: vi.fn(() => of([])),
  };

  let store: InstanceType<typeof PokemonStore>;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        PokemonStore,
        { provide: PokeApiService, useValue: apiMock },
      ],
    });
    store = TestBed.inject(PokemonStore);
  });

  it('carga, ordena y filtra el catálogo', () => {
    store.loadCatalog();

    expect(store.total()).toBe(2);
    expect(store.pageItems().map((item) => item.id)).toEqual([1, 25]);

    store.setSearch('pika');
    expect(store.filtered().map((item) => item.name)).toEqual(['pikachu']);

    store.setSearch('');
    store.setSort('number-desc');
    expect(store.filtered().map((item) => item.id)).toEqual([25, 1]);
  });

  it('guarda y elimina favoritos de forma persistente', () => {
    store.toggleFavorite();

    expect(store.favorites()).toEqual([25]);
    expect(JSON.parse(localStorage.getItem('pokedex-favorites') ?? '[]')).toEqual([25]);

    store.removeFavorite(25);
    expect(store.favorites()).toEqual([]);
  });

  it('genera un paginado compacto', () => {
    const items = Array.from({ length: 80 }, (_, index) => ({
      id: index + 1,
      name: `pokemon-${index + 1}`,
      sprite: '',
    }));
    apiMock.getCatalog.mockReturnValueOnce(of({ total: 80, items }));

    store.loadCatalog();

    expect(store.pageCount()).toBe(10);
    expect(store.pages()).toEqual([1, 2, 3, 'ellipsis', 10]);

    store.setPage(5);
    expect(store.pages()).toEqual([1, 'ellipsis', 5, 'ellipsis', 10]);
  });
});
