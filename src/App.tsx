import { useMemo, useState } from 'react';
import './App.css';
import { PokemonAPI } from './api/PokemonAPI';
import { PokemonList } from './components/PokemonList';
import { BoxList } from './components/BoxList';

type View = 'pokemon' | 'box';

function App() {
    const [token] = useState<string | null>(import.meta.env.VITE_JWT_TOKEN ?? null);

    const api = useMemo(() => new PokemonAPI(token), [token]);

    const [view, setView] = useState<View>('pokemon');

    // Map of pokemonId -> name
    const [idToNameMap, setIdToNameMap] = useState<Map<number, string>>(new Map());

    const [boxRefresh, setBoxRefresh] = useState(0);

    const handleIdNameMapUpdate = (entries: [number, string][]) => {
        setIdToNameMap((prev) => {
            const next = new Map(prev);
            for (const [id, name] of entries) {
                if (!next.has(id)) {
                    next.set(id, name);
                }
            }
            return next;
        });
    };

    const handleBoxChanged = () => {
        setBoxRefresh((prev) => prev + 1);
    };

    return (
        <div className="app">
            <header>
                <h1>Pokedex</h1>
                <div className="view-toggle">
                    <button
                        type="button"
                        onClick={() => setView('pokemon')}
                        className={view === 'pokemon' ? 'active' : ''}
                    >
                        All Pokémon
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('box')}
                        className={view === 'box' ? 'active' : ''}
                    >
                        My Box
                    </button>
                </div>
            </header>

            <main>
                {view === 'pokemon' ? (
                    <PokemonList
                        api={api}
                        onIdNameMapUpdate={handleIdNameMapUpdate}
                        onBoxChanged={handleBoxChanged}
                    />
                ) : (
                    <BoxList api={api} idToNameMap={idToNameMap} refreshTrigger={boxRefresh} />
                )}
            </main>
        </div>
    );
}

export default App;