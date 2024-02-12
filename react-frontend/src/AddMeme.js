import 'bootstrap/dist/css/bootstrap.min.css';
import './AddMeme.css'
import Container from "react-bootstrap/Container";
import React, {Fragment, useEffect, useState} from "react";
import {Button, Col, Form, FormControl, Modal, Row, Tab, Tabs} from "react-bootstrap";
import {Masonry} from "@mui/lab";
import {createRoot} from 'react-dom/client';
import {Stage, Layer, Text, Rect, Image} from 'react-konva';
// import axios from "axios";
import useImage from 'use-image';

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

function ImageEditor() {
    function MemeCard(props) {
        return (
            <div className="card">
                <img className="card-img-top" src={props.file} alt={props.file}/>
                <div className="card-body">
                    <Button onClick={() => {
                        setTemplateSrc(props.file);
                        set_template()
                    }
                    }>Use</Button>
                    {/*<Button onClick={() => {*/}
                    {/*    setImage(props.file);*/}
                    {/*    addImage();*/}
                    {/*}}>Insert</Button>*/}
                </div>
            </div>
        )
    }

    function TemplateMasonry() {
        const [state, setState] = React.useState(null);
        useEffect(() => {
            fetch("http://localhost:3001/templates", {
                headers: {"Authorization": "Basic dGVzdDp0ZXN0"}
            })
                .then(response => response.json())
                .then(data => setState(data));
        }, [state]);
        if (state === null) {
            return <div>Loading...</div>;
        } else {
            return (
                <Masonry columns={4} spacing={2}>
                    {state.map((filename, index) => (
                        <div key={index}>
                            <MemeCard file={"http://localhost:3001/images/templates/" + filename}/>
                        </div>
                    ))}
                </Masonry>
            );
        }
    }

    let count_element = 0;
    // count_element = count_element + 1;
    // const INITIAL_STATE_IMAGE = [
    //     {
    //         id: count_element.toString(),
    //         src: "http://localhost:3001/images/templates/Aint%20no%20body%20got%20time%20fo%20dat.jpg",
    //         x: 0,
    //         y: 0,
    //     }
    // ];
    // count_element = count_element + 1;
    // const INITIAL_STATE_TEXT = [
    //     {
    //         id: count_element.toString(),
    //         text: "TEXT1",
    //         x: 150,
    //         y: 150,
    //     }
    // ];
    count_element = count_element + 1;
    const INITIAL_STATE_TEMPLATE = {
        id: count_element.toString(),
        src: "http://localhost:3001/images/templates/advice_yoda_gives.jpg",
    };

    const [show, setShow] = useState(false);
    // const [images, setImages] = useState(INITIAL_STATE_IMAGE);
    // const [image, setImage] = useState('');
    const [templateSrc, setTemplateSrc] = useState("");
    const [template, setTemplate] = useState(INITIAL_STATE_TEMPLATE);
    const [texts, setTexts] = useState([]);
    const [text, setText] = useState('');
    useEffect(() => {
        // setImages(images);
        setTemplateSrc(templateSrc);
        setTemplate(template);
        setTexts(texts);
        setText(text);
    }, [texts, text, template, templateSrc]);

    function downloadURI(uri, name) {
        const link = document.createElement('a');
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // const handleDragStartImage = (e) => {
    //     const id = e.target.id();
    //     setImages(
    //         images.map((image) => {
    //             return {
    //                 ...image
    //             };
    //         })
    //     );
    // };
    // const handleDragEndImage = (e) => {
    //     setImages(
    //         images.map((image) => {
    //             return {
    //                 ...image
    //             };
    //         })
    //     );
    // };


    const handleDragStartText = (e) => {};
    const handleDragEndText = (e) => {};
    const stageRef = React.useRef(null);

    const handleExport = () => {
        const uri = stageRef.current.toDataURL();
        downloadURI(uri, 'stage.png');
    };

    const addText = () => {
        count_element = count_element + 1;
        texts.push({
            id: count_element.toString(),
            text: text,
            x: 150,
            y: 150
        })
        setTexts(texts);
        handleDragEndText();
    }

    // const addImage = () => {
    //     count_element = count_element + 1;
    //     texts.push({
    //         id: count_element.toString(),
    //         src: image,
    //         text: text,
    //         x: 150,
    //         y: 150
    //     })
    //     setTexts(texts);
    //     console.log(texts);
    //     handleDragEndImage();
    // }

    const set_template = () => {
        count_element = count_element + 1;
        setTemplate({
            id: count_element.toString(),
            src: templateSrc
        });
        // console.log(texts);
        handleDragEndText();
    }


    const Template = () => {
        const [template_image] = useImage(templateSrc);
        return (
            <Layer>
                <Rect x={0} y={0} width={canvas_width} height={canvas_height} fill="#FFFFFF"/>
                {/*{images.map((template_image) => (*/}
                {/*    <GetImage*/}
                {/*        id={template_image.id}*/}
                {/*        key={template_image.id}*/}
                {/*        url={template_image.src}*/}
                {/*        x={0}*/}
                {/*        y={0}*/}
                {/*        onDragStart={handleDragStartImage}*/}
                {/*        onDragEnd={handleDragEndImage}*/}
                {/*     />*/}
                {/*))}*/}
                <Image key={template.id} image={template_image} x={0} y={0}/>
                {texts.map((text) => (
                    <Text key={text.id} id={text.id} text={text.text} x={text.x} y={text.y} draggable onDragStart={handleDragStartText} onDragEnd={handleDragEndText}/>
                ))}
            </Layer>
        )
    };

    const canvas_width = 800;
    const canvas_height = 600

    return (
        <>
            <Container>
                <div className="meme-editor-container">
                    <Fragment>
                        <Button variant="primary" onClick={() => setShow(true)}>Gallery</Button>
                        <Button>Publish</Button>
                        <Button>Save as Private</Button>
                        <Button>Save Draft</Button>
                        <Button onClick={handleExport}>Download</Button>
                        <Form.Group className="m-0">
                            <Form.Control type="text" placeholder="Enter text" value={text}
                                          onChange={(e) => setText(e.target.value)}/>
                            <Button onClick={addText}>Add Text</Button>
                        </Form.Group>
                        <Stage width={canvas_width} height={canvas_height} ref={stageRef}>
                            <Template/>
                        </Stage>
                    </Fragment>
                </div>
            </Container>
            <Modal
                show={show}
                size="lg"
                onHide={() => setShow(false)}
                dialogClassName="modal-90w"
                aria-labelledby="example-custom-modal-styling-title"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-custom-modal-styling-title">
                        Custom Modal Styling
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="template_popup_content">
                        <Tabs defaultActiveKey="default" id="uncontrolled-tab-example" className="mb-3">
                            <Tab eventKey="default" title="Default Templates">
                                <TemplateMasonry/>
                            </Tab>
                            <Tab eventKey="custom" title="Custom Templates">
                                <PictureUpload/>
                                <TemplateMasonry/>
                            </Tab>
                        </Tabs>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ImageEditor;
