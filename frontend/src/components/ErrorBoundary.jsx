import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: '60vh', padding: '40px', textAlign: 'center',
                    background: '#1a1a2e', color: '#e0e0e0', borderRadius: '16px', margin: '20px',
                }}>
                    <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: '16px' }} />
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
                        Something went wrong
                    </h2>
                    <p style={{ fontSize: '14px', color: '#8b949e', marginBottom: '24px', maxWidth: '500px' }}>
                        {this.state.error?.message || 'An unexpected error occurred in this component.'}
                    </p>
                    {this.state.errorInfo && (
                        <details style={{
                            marginBottom: '24px', textAlign: 'left', maxWidth: '600px', width: '100%',
                            background: '#0d1117', borderRadius: '8px', padding: '12px', fontSize: '11px',
                            fontFamily: 'monospace', color: '#8b949e', maxHeight: '200px', overflow: 'auto',
                        }}>
                            <summary style={{ cursor: 'pointer', color: '#58a6ff', marginBottom: '8px' }}>
                                Stack Trace
                            </summary>
                            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                    <button
                        onClick={this.handleReset}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 24px', borderRadius: '8px', border: '1px solid rgba(204,255,0,0.3)',
                            background: 'rgba(204,255,0,0.1)', color: '#ccff00', cursor: 'pointer',
                            fontSize: '14px', fontWeight: 600, transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(204,255,0,0.2)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(204,255,0,0.1)'}
                    >
                        <RefreshCw size={16} /> Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
