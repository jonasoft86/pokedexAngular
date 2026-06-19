const fs = require('fs/promises');
const fetch = global.fetch || require('node-fetch');

async function main() {
  const limit = 10;
  const listResponse = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=${limit}`);
  if (!listResponse.ok) {
    throw new Error(`List request failed: ${listResponse.status}`);
  }

  const list = await listResponse.json();
  const pokemons = await Promise.all(
    list.results.map(async ({ url }) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Detail request failed: ${res.status}`);
      }
      const data = await res.json();
      return {
        id: data.id,
        name: data.name,
        frontSprite: data.sprites.front_default,
        types: data.types,
        sprites: data.sprites,
        stats: data.stats,
        height: data.height,
        weight: data.weight,
        abilities: data.abilities,
        forms: data.forms,
        moves: data.moves,
      };
    })
  );

  await fs.writeFile('data.json', JSON.stringify(pokemons, null, 2), 'utf8');
  console.log(`Created data.json with ${pokemons.length} pokemons`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
