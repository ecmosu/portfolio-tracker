import React from 'react';
import { Button, Table } from 'reactstrap';
import { Link } from 'react-router-dom';
import TickerDetail from './TickerDetail';

export default class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.onSecuritySelect = this.onSecuritySelect.bind(this);
        this.state = {
            selectedSecurity: "",
            holdings: []
        };
    }

    componentDidMount() {
        //this.updatePortfolios();
        this.setState({
            holdings: [
                { investment_id: 1, investment_name: "DOW", symbol: "DIA", latest_closing_price: 253.83, average_cost_basis: 88, number_shares: 100, date_updated: '02/06/2019' },
                { investment_id: 2, investment_name: "S&P 500", symbol: "SPY", latest_closing_price: 272.795, average_cost_basis: 199, number_shares: 200, date_updated: '02/06/2019' }
            ]
        });
    }

    onSecuritySelect(e) {
        const symbol = e.target.getAttribute("symbol");
        this.setState({
            selectedSecurity: symbol
        })
    }

    render() {
        const { holdings } = this.state;
        const holdingsRows = holdings.map((holding) => {
            return (
                <tr key={holding.investment_id}>
                    <td>{holding.symbol}</td>
                    <td>{holding.number_shares}</td>
                    <td>{holding.latest_closing_price}</td>
                    <td>{holding.average_cost_basis}</td>
                    <td>{holding.date_updated}</td>
                    <td>
                        <Button color="primary" size="sm" onClick={this.onSecuritySelect} symbol={holding.symbol}>Detail</Button>
                        <span> | </span>
                        <Button color="primary" size="sm">Delete</Button>
                    </td>
                </tr>
            )
        })
        if (holdingsRows.length === 0) {
            return (<div>No holdings have been added to this portfolio.</div>)
        }
        else {
            return (
                <div>
                    <TickerDetail {...this.props} ticker={this.state.selectedSecurity}></TickerDetail>
                    <Link className="btn btn-primary btn-sm active mb-3 mt-3" role="button" to={"#"}>Add Holding</Link>
                    <Table hover>
                        <thead>
                            <tr>
                                <th>Ticker</th>
                                <th>Shares</th>
                                <th>Latest Closing</th>
                                <th>Basis</th>
                                <th>Date Updated</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdingsRows}
                        </tbody>
                    </Table>
                </div>)
        }
    }
}