import 'bootstrap/dist/css/bootstrap.min.css';
import {Container} from "react-bootstrap";
import React, {useState} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function APIs() {
    const [loginForm, setLoginForm] = useState({username: "", password: "", basicauthtoken: ""});

    // Handle form field changes
    const handleChange = (e) => {
        setLoginForm(
            {...loginForm, [e.target.name]: e.target.value});
    }

    // Handle form submission
    const handleLogin = (e) => {
        e.preventDefault();
        // Convert username and password to basicauthtoken
        const basicauthtoken = "Basic " + btoa(`${loginForm.username}:${loginForm.password}`);
        // basicauthtoken = "Basic " + basicauthtoken;
        console.log(basicauthtoken);

        // Send POST request to /login endpoint
        fetch('http://localhost:3001/auth', {
            method: 'GET',
            headers: {"Authorization": basicauthtoken},
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    // Update state to reflect that user is logged in
                    // setProps(data);
                    localStorage.setItem('loggedin', true);
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('username', data.username);
                    localStorage.setItem('basicauthtoken', basicauthtoken);

                    window.location.href = '/';
                } else {
                    // Show error message
                    alert(data.message);
                }
            });
    }

    return (
        <Container>
            <div>
                <div className="modal-header">
                    <h5 className="modal-title">Log in</h5>
                    <h5 className="modal-title">(Username: test / test2 / test3, password the same)</h5>
                </div>
                <div className="modal-body">
                    <Form onSubmit={handleLogin}>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter username: test"
                                name="username"
                                value={loginForm.username}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password: test"
                                name="password"
                                value={loginForm.password}
                                onChange={handleChange}
                            />
                        </Form.Group>
                            <Button variant="success" type="submit">Log In</Button>
                            <GoogleOAuthProvider clientId="858594356770-2ibbo40qjm34kfkd46tnj62i2ed2f68f.apps.googleusercontent.com">
                                <GoogleLogin
                                    onSuccess={credentialResponse => {
                                        console.log(credentialResponse);

                                        // Send POST request to /login endpoint
                                        fetch('http://localhost:3001/auth', {
                                            method: 'GET',
                                            headers: {"Authorization": credentialResponse.clientId},
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                if (data.status === 'ok') {
                                                    // Update state to reflect that user is logged in
                                                    // setProps(data);
                                                    localStorage.setItem('loggedin', true);
                                                    localStorage.setItem('userId', data.userId);
                                                    localStorage.setItem('username', data.username);
                                                    localStorage.setItem('basicauthtoken', credentialResponse.clientId);

                                                    window.location.href = '/';
                                                } else {
                                                    // Show error message
                                                    alert(data.message);
                                                }
                                            });
                                    }}
                                    onError={() => {
                                        console.log('Login Failed');
                                    }}
                                    ux_mode={"popup"}
                                />
                            </GoogleOAuthProvider>
                    </Form>
                </div>
            </div>
        </Container>
    );
}

export default APIs;
