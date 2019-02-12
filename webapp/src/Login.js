import React from 'react';
import {
    Card, CardBody, Col, Button, Form, FormGroup, Label, Input
} from 'reactstrap';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = { inputUser: '', inputPass: '' }
    }

    componentDidMount() {
        this.props.appState.onViewChange(false);
    }

    handleOnChange = (e) => {
        const { value, name } = e.target
        this.setState({ [name]: value })
    }

    handleLoginSubmit = async (event) => {
        event.preventDefault();
        this.props.appState.onLoadingChange(true);
        try {
            const data = { username: this.state.inputUser, password: this.state.inputPass };
            const response = await fetch(`./login`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                const result = await response.json();
                this.props.appState.onUserDetailChange(result);
                if (result.loggedIn) {
                    this.props.history.push('/');
                }
                else {
                    this.props.appState.onStatusMessageChange(!result.loggedIn, (<div><strong>Alert!</strong> {result.message}</div>));
                }
            }
            else {
                this.props.appState.onStatusMessageChange(true, (<div><strong>Alert!</strong> An unknown error was encountered while attempting to login.</div>));
            }
        }
        catch
        {
            let detail = { loggedIn: false, user: '' };
            this.props.appState.onUserDetailChange(detail);
            this.props.appState.onStatusMessageChange(true, (<div><strong>Alert!</strong> Invalid username or password!</div>));
        }
        this.props.appState.onLoadingChange(false);
    }

    render() {
        return (
            <Card className="mt-3">
                <CardBody>
                    <h1 className="card-title">Portfolio Tracker</h1>
                    <h4 className="card-subtitle mb-2 text-muted">Login to Continue</h4>

                    <Form onSubmit={this.handleLoginSubmit}>
                        <FormGroup row>
                            <Label for="inputUser" sm={2}>Username</Label>
                            <Col sm={10}>
                                <Input required type="text" name="inputUser" id="inputUser" onChange={this.handleOnChange} />
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label for="inputPass" sm={2}>Password</Label>
                            <Col sm={10}>
                                <Input required type="password" minLength="6" name="inputPass" id="inputPass" onChange={this.handleOnChange} />
                            </Col>
                        </FormGroup>
                        <Button type="submit" className="float-right">Submit</Button>
                    </Form>
                </CardBody>
            </Card>
        )
    }
}