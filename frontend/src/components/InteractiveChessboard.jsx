import React, { useState, useRef } from 'react';
import { Chess } from 'chess.js';
import { PIECE_IMAGES } from '../data/chessUtils';

// Interactive Chessboard Component with drag-and-drop support AND Arrow Drawing
const InteractiveChessboard = ({ fen, onMove, selectedSquare, setSelectedSquare, legalMoves, orientation = 'white', arrows = [], onArrowDraw }) => {
    const game = new Chess(fen);
    const board = game.board();

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    // Drawing state
    const [drawingArrow, setDrawingArrow] = useState(null);
    const boardRef = useRef(null);

    const getSquareFromCoords = (x, y, rect) => {
        let fileIdx = Math.floor((x - rect.left) / (rect.width / 8));
        let rankIdx = Math.floor((y - rect.top) / (rect.height / 8));

        if (orientation === 'black') {
            fileIdx = 7 - fileIdx;
            rankIdx = 7 - rankIdx;
        }

        if (fileIdx < 0 || fileIdx > 7 || rankIdx < 0 || rankIdx > 7) return null;
        return files[fileIdx] + (8 - rankIdx);
    };

    const handleMouseDown = (e) => {
        if (e.button === 2) {
            e.preventDefault();
            const rect = boardRef.current.getBoundingClientRect();
            const square = getSquareFromCoords(e.clientX, e.clientY, rect);
            if (square) {
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setDrawingArrow({
                    start: square,
                    current: { x, y },
                    color: e.shiftKey ? 'R' : 'G'
                });
            }
        }
    };

    const handleMouseMove = (e) => {
        if (drawingArrow) {
            const rect = boardRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            const color = e.shiftKey ? 'R' : 'G';
            setDrawingArrow(prev => ({ ...prev, current: { x, y }, color }));
        }
    };

    const handleMouseUp = (e) => {
        if (drawingArrow) {
            const rect = boardRef.current.getBoundingClientRect();
            const square = getSquareFromCoords(e.clientX, e.clientY, rect);

            if (square && onArrowDraw) {
                const isCircle = drawingArrow.start === square;
                const color = isCircle ? 'Y' : (e.shiftKey ? 'R' : 'G');
                const exists = arrows.some(a => a.from === drawingArrow.start && a.to === square);

                if (exists) {
                    onArrowDraw({ from: drawingArrow.start, to: square, color: 'remove' });
                } else {
                    onArrowDraw({ from: drawingArrow.start, to: square, color });
                }
            }
            setDrawingArrow(null);
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
    };

    const squares = [];
    const loopRange = orientation === 'black' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    for (let rIdx = 0; rIdx < 8; rIdx++) {
        const rankIdx = loopRange[rIdx];
        for (let fIdx = 0; fIdx < 8; fIdx++) {
            const fileIdx = loopRange[fIdx];
            const piece = board[rankIdx][fileIdx];
            const isLight = (rankIdx + fileIdx) % 2 === 0;
            const pieceKey = piece ? `${piece.color}${piece.type.toUpperCase()}` : null;
            const square = files[fileIdx] + (8 - rankIdx);
            const isSelected = selectedSquare === square;
            const isLegalTarget = legalMoves.includes(square);
            squares.push({ rankIdx, fileIdx, isLight, pieceKey, square, isSelected, isLegalTarget });
        }
    }

    const handleSquareClick = (square, pieceKey) => {
        if (selectedSquare) {
            if (legalMoves.includes(square)) {
                onMove(selectedSquare, square);
            }
            setSelectedSquare(null);
        } else if (pieceKey) {
            setSelectedSquare(square);
        }
    };

    const handleDragStart = (e, square) => {
        e.dataTransfer.setData('square', square);
        setSelectedSquare(square);
    };

    const handleDrop = (e, targetSquare) => {
        e.preventDefault();
        const fromSquare = e.dataTransfer.getData('square');
        if (fromSquare && fromSquare !== targetSquare) {
            const tempChess = new Chess(fen);
            const move = { from: fromSquare, to: targetSquare, promotion: 'q' };
            try {
                if (tempChess.move(move)) {
                    onMove(fromSquare, targetSquare);
                }
            } catch (err) { }
        }
        setSelectedSquare(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Helper to get center % of square
    const getSquareCenter = (sq) => {
        let file = files.indexOf(sq[0]);
        let rank = 8 - parseInt(sq[1]);

        if (orientation === 'black') {
            file = 7 - file;
            rank = 7 - rank;
        }

        return { x: (file * 12.5) + 6.25, y: (rank * 12.5) + 6.25 };
    };

    return (
        <div
            ref={boardRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onContextMenu={handleContextMenu}
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gridTemplateRows: 'repeat(8, 1fr)',
                width: '100%',
                aspectRatio: '1',
                border: '1px solid var(--border-active)',
                boxShadow: '0 0 30px rgba(0,0,0,0.5)',
                borderRadius: '8px',
                overflow: 'hidden',
                touchAction: 'none',
                position: 'relative',
                userSelect: 'none'
            }}
        >
            {squares.map(({ rankIdx, fileIdx, isLight, pieceKey, square, isSelected, isLegalTarget }) => (
                <div
                    key={`${rankIdx}-${fileIdx}`}
                    onClick={() => handleSquareClick(square, pieceKey)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, square)}
                    style={{
                        backgroundColor: isSelected
                            ? 'var(--neon-lime)'
                            : isLegalTarget
                                ? (isLight ? '#4d5b4d' : '#3d4b3d')
                                : (isLight ? '#dee3e6' : '#8ca2ad'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: pieceKey ? 'grab' : 'pointer'
                    }}
                >
                    {isLegalTarget && !pieceKey && (
                        <div style={{
                            width: '30%',
                            height: '30%',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0,0,0,0.2)'
                        }} />
                    )}
                    {pieceKey && (
                        <img
                            src={PIECE_IMAGES[pieceKey]}
                            alt={pieceKey}
                            draggable
                            onDragStart={(e) => handleDragStart(e, square)}
                            style={{
                                width: '85%',
                                height: '85%',
                                objectFit: 'contain',
                                cursor: 'grab',
                                userSelect: 'none'
                            }}
                        />
                    )}
                </div>
            ))}

            {/* SVG Overlay for Arrows */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                <defs>
                    <marker id="arrowhead-g" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                        <polygon points="0 0, 4 2, 0 4" fill="rgba(163, 230, 53, 0.8)" />
                    </marker>
                    <marker id="arrowhead-r" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                        <polygon points="0 0, 4 2, 0 4" fill="rgba(248, 113, 113, 0.8)" />
                    </marker>
                    <marker id="arrowhead-g-ghost" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                        <polygon points="0 0, 4 2, 0 4" fill="rgba(163, 230, 53, 0.6)" />
                    </marker>
                    <marker id="arrowhead-r-ghost" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                        <polygon points="0 0, 4 2, 0 4" fill="rgba(248, 113, 113, 0.6)" />
                    </marker>
                </defs>

                {/* Saved Arrows */}
                {arrows.map((arrow, i) => {
                    const start = getSquareCenter(arrow.from);
                    const end = getSquareCenter(arrow.to);

                    if (arrow.color === 'Y') {
                        return (
                            <circle
                                key={i}
                                cx={`${start.x}%`} cy={`${start.y}%`}
                                r="6%"
                                stroke="rgba(250, 204, 21, 0.9)"
                                strokeWidth="5"
                                fill="rgba(250, 204, 21, 0.4)"
                                style={{ pointerEvents: 'none' }}
                            />
                        );
                    }

                    const color = arrow.color === 'R' ? 'rgba(248, 113, 113, 0.8)' : 'rgba(163, 230, 53, 0.8)';
                    const markerId = arrow.color === 'R' ? 'url(#arrowhead-r)' : 'url(#arrowhead-g)';

                    if (arrow.from === arrow.to) return null;

                    return (
                        <line
                            key={i}
                            x1={`${start.x}%`} y1={`${start.y}%`}
                            x2={`${end.x}%`} y2={`${end.y}%`}
                            stroke={color}
                            strokeWidth="10"
                            strokeLinecap="round"
                            markerEnd={markerId}
                            opacity="1"
                        />
                    );
                })}

                {/* Ghost Arrow/Circle (Drawing) */}
                {drawingArrow && drawingArrow.current && (
                    <>
                        {Math.abs(drawingArrow.current.x - getSquareCenter(drawingArrow.start).x) < 5 &&
                            Math.abs(drawingArrow.current.y - getSquareCenter(drawingArrow.start).y) < 5 ? (
                            <circle
                                cx={`${getSquareCenter(drawingArrow.start).x}%`} cy={`${getSquareCenter(drawingArrow.start).y}%`}
                                r="6%"
                                stroke="rgba(250, 204, 21, 0.6)"
                                strokeWidth="5"
                                fill="rgba(250, 204, 21, 0.3)"
                            />
                        ) : (
                            <line
                                x1={`${getSquareCenter(drawingArrow.start).x}%`}
                                y1={`${getSquareCenter(drawingArrow.start).y}%`}
                                x2={`${drawingArrow.current.x}%`}
                                y2={`${drawingArrow.current.y}%`}
                                stroke={drawingArrow.color === 'R' ? "rgba(248, 113, 113, 0.6)" : "rgba(163, 230, 53, 0.6)"}
                                strokeWidth="10"
                                strokeLinecap="round"
                                markerEnd={drawingArrow.color === 'R' ? "url(#arrowhead-r-ghost)" : "url(#arrowhead-g-ghost)"}
                            />
                        )}
                    </>
                )}
            </svg>
        </div>
    );
};

export default InteractiveChessboard;
