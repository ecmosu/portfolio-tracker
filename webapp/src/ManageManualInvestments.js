import React from 'react';
import { IoIosClose, IoIosAdd, IoMdCreate } from 'react-icons/io';
import {
    Form, FormGroup, Button, Card, CardBody, CardHeader, Collapse,
    Input, Label, Table, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';

export default class ManageManualInvestments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sectors: [],
            userInvestments: [],
            newManualInvestment: { name: "", price: "", sector: "" },
            currentModal: "",
            addModal: {investment_id: "", basis: "", shares: ""},
            deleteModal: { id: "" }
        }

        this.decimalFormater = this.formatter('en-US', { maximumFractionDigits: 2 });
    }

    componentDidMount() {
        this.updateSectors();
        this.updateUserInvestments();
    }

    formatter = (loc, settings) => {
        return (number => {
            return new Intl.NumberFormat(loc, settings).format(number);
        });
    }

    handleOnChange = (e) => {
        const { value, name } = e.target
        const stateobject = e.target.getAttribute("stateobject");
        if (stateobject) {
            this.setState(prevState => ({
                [stateobject]: {
                    ...prevState[stateobject],
                    [name]: value
                }
            }));
        }
    }

    onToggle = (e) => {
        const toggleTarget = e.target.getAttribute("toggle-target");
        this.props.onToggle(toggleTarget);
    }

    updateSectors = async () => {
        try {
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            const response = await fetch(`./sectors`);
            if (response.status === 200) {
                const json = await response.json();
                this.setState({
                    sectors: json.sectors
                });
            }
            else { console.log('Update Sectors - Invalid Server Response'); }
        }
        catch (err) {
            console.log(err);
        }
        this.props.appState.onLoadingChange(false);
    }

    updateUserInvestments = async () => {
        try {
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            const response = await fetch(`./user/investments`);
            if (response.status === 200) {
                const json = await response.json();
                this.setState({
                    userInvestments: json.userInvestments
                });
            }
            else { console.log('Update User Investments - Invalid Server Response'); }
        }
        catch (err) {
            console.log(err);
        }
        this.props.appState.onLoadingChange(false);
    }

    onCreateManualInvestmentClick = async (e) => {
        e.preventDefault();
        try {
            const data = this.state['newManualInvestment'];
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            const response = await fetch(`./user/investments/add`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                const json = await response.json();
                if (json.success) {
                    this.setState({ newManualInvestment: { name: "", price: "", sector: "" } });
                    await this.updateUserInvestments();
                    this.setState({ showSection: null });
                }
                else {
                    this.props.appState.onLoadingChange(false);
                }
                this.props.appState.onStatusMessageChange(true, json.message);
            }
            else {
                console.log('Add Manual Investment - Invalid Server Response');
                this.props.appState.onLoadingChange(false);
                this.props.appState.onStatusMessageChange(true, 'The requested manual investment was not able to be added.');
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    onDeletePortfolioConfirmClick = async () => {
        try {
            const investmentId = this.state.deleteModal.id;
            this.setState({
                deleteModal: { id: "" },
                currentModal: "",
            });
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            const response = await fetch(`./user/investments/${investmentId}`, {
                method: "DELETE"
            });
            if (response.status === 200) {
                const json = await response.json();
                if (json.success) {
                    await this.updateUserInvestments()
                }
                else {
                    this.props.appState.onLoadingChange(false);
                }
                this.props.appState.onStatusMessageChange(true, json.message);
            }
            else {
                this.props.appState.onLoadingChange(false);
                this.props.appState.onStatusMessageChange(true, 'The requested delete action was not able to be processed.');
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    onAddManualInvestmentClick = async (e) => {
        try {
            const data = { investment_id: e.currentTarget.getAttribute("id"), shares: 50, basis: 100 };
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            const response = await fetch(`./portfolios/${this.props.match.params.id}/addholding`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                const json = await response.json();
                if (json.success) {
                    await this.props.runUpdates();
                }
                else {
                    this.props.appState.onLoadingChange(false);
                }
                this.props.appState.onStatusMessageChange(true, json.message);
            }
            else {
                console.log('Add Holding - Invalid Server Response');
                this.props.appState.onLoadingChange(false);
                this.props.appState.onStatusMessageChange(true, 'The requested investment was not able to be added.');
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    createUserInvestmentRows = () => {
        return this.state.userInvestments.map((userInvestment) => {
            return (
                <tr key={userInvestment.investment_id}>
                    <td>{userInvestment.investment_name}</td>
                    <td>{userInvestment.sector_name}</td>
                    <td>{this.decimalFormater(userInvestment.current_price)}</td>
                    <td>{new Intl.DateTimeFormat('en-US').format(new Date(userInvestment.date_updated))}</td>
                    <td>
                        <span className="icon-wrapper">
                            <IoIosAdd onClick={this.toggleAddInvestmentModal} add-id={userInvestment.investment_id}></IoIosAdd>
                        </span>
                        <span> | </span>
                        <span className="icon-wrapper">
                            <IoMdCreate onClick={this.toggleEditInvestmentModal} edit-id={userInvestment.investment_id}></IoMdCreate>
                        </span>
                        <span> | </span>
                        <span className="icon-wrapper">
                            <IoIosClose onClick={this.toggleDeleteInvestmentModal} delete-id={userInvestment.investment_id}></IoIosClose>
                        </span>
                    </td>
                </tr>
            )
        });
    }

    toggleAddInvestmentModal = (e) => {
        if (this.state.currentModal === "AddModal") {
            this.setState({
                addModal: {investment_id: "", basis: "", shares: ""},
                currentModal: "",
            });
        }
        else {
            const toggleTarget = e.target.getAttribute("add-id");
                this.setState({
                    addModal: {investment_id: toggleTarget, basis: "", shares: ""},
                    currentModal: "AddModal",
                });
        }
        //this.onAddManualInvestmentClick
    }

    renderAddInvestmentModal = () => {
        return (
            <div>
                <Modal isOpen={this.state.currentModal === "AddModal"} toggle={this.toggleAddInvestmentModal}>
                    <ModalHeader toggle={this.toggleAddInvestmentModal}>Add Investment</ModalHeader>
                    <ModalBody>
                        {this.state.addModal.sector_name}
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggleAddInvestmentModal}>Create</Button>{' '}
                        <Button color="secondary" onClick={this.toggleAddInvestmentModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    toggleEditInvestmentModal = (e) => {
        if (this.state.currentModal === "EditModal") {
            this.setState({
                editModal: { investment_id: "", investment_name: "", sector_name: "", current_price: "", date_updated: "" },
                currentModal: "",
            });
        }
        else {
            const toggleTarget = e.target.getAttribute("edit-id");
            const targetHolding = this.state.userInvestments.findIndex(item => Number(item.investment_id) === Number(toggleTarget));
            if (targetHolding > -1) {
                this.setState({
                    editModal: { ...this.state.userInvestments[targetHolding] },
                    currentModal: "EditModal",
                });
            }
        }
    }

    renderEditInvestmentModal = () => {
        return (
            <div>
                <Modal isOpen={this.state.currentModal === "EditModal"} toggle={this.toggleEditInvestmentModal}>
                    <ModalHeader toggle={this.toggleEditInvestmentModal}>Edit Investment</ModalHeader>
                    <ModalBody>
                    {this.state.editModal.sector_name}
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggleEditInvestmentModal}>Edit</Button>{' '}
                        <Button color="secondary" onClick={this.toggleEditInvestmentModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    toggleDeleteInvestmentModal = (e) => {
        if (this.state.currentModal === "DeleteModal") {
            this.setState({
                deleteModal: { id: "" },
                currentModal: "",
            });
        }
        else {
            const toggleTarget = e.target.getAttribute("delete-id");
            this.setState(prevState => ({
                deleteModal: { id: toggleTarget },
                currentModal: "DeleteModal",
            }));
        }
    }

    renderDeleteInvestmentModal = () => {
        return (
            <div>
                <Modal isOpen={this.state.currentModal === "DeleteModal"} toggle={this.toggleDeleteInvestmentModal}>
                    <ModalHeader toggle={this.toggleDeleteInvestmentModal}>Delete Investment</ModalHeader>
                    <ModalBody>
                        Are you sure you would like to delete this investment?  It will be removed from all portfolios in which it currently exists.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.onDeletePortfolioConfirmClick}>Delete</Button>{' '}
                        <Button color="secondary" onClick={this.toggleDeleteInvestmentModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    renderModal = () => {
        switch (this.state.currentModal) {
            case "AddModal":
                return this.renderAddInvestmentModal();
            case "EditModal":
                return this.rednderEditInvestmentModal();
            case "DeleteModal":
                return this.renderDeleteInvestmentModal();
            default:
                return null;
        }
    }

    render() {
        const sectorOptions = this.state.sectors.map((sector) => {
            return (<option key={sector.sector_id}>{sector.sector_name}</option>)
        });
        return (<Card>
            <CardHeader>
                <h2 className="mb-0">
                    <span onClick={this.onToggle} toggle-target="Add" className="btn btn-link" style={{ width: '80%', textAlign: 'left' }}>
                        Manage Manual Investments
                    </span>
                </h2>
            </CardHeader>
            <Collapse isOpen={this.props.showSection}>
                <CardBody>
                    <div>
                        <Form inline onSubmit={this.onCreateManualInvestmentClick}>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                <Label for="addManualName" className="mr-sm-2">Investment Name</Label>
                                <Input type="text"
                                    name="name"
                                    id="addManualName"
                                    placeholder="Investment Name"
                                    stateobject="newManualInvestment"
                                    onChange={this.handleOnChange}
                                    value={this.state.newManualInvestment.name}
                                    required />
                            </FormGroup>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                <Label for="addManualPrice" className="mr-sm-2">Sector</Label>
                                <Input
                                    type="select"
                                    name="sector"
                                    id="addManualSector"
                                    stateobject="newManualInvestment"

                                    onChange={this.handleOnChange}
                                    value={this.state.newManualInvestment.sector}>
                                    <option></option>
                                    {sectorOptions}
                                </Input>
                            </FormGroup>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                <Label for="addManualPrice" className="mr-sm-2">Current Price</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    name="price"
                                    id="addManualPrice"
                                    placeholder="Current Price"
                                    stateobject="newManualInvestment"
                                    onChange={this.handleOnChange}
                                    value={this.state.newManualInvestment.price}
                                    required />
                            </FormGroup>
                            <Button color="primary">Submit</Button>
                        </Form>
                        {/* <Button color="primary" onClick={this.toggleManualInvestmentModal}>Add New Manual Investment</Button> */}
                        <div className={"mt-2"}>
                            <pre>Manual Investment Actions: <IoIosAdd></IoIosAdd> - Add To Portfolio || <IoMdCreate></IoMdCreate> - Edit Manual Investment || <IoIosClose></IoIosClose> - Delete (From All Portfolios)</pre>
                        </div>
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Sector</th>
                                    <th>Current Price</th>
                                    <th>Date Updated</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.createUserInvestmentRows()}
                            </tbody>
                        </Table>
                    </div>
                </CardBody>
            </Collapse>
            {this.renderModal()}
        </Card>);
    }
}