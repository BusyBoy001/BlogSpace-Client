import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Check if this is an external script error that we should ignore
        const errorMessage = error.message || '';
        const errorStack = error.stack || '';
        const componentStack = errorInfo.componentStack || '';

        // Ignore errors from external scripts
        if (errorMessage.includes('widgetId') ||
            errorStack.includes('interceptor.js') ||
            errorStack.includes('js.js') ||
            errorStack.includes('content.js')) {
            console.warn('🚨 ErrorBoundary: Ignoring external script error:', error.message);
            return; // Don't set error state for external script errors
        }

        // You can also log the error to an error reporting service
        console.error('🚨 ErrorBoundary: Error caught by boundary:', error);
        console.error('🚨 ErrorBoundary: Error stack:', error.stack);
        console.error('🚨 ErrorBoundary: Error message:', error.message);
        console.error('🚨 ErrorBoundary: Error name:', error.name);
        console.error('🚨 ErrorBoundary: Error info:', errorInfo);
        console.error('🚨 ErrorBoundary: Component stack:', errorInfo.componentStack);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen bg-lightbg dark:bg-darkbg flex items-center justify-center px-4">
                    <div className="bg-white dark:bg-darkbg rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-lighttext dark:text-darktext mb-2">
                                Something went wrong
                            </h1>
                            <p className="text-lightsecondary dark:text-darksecondary mb-6">
                                We're sorry, but something unexpected happened. Please try refreshing the page.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-lightaccent dark:bg-darkaccent text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                            >
                                Refresh Page
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