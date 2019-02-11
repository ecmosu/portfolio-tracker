import React from 'react';
import { IoIosTrendingUp, IoIosTrendingDown, IoIosClose, IoIosListBox, IoMdCreate } from 'react-icons/io';
import {
    Form, FormGroup, Button, Card, CardBody, CardHeader, Collapse,
    Input, Label, Table
} from 'reactstrap';
import TickerDetail from './TickerDetail';

export default class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.onTopToggle = this.onTopToggle.bind(this);
        this.onSecuritySelect = this.onSecuritySelect.bind(this);
        this.state = {
            showSection: true,
            selectedSecurity: "",
            holdings: []
        };

        this.decimalFormater = this.formatter('en-US', { maximumFractionDigits: 2 });
        this.percentFormater = this.formatter('en-US', { style: "percent", maximumFractionDigits: 2 });
    }

    componentDidMount() {
        this.props.appState.onViewChange(false);
        //this.updatePortfolios();
        this.setState({
            holdings: [
                { investment_id: 1, investment_name: "SPDR Dow Jones Industrial Average", symbol: "DIA", latest_closing_price: 253.83, average_cost_basis: 88, number_shares: 100, date_updated: '02/06/2019' },
                { investment_id: 2, investment_name: "SPDR S&P 500", symbol: "SPY", latest_closing_price: 272.795, average_cost_basis: 199, number_shares: 200, date_updated: '02/06/2019' }
            ]
        });
    }

    onTopToggle(e) {
        const toggleTarget = e.target.getAttribute("toggle-target")
        if (this.state.showSection === toggleTarget) {
            this.setState({ showSection: null });
        }
        else {
            this.setState({ showSection: toggleTarget });
        }
    }

    onSecuritySelect(e) {
        const symbol = e.currentTarget.getAttribute("symbol");
        this.setState({
            selectedSecurity: symbol
        })
    }

    formatter(loc, settings) {
        return (number => {
            return new Intl.NumberFormat(loc, settings).format(number);
        });
    }

    createColoredPercent(value) {
        if (value < 0) {
            return (<pre style={{ color: 'red' }}>{this.percentFormater(value)} <IoIosTrendingDown></IoIosTrendingDown></pre>)
        }
        else {
            return (<pre style={{ color: 'green' }}>{this.percentFormater(value)} <IoIosTrendingUp></IoIosTrendingUp></pre>)
        }
    }

    render() {
        const { holdings } = this.state;
        const holdingsRows = holdings.map((holding) => {
            return (
                <tr key={holding.investment_id}>
                    <td style={{ minWidth: '50px', width: '50px', position: 'relative' }}>
                        <div style={{ width:'275px', whiteSpace: 'nowrap', position: 'absolute', top: '5px', overflowX: 'hidden' }}>
                            {holding.investment_name}
                        </div>
                        <div style={{ position: 'absolute' }}>
                            <pre>{holding.symbol}</pre>
                        </div>
                    </td>
                    <td style={{ minWidth: '50px', width: '50px', position: 'relative' }}>
                        <div style={{ position: 'absolute' }}>
                            <pre>{this.decimalFormater(holding.number_shares)}</pre>
                        </div>
                    </td>
                    <td style={{ minWidth: '50px', width: '50px', position: 'relative' }}>
                        <div style={{ position: 'absolute' }}>
                            <pre>{this.decimalFormater(holding.average_cost_basis)}</pre>
                        </div>
                    </td>
                    <td style={{ minWidth: '50px', width: '50px', position: 'relative' }}>
                        <div style={{ position: 'absolute' }}>
                            <pre>{this.decimalFormater(holding.average_cost_basis * holding.number_shares)}</pre>
                        </div>
                    </td>
                    <td style={{ minWidth: '70px', width: '70px' }}>
                        <div>
                            <IoMdCreate></IoMdCreate>
                            <span> | </span>
                            <IoIosClose></IoIosClose>
                        </div>
                    </td>
                    <td style={{ minWidth: '50px', width: '50px' }}>
                        <div>
                            <pre>Last Updated: {holding.date_updated}</pre>
                        </div>
                        <div>
                            <pre>Last Closed: {holding.date_updated}</pre>
                        </div>
                    </td>
                    <td style={{ minWidth: '100px', width: '100px' }}>
                        <div>
                            <pre>Current: {this.decimalFormater(holding.latest_closing_price)}</pre>
                        </div>
                        <div>
                            <pre>Closing: {this.decimalFormater(holding.latest_closing_price)}</pre>
                        </div>
                    </td>
                    <td style={{ minWidth: '50px', width: '50px' }}>
                        <div>
                            <pre>{this.decimalFormater(holding.number_shares * holding.latest_closing_price)}</pre>
                        </div>
                        <div>
                            <pre>{this.decimalFormater(holding.number_shares * holding.latest_closing_price)}</pre>
                        </div>
                    </td>
                    <td style={{ minWidth: '50px', width: '50px' }}>
                        <div>
                            {this.createColoredPercent(-.0181)}
                        </div>
                        <div>
                            {this.createColoredPercent(.0233)}
                        </div>
                    </td>
                    <td style={{ textAlign: 'left', minWidth: '175px', width: '175px' }}>
                        <div>
                            <IoIosListBox onClick={this.onSecuritySelect} symbol={holding.symbol}></IoIosListBox>
                        </div>
                    </td>
                </tr>
            )
        });

        const holdingsTotal = () => {
            let total = { basis: 0, current: 0, closing: 0 };
            holdings.map((holding) => {
                total.basis += holding.average_cost_basis * holding.number_shares;
                total.current += holding.latest_closing_price * holding.number_shares;
                total.closing += holding.latest_closing_price * holding.number_shares;
            });
            return (<tr>
                <td colSpan="3"></td>
                <td>
                    <div>{this.decimalFormater(total.basis)}</div>
                </td>
                <td colSpan="2"></td>
                <td style={{ minWidth: '100px', width: '100px' }}>
                    <div>
                        <pre>Current: </pre>
                    </div>
                    <div>
                        <pre>Closing: </pre>
                    </div>
                </td>
                <td style={{ minWidth: '50px', width: '50px' }}>
                    <div>
                        <pre>{this.decimalFormater(total.current)}</pre>
                    </div>
                    <div>
                        <pre>{this.decimalFormater(total.closing)}</pre>
                    </div>
                </td>
                <td style={{ minWidth: '50px', width: '50px' }}>
                    <div>
                        {this.createColoredPercent(-.0181)}
                    </div>
                    <div>
                        {this.createColoredPercent(.0233)}
                    </div>
                </td>
            </tr>);
        }

        if (holdingsRows.length === 0) {
            return (<div>No holdings have been added to this portfolio.</div>)
        }
        else {
            return (
                <div>
                    <div className="accordion mt-3 pb-3" id="portfolioAccordian">
                        <Card>
                            <CardHeader>
                                <h2 className="mb-0">
                                    <Button className="btn btn-light btn-link" onClick={this.onTopToggle} toggle-target="Manage">
                                        Add Investment
                                    </Button>
                                </h2>
                            </CardHeader>
                            <Collapse isOpen={this.state.showSection === "Manage"}>
                                <CardBody>
                                    <div>
                                        <Form inline>
                                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                                <Label for="addTicker" className="mr-sm-2">Ticker</Label>
                                                <Input type="text" name="ticker" id="addTicker" placeholder="Ticker" required />
                                            </FormGroup>
                                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                                <Label for="addShares" className="mr-sm-2">Shares</Label>
                                                <Input type="number" step="any" name="shares" id="addShares" placeholder="# of Shares" required />
                                            </FormGroup>
                                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                                <Label for="addBasis" className="mr-sm-2">Avg. Stock Basis</Label>
                                                <Input type="number" step="any" name="basis" id="addBasis" placeholder="Basis" required />
                                            </FormGroup>
                                            <Button>Submit</Button>
                                        </Form>
                                    </div>
                                </CardBody>
                            </Collapse>
                        </Card>
                        <Card>
                            <CardHeader>
                                <h2 className="mb-0">
                                    <Button className="btn btn-light btn-link" onClick={this.onTopToggle} toggle-target="Add">
                                        Manage Manual Investments
                                    </Button>
                                </h2>
                            </CardHeader>
                            <Collapse isOpen={this.state.showSection === "Add"}>
                                <CardBody>
                                    <div>
                                        <Table responsive hover>
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Current Price</th>
                                                    <th>Date Updated</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Manual Investment #1</td>
                                                    <td>101.23</td>
                                                    <td>02/06/2019</td>
                                                    <td>
                                                        <Button color="primary" size="sm">Add</Button>
                                                        <span> | </span>
                                                        <Button color="primary" size="sm">Edit</Button>
                                                        <span> | </span>
                                                        <Button color="primary" size="sm">Delete</Button>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Hedge Fund Holding #1</td>
                                                    <td>1023.24</td>
                                                    <td>02/06/2019</td>
                                                    <td>
                                                        <Button color="primary" size="sm">Add</Button>
                                                        <span> | </span>
                                                        <Button color="primary" size="sm">Edit</Button>
                                                        <span> | </span>
                                                        <Button color="primary" size="sm">Delete</Button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                </CardBody>
                            </Collapse>
                        </Card>
                    </div>
                    <TickerDetail {...this.props} ticker={this.state.selectedSecurity}></TickerDetail>
                    <Table className="mt-3 portfolioTable" hover responsive>
                        <thead>
                            <tr>
                                <th>Ticker</th>
                                <th>Shares</th>
                                <th>Basis</th>
                                <th>Total Basis</th>
                                <th></th>
                                <th>Date</th>
                                <th>Price</th>
                                <th>Total</th>
                                <th>Gain/Loss</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdingsRows}
                            {holdingsTotal()}
                        </tbody>
                    </Table>
                </div>)
        }
    }
}