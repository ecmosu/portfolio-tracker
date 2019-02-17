import React from 'react';
import { IoIosTrendingUp, IoIosTrendingDown } from 'react-icons/io';

export default class PortfolioColoredPercent extends React.PureComponent {
    render() {
        const formatter = (loc, settings) => {
            return (number => {
                return new Intl.NumberFormat(loc, settings).format(number);
            });
        }

        const percentFormater = formatter('en-US', { style: "percent", maximumFractionDigits: 2 });

        if (this.props.value < 0) {
            return (<pre style={{ color: 'red' }}>{percentFormater(this.props.value)} <IoIosTrendingDown></IoIosTrendingDown></pre>)
        }
        else if (this.props.value > 0) {
            return (<pre style={{ color: 'green' }}>{percentFormater(this.props.value)} <IoIosTrendingUp></IoIosTrendingUp></pre>)
        }
        else {
            return (<pre style={{ color: 'black' }}>{percentFormater(this.props.value)}</pre>)
        }
    }
}