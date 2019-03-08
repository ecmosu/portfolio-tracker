import React from 'react';
import { IoIosClose, IoIosAdd, IoMdCreate } from 'react-icons/io';
import {
    Col, Form, FormGroup, Button, Card, CardBody, CardHeader, Collapse,
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
            addModal: { investment_id: "", basis: "", shares: "" },
            editModal: { investment_id: "", investment_name: "", sector_name: "", current_price: "", date_updated: "" },
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

    createSectorOptions() {
        const sectorOptions = this.state.sectors.map((sector) => {
            return (<option key={sector.sector_id}>{sector.sector_name}</option>)
        });
        return sectorOptions;
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

    onDeleteInvestmentConfirmClick = async () => {
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
                    await this.props.runUpdates();
                    await this.updateUserInvestments();
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

    createUserInvestmentRows = () => {
        return this.state.userInvestments.map((userInvestment) => {
            return (
                <tr key={userInvestment.investment_id}>
                    <td>{userInvestment.investment_name}</td>
                    <td>{userInvestment.sector_name}</td>
                    <td>{this.decimalFormater(userInvestment.current_price)}</td>
                    <td>{new Intl.DateTimeFormat('en-US').format(new Date(userInvestment.date_updated))}</td>
                    <td>
                        <pre>
                            <Button className="icon-button" color="primary" size="sm" onClick={this.toggleAddInvestmentModal} add-id={userInvestment.investment_id}>
                                <IoIosAdd></IoIosAdd>
                            </Button>
                            <span> | </span>
                            <Button className="icon-button" color="primary" size="sm" onClick={this.toggleEditInvestmentModal} edit-id={userInvestment.investment_id}>
                                <IoMdCreate></IoMdCreate>
                            </Button>
                            <span> | </span>
                            <Button className="icon-button" color="primary" size="sm" onClick={this.toggleDeleteInvestmentModal} delete-id={userInvestment.investment_id}>
                                <IoIosClose></IoIosClose>
                            </Button>
                        </pre>
                    </td>
                </tr>
            )
        });
    }

    toggleAddInvestmentModal = (e) => {
        if (this.state.currentModal === "AddModal") {
            this.setState({
                addModal: { investment_id: "", basis: "", shares: "" },
                currentModal: "",
            });
        }
        else {
            const toggleTarget = e.target.getAttribute("add-id");
            this.setState({
                addModal: { investment_id: toggleTarget, basis: "", shares: "" },
                currentModal: "AddModal",
            });
        }
    }

    onAddManualInvestmentSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...this.state.addModal };
            this.setState({
                addModal: { investment_id: "", basis: "", shares: "" },
                currentModal: "",
            });
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

    renderAddInvestmentModal = () => {
        return (
            <div>
                <Modal isOpen={this.state.currentModal === "AddModal"} toggle={this.toggleAddInvestmentModal}>
                    <Form onSubmit={this.onAddManualInvestmentSubmit}>
                        <ModalHeader toggle={this.toggleAddInvestmentModal}>Add Investment</ModalHeader>
                        <ModalBody>
                            <FormGroup row>
                                <Label for="modalAddShares" sm={2}>Shares</Label>
                                <Col sm={10}>
                                    <Input
                                        type="number"
                                        step="any"
                                        min="0"
                                        name="shares"
                                        id="modalAddShares"
                                        placeholder="# of Shares"
                                        stateobject="addModal"
                                        onChange={this.handleOnChange}
                                        value={this.state.addModal.shares}
                                        required />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="modalAddBasis" sm={2}>Basis</Label>
                                <Col sm={10}>
                                    <Input
                                        type="number"
                                        step="any"
                                        min="0"
                                        name="basis"
                                        id="modalAddBasis"
                                        placeholder="Stock Basis"
                                        stateobject="addModal"
                                        onChange={this.handleOnChange}
                                        value={this.state.addModal.basis}
                                        required />
                                </Col>
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button type="submit" color="primary">Create</Button>{' '}
                            <Button color="secondary" onClick={this.toggleAddInvestmentModal}>Cancel</Button>
                        </ModalFooter>
                    </Form>
                </Modal>
            </div >
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

    onEditManualInvestmentSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...this.state.editModal };
            console.log(data);
            this.setState({
                editModal: { investment_id: "", basis: "", shares: "" },
                currentModal: "",
            });
            this.props.appState.onStatusMessageChange(false, '');
            this.props.appState.onLoadingChange(true);
            const response = await fetch(`./user/investments/edit`, {
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
                    await this.updateUserInvestments();
                }
                else {
                    this.props.appState.onLoadingChange(false);
                }
                this.props.appState.onStatusMessageChange(true, json.message);
            }
            else {
                console.log('Edit User Investment - Invalid Server Response');
                this.props.appState.onLoadingChange(false);
                this.props.appState.onStatusMessageChange(true, 'The requested investment was not able to be updated.');
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    renderEditInvestmentModal = () => {
        return (
            <div>
                <Modal isOpen={this.state.currentModal === "EditModal"} toggle={this.toggleEditInvestmentModal}>
                    <Form onSubmit={this.onEditManualInvestmentSubmit}>
                        <ModalHeader toggle={this.toggleEditInvestmentModal}>Edit Investment</ModalHeader>
                        <ModalBody>
                            <FormGroup row>
                                <Label for="modalEditName" sm={2}>Investment Name</Label>
                                <Col sm={10}>
                                    <Input
                                        type="text"
                                        name="investment_name"
                                        id="modalEditName"
                                        placeholder="Investment Name"
                                        stateobject="editModal"
                                        onChange={this.handleOnChange}
                                        value={this.state.editModal.investment_name}
                                        required />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="modalEditSector" sm={2}>Sector</Label>
                                <Col sm={10}>
                                    <Input
                                        type="select"
                                        name="sector_name"
                                        id="modalEditSector"
                                        stateobject="editModal"
                                        onChange={this.handleOnChange}
                                        value={this.state.editModal.sector_name}>
                                        <option></option>
                                        {this.createSectorOptions()}
                                    </Input>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="modalEditPrice" sm={2}>Current Price</Label>
                                <Col sm={10}>
                                    <Input
                                        type="number"
                                        step="any"
                                        min="0"
                                        name="current_price"
                                        id="modalEditPrice"
                                        placeholder="Current Price"
                                        stateobject="editModal"
                                        onChange={this.handleOnChange}
                                        value={this.state.editModal.current_price}
                                        required />
                                </Col>
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button type="submit" color="primary">Edit</Button>{' '}
                            <Button color="secondary" onClick={this.toggleEditInvestmentModal}>Cancel</Button>
                        </ModalFooter>
                    </Form>
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
                        <Button color="primary" onClick={this.onDeleteInvestmentConfirmClick}>Delete</Button>{' '}
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
                return this.renderEditInvestmentModal();
            case "DeleteModal":
                return this.renderDeleteInvestmentModal();
            default:
                return null;
        }
    }

    render() {
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
                                    {this.createSectorOptions()}
                                </Input>
                            </FormGroup>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                <Label for="addManualPrice" className="mr-sm-2">Current Price</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    min="0"
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