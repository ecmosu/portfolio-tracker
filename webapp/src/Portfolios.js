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

    async updatePortfolios() {
        try {
            this.setState({ isLoaded: false });
            const response = await fetch(`./api/getList`);
            if (response.status === 200) {
                const json = await response.json();
                this.setState({
                    error: null,
                    isLoaded: true,
                    portfolios: json
                });
            }
            else { console.log('Update Portfolios - Invalid Server Response'); }
        }
        catch (err) {
            console.log(err);
        }
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