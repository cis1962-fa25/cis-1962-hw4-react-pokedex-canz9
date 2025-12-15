import { useEffect, useState } from 'react';
import type { Pokemon } from '../types/types';
import { PokemonAPI } from '../api/PokemonAPI';
import { PokemonCard } from './PokemonCard';
import { PokemonDetails } from './PokemonDetails';

interface PokemonListProps {
    api: PokemonAPI;
    onIdNameMapUpdate: (entries: [number, string][]) => void;
    onBoxChanged: () => void; // used when catching to refresh box view
}

const PAGE_SIZE = 10;

export function PokemonList({ api, onIdNameMapUpdate, onBoxChanged }: PokemonListProps) {
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPokemonName, setSelectedPokemonName] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchPokemon() {
            setLoading(true);
            setError(null);
            try {
                const data = await api.getPokemonList(PAGE_SIZE, currentPage * PAGE_SIZE);
                if (!cancelled) {
                    setPokemon(data);
                    // Update ID -> name mapping
                    const pairs: [number, string][] = data.map((p) => [p.id, p.name]);
                    onIdNameMapUpdate(pairs);
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

        fetchPokemon();

        return () => {
            cancelled = true;
        };
    }, [api, currentPage, onIdNameMapUpdate]);

    const handlePrev = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };

    const handleNext = () => {
        setCurrentPage((prev) => prev + 1);
    };

    return (
        <div>
            <h2>All Pokémon</h2>
            <div className="pagination-controls">
                <button type="button" onClick={handlePrev} disabled={currentPage === 0}>
                    Previous
                </button>
                <span>Page {currentPage + 1}</span>
                <button type="button" onClick={handleNext}>
                    Next
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="pokemon-list">
                {pokemon.map((p) => (
                    <PokemonCard
                        key={p.id}
                        pokemon={p}
                        onClick={() => setSelectedPokemonName(p.name)}
                    />
                ))}
            </div>

            <PokemonDetails
                api={api}
                name={selectedPokemonName}
                isOpen={selectedPokemonName !== null}
                onClose={() => setSelectedPokemonName(null)}
                onBoxEntryCreated={onBoxChanged}
            />
        </div>
    );
}