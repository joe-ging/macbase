import React, { useState, useEffect } from 'react';
import { FolderPlus, Folder, ArrowLeft, ChevronRight, FileText, Download, X, Check, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Repertoire = () => {
    const navigate = useNavigate();
    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [path, setPath] = useState([]);
    const [loading, setLoading] = useState(true);
    const [games, setGames] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        if (currentFolder) {
            fetchFolderContents(currentFolder.id);
        } else {
            setGames([]);
        }
    }, [currentFolder]);

    const fetchFolders = () => {
        setLoading(true);
        fetch(`http://localhost:8000/api/repertoire/folders`)
            .then(res => res.json())
            .then(data => {
                setFolders(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const fetchFolderContents = (folderId) => {
        fetch(`http://localhost:8000/api/repertoire/folder/${folderId}`)
            .then(res => res.json())
            .then(data => setGames(Array.isArray(data) ? data : []));
    };

    const handleCreateFolder = () => {
        if (!newFolderName) return;
        fetch('http://localhost:8000/api/repertoire/folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newFolderName, parent_id: currentFolder ? currentFolder.id : null, color: 'neon-lime' })
        })
            .then(res => res.json())
            .then(newFolder => {
                setFolders([...folders, newFolder]);
                setIsCreateOpen(false);
                setNewFolderName('');
            });
    };

    const handleGameClick = (game) => {
        const analysisGame = {
            id: `rep-${game.id}`,
            white: game.white || "Repertoire Game",
            black: game.black || game.title,
            pgn: game.pgn,
            is_personal: 1
        };
        navigate('/analysis', { state: { game: analysisGame } });
    };

    const enterFolder = (folder) => {
        setCurrentFolder(folder);
        setPath([...path, folder]);
    };

    const goBack = () => {
        const newPath = [...path];
        newPath.pop();
        setPath(newPath);
        setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1] : null);
    };

    return (
        <div style={{ padding: '40px', background: 'var(--bg-deep)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '800' }}>Library</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your PGN collections and repertoire folders.</p>
            </div>

            {/* Breadcrumbs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center' }}>
                <button onClick={() => { setCurrentFolder(null); setPath([]); }} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>Root</button>
                {path.map((p, i) => (
                    <React.Fragment key={i}>
                        <ChevronRight size={14} />
                        <button onClick={() => {
                            const newPath = path.slice(0, i + 1);
                            setPath(newPath);
                            setCurrentFolder(p);
                        }} style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>{p.name}</button>
                    </React.Fragment>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {folders.filter(f => f.parent_id === (currentFolder ? currentFolder.id : null)).map(folder => (
                    <div key={folder.id} onClick={() => enterFolder(folder)} style={{
                        padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', cursor: 'pointer'
                    }}>
                        <Folder color="var(--neon-lime)" style={{ marginBottom: '12px' }} />
                        <div style={{ fontWeight: '600' }}>{folder.name}</div>
                    </div>
                ))}
                <div onClick={() => setIsCreateOpen(true)} style={{
                    padding: '20px', border: '1px dashed var(--border-subtle)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)'
                }}>
                    <FolderPlus size={20} /> New Folder
                </div>
            </div>

            {currentFolder && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Games in {currentFolder.name}</h3>
                    {games.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)' }}>No games in this folder. Save analysis from the board to see them here.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {games.map(game => (
                                <div key={game.id} onClick={() => handleGameClick(game)} style={{
                                    padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between'
                                }} className="hover:bg-white/5">
                                    <span>{game.title || "Untitled Analysis"}</span>
                                    <ExternalLink size={14} color="var(--text-muted)" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Pro Callout */}
            <div style={{ marginTop: '60px', padding: '40px', background: 'linear-gradient(135deg, rgba(163, 230, 53, 0.05) 0%, rgba(163, 230, 53, 0.01) 100%)', borderRadius: '16px', border: '1px solid rgba(163, 230, 53, 0.2)', textAlign: 'center' }}>
                <h4 style={{ color: 'var(--neon-lime)', marginBottom: '12px' }}>Unlock Tactical Training</h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>The Pro version includes automated Spaced Repetition (Flashcards) and a full training dashboard.</p>
                <a href="https://joe-ging.github.io/macbase-app/" target="_blank" className="btn-primary" style={{ padding: '8px 24px', textDecoration: 'none', display: 'inline-block' }}>Upgrade to Pro</a>
            </div>

            {/* Modal */}
            {isCreateOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '32px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Create Folder</h3>
                        <input
                            autoFocus
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                            placeholder="Folder Name"
                            style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', marginBottom: '24px' }}
                        />
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleCreateFolder} className="btn-primary" style={{ padding: '8px 20px' }}>Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Repertoire;
