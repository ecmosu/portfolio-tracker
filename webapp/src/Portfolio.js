import React from 'react';
import { IoIosTrendingUp, IoIosListBox, IoIosTrendingDown, IoIosClose, IoMdCreate } from 'react-icons/io';
import {
    Col, Form, FormGroup, Button, Input, Label, Table, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import TickerDetail from './TickerDetail';
import PortfolioSummary from './PortfolioSummary';
import PortfolioEntry from './PortfolioEntry';
import AddInvestment from './AddInvestment';
import ManageManualInvestments from './ManageManualInvestments';
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
            selectedSecurity: { investment_id: "", symbol: "", investmenttype_name: "", sector_name: ""},
            currentSector: "",
            currentAsset: "",
            holdings: [],
            editModal: { investment_id: "", basis: "", shares: "" },
            deleteModal: { investment_id: "" },
            currentModal: ""
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
            this.currentPricingDetail["currentState"] = { updated: Date.now() };
            this.state.holdings.forEach(item => {
                if (item.api_code !== "USER") {
                    this.currentPricingDetail[item.symbol] = { price: item.latest_price };
                    this.socket.emit('subscribe', item.symbol);
                }
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

    handleSummaryFilter = (key, value) => {
        if (this.state[key] === value) {
            this.setState({ [key]: "" }, this.updateHoldings);
        }
        else {
            this.setState({ [key]: value }, this.updateHoldings);
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
            const response = await fetch(`./portfolios/${this.props.match.params.id}?${this.state.currentSector === "" ? "" : "&sector_id=" + this.state.currentSector}${this.state.currentAsset === "" ? "" : "&asset_id=" + this.state.currentAsset}`);
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

    handleTopToggle = (value) => {
        if (this.state.showSection === value) {
            this.setState({ showSection: null });
        }
        else {
            this.setState({ showSection: value });
        }
    }

    onSecuritySelect = (e) => {
        const investmentId = e.currentTarget.getAttribute("investment-id");
        const targetIndex = this.state.holdings.findIndex(item => Number(item.investment_id) === Number(investmentId));
        if (targetIndex > -1) {
            const targetHolding = { ...this.state.holdings[targetIndex] }
            this.setState({
                selectedSecurity: targetHolding
            });
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

    toggleEditInvestmentModal = (e) => {
        if (this.state.currentModal === "EditModal") {
            this.setState({
                editModal: { investment_id: "", basis: "", shares: "" },
                currentModal: "",
            });
        }
        else {
            const toggleTarget = e.target.getAttribute("edit-id");
            const targetIndex = this.state.holdings.findIndex(item => Number(item.investment_id) === Number(toggleTarget));
            if (targetIndex > -1) {
                const targetHolding = { ...this.state.holdings[targetIndex] }
                this.setState({
                    editModal: { investment_id: targetHolding.investment_id, basis: targetHolding.average_cost_basis, shares: targetHolding.number_shares },
                    currentModal: "EditModal",
                });
            }
        }
    }

    onEditHoldingSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...this.state.editModal };
            console.log(data);
            this.setState({
                editModal: { investment_id: "", basis: "", shares: "" },
                currentModal: "",
            });
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            const response = await fetch(`./portfolios/${this.props.match.params.id}/holding/${data.investment_id}`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                const json = await response.json();
                if (json.success) {
                    await this.updateHoldings();
                }
                else {
                    this.props.appState.onLoadingChange(false);
                }
                this.props.appState.onStatusMessageChange(true, json.message);
            }
            else {
                console.log('Edit Holding - Invalid Server Response');
                this.props.appState.onLoadingChange(false);
                this.props.appState.onStatusMessageChange(true, 'The requested holding was not able to be updated.');
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    renderEditInvestmentModal = () => {
        return (
            <div>
                <Modal isOpen={this.state.currentModal === "EditModal"} toggle={this.toggleEditInvestmentModal}>
                    <Form onSubmit={this.onEditHoldingSubmit}>
                        <ModalHeader toggle={this.toggleEditInvestmentModal}>Edit Holding</ModalHeader>
                        <ModalBody>
                            <FormGroup row>
                                <Label for="modalEditShares" sm={2}>Shares</Label>
                                <Col sm={10}>
                                    <Input
                                        type="number"
                                        step="any"
                                        min="0"
                                        name="shares"
                                        id="modalEditShares"
                                        placeholder="# of Shares"
                                        stateobject="editModal"
                                        onChange={this.handleOnChange}
                                        value={this.state.editModal.shares}
                                        required />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="modalEditBasis" sm={2}>Basis</Label>
                                <Col sm={10}>
                                    <Input
                                        type="number"
                                        step="any"
                                        min="0"
                                        name="basis"
                                        id="modalEditBasis"
                                        placeholder="Stock Basis"
                                        stateobject="editModal"
                                        onChange={this.handleOnChange}
                                        value={this.state.editModal.basis}
                                        required />
                                </Col>
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button type="submit" color="primary">Edit</Button>{' '}
                            <Button color="secondary" onClick={this.toggleEditInvestmentModal}>Cancel</Button>
                        </ModalFooter>
                    </Form>
                </Modal>
            </div>
        );
    }

    toggleDeleteInvestmentModal = (e) => {
        if (this.state.currentModal === "DeleteModal") {
            this.setState({
                deleteModal: { investment_id: "" },
                currentModal: "",
            });
        }
        else {
            const toggleTarget = e.target.getAttribute("delete-id");
            this.setState(prevState => ({
                deleteModal: { investment_id: toggleTarget },
                currentModal: "DeleteModal",
            }));
        }
    }

    onDeleteHoldingConfirmClick = async () => {
        try {
            const investmentId = this.state.deleteModal.investment_id;
            this.setState({
                deleteModal: { investment_id: "" },
                currentModal: "",
            });
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            const response = await fetch(`./portfolios/${this.props.match.params.id}/holding/${investmentId}`, {
                method: "DELETE"
            });
            if (response.status === 200) {
                const json = await response.json();
                if (json.success) {
                    await this.updateHoldings();
                }
                else {
                    this.props.appState.onLoadingChange(false);
                }
                this.props.appState.onStatusMessageChange(true, json.message);
            }
            else {
                this.props.appState.onLoadingChange(false);
                this.props.appState.onStatusMessageChange(true, 'The requested delete action was not able to be processed.');
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    renderDeleteInvestmentModal = () => {
        return (
            <div>
                <Modal isOpen={this.state.currentModal === "DeleteModal"} toggle={this.toggleDeleteInvestmentModal}>
                    <ModalHeader toggle={this.toggleDeleteInvestmentModal}>Delete Holding</ModalHeader>
                    <ModalBody>
                        Are you sure you would like to delete this holding?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.onDeleteHoldingConfirmClick}>Delete</Button>{' '}
                        <Button color="secondary" onClick={this.toggleDeleteInvestmentModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    renderModal = () => {
        switch (this.state.currentModal) {
            case "EditModal":
                return this.renderEditInvestmentModal();
            case "DeleteModal":
                return this.renderDeleteInvestmentModal();
            default:
                return null;
        }
    }

    createHoldingsRows = () => {
        return this.state.holdings.map((holding) => {
            return <PortfolioEntry
                key={holding.investment_id}
                onSecuritySelect={this.onSecuritySelect}
                toggleEditModal={this.toggleEditInvestmentModal}
                toggleDeleteModal={this.toggleDeleteInvestmentModal}
                {...holding}>
            </PortfolioEntry>
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

    render() {
        if (!this.props.appState.state.userDetail.loggedIn) {
            return (<div className="card mt-3">
                <div className="card-body">
                    <h1 className="card-title">Portfolio Tracker</h1>
                    <h4 className="card-subtitle mb-2 text-muted">Welcome to the Portfolio Tracker!</h4>
                    <div>Please login or register to view a portfolio.</div>
                </div>
            </div>)
        }

        // if (this.state.holdings.length === 0) {
        //     return (<div>No holdings have been added to this portfolio.</div>)
        // }
        else {
            return (
                <div>
                    <div className="accordion mt-3 pb-3" id="portfolioAccordian">
                        <AddInvestment showSection={this.state.showSection === "Manage"}
                            onToggle={this.handleTopToggle}
                            runUpdates={this.updateHoldings}
                            {...this.props}></AddInvestment>
                        <ManageManualInvestments showSection={this.state.showSection === "Add"}
                            onToggle={this.handleTopToggle}
                            runUpdates={this.updateHoldings}
                            {...this.props}></ManageManualInvestments>
                    </div>
                    <PortfolioSummary {...this.props}
                        sector={this.state.currentSector}
                        asset={this.state.currentAsset}
                        update={this.handleSummaryFilter}
                        holdings={this.state.holdings}>
                    </PortfolioSummary>
                    <TickerDetail {...this.props} holding={this.state.selectedSecurity}></TickerDetail>
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
                    {this.renderModal()}
                </div>)
        }
    }
}