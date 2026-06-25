import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonListItem } from '../../models/pokemon.models';
import { capitalize, pokemonNumber } from '../../shared/pokemon.helpers';
import { PokemonStore } from '../../store/pokemon.store';

@Component({
  selector: 'app-pokemon-header',
  imports: [RouterLink],
  templateUrl: './pokemon-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonHeaderComponent {
  readonly store = inject(PokemonStore);
  readonly suggestionsOpen = signal(false);
  readonly capitalize = capitalize;
  readonly pokemonNumber = pokemonNumber;

  onSearch(event: Event): void {
    this.store.setSearch((event.target as HTMLInputElement).value);
    this.suggestionsOpen.set(true);
  }

  clearSearch(): void {
    this.store.clearSearch();
    this.suggestionsOpen.set(false);
  }

  selectSuggestion(pokemon: PokemonListItem): void {
    this.store.setSearch(pokemon.name);
    this.store.selectPokemon(pokemon.id);
    this.suggestionsOpen.set(false);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.suggestionsOpen.set(false);
      return;
    }

    if (event.key !== 'Enter') return;

    const [suggestion] = this.store.searchSuggestions();
    if (!suggestion) return;

    event.preventDefault();
    this.selectSuggestion(suggestion);
  }
}
