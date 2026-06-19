import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { PokeApiService } from './poke-api.service';

describe('PokeApiService', () => {
  let service: PokeApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PokeApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PokeApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('transforma la respuesta del catálogo en elementos para la UI', async () => {
    const resultPromise = firstValueFrom(service.getCatalog());
    const request = http.expectOne('https://pokeapi.co/api/v2/pokemon?limit=1025');

    expect(request.request.method).toBe('GET');
    request.flush({
      count: 1350,
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
      ],
    });

    const result = await resultPromise;
    expect(result.total).toBe(1350);
    expect(result.items.map((item) => item.id)).toEqual([1, 25]);
  });

  it('devuelve los ids asociados a un tipo', async () => {
    const resultPromise = firstValueFrom(service.getPokemonIdsByType('electric'));
    const request = http.expectOne('https://pokeapi.co/api/v2/type/electric');

    request.flush({
      pokemon: [
        { pokemon: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' } },
        { pokemon: { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/' } },
      ],
    });

    expect(await resultPromise).toEqual([25, 26]);
  });
});
