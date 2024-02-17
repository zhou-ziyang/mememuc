import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Card, Col, Container, Row, Stack} from "react-bootstrap";
import React, {useEffect, useState} from "react";

function MemeItem(props) {
    const path = "http://localhost:3001/" + props.file.file.slice(7);
    const [vote, setVote] = useState(null);

    // Fetching the past vote from "/vote"
    useEffect(() => {
        // console.log(`http://localhost:3001/memes/${props.file._id}/vote`);
        fetch(`http://localhost:3001/memes/${props.file._id}/vote`, {headers: {"Authorization": "Basic dGVzdDp0ZXN0"}})
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setVote(data.type)
                }
            })
    }, [props.file._id]);

    // Function to handle voting up
    const handleVote = (type = 1) => {
        const url = type === 1 ? 'http://localhost:3001/memes/vote_up' : 'http://localhost:3001/memes/vote_down';
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Basic dGVzdDp0ZXN0"
            },
            body: JSON.stringify({
                mid: props.file._id
            }),
        })
            .then(response => {
                if (response.ok) {
                    console.log(type === 1 ? 'Vote up successful' : 'Vote down successful');
                    setVote(type);
                    return response.json();
                }
            })
            .then(data => {
                console.log(data.type === 1 ? 'Voted up' : 'Voted down');
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    return (
        <Card>
            <Card.Body>
                <Row>
                    <Col xs={3}>
                        <img src={path} width="100%" alt=""/>
                    </Col>
                    <Col>
                        <Card.Title><h2>{props.file.title}</h2></Card.Title>
                        <Card.Text>
                            {props.file.description}
                            <br/>
                            Created by {props.file.author} at {props.file.date}
                        </Card.Text>
                        {(localStorage.getItem('loggedin') === 'true') && (
                            <>
                                {/*<Button variant="primary">Edit</Button>*/}
                                {/*<Button variant="danger">Delete</Button>*/}
                                <Button variant={vote === 1 ? "success" : "outline-success"} onClick={() => handleVote(1)}>Vote Up</Button>
                                <Button variant={vote === 0 ? "danger" : "outline-danger"} onClick={() => handleVote(0)}>Vote Down</Button>
                            </>
                        )}
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    )
}

function MemeView() {
    const [state, setState] = React.useState(null);
    useEffect(() => {
        fetch("http://localhost:3001/memes", {headers: {"Authorization": "Basic dGVzdDp0ZXN0"}})
            .then(response => response.json())
            .then(data => setState(data));
    }, []);
    if (state === null) {
        return <div>Loading...</div>;
    } else {
        return (
            <Stack direction="vertical" gap={3}>
                {state.map((meme, index) => (
                    <MemeItem key={index} file={meme}/>
                ))}
            </Stack>
        );
    }
}

function App() {
    return (
        <Container>
            <MemeView/>
        </Container>
    );
}

export default App;