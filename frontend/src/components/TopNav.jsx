import React from 'react';
import { LayoutDashboard, Database, BookOpen, Settings, Crown, TrendingUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const TopNav = () => {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Database', path: '/database', icon: <Database size={18} /> },
        { name: 'Insights', path: '/insights', icon: <TrendingUp size={18} /> },
        { name: 'Repertoire', path: '/repertoire', icon: <BookOpen size={18} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={18} /> },
    ];

    return (
        <header style={{
            background: 'var(--bg-panel)',
            backdropFilter: 'var(--blur-amount)',
            WebkitBackdropFilter: 'var(--blur-amount)',
            borderBottom: '1px solid var(--border-subtle)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '0 40px',
        }}>
            <div style={{
                maxWidth: '1500px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '72px',
            }}>
                {/* Logo */}
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                }}>
                    <div style={{
                        width: '38px',
                        height: '38px',
                        background: 'rgba(204, 255, 0, 0.05)',
                        border: '1px solid var(--neon-lime)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px var(--neon-lime-glow)',
                    }}>
                        <Crown size={22} color="var(--neon-lime)" />
                    </div>
                    <span style={{
                        fontSize: '22px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        fontFamily: "'Outfit', sans-serif",
                        letterSpacing: '-0.03em',
                    }}>
                        Grandmaster <span className="text-neon" style={{ fontWeight: '400' }}>Mac</span>
                    </span>
                </Link>

                {/* Navigation */}
                <nav style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 18px',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                    background: isActive
                                        ? 'var(--neon-lime-muted)'
                                        : 'transparent',
                                    color: isActive ? 'var(--neon-lime)' : 'var(--text-secondary)',
                                    boxShadow: isActive
                                        ? '0 0 15px var(--neon-lime-glow)'
                                        : 'none',
                                    border: isActive ? '1px solid var(--neon-lime)' : '1px solid transparent',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(204, 255, 0, 0.05)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                        e.currentTarget.style.borderColor = 'var(--border-active)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }
                                }}
                            >
                                <span style={{ color: isActive ? 'var(--neon-lime)' : 'inherit' }}>{item.icon}</span>
                                <span style={{ letterSpacing: '0.02em' }}>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Version badge */}
                <div style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--neon-lime)',
                    padding: '4px 12px',
                    background: 'var(--neon-lime-muted)',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    letterSpacing: '0.1em',
                }}>
                    V0.1 BETA
                </div>
            </div>
        </header>
    );
};

export default TopNav;
