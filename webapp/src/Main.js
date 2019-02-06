import React from 'react';
import Portfolios from './Portfolios';

export default class Main extends React.Component {

  componentDidMount() {
    this.props.appState.onStatusMessageChange(false, '');
    this.props.appState.onLoadingChange(false);
  }

  detail() {
    if (this.props.appState.state.userDetail.loggedIn) {
      return (<Portfolios {...this.props}></Portfolios>)
    }
    else { return (<div>Please login or register to continue.</div>) }
  }

  render() {
    return (<div className="card mt-3">
      <div className="card-body">
        <h1 className="card-title">Portfolio Tracker</h1>
        <h4 className="card-subtitle mb-2 text-muted">Welcome to the Portfolio Tracker!</h4>
          { this.detail() }
      </div>
    </div>
    )
  }
}