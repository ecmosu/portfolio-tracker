import React from 'react';
import { Button, Card, CardBody, CardHeader, Collapse, 
    Input, InputGroup, InputGroupAddon, Table } from 'reactstrap';
import { Link } from 'react-router-dom'

export default class Portfolios extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            showSection: true,
            portfolios: []
        };
    }

    toggle() {
        this.setState({ showSection: !this.state.showSection });
    }

    async updatePortfolios() {
        try {
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            // const response = await fetch(`./portfolios`);
            // if (response.status === 200) {
            //     const json = await response.json();
            //     this.setState({
            //         portfolios: json.portfolios
            //     });
            // }
            // else { console.log('Update Portfolios - Invalid Server Response'); }
            this.setState({
                portfolios: [
                    { portfolio_id: 1, portfolio_name: "401K" },
                    { portfolio_id: 2, portfolio_name: "Roth" },
                    { portfolio_id: 3, portfolio_name: "Taxable" }
                ]
            });
        }
        catch (err) {
            console.log(err);
        }
        this.props.appState.onLoadingChange(false);
    }

    componentDidMount() {
        this.props.appState.onViewChange(false);
        this.updatePortfolios();
    }

    render() {
        const { portfolios } = this.state;
        const portfolioRows = portfolios.map((portfolio) => {
            return (
                <tr key={portfolio.portfolio_id}>
                    <td>{portfolio.portfolio_name}</td>
                    <td>
                        <Link className="btn btn-primary btn-sm active" role="button" to={"/portfolios/" + portfolio.portfolio_id}>Select</Link>
                        <span> | </span>
                        <Link className="btn btn-primary btn-sm active" role="button" to={"/portfolios/" + portfolio.portfolio_id}>Delete</Link>
                    </td>
                </tr>
            )
        })
        if (portfolios.length === 0) {
            return (<div>No Portfolios have been created.</div>)
        }
        else {
            return (<div>
                <div className="accordion" id="portfolioAccordian">
                    <Card>
                        <CardHeader>
                            <h2 className="mb-0">
                                <Button className="btn btn-light btn-link" onClick={this.toggle}>
                                    Create New Portfolio
                            </Button>
                            </h2>
                        </CardHeader>
                        <Collapse isOpen={this.state.showSection === false}>
                            <CardBody>
                                <div>
                                    <InputGroup>
                                        <Input placeholder="Portfolio Name" />
                                        <InputGroupAddon addonType="append">
                                            <Button>Create Portfolio</Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>
                            </CardBody>
                        </Collapse>
                    </Card>
                    <Card>
                        <CardHeader>
                            <h2 className="mb-0">
                                <Button className="btn btn-light btn-link" onClick={this.toggle}>
                                    Manage Portfolios
                            </Button>
                            </h2>
                        </CardHeader>
                        <Collapse isOpen={this.state.showSection === true}>
                            <CardBody>
                                <Table hover>
                                    <thead>
                                        <tr>
                                            <th>Portfolio</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {portfolioRows}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Collapse>
                    </Card>
                </div>
            </div >)
        }
    }
}