export type SortOrder = 'number-asc' | 'number-desc' | 'name-asc' | 'name-desc';

export interface NamedApiResource {
  name: string;
  url: string;
}

export interface PokemonCatalogResponse {
  count: number;
  results: NamedApiResource[];
}

export interface PokemonListItem {
  id: number;
  name: string;
  sprite: string;
}

export interface PokemonApi {
  id: number;
  name: string;
  height: number;
  weight: number;
  abilities: Array<{ ability: NamedApiResource; is_hidden: boolean }>;
  forms: NamedApiResource[];
  moves: Array<{ move: NamedApiResource }>;
  sprites: {
    front_default: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
      };
    };
  };
  stats: Array<{ base_stat: number; stat: NamedApiResource }>;
  types: Array<{ slot: number; type: NamedApiResource }>;
}

export interface PokemonSpeciesApi {
  evolution_chain: { url: string };
  genera: Array<{ genus: string; language: NamedApiResource }>;
  habitat: NamedApiResource | null;
}

export interface EvolutionChainApi {
  chain: EvolutionLinkApi;
}

export interface EvolutionLinkApi {
  species: NamedApiResource;
  evolves_to: EvolutionLinkApi[];
}

export interface PokemonLocationApi {
  location_area: NamedApiResource;
}

export interface MoveApi {
  names: Array<{ name: string; language: NamedApiResource }>;
  pp: number;
  type: NamedApiResource;
}

export interface EvolutionItem {
  id: number;
  name: string;
  sprite: string;
}

export interface PokemonMove {
  name: string;
  pp: number;
  type: string;
}

export interface PokemonDetail {
  pokemon: PokemonApi;
  speciesLabel: string;
  habitat: string;
  evolutions: EvolutionItem[];
  moves: PokemonMove[];
  locations: string[];
}

export interface PokemonTypeResponse {
  pokemon: Array<{ pokemon: NamedApiResource }>;
}
