import 'bootstrap/dist/css/bootstrap.min.css';
import './AddMeme.css'
import './Resizable.css'
import Container from "react-bootstrap/Container";
import React, {Fragment, useEffect, useState, useRef, useCallback} from "react";
import {Form, Button, Col, FormControl, Modal, Row, Tab, Tabs} from "react-bootstrap";
import {Masonry} from "@mui/lab";
// import {createRoot} from 'react-dom/client';
import {Image, Layer, Stage, Text, Transformer, Rect, Label, Tag} from 'react-konva';
import useImage from 'use-image';
import {ResizableBox} from 'react-resizable';
import Webcam from "react-webcam";
import {useHotkeys} from 'react-hotkeys-hook';


const DEFAULT_WIDTH = 512;
const DEFAULT_HEIGHT = 512;
let count_element = 0;

function UniqueId() {
    count_element += 1
    // console.log(count_element)
    return count_element.toString();
}

const MemeCanvas = (props) => {
    const MemeImage = ({shapeProps, isSelected, onSelect, onChange}) => {
        const memeImageRef = React.useRef();
        const trRef = React.useRef();

        // console.log(status);

        React.useEffect(() => {
            if (isSelected) {
                // we need to attach transformer manually
                trRef.current.nodes([memeImageRef.current]);
                trRef.current.getLayer().batchDraw();
            }
        }, [isSelected]);

        return (
            <React.Fragment>
                <Image
                    onClick={onSelect}
                    onTap={onSelect}
                    ref={memeImageRef}
                    {...shapeProps}
                    draggable
                    onDragEnd={(e) => {
                        onChange({
                            ...shapeProps,
                            x: e.target.x(),
                            y: e.target.y(),
                        });
                    }}
                    onTransformEnd={(e) => {
                        // transformer is changing scale of the node
                        // and NOT its width or height
                        // but in the store we have only width and height
                        // to match the data better we will reset scale on transform end
                        const node = memeImageRef.current;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();

                        // we will reset it back
                        node.scaleX(1);
                        node.scaleY(1);
                        onChange({
                            ...shapeProps,
                            x: node.x(),
                            y: node.y(),
                            // set minimal value
                            width: Math.max(5, node.width() * scaleX),
                            height: Math.max(node.height() * scaleY),
                            rotation: node.rotation(),
                        });
                    }}
                />
                {isSelected && (
                    <Transformer
                        ref={trRef}
                        flipEnabled={false}
                        boundBoxFunc={(oldBox, newBox) => {
                            // limit resize
                            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                )}
            </React.Fragment>
        );
    };

    return (
        <Layer>
            <Rect
                fill={"#ffffff"}
                width={props.stageSize.width}
                height={props.stageSize.height}
                onClick={() => {
                    props.selectShape(null);
                }}
            />
            {props.images.map((image, i) => (
                <MemeImage
                    key={image.id}
                    shapeProps={image}
                    isSelected={image.id === props.selectedId}
                    onSelect={() => {
                        props.selectShape(image.id);
                    }}
                    onChange={(newAttrs) => {
                        const imgs = props.images.slice();
                        imgs[i] = newAttrs;
                        props.setImages(imgs);
                    }}
                />
            ))}
            {props.texts.map((text) => {
                const updateFormatElement = () => {
                    props.selectText(text.id);
                    document.getElementsByName('fontSize')[0].value = text.fontSize;
                    document.getElementsByName('fontColor')[0].value = text.fontColor;
                    document.getElementsByName('fontFamily')[0].value = text.fontFamily;
                    document.getElementsByName('backgroundColor')[0].value = text.backgroundColor === "none" ? "#ffffff" : text.backgroundColor;
                }
                return (
                    <Label key={text.id} id={text.id} x={text.x} y={text.y}
                           draggable
                           onMouseDown={(e) => {
                               updateFormatElement();
                           }}
                           onDblClick={(e) => {
                               const newTextContent = window.prompt('Enter new text', text.text);
                               if (newTextContent) {
                                   props.updateTextContent(text.id, newTextContent);
                               }
                           }}
                           onDragEnd={(e) => {
                               const id = e.target.id();
                               const newTexts = props.texts.map((text) => {
                                   if (text.id === id) {
                                       return {...text, x: e.target.x(), y: e.target.y()};
                                   } else {
                                       return text;
                                   }
                               });
                               props.setTexts(newTexts);
                           }}>
                        <Tag fill={(text.backgroundColor === "none") ? "#ffffff" : text.backgroundColor}
                             opacity={(text.backgroundColor === "none") ? 0 : 1}/>
                        <Text text={text.text} fontSize={text.fontSize} fill={text.fontColor}
                              fontFamily={text.fontFamily}/>
                    </Label>
                );
            })}
        </Layer>
    )
};

function ImageEditor() {
    function MemeCard(props) {
        return (
            <div className="card">
                <img className="card-img-top" src={props.file} alt={props.file}
                     onClick={() => {
                         setToRenderImage(true);
                         setImageSrc(props.file);
                         setShow(false);
                     }
                     }/>
            </div>
        )
    }

    function TemplateMasonry() {
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
            return <div>Loading...</div>;
        } else {
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

    function ImgflipMasonry() {
        const [state, setState] = React.useState(null);
        useEffect(() => {
            if (state === null) {
                fetch("https://api.imgflip.com/get_memes")
                    .then(response => response.json())
                    .then(data => setState(data.data.memes));
            }
        }, [state]);
        if (state === null) {
            return <div>Loading...</div>;
        } else {
            return (
                <Masonry columns={5} spacing={2}>
                    {state.map((template, index) => (
                        <div key={index}>
                            <MemeCard file={template.url}/>
                        </div>
                    ))}
                </Masonry>
            );
        }
    }

    const addImage = (image, x, y) => {
        const aspectRatio = image.naturalWidth / image.naturalHeight;
        const canvasAspectRatio = stageSize.width / stageSize.height;
        const newWidth = aspectRatio > canvasAspectRatio ? stageSize.width : stageSize.height * aspectRatio;
        const newHeight = aspectRatio < canvasAspectRatio ? stageSize.height : stageSize.width / aspectRatio;
        setImages(prevImages => [...prevImages, {
            id: UniqueId(),
            image: image,
            width: newWidth,
            height: newHeight,
            x: x,
            y: y
        }]);
        // console.log(images);
    }

    const [show, setShow] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [image, status] = useImage(imageSrc, 'anonymous');
    const [toRenderImage, setToRenderImage] = useState(false);
    const [images, setImages] = useState([]);

    useEffect(() => {
        if (status === 'loaded') {
            // console.log(status)
            addImage(image, 0, 0);
            setToRenderImage(false);
        }
    }, [image, toRenderImage]);

    const [texts, setTexts] = useState([]);
    useEffect(() => {
        setImages(images);
        setTexts(texts);
    }, [images, texts]);

    const webcamRef = useRef(null);

    const capture = useCallback(
        () => {
            const imageSrc = webcamRef.current.getScreenshot();
            setToRenderImage(true);
            setImageSrc(imageSrc);
            setShow(false);
        },
        [webcamRef]
    );

    const [activeTab, setActiveTab] = useState('');

    const WebcamCapture = () => {
        return (
            <>
                {activeTab === 'webcam' && <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg"/>}
                <Button variant="primary" onClick={capture}>
                    Capture photo
                </Button>
            </>
        );
    };

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
                const response = await fetch('http://localhost:3001/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {"Authorization": "Basic dGVzdDp0ZXN0"}
                });

                if (response.ok) {
                    // alert('File uploaded successfully.');
                    const result = await response.json();
                    const image_src = "http://localhost:3001/" + result.file.path.slice(7)
                    setToRenderImage(true);
                    setImageSrc(image_src);
                    // console.log(image_src);
                } else {
                    // throw new Error('File upload failed.');
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


    const addTextOnTopOfImage = (textContent, x, y) => {
        setTexts(prevTexts => [...prevTexts, {
            id: UniqueId(),
            text: textContent,
            x: x,
            y: y,
            fontSize: 30,
            fontColor: '#000000',
            fontFamily: "Arial",
            backgroundColor: 'none'
        }]);
    }

    const updateTextContent = (id, newTextContent) => {
        const newTexts = texts.map((text) => {
            if (text.id === id) {
                return {
                    ...text,
                    text: newTextContent
                };
            } else {
                return text;
            }
        });
        setTexts(newTexts);
    }

    const updateTextSize = (id, fontSize) => {
        const newTexts = texts.map((text) => {
            if (text.id === id) {
                return {
                    ...text,
                    fontSize: parseInt(fontSize)
                };
            } else {
                return text;
            }
        });
        setTexts(newTexts);
    }

    const updateTextColor = (id, fontColor) => {
        const newTexts = texts.map((text) => {
            if (text.id === id) {
                return {
                    ...text,
                    fontColor: fontColor
                };
            } else {
                return text;
            }
        });
        setTexts(newTexts);
    }

    const updateTextFont = (id, fontFamily) => {
        const newTexts = texts.map((text) => {
            if (text.id === id) {
                return {
                    ...text,
                    fontFamily: fontFamily
                };
            } else {
                return text;
            }
        });
        setTexts(newTexts);
    }

    const updateBackgroundColor = (id, backgroundColor) => {
        const newTexts = texts.map((text) => {
            if (text.id === id) {
                return {
                    ...text,
                    backgroundColor: backgroundColor
                };
            } else {
                return text;
            }
        });
        setTexts(newTexts);
    }

    const [selectedTextId, selectText] = useState('');
    const [stageSize, setStageSize] = useState({width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT});

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

    const [selectedShapeId, selectShape] = useState(null);

    // This function will remove the selected image
    const deleteSelectedImage = () => {
        if (selectedShapeId) {
            setImages(prevImages => prevImages.filter(image => image.id !== selectedShapeId));
            selectShape(null);  // deselect the image
        }
    };

    // Use the 'useHotkeys' hook in your component to listen for the 'Delete' key press
    useHotkeys('backspace', deleteSelectedImage);

    const handlePublish = async (draft) => {
        console.log(draft);
        if (stageRef.current) {
            console.log(draft);
            const url = stageRef.current.toDataURL();
            fetch(url)
                .then(res => res.blob())
                .then(async blob => {
                    const formData = new FormData();
                    const date = new Date();
                    formData.append('file', blob, 'TEST-AUTHOR' + '-' + date.toISOString().replace(/:/g, '-') + '.png');
                    // Add additional properties to formData
                    formData.append('title', 'your_title_here');
                    formData.append('description', 'your_description_here');
                    // formData.append('author', 'TEST-AUTHOR');
                    formData.append('private', false);
                    formData.append('draft', draft);
                    formData.append('date', date);
                    formData.append('vote', JSON.stringify([]));
                    formData.append('comment', JSON.stringify([]));

                    try {
                        const response = await fetch('http://localhost:3001/publish', {
                            method: 'POST',
                            body: formData,
                            headers: {"Authorization": "Basic dGVzdDp0ZXN0"}
                        });

                        if (response.ok) {
                            // alert('Meme published successfully.');
                            console.error('Meme published successfully.');
                        } else {
                            throw new Error('Meme publish failed.');
                        }
                    } catch (error) {
                        console.error(error);
                        alert('Meme publish failed.');
                    }
                });
        }
    };

    return (
        <>
            <Container>
                <div className="meme-editor-container">
                    <Fragment>
                        <Button variant="primary" onClick={() => setShow(true)}>Insert Image</Button>
                        <Button onClick={() => handlePublish(true)}>Save Draft</Button>
                        <Button onClick={() => handlePublish(false)}>Publish</Button>
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
                        <form>
                            <FormControl type="text" placeholder="Text ID" value={selectedTextId} readOnly/>

                            <FormControl type="number" placeholder="Font Size" name={"fontSize"}
                                         onChange={(event) => updateTextSize(selectedTextId, event.target.value)}/>
                            <input type="color" name="fontColor" title="Choose your color"
                                   onChange={(event) => updateTextColor(selectedTextId, event.target.value)}/>
                            <Form.Select aria-label="Font Family" name={"fontFamily"}
                                         onChange={(event) => updateTextFont(selectedTextId, event.target.value)}>
                                <option>Select Font Family</option>
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Georgia">Georgia</option>
                            </Form.Select>
                            <input type="color" name="backgroundColor" title="Choose your color"
                                   onChange={(event) => updateBackgroundColor(selectedTextId, event.target.value)}/>
                            <Button onClick={() => updateBackgroundColor(selectedTextId, "none")}>Remove Background</Button>
                        </form>

                    </Col>
                    <Col sm={9}>
                        <div className="canvas-panel">
                            <ResizableBox
                                className="custom-box box"
                                width={stageSize.width}
                                height={stageSize.height}
                                handle={<span className="custom-handle custom-handle-se"/>}
                                handleSize={[12, 12]}
                                onResize={(event, data) => {
                                    setStageSize({width: data.size.width, height: data.size.height});
                                }}>
                                <Stage width={stageSize.width} height={stageSize.height} ref={stageRef}>
                                    <MemeCanvas stageSize={stageSize}
                                                images={images} setImages={setImages}
                                                selectShape={selectShape} selectedId={selectedShapeId}
                                                texts={texts} setTexts={setTexts}
                                                selectText={selectText} selectedTextId={selectedTextId}
                                                updateTextContent={updateTextContent}/>
                                </Stage>
                            </ResizableBox>
                        </div>
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
                    <Modal.Title id="example-custom-modal-styling-title">Insert Image</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="template_popup_content">
                        <Tabs defaultActiveKey="default" id="uncontrolled-tab-example" className="mb-3"
                              onSelect={key => setActiveTab(key)}>
                            <Tab eventKey="default" title="From Template">
                                <TemplateMasonry/>
                            </Tab>
                            <Tab eventKey="custom" title="Upload an Image">
                                <PictureUpload/>
                            </Tab>
                            <Tab eventKey="url" title="From URL">
                                <Form onSubmit={event => {
                                    event.preventDefault();
                                    const url = 'https://corsproxy.io/?' + encodeURIComponent(event.target.elements[0].value);
                                    setToRenderImage(true);
                                    setImageSrc(url);
                                }}>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Control type="text" placeholder="Enter URL"/>
                                    </Form.Group>
                                    <Button variant="primary" type="submit">
                                        Submit
                                    </Button>
                                </Form>
                            </Tab>
                            <Tab eventKey="webcam" title="From Webcam">
                                <WebcamCapture/>
                            </Tab>
                            <Tab eventKey="screenshot" title="Screenshot from URL">
                                <Form onSubmit={event => {
                                    event.preventDefault();

                                    const encodedParams = new URLSearchParams();
                                    encodedParams.set('html', '<REQUIRED>');
                                    const url = 'https://api.screenshotone.com/take?access_key=aXb8vQfDtLyFjA&url=https%3A%2F%2Fstripe.com&viewport_width=1920&viewport_height=1280&device_scale_factor=1&image_quality=80&format=jpg&block_ads=true&block_cookie_banners=true&full_page=false&block_trackers=true&block_banners_by_heuristics=false&delay=0&timeout=60';
                                    fetch(url, {
                                        method: 'POST',
                                        headers: {
                                            'content-type': 'application/x-www-form-urlencoded',
                                            'X-RapidAPI-Key': 'b1eab662f6msh2cffc30ce352155p118be9jsn41275070431e',
                                            'X-RapidAPI-Host': 'ApiLeapzakutynskyV1.p.rapidapi.com'
                                        },
                                        body: encodedParams
                                    })
                                        .then(response => {
                                            if (!response.ok) {
                                                throw new Error('Network response was not ok');
                                            }
                                            console.log(response);
                                        })
                                        .catch(error => {
                                            console.error('There has been a problem with your fetch operation:', error);
                                        });
                                    // setImageSrc(url);
                                }}>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Control type="text" placeholder="Enter URL"/>
                                    </Form.Group>
                                    <Button variant="primary" type="submit">
                                        Submit
                                    </Button>
                                </Form>
                            </Tab>
                            <Tab eventKey="imgflip" title="From Imgflip">
                                <ImgflipMasonry/>
                            </Tab>
                        </Tabs>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ImageEditor;