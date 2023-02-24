import 'bootstrap/dist/css/bootstrap.min.css';
import {Card, Col, Container, Row, Stack} from "react-bootstrap";
import React, {useEffect} from "react";


function MemeItem(props) {
    // console.log(props.file)
    const path = "http://localhost:3001/images/memes/" + props.file.file
    return (
        <Card>
            <Card.Body>
                <Row>
                    <Col xs={3}>
                        <img src={path} width="100%"/>
                    </Col>
                    <Col>
                        <Card.Title><h2>{props.file.title}</h2></Card.Title>
                        <Card.Text>
                            {props.file.description}
                            <br/>
                            Created by {props.file.author} at {props.file.date}
                        </Card.Text>
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
