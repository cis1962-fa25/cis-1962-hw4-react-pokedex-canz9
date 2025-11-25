import { useEffect, useState } from 'react';
import type { Pokemon } from '../types/types';
import { PokemonAPI } from '../api/PokemonAPI';
import { Modal } from './Modal';
import { BoxForm } from './BoxForm';
import type { InsertBoxEntry } from '../types/types';

interface PokemonDetailsProps {
    name: string | null;
    api: PokemonAPI;
    isOpen: boolean;
    onClose: () => void;
    onBoxEntryCreated: () => void; // tell parent to refresh box
}

export function PokemonDetails({
    name,
    api,
    isOpen,
    onClose,
    onBoxEntryCreated,
}: PokemonDetailsProps) {
    const [pokemon, setPokemon] = useState<Pokemon | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCatchForm, setShowCatchForm] = useState(false);

    useEffect(() => {
    if (!isOpen || !name) return;

    const pokemonName = name; // now this is a plain string

    let cancelled = false;

    async function fetchDetails(pokemonName: string) {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getPokemonByName(pokemonName);
            if (!cancelled) {
                setPokemon(data);
            }
        } catch (err) {
            if (!cancelled) {
                setError((err as Error).message);
            }
        } finally {
            if (!cancelled) {
                setLoading(false);
            }
        }
    }

    fetchDetails(pokemonName);

    return () => {
        cancelled = true;
    };
}, [api, isOpen, name]);

    const handleCatchSubmit = async (entry: InsertBoxEntry) => {
        try {
            await api.createBoxEntry(entry);
            setShowCatchForm(false);
            onBoxEntryCreated();
        } catch (err) {
            // You could surface this error inside BoxForm via a prop
            // For now, simple alert:
            alert((err as Error).message);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={name ?? 'Pokemon'}>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && pokemon && (
                <div className="pokemon-details">
                    <div className="pokemon-details__sprites">
                        <img src={pokemon.sprites.front_default} alt={`${pokemon.name} front`} />
                        <img src={pokemon.sprites.back_default} alt={`${pokemon.name} back`} />
                        <img src={pokemon.sprites.front_shiny} alt={`${pokemon.name} shiny front`} />
                        <img src={pokemon.sprites.back_shiny} alt={`${pokemon.name} shiny back`} />
                    </div>

                    <p>{pokemon.description}</p>

                    <h4>Types</h4>
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

                    <h4>Stats</h4>
                    <ul>
                        <li>HP: {pokemon.stats.hp}</li>
                        <li>Attack: {pokemon.stats.attack}</li>
                        <li>Defense: {pokemon.stats.defense}</li>
                        <li>Sp. Attack: {pokemon.stats.specialAttack}</li>
                        <li>Sp. Defense: {pokemon.stats.specialDefense}</li>
                        <li>Speed: {pokemon.stats.speed}</li>
                    </ul>

                    <h4>Moves (sample)</h4>
                    <ul className="moves-list">
                        {pokemon.moves.slice(0, 10).map((move) => (
                            <li key={move.name}>
                                <strong>{move.name}</strong> ({move.type.name},{' '}
                                {move.power ?? '—'} power)
                            </li>
                        ))}
                    </ul>

                    <button type="button" onClick={() => setShowCatchForm(true)}>
                        Catch / Add to Box
                    </button>

                    <BoxForm
                        open={showCatchForm}
                        onClose={() => setShowCatchForm(false)}
                        onSubmit={handleCatchSubmit}
                        pokemon={pokemon}
                        mode="create"
                    />
                </div>
            )}
        </Modal>
    );
}