import './Meme.css';
import React, {useEffect, useState} from "react";
import {Button, Container} from "react-bootstrap";
import {useParams} from "react-router-dom";
import {useLocation} from "react-router-dom";

function MemeModal() {
    const urlParams = useParams();
    let location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    console.log(queryParams);

    const [meme, setMeme] = useState(null);
    const [memeUrl, setMemeUrl] = useState(null);
    const [nextMemeURL, setNextMemeURL] = useState(null);
    const [prevMemeURL, setPrevMemeURL] = useState(null);
    const [randomMemeURL, setRandomMemeURL] = useState(null);

    useEffect(() => {
        if (meme === null) {
            fetch(`http://localhost:3001/meme/data/${urlParams.id}`, {headers: {"Authorization": localStorage.getItem('basicauthtoken')}})
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        setMeme(data);
                        console.log(data);
                        setMemeUrl("http://localhost:3001/" + data.file.slice(7));
                    }
                });
        }
    }, [urlParams, meme]);

    useEffect(() => {
        if (meme === null) return;
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
            <p>Created by {meme.author} at {meme.date}</p>
            <Button href={`http://localhost:3000/meme/${prevMemeURL}`}>Previous</Button>
            <Button href={`http://localhost:3000/meme/${nextMemeURL}`}>Next</Button>
            <Button href={`http://localhost:3000/meme/${randomMemeURL}`}>Pick a Random</Button>
        </Container>
    );
}

export default MemeModal;