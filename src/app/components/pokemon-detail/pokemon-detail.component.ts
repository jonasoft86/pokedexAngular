import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PokemonApi } from '../../models/pokemon.models';
import {
  artworkById,
  capitalize,
  pokemonNumber,
  prettyName,
  radarPoints,
  TYPE_ICONS,
  TYPE_NAMES,
} from '../../shared/pokemon.helpers';
import { PokemonStore } from '../../store/pokemon.store';

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: './pokemon-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonDetailComponent {
  readonly store = inject(PokemonStore);
  readonly statLabels = ['PS', 'Ataque', 'Defensa', 'Ataque Especial', 'Defensa Especial', 'Velocidad'];
  readonly capitalize = capitalize;
  readonly pokemonNumber = pokemonNumber;
  readonly prettyName = prettyName;
  readonly radarPoints = radarPoints;

  artwork(pokemon: PokemonApi): string {
    return pokemon.sprites.other['official-artwork'].front_default
      ?? pokemon.sprites.front_default
      ?? artworkById(pokemon.id);
  }

  ability(pokemon: PokemonApi): string {
    return prettyName(pokemon.abilities.find((item) => !item.is_hidden)?.ability.name ?? 'Desconocida');
  }

  typeName(type: string): string {
    return TYPE_NAMES[type] ?? prettyName(type);
  }

  typeIcon(type: string): string {
    return TYPE_ICONS[type] ?? '●';
  }

  statTotal(pokemon: PokemonApi): number {
    return pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
  }

  statWidth(value: number): string {
    return `${Math.min(value / 1.5, 100)}%`;
  }

  stats(pokemon: PokemonApi): number[] {
    return pokemon.stats.map((stat) => stat.base_stat);
  }
}
