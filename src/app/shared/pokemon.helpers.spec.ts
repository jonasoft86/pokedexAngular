import { describe, expect, it } from 'vitest';
import {
  flattenEvolutionChain,
  idFromUrl,
  pokemonNumber,
  prettyName,
  toCatalogItem,
} from './pokemon.helpers';

describe('pokemon helpers', () => {
  it('extrae el id y construye un elemento del catálogo', () => {
    const item = toCatalogItem('pikachu', 'https://pokeapi.co/api/v2/pokemon/25/');

    expect(idFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
    expect(item).toEqual({
      id: 25,
      name: 'pikachu',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    });
  });

  it('formatea nombres y números para la interfaz', () => {
    expect(prettyName('special-attack')).toBe('Special Attack');
    expect(pokemonNumber(7)).toBe('#007');
  });

  it('aplana una cadena de evoluciones ramificada', () => {
    const chain = {
      species: { name: 'eevee', url: '/pokemon-species/133/' },
      evolves_to: [
        { species: { name: 'vaporeon', url: '/pokemon-species/134/' }, evolves_to: [] },
        { species: { name: 'jolteon', url: '/pokemon-species/135/' }, evolves_to: [] },
      ],
    };

    expect(flattenEvolutionChain(chain).map((item) => item.species.name))
      .toEqual(['eevee', 'vaporeon', 'jolteon']);
  });
});
