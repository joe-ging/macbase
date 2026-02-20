import React, { useState, useEffect } from 'react';
import { FolderPlus, Folder, ArrowLeft, ChevronRight, MoreVertical, FileText, Upload, Download, X, Check, Trash2, Brain, Zap, ExternalLink, Scissors, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ECO_CODES } from '../data/ecoCodes';
import MiniChessboard from '../components/MiniChessboard.jsx';

const Repertoire = () => {
    const navigate = useNavigate();
    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null); // null = root
    const [path, setPath] = useState([]); // Array of folder objects
    const [loading, setLoading] = useState(true);
    const [games, setGames] = useState([]);

    // Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [importPgnContent, setImportPgnContent] = useState('');
    const [selectedColor, setSelectedColor] = useState('neon-lime');
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, id: null, name: '' }); // type: 'folder' | 'game'
    const [isMoveOpen, setIsMoveOpen] = useState(false);
    const [movingGame, setMovingGame] = useState(null);
    const [targetImportFolder, setTargetImportFolder] = useState(null);
    const [viewMode, setViewMode] = useState('library'); // 'library' or 'flashcards'
    const [layoutMode, setLayoutMode] = useState('list'); // 'list' or 'grid'

    // Flashcard Filtering State
    const [searchOpening, setSearchOpening] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const COLORS = [
        { name: 'Neon Lime', value: 'neon-lime', hex: '#a3e635' },
        { name: 'Red', value: 'red-500', hex: '#ef4444' },
        { name: 'Orange', value: 'orange-500', hex: '#f97316' },
        { name: 'Amber', value: 'amber-500', hex: '#f59e0b' },
        { name: 'Yellow', value: 'yellow-500', hex: '#eab308' },
        { name: 'Lime', value: 'lime-500', hex: '#84cc16' },
        { name: 'Green', value: 'green-500', hex: '#22c55e' },
        { name: 'Emerald', value: 'emerald-500', hex: '#10b981' },
        { name: 'Teal', value: 'teal-500', hex: '#14b8a6' },
        { name: 'Cyan', value: 'cyan-500', hex: '#06b6d4' },
        { name: 'Sky', value: 'sky-500', hex: '#0ea5e9' },
        { name: 'Blue', value: 'blue-500', hex: '#3b82f6' },
        { name: 'Indigo', value: 'indigo-500', hex: '#6366f1' },
        { name: 'Violet', value: 'violet-500', hex: '#8b5cf6' },
        { name: 'Purple', value: 'purple-500', hex: '#a855f7' },
        { name: 'Fuchsia', value: 'fuchsia-500', hex: '#d946ef' },
        { name: 'Pink', value: 'pink-500', hex: '#ec4899' },
        { name: 'Rose', value: 'rose-500', hex: '#f43f5e' }
    ];

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
        { name: 'Scandinavian Defense', range: ['B01'] }
    ];

    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        if (viewMode === 'flashcards') {
            setLayoutMode('grid');
            fetchAllFlashcards();
        } else if (currentFolder) {
            fetchFolderContents(currentFolder.id);
        } else {
            setGames([]);
        }
    }, [currentFolder, viewMode]);

    const fetchAllFlashcards = () => {
        setLoading(true);
        fetch(`http://localhost:8000/api/repertoire/flashcards?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                setGames(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch flashcards", err);
                setLoading(false);
            });
    };

    const fetchFolders = () => {
        setLoading(true);
        fetch(`http://localhost:8000/api/repertoire/folders?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setFolders(data);
                } else {
                    setFolders([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch folders", err);
                setLoading(false);
            });
    };

    const fetchFolderContents = (folderId) => {
        fetch(`http://localhost:8000/api/repertoire/folder/${folderId}?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setGames(data);
                } else {
                    console.error("Expected array but got:", data);
                    setGames([]);
                }
            })
            .catch(err => {
                console.error("Error fetching folder contents:", err);
                setGames([]);
            });
    };

    const handleCreateFolder = () => {
        if (!newFolderName) return;

        const payload = {
            name: newFolderName,
            parent_id: currentFolder ? currentFolder.id : null,
            color: selectedColor
        };

        fetch('http://localhost:8000/api/repertoire/folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(newFolder => {
                setFolders([...folders, newFolder]);
                setIsCreateOpen(false);
                setNewFolderName('');
            });
    };

    const handleImportPgn = () => {
        if (!importPgnContent || !currentFolder) return;

        // Split PGN into individual games - look for [Event or any [Bracket tag at start of line
        const gamesList = importPgnContent.split(/(?=^\[\w+ ")/m).filter(g => g.trim());

        if (gamesList.length === 0) return;

        Promise.all(gamesList.map(gameContent => {
            let white = "?";
            let black = "?";
            const whiteMatch = gameContent.match(/\[White "([^"]+)"\]/);
            const blackMatch = gameContent.match(/\[Black "([^"]+)"\]/);
            if (whiteMatch) white = whiteMatch[1];
            if (blackMatch) black = blackMatch[1];

            const title = `${white} vs ${black}`;

            const payload = {
                folder_id: currentFolder.id,
                title: title,
                pgn: gameContent.trim(),
                fen: null,
                is_flashcard: false,
                arrows: []
            };

            return fetch('http://localhost:8000/api/repertoire/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(res => res.json());
        }))
            .then(() => {
                fetchFolderContents(currentFolder.id);
                setIsImportOpen(false);
                setImportPgnContent('');
            })
            .catch(err => console.error("Bulk import failed", err));
    };

    const handleExportFolder = () => {
        if (!currentFolder) return;
        fetch(`http://localhost:8000/api/repertoire/folder/${currentFolder.id}/export`)
            .then(res => res.json())
            .then(data => {
                const blob = new Blob([data.pgn], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${currentFolder.name}.pgn`;
                a.click();
            })
            .catch(err => console.error("Export failed", err));
    };

    const [isRenaming, setIsRenaming] = useState(false);
    const [editName, setEditName] = useState('');

    const handleRenameFolder = () => {
        if (!editName || !currentFolder) return;
        fetch(`http://localhost:8000/api/repertoire/folder/${currentFolder.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editName, color: currentFolder.color, parent_id: currentFolder.parent_id })
        })
            .then(res => res.json())
            .then(updated => {
                setCurrentFolder(updated);
                setIsRenaming(false);
                fetchFolders();
            })
            .catch(err => console.error("Rename failed", err));
    };

    const handleMoveGame = (e, game) => {
        e.stopPropagation();
        setMovingGame(game);
        setIsMoveOpen(true);
    };

    const confirmMove = (targetFolderId) => {
        if (!movingGame) return;
        fetch(`http://localhost:8000/api/repertoire/game/${movingGame.id}/move?target_folder_id=${targetFolderId}`, {
            method: 'PUT'
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setIsMoveOpen(false);
                    setMovingGame(null);
                    fetchFolderContents(currentFolder.id);
                }
            })
            .catch(err => console.error("Move failed", err));
    };

    const detectOpening = (pgn) => {
        if (!pgn) return null;
        const ecoMatch = pgn.match(/\[ECO "([^"]+)"\]/);
        if (ecoMatch) return ecoMatch[1];
        return null;
    };

    const handleDeleteGame = (e, gameId, gameTitle) => {
        e.stopPropagation();
        setDeleteConfirm({ open: true, type: 'game', id: gameId, name: gameTitle });
    };

    const confirmDelete = () => {
        const { type, id } = deleteConfirm;
        if (type === 'game') {
            fetch(`http://localhost:8000/api/repertoire/game/${id}`, {
                method: 'DELETE'
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setDeleteConfirm({ open: false, type: null, id: null, name: '' });
                        if (viewMode === 'flashcards') {
                            fetchAllFlashcards();
                        } else if (currentFolder) {
                            fetchFolderContents(currentFolder.id);
                        } else {
                            fetchFolders();
                        }
                    }
                })
                .catch(err => console.error("Delete failed", err));
        } else if (type === 'folder') {
            fetch(`http://localhost:8000/api/repertoire/folder/${id}`, {
                method: 'DELETE'
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setDeleteConfirm({ open: false, type: null, id: null, name: '' });
                        if (currentFolder && currentFolder.id === id) {
                            goBack();
                            fetchFolders();
                        } else {
                            fetchFolders();
                        }
                    } else {
                        alert(data.detail || "Failed to delete folder");
                        setDeleteConfirm({ open: false, type: null, id: null, name: '' });
                    }
                })
                .catch(err => console.error("Delete folder failed", err));
        }
    };

    const handleDeleteFolder = (e, folderId, folderName) => {
        e.stopPropagation();
        setDeleteConfirm({ open: true, type: 'folder', id: folderId, name: folderName });
    };

    const enterFolder = (folder) => {
        setCurrentFolder(folder);
        setPath([...path, folder]);
    };

    const goBack = () => {
        if (path.length === 0) return;
        const newPath = [...path];
        newPath.pop();
        setPath(newPath);
        setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1] : null);
    };

    const getVisibleFolders = () => {
        const currentId = currentFolder ? currentFolder.id : null;
        return (Array.isArray(folders) ? folders : []).filter(f => f.parent_id === currentId);
    };

    const handleGameClick = (game) => {
        const analysisGame = {
            id: `rep-${game.id}`,
            white: game.white || (game.is_flashcard ? "Tactical Puzzle" : "Repertoire Game"),
            black: game.black || game.title,
            white_elo: game.white_elo,
            black_elo: game.black_elo,
            event: game.event || "Repertoire",
            result: "*",
            date: game.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            pgn: game.pgn,
            fen: game.fen,
            orientation: game.orientation || (game.fen?.split(' ')[1] === 'b' ? 'black' : 'white'),
            is_personal: 1,
            is_flashcard: game.is_flashcard,
            repertoire_arrows: game.arrows
        };
        navigate('/analysis', { state: { game: analysisGame } });
    };

    // UI Helpers
    const getColorHex = (colorName) => {
        const c = COLORS.find(cx => cx.value === colorName);
        return c ? c.hex : '#a3e635';
    };

    const startPracticeSession = () => {
        const sessionGames = games.filter(g => g.is_flashcard);
        if (sessionGames.length === 0) return;
        handleGameClick(sessionGames[0]);
    };

    return (
        <div style={{ padding: '40px', background: 'var(--bg-deep)', minHeight: '100vh', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>

            {/* View Mode Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
                    <button
                        onClick={() => { setViewMode('library'); setCurrentFolder(null); setPath([]); setLayoutMode('list'); }}
                        style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                            background: viewMode === 'library' ? 'var(--neon-lime)' : 'transparent',
                            color: viewMode === 'library' ? '#000' : 'var(--text-secondary)',
                            transition: 'all 0.2s'
                        }}
                    >
                        LIBRARY
                    </button>
                    <button
                        onClick={() => setViewMode('flashcards')}
                        style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                            background: viewMode === 'flashcards' ? 'var(--neon-lime)' : 'transparent',
                            color: viewMode === 'flashcards' ? '#000' : 'var(--text-secondary)',
                            transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <Zap size={14} /> FLASHCARDS
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px' }}>
                    <button
                        onClick={() => setLayoutMode('list')}
                        style={{
                            padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            background: layoutMode === 'list' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            color: layoutMode === 'list' ? 'white' : '#64748b'
                        }}
                    >
                        <FileText size={16} />
                    </button>
                    <button
                        onClick={() => setLayoutMode('grid')}
                        style={{
                            padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            background: layoutMode === 'grid' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            color: layoutMode === 'grid' ? 'white' : '#64748b'
                        }}
                    >
                        <Brain size={16} />
                    </button>
                </div>
            </div>

            {/* Header / Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {path.length > 0 && (
                        <button
                            onClick={goBack}
                            style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                            }}
                            className="hover:bg-white/10"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
                            {path.length > 0 ? 'Repertoire' : 'Library'}
                        </div>
                        <h2 style={{ fontSize: '32px', fontWeight: '800', margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {currentFolder ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {isRenaming ? (
                                        <input
                                            autoFocus
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleRenameFolder()}
                                            onBlur={() => setIsRenaming(false)}
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--neon-lime)', color: 'white', borderRadius: '4px', padding: '4px 8px', fontSize: '24px', fontWeight: '800' }}
                                        />
                                    ) : (
                                        <>
                                            {currentFolder.name}
                                            <button onClick={() => { setIsRenaming(true); setEditName(currentFolder.name); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} className="hover:text-white transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : 'My Collections'}
                        </h2>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {currentFolder && (
                        <button
                            onClick={handleExportFolder}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-primary)',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            className="hover:bg-white/10"
                        >
                            <Upload size={18} /> Export
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setImportPgnContent('');
                            setTargetImportFolder(currentFolder);
                            setIsImportOpen(true);
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--text-primary)',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        className="hover:bg-white/10"
                    >
                        <Download size={18} /> Import PGN
                    </button>
                    {currentFolder ? (
                        <button
                            onClick={(e) => handleDeleteFolder(e, currentFolder.id, currentFolder.name)}
                            style={{
                                background: '#ef4444',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                fontWeight: '700', border: 'none', cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
                            }}
                            className="hover:scale-105"
                        >
                            <Trash2 size={18} /> Delete This Folder
                        </button>
                    ) : null}
                    {viewMode === 'library' && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            style={{
                                background: 'var(--neon-lime)',
                                color: '#000',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                fontWeight: '700', border: 'none', cursor: 'pointer',
                                boxShadow: '0 0 20px rgba(163, 230, 53, 0.3)',
                                transition: 'all 0.2s'
                            }}
                            className="hover:scale-105"
                        >
                            <FolderPlus size={18} /> New {currentFolder ? 'Subfolder' : 'Folder'}
                        </button>
                    )}
                </div>
            </div>

            {/* Folder Grid */}
            {viewMode === 'library' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                    {getVisibleFolders().map(folder => (
                        <div
                            key={folder.id}
                            onClick={() => enterFolder(folder)}
                            style={{
                                background: 'rgba(30, 41, 59, 0.6)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                padding: '24px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            className="hover:transform hover:-translate-y-1 hover:shadow-xl hover:border-white/10 group"
                        >
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
                                background: getColorHex(folder.color)
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{ color: getColorHex(folder.color) }}>
                                    <Folder size={48} fill="currentColor" fillOpacity={0.15} strokeWidth={1.5} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={(e) => handleDeleteFolder(e, folder.id, folder.name)}
                                        style={{
                                            background: 'rgba(0,0,0,0.3)',
                                            border: 'none',
                                            color: '#ef4444',
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer',
                                            opacity: 0,
                                            transition: 'all 0.2s',
                                        }}
                                        className="group-hover:opacity-100 hover:bg-white/10"
                                        title="Delete Folder"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
                                        <ChevronRight size={20} color="var(--text-secondary)" />
                                    </div>
                                </div>
                            </div>

                            <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                                {folder.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                Shared Opening Prep
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Files / Games List */}
            {(currentFolder || viewMode === 'flashcards') && (
                <div className="animate-fade-in-up">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', margin: 0 }}>
                                {viewMode === 'flashcards' ? 'Global Flashcards' : 'Stored Games & Analyses'}
                            </h3>
                            {viewMode === 'flashcards' && (
                                <>
                                    {games.length > 0 && (
                                        <button
                                            onClick={startPracticeSession}
                                            style={{
                                                background: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
                                                color: 'white',
                                                padding: '6px 16px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '900',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                boxShadow: '0 4px 12px rgba(251, 113, 133, 0.3)'
                                            }}
                                            className="hover:scale-105 transition-transform"
                                        >
                                            <Brain size={14} /> START PRACTICE
                                        </button>
                                    )}

                                    {/* Filtering UI */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px' }}>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <input
                                                type="text"
                                                placeholder="ECO Code..."
                                                value={ECO_CODES.find(e => e.code === searchOpening) ? '' : searchOpening}
                                                onChange={(e) => setSearchOpening(e.target.value.toUpperCase())}
                                                style={{
                                                    width: '100px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid var(--text-secondary)',
                                                    borderRadius: '6px',
                                                    padding: '6px 10px',
                                                    color: 'white',
                                                    fontSize: '11px',
                                                    fontWeight: '600'
                                                }}
                                            />
                                            <select
                                                value={ECO_CODES.find(e => e.code === searchOpening) ? searchOpening : ""}
                                                onChange={(e) => setSearchOpening(e.target.value)}
                                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--text-secondary)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', width: '200px' }}
                                            >
                                                <option value="">Or Select Code...</option>
                                                {ECO_CODES.map(eco => (
                                                    <option key={eco.code} value={eco.code}>{eco.code} - {eco.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <select
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                            style={{ background: '#334155', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}
                                        >
                                            <option value="All">All Categories</option>
                                            {['Middlegame', 'Endgame', 'Blunder', 'Brilliancy', 'Tactic', 'Opening'].map(c => (
                                                <option key={c} value={`Category:${c}`}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                            {viewMode === 'flashcards' ?
                                (Array.isArray(games) ? games : []).filter(g => {
                                    if (!g) return false;
                                    const tagsStr = g.tags ? String(g.tags) : '';
                                    if (searchOpening && searchOpening !== 'All Openings') {
                                        const fam = OPENING_FAMILIES.find(f => f.name === searchOpening);
                                        const opTag = tagsStr.split(',').find(t => t.startsWith('Opening:'));

                                        if (!opTag) return false;

                                        const opCode = opTag.replace('Opening:', '').trim().split(' ')[0]; // e.g., B90

                                        if (fam && fam.range && Array.isArray(fam.range) && fam.range.length > 0) {
                                            const matches = fam.range.some(r => opCode.startsWith(r));
                                            if (!matches) return false;
                                        } else {
                                            if (!opTag.toLowerCase().includes(searchOpening.toLowerCase())) return false;
                                        }
                                    }
                                    if (filterCategory !== 'All' && !tagsStr.includes(filterCategory)) return false;
                                    return true;
                                }).length
                                : (Array.isArray(games) ? games.length : 0)
                            } Items
                        </div>
                    </div>

                    {!Array.isArray(games) || games.length === 0 ? (
                        <div style={{
                            padding: '80px 40px', textAlign: 'center', color: 'var(--text-muted)',
                            background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '2px dashed rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ marginBottom: '20px', opacity: 0.3 }}>
                                {viewMode === 'flashcards' ? <Zap size={64} style={{ margin: '0 auto' }} /> : <FileText size={48} style={{ margin: '0 auto' }} />}
                            </div>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                {viewMode === 'flashcards' ? 'No Flashcards Yet' : 'This folder is empty'}
                            </p>
                            <p style={{ margin: '12px auto 0', fontSize: '14px', opacity: 0.7, maxWidth: '300px', lineHeight: '1.6' }}>
                                {viewMode === 'flashcards'
                                    ? (searchOpening || filterCategory !== 'All'
                                        ? "No flashcards match your selected filters."
                                        : 'Mark any repertoire game as a "Tactical Puzzle" during save to see it here for training.')
                                    : 'Import a PGN or save an analysis to see it here.'}
                            </p>
                        </div>
                    ) : (layoutMode === 'grid' || viewMode === 'flashcards') ? (
                        /* Unified Grid View - Mini Boards */
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '32px',
                            padding: '8px'
                        }}>
                            {(viewMode === 'flashcards'
                                ? (Array.isArray(games) ? games : []).filter(g => {
                                    if (!g) return false;
                                    const tagsStr = g.tags ? String(g.tags) : '';
                                    if (searchOpening && searchOpening !== 'All Openings') {
                                        const fam = OPENING_FAMILIES.find(f => f.name === searchOpening);
                                        const opTag = tagsStr.split(',').find(t => t.startsWith('Opening:'));

                                        if (!opTag) return false;

                                        const opCode = opTag.replace('Opening:', '').trim().split(' ')[0]; // e.g., B90

                                        if (fam && fam.range && Array.isArray(fam.range) && fam.range.length > 0) {
                                            const matches = fam.range.some(r => opCode.startsWith(r));
                                            if (!matches) return false;
                                        } else {
                                            if (!opTag.toLowerCase().includes(searchOpening.toLowerCase())) return false;
                                        }
                                    }
                                    if (filterCategory !== 'All' && !tagsStr.includes(filterCategory)) return false;
                                    return true;
                                })
                                : (Array.isArray(games) ? games : []).filter(g => g && !g.is_flashcard)
                            ).map(game => (
                                <div key={game.id} style={{
                                    background: 'rgba(30, 41, 59, 0.4)',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }} className="hover:transform hover:-translate-y-2 hover:border-white/20 group">

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{
                                            maxWidth: '80%',
                                            fontWeight: '700',
                                            color: game.is_flashcard ? '#fb7185' : 'var(--neon-lime)',
                                            fontSize: '14px',
                                            letterSpacing: '0.02em',
                                            textTransform: 'uppercase'
                                        }}>
                                            {game.title || (game.is_flashcard ? "Tactical Position" : "Analysis")}
                                            {game.tags && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                                    {String(game.tags).split(',').map((tag, i) => (
                                                        <span key={i} style={{
                                                            fontSize: '9px', padding: '2px 4px', borderRadius: '3px',
                                                            background: tag.startsWith('Opening:') ? 'rgba(96, 165, 250, 0.2)' : 'rgba(251, 113, 133, 0.2)',
                                                            color: tag.startsWith('Opening:') ? '#60a5fa' : '#fb7185',
                                                            fontWeight: 'normal', textTransform: 'none'
                                                        }}>
                                                            {tag.replace('Opening:', '').replace('Category:', '')}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleMoveGame(e, game); }}
                                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                                className="hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteGame(e, game.id, game.title); }}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.15)',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    color: '#f87171',
                                                    cursor: 'pointer',
                                                    padding: '6px',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                className="hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                title="Delete this item"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mini Board with Arrows */}
                                    <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => handleGameClick(game)}>
                                        <MiniChessboard
                                            key={`mini-${game.id}-${game.fen}`}
                                            fen={game.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'}
                                            orientation={game.orientation || 'white'}
                                        />

                                        {game.arrows && Array.isArray(game.arrows) && game.arrows.length > 0 && (
                                            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
                                                <defs>
                                                    <marker id="arrowhead-g" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                                                        <polygon points="0 0, 4 2, 0 4" fill="rgba(163, 230, 53, 0.8)" />
                                                    </marker>
                                                    <marker id="arrowhead-r" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                                                        <polygon points="0 0, 4 2, 0 4" fill="rgba(248, 113, 113, 0.8)" />
                                                    </marker>
                                                </defs>
                                                {game.arrows.map((arrow, i) => {
                                                    const getCoord = (sq) => {
                                                        if (!sq || sq.length < 2) return { x: 0, y: 0 };
                                                        const isBlack = (game.orientation === 'black' || (!game.orientation && String(game.fen || '').split(' ')[1] === 'b'));
                                                        let f = sq.charCodeAt(0) - 97;
                                                        let r = 8 - parseInt(sq[1]);
                                                        if (isBlack) { f = 7 - f; r = 7 - r; }
                                                        return { x: f * 12.5 + 6.25, y: r * 12.5 + 6.25 };
                                                    };
                                                    const start = getCoord(arrow.from);
                                                    const end = getCoord(arrow.to);
                                                    if (arrow.from === arrow.to) {
                                                        return <circle key={i} cx={`${start.x}%`} cy={`${start.y}%`} r="6%" fill="rgba(250, 204, 21, 0.4)" stroke="rgba(250, 204, 21, 0.9)" strokeWidth="3" />;
                                                    }
                                                    const color = arrow.color === 'R' ? 'rgba(248, 113, 113, 0.8)' : 'rgba(163, 230, 53, 0.8)';
                                                    const marker = arrow.color === 'R' ? 'url(#arrowhead-r)' : 'url(#arrowhead-g)';
                                                    return <line key={i} x1={`${start.x}%`} y1={`${start.y}%`} x2={`${end.x}%`} y2={`${end.y}%`} stroke={color} strokeWidth="6" markerEnd={marker} strokeLinecap="round" />;
                                                })}
                                            </svg>
                                        )}
                                    </div>

                                    {/* Game Metadata Line */}
                                    {(game.white || game.black) && (
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#94a3b8',
                                            fontStyle: 'italic',
                                            borderTop: '1px solid rgba(255,255,255,0.05)',
                                            paddingTop: '12px',
                                            lineHeight: '1.4'
                                        }}>
                                            <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>
                                                {game.white} {game.white_elo ? `(${game.white_elo})` : ''} vs {game.black} {game.black_elo ? `(${game.black_elo})` : ''}
                                            </div>
                                            <div style={{ opacity: 0.6, fontSize: '11px' }}>{game.event || 'Unknown Event'}</div>
                                        </div>
                                    )}

                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                                        <span>{new Date(game.created_at).toLocaleDateString()}</span>
                                        {game.is_flashcard ? (
                                            <span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(251, 113, 133, 0.1)', color: '#fb7185', borderRadius: '4px', fontWeight: '700' }}>SNAP</span>
                                        ) : (
                                            <span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(163, 230, 53, 0.1)', color: 'var(--neon-lime)', borderRadius: '4px', fontWeight: '700' }}>GAME</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Standard Library List View */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {games.filter(g => !g.is_flashcard).map(game => (
                                <div
                                    key={game.id}
                                    onClick={() => handleGameClick(game)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px 24px',
                                        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        border: '1px solid transparent',
                                        borderLeft: `4px solid ${game.is_flashcard ? '#fb7185' : getColorHex('neon-lime')}`,
                                        transition: 'all 0.2s'
                                    }}
                                    className="hover:bg-white/5 hover:border-white/5 group"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            background: game.is_flashcard ? 'rgba(251, 113, 133, 0.1)' : 'rgba(163, 230, 53, 0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: game.is_flashcard ? '#fb7185' : '#a3e635'
                                        }}>
                                            {game.is_flashcard ? <Scissors size={20} /> : <FileText size={20} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '15px' }}>{game.title || "Untitled Game"}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                                                <span style={{ color: game.is_flashcard ? '#fb7185' : '#a3e635' }}>
                                                    {game.is_flashcard ? 'Tactical Puzzle' : 'Analysis'}
                                                </span>
                                                <span>•</span>
                                                <span>{game.created_at ? new Date(game.created_at).toLocaleDateString() : 'Unknown Date'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        {detectOpening(game.pgn) && (
                                            <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--neon-lime)', background: 'rgba(163, 230, 53, 0.1)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                                                {detectOpening(game.pgn)}
                                            </div>
                                        )}
                                        <button
                                            onClick={(e) => handleMoveGame(e, game)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', opacity: 0, cursor: 'pointer', transition: 'all 0.2s' }}
                                            className="group-hover:opacity-100 hover:text-white"
                                            title="Move to Folder"
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteGame(e, game.id, game.title)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0, cursor: 'pointer', transition: 'all 0.2s' }}
                                            className="group-hover:opacity-100 hover:scale-110"
                                            title="Delete Game"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <ChevronRight size={18} color="var(--text-secondary)" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create Folder Modal */}
            {isCreateOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-panel" style={{ padding: '32px', width: '440px', border: '1px solid var(--border-active)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Create New Collection</h3>
                            <button onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '700' }}>FOLDER NAME</label>
                            <input
                                autoFocus
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                style={{
                                    width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid var(--border-subtle)', borderRadius: '8px',
                                    color: 'white', outline: 'none', fontSize: '15px'
                                }}
                                placeholder="e.g. King's Indian Defense"
                            />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '12px', color: 'var(--text-secondary)', fontWeight: '700' }}>COLOR TAG</label>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                {COLORS.map(c => (
                                    <div
                                        key={c.value}
                                        onClick={() => setSelectedColor(c.value)}
                                        style={{
                                            width: '40px', height: '40px', borderRadius: '12px', background: c.hex,
                                            cursor: 'pointer',
                                            border: selectedColor === c.value ? '3px solid white' : '3px solid transparent',
                                            boxShadow: selectedColor === c.value ? `0 0 15px ${c.hex}80` : 'none',
                                            transform: selectedColor === c.value ? 'scale(1.1)' : 'scale(1)',
                                            transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                        title={c.name}
                                    >
                                        {selectedColor === c.value && <Check size={20} color={c.value === 'gold' || c.value === 'neon-lime' ? 'black' : 'white'} strokeWidth={3} />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '12px 20px', fontWeight: '600' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateFolder}
                                disabled={!newFolderName.trim()}
                                style={{
                                    background: 'var(--neon-lime)', color: 'black', border: 'none',
                                    padding: '12px 24px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer',
                                    opacity: !newFolderName.trim() ? 0.5 : 1
                                }}
                            >
                                Create Collection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import PGN Modal */}
            {isImportOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-panel" style={{ padding: '32px', width: '600px', border: '1px solid var(--border-active)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Import Games</h3>
                            <button onClick={() => setIsImportOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '700' }}>TARGET COLLECTION</label>
                            <select
                                value={targetImportFolder?.id || ''}
                                onChange={(e) => setTargetImportFolder(folders.find(f => f.id === parseInt(e.target.value)))}
                                style={{
                                    width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--border-subtle)', borderRadius: '8px',
                                    color: 'white', outline: 'none'
                                }}
                            >
                                <option value="" disabled>-- Select a Folder --</option>
                                {folders.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '700' }}>PASTE PGN TEXT</label>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    autoFocus
                                    value={importPgnContent}
                                    onChange={e => setImportPgnContent(e.target.value)}
                                    style={{
                                        width: '100%', height: '240px', padding: '16px', background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--border-subtle)', borderRadius: '8px',
                                        color: 'var(--text-primary)', outline: 'none', fontSize: '13px', fontFamily: 'monospace',
                                        resize: 'none'
                                    }}
                                    placeholder={'[Event "Local Tournament"]\n[White "Player A"]\n[Black "Player B"]\n...\n1. e4 e5 ...'}
                                />
                                {importPgnContent && (
                                    <div style={{ position: 'absolute', bottom: '16px', right: '16px', fontSize: '12px', color: 'var(--neon-lime)' }}>
                                        Ready to import
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setIsImportOpen(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '12px 20px', fontWeight: '600' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImportPgn}
                                disabled={!importPgnContent.trim() || !targetImportFolder}
                                style={{
                                    background: 'var(--neon-lime)', color: 'black', border: 'none',
                                    padding: '12px 24px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer',
                                    opacity: (!importPgnContent.trim() || !targetImportFolder) ? 0.5 : 1,
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <Upload size={18} /> Import Game
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Move Game Modal */}
            {isMoveOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100
                }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', width: '480px', borderRadius: '20px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>Move to Folder</h3>
                            <button onClick={() => setIsMoveOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Select a target folder for <span style={{ color: '#fff', fontWeight: '600' }}>{movingGame?.title}</span></p>

                        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '10px' }}>
                            {folders.filter(f => !currentFolder || f.id !== currentFolder.id).map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => confirmMove(folder.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '12px', color: '#fff', cursor: 'pointer', textAlign: 'left',
                                        transition: 'all 0.2s'
                                    }}
                                    className="hover:bg-white/10 hover:border-white/20"
                                >
                                    <Folder size={18} color={getColorHex(folder.color)} fill={getColorHex(folder.color)} fillOpacity={0.2} />
                                    <span style={{ fontWeight: '600' }}>{folder.name}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsMoveOpen(false)}
                            style={{ width: '100%', marginTop: '24px', padding: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {deleteConfirm.open && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)',
                        width: '100%', maxWidth: '400px', borderRadius: '16px', padding: '32px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'center'
                    }} className="animate-fade-in-scale">
                        <div style={{
                            width: '64px', height: '64px', background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#ef4444', margin: '0 auto 24px'
                        }}>
                            <Trash2 size={32} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px', color: '#fff' }}>
                            Delete {deleteConfirm.type === 'folder' ? 'Folder' : 'Game'}?
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.5', margin: '0 0 32px' }}>
                            Are you sure you want to delete <span style={{ color: '#fff', fontWeight: '700' }}>"{deleteConfirm.name}"</span>?
                            {deleteConfirm.type === 'folder' ? " This will remove all games and subfolders inside." : " This action cannot be undone."}
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setDeleteConfirm({ open: false, type: null, id: null, name: '' })}
                                style={{
                                    flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)',
                                    color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    flex: 1, padding: '12px', background: '#ef4444',
                                    color: '#fff', border: 'none', borderRadius: '10px',
                                    fontWeight: '700', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Repertoire;
