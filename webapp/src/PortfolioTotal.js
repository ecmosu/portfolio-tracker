import React from 'react';
import { IoIosClose, IoIosListBox, IoMdCreate } from 'react-icons/io';
import PortfolioColoredPercent from './PortfolioColoredPercent';

export default class PortfolioTotal extends React.PureComponent {
    formatter = (loc, settings) => {
        return (number => {
            return new Intl.NumberFormat(loc, settings).format(number);
        });
    }

    render() {
        const totalBasis = this.props.average_cost_basis * this.props.number_shares;
        const latestPrice = this.props.number_shares * this.props.latest_price;
        const latestClosingPrice = this.props.number_shares * this.props.latest_closing_price;
        const formatter = (loc, settings) => {
            return (number => {
                return new Intl.NumberFormat(loc, settings).format(number);
            });
        }
        
        const decimalFormater = formatter('en-US', { maximumFractionDigits: 2 });

        return (
            <tr className="portfolio-holding-row">
                <td className="holding-detail">
                    <div className="security-name">
                        {this.props.investment_name}
                    </div>
                    <div>
                        <pre>{this.props.symbol}</pre>
                    </div>
                </td>
                <td className="holding-detail">
                    <div>
                        <pre>{decimalFormater(this.props.number_shares)}</pre>
                    </div>
                </td>
                <td className="holding-detail">
                    <div>
                        <pre>{decimalFormater(this.props.average_cost_basis)}</pre>
                    </div>
                </td>
                <td className="holding-detail">
                    <div>
                        <pre>{decimalFormater(totalBasis)}</pre>
                    </div>
                </td>
                <td>
                    <div>
                        <pre>Last Updated: {new Intl.DateTimeFormat('en-US').format(new Date(this.props.date_updated))}</pre>
                    </div>
                    <div>
                        <pre>Last Closed: {new Intl.DateTimeFormat('en-US').format(new Date(this.props.price_date))}</pre>
                    </div>
                </td>
                <td>
                    <div>
                        <pre>
                            <span className="icon-wrapper"><IoMdCreate></IoMdCreate></span>
                            <span> | </span>
                            <span className="icon-wrapper"><IoIosClose></IoIosClose></span>
                        </pre>
                    </div>
                </td>
                <td>
                    <div>
                        <pre>Current: {decimalFormater(this.props.latest_price)}</pre>
                    </div>
                    <div>
                        <pre>Closing: {decimalFormater(this.props.latest_closing_price)}</pre>
                    </div>
                </td>
                <td>
                    <div>
                        <pre>{decimalFormater(latestPrice)}</pre>
                    </div>
                    <div>
                        <pre>{decimalFormater(latestClosingPrice)}</pre>
                    </div>
                </td>
                <td>
                    <div>
                        <PortfolioColoredPercent value={(latestPrice - latestClosingPrice) / latestClosingPrice}></PortfolioColoredPercent>
                    </div>
                    <div>
                    <PortfolioColoredPercent value={(latestClosingPrice - totalBasis) / totalBasis}></PortfolioColoredPercent>
                    </div>
                </td>
                <td>
                    <div>
                        <pre>
                            <span className="icon-wrapper">
                                <IoIosListBox onClick={this.onSecuritySelect} symbol={this.props.symbol}></IoIosListBox>
                            </span>
                        </pre>
                    </div>
                </td>
            </tr>
        )
    }
}
