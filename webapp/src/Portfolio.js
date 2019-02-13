import React from 'react';
import { IoIosTrendingUp, IoIosTrendingDown, IoIosClose, IoIosAdd, IoIosListBox, IoMdCreate } from 'react-icons/io';
import {
    Form, FormGroup, Button, Card, CardBody, CardHeader, Collapse,
    Input, Label, Table
} from 'reactstrap';
import TickerDetail from './TickerDetail';
import io from 'socket.io-client';

export default class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.socket = io('https://ws-api.iextrading.com/1.0/last', {
            autoConnect: false
        });

        this.state = {
            showSection: true,
            selectedSecurity: "",
            holdings: []
        };

        this.decimalFormater = this.formatter('en-US', { maximumFractionDigits: 2 });
        this.percentFormater = this.formatter('en-US', { style: "percent", maximumFractionDigits: 2 });
    }

    componentWillUnmount() {
        this.socket.close();
    }

    componentDidMount() {
        this.props.appState.onViewChange(false);
        this.updateHoldings();
        this.socket.open();
        this.socket.on('connect', () => {
            this.state.holdings.forEach(item => {
                this.socket.emit('subscribe', item.symbol);
            });
            console.log('Connected');
        });

        this.socket.on('disconnect', function () {
            console.log('user disconnected');
        });

        this.socket.on('message', (message) => {
            try {
                const detail = JSON.parse(message);
                let holdings = [...this.state.holdings];
                const holding = holdings.find(hld => hld.symbol === detail.symbol);
                const holdingPriceTime = new Date(holding.price_date).getTime();
                if (holdingPriceTime < detail.time) {
                    holding.latest_price = detail.price;
                    this.setState(holdings);
                }
            }
            catch { };
        });
    }

    updateHoldings = async () => {
        try {
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            const response = await fetch(`./portfolios/${1}`);
            if (response.status === 200) {
                const json = await response.json();
                this.setState({
                    holdings: json.holdings
                });
            }
            else { console.log('Update Portfolios - Invalid Server Response'); }
        }
        catch (err) {
            console.log(err);
        }
        this.props.appState.onLoadingChange(false);
    }

    onTopToggle = (e) => {
        const toggleTarget = e.target.getAttribute("toggle-target")
        if (this.state.showSection === toggleTarget) {
            this.setState({ showSection: null });
        }
        else {
            this.setState({ showSection: toggleTarget });
        }
    }

    onSecuritySelect = (e) => {
        const symbol = e.currentTarget.getAttribute("symbol");
        this.setState({
            selectedSecurity: symbol
        })
    }

    formatter = (loc, settings) => {
        return (number => {
            return new Intl.NumberFormat(loc, settings).format(number);
        });
    }

    createColoredPercent = (value) => {
        if (value < 0) {
            return (<pre style={{ color: 'red' }}>{this.percentFormater(value)} <IoIosTrendingDown></IoIosTrendingDown></pre>)
        }
        else if (value > 0) {
            return (<pre style={{ color: 'green' }}>{this.percentFormater(value)} <IoIosTrendingUp></IoIosTrendingUp></pre>)
        }
        else {
            return (<pre style={{ color: 'black' }}>{this.percentFormater(value)}</pre>)
        }
    }

    createHoldingsRows = () => {
        return this.state.holdings.map((holding) => {
            const totalBasis = holding.average_cost_basis * holding.number_shares;
            const latestPrice = holding.number_shares * holding.latest_price;
            const latestClosingPrice = holding.number_shares * holding.latest_closing_price;

            return (
                <tr key={holding.investment_id} className="portfolio-holding-row">
                    <td className="holding-detail">
                        <div className="security-name">
                            {holding.investment_name}
                        </div>
                        <div>
                            <pre>{holding.symbol}</pre>
                        </div>
                    </td>
                    <td className="holding-detail">
                        <div>
                            <pre>{this.decimalFormater(holding.number_shares)}</pre>
                        </div>
                    </td>
                    <td className="holding-detail">
                        <div>
                            <pre>{this.decimalFormater(holding.average_cost_basis)}</pre>
                        </div>
                    </td>
                    <td className="holding-detail">
                        <div>
                            <pre>{this.decimalFormater(totalBasis)}</pre>
                        </div>
                    </td>
                    <td>
                        <div>
                            <pre>Last Updated: {new Intl.DateTimeFormat('en-US').format(new Date(holding.date_updated))}</pre>
                        </div>
                        <div>
                            <pre>Last Closed: {new Intl.DateTimeFormat('en-US').format(new Date(holding.price_date))}</pre>
                        </div>
                    </td>
                    <td>
                        <div>
                            <pre>
                                <span className="icon-wrapper"><IoMdCreate></IoMdCreate></span>
                                <span> | </span>
                                <span className="icon-wrapper"><IoIosClose></IoIosClose></span>
                            </pre>
                        </div>
                    </td>
                    <td>
                        <div>
                            <pre>Current: {this.decimalFormater(holding.latest_price)}</pre>
                        </div>
                        <div>
                            <pre>Closing: {this.decimalFormater(holding.latest_closing_price)}</pre>
                        </div>
                    </td>
                    <td>
                        <div>
                            <pre>{this.decimalFormater(latestPrice)}</pre>
                        </div>
                        <div>
                            <pre>{this.decimalFormater(latestClosingPrice)}</pre>
                        </div>
                    </td>
                    <td>
                        <div>
                            {this.createColoredPercent((latestPrice - latestClosingPrice) / latestClosingPrice)}
                        </div>
                        <div>
                            {this.createColoredPercent((latestClosingPrice - totalBasis) / totalBasis)}
                        </div>
                    </td>
                    <td>
                        <div>
                            <pre>
                                <span className="icon-wrapper">
                                    <IoIosListBox onClick={this.onSecuritySelect} symbol={holding.symbol}></IoIosListBox>
                                </span>
                            </pre>
                        </div>
                    </td>
                </tr>
            )
        });
    }

    createHoldingsTotal = () => {
        let total = { basis: 0, current: 0, closing: 0 };
        this.state.holdings.forEach((holding) => {
            total.basis += holding.average_cost_basis * holding.number_shares;
            total.current += holding.latest_price * holding.number_shares;
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

    renderAddInvestmentSection = () => {
        return (<Card>
            <CardHeader>
                <h2 className="mb-0">
                    <span onClick={this.onTopToggle} toggle-target="Manage" className="btn btn-link" style={{ width: '100%', textAlign: 'left' }}>
                        Add Investment
                    </span>
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
                            <Button color="primary">Submit</Button>
                        </Form>
                    </div>
                </CardBody>
            </Collapse>
        </Card>);
    }

    renderManageManualInvestment = () => {
        return (<Card>
            <CardHeader>
                <h2 className="mb-0">
                    <span onClick={this.onTopToggle} toggle-target="Add" className="btn btn-link" style={{ width: '100%', textAlign: 'left' }}>
                        Manage Manual Investments
                    </span>
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
                                        <span className="icon-wrapper"><IoIosAdd></IoIosAdd></span>
                                        <span> | </span>
                                        <span className="icon-wrapper"><IoMdCreate></IoMdCreate></span>
                                        <span> | </span>
                                        <span className="icon-wrapper"><IoIosClose></IoIosClose></span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Hedge Fund Holding #1</td>
                                    <td>1023.24</td>
                                    <td>02/06/2019</td>
                                    <td>
                                        <span className="icon-wrapper"><IoIosAdd></IoIosAdd></span>
                                        <span> | </span>
                                        <span className="icon-wrapper"><IoMdCreate></IoMdCreate></span>
                                        <span> | </span>
                                        <span className="icon-wrapper"><IoIosClose></IoIosClose></span>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                </CardBody>
            </Collapse>
        </Card>);
    }

    render() {
        if (this.state.holdings.length === 0) {
            return (<div>No holdings have been added to this portfolio.</div>)
        }
        else {
            return (
                <div>
                    <div className="accordion mt-3 pb-3" id="portfolioAccordian">
                        {this.renderAddInvestmentSection()}
                        {this.renderManageManualInvestment()}
                    </div>
                    <TickerDetail {...this.props} ticker={this.state.selectedSecurity}></TickerDetail>
                    <Table className="mt-3 portfolio-table" hover responsive>
                        <thead>
                            <tr>
                                <th>Ticker</th>
                                <th>Shares</th>
                                <th>Basis</th>
                                <th>Total Basis</th>
                                <th>Date</th>
                                <th></th>
                                <th>Price</th>
                                <th>Total</th>
                                <th>Gain/Loss</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.createHoldingsRows()}
                            {this.createHoldingsTotal()}
                        </tbody>
                    </Table>
                </div>)
        }
    }
}