import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RotateCcw, FastForward, Home, Cpu, RotateCw, Save, RefreshCw, Download, Upload, MessageSquare, Trash2, Scissors, Camera } from 'lucide-react';

// Extracted modules
import { getOpeningName } from '../data/ecoOpenings';
import { PIECE_IMAGES, convertUciToSan, formatEval } from '../data/chessUtils';
import EvalBar from '../components/EvalBar';
import InteractiveChessboard from '../components/InteractiveChessboard';
import EngineLinesPanel from '../components/EngineLinesPanel';
const Analysis = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // State
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [moves, setMoves] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [gameInfo, setGameInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [boardOrientation, setBoardOrientation] = useState('white'); // 'white' or 'black'

    // Analysis mode state (for user's own moves)
    const [analysisMode, setAnalysisMode] = useState(false);
    const [analysisFen, setAnalysisFen] = useState(null);
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [legalMoves, setLegalMoves] = useState([]);

    // Engine state
    const [topMoves, setTopMoves] = useState([]);
    const [evaluation, setEvaluation] = useState(null);
    const [isEngineConnected, setIsEngineConnected] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, success, error
    const [comments, setComments] = useState({}); // Map<fen, string>
    const [currentComment, setCurrentComment] = useState('');
    const [moveFens, setMoveFens] = useState([]); // Array of FENs mapping to moves index
    const [variations, setVariations] = useState({}); // Map<parentFen, Array<{san, fen, eval}>>
    const [fenEvaluations, setFenEvaluations] = useState({}); // Map<fen, evaluation>

    // Visual Arrows per Position (Map<fen, Arrow[]>)
    const [positionArrows, setPositionArrows] = useState({});

    // Derived arrows for current board (handles "loading" arrows when navigating)
    // We use the current 'fen' (or 'analysisFen' if in analysis mode) to look up arrows
    const activeFen = analysisMode && analysisFen ? analysisFen : fen;
    const [arrows, setArrows] = useState([]);
    const handleArrowDraw = () => {
        // Reserved for Pro version
        console.info("Upgrade to macbase Pro for arrow drawing and tactical highlighting.");
    };

    // Evaluation cache for instant navigation - preloaded when game loads
    const evalCache = useRef(new Map()); // Map<fen, {evaluation, topMoves}>
    const [preloadProgress, setPreloadProgress] = useState({ loaded: 0, total: 0, loading: false });

    // Save Modal State
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [availableFolders, setAvailableFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState('');
    const [isFlashcard, setIsFlashcard] = useState(false);
    const [isSnapshotMode, setIsSnapshotMode] = useState(false);
    const [snapshotTag, setSnapshotTag] = useState('');
    const [snapshotCategory, setSnapshotCategory] = useState('Middlegame'); // Default category
    const [capturedFen, setCapturedFen] = useState(null);
    const [capturedOrientation, setCapturedOrientation] = useState(null);

    // Fetch folders on mount
    useEffect(() => {
        fetch('http://localhost:8000/api/repertoire/folders')
            .then(res => res.json())
            .then(data => {
                setAvailableFolders(data);
                if (data.length > 0) setSelectedFolderId(data[0].id);
            })
            .catch(err => console.error("Failed to load folders", err));
    }, []);

    // lastSentFen tracks the last position we fetched eval for (to avoid duplicate requests)
    const lastSentFen = useRef(null);
    // currentExpectedFen tracks which FEN we're EXPECTING results for (to prevent stale responses)
    const currentExpectedFen = useRef(null);

    // Refs for keyboard handler
    const moveIndexRef = useRef(currentMoveIndex);
    const movesRef = useRef(moves);

    useEffect(() => { moveIndexRef.current = currentMoveIndex; }, [currentMoveIndex]);
    useEffect(() => { movesRef.current = moves; }, [moves]);

    // Update legal moves when square is selected
    useEffect(() => {
        if (selectedSquare) {
            const currentFen = analysisMode && analysisFen ? analysisFen : fen;
            try {
                const game = new Chess(currentFen);
                const movesFromSquare = game.moves({ square: selectedSquare, verbose: true });
                setLegalMoves(movesFromSquare.map(m => m.to));
            } catch (e) {
                setLegalMoves([]);
            }
        } else {
            setLegalMoves([]);
        }
    }, [selectedSquare, fen, analysisFen, analysisMode]);

    // Lichess Cloud Evaluation API - provides stable, non-fluctuating evaluations
    // Falls back to local Stockfish for positions not in Lichess cache
    // CRITICAL: Checks currentExpectedFen before every state update to prevent stale responses
    const fetchCloudEval = useCallback(async (fenToEvaluate) => {
        if (!fenToEvaluate || fenToEvaluate === 'start') return;

        // Set the expected FEN BEFORE starting the fetch
        currentExpectedFen.current = fenToEvaluate;

        // Helper to check if this response is still valid
        const isStale = () => currentExpectedFen.current !== fenToEvaluate;

        try {
            setIsEngineConnected(true); // Indicate we're fetching

            // Lichess cloud eval API - fallback to local if slow
            const encodedFen = encodeURIComponent(fenToEvaluate);

            // Add abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 500); // 0.5s timeout - favor local engine if cloud is slow

            let response;
            try {
                response = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodedFen}&multiPv=3`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
            } catch (e) {
                console.log('[CLOUD] Timeout or error, falling back immediately');
                response = { ok: false };
            }

            // CHECK: Is this response still for the current position?
            if (isStale()) {
                console.log('[CLOUD] Stale response ignored for:', fenToEvaluate.substring(0, 30) + '...');
                return;
            }

            if (!response.ok) {
                // Position not in cloud cache - fallback to local Stockfish
                console.log('[CLOUD] Not in cache, falling back to local Stockfish');
                try {
                    const localResponse = await fetch(`http://localhost:8000/api/analyze?fen=${encodedFen}&priority=main`);

                    // CHECK AGAIN: Is this response still for the current position?
                    if (isStale()) {
                        console.log('[LOCAL] Stale response ignored');
                        return;
                    }

                    if (localResponse.ok) {
                        const localData = await localResponse.json();

                        // FINAL CHECK: Is this response still for the current position?
                        if (isStale()) {
                            console.log('[LOCAL] Stale response ignored after parse');
                            return;
                        }

                        console.log('[LOCAL] Stockfish response:', localData);
                        if (localData.top_moves && localData.top_moves.length > 0) {
                            const enrichedMoves = localData.top_moves.map(m => ({
                                ...m,
                                San: convertUciToSan(m.Move, fenToEvaluate)
                            }));
                            setTopMoves(enrichedMoves);
                            const mainMove = enrichedMoves[0];
                            if (mainMove.Mate !== null && mainMove.Mate !== undefined) {
                                setEvaluation({ type: 'mate', value: mainMove.Mate });
                            } else if (mainMove.Centipawn !== null && mainMove.Centipawn !== undefined) {
                                setEvaluation({ type: 'cp', value: mainMove.Centipawn });
                            }
                        }
                        return;
                    }
                } catch (localError) {
                    console.log('[LOCAL] Fallback failed:', localError);
                }

                // If local also failed and still current, show neutral eval
                if (!isStale()) {
                    setTopMoves([]);
                    setEvaluation({ type: 'cp', value: 0 });
                }
                return;
            }

            const data = await response.json();

            // FINAL CHECK: Is this response still for the current position?
            if (isStale()) {
                console.log('[CLOUD] Stale response ignored after parse');
                return;
            }

            console.log('[CLOUD] Eval response:', data);

            // Convert Lichess format to our format
            // Lichess returns: { depth, knodes, fen, pvs: [{ moves, cp/mate }] }
            if (data.pvs && data.pvs.length > 0) {
                const topMoves = data.pvs.map((pv, index) => {
                    const moves = pv.moves ? pv.moves.split(' ') : [];
                    const uci = moves[0] || '';
                    return {
                        Move: uci,
                        San: convertUciToSan(uci, fenToEvaluate),
                        Centipawn: pv.cp !== undefined ? pv.cp : null,
                        Mate: pv.mate !== undefined ? pv.mate : null
                    };
                });

                setTopMoves(topMoves);

                // Set main evaluation from first PV
                const mainPv = data.pvs[0];
                if (mainPv.mate !== undefined) {
                    setEvaluation({ type: 'mate', value: mainPv.mate });
                } else if (mainPv.cp !== undefined) {
                    setEvaluation({ type: 'cp', value: mainPv.cp });
                }
            }
        } catch (error) {
            console.error('[CLOUD] Eval error:', error);
            // Don't immediately set offline on single failure to prevent UI jitter
        }
    }, []);

    const preloadingRef = useRef(null); // Track current preloading task ID

    // Preload evaluations with separate engine priority to avoid blocking UI
    const preloadAllEvaluations = useCallback(async (gameMovesArray) => {
        if (!gameMovesArray || gameMovesArray.length === 0) return;

        const taskId = Math.random().toString(36).substring(7);
        preloadingRef.current = taskId;

        console.log('[PRELOAD] Starting preload for', gameMovesArray.length, 'positions (Task:', taskId, ')');
        setPreloadProgress({ loaded: 0, total: gameMovesArray.length, loading: true });

        // Generate all FENs for the game
        const positions = [];
        const chess = new Chess();

        // Add starting position
        positions.push({ index: -1, fen: chess.fen() });

        // Generate FEN for each move
        for (let i = 0; i < gameMovesArray.length; i++) {
            try {
                chess.move(gameMovesArray[i], { sloppy: true });
                positions.push({ index: i, fen: chess.fen() });
            } catch (e) {
                console.warn('[PRELOAD] Invalid move:', gameMovesArray[i]);
            }
        }

        // Fetch evaluations in parallel batches (5 at a time to avoid overwhelming backend)
        const batchSize = 2; // Further reduced for maximum responsiveness
        let loaded = 0;

        for (let i = 0; i < positions.length; i += batchSize) {
            const batch = positions.slice(i, i + batchSize);

            await Promise.all(batch.map(async ({ fen }) => {
                // Skip if already cached
                if (evalCache.current.has(fen)) {
                    loaded++;
                    return;
                }

                try {
                    if (preloadingRef.current !== taskId) return; // Cancelled by newer navigation
                    const encodedFen = encodeURIComponent(fen);
                    const response = await fetch(`http://localhost:8000/api/analyze?fen=${encodedFen}&priority=preload`);

                    if (response.ok) {
                        const data = await response.json();
                        if (data.top_moves && data.top_moves.length > 0) {
                            const mainMove = data.top_moves[0];
                            const evaluation = mainMove.Mate !== null && mainMove.Mate !== undefined
                                ? { type: 'mate', value: mainMove.Mate }
                                : { type: 'cp', value: mainMove.Centipawn || 0 };

                            const enrichedMoves = data.top_moves.map(m => ({
                                ...m,
                                San: convertUciToSan(m.Move, fen)
                            }));

                            evalCache.current.set(fen, {
                                evaluation: evaluation, // Retained original logic for evaluation object
                                topMoves: enrichedMoves
                            });
                        }
                    }
                } catch (e) {
                    // Ignore individual failures, just skip
                }
                loaded++;
            }));

            setPreloadProgress({ loaded, total: positions.length, loading: true });
        }

        console.log('[PRELOAD] Complete! Cached', evalCache.current.size, 'positions');
        setPreloadProgress({ loaded: positions.length, total: positions.length, loading: false });
        setIsEngineConnected(true);
    }, []);

    // Map moves to FENs for inline comments
    useEffect(() => {
        if (moves.length >= 0) {
            const fens = [];
            const tempGame = new Chess();
            fens[-1] = tempGame.fen(); // Start position
            for (let i = 0; i < moves.length; i++) {
                try {
                    tempGame.move(moves[i]);
                    fens[i] = tempGame.fen();
                } catch (e) {
                    fens[i] = fens[i - 1];
                }
            }
            setMoveFens(fens);
        }
    }, [moves]);

    // Track if user made changes to prevent auto-save on load
    const isDirtyRef = useRef(false);

    // Auto-save comments when they change (only if dirty)
    const autoSaveTimerRef = useRef(null);
    useEffect(() => {
        if (!gameInfo?.id || Object.keys(comments).length === 0 || !isDirtyRef.current) return;

        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

        // Only save if dirty
        autoSaveTimerRef.current = setTimeout(() => {
            saveAnalysis();
            isDirtyRef.current = false; // Reset dirty after save
        }, 1500);

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [comments]);

    // Track if we've already fetched for the current position
    const wasConnectedRef = useRef(false);
    const debounceRef = useRef(null);

    // Fetch cloud evaluation when position changes
    useEffect(() => {
        const currentFen = analysisMode && analysisFen ? analysisFen : fen;

        // Sync current comment when FEN changes
        setCurrentComment(comments[currentFen] || '');

        // Clear any pending debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        // Only attempt to fetch if we have a valid FEN
        if (!currentFen || currentFen === 'start') {
            return;
        }

        // Skip if same position
        if (lastSentFen.current === currentFen) {
            return;
        }

        // Debounce to avoid rapid API calls during fast navigation
        debounceRef.current = setTimeout(() => {
            console.log('[CLOUD] Fetching eval for:', currentFen.substring(0, 50) + '...');
            lastSentFen.current = currentFen;
            fetchCloudEval(currentFen);
        }, 300); // Reduced to 300ms now that we have engine priority (snappier feel)

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [fen, analysisFen, analysisMode, fetchCloudEval, comments]);

    // Handle comment change
    const handleCommentChange = (text) => {
        isDirtyRef.current = true; // Mark as dirty
        const currentFen = analysisMode && analysisFen ? analysisFen : fen;
        setCurrentComment(text);
        setComments(prev => ({
            ...prev,
            [currentFen]: text
        }));
    };

    // Sync current evaluations into a map for fast lookup in move list
    useEffect(() => {
        if (evaluation) {
            const currentPositionFen = analysisMode && analysisFen ? analysisFen : fen;
            setFenEvaluations(prev => ({
                ...prev,
                [currentPositionFen]: evaluation
            }));

            // If in analysis mode, we might want to update the variation eval
            if (analysisMode && analysisFen) {
                // Find which parent this belongs to? 
                // A bit complex, but the fenEvaluations map is enough for the UI to pick it up.
            }
        }
    }, [evaluation, analysisFen, fen, analysisMode]);

    // Handle user making a move on the board
    const handleUserMove = useCallback((from, to) => {
        const currentFen = analysisMode && analysisFen ? analysisFen : fen;
        try {
            const game = new Chess(currentFen);
            const move = game.move({ from, to, promotion: 'q' }); // Auto-promote to queen

            if (move) {
                const nextFen = game.fen();

                // Check if this move is the main line next move
                const mainLineNextMove = moves[currentMoveIndex + 1];
                if (!analysisMode && mainLineNextMove === move.san) {
                    goToMove(currentMoveIndex + 1);
                    return;
                }

                // If not main line, it's a variation
                setAnalysisMode(true);
                setAnalysisFen(nextFen);
                setSelectedSquare(null);

                // Add to variations map
                setVariations(prev => {
                    const parentFen = currentFen;
                    const existing = prev[parentFen] || [];
                    if (existing.some(v => v.san === move.san)) return prev;
                    return {
                        ...prev,
                        [parentFen]: [...existing, { san: move.san, fen: nextFen, parentFen: parentFen }]
                    };
                });
            }
        } catch (e) {
            console.error('Invalid move:', e);
        }
    }, [fen, analysisFen, analysisMode, moves, currentMoveIndex]);

    // Reset to game position
    const resetToGamePosition = useCallback(() => {
        setAnalysisMode(false);
        setAnalysisFen(null);
        setSelectedSquare(null);
    }, []);

    // Recursive helper to build PGN string with branches
    const getFullPgn = useCallback((startPositionFen, mainLine) => {
        let tempGame = new Chess(startPositionFen);
        let pgn = "";

        mainLine.forEach((moveSan, idx) => {
            const fenBefore = tempGame.fen();

            // 1. Check for variations branching from this position
            const branchingVariations = variations[fenBefore] || [];
            branchingVariations.filter(v => v.san !== moveSan).forEach(v => {
                // Collect the line for this variation
                const getVarLine = (mv) => {
                    const line = [mv.san];
                    let f = mv.fen;
                    while (variations[f] && variations[f].length > 0) {
                        line.push(variations[f][0].san);
                        f = variations[f][0].fen;
                        if (line.length > 20) break;
                    }
                    return line;
                };
                const varLine = getVarLine(v);
                // Standard PGN variation notation: (1. e4 e5)
                pgn += ` (${getFullPgn(fenBefore, varLine)})`;
            });

            // 2. Add the move itself
            const isBlack = tempGame.turn() === 'b';
            const moveNum = tempGame.moveNumber();
            if (!isBlack || idx === 0 || branchingVariations.length > 0) {
                pgn += ` ${moveNum}${isBlack ? '...' : '.'}`;
            }
            pgn += ` ${moveSan}`;

            tempGame.move(moveSan);
            const fenAfter = tempGame.fen();

            // 3. Add comment
            if (comments[fenAfter]) {
                pgn += ` {${comments[fenAfter]}}`;
            }
        });

        return pgn.trim();
    }, [variations, comments]);

    // Save current analysis to database
    const saveAnalysis = async () => {
        if (!gameInfo?.id) return;
        setIsSnapshotMode(false); // Default to full game save

        // Check if updating existing repertoire game with known folder
        if (typeof gameInfo.id === 'string' && gameInfo.id.startsWith('rep-') && gameInfo.folder_id) {
            const actualId = parseInt(gameInfo.id.replace('rep-', ''));
            // Direct update
            handleSaveConfirm(gameInfo.folder_id, actualId);
        } else {
            // New save or unknown folder -> Open Modal
            setShowSaveModal(true);
        }
    };

    const clipPosition = () => {
        setIsSnapshotMode(true);
        setSnapshotTag(''); // Reset tag for fresh snap
        setSnapshotCategory('Middlegame'); // Reset default category

        // Capture a clean version of the current FEN
        const currentActiveFen = analysisMode && analysisFen ? analysisFen : fen;
        setCapturedFen(currentActiveFen);
        setCapturedOrientation(boardOrientation);

        console.log("[CLIP] Captured FEN:", currentActiveFen);
        console.log("[CLIP] Captured Orientation:", boardOrientation);

        // If we don't have a folder selected yet, try to pick the first one
        if (!selectedFolderId && availableFolders.length > 0) {
            setSelectedFolderId(availableFolders[0].id);
        }
        setShowSaveModal(true);
    };

    const handleSaveConfirm = async (targetFolderId, updateId = null) => {
        setSaveStatus('saving');
        setShowSaveModal(false);

        try {
            // Construct PGN
            const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            let pgn = "";
            let tempGame = new Chess(initialFen);

            moves.forEach((moveSan, idx) => {
                const fenBefore = tempGame.fen();
                const isBlack = tempGame.turn() === 'b';
                const moveNum = tempGame.moveNumber();

                if (!isBlack || idx === 0) {
                    if (pgn.length > 0) pgn += " ";
                    pgn += `${moveNum}${isBlack ? '...' : '.'}`;
                }
                pgn += ` ${moveSan}`;

                try { tempGame.move(moveSan); } catch (e) { }
                const fenAfter = tempGame.fen();
                if (comments[fenAfter]) pgn += ` {${comments[fenAfter]}}`;
            });

            // Build payload
            let finalTitle = `${gameInfo.white} vs ${gameInfo.black}`;
            let finalPgn = pgn;

            if (isSnapshotMode) {
                // If it's a puzzle/snap, the user tag IS the title
                finalTitle = snapshotTag || "Tactical Position";
                // Use CAPTURED FEN (locked in when clip was clicked)
                finalPgn = `[FEN "${capturedFen || activeFen}"]\n*`;
            }

            // Critical: Capture the EXACT state at this moment to avoid race conditions
            const finalFen = isSnapshotMode ? (capturedFen || activeFen) : activeFen;
            const finalOrientation = isSnapshotMode ? (capturedOrientation || boardOrientation) : boardOrientation;

            const payload = {
                id: updateId,
                folder_id: parseInt(targetFolderId),
                title: String(finalTitle || "Tactical Position"),
                white: String(gameInfo?.white || ""),
                black: String(gameInfo?.black || ""),
                white_elo: String(gameInfo?.white_elo || ""),
                black_elo: String(gameInfo?.black_elo || ""),
                event: String(gameInfo?.event || ""),
                pgn: finalPgn,
                fen: finalFen,
                is_flashcard: (isSnapshotMode || isFlashcard) ? 1 : 0,
                orientation: finalOrientation,
                tags: isSnapshotMode ? [
                    `Opening:${(gameInfo?.eco || "")} ${(gameInfo?.opening || "")}`.trim(),
                    `Category:${snapshotCategory}`
                ].join(',') : null
            };

            const response = await fetch('http://localhost:8000/api/repertoire/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.status === 'success') {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 2000);

                // Update gameInfo to reflect it is now a repertoire game
                if (!updateId && data.id) {

                    // If this was a public DB game (numeric ID), mark it as "MY STUDY" in the main DB too
                    if (gameInfo.id && !String(gameInfo.id).startsWith('rep-')) {
                        try {
                            fetch(`http://localhost:8000/api/games/${gameInfo.id}/study`, { method: 'PUT' });
                        } catch (err) {
                            console.error("Failed to mark original game as study", err);
                        }
                    }

                    setGameInfo(prev => ({
                        ...prev,
                        id: `rep-${data.id}`,
                        folder_id: targetFolderId,
                        is_personal: true,
                        is_analyzed: true
                    }));
                }
            } else {
                console.error('Save failed:', data);
                setSaveStatus('error');
            }
        } catch (e) {
            console.error('Save error:', e);
            setSaveStatus('error');
        }
    };

    const downloadPgn = () => {
        if (!gameInfo) return;

        const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        let gameBody = getFullPgn(initialFen, moves);

        // Add starting comment if it exists
        const startComment = comments[initialFen];
        if (startComment) {
            gameBody = `{${startComment}} ${gameBody}`;
        }

        const headers = [
            `[White "${gameInfo.white || 'White'}"]`,
            `[Black "${gameInfo.black || 'Black'}"]`,
            `[Date "${gameInfo.date || ''}"]`,
            `[Event "${gameInfo.event || 'Analysis'}"]`,
            `[Result "${gameInfo.result || '*'}"]`,
            gameInfo.eco ? `[ECO "${gameInfo.eco}"]` : null
        ].filter(Boolean).join('\n');

        const pgnData = `${headers}\n\n${gameBody}`;
        const blob = new Blob([pgnData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Analysis_${gameInfo.white}_vs_${gameInfo.black}.pgn`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Navigate to a specific move in the game
    const goToMove = useCallback((index) => {
        const currentMoves = movesRef.current;
        if (index < -1) index = -1;
        if (index >= currentMoves.length) index = currentMoves.length - 1;

        const chess = new Chess();
        for (let i = 0; i <= index; i++) {
            const moveStr = currentMoves[i];
            if (moveStr) {
                try {
                    chess.move(moveStr, { sloppy: true });
                } catch (e) { }
            }
        }

        const newFen = chess.fen();
        setFen(newFen);
        setCurrentMoveIndex(index);

        // Check cache for instant evaluation - no delay!
        const cached = evalCache.current.get(newFen);
        if (cached) {
            console.log('[CACHE] Instant eval from cache:', cached.evaluation);
            setEvaluation(cached.evaluation);
            setTopMoves(cached.topMoves);
        }

        // Lazy-load evaluations for the next 10 moves if not already preloaded
        const movesToPreload = currentMoves.slice(index + 1, index + 11);
        if (movesToPreload.length > 0) {
            preloadAllEvaluations(movesToPreload);
        }

        // Reset analysis mode when navigating game
        setAnalysisMode(false);
        setAnalysisFen(null);
        setSelectedSquare(null);
    }, []);

    // Load game from navigation state
    useEffect(() => {
        let gameData = location.state?.game;

        if (!gameData) {
            const stored = sessionStorage.getItem('currentGame');
            if (stored) {
                try {
                    gameData = JSON.parse(stored);
                } catch (e) { }
            }
        }

        if (!gameData) {
            setError('No game loaded');
            setIsLoading(false);
            return;
        }

        // Initial game info setup
        setGameInfo({ ...gameData, is_analyzed: gameData.is_analyzed });
        sessionStorage.setItem('currentGame', JSON.stringify(gameData));
        if (gameData.orientation) setBoardOrientation(gameData.orientation);

        if (gameData.pgn) {
            setIsLoading(true);
            fetch('http://localhost:8000/api/parse-pgn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pgn: gameData.pgn })
            })
                .then(res => res.json())
                .then(data => {
                    setMoves(data.moves || []);
                    setComments(data.comments || {});
                    setMoveFens(data.fens || []);
                    setVariations(data.variations || {});

                    // Set position - flashcards jump to the saved FEN, games start at beginning
                    if (gameData.is_flashcard && gameData.fen) {
                        setFen(gameData.fen);
                        setCurrentMoveIndex(-1);
                        // Force orientation if saved
                        if (gameData.orientation) setBoardOrientation(gameData.orientation);
                    } else {
                        setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
                        setCurrentMoveIndex(-1);
                    }

                    // Cache cleared - evals will be loaded on-demand
                    evalCache.current.clear();
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error('Server-side PGN parse failed:', err);
                    const { moves: parsedMoves, comments: parsedComments, fens: parsedFens } = parsePGN(gameData.pgn);
                    setMoves(parsedMoves);
                    setComments(parsedComments);
                    setMoveFens(parsedFens);
                    setFen(gameData.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
                    setCurrentMoveIndex(-1);
                    setIsLoading(false);
                });
        } else {
            setFen(gameData.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
            setCurrentMoveIndex(-1);
            setIsLoading(false);
        }
    }, [location.state]);

    const parsePGN = (pgnText) => {
        try {
            const tempGame = new Chess();
            tempGame.loadPgn(pgnText);
            const history = tempGame.history({ verbose: true });
            const commentsArray = tempGame.getComments() || [];

            const moves = history.map(m => m.san);
            const fens = history.map(m => m.after);
            const commentMap = {};
            commentsArray.forEach(c => {
                commentMap[c.fen] = c.comment;
            });

            // Initial position comment
            const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            const startComment = tempGame.getComment(startFen);
            if (startComment) commentMap[startFen] = startComment;

            return { moves, comments: commentMap, fens };
        } catch (e) {
            console.error('PGN Parse failed:', e);
            return { moves: [], comments: {}, fens: [] };
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            const idx = moveIndexRef.current;
            const len = movesRef.current.length;

            if (e.key === 'ArrowRight' && idx < len - 1) {
                e.preventDefault();
                goToMove(idx + 1);
            } else if (e.key === 'ArrowLeft' && idx >= 0) {
                e.preventDefault();
                goToMove(idx - 1);
            } else if (e.key === 'ArrowUp' || e.key === 'Home') {
                e.preventDefault();
                goToMove(-1);
            } else if (e.key === 'ArrowDown' || e.key === 'End') {
                e.preventDefault();
                goToMove(len - 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToMove]);

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-deep)', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <RefreshCw className="animate-spin text-neon" size={24} />
                    <span style={{ fontSize: '18px', fontWeight: '500', letterSpacing: '0.05em' }}>INITIALIZING INTEL...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', background: 'var(--bg-deep)', color: 'var(--text-primary)' }}>
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
                    <div style={{ color: '#ef4444', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>{error}</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '30px' }}>The intelligence stream was interrupted or is unavailable.</p>
                    <button onClick={() => navigate('/database')} className="primary" style={{ width: '100%' }}>
                        RETURN TO DATABASE
                    </button>
                </div>
            </div>
        );
    }

    const openingEnriched = gameInfo?.eco ? getOpeningName(gameInfo.eco) : null;
    const openingName = openingEnriched || gameInfo?.opening || 'Unknown Opening';
    const displayFen = analysisMode && analysisFen ? analysisFen : fen;

    return (
        <div style={{
            minHeight: 'calc(100vh - 72px)',
            display: 'flex',
            padding: '40px',
            color: 'var(--text-primary)',
            background: 'var(--bg-deep)'
        }}>
            {/* Left: Eval Bar + Board */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', width: 'min(500px, 80vw)' }}>
                    <div style={{ height: 'min(500px, 80vw)' }}>
                        <EvalBar topMoves={topMoves} isConnected={isEngineConnected} currentFen={displayFen} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <InteractiveChessboard
                            fen={displayFen}
                            onMove={handleUserMove}
                            selectedSquare={selectedSquare}
                            setSelectedSquare={setSelectedSquare}
                            legalMoves={legalMoves}
                            orientation={boardOrientation}
                            arrows={arrows}
                            onArrowDraw={handleArrowDraw}
                        />
                    </div>
                </div>
                {/* Drawing Hint */}
                <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    color: '#94a3b8',
                    fontSize: '0.9rem'
                }}>
                    <span>
                        <strong style={{ color: 'var(--neon-lime)' }}>Right-Click</strong> Green
                    </span>
                    <span>
                        <strong style={{ color: '#f87171' }}>Shift+Right</strong> Red
                    </span>
                    <span>
                        <strong style={{ color: '#facc15' }}>Right-Click</strong> Circle
                    </span>
                    <button
                        onClick={() => setArrows([])}
                        title="Clear all arrows"
                        style={{
                            background: 'transparent',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            marginLeft: '10px'
                        }}
                    >
                        <Trash2 size={12} /> Clear
                    </button>
                    <button
                        onClick={() => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')}
                        title="Flip Board Perspective"
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--neon-lime)',
                            color: 'var(--neon-lime)',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            marginLeft: '4px'
                        }}
                    >
                        <RefreshCw size={12} /> Flip
                    </button>
                </div>

                {/* Analyzed Badge */}
                {gameInfo?.is_analyzed && (
                    <div style={{
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '6px 16px',
                        backgroundColor: 'rgba(250, 204, 21, 0.1)',
                        border: '1px solid var(--gold)',
                        borderRadius: '20px',
                        color: 'var(--gold)',
                        fontSize: '12px',
                        fontWeight: '600'
                    }}>
                        <span>📝 Study Mode Active</span>
                    </div>
                )}

                {/* Analysis mode indicator */}
                {/* Persistent Game Actions Toolbar */}
                <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                }}>
                    <button
                        onClick={saveAnalysis}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: saveStatus === 'success' ? '#22c55e' : 'var(--neon-lime)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '13px',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        {saveStatus === 'saving' ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />}
                        {gameInfo?.id && String(gameInfo.id).startsWith('rep-') ? 'Update' : 'Save'}
                    </button>
                    <button
                        onClick={clipPosition}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#fb7185',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '700',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            boxShadow: '0 0 15px rgba(251, 113, 133, 0.3)'
                        }}
                    >
                        <Scissors size={14} /> Clip Snap
                    </button>
                    <button
                        onClick={downloadPgn}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#334155',
                            color: '#fff',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <Upload size={14} /> PGN Download
                    </button>
                </div>

                {/* Analysis mode indicator */}
                {analysisMode && (
                    <div style={{
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '10px 20px',
                        backgroundColor: 'var(--neon-lime-muted)',
                        border: '1px solid var(--neon-lime)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: 'var(--neon-lime)'
                    }}>
                        <span>📊 Analysis Variation</span>
                        <button
                            onClick={resetToGamePosition}
                            className="btn-gold"
                            style={{
                                padding: '4px 12px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                color: '#000',
                                background: '#d1d5db'
                            }}
                        >
                            <RotateCw size={12} /> RESTORE MAIN LINE
                        </button>
                    </div>
                )}

                {/* Engine Status */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '16px',
                    padding: '6px 14px',
                    backgroundColor: isEngineConnected ? 'rgba(204, 255, 0, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid',
                    borderColor: isEngineConnected ? 'var(--neon-lime)' : '#ef4444',
                    borderRadius: '20px',
                    fontSize: '11px',
                    color: isEngineConnected ? 'var(--neon-lime)' : '#ef4444',
                    letterSpacing: '0.05em',
                    fontWeight: '700'
                }}>
                    <Cpu size={14} />
                    <span>STOCKFISH: {isEngineConnected ? 'READY' : 'OFFLINE'}</span>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                    <button onClick={() => goToMove(-1)} style={buttonStyle}><Home size={18} /></button>
                    <button onClick={() => goToMove(currentMoveIndex - 1)} style={buttonStyle}><ChevronLeft size={22} /></button>
                    <button onClick={() => goToMove(currentMoveIndex + 1)} className="primary" style={{ ...buttonStyle, width: '60px' }}><ChevronRight size={22} /></button>
                    <button onClick={() => goToMove(moves.length - 1)} style={buttonStyle}><FastForward size={18} /></button>
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.6 }}>
                    Click pieces to make moves • Use ← → to navigate game
                </div>
            </div>

            {/* Right: Info Panel */}
            <div className="glass-panel" style={{ width: '380px', display: 'flex', flexDirection: 'column', marginLeft: '40px' }}>
                {/* Game Info */}
                {gameInfo && (
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: '600', fontSize: '18px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {gameInfo.white}
                                {gameInfo.is_personal ? (
                                    <span style={{
                                        fontSize: '9px',
                                        background: 'var(--neon-lime)',
                                        color: '#000',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontWeight: '900',
                                        boxShadow: '0 0 10px rgba(163, 230, 53, 0.3)'
                                    }}>MY STUDY</span>
                                ) : gameInfo.is_commented ? (
                                    <span style={{
                                        fontSize: '9px',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'var(--text-secondary)',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontWeight: '900',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>ANNOTATED</span>
                                ) : null}
                            </div>
                            {gameInfo.white_elo && <div style={{ fontSize: '13px', color: 'var(--neon-lime)', fontWeight: '700', fontFamily: 'monospace' }}>{gameInfo.white_elo}</div>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ fontWeight: '600', fontSize: '18px', color: 'var(--text-primary)' }}>{gameInfo.black}</div>
                            {gameInfo.black_elo && <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '700', fontFamily: 'monospace' }}>{gameInfo.black_elo}</div>}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>{gameInfo.event} • {gameInfo.date}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Result: {gameInfo.result}</div>

                        {/* ECO and Opening */}
                        <div style={{ marginTop: '20px', padding: '14px', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ background: 'var(--neon-lime-muted)', border: '1px solid var(--neon-lime)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', fontSize: '12px', color: 'var(--neon-lime)' }}>
                                    {gameInfo.eco || '???'}
                                </span>
                                <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>{openingName || 'Unknown Opening'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Engine Lines */}
                <div style={{ padding: '12px' }}>
                    <EngineLinesPanel topMoves={topMoves} isConnected={isEngineConnected} currentFen={displayFen} />
                </div>

                {/* Move counter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: 'var(--bg-dark)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Position <span style={{ color: 'var(--neon-lime)' }}>{currentMoveIndex + 1}</span> / {moves.length}
                    </div>
                    <button
                        onClick={downloadPgn}
                        title="Download PGN to disk"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--neon-lime)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: '600'
                        }}
                    >
                        <Download size={14} /> EXPORT
                    </button>
                </div>

                {/* Analysis Comments */}
                <div style={{ padding: '16px', background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={14} className="text-neon" />
                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Study Notes</span>
                        </div>
                        {saveStatus !== 'idle' && (
                            <div style={{ fontSize: '10px', color: saveStatus === 'success' ? 'var(--neon-lime)' : saveStatus === 'saving' ? '#94a3b8' : '#ef4444', fontWeight: '600' }}>
                                {saveStatus === 'saving' ? 'SAVING...' : saveStatus === 'success' ? 'AUTO-SAVED' : 'SAVE ERROR'}
                            </div>
                        )}
                    </div>
                    <textarea
                        value={currentComment}
                        onChange={(e) => handleCommentChange(e.target.value)}
                        placeholder="Type your analysis or notes for this position..."
                        style={{
                            width: '100%',
                            height: '80px',
                            background: 'var(--bg-deep)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '4px',
                            padding: '10px',
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                            lineHeight: '1.5',
                            resize: 'none',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--neon-lime)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                    />
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'baseline' }}>
                        {/* Variations for the starting position */}
                        {variations[moveFens[-1]] && (
                            <div style={{
                                width: '100%',
                                padding: '8px 12px',
                                marginBottom: '12px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '4px',
                                borderLeft: '2px solid var(--neon-lime-muted)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                            }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start Alternatives</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {variations[moveFens[-1]].map((v, vIndex) => {
                                        const vEval = fenEvaluations[v.fen];
                                        const evalDisplay = vEval ? (vEval.type === 'cp' ? (vEval.value / 100).toFixed(1) : `#${vEval.value}`) : null;
                                        const vComment = comments[v.fen];

                                        return (
                                            <div key={vIndex} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <div
                                                    onClick={() => {
                                                        setAnalysisMode(true);
                                                        setAnalysisFen(v.fen);
                                                        if (fenEvaluations[v.fen]) {
                                                            setEvaluation(fenEvaluations[v.fen]);
                                                        }
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '4px 10px',
                                                        background: analysisFen === v.fen ? 'var(--neon-lime-muted)' : 'var(--bg-deep)',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        border: analysisFen === v.fen ? '1px solid var(--neon-lime)' : '1px solid transparent',
                                                        transition: 'all 0.1s'
                                                    }}
                                                >
                                                    <span style={{ fontWeight: '700', color: 'var(--neon-lime)' }}>{v.san}</span>
                                                    {evalDisplay && (
                                                        <span style={{ fontSize: '10px', color: parseFloat(evalDisplay) > 0 ? '#4ade80' : '#f87171', opacity: 0.9 }}>{evalDisplay > 0 ? `+${evalDisplay}` : evalDisplay}</span>
                                                    )}
                                                </div>
                                                {vComment && (
                                                    <span style={{
                                                        fontSize: '10px',
                                                        color: '#94a3b8',
                                                        fontStyle: 'italic',
                                                        padding: '0 4px',
                                                        maxWidth: '120px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }} title={vComment}>
                                                        {"{"}{vComment}{"}"}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {moves.map((move, i) => {
                            const isWhite = i % 2 === 0;
                            const moveNum = Math.floor(i / 2) + 1;
                            const moveFen = moveFens[i];
                            const prevFen = moveFens[i - 1];
                            const comment = comments[moveFen];

                            return (
                                <React.Fragment key={i}>
                                    {isWhite && (
                                        <span style={{ minWidth: '24px', textAlign: 'right', opacity: 0.5, fontSize: '12px', fontWeight: '700', marginRight: '2px' }}>{moveNum}.</span>
                                    )}
                                    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px' }}>
                                        <span
                                            onClick={() => goToMove(i)}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                background: i === currentMoveIndex ? 'var(--neon-lime-muted)' : 'transparent',
                                                border: i === currentMoveIndex ? '1px solid var(--neon-lime)' : '1px solid transparent',
                                                color: i === currentMoveIndex ? 'var(--neon-lime)' : 'var(--text-primary)',
                                                fontWeight: i === currentMoveIndex ? '700' : '500',
                                                fontSize: '13px',
                                                transition: 'all 0.1s ease',
                                                whiteSpace: 'nowrap',
                                                position: 'relative'
                                            }}
                                        >
                                            {move}
                                            {variations[prevFen] && variations[prevFen].some(v => v.san !== move) && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '2px',
                                                    right: '2px',
                                                    width: '4px',
                                                    height: '4px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'var(--neon-lime)',
                                                    boxShadow: '0 0 5px var(--neon-lime)'
                                                }} title="Tactical variations explored" />
                                            )}
                                        </span>
                                        {comment && (
                                            <span style={{
                                                fontSize: '11px',
                                                color: '#94a3b8',
                                                fontStyle: 'italic',
                                                maxWidth: '200px',
                                                lineHeight: '1.2',
                                                padding: '0 4px',
                                                marginTop: '-2px'
                                            }}>
                                                {"{"}{comment}{"}"}
                                            </span>
                                        )}
                                    </div>

                                    {/* Sidebar Variations (Full sequences of alternatives) */}
                                    {variations[prevFen] && variations[prevFen].some(v => v.san !== move) && (
                                        <div style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            margin: '8px 0 12px 0',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '6px',
                                            borderLeft: '3px solid rgba(163, 230, 53, 0.4)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}>
                                            {variations[prevFen].filter(v => v.san !== move).map((v, vIndex) => {
                                                const getFullLine = (startMove) => {
                                                    const line = [startMove];
                                                    let currFen = startMove.fen;
                                                    let visited = new Set([currFen]);
                                                    while (variations[currFen] && variations[currFen].length > 0) {
                                                        const nextM = variations[currFen][0];
                                                        if (visited.has(nextM.fen)) break;
                                                        line.push(nextM);
                                                        currFen = nextM.fen;
                                                        visited.add(currFen);
                                                        if (line.length > 20) break;
                                                    }
                                                    return line;
                                                };
                                                const fullLine = getFullLine(v);
                                                return (
                                                    <div key={vIndex} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800', marginRight: '4px' }}>LINE {vIndex + 1}:</span>
                                                        {fullLine.map((mv, mvIdx) => {
                                                            const isAltSelected = analysisFen === mv.fen;
                                                            const vEval = fenEvaluations[mv.fen];
                                                            const evalDisp = vEval ? (vEval.type === 'cp' ? (vEval.value / 100).toFixed(1) : `#${vEval.value}`) : null;
                                                            const vComment = comments[mv.fen];

                                                            return (
                                                                <div key={mvIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                    <div
                                                                        onClick={() => {
                                                                            setAnalysisMode(true);
                                                                            setAnalysisFen(mv.fen);
                                                                            if (fenEvaluations[mv.fen]) {
                                                                                setEvaluation(fenEvaluations[mv.fen]);
                                                                            }
                                                                        }}
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '4px',
                                                                            padding: '3px 8px',
                                                                            background: isAltSelected ? 'var(--neon-lime-muted)' : 'rgba(255,255,255,0.05)',
                                                                            borderRadius: '4px',
                                                                            cursor: 'pointer',
                                                                            fontSize: '12px',
                                                                            border: isAltSelected ? '1px solid var(--neon-lime)' : '1px solid transparent'
                                                                        }}
                                                                    >
                                                                        <span style={{ fontWeight: '700', color: isAltSelected ? 'var(--neon-lime)' : 'var(--text-primary)' }}>{mv.san}</span>
                                                                        {evalDisp && (
                                                                            <span style={{ fontSize: '9px', color: parseFloat(evalDisp) > 0 ? '#4ade80' : '#f87171' }}>
                                                                                {evalDisp > 0 ? `+${evalDisp}` : evalDisp}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {vComment && (
                                                                        <span style={{
                                                                            fontSize: '10px',
                                                                            color: '#94a3b8',
                                                                            fontStyle: 'italic',
                                                                            padding: '0 4px',
                                                                            maxWidth: '120px',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap'
                                                                        }} title={vComment}>
                                                                            {"{"}{vComment}{"}"}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* Save Modal */}
            {showSaveModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px',
                        width: '400px', border: '1px solid var(--border-active)'
                    }}>
                        <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>
                            {isSnapshotMode ? 'Snapshot Tactical Position' : 'Save to Repertoire'}
                        </h3>

                        {!isSnapshotMode && (
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Target Folder</label>
                                <select
                                    value={selectedFolderId}
                                    onChange={(e) => setSelectedFolderId(e.target.value)}
                                    style={{
                                        width: '100%', padding: '8px', borderRadius: '6px',
                                        backgroundColor: '#334155', color: 'white', border: 'none'
                                    }}
                                >
                                    <option value="">Select Folder...</option>
                                    {availableFolders.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={{ marginBottom: '16px', border: '1px solid rgba(163, 230, 53, 0.2)', padding: '12px', borderRadius: '8px', background: 'rgba(163, 230, 53, 0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <input
                                    type="checkbox"
                                    id="isSnapshotMode"
                                    checked={isSnapshotMode}
                                    onChange={(e) => setIsSnapshotMode(e.target.checked)}
                                />
                                <label htmlFor="isSnapshotMode" style={{ color: 'var(--neon-lime)', fontWeight: '700', fontSize: '12px' }}>
                                    CAPTURE POSITION SNAPSHOT
                                </label>
                            </div>

                            {isSnapshotMode ? (
                                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', color: '#94a3b8', fontSize: '11px', fontWeight: '700' }}>SNAP MESSAGE / TITLE</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Bishop Trap, Tactical Blunder..."
                                            value={snapshotTag}
                                            onChange={(e) => setSnapshotTag(e.target.value)}
                                            autoFocus
                                            style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'white' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', color: '#94a3b8', fontSize: '11px', fontWeight: '700' }}>CATEGORY TAG</label>
                                        <select
                                            value={snapshotCategory}
                                            onChange={(e) => setSnapshotCategory(e.target.value)}
                                            style={{ width: '100%', padding: '8px', background: '#334155', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'white' }}
                                        >
                                            <option value="Opening">Opening</option>
                                            <option value="Middlegame">Middlegame</option>
                                            <option value="Endgame">Endgame</option>
                                            <option value="Blunder">Blunder</option>
                                            <option value="Brilliancy">Brilliancy</option>
                                            <option value="Tactic">Tactic</option>
                                        </select>
                                    </div>

                                    <div style={{ fontSize: '11px', color: 'rgba(163, 230, 53, 0.7)', fontStyle: 'italic' }}>
                                        * Auto-tagged with Opening: {gameInfo?.eco ? `${gameInfo.eco} ${gameInfo.opening || ''}` : "Unknown"}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="checkbox"
                                        id="isFlashcard"
                                        checked={isFlashcard}
                                        onChange={(e) => setIsFlashcard(e.target.checked)}
                                    />
                                    <label htmlFor="isFlashcard" style={{ color: '#94a3b8', fontSize: '12px' }}>
                                        Mark as Regular Flashcard
                                    </label>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setShowSaveModal(false)}
                                style={{
                                    padding: '8px 16px', borderRadius: '6px',
                                    backgroundColor: 'transparent', color: '#94a3b8',
                                    border: '1px solid #475569', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => selectedFolderId && handleSaveConfirm(selectedFolderId)}
                                disabled={!selectedFolderId || saveStatus === 'saving'}
                                style={{
                                    padding: '8px 16px', borderRadius: '6px',
                                    backgroundColor: 'var(--neon-lime)', color: 'black',
                                    border: 'none', cursor: 'pointer', fontWeight: 'bold',
                                    opacity: (!selectedFolderId || saveStatus === 'saving') ? 0.5 : 1
                                }}
                            >
                                {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const buttonStyle = {
    padding: '12px',
    backgroundColor: '#334155',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

export default Analysis;
