import { useEffect, useState } from 'react';
import type{ BoxEntry, InsertBoxEntry, Pokemon } from '../types/types';
import { PokemonAPI } from '../api/PokemonAPI';
import { BoxCard } from './BoxCard';
import { BoxForm } from './BoxForm';

interface BoxListProps {
    api: PokemonAPI;
    idToNameMap: Map<number, string>;
    refreshTrigger: number; // increment when box changed to refetch
}

interface BoxWithPokemon {
    entry: BoxEntry;
    pokemon: Pokemon;
}

export function BoxList({ api, idToNameMap, refreshTrigger }: BoxListProps) {
    const [items, setItems] = useState<BoxWithPokemon[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [editingEntry, setEditingEntry] = useState<BoxWithPokemon | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchBox() {
            setLoading(true);
            setError(null);
            try {
                const ids = await api.getBoxIds();

                const entries = await Promise.all(
                    ids.map((id) => api.getBoxEntry(id)),
                );

                const pokemonPromises = entries.map(async (entry) => {
                    const name = idToNameMap.get(entry.pokemonId);
                    if (!name) {
                        throw new Error(
                            `Missing name for pokemonId ${entry.pokemonId}. Make sure you loaded that Pokémon in the main list.`,
                        );
                    }
                    const pokemon = await api.getPokemonByName(name);
                    return { entry, pokemon };
                });

                const boxWithPokemon = await Promise.all(pokemonPromises);

                if (!cancelled) {
                    setItems(boxWithPokemon);
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

        fetchBox();

        return () => {
            cancelled = true;
        };
    }, [api, idToNameMap, refreshTrigger]);

    const handleDelete = async (id: string) => {
        try {
            await api.deleteBoxEntry(id);
            // optimistic update
            setItems((prev) => prev.filter((item) => item.entry.id !== id));
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const handleEditSubmit = async (entryData: InsertBoxEntry) => {
        if (!editingEntry) return;
        try {
            await api.updateBoxEntry(editingEntry.entry.id, {
                level: entryData.level,
                location: entryData.location,
                notes: entryData.notes,
                // createdAt optional: keep existing or update if you want
            });
            setEditingEntry(null);
            // re-fetch or update local state
            setItems((prev) =>
                prev.map((item) =>
                    item.entry.id === editingEntry.entry.id
                        ? {
                              ...item,
                              entry: {
                                  ...item.entry,
                                  level: entryData.level,
                                  location: entryData.location,
                                  notes: entryData.notes,
                              },
                          }
                        : item,
                ),
            );
        } catch (err) {
            alert((err as Error).message);
        }
    };

    return (
        <div>
            <h2>My Box</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && items.length === 0 && <p>No Pokémon in your box yet.</p>}

            <div className="box-list">
                {items.map((item) => (
                    <BoxCard
                        key={item.entry.id}
                        entry={item.entry}
                        pokemon={item.pokemon}
                        onEdit={(entry, pokemon) =>
                            setEditingEntry({
                                entry,
                                pokemon,
                            })
                        }
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {editingEntry && (
                <BoxForm
                    open={true}
                    onClose={() => setEditingEntry(null)}
                    mode="edit"
                    pokemon={editingEntry.pokemon}
                    initialValues={{
                        location: editingEntry.entry.location,
                        level: editingEntry.entry.level,
                        notes: editingEntry.entry.notes,
                        createdAt: editingEntry.entry.createdAt,
                    }}
                    onSubmit={handleEditSubmit}
                />
            )}
        </div>
    );
}