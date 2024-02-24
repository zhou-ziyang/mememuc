import {Container} from "react-bootstrap";
import React, {useEffect} from "react";
import {Masonry} from "@mui/lab";


function MemeCard(props) {
    return (
        <div className="card">
            <img className="card-img-top" src={"http://localhost:3001/" + props.data.file.slice(7)}
                 alt={props.data.title}/>
            <div className="card-body">
                <h6 className="card-title">{props.data.title}</h6>
            </div>
        </div>
    )
}

function MyMemesMasonry() {
    const [state, setState] = React.useState(null);
    useEffect(() => {
        // const id = 'TEST-AUTHOR';  // Define your id for the query here
        // fetch(`http://localhost:3001/my_memes?id=${id}`, { // Add id to the request
        fetch(`http://localhost:3001/drafts`, { // Add id to the request
            headers: {
                "Authorization": localStorage.getItem('basicauthtoken')
            }
        })
            .then(response => response.json())
            .then(data => setState(data));
    }, []);
    if (state === null) {
        return <div>Loading...</div>;
    } else {
        // console.log(state)
        return (
            <Masonry columns={5} spacing={2}>
                {state.map((meme, index) => (
                    <div key={index}>
                        <MemeCard data={meme}/>
                    </div>
                ))}
            </Masonry>
        );
    }
}

function MyMemes() {
    return (
        <Container>
            <MyMemesMasonry/>
        </Container>
    )
}

export default MyMemes;