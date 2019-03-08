import React from 'react';
import {
    Button, Card, CardBody, CardHeader, Collapse,
    Form, FormGroup, Input, Label, Table} from 'reactstrap';
import { Link } from 'react-router-dom'
import { IoIosClose, IoIosListBox } from 'react-icons/io';

export default class Portfolios extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showSection: "Manage",
            portfolioName: "",
            portfolioSearch: "",
            portfolios: []
        };
    }

    searchTimeout = null;

    toggle = (e) => {
        const toggleTarget = e.target.getAttribute("toggle-target")
        if (this.state.showSection === toggleTarget) {
            this.setState({ showSection: null });
        }
        else {
            this.setState({ showSection: toggleTarget });
        }
    }

    updatePortfolios = async () => {
        try {
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            const response = await fetch(`./portfolios?search=` + this.state.portfolioSearch);
            if (response.status === 200) {
                const json = await response.json();
                this.setState({
                    portfolios: json.portfolios
                });
            }
            else { console.log('Update Portfolios - Invalid Server Response'); }
        }
        catch (err) {
            console.log(err);
        }
        this.props.appState.onLoadingChange(false);
    }

    deletePortfolio = async (e) => {
        try {
            const portfolioId = e.currentTarget.getAttribute("data-id");
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            const response = await fetch(`./portfolios/${portfolioId}`, {
                method: "DELETE"
            });
            if (response.status === 200) {
                this.props.appState.onStatusMessageChange(true, 'Portfolio Deleted Successfully');
            }
            else { console.log('Delete Portfolio - Invalid Server Response'); }
        }
        catch (err) {
            console.log(err);
        }
        await this.updatePortfolios();
    }

    handleOnChange = (e) => {
        const { value, name } = e.target
        this.setState({ [name]: value })
    }

    addPortfolio = async (e) => {
        e.preventDefault();
        try {
            const data = { name: this.state.portfolioName };
            console.log(data);
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            const response = await fetch(`./portfolios/add`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                console.log(response);
                this.setState({ portfolioName: "" });
                await this.updatePortfolios();
                this.setState({ showSection: "Manage" });
            }
            else {
                console.log('Add Portfolio - Invalid Server Response');
                this.props.appState.onLoadingChange(false);
                this.props.appState.onStatusMessageChange(true, 'The requested portfolio was not able to be added.');
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    updateSearch = (e) => {
        this.setState({ portfolioSearch: e.target.value });
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.updatePortfolios();
        }, 1000);
    }

    componentDidMount() {
        this.props.appState.onViewChange(false);
        this.updatePortfolios();
    }

    createPortfolioRows = (portfolios) => {
        return portfolios.map((portfolio) => {
            return (
                <tr key={portfolio.portfolio_id}>
                    <td>{portfolio.portfolio_name}</td>
                    <td>
                        <Link className="btn btn-sm btn-primary" to={"/portfolios/" + portfolio.portfolio_id}><IoIosListBox></IoIosListBox></Link>
                        <span> |  </span>
                        <Button color="primary" size="sm" onClick={this.deletePortfolio} data-id={portfolio.portfolio_id}><IoIosClose></IoIosClose></Button>
                    </td>
                </tr>
            )
        });
    }

    renderNoPortfolios = () => {
        return (<div>No portfolios found.</div>)
    }

    renderCreatePortfolioSection = () => {
        return (<Card>
            <CardHeader>
                <h2 className="mb-0">
                    <span onClick={this.toggle} toggle-target="Create" className="btn btn-link" style={{ width: '100%', textAlign: 'left' }}>
                        Create New Portfolio
                </span>
                </h2>
            </CardHeader>
            <Collapse isOpen={this.state.showSection === "Create"}>
                <CardBody>
                    <div>
                        <Form inline onSubmit={this.addPortfolio}>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                <Label for="exampleEmail" className="mr-sm-2">Portfolio Name</Label>
                                <Input required type="text"
                                    name="portfolioName"
                                    id="portfolio-name"
                                    onChange={this.handleOnChange}
                                    value={this.state.portfolioName}
                                    placeholder="Portfolio Name" />
                            </FormGroup>
                            <Button color="primary">Create Portfolio</Button>
                        </Form>
                    </div>
                </CardBody>
            </Collapse>
        </Card>)
    }

    renderManagePortfoliosSection = () => {
        return (<Card>
            <CardHeader>
                <h2 className="mb-0">
                    <span onClick={this.toggle} toggle-target="Manage" className="btn btn-link" style={{ width: '100%', textAlign: 'left' }}>
                        Manage Portfolios
                </span>
                </h2>
            </CardHeader>
            <Collapse isOpen={this.state.showSection === "Manage"}>
                <CardBody>
                    <div className="mb-2">
                        <Form inline>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                <Label for="exampleEmail" className="mr-sm-2">Portfolio Search</Label>
                                <Input required type="text"
                                    name="portfolioSearch"
                                    id="portfolio-search"
                                    onChange={this.updateSearch}
                                    value={this.state.portfolioSearch}
                                    placeholder="Portfolio Name" />
                            </FormGroup>
                        </Form>
                    </div>
                    <div>
                        <pre>Actions: <IoIosListBox></IoIosListBox> - Select || <IoIosClose></IoIosClose> - Delete</pre>
                    </div>
                    {this.renderPortfoliosTable()}
                </CardBody>
            </Collapse>
        </Card>)
    }

    renderPortfoliosTable = () => {
        const { portfolios } = this.state;
        if (portfolios.length === 0) {
            return this.renderNoPortfolios();
        }
        else {
            const portfolioRows = this.createPortfolioRows(this.state.portfolios);
            return (<Table hover>
                <thead>
                    <tr>
                        <th>Portfolio</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {portfolioRows}
                </tbody>
            </Table>);
        }
    }

    render() {
        return (<div>
            <div className="accordion" id="portfolioAccordian">
                {this.renderCreatePortfolioSection()}
                {this.renderManagePortfoliosSection()}
            </div>
        </div >)
    }
}   