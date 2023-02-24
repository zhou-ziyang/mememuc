import 'bootstrap/dist/css/bootstrap.min.css';
import './AddMeme.css'
import Container from "react-bootstrap/Container";
import React, {Fragment, useEffect, useState} from "react";
import {Button, Col, Form, FormControl, Row, Tab, Tabs} from "react-bootstrap";
import {Masonry} from "@mui/lab";
import {createRoot} from 'react-dom/client';
import {Stage, Layer, Star, Text, Rect} from 'react-konva';

// import axios from "axios";

let target_template = ""

function refreshPage() {
    window.location.reload(false);
}

function MemeCard(props) {
    return (
        <div className="card" onClick={() => {
            target_template = props.file;
            console.log(target_template);
            window.location.reload(false);
        }
        }>
            <img className="card-img-top" src={props.file} alt={props.file}/>
            <div className="card-body">
                <Button>Use</Button>
                <Button>Insert</Button>
            </div>
        </div>
    )
}

function TemplateMasonry() {
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
                Upload
            </Button>
        </form>
    );
}

let count_element = 1;

function generateShapes() {
    return [...Array(10)].map((_, i) => ({
        id: i.toString(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotation: Math.random() * 180,
        isDragging: false,
    }));
}

const INITIAL_STATE_IMAGE = generateShapes();

const INITIAL_STATE_TEXT = [
    {
        id: count_element.toString(),
        text: "TEXT1",
        x: Math.random() * 300,
        y: Math.random() * 300,
        isDragging: false,
    }
];

function downloadURI(uri, name) {
    const link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function ImageEditor() {
    const [images, setImages] = React.useState(INITIAL_STATE_IMAGE);
    const [texts, setTexts] = React.useState(INITIAL_STATE_TEXT);

    const handleDragStart = (e) => {
        const id = e.target.id();
        setImages(
            images.map((star) => {
                return {
                    ...star,
                    isDragging: star.id === id,
                };
            })
        );
    };
    const handleDragEnd = (e) => {
        setImages(
            images.map((star) => {
                return {
                    ...star,
                    isDragging: false,
                };
            })
        );
    };

    const stageRef = React.useRef(null);

    const handleExport = () => {
        const uri = stageRef.current.toDataURL();
        // console.log(uri);
        downloadURI(uri, 'stage.png');
    };

    const addText = () => {
        count_element = count_element + 1
        texts.push({
            id: count_element.toString(),
            text: "TEXT1",
            x: Math.random() * 300,
            y: Math.random() * 300,
            isDragging: false,
        })
        setTexts(texts)
        console.log(texts)
    }

    const canvas_width = 300;
    const canvas_height = 300

    return (
        <Fragment>
            <Button>Save</Button>
            <Button onClick={handleExport}>Download</Button>
            <Button onClick={addText}>Add Text</Button>
            <Stage width={canvas_width} height={canvas_height} ref={stageRef}>
                <Layer>
                    <Rect x={0} y={0} width={canvas_width} height={canvas_height} fill="#FFFFFF"/>
                    {/*<Text text="Try to drag a star" draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd}/>*/}
                    {texts.map((text) => (
                        <Text key={text.id} id={text.id} text={text.text} draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd}/>
                    ))}
                    {images.map((star) => (
                        <Star
                            key={star.id}
                            id={star.id}
                            x={star.x}
                            y={star.y}
                            numPoints={5}
                            innerRadius={20}
                            outerRadius={40}
                            fill="#89b717"
                            opacity={0.8}
                            draggable
                            rotation={star.rotation}
                            shadowColor="black"
                            shadowBlur={10}
                            shadowOpacity={0.6}
                            shadowOffsetX={star.isDragging ? 10 : 5}
                            shadowOffsetY={star.isDragging ? 10 : 5}
                            scaleX={star.isDragging ? 1.2 : 1}
                            scaleY={star.isDragging ? 1.2 : 1}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        />
                    ))}
                </Layer>
            </Stage>
        </Fragment>
    );
}

function AddMeme() {
    return (
        <Container>
            <Row>
                <Col sm={5}>
                    <Tabs defaultActiveKey="default" id="uncontrolled-tab-example" className="mb-3">
                        <Tab eventKey="default" title="Default Templates">
                            <TemplateMasonry/>
                        </Tab>
                        <Tab eventKey="custom" title="Custom Templates">
                            <PictureUpload/>
                            <TemplateMasonry/>
                        </Tab>
                    </Tabs>
                </Col>
                <Col className="meme-editor-container">
                    <ImageEditor/>
                </Col>
            </Row>
        </Container>
    )
}

export default AddMeme;
