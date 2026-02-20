import React, { useEffect, useState } from 'react';
import { TrendingUp, Target, Shield, Sword } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Insights = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [eloRange, setEloRange] = useState({ min: 1700, max: 2000 });

    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:8000/api/insights?min_elo=${eloRange.min}&max_elo=${eloRange.max}`)
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch insights:", err);
                setLoading(false);
            });
    }, [eloRange]);

    const StatCard = ({ title, icon, data, color }) => (
        <div className="glass-panel" style={{ padding: '24px', flex: 1, minWidth: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div style={{ color: color }}>{icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>{title}</h3>
            </div>

            {loading ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Analyzing games...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(Array.isArray(data) ? data : []).map((item, idx) => {
                        const win = item.win_rate || 0;
                        const loss = item.loss_rate || 0;
                        const draw = item.draw_rate || Math.max(0, 100 - win - loss);

                        return (
                            <div key={idx} style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                border: '1px solid var(--border-subtle)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</span>
                                    <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '12px' }}>{item.eco}</span>
                                </div>

                                {/* Progress Bars */}
                                <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px', background: '#333' }}>
                                    <div style={{ width: `${win}%`, background: 'var(--neon-lime)' }} title={`Win: ${win}%`}></div>
                                    <div style={{ width: `${draw}%`, background: '#fbbf24' }} title={`Draw: ${draw}%`}></div>
                                    <div style={{ width: `${loss}%`, background: '#ff4444' }} title={`Loss: ${loss}%`}></div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    <span>Score: <span style={{ color: item.score > 50 ? 'var(--neon-lime)' : 'var(--text-primary)' }}>{item.score}%</span></span>
                                    <span>{item.total.toLocaleString()} games</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ padding: '40px', background: 'var(--bg-deep)', height: '100%', overflowY: 'auto' }}>
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>Performance Insights</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Strategic analysis of games played between <strong>{eloRange.min} - {eloRange.max} Elo</strong>.
                </p>
                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating Profile:</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { label: '1700-2000', min: 1700, max: 2000 },
                            { label: '2000-2200', min: 2000, max: 2200 },
                            { label: '2200-2500', min: 2200, max: 2500 },
                            { label: 'Legendary (2500+)', min: 2500, max: 4000 }
                        ].map((range) => {
                            const isActive = eloRange.min === range.min;
                            return (
                                <button
                                    key={range.label}
                                    onClick={() => setEloRange({ min: range.min, max: range.max })}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: isActive ? '1px solid var(--neon-lime)' : '1px solid rgba(255,255,255,0.1)',
                                        background: isActive ? 'rgba(163, 230, 53, 0.15)' : 'rgba(255,255,255,0.03)',
                                        color: isActive ? 'var(--neon-lime)' : 'var(--text-secondary)',
                                        boxShadow: isActive ? '0 0 15px rgba(163, 230, 53, 0.1)' : 'none'
                                    }}
                                    className="hover:bg-white/10 hover:border-white/20"
                                >
                                    {range.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Popularity Trend Chart */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', minHeight: '350px' }}>
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="text-neon" size={20} />
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Opening Popularity Trends (Rating: {eloRange.min}-{eloRange.max})</h3>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64 text-gray-500">Loading trends...</div>
                ) : stats && stats.popularity_trend && stats.popularity_trend.length > 0 ? (
                    <div style={{ height: '300px', width: '100%', fontSize: '12px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={
                                (() => {
                                    const raw = stats.popularity_trend;
                                    const issues = [...new Set(raw.map(r => r.issue))].sort((a, b) => a - b);
                                    // Identify top 5 ECOs overall for this rating range
                                    const ecoCounts = {};
                                    raw.forEach(r => ecoCounts[r.eco] = (ecoCounts[r.eco] || 0) + r.count);
                                    const topEcos = Object.keys(ecoCounts).sort((a, b) => ecoCounts[b] - ecoCounts[a]).slice(0, 5);

                                    return issues.map(issue => {
                                        const point = { name: `Issue ${issue}` };
                                        topEcos.forEach(eco => {
                                            const match = raw.find(r => r.issue === issue && r.eco === eco);
                                            point[eco] = match ? match.count : 0;
                                        });
                                        return point;
                                    });
                                })()
                            }>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                    itemStyle={{ color: '#ccc' }}
                                />
                                <Legend />
                                {(() => {
                                    const raw = stats.popularity_trend;
                                    const ecoCounts = {};
                                    raw.forEach(r => ecoCounts[r.eco] = (ecoCounts[r.eco] || 0) + r.count);
                                    const topEcos = Object.keys(ecoCounts).sort((a, b) => ecoCounts[b] - ecoCounts[a]).slice(0, 5);
                                    const colors = ['#a855f7', '#bef264', '#60a5fa', '#f472b6', '#fbbf24'];

                                    return topEcos.map((eco, idx) => (
                                        <Line
                                            key={eco}
                                            type="monotone"
                                            dataKey={eco}
                                            stroke={colors[idx % colors.length]}
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    ));
                                })()}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        No trend data available for this rating range yet.
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', width: '100%' }}>
                {stats && <StatCard
                    title="Best White Openings (All)"
                    icon={<TrendingUp size={24} />}
                    data={stats.white_all}
                    color="#a855f7" // Purple
                />}

                {stats && <StatCard
                    title="As White: Best 1. e4 Lines"
                    icon={<Sword size={24} />}
                    data={stats.white_e4}
                    color="var(--neon-lime)"
                />}

                {stats && <StatCard
                    title="As Black: vs 1. e4"
                    icon={<Shield size={24} />}
                    data={stats.black_vs_e4}
                    color="#60a5fa" // Blue
                />}

                {stats && <StatCard
                    title="As Black: vs 1. d4"
                    icon={<Target size={24} />}
                    data={stats.black_vs_d4}
                    color="#f472b6" // Pink
                />}
            </div>
        </div>
    );
};

export default Insights;
