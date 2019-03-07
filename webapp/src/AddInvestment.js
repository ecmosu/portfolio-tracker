import React from 'react';
import {
    Form, FormGroup, Button, Card, CardBody, CardHeader, Collapse, Input, Label
} from 'reactstrap';

export default class AddInvestment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newInvestment: { ticker: "", shares: "", basis: "" },
        }
    }

    componentDidMount() {
        this.props.appState.onViewChange(false);
    }

    handleOnChange = (e) => {
        const { value, name } = e.target
        const stateobject = e.target.getAttribute("stateobject");
        if (stateobject) {
            this.setState(prevState => ({
                [stateobject]: {
                    ...prevState[stateobject],
                    [name]: value
                }
            }));
        }
    }

    onToggle = (e) => {
        const toggleTarget = e.target.getAttribute("toggle-target");
        this.props.onToggle(toggleTarget);
    }

    onCreateInvestmentClick = async (e) => {
        e.preventDefault();
        try {
            const data = this.state['newInvestment'];
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            const response = await fetch(`./portfolios/${this.props.match.params.id}/addinvestment`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                const json = await response.json();
                if (json.success) {
                    this.setState({ newInvestment: { ticker: "", shares: "", basis: "" } });
                    await this.props.runUpdates();
                    this.setState({ showSection: null });
                }
                else {
                    this.props.appState.onLoadingChange(false);
                }
                this.props.appState.onStatusMessageChange(true, json.message);
            }
            else {
                console.log('Add Ticker - Invalid Server Response');
                this.props.appState.onLoadingChange(false);
                this.props.appState.onStatusMessageChange(true, 'The requested investment was not able to be added.');
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    render() {
        return (
            <Card>
                <CardHeader>
                    <h2 className="mb-0">
                        <span onClick={this.onToggle} toggle-target="Manage" className="btn btn-link" style={{ width: '100%', textAlign: 'left' }}>
                            Add Investment By Ticker
                    </span>
                    </h2>
                </CardHeader>
                <Collapse isOpen={this.props.showSection}>
                    <CardBody>
                        <div>
                            <Form inline onSubmit={this.onCreateInvestmentClick}>
                                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                    <Label for="addTicker" className="mr-sm-2">Ticker</Label>
                                    <Input type="text"
                                        name="ticker"
                                        id="addTicker"
                                        placeholder="Ticker"
                                        stateobject="newInvestment"
                                        onChange={this.handleOnChange}
                                        value={this.state.newInvestment.ticker}
                                        required />
                                </FormGroup>
                                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                    <Label for="addShares" className="mr-sm-2">Shares</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        name="shares"
                                        id="addShares"
                                        placeholder="# of Shares"
                                        stateobject="newInvestment"
                                        onChange={this.handleOnChange}
                                        value={this.state.newInvestment.shares}
                                        required />
                                </FormGroup>
                                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                    <Label for="addBasis" className="mr-sm-2">Avg. Stock Basis</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        name="basis"
                                        id="addBasis"
                                        placeholder="Basis"
                                        stateobject="newInvestment"
                                        onChange={this.handleOnChange}
                                        value={this.state.newInvestment.basis}
                                        required />
                                </FormGroup>
                                <Button color="primary">Submit</Button>
                            </Form>
                        </div>
                    </CardBody>
                </Collapse>
            </Card>
        )
    }
}