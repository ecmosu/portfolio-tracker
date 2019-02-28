import React from 'react';
import { IoIosTrendingUp, IoIosListBox, IoIosTrendingDown, IoIosClose, IoIosAdd, IoMdCreate } from 'react-icons/io';
import {
    Form, FormGroup, Button, Card, CardBody, CardHeader, Collapse,
    Input, Label, Table, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import TickerDetail from './TickerDetail';
import PortfolioEntry from './PortfolioEntry';
import io from 'socket.io-client';

export default class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.socket = io('https://ws-api.iextrading.com/1.0/last', {
            autoConnect: false
        });

        this.currentPricingDetail = {};

        this.state = {
            showSection: true,
            selectedSecurity: "",
            holdings: [],
            manualModal: false,
            newInvestment: { ticker: "", shares: "", basis: "" }
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
        // this.setState({
        //     holdings: [
        //         { investment_id: 1, investment_name: "DOW", symbol: "DIA", latest_closing_price: 253.83, latest_price: 253.83, average_cost_basis: 88, number_shares: 100, date_updated: '02/06/2019', price_date: '02/06/2019' },
        //         { investment_id: 2, investment_name: "S&P 500", symbol: "SPY", latest_closing_price: 272.795, latest_price: 272.795, average_cost_basis: 199, number_shares: 200, date_updated: '02/06/2019', price_date: '02/06/2019' }
        //     ]
        // });
        this.socket.open();
        this.socket.on('connect', () => {
            this.currentPricingDetail["currentState"] = { updated: Date.now() };
            this.state.holdings.forEach(item => {
                this.currentPricingDetail[item.symbol] = { price: item.latest_price };
                this.socket.emit('subscribe', item.symbol);
            });

            //setInterval(this.updateCurrentPrices, 2000);
            console.log('Connected');
        });

        this.socket.on('disconnect', function () {
            console.log('user disconnected');
        });

        this.socket.on('message', (message) => {
            try {
                const detail = JSON.parse(message);
                //this.currentPricingDetail[detail.symbol] = { price: detail.price };

                const holdings = [...this.state.holdings];
                const holdingIndex = holdings.findIndex(item => item.symbol === detail.symbol);
                let holding = { ...holdings[holdingIndex] };
                //const currentHolding = this.currentPricingDetail[holding.symbol];
                //const holdingPriceTime = new Date(holding.price_date).getTime();
                //if (holdingPriceTime < detail.time) {
                holding.latest_price = detail.price;
                holdings[holdingIndex] = holding;
                this.setState({ holdings });
                //}
            }
            catch (err) {
                console.log(err);
            };
        });
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

    updateCurrentPrices = async () => {
        let holdings = [...this.state.holdings];
        holdings.forEach((element, holdingIndex) => {
            let holding = { ...holdings[holdingIndex] };
            const currentHolding = this.currentPricingDetail[holding.symbol];
            if (currentHolding !== null) {
                holding.latest_price = this.currentPricingDetail[holding.symbol].price;
                holdings[holdingIndex] = holding;
            }
        });
        this.setState({ holdings });
    }

    updateHoldings = async () => {
        try {
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            const response = await fetch(`./portfolios/${this.props.match.params.id}`);
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
                    await this.updateHoldings();
                    this.setState({ showSection: null });
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
            return <PortfolioEntry key={holding.investment_id} onSecuritySelect={this.onSecuritySelect} {...holding}></PortfolioEntry>
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
                        Add Investment By Ticker
                    </span>
                </h2>
            </CardHeader>
            <Collapse isOpen={this.state.showSection === "Manage"}>
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
        </Card>);
    }

    renderManageManualInvestment = () => {
        return (<Card>
            <CardHeader>
                <h2 className="mb-0">
                    <span onClick={this.onTopToggle} toggle-target="Add" className="btn btn-link" style={{ width: '80%', textAlign: 'left' }}>
                        Manage Manual Investments
                    </span>
                </h2>
            </CardHeader>
            <Collapse isOpen={this.state.showSection === "Add"}>
                <CardBody>
                    <div>
                        <Button color="primary" onClick={this.toggleManualInvestmentModal}>Add New Manual Investment</Button>
                        <div className={"mt-2"}>
                            <pre>Manual Investment Actions: <IoIosAdd></IoIosAdd> - Add To Portfolio || <IoMdCreate></IoMdCreate> - Edit Manual Investment || <IoIosClose></IoIosClose> - Delete (From All Portfolios)</pre>
                        </div>
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

    toggleManualInvestmentModal = () => {
        this.setState(prevState => ({
            manualModal: !prevState.manualModal
        }));
    }

    renderManualInvestmentModal = () => {
        return (
            <div>
                <Modal isOpen={this.state.manualModal} toggle={this.toggleManualInvestmentModal}>
                    <ModalHeader toggle={this.toggleManualInvestmentModal}>Modal title</ModalHeader>
                    <ModalBody>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggleManualInvestmentModal}>Do Something</Button>{' '}
                        <Button color="secondary" onClick={this.toggleManualInvestmentModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
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
                    <div className={"mt-2"}>
                        <pre>Portfolio Actions: <IoMdCreate></IoMdCreate> - Edit || <IoIosClose></IoIosClose> - Delete || <IoIosListBox></IoIosListBox> - Show Details</pre>
                    </div>
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
                    {this.renderManualInvestmentModal()}
                </div>)
        }
    }
}