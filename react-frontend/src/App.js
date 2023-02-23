import 'bootstrap/dist/css/bootstrap.min.css';
import {Card, Col, Container, Row} from "react-bootstrap";
import React, {useEffect} from "react";
import {Masonry} from "@mui/lab";
import Moment from "react-moment";


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
                        <Card.Title>{props.file.title}</Card.Title>
                        <Card.Text>
                            <div>{props.file.description}</div>
                            <div>Created by {props.file.author} at <Moment unix>{props.file.timestamp}</Moment></div>
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
        // console.log(state)
        return (
            state.map((meme, index) => (
                <div key={index}>
                    <MemeItem file={meme}/>
                </div>
            ))
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
