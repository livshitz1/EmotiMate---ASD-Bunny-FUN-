import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
            <h1 className="text-3xl font-bold text-red-600 mb-4 text-center">
              ⚠️ שגיאה באפליקציה
            </h1>
            <p className="text-gray-700 mb-4 text-center">
              אירעה שגיאה באפליקציה. אנא רענן את הדף או נסה שוב מאוחר יותר.
            </p>
            {this.state.error && (
              <details className="mt-4 p-4 bg-gray-100 rounded-lg">
                <summary className="cursor-pointer font-semibold text-gray-700">
                  פרטי השגיאה (לחצו כאן)
                </summary>
                <pre className="mt-2 text-[10px] text-gray-600 overflow-auto max-h-40 whitespace-pre-wrap">
                  {this.state.error.name}: {this.state.error.message}
                  {"\n\nStack:\n"}{this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                רענן דף
              </button>
              <button
                onClick={() => { 
                  try {
                    localStorage.clear(); 
                    sessionStorage.clear(); 
                  } catch (e) {}
                  window.location.href = window.location.origin; 
                }}
                className="w-full bg-red-100 hover:bg-red-200 text-red-600 font-medium py-2 px-6 rounded-lg transition-colors text-sm"
              >
                נקה הגדרות (Reset)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
