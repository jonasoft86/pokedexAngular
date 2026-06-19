import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonApi } from '../../models/pokemon.models';
import {
  artworkById,
  capitalize,
  pokemonNumber,
  prettyName,
  TYPE_NAMES,
} from '../../shared/pokemon.helpers';
import { PokemonStore } from '../../store/pokemon.store';

@Component({
  selector: 'app-favorites-page',
  imports: [RouterLink],
  templateUrl: './favorites-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPageComponent {
  readonly store = inject(PokemonStore);
  readonly capitalize = capitalize;
  readonly pokemonNumber = pokemonNumber;

  constructor() {
    this.store.loadFavorites();
  }

  artwork(pokemon: PokemonApi): string {
    return pokemon.sprites.other['official-artwork'].front_default
      ?? pokemon.sprites.front_default
      ?? artworkById(pokemon.id);
  }

  typeName(type: string): string {
    return TYPE_NAMES[type] ?? prettyName(type);
  }

  ability(pokemon: PokemonApi): string {
    return prettyName(pokemon.abilities.find((item) => !item.is_hidden)?.ability.name ?? 'Desconocida');
  }
}
