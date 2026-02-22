import React from 'react';
import { TrendingUp, Shield, Sword, Download, Star } from 'lucide-react';

const Insights = () => {
    return (
        <div style={{
            padding: '80px 40px',
            background: 'var(--bg-deep)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
        }}>
            <div className="glass-panel" style={{ maxWidth: '800px', padding: '60px', borderRadius: '24px' }}>
                <div style={{
                    display: 'inline-flex',
                    padding: '8px 16px',
                    background: 'rgba(163, 230, 53, 0.1)',
                    borderRadius: '20px',
                    color: 'var(--neon-lime)',
                    fontSize: '13px',
                    fontWeight: '700',
                    marginBottom: '24px',
                    textTransform: 'uppercase'
                }}>
                    macbase Pro Feature
                </div>
                <h2 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '24px' }}>
                    Performance <span className="text-neon">Insights</span>
                </h2>
                <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '48px' }}>
                    Unlock real-time win rates and popularity trends across 30+ years of FIDE tournament history.
                    Know exactly what moves work best at your specific Elo bracket before you sit down at the board.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '60px', textAlign: 'left' }}>
                    <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <TrendingUp style={{ color: 'var(--neon-lime)', marginBottom: '16px' }} />
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>ELO win rates</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Stats filtered by 1800, 2000, 2200, or 2500+ FIDE rating.</p>
                    </div>
                    <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <Sword style={{ color: '#a855f7', marginBottom: '16px' }} />
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Optimal Prep</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Identify the highest scoring variations in your repertoire.</p>
                    </div>
                    <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <Shield style={{ color: '#60a5fa', marginBottom: '16px' }} />
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Live Trends</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Track which openings are rising in popularity this month.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                    <a
                        href="https://joe-ging.github.io/macbase-app/"
                        target="_blank"
                        className="btn-primary"
                        style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
                    >
                        <Download size={20} />
                        Download Pro DMG
                    </a>
                    <a
                        href="https://github.com/joe-ging/macbase"
                        target="_blank"
                        className="btn-secondary"
                        style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
                    >
                        <Star size={20} />
                        Star Open Core
                    </a>
                </div>
                <p style={{ marginTop: '32px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    Open Core users get the board, engine, and database browser for free.
                    Insights are exclusive to the professional compiled version.
                </p>
            </div>
        </div>
    );
};

export default Insights;
