import { useState } from 'react';
import type { InsertBoxEntry, Pokemon } from '../types/types';
import { Modal } from './Modal';

interface BoxFormProps {
    open: boolean;
    onClose: () => void;
    pokemon: Pokemon;
    mode: 'create' | 'edit';
    initialValues?: {
        location: string;
        level: number;
        notes?: string;
        createdAt?: string;
    };
    onSubmit: (entry: InsertBoxEntry) => void; // for edit, parent can map to UpdateBoxEntry
}

export function BoxForm({
    open,
    onClose,
    pokemon,
    mode,
    initialValues,
    onSubmit,
}: BoxFormProps) {
    const [location, setLocation] = useState(initialValues?.location ?? '');
    const [level, setLevel] = useState(initialValues?.level ?? 1);
    const [notes, setNotes] = useState(initialValues?.notes ?? '');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!location.trim()) {
            setError('Location is required.');
            return;
        }

        if (Number.isNaN(level) || level < 1 || level > 100) {
            setError('Level must be between 1 and 100.');
            return;
        }

        const createdAt =
            initialValues?.createdAt ?? new Date().toISOString(); // For edit we can keep old

        const entry: InsertBoxEntry = {
            createdAt,
            level,
            location: location.trim(),
            notes: notes.trim() || undefined,
            pokemonId: pokemon.id,
        };

        onSubmit(entry);
    };

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title={mode === 'create' ? `Catch ${pokemon.name}` : `Edit ${pokemon.name}`}
        >
            <form onSubmit={handleSubmit} className="box-form">
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <div className="form-field">
                    <label htmlFor="location">Location</label>
                    <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="level">Level</label>
                    <input
                        id="level"
                        type="number"
                        min={1}
                        max={100}
                        value={level}
                        onChange={(event) => setLevel(Number(event.target.value))}
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="notes">Notes (optional)</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                    />
                </div>

                <div className="form-actions">
                    <button type="button" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit">{mode === 'create' ? 'Add to Box' : 'Save Changes'}</button>
                </div>
            </form>
        </Modal>
    );
}