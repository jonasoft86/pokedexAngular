import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SortOrder } from '../../models/pokemon.models';
import { capitalize, pokemonNumber } from '../../shared/pokemon.helpers';
import { PokemonStore } from '../../store/pokemon.store';

@Component({
  selector: 'app-pokemon-sidebar',
  templateUrl: './pokemon-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonSidebarComponent {
  readonly store = inject(PokemonStore);
  readonly capitalize = capitalize;
  readonly pokemonNumber = pokemonNumber;

  onTypeChange(event: Event): void {
    this.store.setType((event.target as HTMLSelectElement).value);
  }

  onSortChange(event: Event): void {
    this.store.setSort((event.target as HTMLSelectElement).value as SortOrder);
  }
}
