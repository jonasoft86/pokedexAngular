import { Routes } from '@angular/router';
import { FavoritesPageComponent } from './pages/favorites-page/favorites-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';

export const appRoutes: Routes = [
  { path: '', component: HomePageComponent, title: 'Pokédex' },
  { path: 'favoritos', component: FavoritesPageComponent, title: 'Pokémon favoritos' },
  { path: '**', redirectTo: '' },
];
