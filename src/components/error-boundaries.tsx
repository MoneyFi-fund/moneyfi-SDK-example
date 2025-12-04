/**
 * React Error Boundaries
 * Provides graceful error handling for React components
 * Clean, reusable, and type-safe implementation
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
  Text,
  Heading,
  Box,
  Link,
} from '@chakra-ui/react';

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Fallback component to render when error occurs */
  fallback?: React.ComponentType<{ error: Error; errorInfo: ErrorInfo; reset: () => void }>;
  /** Custom error handler */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details in development */
  showDetails?: boolean;
  /** Component name for error tracking */
  componentName?: string;
}

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({
  error,
  errorInfo,
  reset,
}: {
  error: Error;
  errorInfo: ErrorInfo;
  reset: () => void;
}) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Box p={8} minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Alert.Root status="error" maxW="600px" w="full">
        <Alert.Title>Something went wrong</Alert.Title>
        <Alert.Description>
          <VStack gap={4} align="stretch">
            <Text>
              We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.
            </Text>

            {isDevelopment && (
              <VStack gap={2} align="stretch" bg="red.50" p={4} borderRadius="md">
                <Heading size="sm" color="red.800">
                  Error Details (Development Mode)
                </Heading>
                <Text fontFamily="mono" fontSize="sm" color="red.700" bg="white" p={2} borderRadius="sm">
                  {error.message}
                </Text>
                {errorInfo && (
                  <Text fontFamily="mono" fontSize="xs" color="red.600">
                    Component Stack Trace:
                    <br />
                    {errorInfo.componentStack}
                  </Text>
                )}
              </VStack>
            )}

            <Button onClick={reset} colorScheme="red" alignSelf="flex-start">
              Try Again
            </Button>
          </VStack>
        </Alert.Description>
      </Alert.Root>
    </Box>
  );
}

/**
 * General Purpose Error Boundary
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you might want to send this to an error tracking service
    // this.trackError(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          reset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Specialized error boundary for transaction-related errors
 */
export interface TransactionErrorBoundaryProps extends Omit<ErrorBoundaryProps, 'fallback'> {
  /** Custom fallback for transaction errors */
  transactionFallback?: React.ComponentType<{
    error: Error;
    errorInfo: ErrorInfo;
    reset: () => void;
    retryTransaction?: () => Promise<void>;
  }>;
}

export function TransactionErrorFallback({
  error,
  errorInfo,
  reset,
  retryTransaction,
}: {
  error: Error;
  errorInfo: ErrorInfo;
  reset: () => void;
  retryTransaction?: () => Promise<void>;
}) {
  return (
    <Box p={8} minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Alert.Root status="error" maxW="600px" w="full">
        <Alert.Title>Transaction Failed</Alert.Title>
        <Alert.Description>
          <VStack gap={4} align="stretch">
            <Text>
              {error.message || 'The transaction could not be completed. Please check your wallet and try again.'}
            </Text>

            <VStack gap={2} direction="row" justify="flex-start">
              <Button onClick={reset} colorScheme="gray">
                Close
              </Button>
              {retryTransaction && (
                <Button onClick={retryTransaction} colorScheme="blue">
                  Retry Transaction
                </Button>
              )}
            </VStack>

            {process.env.NODE_ENV === 'development' && (
              <VStack gap={2} align="stretch" bg="red.50" p={4} borderRadius="md">
                <Heading size="sm" color="red.800">
                  Debug Information
                </Heading>
                <Text fontFamily="mono" fontSize="sm" color="red.700" bg="white" p={2} borderRadius="sm">
                  {error.message}
                </Text>
                <Text fontFamily="mono" fontSize="xs" color="red.600">
                  Stack: {errorInfo.componentStack}
                </Text>
              </VStack>
            )}
          </VStack>
        </Alert.Description>
      </Alert.Root>
    </Box>
  );
}

export class TransactionErrorBoundary extends Component<
  TransactionErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryCallback?: () => Promise<void>;

  constructor(props: TransactionErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('TransactionErrorBoundary caught an error:', error, errorInfo);
    }
  }

  setRetryCallback = (callback: () => Promise<void>): void => {
    this.retryCallback = callback;
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.retryCallback = undefined;
  };

  handleRetry = async (): Promise<void> => {
    if (this.retryCallback) {
      try {
        await this.retryCallback();
        this.handleReset();
      } catch (error) {
        // Reset to show the error again with the new error
        this.setState({
          error: error instanceof Error ? error : new Error('Retry failed'),
        });
      }
    }
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      const FallbackComponent = this.props.transactionFallback || TransactionErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          reset={this.handleReset}
          retryTransaction={this.retryCallback ? this.handleRetry : undefined}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to provide retry functionality to transaction error boundary
 */
export function useTransactionErrorBoundary() {
  const errorBoundaryRef = React.useRef<TransactionErrorBoundary>(null);

  const setRetryCallback = React.useCallback((callback: () => Promise<void>) => {
    if (errorBoundaryRef.current) {
      errorBoundaryRef.current.setRetryCallback(callback);
    }
  }, []);

  return {
    errorBoundaryRef,
    setRetryCallback,
  };
}

/**
 * Network-specific error boundary
 */
export function NetworkErrorFallback({
  error,
  reset,
}: {
  error: Error;
  errorInfo: ErrorInfo;
  reset: () => void;
}) {
  return (
    <Box p={8} minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Alert.Root status="warning" maxW="600px" w="full">
        <Alert.Title>Network Connection Issue</Alert.Title>
        <Alert.Description>
          <VStack gap={4} align="stretch">
            <Text>
              {error.message || 'Unable to connect to the network. Please check your internet connection and try again.'}
            </Text>

            <Button onClick={reset} colorScheme="orange" alignSelf="flex-start">
              Reconnect
            </Button>

            <Text fontSize="sm" color="gray.600">
              If the problem persists, your wallet may need to be refreshed or reconnected.
            </Text>
          </VStack>
        </Alert.Description>
      </Alert.Root>
    </Box>
  );
}

/**
 * Higher-order component for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Higher-order component for wrapping components with transaction error boundaries
 */
export function withTransactionErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<TransactionErrorBoundaryProps>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <TransactionErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </TransactionErrorBoundary>
  );

  WrappedComponent.displayName = `withTransactionErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Custom hook for error handling in functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    setError(errorObj);

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by useErrorHandler:', errorObj);
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const reset = React.useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    error,
    handleError,
    clearError,
    reset,
    hasError: !!error,
  };
}

/**
 * Default exports
 */
export default ErrorBoundary;