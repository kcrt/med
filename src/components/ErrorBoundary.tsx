"use client";

import { Alert, Button, Container, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  translations?: {
    title: string;
    message: string;
    retry: string;
  };
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully.
 *
 * Prevents formula evaluation errors or other runtime errors from crashing
 * the entire application. Instead, displays a user-friendly error message
 * with the option to retry.
 */
class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }
    // In production, you could log to an error monitoring service here
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { translations } = this.props;

      return (
        <Container size="sm" py="xl">
          <Stack gap="md">
            <Alert variant="light" color="red" title={translations?.title}>
              <Stack gap="sm">
                <Text>{translations?.message}</Text>
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <Text
                    size="sm"
                    c="dimmed"
                    style={{ fontFamily: "monospace" }}
                  >
                    {this.state.error.message}
                  </Text>
                )}
                <Button onClick={this.handleReset} variant="light">
                  {translations?.retry}
                </Button>
              </Stack>
            </Alert>
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper component that provides translations to the ErrorBoundary class component.
 * This is necessary because hooks cannot be used directly in class components.
 */
export function ErrorBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const t = useTranslations("error");

  const translations = {
    title: t("title"),
    message: t("message"),
    retry: t("retry"),
  };

  return (
    <ErrorBoundaryClass fallback={fallback} translations={translations}>
      {children}
    </ErrorBoundaryClass>
  );
}
