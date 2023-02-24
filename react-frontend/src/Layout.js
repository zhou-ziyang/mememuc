import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import './Layout.css';
import {LinkContainer} from 'react-router-bootstrap'
import {Link, Outlet} from "react-router-dom";

function NavItems(props) {
    if (props.logged) {
        return (
            <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
                <LinkContainer to="/"><Nav.Link>Home</Nav.Link></LinkContainer>
                <LinkContainer to="/my_memes"><Nav.Link>My Memes</Nav.Link></LinkContainer>
                <LinkContainer to="/add_meme"><Nav.Link>Add Meme</Nav.Link></LinkContainer>
                <NavDropdown title="APIs" id="collasible-nav-dropdown">
                    <NavDropdown.Item to="">Action</NavDropdown.Item>
                    <NavDropdown.Item to="">Another action</NavDropdown.Item>
                    <NavDropdown.Item to="">Something</NavDropdown.Item>
                    <NavDropdown.Divider/>
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                </NavDropdown>
            </Nav>
            <Nav>
                <NavDropdown title={props.username} id="collasible-nav-dropdown">
                    <NavDropdown.Item as={Link} to="/account/privacy">Privacy</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/account/history">History</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/account/social">Social</NavDropdown.Item>
                    {/*<NavDropdown.Divider/>*/}
                    {/*<NavDropdown.Item as={Link} eventKey={2}>Settings</NavDropdown.Item>*/}
                </NavDropdown>
            </Nav>
            </Navbar.Collapse>
        )
    } else return (
        <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
                <LinkContainer to="/"><Nav.Link>Home</Nav.Link></LinkContainer>
                <NavDropdown title="APIs" id="collasible-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider/>
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                </NavDropdown>
            </Nav>
        </Navbar.Collapse>
    )
}

function Layout() {
    let logged = true;
    let username = "test";
    return (
        <div>
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href="/">Mememuc</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                        <NavItems logged={logged} username={username}/>
                </Container>
            </Navbar>
            <Outlet/>
        </div>
    );
}

export default Layout;
