import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PokemonDetailComponent } from '../../components/pokemon-detail/pokemon-detail.component';
import { PokemonHeaderComponent } from '../../components/pokemon-header/pokemon-header.component';
import { PokemonSidebarComponent } from '../../components/pokemon-sidebar/pokemon-sidebar.component';
import { PokemonStore } from '../../store/pokemon.store';

@Component({
  selector: 'app-home-page',
  imports: [PokemonHeaderComponent, PokemonSidebarComponent, PokemonDetailComponent],
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  readonly store = inject(PokemonStore);

  constructor() {
    if (!this.store.catalog().length) this.store.loadCatalog();
    if (!this.store.selected()) this.store.selectPokemon(this.store.selectedId());
  }
}
