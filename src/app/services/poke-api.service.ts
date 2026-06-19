import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import {
  EvolutionChainApi,
  MoveApi,
  PokemonApi,
  PokemonCatalogResponse,
  PokemonDetail,
  PokemonLocationApi,
  PokemonMove,
  PokemonSpeciesApi,
  PokemonTypeResponse,
} from '../models/pokemon.models';
import {
  artworkById,
  flattenEvolutionChain,
  idFromUrl,
  POKEMON_LIMIT,
  prettyName,
  toCatalogItem,
} from '../shared/pokemon.helpers';

@Injectable({ providedIn: 'root' })
export class PokeApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://pokeapi.co/api/v2';

  getCatalog() {
    return this.http
      .get<PokemonCatalogResponse>(`${this.apiUrl}/pokemon?limit=${POKEMON_LIMIT}`)
      .pipe(map((response) => ({
        total: response.count,
        items: response.results.map((item) => toCatalogItem(item.name, item.url)),
      })));
  }

  getPokemonDetail(id: number): Observable<PokemonDetail> {
    return forkJoin({
      pokemon: this.http.get<PokemonApi>(`${this.apiUrl}/pokemon/${id}`),
      species: this.http.get<PokemonSpeciesApi>(`${this.apiUrl}/pokemon-species/${id}`),
      locations: this.http.get<PokemonLocationApi[]>(`${this.apiUrl}/pokemon/${id}/encounters`),
    }).pipe(
      switchMap(({ pokemon, species, locations }) => forkJoin({
        pokemon: of(pokemon),
        species: of(species),
        locations: of(locations),
        evolution: this.http.get<EvolutionChainApi>(species.evolution_chain.url),
        moves: this.getMoves(pokemon),
      })),
      map(({ pokemon, species, locations, evolution, moves }) => ({
        pokemon,
        speciesLabel: species.genera.find((item) => item.language.name === 'es')?.genus
          ?? species.genera.find((item) => item.language.name === 'en')?.genus
          ?? 'Pokémon singular',
        habitat: species.habitat ? prettyName(species.habitat.name) : 'Hábitat desconocido',
        evolutions: flattenEvolutionChain(evolution.chain).map((item) => {
          const evolutionId = idFromUrl(item.species.url);
          return {
            id: evolutionId,
            name: prettyName(item.species.name),
            sprite: artworkById(evolutionId),
          };
        }),
        moves,
        locations: locations.slice(0, 4).map((item) => prettyName(item.location_area.name)),
      })),
    );
  }

  getFavoriteDetails(ids: number[]): Observable<PokemonDetail[]> {
    return ids.length ? forkJoin(ids.map((id) => this.getPokemonDetail(id))) : of([]);
  }

  getPokemonIdsByType(type: string): Observable<number[]> {
    if (type === 'all') return of([]);
    return this.http.get<PokemonTypeResponse>(`${this.apiUrl}/type/${type}`).pipe(
      map((response) => response.pokemon.map((item) => idFromUrl(item.pokemon.url))),
    );
  }

  private getMoves(pokemon: PokemonApi): Observable<PokemonMove[]> {
    const requests = pokemon.moves.slice(0, 4).map(({ move }) =>
      this.http.get<MoveApi>(move.url).pipe(
        map((detail) => ({
          name: detail.names.find((item) => item.language.name === 'es')?.name
            ?? detail.names.find((item) => item.language.name === 'en')?.name
            ?? prettyName(move.name),
          pp: detail.pp,
          type: detail.type.name,
        })),
      ),
    );
    return requests.length ? forkJoin(requests) : of([]);
  }
}
