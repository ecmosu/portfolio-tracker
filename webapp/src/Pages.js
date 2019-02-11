import React from 'react';
import { Link } from 'react-router-dom';

export default class Pages extends React.Component {

    componentDidMount() {
        this.props.appState.onViewChange(false);
    }

    render() {
        return (<div className="card mt-3">
            <div className="card-body">
                <h1 className="card-title">Portfolio Tracker</h1>
                <h4 className="card-subtitle mb-2 text-muted">Page Links</h4>
                <dl className="row">
                    <dt className="col-sm-3">
                        <Link to={"./"}>Portfolios</Link>
                    </dt>
                    <dd className="col-sm-9">A list of all portfolios for a user.  This page will list an individual's created portfolios, and allow a user to add new portfolios.</dd>
                    <dt className="col-sm-3">
                        <Link to={"./portfolios/1"}>Portfolio</Link>
                    </dt>
                    <dd className="col-sm-9">An example listing of portfolio holdings for a user.  This page will list an given portfolio's holdings, and allow a user to add and remove individual investments.  Users can also see detail about a given fund (including sector and investment type) by clicking the 'Detail' button for a holding.</dd>
                    <dt className="col-sm-3">
                        <Link to={"./signup"}>Sign Up</Link>
                    </dt>
                    <dd className="col-sm-9">This page will allow a user to sign-up for the service.  In the final version of this site, a user will be required to sign up to access the portfolios and portfolio sections detail above.</dd>
                    <dt className="col-sm-3">
                        <Link to={"./signup"}>Login</Link>
                    </dt>
                    <dd className="col-sm-9">This page will allow a user to login to the service.</dd>
                </dl>
            </div>
        </div>
        )
    }
}