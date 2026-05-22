"use client";

import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("[ShotlistAI] Dashboard render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-[60vh] place-items-center rounded border border-line bg-surface p-8 text-center">
          <div>
            <p className="font-serif text-3xl text-text">Something went wrong</p>
            <button onClick={() => window.location.reload()} className="primary-button mt-6">
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
