import './Meme.css';
import React, {useEffect, useState} from "react";
import {Button, Container} from "react-bootstrap";
import {useParams} from "react-router-dom";

function MemeModal() {
    const params = useParams();

    const [vote, setVote] = useState(null);
    const [meme, setMeme] = useState(null);
    const [memeUrl, setMemeUrl] = useState(null);
    const [nextMemeURL, setNextMemeURL] = useState(null);
    const [prevMemeURL, setPrevMemeURL] = useState(null);
    const [randomMemeURL, setRandomMemeURL] = useState(null);

    useEffect(() => {
        if (meme === null) {
            fetch(`http://localhost:3001/meme/data/${params.id}`, {headers: {"Authorization": "Basic dGVzdDp0ZXN0"}})
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        setMeme(data);
                        console.log(data);
                        setMemeUrl("http://localhost:3001/" + data.file.slice(7));
                    }
                });
        }
    }, [params, meme]);

    useEffect(() => {
        if (meme === null) return;
        fetch(`http://localhost:3001/meme/${meme._id}/next`, {headers: {"Authorization": "Basic dGVzdDp0ZXN0"}})
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setNextMemeURL(data._id);
                }
            });
        fetch(`http://localhost:3001/meme/${meme._id}/last`, {headers: {"Authorization": "Basic dGVzdDp0ZXN0"}})
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setPrevMemeURL(data._id);
                }
            });
        fetch(`http://localhost:3001/meme/${meme._id}/random`, {headers: {"Authorization": "Basic dGVzdDp0ZXN0"}})
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setRandomMemeURL(data._id);
                }
            });
    }, [meme]);

    useEffect(() => {
        setVote(null);
        if (meme === null) return;
        fetch(`http://localhost:3001/memes/${meme._id}/vote`, {headers: {"Authorization": "Basic dGVzdDp0ZXN0"}})
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setVote(data.type)
                }
            })
    }, [meme]);

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
        meme &&
        <Container>
            <h1>{meme.title}</h1>
            <div style={{width: "500px", height: "500px", overflow: "hidden"}}>
                <img src={memeUrl} alt="Meme" className="single-view-img"
                     style={{maxWidth: "100%", maxHeight: "100%"}}/>
            </div>
            {meme.description}
            <p>Created by {meme.author} at {meme.date}</p>
            {(localStorage.getItem('loggedin') === 'true') && (
                <>
                    <Button variant={vote === 1 ? "success" : "outline-success"}
                            onClick={() => handleVote(meme.mid, 1)}>Like</Button>
                    <Button variant={vote === 0 ? "danger" : "outline-danger"}
                            onClick={() => handleVote(meme.mid, 0)}>Dislike</Button>
                </>
            )}
            <Button href={`http://localhost:3000/meme/${prevMemeURL}`}>Previous</Button>
            <Button href={`http://localhost:3000/meme/${nextMemeURL}`}>Next</Button>
            <Button href={`http://localhost:3000/meme/${randomMemeURL}`}>Pick a Random</Button>
        </Container>
    );
}

export default MemeModal;