import './Meme.css';
import React, {useEffect, useState} from "react";
import {Button, Container, Form, FormGroup, FormControl} from "react-bootstrap";
import {useParams} from "react-router-dom";
import {useLocation} from "react-router-dom";
import Plot from 'react-plotly.js';
import {Divider, Typography, Box} from "@mui/material";

function Comments(props) {
    function Comment(props) {
        const [commenter, setCommenter] = useState('');
        useEffect(() => {
            fetch(`http://localhost:3001/users/${props.comment.uid}`,
                {headers: {"Authorization": localStorage.getItem('basicauthtoken')}}
            )
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        setCommenter(data.username);
                    }
                });
        }, []);
        return (
            <Box sx={{p: 1, m: 1, bgcolor: 'background.paper', boxShadow: 1}}>
                <Typography variant="body1" gutterBottom>{commenter}:</Typography>
                <Typography variant="body2" color="text.secondary">{props.comment.content}</Typography>
                <Typography variant="body2" color="text.secondary">Commented on: {props.comment.date}</Typography>
            </Box>
        );
    }

    const [comments, setComments] = useState([]);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (editing) return;
        fetch(`http://localhost:3001/meme/${props.id}/comments`,
            {headers: {"Authorization": localStorage.getItem('basicauthtoken')}}
        )
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setComments(data);
                }
            });
    }, [editing]);

    const [newComment, setNewComment] = useState('');

    const handleCommentChange = (event) => {
        setNewComment(event.target.value);
        setEditing(true);
    };

    const handleCommentSubmit = (event) => {
        event.preventDefault();

        // Submit new comment to your API
        fetch(`http://localhost:3001/social/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': localStorage.getItem('basicauthtoken'),
            },
            body: JSON.stringify({content: newComment, mid: props.meme._id}),
        }).then((response) => {
            // Show some success message
            // And clear the form
            setNewComment('');
            setEditing(false);
        }).catch((error) => {
            // Show some error message
        });
    };

    return (
        <div>
            <h2>Leave a Comment:</h2>
            <Form onSubmit={handleCommentSubmit}>
                <FormGroup>
                    <FormControl type="text"
                                 placeholder="Write a comment..."
                                 value={newComment}
                                 onChange={handleCommentChange}/>
                </FormGroup>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
            <h2>Comments</h2>
            {comments.map((comment, index) => (
                <Comment key={index} comment={comment}/>
            ))}
        </div>
    );
}

function Chart(props) {
    const [data, setData] = useState([]);
    useEffect(() => {
        fetch(`http://localhost:3001/meme/${props.id}/statistics_past_6`,
            {headers: {"Authorization": localStorage.getItem('basicauthtoken')}}
        )
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setData(data);
                }
            });
    }, []);
    return (
        <Plot
            data={[
                {
                    x: data.months,
                    y: data.comments,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: 'red'},
                    name: 'Comments'
                },
                {
                    x: data.months,
                    y: data.likes,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: 'green'},
                    name: 'Likes'
                },
                {
                    x: data.months,
                    y: data.dislikes,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: 'blue'},
                    name: 'Dislikes'
                }
            ]}
            layout={{width: 700, height: 500, title: 'Statistics'}}
        />
    );
}

function MemeModal() {
    const urlParams = useParams();
    let location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    // console.log(queryParams);

    const [meme, setMeme] = useState(null);
    const [memeUrl, setMemeUrl] = useState(null);
    const [nextMemeURL, setNextMemeURL] = useState(null);
    const [prevMemeURL, setPrevMemeURL] = useState(null);
    const [randomMemeURL, setRandomMemeURL] = useState(null);
    const [username, setUsername] = useState('');

    useEffect(() => {
        if (meme === null) {
            fetch(`http://localhost:3001/meme/data/${urlParams.id}`, {headers: {"Authorization": localStorage.getItem('basicauthtoken')}})
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        setMeme(data);
                        // console.log(data);
                        setMemeUrl("http://localhost:3001/" + data.file.slice(7));
                    }
                });
        }
    }, [urlParams, meme]);

    useEffect(() => {
        if (meme === null) return;

        fetch(`http://localhost:3001/users/${meme.author}`, {
            headers: {"Authorization": localStorage.getItem('basicauthtoken')}
        })
            .then(response => response.json())
            .then(data => {
                if (data)
                    setUsername(data.username);
            })
            .catch(error => console.error('Error:', error));
        fetch(`http://localhost:3001/meme/${meme._id}/next?${queryParams}`,
            {headers: {"Authorization": localStorage.getItem('basicauthtoken')}}
        )
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setNextMemeURL(`${data._id}?${queryParams}`);
                }
            });
        fetch(`http://localhost:3001/meme/${meme._id}/last?${queryParams}`, {headers: {"Authorization": localStorage.getItem('basicauthtoken')}})
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setPrevMemeURL(`${data._id}?${queryParams}`);
                }
            });
        fetch(`http://localhost:3001/meme/${meme._id}/random?${queryParams}`, {headers: {"Authorization": localStorage.getItem('basicauthtoken')}})
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setRandomMemeURL(`${data._id}?${queryParams}`);
                }
            });
    }, [meme]);


    const [autoplay, setAutoplay] = useState(false);

    const startAutoplay = () => {
        // Set up an interval to navigate to the next meme every 5 seconds
        const intervalId = setInterval(() => {
            if (nextMemeURL) {
                window.location.href = `http://localhost:3000/meme/${nextMemeURL}`;
            }
        }, 5000);
        setAutoplay(true);
        localStorage.setItem('autoplay', 'true');
        localStorage.setItem('intervalId', intervalId);
    };

    const stopAutoplay = () => {
        // Clear the interval and stop the autoplay
        const intervalId = localStorage.getItem('intervalId');
        clearInterval(intervalId);
        setAutoplay(false);
        localStorage.removeItem('autoplay');
        localStorage.removeItem('intervalId');
    };

    useEffect(() => {
        // Get autoplay state from localStorage when component mounts
        const autoplayState = localStorage.getItem('autoplay');
        if (autoplayState) {
            const intervalId = localStorage.getItem('intervalId');
            setAutoplay(true);
            setInterval(() => {
                if (nextMemeURL) {
                    window.location.href = `http://localhost:3000/meme/${nextMemeURL}`;
                }
            }, 5000, intervalId);
        }
    }, [nextMemeURL]);

    return (
        meme &&
        <Container>
            <Button onClick={startAutoplay} disabled={autoplay}>Start Autoplay (5s)</Button>
            <Button onClick={stopAutoplay} disabled={!autoplay}>Stop Autoplay</Button>
            <h1>{meme.title}</h1>
            <div style={{width: "500px", height: "500px", overflow: "hidden"}}>
                <img src={memeUrl} alt="Meme" className="single-view-img"
                     style={{maxWidth: "100%", maxHeight: "100%"}}/>
            </div>
            {meme.description}
            <p>Created by {username} at {meme.date}</p>
            <Button href={`http://localhost:3000/meme/${prevMemeURL}`}>Previous</Button>
            <Button href={`http://localhost:3000/meme/${nextMemeURL}`}>Next</Button>
            <Button href={`http://localhost:3000/meme/${randomMemeURL}`}>Pick a Random</Button>
            <Divider/>
            <Chart id={meme._id}/>
            <Comments id={meme._id} username={username} meme={meme}/>
        </Container>
    );
}

export default MemeModal;