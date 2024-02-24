import React, {useEffect} from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {LinkContainer} from 'react-router-bootstrap';
import {Link, Outlet} from "react-router-dom";
import './Layout.css';

function NavItems() {
    const [props, setProps] = React.useState({});
    useEffect(() => {
        const loggedin = localStorage.getItem('loggedin');
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        if (loggedin && userId && username) {
            setProps({loggedin:loggedin, userId:userId, username:username});
        }
    }, []);

    const [lastPath, setLastPath] = React.useState('');

    const handleLogout = () => {
        // localStorage.removeItem('loggedin');
        // localStorage.removeItem('userId');
        // localStorage.removeItem('username');
        localStorage.setItem('loggedin', false);
        localStorage.setItem('userId', '');
        localStorage.setItem('username', '');
        localStorage.setItem('basicauthtoken', '');
        // window.location.reload();
        window.location.href = '/';
    }

    if (props.loggedin) {
        return (
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto">
                    <LinkContainer to="/"><Nav.Link>Home</Nav.Link></LinkContainer>
                    <LinkContainer to="/add_meme"><Nav.Link>Add Meme</Nav.Link></LinkContainer>
                    <LinkContainer to="/apis"><Nav.Link>APIs</Nav.Link></LinkContainer>
                </Nav>
                <Nav>
                    <NavDropdown title={props.username} id="collasible-nav-dropdown">
                        <NavDropdown.Item as={Link} to="/my_memes">My Memes</NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="drafts">Drafts</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item as={Link} onClick={handleLogout}>Sign out</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Navbar.Collapse>
        )
    } else return (
        <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
                <LinkContainer to="/"><Nav.Link>Home</Nav.Link></LinkContainer>
                <LinkContainer to="/apis"><Nav.Link>APIs</Nav.Link></LinkContainer>
            </Nav>
            <Nav>
                <LinkContainer to="/login"><Nav.Link>Log In</Nav.Link></LinkContainer>
            </Nav>
        </Navbar.Collapse>
    )
}

function Layout() {
    return (
        <div>
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href="/">MEMEMUC</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                    <NavItems/>
                </Container>
            </Navbar>
            <Outlet/>
        </div>
    );
}

export default Layout;
