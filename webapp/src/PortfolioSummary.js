import React from 'react';
import { Row, Col } from 'reactstrap';
import { VictoryLabel, VictoryPie } from 'victory'

export default class PortfolioSummary extends React.PureComponent {
    calculateSum = (data, key, id, value) => {
        const results = data.reduce((entries, holding) => {
            const name = holding[key];
            const total = (entries[name] ? entries[name].total : 0) + holding[value];

            return {
                ...entries,
                [name]: { id: holding[id], total: total }
            };
        }, {});
        return results;
    }

    render() {
        //Calculate Sector Detail
        const sectorSum = this.calculateSum(this.props.holdings, "sector_name", "sector_id", "latest_closing_price");
        const sectors = Object.keys(sectorSum).map(key => {
            return { x: key, y: sectorSum[key].total, id: sectorSum[key].id }
        });

        const assetsSum = this.calculateSum(this.props.holdings, "investmenttype_name", "investmenttype_id", "latest_closing_price");
        const assets = Object.keys(assetsSum).map(key => {
            return { x: key, y: assetsSum[key].total, id: assetsSum[key].id }
        });

        return (<Row>
            <Col xs="6">
                <div>
                    <svg viewBox="0 0 800 400">
                        <VictoryLabel x={400} y={20} textAnchor="middle" style={{ fontSize: 30 }} text="Sector Allocations" />
                        <VictoryPie
                            origin={{y: 210}}
                            width={800} height={380}
                            events={[{
                                target: "data",
                                eventHandlers: {
                                    onClick: () => {
                                        return [
                                            {
                                                target: "data",
                                                mutation: (props) => {
                                                    this.props.update("currentSector", props.data[props.index].id);
                                                }
                                            }
                                        ];
                                    }
                                }
                            }]}
                            data={sectors}
                            style={{
                                data: {
                                    stroke: "#ffc107", strokeWidth: 3,
                                    fill: (d) => {
                                        return d.id === this.props.sector ? "#ffc107" : "#142b42";
                                    }
                                }
                            }}
                            standalone={false} />
                    </svg>
                </div>
            </Col>
            <Col xs="6">
                <div>
                    <svg viewBox="0 0 800 400">
                        <VictoryLabel x={400} y={20} textAnchor="middle" style={{ fontSize: 30 }} text="Asset Allocations" />
                        <VictoryPie
                            origin={{y: 210}}
                            width={800} height={380}
                            events={[{
                                target: "data",
                                eventHandlers: {
                                    onClick: () => {
                                        return [
                                            {
                                                target: "data",
                                                mutation: (props) => {
                                                    this.props.update("currentAsset", props.data[props.index].id);
                                                }
                                            }
                                        ];
                                    }
                                }
                            }]}
                            data={assets}
                            style={{
                                data: {
                                    stroke: "#ffc107", strokeWidth: 3,
                                    fill: (d) => {
                                        return d.id === this.props.asset ? "#ffc107" : "#142b42";
                                    }
                                }
                            }}
                            standalone={false} />
                    </svg>
                </div>
            </Col>
        </Row >)
    }
}