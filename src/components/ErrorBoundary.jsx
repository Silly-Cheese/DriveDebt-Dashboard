import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('DriveDebt crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="login-page">
          <div className="login-card">
            <h1>DriveDebt hit an error</h1>
            <p>The app loaded, but something crashed. Open the browser console for the full error.</p>
            <div className="error-box">{this.state.error.message}</div>
            <button className="primary-button wide" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
