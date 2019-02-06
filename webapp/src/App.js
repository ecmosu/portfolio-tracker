import React from 'react';
import Login from './Login';
import Main from './Main';
import NavBar from './NavBar';
import Portfolio from './Portfolio';
import { HashRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { Alert, Container } from 'reactstrap';
import Signup from './Signup';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleUserDetailChange = this.handleUserDetailChange.bind(this);
    this.handleLoadingChange = this.handleLoadingChange.bind(this);
    this.handleStatusMessageChange = this.handleStatusMessageChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.state = {
      isLoading: false,
      showMessage: false,
      message: '',
      userDetail: { loggedIn: false, user: '' }
    };
  }

  handleUserDetailChange(detail) {
    this.setState({ userDetail: { loggedIn: detail.loggedIn, user: detail.user } });
  }

  handleLoadingChange(show) {
    this.setState({ isLoading: show });
  }

  handleStatusMessageChange(show, message) {
    this.setState({
      showMessage: show,
      message: message
    });
  }

  async handleLogout() {
    await fetch(`./logout`);
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    fetch(`./authstatus`)
      .then(res => res.json())
      .then(
        (result) => {
          this.handleUserDetailChange(result)
        },
        (error) => {
          let detail = { loggedIn: false, user: '' };
          this.handleUserDetailChange(detail)
        }
      )
  }

  onDismiss() {
    this.setState({ showMessage: false });
  }

  componentDidMount() {
    this.checkAuthStatus();
  }

  render() {

    const appStateDetail = {
      state: this.state,
      onUserDetailChange: this.handleUserDetailChange,
      onLoadingChange: this.handleLoadingChange,
      onStatusMessageChange: this.handleStatusMessageChange
    }

    return (
      <Router>
        <div className="App">
          <NavBar
            appState={appStateDetail} />
          {this.state.isLoading &&
            <div className="loader"></div>}
          <Alert color="warning"
            isOpen={this.state.showMessage}
            toggle={this.onDismiss}
            fade={true}>
            {this.state.message}
          </Alert>
          <Container>
            <Switch>
              <Route path="/login"
                render={(props) => <Login {...props}
                  appState={appStateDetail}
                />} />
              <Route path="/signup"
                render={(props) => <Signup {...props}
                  appState={appStateDetail}
                />} />
              <Route path="/logout"
                render={() => {
                  this.handleLogout()
                  return <Redirect to={'./'} />
                }}
              />
              <Route path="/portfolios/:id"
                render={(props) => <Portfolio {...props}
                  appState={appStateDetail}
                />} />
              <Route path="/"
                render={(props) => <Main {...props}
                  appState={appStateDetail}
                />} />
            </Switch>
          </Container>
        </div>
      </Router>
    );
  }
}

export default App;