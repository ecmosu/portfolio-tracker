import React from 'react';
import NavBar from './NavBar';
import Main from './Main';
import SecurityLookup from './SecurityLookup';
import Sources from './Sources';
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { Container } from 'reactstrap';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="App">
          <NavBar></NavBar>
          <Container>
            <Switch>
              <Route path="/securitylookup" component={SecurityLookup} />
              <Route path="/sources" component={Sources} />
              <Route component={Main} />
            </Switch>
          </Container>
        </div>
      </Router>
    );
  }
}

export default App;
