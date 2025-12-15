import type { BoxEntry, Pokemon } from '../types/types';

interface BoxCardProps {
    entry: BoxEntry;
    pokemon: Pokemon;
    onEdit: (entry: BoxEntry, pokemon: Pokemon) => void;
    onDelete: (id: string) => void;
}

export function BoxCard({ entry, pokemon, onEdit, onDelete }: BoxCardProps) {
    const sprite = pokemon.sprites.front_default || pokemon.sprites.front_shiny;
    const created = new Date(entry.createdAt).toLocaleString();

    return (
        <div className="box-card">
            <img src={sprite} alt={pokemon.name} className="box-card__image" />
            <div className="box-card__info">
                <h3>{pokemon.name}</h3>
                <p>
                    <strong>Location:</strong> {entry.location}
                </p>
                <p>
                    <strong>Level:</strong> {entry.level}
                </p>
                <p>
                    <strong>Caught:</strong> {created}
                </p>
                {entry.notes && (
                    <p>
                        <strong>Notes:</strong> {entry.notes}
                    </p>
                )}
            </div>
            <div className="box-card__actions">
                <button type="button" onClick={() => onEdit(entry, pokemon)}>
                    Edit
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (window.confirm('Delete this entry?')) {
                            onDelete(entry.id);
                        }
                    }}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}