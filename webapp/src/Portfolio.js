import React from 'react';

export default class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            portfolios: []
        };
    }

    componentDidMount() {
        //this.updatePortfolios();
        this.setState({
            error: null,
            isLoaded: true,
            portfolios: []
        });
    }

    render() {
        const { error, isLoaded } = this.state;
        const { match } = this.props;
        console.log(match);
        if (error) {
            return (<div>
                <div className="alert alert-primary" role="alert">
                    Portfolio did not load successfully!
                </div>
            </div>)
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div className="mt-3">
                    <div className="card mt-3">
                        <div className="card-body">
                            <h1 className="card-title">Portfolio Detail Here {match.params.id}</h1>
                        </div>
                    </div>
                </div>
            );
        }
    }
}