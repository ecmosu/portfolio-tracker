import React from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap';

import { Link } from "react-router-dom";

const loginButton = (userDetail) => {
    if (userDetail.loggedIn) {
        return (
            <Nav className="ml-auto" navbar>
                <NavItem>
                    <NavLink tag={Link} to="./">Portfolios</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="./securitylookup">Security Lookup</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="./sources">Sources</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="./logout">Logout {userDetail.user}</NavLink>
                </NavItem>
            </Nav>
        );
    }
    else {
        return (
            <Nav className="ml-auto" navbar>
                <NavItem>
                    <NavLink tag={Link} to="./">Main</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="./login">Login</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="./signup">Sign Up</NavLink>
                </NavItem>
            </Nav>
        );
    }
}

export default class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false
        };
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    render() {
        return (
            <div>
                <Navbar color="primary" dark expand="md">
                    <NavbarBrand href="./">Portfolio Tracker</NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        {loginButton(this.props.appState.state.userDetail)}
                    </Collapse>
                </Navbar>
            </div>
        )
    }
}