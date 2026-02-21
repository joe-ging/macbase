import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle, AlertCircle, Database, Calendar, FileText, ExternalLink, Trash2, Filter, Eye, Loader2 } from 'lucide-react';

const Dashboard = () => {
    const [issueNumber, setIssueNumber] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [stats, setStats] = useState({ total_games: 0 });
    const [twicIssues, setTwicIssues] = useState([]);
    const [loadingIssues, setLoadingIssues] = useState(true);
    const [loadingIssue, setLoadingIssue] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);

    const fetchStats = () => {
        fetch('http://localhost:8000/api/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    };

    // Initial fetch
    useEffect(() => {
        fetchIssues();
        fetchStats();
    }, []);

    const fetchTwic = async (issueToFetch = issueNumber) => {
        if (!issueToFetch) return;

        setStatus('loading');
        setMessage(`Starting import for TWIC ${issueToFetch}...`);

        try {
            // 1. Update local UI state IMMEDIATELY for the specific issue
            setTwicIssues(prev => prev.map(issue =>
                issue.issue === parseInt(issueToFetch)
                    ? { ...issue, processing: true, progress: 'Starting...' }
                    : issue
            ));

            // 2. Start background import
            const response = await fetch(`http://localhost:8000/api/fetch-twic/${issueToFetch}`, {
                method: 'POST',
            });

            const data = await response.json();

            if (!response.ok) {
                setStatus('error');
                setMessage(data.detail || 'Failed to start import');
                // Revert processing state on error
                setTwicIssues(prev => prev.map(issue =>
                    issue.issue === parseInt(issueToFetch)
                        ? { ...issue, processing: false }
                        : issue
                ));
                return;
            }

            // 3. Poll for status
            setMessage(data.message); // "Background import started..."

            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await fetch(`http://localhost:8000/api/import-status/${issueToFetch}`);
                    const statusData = await statusRes.json();

                    // Update the specific issue in the list with progress from backend
                    setTwicIssues(prev => prev.map(issue =>
                        issue.issue === parseInt(issueToFetch)
                            ? { ...issue, processing: statusData.status === 'processing', progress: statusData.progress || 'Processing...' }
                            : issue
                    ));

                    if (statusData.status === 'success') {
                        clearInterval(pollInterval);
                        setStatus('success');
                        setMessage(statusData.message);
                        fetchIssues(); // Refresh list to get final imported: true status
                        fetchStats();  // Refresh stats
                    } else if (statusData.status === 'error') {
                        clearInterval(pollInterval);
                        setStatus('error');
                        setMessage(statusData.message || 'Import failed');
                    }
                } catch (err) {
                    console.error("Polling error:", err);
                }
            }, 1000);

        } catch (error) {
            setStatus('error');
            setMessage(error.message);
        }
    };

    const deleteIssue = async (issueNumber) => {
        console.log("deleting issue:", issueNumber);

        setConfirmingDelete(null); // Clear the confirmation UI state
        setStatus('loading');
        setMessage(`Deleting TWIC ${issueNumber}...`);

        try {
            const response = await fetch(`http://localhost:8000/api/issues/${issueNumber}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setStatus('success');
                setMessage(`Deleted TWIC ${issueNumber} games`);
                fetchIssues();
                fetchStats();
            } else {
                const data = await response.json();
                setStatus('error');
                setMessage(data.detail || 'Failed to delete');
            }
        } catch (error) {
            setStatus('error');
            setMessage(error.message);
        }
    };

    const fetchIssues = () => {
        setLoadingIssues(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        fetch(`http://localhost:8000/api/twic-issues?limit=15`, { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                setTwicIssues(data);
                if (data.length > 0 && !issueNumber) {
                    setIssueNumber(data[0].issue.toString());
                }
            })
            .catch(err => {
                if (err.name === 'AbortError') {
                    console.warn('TWIC fetch timed out after 10s');
                } else {
                    console.error('Failed to fetch TWIC issues:', err);
                }
                setTwicIssues([]); // Show empty state instead of spinning forever
            })
            .finally(() => {
                clearTimeout(timeoutId);
                setLoadingIssues(false);
                fetchStats();
            });
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === 'Unknown') return 'Unknown';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    return (
        <div style={{ padding: '40px', background: 'var(--bg-deep)', color: 'var(--text-primary)', height: '100%', overflowY: 'auto' }}>
            <header style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '8px' }}>Command Center</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Analyze and manage your chess intelligence.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* TWIC Issues Table - Takes 2 columns */}
                <div className="lg:col-span-2 glass-panel" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}>
                        <Calendar className="mr-3 text-neon" size={22} />
                        The Week in Chess
                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400', letterSpacing: '0.05em' }}>
                            SOURCE: THEWEEKINCHESS.COM
                        </span>
                    </h3>

                    {loadingIssues ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="animate-spin text-gray-400" size={24} />
                            <span className="ml-3 text-gray-400">Fetching latest issues...</span>
                        </div>
                    ) : twicIssues.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="mx-auto mb-2" size={32} />
                            <p>Could not fetch TWIC issues. Check your connection.</p>
                        </div>
                    ) : (
                        <div style={{ borderRadius: '12px', border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
                            <table className="w-full text-sm">
                                <thead style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                                    <tr>
                                        <th style={{ borderBottom: '1px solid var(--border-subtle)' }}>Issue</th>
                                        <th style={{ borderBottom: '1px solid var(--border-subtle)' }}>Date</th>
                                        <th style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'right' }}>Games</th>
                                        <th style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'center', minWidth: '340px', whiteSpace: 'nowrap' }}>Action</th>
                                        <th style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'center' }}>Major Events</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {twicIssues.map((issue, idx) => (
                                        <tr
                                            key={issue.issue}
                                            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.03)', transition: 'background 0.2s' }}
                                        >
                                            <td className="px-4 py-4">
                                                <span style={{ fontWeight: '700', fontFamily: 'monospace', color: idx === 0 ? 'var(--neon-lime)' : 'var(--text-primary)' }}>
                                                    {issue.issue}
                                                </span>
                                                {idx === 0 && (
                                                    <span style={{ marginLeft: '10px', fontSize: '10px', background: 'var(--neon-lime-muted)', color: 'var(--neon-lime)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--neon-lime)', fontWeight: '700' }}>
                                                        LATEST
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                                {formatDate(issue.date)}
                                            </td>


                                            <td className="px-4 py-4" style={{ textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                                {issue.games ? issue.games.toLocaleString() : '—'}
                                            </td>
                                            <td className="px-4 py-4 text-center" style={{ minWidth: '340px', whiteSpace: 'nowrap' }}>
                                                {issue.processing ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Loader2 className="animate-spin text-neon" size={16} />
                                                        <span className="text-neon" style={{ fontWeight: '600', fontSize: '12px' }}>
                                                            {issue.progress || 'IMPORTING...'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="items-center justify-center gap-3" style={{ display: 'inline-flex', flexDirection: 'row' }}>
                                                        {!issue.imported ? (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); fetchTwic(issue.issue); }}
                                                                className="btn-primary"
                                                                style={{
                                                                    fontSize: '11px',
                                                                    padding: '6px 16px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    background: 'var(--neon-lime)',
                                                                    color: '#000',
                                                                    border: 'none',
                                                                    whiteSpace: 'nowrap',
                                                                    fontWeight: '700',
                                                                    borderRadius: '4px'
                                                                }}
                                                            >
                                                                <Download size={14} />
                                                                IMPORT
                                                            </button>
                                                        ) : (
                                                            confirmingDelete === issue.issue ? (
                                                                <div className="flex items-center gap-2 bg-red-900/20 p-1 px-2 rounded border border-red-500/30">
                                                                    <span className="text-red-400 font-bold text-[10px] uppercase">Are you sure?</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteIssue(issue.issue); }}
                                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-[10px] font-bold"
                                                                    >
                                                                        YES, DELETE
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmingDelete(null); }}
                                                                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-[10px] font-bold"
                                                                    >
                                                                        CANCEL
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <span className="badge badge-neon">Imported</span>
                                                                    {issue.excluded && (
                                                                        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444' }}>Excluded</span>
                                                                    )}

                                                                    {/* Exclude/Unexclude Button */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={async (e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            try {
                                                                                const method = issue.excluded ? 'DELETE' : 'POST';
                                                                                await fetch(`http://localhost:8000/api/issues/${issue.issue}/exclude`, { method });
                                                                                fetchIssues();
                                                                                fetchStats();
                                                                            } catch (err) {
                                                                                console.error("Error toggling exclusion:", err);
                                                                            }
                                                                        }}
                                                                        className="btn-primary"
                                                                        style={{
                                                                            fontSize: '11px',
                                                                            padding: '6px 12px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '6px',
                                                                            background: issue.excluded ? '#22c55e' : 'var(--neon-lime)',
                                                                            color: '#000',
                                                                            border: 'none',
                                                                            whiteSpace: 'nowrap',
                                                                            fontWeight: '700',
                                                                            borderRadius: '4px'
                                                                        }}
                                                                        title={issue.excluded ? "Restore this issue" : "Hide this issue"}
                                                                    >
                                                                        <Filter size={12} />
                                                                        {issue.excluded ? 'Unexclude' : 'Exclude'}
                                                                    </button>

                                                                    {/* Delete Button */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            setConfirmingDelete(issue.issue);
                                                                        }}
                                                                        className="btn-primary"
                                                                        style={{
                                                                            fontSize: '11px',
                                                                            padding: '6px 12px',
                                                                            background: '#ef4444',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '6px',
                                                                            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                                                                            whiteSpace: 'nowrap',
                                                                            fontWeight: '700',
                                                                            borderRadius: '4px'
                                                                        }}
                                                                    >
                                                                        <Trash2 size={12} />
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4" style={{ color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'normal', minWidth: '200px', textAlign: 'left' }}>
                                                {issue.events && issue.events.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1 justify-start" title={issue.events.join(', ')}>
                                                        {issue.events.slice(0, 3).map((event, i) => (
                                                            <span key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '4px' }}>
                                                                {event}
                                                            </span>
                                                        ))}
                                                        {issue.events.length > 3 && (
                                                            <span style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '4px', fontWeight: 'bold' }}>
                                                                +{issue.events.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ opacity: 0.5 }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right column - Stats and Manual Input */}
                <div className="space-y-8">
                    {/* Stats Card */}
                    <div className="glass-panel" style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.05 }}>
                            <Database size={80} color="var(--neon-lime)" />
                        </div>
                        <h3 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', tracking: '0.1em', marginBottom: '10px' }}>Database Health</h3>
                        <div style={{ fontSize: '48px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>{stats.total_games.toLocaleString()}</div>
                        <div style={{ fontSize: '12px', color: 'var(--neon-lime)', display: 'flex', alignItems: 'center', fontWeight: '600' }}>
                            <CheckCircle size={14} className="mr-2" /> ACTIVE GAMES
                        </div>
                        {stats.breakdown && (
                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border-subtle)', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                <span style={{ fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontSize: '10px' }}>ACTIVE BREAKDOWN:</span>
                                {stats.breakdown}
                            </div>
                        )}
                    </div>

                    {/* Manual Issue Input */}
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
                            <FileText className="mr-3 text-neon" size={20} />
                            Import Mannually
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>
                                    ISSUE NUMBER
                                </label>
                                <div className="flex space-x-3">
                                    <input
                                        type="number"
                                        value={issueNumber}
                                        onChange={(e) => setIssueNumber(e.target.value)}
                                        style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px 16px', color: 'var(--text-primary)', flex: 1, fontFamily: 'monospace' }}
                                        placeholder="E.G. 1580"
                                    />
                                    <button
                                        onClick={() => fetchTwic()}
                                        disabled={status === 'loading' || !issueNumber}
                                        className="primary"
                                        style={{ padding: '0 20px' }}
                                    >
                                        {status === 'loading' ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                                    </button>
                                </div>
                            </div>

                            {status !== 'idle' && (
                                <div className={`p-3 rounded-lg text-sm flex items-start border ${status === 'success' ? 'bg-green-900/20 border-green-900 text-green-400' :
                                    status === 'error' ? 'bg-red-900/20 border-red-900 text-red-400' :
                                        'bg-blue-900/20 border-blue-900 text-blue-400'
                                    }`}>
                                    {status === 'success' ? <CheckCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" /> :
                                        status === 'error' ? <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" /> : null}
                                    <span className="font-medium text-xs">{message}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
