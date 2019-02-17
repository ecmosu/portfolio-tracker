import React from 'react';
import {
    Button, Card, CardBody, CardHeader, Collapse,
    Form, FormGroup, Input, Label, Table
} from 'reactstrap';
import { Link } from 'react-router-dom'
import { IoIosClose, IoIosListBox } from 'react-icons/io';

export default class Portfolios extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showSection: true,
            portfolioName: "",
            portfolioSearch: "",
            portfolios: []
        };
    }

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
            const response = await fetch(`./portfolios`);
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

    updateSearch(e) {
        this.setState({portfolioSearch: e.target.value.substr(0, 20)});
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

                        <Link to={"/portfolios/" + portfolio.portfolio_id}><IoIosListBox></IoIosListBox></Link>
                        <span> |  </span>
                        <span className="icon-wrapper" onClick={this.deletePortfolio} data-id={portfolio.portfolio_id}><IoIosClose></IoIosClose></span>
                    </td>
                </tr>
            )
        });
    }

    renderNoPortfolios = () => {
        return (<div>No Portfolios have been created.</div>)
    }

    renderCreatePortfolioSection = () => {
        return(<Card>
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

    renderManagePortfoliosSection = (portfolios) => {
        let filteredPortfolios = this.state.portfolios.filter(
            (portfolio) => {
                return portfolio.portfolio_name.toLowerCase().indexOf(this.state.portfolioSearch) !== -1;
            }
        );
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
                    <div>
                    <Form inline>
                        <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                            <Label for="exampleEmail" className="mr-sm-2">Portfolio Search</Label>
                                <Input required type="text"
                                    name="portfolioSearch"
                                    id="portfolio-search"
                                    onChange={this.updateSearch.bind(this)}
                                    value={this.state.portfolioSearch}
                                    placeholder="Portfolio Name" />
                        </FormGroup>
                        <Button color="primary">Search</Button>
                    </Form>
                    </div>
                    <Table hover>
                        <thead>
                            <tr>
                                <th>Portfolio</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPortfolios.map((portfolio) => {
                                return (
                                    <tr key={portfolio.portfolio_id}>
                                    <td>{portfolio.portfolio_name}</td>
                                    <td>
                
                                        <Link to={"/portfolios/" + portfolio.portfolio_id}><IoIosListBox></IoIosListBox></Link>
                                        <span> |  </span>
                                        <span className="icon-wrapper" onClick={this.deletePortfolio} data-id={portfolio.portfolio_id}><IoIosClose></IoIosClose></span>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </CardBody>
            </Collapse>
        </Card>)
    }

    render() {
        const { portfolios } = this.state;
        if (portfolios.length === 0) {
            return this.renderNoPortfolios();
        }
        else {
            return (<div>
                <div className="accordion" id="portfolioAccordian">
                    {this.renderCreatePortfolioSection()}
                    {this.renderManagePortfoliosSection(portfolios)}
                </div>
            </div >)
        }
    }
}   