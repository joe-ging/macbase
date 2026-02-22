import React from 'react';
import { Chess } from 'chess.js';
import { PIECE_IMAGES } from '../data/chessUtils';

const InteractiveChessboard = ({ fen, onMove, selectedSquare, setSelectedSquare, legalMoves, orientation = 'white' }) => {
    const game = new Chess(fen);
    const board = game.board();
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

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

    return (
        <div
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
        </div>
    );
};

export default InteractiveChessboard;
