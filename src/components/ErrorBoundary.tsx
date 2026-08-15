import React from 'react';

/**
 * Catches any render crash and shows something readable instead of a white
 * screen. This page has gone blank on people twice now (a Rules-of-Hooks
 * violation once, a stuck loader another time) and a white screen tells you
 * nothing and offers no way out — you end up closing the whole site and
 * signing in again. Now you get a reason and a button.
 */
interface State {
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep the details in the console for debugging without showing a stack
    // trace to whoever hit the error.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="max-w-md w-full text-center border rounded-3xl p-8 bg-card shadow-xl">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="text-xl font-extrabold mb-2">Something went wrong on this page</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Nothing was lost — this is a display problem, not your data. Reloading usually
            clears it.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-gold px-5 py-2.5 rounded-xl font-bold text-sm"
            >
              Reload the page
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="px-5 py-2.5 rounded-xl font-bold text-sm border"
            >
              Go home
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-5 break-words">
            {this.state.error.message}
          </p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
