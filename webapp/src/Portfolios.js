import React from 'react';
import { Table } from 'reactstrap';
import { Link } from 'react-router-dom'

export default class Portfolios extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            portfolios: []
        };
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
                            {portfolio_id: 1, portfolio_name: "401K"},
                            {portfolio_id: 2, portfolio_name: "Roth"},
                            {portfolio_id: 3, portfolio_name: "Taxable"}
                        ]
                    });
        }
        catch (err) {
            console.log(err);
        }
        this.props.appState.onLoadingChange(false);
    }

    componentDidMount() {
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
                <Link className="btn btn-primary btn-sm active mb-3" role="button" to={"#"}>Add Portfolio</Link>
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
                </div>)
        }
    }
}