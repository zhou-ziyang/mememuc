import 'bootstrap/dist/css/bootstrap.min.css';
import './Template.css'
import Container from "react-bootstrap/Container";
import React, {useEffect, useState} from "react";
import {Button, Col, Form, FormControl, Row, Tab, Tabs} from "react-bootstrap";
import {Masonry} from "@mui/lab";

// import axios from "axios";

function MemeCard(props) {
    return (
        <div className="card">
            <img className="card-img-top" src={props.file} alt={props.file}/>
            <div className="card-body">
                <h6 className="card-title">Card title</h6>
            </div>
        </div>
    )
}

function MemeMasonry() {
    const [state, setState] = React.useState(null);
    useEffect(() => {
        fetch("http://localhost:3001/templates", {
            headers: {
                "Authorization": "Basic dGVzdDp0ZXN0"
            }
        })
            .then(response => response.json())
            .then(data => setState(data));
    }, []);
    if (state === null) {
        return <div>Loading...</div>;
    } else {
        return (
            <Masonry columns={3} spacing={2}>
                {state.map((filename, index) => (
                    <div key={index}>
                        <MemeCard file={"http://localhost:3001/images/templates/" + filename}/>
                    </div>
                ))}
            </Masonry>
            // <div>{state}</div>
        );
    }
}

function PictureUpload() {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('File uploaded successfully.');
                setFile(null);
            } else {
                throw new Error('File upload failed.');
            }
        } catch (error) {
            console.error(error);
            alert('File upload failed.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormControl
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.png,.jpeg"
            />
            <Button type="submit" variant="primary">
                {/*<BsUpload />*/}
                Upload
            </Button>
        </form>
    );
}

function AddMeme() {
    return (
        <Container>
            <Row>
                <Col>
                    <Tabs defaultActiveKey="default" id="uncontrolled-tab-example" className="mb-3">
                        <Tab eventKey="default" title="Default Templates">
                            <MemeMasonry/>
                        </Tab>
                        <Tab eventKey="custom" title="Custom Templates">
                            <PictureUpload/>
                            <MemeMasonry/>
                        </Tab>
                    </Tabs>
                </Col>
                <Col className="meme-editor-container">
                </Col>
            </Row>
        </Container>
    )

}

export default AddMeme;
