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
                        <Link to={"./login"}>Login</Link>
                    </dt>
                    <dd className="col-sm-9">This page will allow a user to login to the service.  For demo and testing purposes, a "TestUser" account has been setup.  You can log into this account using "TestUser" as the username and password.</dd>
                </dl>

                <h4 className="card-subtitle mb-2 text-muted">Specification Locations</h4>
                <h6 className="card-subtitle mb-2 text-muted">The CS340 Project that you will submit at the end of this course should satisfy all these specifications:</h6>
                <ol>
                    <li>Your database should be pre-populated with sample data.</li>
                    <p> - Demoed throughout.  For demo and testing purposes, a "TestUser" account has been setup. You can log into this account using "TestUser" as the username and password (or create your own account).</p>
                    <li>Your database should have at least 4 entities and at least 4 relationships, one of which must be a many-to-many relationship.</li>
                    <p> - Please reference the documentation for entities and relationships.  6 entities have been created within this database with a many-to-many relationship existing between portfolio and investments.</p>
                    <li>It should be possible to INSERT entries into every table individually.</li>
                    <p> - All tables are utilized and have entries being inserted other than the "InvestmentTypes" and "Sectors" table.  See discussion around these in the submitted PDF.  This exception was approved by Samarendra Hedaoo via Piazza.</p>
                    <li>Every table should be used in at least one SELECT query. For the SELECT queries, it is fine to just display the content of the tables, but your website needs to also have the ability to search using text or filter using a dynamically populated list of properties. This search/filter functionality should be present for at least one entity. It is generally not appropriate to have only a single query that joins all tables and displays them.</li>
                    <p> - The portfolios table is being utilized in the "Portfolios" page.  There is also a search feature on the "Portfolios" page to search the database for a portfolio name.</p>
                    <p> - The remaining tables are being used in various SELECT statements used to populate holdings detail on the "Portfolio" page.  There are two included pie charts on this page which search/filter for specific investment type and sector combinations.</p>
                    <li>You need to include one DELETE and one UPDATE function in your website, for any one of the entities. In addition, it should be possible to add and remove things from at least one many-to-many relationship and it should be possible to add things to all relationships.</li>
                    <p> - DELETE statements are demoed on the "Portfolios" page to delete a specific portfolio and all underlying holdings, and on the "Portfolio" page to delete specific holdings and manual investments.</p>
                    <p> - UPDATE statements are demoed on the "Portfolio" page to update detail around specific holdings and to update manual investment detail.</p>
                    <li>In a many-to-one relationship (like bsg_people to bsg_planets), you should be able to set the homeworld value to NULL (such as on a person in bsg_people). That removes the relationship.</li>
                    <p> - If you create or update a manual investment and set the sector to the blank option, this will set the sector to NULL in to associated database entry.  Selecting an option will set the applicable id value.</p>
                    <li>In a many-to-many relationship, to remove a relationship one would need to delete a row from a table. That would be the case with bsg_people and bsg_certifications. One should be able to add and remove certifications for a person without deleting either bsg_people rows or bsg_certification rows.</li>
                    <p> - An entry is made in the holdings table when a new portfolio-investment entry is made.  This maintains a many-to-many relationship between portfolios and investments.  Adding/removing a relationship between portfolios and investments is accomplisted by adding/removing a record from the holdings table.  This is accomplished without deleting rows from portfolios or investments.</p>
                </ol>
            </div>
        </div>
        )
    }
}