import React, { useState } from 'react';
import { Settings, Cpu, Share2, Target, Save, Info } from 'lucide-react';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('engine');
    const [settings, setSettings] = useState({
        engineDepth: 18,
        engineLines: 3,
        cpuThreads: 4,
        lichessUser: '',
        chessDotComUser: '',
        syncInterval: 'Daily',
        masteryThreshold: 5,
        practiceReminders: true
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('Settings saved successfully!');
        }, 800);
    };

    const tabs = [
        { id: 'engine', name: 'Analysis Engine', icon: <Cpu size={18} /> },
        { id: 'sync', name: 'External Sync', icon: <Share2 size={18} /> },
        { id: 'training', name: 'Training Logic', icon: <Target size={18} /> }
    ];

    return (
        <div className="animate-fade-in" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'var(--neon-lime-muted)', border: '1px solid var(--neon-lime)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Settings className="text-neon" size={24} />
                </div>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>System Settings</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Configure your Grandmaster Mac environment</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '32px' }}>
                {/* Sidebar Tabs */}
                <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 20px', borderRadius: '12px',
                                background: activeTab === tab.id ? 'var(--neon-lime-muted)' : 'transparent',
                                border: activeTab === tab.id ? '1px solid var(--neon-lime)' : '1px solid transparent',
                                color: activeTab === tab.id ? 'var(--neon-lime)' : 'var(--text-secondary)',
                                cursor: 'pointer', transition: 'all 0.2s',
                                fontWeight: '600', textAlign: 'left'
                            }}
                        >
                            {tab.icon} {tab.name}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="glass-panel" style={{ flex: 1, padding: '32px' }}>
                    {activeTab === 'engine' && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Cpu size={20} className="text-neon" /> Stockfish Engine Configuration
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Analysis Depth</label>
                                    <input
                                        type="range" min="10" max="30"
                                        value={settings.engineDepth}
                                        onChange={(e) => setSettings({ ...settings, engineDepth: e.target.value })}
                                        style={{ width: '100%', accentColor: 'var(--neon-lime)' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                        <span>Faster (10)</span>
                                        <span className="text-neon">Current: {settings.engineDepth}</span>
                                        <span>Deep (30)</span>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Multi-PV (Engine Lines)</label>
                                    <select
                                        value={settings.engineLines}
                                        onChange={(e) => setSettings({ ...settings, engineLines: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#fff' }}
                                    >
                                        <option value="1">1 Top Line</option>
                                        <option value="3">3 Top Lines</option>
                                        <option value="5">5 Top Lines</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sync' && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Share2 size={20} className="text-neon" /> External Platform Sync
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Lichess.org Username</label>
                                    <input
                                        type="text" placeholder="Enter username"
                                        value={settings.lichessUser}
                                        onChange={(e) => setSettings({ ...settings, lichessUser: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#fff' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Chess.com Username</label>
                                    <input
                                        type="text" placeholder="Enter username"
                                        value={settings.chessDotComUser}
                                        onChange={(e) => setSettings({ ...settings, chessDotComUser: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#fff' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'training' && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Target size={20} className="text-neon" /> Mastery & Retention
                            </h3>
                            <div style={{ borderRadius: '12px', background: 'rgba(163, 230, 53, 0.05)', border: '1px solid var(--neon-lime-muted)', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
                                <Info size={20} className="text-neon" />
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}> These algorithms determine when a repertoire line is considered "safe" vs "needs review".</p>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Mastery Threshold (Correct Reps)</label>
                                <input
                                    type="number"
                                    value={settings.masteryThreshold}
                                    onChange={(e) => setSettings({ ...settings, masteryThreshold: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#fff' }}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px', justifyContent: 'center' }}
                        >
                            <Save size={18} /> {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
