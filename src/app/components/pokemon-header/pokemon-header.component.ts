import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonStore } from '../../store/pokemon.store';

@Component({
  selector: 'app-pokemon-header',
  imports: [RouterLink],
  templateUrl: './pokemon-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonHeaderComponent {
  readonly store = inject(PokemonStore);

  onSearch(event: Event): void {
    this.store.setSearch((event.target as HTMLInputElement).value);
  }
}
