import React from 'react';

export default class Sources extends React.Component {
    render() {
        return (<div className="card mt-3">
            <div className="card-body">
                <h1 className="card-title">Sources</h1>
                <h4 className="card-subtitle mb-2 text-muted">Source Libraries and Images</h4>
                <div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">Item</th>
                                <th scope="col">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><a href="https://github.com/facebook/create-react-app">[Create React App]</a></td>
                                <td>This project was bootstrapped with [Create React App]</td>
                            </tr>
                            <tr>
                                <td><a href="https://getbootstrap.com/">Bootstrap</a></td>
                                <td>Sleek, intuitive, and powerful front-end framework for faster and easier web development</td>
                            </tr>
                            <tr>
                                <td><a href="https://reactstrap.github.io">reactstrap</a></td>
                                <td>Stateless React Components for Bootstrap 4.</td>
                            </tr>
                            <tr>
                                <td><a href="https://reacttraining.com/react-router">React Router</a></td>
                                <td>Declarative routing for React</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        )
    }
}