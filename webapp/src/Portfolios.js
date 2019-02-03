import React from 'react';

export default class Portfolios extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            portfolios: []
        };
    }

    updatePortfolios() {
        this.setState({ isLoaded: false });
        fetch(`./api/getList`)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        error: null,
                        isLoaded: true,
                        portfolios: result
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    componentDidMount() {
        this.updatePortfolios();
    }

    render() {
        const { error, isLoaded, portfolios } = this.state;
        if (error) {
            return (<div>
                <div className="alert alert-primary" role="alert">
                    Portfolios did not load successfully!
                </div>
            </div>)
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div className="mt-3">

                    <div className="card mt-3">
                        <div className="card-body">
                            <h1 className="card-title">Test: {portfolios[0]}</h1>
                        </div>
                    </div>
                </div>
            );
        }
    }
}