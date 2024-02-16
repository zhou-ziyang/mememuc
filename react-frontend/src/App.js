import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Card, Col, Container, Row, Stack} from "react-bootstrap";
import React, {useEffect} from "react";

function MemeItem(props) {
    const path = "http://localhost:3001/" + props.file.file.slice(7)
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
                                <Button variant="success">Vote Up</Button>
                                <Button variant="danger">Vote Down</Button>
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