import type { Pokemon } from '../types/types';

interface PokemonCardProps {
    pokemon: Pokemon;
    onClick: () => void;
}

export function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
    const mainSprite = pokemon.sprites.front_default || pokemon.sprites.front_shiny;

    return (
        <button className="pokemon-card" type="button" onClick={onClick}>
            <img src={mainSprite} alt={pokemon.name} className="pokemon-card__image" />
            <h3 className="pokemon-card__name">{pokemon.name}</h3>
            <div className="pokemon-card__types">
                {pokemon.types.map((type) => (
                    <span
                        key={type.name}
                        className="pokemon-type-badge"
                        style={{ backgroundColor: type.color }}
                    >
                        {type.name}
                    </span>
                ))}
            </div>
        </button>
    );
}