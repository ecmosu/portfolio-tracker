import React from 'react';
import TicketDetail from './TickerDetail';

export default class SecurityLookup extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            currentSecurity: '', 
            inputSecurity: '' 
        };

        this.handleSecurityChange = this.handleSecurityChange.bind(this);
        this.handleSecurityClick = this.handleSecurityClick.bind(this);
      }

    handleSecurityChange(event) {
        this.setState({ inputSecurity: event.target.value });
    }

    handleSecurityClick(event) {
        this.setState({ 
            currentSecurity: this.state.inputSecurity, 
            inputSecurity: '' 
        });
    }

    render() {
        return (<div className="card mt-3">
            <div className="card-body">
                <h1 className="card-title">Security Lookup</h1>
                <h4 className="card-subtitle mb-2 text-muted">Individual Security Detail</h4>
                
                <div className="input-group mb-3">
                    <input id="get-security-input" type="text" className="form-control" placeholder="Enter Security Ticker" aria-label="Enter Security Ticker" aria-describedby="get-security-button" 
                    value={this.state.inputSecurity} 
                    onChange={this.handleSecurityChange} />
                    <div className="input-group-append">
                        <button className="btn btn-outline-primary" type="button" id="get-security-button" 
                        onClick={this.handleSecurityClick}>Get Security</button>
                    </div>
                </div>

                <TicketDetail ticker={this.state.currentSecurity}></TicketDetail>
            </div>
        </div>
        )
    }
}