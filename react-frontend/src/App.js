import {Checkbox} from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Button, Card, Col, Container, Form, Modal, Row, Stack} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import TextToSpeech from "./TextToSpeech";

function App() {
    let params = null;

    const [textToSpeech, setTextToSpeech] = useState(false);
    useEffect(() => {
        setTextToSpeech(localStorage.getItem('textToSpeech') === 'true');
    }, []);
    useEffect(() => {
        localStorage.setItem('textToSpeech', textToSpeech);
        // console.log(textToSpeech, localStorage.getItem('textToSpeech'));
    }, [textToSpeech]);
    const handleTextToSpeechChange = (e) => {
        setTextToSpeech(e.target.checked);
    };

    function MemeItem(props) {
        const path = "http://localhost:3001/" + props.file.file.slice(7);
        const [vote, setVote] = useState(null);
        const [likesCount, setLikesCount] = useState(null);
        const [dislikesCount, setDislikesCount] = useState(null);

        useEffect(() => {
            setVote(null);
            if (props === null) return;
            fetch(`http://localhost:3001/social/${props.file._id}/check_vote`, {headers: {"Authorization": localStorage.getItem('basicauthtoken')}})
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        setVote(data.type);
                    }
                });

            fetch(`http://localhost:3001/meme/${props.file._id}/likes`, {
                headers: {"Authorization": localStorage.getItem('basicauthtoken')}
            })
                .then(response => response.json())
                .then(data => {
                    // console.log(data);
                    setLikesCount(data.count);
                });

            fetch(`http://localhost:3001/meme/${props.file._id}/dislikes`, {
                headers: {"Authorization": localStorage.getItem('basicauthtoken')}
            })
                .then(response => response.json())
                .then(data => {
                    setDislikesCount(data.count);
                });
        }, [props, likesCount, dislikesCount]);

        // Function to handle voting up
        const handleVote = (type = 1) => {
            const url = type === 1 ? 'http://localhost:3001/social/vote_up' : 'http://localhost:3001/social/vote_down';
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
                        // console.log(type === 1 ? 'Vote up successful' : 'Vote down successful');
                        setVote(type);
                        if (type === 1) {
                            setLikesCount(likesCount + 1);
                        } else {
                            setDislikesCount(dislikesCount + 1);
                        }
                        return response.json();
                    }
                })
                .then(data => {
                    // console.log(data.type === 1 ? 'Voted up' : 'Voted down');
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }

        const [username, setUsername] = useState('');

        useEffect(() => {
            fetch(`http://localhost:3001/users/${props.file.author}`, {
                headers: {"Authorization": localStorage.getItem('basicauthtoken')}
            })
                .then(response => response.json())
                .then(data => {
                    if (data)
                        setUsername(data.username);
                })
                .catch(error => console.error('Error:', error));
        }, [props.file.author]);

        return (
            <Card>
                <Card.Body>
                    <Row>
                        <Col sm={3}>
                            <Link to={`/meme/${props.file._id}?${params}`} className="text-decoration-none">
                                <div className="image-container">
                                    <img src={path} alt=""/>
                                </div>
                            </Link>
                        </Col>
                        <Col>
                        <Card.Title><h2>{TextToSpeech(props.file.title)}</h2></Card.Title>
                            <Card.Text>
                                {TextToSpeech(props.file.description)}
                                <br/>
                                Created by <b>{username}</b> at <b>{props.file.date}</b>
                                <br/>
                                Template: {props.file.template}
                            </Card.Text>
                        </Col>
                    </Row>
                    {(localStorage.getItem('loggedin') === 'true') && (
                        <>
                            <Button variant={vote === 1 ? "success" : "outline-success"}
                                    onClick={() => handleVote(1)}>Like {likesCount || 0}</Button>
                            <Button variant={vote === 0 ? "danger" : "outline-danger"}
                                    onClick={() => handleVote(0)}>Dislike {dislikesCount || 0}</Button>
                        </>
                    )}
                </Card.Body>
            </Card>
        )
    }

    function MemeView() {
        const [state, setState] = React.useState(null);
        const [sortOption, setSortOption] = useState("date");
        const [sortOrder, setSortOrder] = useState("desc");
        const [filters, setFilters] = useState({
            author: "",
            template: "",
            minDate: "",
            maxDate: "",
            // minLikes: "",
        });
        const SCROLL_LENGTH = 40;
        const [to, setTo] = useState(SCROLL_LENGTH - 1);
        const [hasMore, setHasMore] = useState(true);

        useEffect(() => {
            params = new URLSearchParams({
                ...filters,
                sortBy: sortOption,
                order: sortOrder,
                from: 0,
                to: to
            });

            fetch(`http://localhost:3001/memes?${params}`, {headers: {"Authorization": localStorage.getItem('basicauthtoken')}})
                .then(response => response.json())
                .then(data => setState(data));
        }, [sortOption, sortOrder, filters, to]);

        useEffect(() => {
            if (state === null) return;
            fetch(`http://localhost:3001/memes/count?${params}`, {headers: {"Authorization": localStorage.getItem('basicauthtoken')}})
                .then(response => response.json())
                .then(data => {
                    // console.log(state.length, data.count);
                    if (state.length >= data.count) {
                        setHasMore(false);
                    } else {
                        setHasMore(true);
                    }
                    // console.log(hasMore);
                });
        }, [state]);

        const handleSortChange = (event) => {
            const [sortBy, order] = event.target.value.split(" ");
            setSortOption(sortBy);
            setSortOrder(order);
            // console.log(sortBy, order);
        };

        const handleFilterChange = (event) => {
            setFilters(filters => ({...filters, [event.target.name]: event.target.value}));
        };

        const fetchMoreData = () => {
            setTo(to + SCROLL_LENGTH);
            // console.log(to);
        };

        if (state === null) {
            return <div>Loading...</div>;
        } else {
            return (
                <>
                    <Row>
                        <Col xs={3}>
                            <Checkbox
                                checked={textToSpeech}
                                onChange={handleTextToSpeechChange}
                                inputProps={{'aria-label': 'primary checkbox'}}
                            />
                            <label>Text to Speech</label>
                            <Form>
                                <Form.Group className="mb-3" controlId="filterTitle">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control type="text" placeholder="Search for title" name="title"
                                                  onChange={handleFilterChange}/>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="filterAuthor">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control type="text" placeholder="Search for description" name="description"
                                                  onChange={handleFilterChange}/>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="filterTemplate">
                                    <Form.Label>Template</Form.Label>
                                    <Form.Control type="text" placeholder="Search for template" name="template"
                                                  onChange={handleFilterChange}/>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="filterMinDate">
                                    <Form.Label>Min. Date</Form.Label>
                                    <Form.Control type="date" name="minDate" onChange={handleFilterChange}/>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="filterMaxDate">
                                    <Form.Label>Max. Date</Form.Label>
                                    <Form.Control type="date" name="maxDate" onChange={handleFilterChange}/>
                                </Form.Group>

                                {/*<Form.Group className="mb-3" controlId="filterMinLikes">*/}
                                {/*    <Form.Label>Min. Likes</Form.Label>*/}
                                {/*    <Form.Control type="number" placeholder="Enter minimum likes" name="minLikes" onChange={handleFilterChange} />*/}
                                {/*</Form.Group>*/}

                                {/*<Button variant="primary" onClick={handleFilterChange}>Apply filters</Button>*/}
                            </Form>
                        </Col>
                        <Col>
                            <Form.Select aria-label="Sort by" onChange={handleSortChange} defaultValue={"date desc"}>
                                <option value="date asc">Date &uarr;</option>
                                <option value="date desc">Date &darr;</option>
                                <option value="title asc">Title  &uarr;</option>
                                <option value="title desc">Title &darr;</option>
                            </Form.Select>
                            {/*<Stack direction="vertical" gap={3}>*/}
                            <InfiniteScroll
                                dataLength={state.length}
                                next={fetchMoreData}
                                hasMore={hasMore}
                                loader={<h4>Loading...</h4>}
                            >
                                {state.map((meme, index) => (
                                    <MemeItem key={index} index={index} file={meme}/>
                                ))}
                            </InfiniteScroll>
                            {/*</Stack>*/}
                        </Col>
                    </Row>
                </>
            );
        }
    }

    return (
        <Container>
            <MemeView/>
        </Container>
    );
}

export default App;