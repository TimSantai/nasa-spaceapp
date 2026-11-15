import { Component, type ReactNode, type ErrorInfo } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
  currentLang?: 'id' | 'en';
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MapErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const isId = this.props.currentLang !== 'en';
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[#F4F7FA] p-6 text-center text-[#14232B]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold">
            {this.props.fallbackTitle ||
              (isId
                ? 'Tampilan Peta Mengalami Kendala WebGL'
                : 'WebGL Map Display Interrupted')}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-[#5F6B74]">
            {isId
              ? 'Koneksi konteks grafis atau ubin satelit terinterupsi. Silakan muat ulang tampilan peta.'
              : 'Graphics context or satellite tile streaming was interrupted. Please reload the map canvas.'}
          </p>
          <button
            onClick={this.handleReload}
            className="mt-4 flex items-center gap-2 rounded-full bg-[#237F8E] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1B6572] cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{isId ? 'Muat Ulang Peta' : 'Reload Map Canvas'}</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
