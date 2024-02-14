import 'bootstrap/dist/css/bootstrap.min.css';
import './AddMeme.css'
import './Resizable.css'
import Container from "react-bootstrap/Container";
import React, {Fragment, useEffect, useState} from "react";
import {Button, Col, FormControl, Modal, Row, Tab, Tabs} from "react-bootstrap";
import {Masonry} from "@mui/lab";
// import {createRoot} from 'react-dom/client';
import {Image, Layer, Stage, Text} from 'react-konva';
import useImage from 'use-image';
import {ResizableBox} from 'react-resizable';

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


let count_element = 0;

function ImageEditor() {
    function MemeCard(props) {
        return (
            <div className="card">
                <img className="card-img-top" src={props.file} alt={props.file}/>
                <div className="card-body">
                    <Button onClick={() => {
                        setTemplateSrc(props.file);
                        set_template();
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
        // console.log("TemplateMasonry")
        const [state, setState] = React.useState(null);
        useEffect(() => {
            if (state === null) {
                fetch("http://localhost:3001/templates", {
                    headers: {"Authorization": "Basic dGVzdDp0ZXN0"}
                })
                    .then(response => response.json())
                    .then(data => setState(data));
            }
        }, [state]);
        if (state === null) {
            // console.log("Loading")
            return <div>Loading...</div>;
        } else {
            // console.log("Rendering")
            return (
                <Masonry columns={5} spacing={2}>
                    {state.map((template, index) => (
                        <div key={index}>
                            <MemeCard file={"http://localhost:3001/images/templates/" + template.file}/>
                        </div>
                    ))}
                </Masonry>
            );
        }
    }

    const INITIAL_STATE_TEMPLATE = {
        id: count_element.toString(),
        src: "http://localhost:3001/images/templates/advice_yoda_gives.jpg",
    };

    const [show, setShow] = useState(false);
    // const [images, setImages] = useState(INITIAL_STATE_IMAGE);
    const [templateSrc, setTemplateSrc] = useState("");
    const [template, setTemplate] = useState(INITIAL_STATE_TEMPLATE);
    const [template_image] = useImage(templateSrc, 'anonymous');
    useEffect(() => {
        if (template_image) {
            setStageSize({width: template_image.naturalWidth, height: template_image.naturalHeight});
        }
    }, [template_image]);
    const [texts, setTexts] = useState([]);
    useEffect(() => {
        // setImages(images);
        setTemplateSrc(templateSrc);
        setTemplate(template);
        setTexts(texts);
    }, [texts, template, templateSrc]);

    const onResize = (event, {element, size}) => {
        setStageSize(size.width, size.height)
    };



    const addTextOnTopOfImage = (textContent, x, y) => {
        count_element = count_element + 1;
        setTexts(prevTexts => [...prevTexts, {
            id: count_element.toString(),
            text: textContent,
            x: x,
            y: y,
            fontSize: 30,
            fontColor: 'black',
            fontFamily: "Arial",
            backgroundColor: 'white'
        }]);
        console.log(count_element);
    }

    const updateTextFormat = (id, fontSize, fontColor, fontFamily, backgroundColor) => {
        const newTexts = texts.map((text) => {
            if (text.id === id) {
                return {
                    ...text,
                    fontSize: parseInt(fontSize),
                    fontColor: fontColor,
                    fontFamily: fontFamily,
                    backgroundColor: backgroundColor
                };
            } else {
                return text;
            }
        });
        setTexts(newTexts);
        console.log(texts)
    }

    const set_template = () => {
        count_element = count_element + 1;
        setTemplate({
            id: count_element.toString(),
            src: templateSrc
        });
    }

    const [selectedTextId, setSelectedTextId] = useState('');
    const [stageSize, setStageSize] = useState({width: 100, height: 100});

    const stageRef = React.useRef(null);

    // Extra function for handling download
    const handleExport = React.useCallback(() => {
        if (stageRef.current) {
            const url = stageRef.current.toDataURL();
            var link = document.createElement('a');
            link.download = 'MemeImage.png';
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [stageRef]);

    const Template = () => {

        return (
            <Layer>
                <Image key={template.id} image={template_image} x={0} y={0}/>
                {texts.map((text) => (
                    <Text key={text.id} id={text.id} text={text.text} x={text.x} y={text.y}
                          fontSize={text.fontSize}
                          fill={text.fontColor}
                          fontFamily={text.fontFamily}
                          background={text.backgroundColor}
                          draggable
                          onClick={() => setSelectedTextId(text.id)}
                          onDragEnd={(e) => {
                              const id = e.target.id();
                              const newTexts = texts.map((text) => {
                                  if (text.id === id) {
                                      return {...text, x: e.target.x(), y: e.target.y()};
                                  } else {
                                      return text;
                                  }
                              });
                              setTexts(newTexts);
                          }}/>
                ))}
            </Layer>
        )
    };

    const colRef = React.useRef(null);
    const [colWidth, setColWidth] = React.useState(0);
    React.useEffect(() => {
        if (colRef.current) {
            setColWidth(colRef.current.offsetWidth);
        }
    }, []);

    return (
        <>
            <Container>
                <div className="meme-editor-container">
                    <Fragment>
                        <Button variant="primary" onClick={() => setShow(true)}>New Meme</Button>
                        <Button>Save Draft</Button>
                        <Button>Publish</Button>
                        <Button onClick={handleExport}>Download</Button>
                    </Fragment>
                </div>
                <Row>
                    <Col sm={3}>
                        <form onSubmit={event => {
                            event.preventDefault();
                            addTextOnTopOfImage(event.target.elements[0].value, 50, 50);
                        }}>
                            <FormControl type="text" placeholder="Text"/>
                            <Button type="submit" variant="primary">Add Text</Button>
                        </form>
                        <form onSubmit={event => {
                            event.preventDefault();
                            updateTextFormat(
                                event.target.elements[0].value, // id
                                event.target.elements[1].value, // fontSize
                                event.target.elements[2].value, // fontColor
                                event.target.elements[3].value, // fontFamily
                                event.target.elements[4].value  // backgroundColor
                            );
                        }}>
                            <FormControl type="text" placeholder="Text ID" value={selectedTextId} readOnly/>
                            <FormControl type="number" placeholder="Font Size"/>
                            <FormControl type="text" placeholder="Font Color"/>
                            <FormControl type="text" placeholder="Font Family"/>
                            <FormControl type="text" placeholder="Background Color"/>
                            <Button type="submit" variant="primary">Update Text Format</Button>
                        </form>
                    </Col>
                    <Col sm={9} ref={colRef}>
                        <ResizableBox
                            className="custom-box box"
                            width={200}
                            height={200}
                            handle={<span className="custom-handle custom-handle-se"/>}
                            handleSize={[8, 8]}>
                            <Stage width={stageSize.width} height={stageSize.height} ref={stageRef}>
                                <Template/>
                            </Stage>
                        </ResizableBox>
                    </Col>
                </Row>
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
                            <Tab eventKey="default" title="From Template">
                                <TemplateMasonry/>
                            </Tab>
                            <Tab eventKey="custom" title="Upload an Image">
                                <PictureUpload/>
                            </Tab>
                            <Tab eventKey="url" title="From URL">
                                <PictureUpload/>
                            </Tab>
                        </Tabs>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ImageEditor;
