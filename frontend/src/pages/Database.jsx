import React, { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ECO_CODES } from '../data/ecoCodes';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Database Component Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: '#ff4444' }}>
                    <h2>Something went wrong in the Database view.</h2>
                    <pre>{this.state.error && this.state.error.toString()}</pre>
                    <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '8px 16px' }}>
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const Database = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [events, setEvents] = useState([]); // List of all events for dropdown
    const navigate = useNavigate();

    const OPENING_FAMILIES = [
        { name: 'Sicilian Defense', range: ['B20', 'B21', 'B22', 'B23', 'B24', 'B25', 'B26', 'B27', 'B28', 'B29', 'B30', 'B31', 'B32', 'B33', 'B34', 'B35', 'B36', 'B37', 'B38', 'B39', 'B40', 'B41', 'B42', 'B43', 'B44', 'B45', 'B46', 'B47', 'B48', 'B49', 'B5', 'B6', 'B7', 'B8', 'B9'] },
        { name: 'Caro-Kann Defense', range: ['B1'] },
        { name: 'French Defense', range: ['C0'] },
        { name: 'Ruy Lopez', range: ['C6', 'C7', 'C8', 'C9'] },
        { name: 'Italian Game', range: ['C50', 'C51', 'C52', 'C53', 'C54'] },
        { name: 'Queen\'s Gambit', range: ['D06', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6'] },
        { name: 'King\'s Indian', range: ['E6', 'E7', 'E8', 'E9'] },
        { name: 'Nimzo-Indian', range: ['E2', 'E3', 'E4', 'E5'] },
        { name: 'English Opening', range: ['A1', 'A2', 'A3'] },
        { name: 'Grünfeld Defense', range: ['D7', 'D8', 'D9'] },
        { name: 'Dutch Defense', range: ['A8', 'A9'] },
        { name: 'Scandinavian Defense', range: ['B01'] },
        { code_list: ECO_CODES } // Marker for all individual codes
    ];

    // Filters
    const [filters, setFilters] = useState({
        player: '',
        min_elo: '',
        max_elo: '',
        eco: '',
        event: '',
        commented_only: false,
        personal_only: false
    });

    // Fetch distinct events for dropdown
    useEffect(() => {
        // Check for twic_issue in URL
        const urlParams = new URLSearchParams(window.location.search);
        const twicIssue = urlParams.get('twic_issue');
        if (twicIssue) {
            setFilters(prev => ({ ...prev, twic_issue: twicIssue }));
        }

        fetch('http://localhost:8000/api/events')
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(err => console.error('Failed to fetch events', err));
    }, []);

    const fetchGames = (isLoadMore = false) => {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('limit', 100);
        // If loading more, skip current length
        const skip = isLoadMore ? (page + 1) * 100 : 0;
        params.append('skip', skip);

        if (filters.player) params.append('player', filters.player);
        if (filters.min_elo) params.append('min_elo', filters.min_elo);
        if (filters.max_elo) params.append('max_elo', filters.max_elo);
        if (filters.eco) {
            // Check if it's a family
            const fam = OPENING_FAMILIES.find(f => f.name === filters.eco);
            if (fam) {
                // If it's a family with a range, we pass the range logic
                // API might not support complex range in 'eco' param directly unless we updated backend.
                // Assuming backend supports simple 'B90' or prefix.
                // For a multi-range like B20-B99, we need backend support or client filtering.
                // Let's assume for now we pass the prefix if it's simple, or we might need to update backend to support 'eco_range'.
                // Actually, user asked for 'B90 to B99'.
                // Ideally we send 'B9' if the range is contiguous.
                // Let's try to map the family to a comma-separated list or a backend-supported format.
                // Since this is frontend, let's just pass the FAMILY NAME if we update backend, OR
                // construct a custom query parameter.

                // Hack: Most families essentially share a prefix.
                // Najdorf: B9...
                // Sicilian: B...
                // Ruy Lopez: C6, C7, C8, C9...

                // Let's pass a new param `eco_family` if possible, or just hack it
                // For now, let's pass a JSON string or special format if the backend accepts it.
                // Or better: Let's assume the backend 'eco' param does exact match, so let's use a new param.
                // Use 'eco' param which backend now parses as JSON list
                params.append('eco', JSON.stringify(fam.range));
            } else {
                params.append('eco', filters.eco);
            }
        }
        if (filters.event) params.append('event', filters.event);
        if (filters.twic_issue) params.append('twic_issue', filters.twic_issue);
        if (filters.commented_only) params.append('commented_only', 'true');
        if (filters.personal_only) params.append('personal_only', 'true');

        fetch(`http://localhost:8000/api/games?${params.toString()}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error('API returned non-array data:', data);
                    setGames([]); // Fallback to empty to prevent map crash
                    setLoading(false);
                    return;
                }

                if (isLoadMore) {
                    setGames(prev => [...prev, ...data]);
                    setPage(prev => prev + 1);
                } else {
                    setGames(data);
                    setPage(0);
                }
                setHasMore(data.length === 100);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch games', err);
                setGames([]); // clear games on error to be safe or keep previous? better safe
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchGames();
    }, [filters.twic_issue]); // Load when twic_issue filter is set from URL

    const handleRowClick = (game) => {
        // Store in sessionStorage as backup for page reloads
        sessionStorage.setItem('currentGame', JSON.stringify(game));
        // Navigate to analysis with the game object state
        navigate('/analysis', { state: { game } });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') fetchGames();
    };

    // Handle event dropdown change - set state only, useEffect will trigger fetch
    const handleEventChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, event: value }));
        // Need to fetch with the new value directly since setState is async
        setLoading(true);
        const params = new URLSearchParams();
        params.append('limit', 100);
        params.append('skip', 0);
        if (filters.player) params.append('player', filters.player);
        if (filters.min_elo) params.append('min_elo', filters.min_elo);
        if (filters.max_elo) params.append('max_elo', filters.max_elo);
        if (filters.eco) params.append('eco', filters.eco);
        if (value) params.append('event', value);  // Use new value directly

        fetch(`http://localhost:8000/api/games?${params.toString()}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error('API returned non-array data:', data);
                    setGames([]);
                    setLoading(false);
                    return;
                }
                setGames(data);
                setPage(0);
                setHasMore(data.length === 100);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch games', err);
                setGames([]);
                setLoading(false);
            });
    };

    // Auto-fetch when toggles change
    useEffect(() => {
        fetchGames();
    }, [filters.commented_only, filters.personal_only]);

    // Error Boundary Component


    return (
        <ErrorBoundary>
            <div style={{ padding: '40px', background: 'var(--bg-deep)', color: 'var(--text-primary)', height: '100%', overflowY: 'auto' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '600' }}>
                        Intelligence Database
                    </h2>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.1em' }}>
                        {games.length === 100 ? '100+ ' : games.length} RECORDS FOUND
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '40px' }}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                        <div className="col-span-4">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Player Name</label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-2.5 text-muted" />
                                <input
                                    type="text"
                                    name="player"
                                    placeholder="Search Name..."
                                    value={filters.player}
                                    onChange={handleFilterChange}
                                    onKeyDown={handleKeyDown}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--text-secondary)', borderRadius: '8px', padding: '12px 16px 12px 42px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: '500' }}
                                />
                            </div>
                        </div>

                        <div className="col-span-3 flex space-x-3">
                            <div className="flex-1">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Min Elo</label>
                                <input
                                    type="number"
                                    name="min_elo"
                                    value={filters.min_elo}
                                    onChange={handleFilterChange}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--text-secondary)', borderRadius: '8px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: '500' }}
                                />
                            </div>
                            <div className="flex-1">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Max Elo</label>
                                <input
                                    type="number"
                                    name="max_elo"
                                    value={filters.max_elo}
                                    onChange={handleFilterChange}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--text-secondary)', borderRadius: '8px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: '500' }}
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>ECO</label>
                            {/* Dual ECO Filter: Manual Input AND Dropdown List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="Type Code (e.g. B90)"
                                        value={filters.eco}
                                        onChange={(e) => setFilters(prev => ({ ...prev, eco: e.target.value.toUpperCase() }))}
                                        style={{
                                            flex: 1,
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            padding: '12px 16px',
                                            color: 'var(--text-primary)',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            outline: 'none'
                                        }}
                                        className="focus:border-neon-lime focus:bg-white/5"
                                    />
                                    <button
                                        onClick={() => fetchGames()}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            padding: '0 12px',
                                            color: 'var(--neon-lime)',
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            cursor: 'pointer'
                                        }}
                                        className="hover:bg-neon-lime hover:text-black transition-colors"
                                    >
                                        SEARCH
                                    </button>
                                </div>
                                <select
                                    name="eco_select"
                                    value={ECO_CODES.find(e => e.code === filters.eco) ? filters.eco : ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, eco: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        padding: '12px 16px',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    className="focus:border-neon-lime focus:bg-white/5"
                                >
                                    <option value="">Or Select From List...</option>
                                    {ECO_CODES.map(eco => (
                                        <option key={eco.code} value={eco.code}>{eco.code} - {eco.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="col-span-3">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Event</label>
                            <select
                                name="event"
                                value={filters.event}
                                onChange={handleEventChange}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--text-secondary)', borderRadius: '8px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}
                            >
                                <option value="">All Events</option>
                                {events.map((event, idx) => (
                                    <option key={idx} value={event}>{event}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', height: '100%', userSelect: 'none' }}>
                                <div style={{
                                    width: '44px',
                                    height: '24px',
                                    borderRadius: '12px',
                                    background: filters.commented_only ? 'var(--neon-lime)' : 'rgba(255,255,255,0.05)',
                                    position: 'relative',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }} onClick={() => setFilters(prev => ({ ...prev, commented_only: !prev.commented_only }))}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '2px',
                                        left: filters.commented_only ? '22px' : '2px',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        background: filters.commented_only ? '#000' : 'rgba(255,255,255,0.4)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }} />
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: filters.commented_only ? '#fff' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Annotated</span>
                            </label>
                        </div>

                        <div className="col-span-2">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', height: '100%', userSelect: 'none' }}>
                                <div style={{
                                    width: '44px',
                                    height: '24px',
                                    borderRadius: '12px',
                                    background: filters.personal_only ? 'var(--neon-lime)' : 'rgba(255,255,255,0.05)',
                                    position: 'relative',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }} onClick={() => setFilters(prev => ({ ...prev, personal_only: !prev.personal_only }))}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '2px',
                                        left: filters.personal_only ? '22px' : '2px',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        background: filters.personal_only ? '#000' : 'rgba(255,255,255,0.4)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }} />
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: filters.personal_only ? '#fff' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>My Study</span>
                            </label>
                        </div>

                        <div className="col-span-2 flex gap-2">
                            <button
                                onClick={() => fetchGames()}
                                style={{
                                    flex: 1,
                                    background: 'var(--neon-lime)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: '800',
                                    fontSize: '13px',
                                    textTransform: 'uppercase',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(163, 230, 53, 0.2)'
                                }}
                                className="hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_6px_20px_rgba(163,230,53,0.3)]"
                            >
                                <Filter size={18} /> Apply
                            </button>
                            {(filters.player || filters.event || filters.twic_issue || filters.eco || filters.min_elo || filters.max_elo) && (
                                <button
                                    onClick={() => {
                                        setFilters({ player: '', min_elo: '', max_elo: '', eco: '', event: '', twic_issue: '', commented_only: false, personal_only: false });
                                        window.history.replaceState({}, '', window.location.pathname);
                                        fetchGames();
                                    }}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        padding: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    className="hover:bg-white/10"
                                    title="Clear Filters"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-panel" style={{ overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        <table className="w-full text-sm text-left">
                            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                <tr>
                                    <th style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', padding: '16px 24px' }}>White Player</th>
                                    <th style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', width: '80px' }}>Elo</th>
                                    <th style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', padding: '16px 24px' }}>Black Player</th>
                                    <th style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', width: '80px' }}>Elo</th>
                                    <th style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', width: '80px' }}>Res</th>
                                    <th style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', width: '100px' }}>ECO</th>
                                    <th style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', padding: '16px 24px' }}>Event</th>
                                    <th style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', textAlign: 'right', padding: '16px 24px' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {loading && games.length === 0 ? (
                                    <tr><td colSpan="7" className="p-8 text-center text-slate-500">Loading database...</td></tr>
                                ) : games.length === 0 ? (
                                    <tr><td colSpan="7" className="p-8 text-center text-slate-500">No games found. Adjust filters.</td></tr>
                                ) : (
                                    games.map((g) => {
                                        if (!g) return null;
                                        try {
                                            return (
                                                <tr key={g.id || Math.random()}
                                                    onClick={() => handleRowClick(g)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: 'background 0.1s',
                                                        background: g.is_commented ? 'rgba(163, 230, 53, 0.02)' : 'transparent'
                                                    }}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                            <span style={{ color: 'var(--neon-lime)', fontWeight: '600' }}>{String(g.white || 'Unknown')}</span>
                                                            {g.is_personal ? (
                                                                <span style={{
                                                                    fontSize: '8px',
                                                                    background: 'var(--neon-lime)',
                                                                    color: '#000',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '10px',
                                                                    fontWeight: '900',
                                                                    letterSpacing: '0.05em'
                                                                }}>ANALYZED</span>
                                                            ) : g.is_commented ? (
                                                                <span style={{
                                                                    fontSize: '8px',
                                                                    background: 'rgba(255,255,255,0.1)',
                                                                    color: 'var(--text-secondary)',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '10px',
                                                                    fontWeight: '900',
                                                                    letterSpacing: '0.05em',
                                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                                }}>ANNOTATED</span>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4" style={{ color: 'var(--text-secondary)' }}>{String(g.white_elo || '—')}</td>
                                                    <td className="px-6 py-4" style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{String(g.black || 'Unknown')}</td>
                                                    <td className="px-4 py-4" style={{ color: 'var(--text-secondary)' }}>{String(g.black_elo || '—')}</td>
                                                    <td className="px-4 py-4" style={{
                                                        fontWeight: '700',
                                                        color: (g.result === '1-0') ? 'var(--neon-lime)' : (g.result === '0-1') ? '#ff4444' : 'var(--text-secondary)'
                                                    }}>
                                                        {String(g.result || '—')}
                                                    </td>
                                                    <td className="px-4 py-4" style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{String(g.eco || '—')}</td>
                                                    <td className="px-6 py-4" style={{ color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(g.event || 'Unknown')}</td>
                                                    <td className="px-6 py-4 text-right" style={{ color: 'var(--text-muted)' }}>{String(g.date || '—')}</td>
                                                </tr>
                                            );
                                        } catch (e) {
                                            console.error("Row render error:", e);
                                            return null;
                                        }
                                    })
                                )}
                                {games.length > 0 && hasMore && (
                                    <tr>
                                        <td colSpan="7" className="p-10 text-center">
                                            <button
                                                onClick={() => fetchGames(true)}
                                                disabled={loading}
                                                style={{ padding: '10px 30px', borderRadius: '30px' }}
                                            >
                                                {loading ? 'ANALYZING...' : 'LOAD MORE DATA'}
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default Database;
