import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Button, Card, Col, Container, Modal, Row, Stack} from "react-bootstrap";
import React, {useEffect, useState} from "react";

function App() {
    function MemeItem(props) {
        const path = "http://localhost:3001/" + props.file.file.slice(7);

        return (
            <Card onClick={() => {
                setActiveIndex(props.index);
                setActiveMeme(props.file);
                setModalShow(true);
            }}> {/* Add an onClick event to the Card to trigger modal */}
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
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        )
    }

    function MemeModal(props) {
        const [vote, setVote] = useState(null);

        useEffect(() => {
            if (activeMeme !== null) {
                setActiveMemeURL("http://localhost:3001/" + activeMeme.file.slice(7));
            }
        }, [activeMeme]);

        const nextMeme = () => {
            if (activeIndex < props.memes.length - 1) {
                setActiveMeme(props.memes[activeIndex + 1]);
                setActiveIndex(activeIndex + 1);
            }
        };

        const prevMeme = () => {
            if (activeIndex > 0) {
                setActiveMeme(props.memes[activeIndex - 1]);
                setActiveIndex(activeIndex - 1);
            }
        };

        // Fetching the past vote from "/vote"
        useEffect(() => {
            setVote(null);
            if (activeMeme === null) return;
            fetch(`http://localhost:3001/memes/${activeMeme._id}/vote`, {headers: {"Authorization": "Basic dGVzdDp0ZXN0"}})
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        setVote(data.type)
                    }
                })
        }, [activeMeme]);

        // Function to handle voting up
        const handleVote = (mid, type = 1) => {
            const url = type === 1 ? 'http://localhost:3001/memes/vote_up' : 'http://localhost:3001/memes/vote_down';
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Basic dGVzdDp0ZXN0"
                },
                body: JSON.stringify({
                    mid: mid
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
            <Modal
                animation={false}
                show={modalShow}
                onHide={() => setModalShow(false)}
                dialogClassName="modal-90w"
                aria-labelledby="example-custom-modal-styling-title"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-custom-modal-styling-title">
                        {activeMeme.title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <img src={activeMemeURL} alt="Meme" className="single-view-img"/>
                    {activeMeme.description}
                    <p>Created by {activeMeme.author} at {activeMeme.date}</p>
                    {(localStorage.getItem('loggedin') === 'true') && (
                        <>
                            <Button variant={vote === 1 ? "success" : "outline-success"}
                                    onClick={() => handleVote(activeMeme.mid, 1)}>Vote Up</Button>
                            <Button variant={vote === 0 ? "danger" : "outline-danger"}
                                    onClick={() => handleVote(activeMeme.mid, 0)}>Vote Down</Button>
                        </>
                    )}
                    <Button onClick={prevMeme}>Previous</Button>
                    <Button onClick={nextMeme}>Next</Button>
                </Modal.Body>
            </Modal>
        );
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
                <>
                    <Stack direction="vertical" gap={3}>
                        {state.map((meme, index) => (
                            <MemeItem key={index} index={index} file={meme}/>
                        ))}
                    </Stack>
                    {/* The functionality inside the Modal */}
                    {modalShow && (<MemeModal memes={state}/>)}
                </>
            );
        }
    }

    const [modalShow, setModalShow] = useState(false);
    const [activeMeme, setActiveMeme] = useState(null);
    const [activeMemeURL, setActiveMemeURL] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);

    return (
        <Container>
            <MemeView/>
        </Container>
    );
}

export default App;