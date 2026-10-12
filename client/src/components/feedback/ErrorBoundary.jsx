import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught render failure:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[360px] p-6 text-center">
          <div className="p-6 bg-red-950/30 border border-red-800/40 rounded-xl max-w-md w-full shadow-lg">
            <div className="flex justify-center mb-3 text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Something went wrong</h3>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred in this view.'}
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}