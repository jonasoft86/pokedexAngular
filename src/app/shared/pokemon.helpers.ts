import { EvolutionLinkApi, PokemonListItem } from '../models/pokemon.models';

export const POKEMON_LIMIT = 1025;
export const PAGE_SIZE = 8;

export const TYPE_NAMES: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  electric: 'Eléctrico',
  grass: 'Planta',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada',
};

export const TYPE_ICONS: Record<string, string> = {
  electric: 'ϟ',
  fire: '◆',
  water: '●',
  grass: '✦',
  poison: '◉',
  flying: '⌁',
  normal: '○',
  ground: '▲',
  psychic: '✺',
};

export function idFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return Number(parts.at(-1));
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function prettyName(value: string): string {
  return value.split('-').map(capitalize).join(' ');
}

export function pokemonNumber(id: number): string {
  return `#${id.toString().padStart(3, '0')}`;
}

export function spriteById(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function artworkById(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function toCatalogItem(name: string, url: string): PokemonListItem {
  const id = idFromUrl(url);
  return { id, name, sprite: spriteById(id) };
}

export function flattenEvolutionChain(link: EvolutionLinkApi): EvolutionLinkApi[] {
  return [link, ...link.evolves_to.flatMap(flattenEvolutionChain)];
}

export function radarPoints(stats: number[]): string {
  return stats.map((stat, index) => {
    const angle = (-90 + index * 60) * Math.PI / 180;
    const radius = Math.min(stat / 150, 1) * 64;
    return `${100 + Math.cos(angle) * radius},${100 + Math.sin(angle) * radius}`;
  }).join(' ');
}
