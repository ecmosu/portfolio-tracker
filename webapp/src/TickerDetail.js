import React from 'react';

export default class TickerDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            isLoaded: false,
            quoteResult: []
        };
    }

    updateTickerResults() {
        if (this.props.holding.symbol !== "") {
            this.props.appState.onLoadingChange(true);
            this.setState({ isLoaded: false });
            fetch(`https://api.iextrading.com/1.0/stock/${this.props.holding.symbol}/quote`)
                .then(res => res.json())
                .then(
                    (result) => {
                        this.setState({
                            isLoaded: true,
                            quoteResult: result
                        });
                        this.props.appState.onLoadingChange(false);
                    },
                    (error) => {
                        this.props.appState.onLoadingChange(false);
                    }
                )
        }
    }

    formatter(loc, settings) {
        return (number => {
            return new Intl.NumberFormat(loc, settings).format(number);
        });
    }

    closeDetail = () => {
        this.setState({show: false});
    }

    componentDidMount() {
        this.updateTickerResults();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.holding.symbol !== this.props.holding.symbol) {
            this.setState({show: true});
            this.updateTickerResults();
        }
    }

    render() {
        const { quoteResult } = this.state;
        const decimalFormater = this.formatter('en-US', { maximumFractionDigits: 2 });
        const percentFormater = this.formatter('en-US', { style: "percent", maximumFractionDigits: 2 });
        const distanceFromHigh = (quoteResult.latestPrice - quoteResult.week52High);
        const percentChange = (distanceFromHigh / quoteResult.week52High);
        if (this.props.holding.symbol === "" || !this.state.show || !this.state.isLoaded) { return null }
        else {
            return (
                <div>
                    <div className="card">
                        <div className="card-body">
                            <h1 className="card-title">
                                {quoteResult.companyName}
                                <button type="button" className="close" onClick={this.closeDetail} aria-label="Close"><span aria-hidden="true">×</span></button>
                            </h1>
                            <h4 className="card-subtitle mb-2 text-muted">Security Detail</h4>
                            <dl className="row">
                                <dt className="col-3">
                                    Symbol
                        </dt>
                                <dd className="col-3">
                                    {quoteResult.symbol}
                                </dd>
                                <dt className="col-3">
                                    As Of
                            </dt>
                                <dd className="col-3">
                                    {quoteResult.latestTime}
                                </dd>
                            </dl>
                            <dl className="row">
                                <dt className="col-3">
                                    Latest Price
                        </dt>
                                <dd className="col-3">
                                    {quoteResult.latestPrice}
                                </dd>
                                <dt className="col-3">
                                    52 Week High
                            </dt>
                                <dd className="col-3">
                                    {quoteResult.week52High}
                                </dd>
                            </dl>
                            <dl className="row">
                                <dt className="col-3">
                                    Distance From High
                        </dt>
                                <dd className="col-3">
                                    {decimalFormater(distanceFromHigh)}
                                </dd>
                                <dt className="col-3">
                                    % Change
                            </dt>
                                <dd className="col-3">
                                    {percentFormater(percentChange)}
                                </dd>
                            </dl>
                            <dl className="row">
                                <dt className="col-3">
                                    Investment Type
                        </dt>
                                <dd className="col-3">
                                    {this.props.holding.investmenttype_name}
                                </dd>
                                <dt className="col-3">
                                    Sector
                            </dt>
                                <dd className="col-3">
                                    {this.props.holding.sector_name}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            );
        }
    }
}