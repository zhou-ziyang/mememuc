import 'bootstrap/dist/css/bootstrap.min.css';
import './AddMeme.css'
import './Resizable.css'
import Container from "react-bootstrap/Container";
import React, {Fragment, useEffect, useState} from "react";
import {Form, Button, Col, FormControl, Modal, Row, Tab, Tabs} from "react-bootstrap";
import {Masonry} from "@mui/lab";
// import {createRoot} from 'react-dom/client';
import {Image, Layer, Stage, Text, Transformer, Rect} from 'react-konva';
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
                <img className="card-img-top" src={props.file} alt={props.file}
                     onClick={() => {
                         setTemplateSrc(props.file);
                         set_template();
                         setShow(false);
                     }
                     }/>
                {/*<div className="card-body">*/}
                {/*    <Button onClick={() => {*/}
                {/*        setTemplateSrc(props.file);*/}
                {/*        set_template();*/}
                {/*    }*/}
                {/*    }>Use</Button>*/}
                {/*    /!*<Button onClick={() => {*!/*/}
                {/*    /!*    setImage(props.file);*!/*/}
                {/*    /!*    addImage();*!/*/}
                {/*    /!*}}>Insert</Button>*!/*/}
                {/*</div>*/}
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

    // const addImage = (imageSrc, x, y) => {
    //     count_element = count_element + 1;
    //     setImages(prevImages => [...prevImages, {
    //         id: count_element.toString(),
    //         src: templateSrc,
    //         x: x,
    //         y: y
    //     }]);
    // }

    const addTextOnTopOfImage = (textContent, x, y) => {
        count_element = count_element + 1;
        setTexts(prevTexts => [...prevTexts, {
            id: count_element.toString(),
            text: textContent,
            x: x,
            y: y,
            fontSize: 30,
            fontColor: '#000000',
            fontFamily: "Arial",
            backgroundColor: 'white'
        }]);
        // console.log(count_element);
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

    const set_template = () => {
        count_element = count_element + 1;
        setTemplate({
            id: count_element.toString(),
            src: templateSrc
        });
    }

    const [selectedTextId, setSelectedTextId] = useState('');
    const [stageSize, setStageSize] = useState({width: 512, height: 512});

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

    const [selectedId, selectShape] = useState(null);

    const Rectangle = ({shapeProps, isSelected, onSelect, onChange}) => {
        const shapeRef = React.useRef();
        const trRef = React.useRef();

        React.useEffect(() => {
            if (isSelected) {
                // we need to attach transformer manually
                trRef.current.nodes([shapeRef.current]);
                trRef.current.getLayer().batchDraw();
            }
        }, [isSelected]);

        return (
            <React.Fragment>
                <Rect
                    onClick={onSelect}
                    onTap={onSelect}
                    ref={shapeRef}
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
                        const node = shapeRef.current;
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


    const initialRectangles = [
        {
            x: 10,
            y: 10,
            width: 100,
            height: 100,
            fill: 'red',
            id: 'rect1',
        },
        {
            x: 150,
            y: 150,
            width: 100,
            height: 100,
            fill: 'green',
            id: 'rect2',
        },
    ];
    const [rectangles, setRectangles] = React.useState(initialRectangles);
    // const [selectedId, selectShape] = React.useState(null);

    const MemeCanvas = () => {
        return (
            <Layer>
                {/*<Image key={template.id} name={template.id} image={template_image} x={0} y={0} draggable/>*/}
                {/*<Transformer selectedShapeName={template.id}/>*/}
                {rectangles.map((rect, i) => (
                    <Rectangle
                        key={i}
                        shapeProps={rect}
                        isSelected={rect.id === selectedId}
                        onSelect={() => {
                            selectShape(rect.id);
                        }}
                        onChange={(newAttrs) => {
                            const rects = rectangles.slice();
                            rects[i] = newAttrs;
                            setRectangles(rects);
                        }}
                    />
                ))}
                {/*<ImageElement/>*/}
                {texts.map((text) => {
                    const updateFormatElement = () => {
                        setSelectedTextId(text.id);
                        document.getElementsByName('fontSize')[0].value = text.fontSize;
                        document.getElementsByName('fontColor')[0].value = text.fontColor;
                        document.getElementsByName('fontFamily')[0].value = text.fontFamily;
                        // document.getElementsByName('backgroundColor')[0].value = text.backgroundColor;
                    }
                    return (
                        <Text key={text.id} id={text.id} text={text.text} x={text.x} y={text.y}
                              fontSize={text.fontSize}
                              fill={text.fontColor}
                              fontFamily={text.fontFamily}
                              background={text.backgroundColor}
                              draggable
                              onMouseDown={(e) => {
                                  updateFormatElement();
                              }}
                              onDblClick={(e) => {
                                  const newTextContent = window.prompt('Enter new text', text.text);
                                  if (newTextContent) {
                                      updateTextContent(text.id, newTextContent);
                                  }
                              }}
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
                    );
                })}
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
                        <Button variant="primary" onClick={() => setShow(true)}>Insert Image</Button>
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
                            {/*<input type="color" name="backgroundColor" title="Choose your color"/>*/}
                        </form>
                    </Col>
                    <Col sm={9} ref={colRef}>
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
                                <MemeCanvas/>
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
                    <Modal.Title id="example-custom-modal-styling-title">Insert Image</Modal.Title>
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
