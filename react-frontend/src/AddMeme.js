import 'bootstrap/dist/css/bootstrap.min.css';
import './AddMeme.css'
import './Resizable.css'
// import Container from "react-bootstrap/Container";
import React, {Fragment, useEffect, useState, useRef, useCallback} from "react";
import {Form, Button, Col, FormControl, Modal, Row, Tab, Tabs, Container} from "react-bootstrap";
import {Masonry} from "@mui/lab";
import {Image, Layer, Stage, Text, Transformer, Rect, Label, Tag, Line} from 'react-konva';
import useImage from 'use-image';
import {ResizableBox} from 'react-resizable';
import Webcam from "react-webcam";
import {useHotkeys} from 'react-hotkeys-hook';
import imageCompression from 'browser-image-compression';
import {Divider} from "@mui/material";
import {useLocation} from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_WIDTH = 512;
const DEFAULT_HEIGHT = 512;

const MemeCanvas = (props) => {
    const MemeImage = ({shapeProps, isSelected, onSelect, onChange}) => {
        const memeImageRef = React.useRef();
        const trRef = React.useRef();

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
    let location = useLocation();
    // const queryParams = new URLSearchParams(location.search);
    const mid = location.search.split('=')[1];
    // console.log(location.search.split('=')[1])

    const [title, setTitle] = React.useState("Enter Title");
    const [description, setDescription] = React.useState("Enter Description");

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    }

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    }

    function MemeCard(props) {
        return (
            <div className="card">
                <img className="card-img-top" src={props.file} alt={props.file}/>
                {/*<ButtonGroup aria-label="Meme Controls">*/}
                <Button variant="secondary"
                        onClick={() => {
                            // setAttributes({x: 0, y: 0});
                            setToRenderTemplate(true);
                            setImageSrc(props.file);
                            setShow(false);
                        }
                        }>Set as Template</Button>
                <Button variant="secondary"
                        onClick={() => {
                            // setAttributes({x: 0, y: 0});
                            setToRenderImage(true);
                            setImageSrc(props.file);
                            setShow(false);
                        }
                        }>Insert</Button>
                {/*</ButtonGroup>*/}
            </div>
        )
    }

    function TemplateMasonry() {
        const [state, setState] = React.useState(null);
        // console.log(localStorage.getItem('basicauthtoken'));
        useEffect(() => {
            if (state === null) {
                fetch("http://localhost:3001/templates", {
                    headers: {"Authorization": localStorage.getItem('basicauthtoken')}
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

    const addImage = (image, x, y, isTemplate = false, width=null, height=null, rotation=null) => {
        // console.log(image);
        const aspectRatio = image.naturalWidth / image.naturalHeight;
        const canvasAspectRatio = stageSize.width / stageSize.height;
        let newWidth = width;
        if (newWidth === null)
            newWidth = aspectRatio > canvasAspectRatio ? stageSize.width : stageSize.height * aspectRatio;
        let newHeight = height;
        if (newHeight === null)
            newHeight = aspectRatio < canvasAspectRatio ? stageSize.height : stageSize.width / aspectRatio;

        if (isTemplate) {
            // When adding a template, clear out the existing template(s)
            setImages(prevImages => prevImages.filter(image => !image.isTemplate));
        }

        setImages(prevImages => [...prevImages, {
            id: crypto.randomUUID(),
            image: image,
            width: newWidth,
            height: newHeight,
            x: x,
            y: y,
            isTemplate: isTemplate,
            rotation: rotation
        }]);
        // console.log(images);
    }

    const [show, setShow] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [image, status] = useImage(imageSrc, 'anonymous');
    const [toRenderImage, setToRenderImage] = useState(false);
    const [toRenderTemplate, setToRenderTemplate] = useState(false);
    const [images, setImages] = useState([]);
    const [size, setSize] = useState(300);

    useEffect(() => {
        if (status === 'loaded' && toRenderImage) {
            addImage(image, 0, 0);
            setToRenderImage(false);
        }
    }, [image, toRenderImage]);

    useEffect(() => {
        if (status === 'loaded' && toRenderTemplate) {
            addImage(image, 0, 0, true);
            setToRenderTemplate(false);
        }
    }, [image, toRenderTemplate]);

    const [texts, setTexts] = useState([]);

    const recoverImages = (image) => {
        const imageObject = document.createElement('img');
        imageObject.src = image.src;
        imageObject.crossOrigin = "anonymous";
        addImage(imageObject, image.x, image.y, image.isTemplate, image.width, image.height, image.rotation);
    };

    const recoverTexts = (text) => {
        addTextOnTopOfImage(text.text, text.x, text.y, text.fontSize, text.fontColor, text.fontFamily, text.backgroundColor);
    };

    const recovered = useRef(false);

    useEffect(() => {
        // Fetch meme draft by mid
        if (recovered.current) return;
        if (mid) {
            fetch(`http://localhost:3001/meme/data/${mid}`)
                .then(response => response.json())
                .then((memeDraft) => {
                    // To handle cases where draftState isn't stored or empty
                    if (memeDraft && memeDraft.draftState) {
                        // draftState is stored as a serialized string, so we need to parse it back into an object
                        const draftState = JSON.parse(memeDraft.draftState);
                        draftState.images.map(image => recoverImages(image));
                        draftState.texts.map(text => recoverTexts(text));
                        console.log(draftState.texts);
                        setStageSize(draftState.stageSize);
                        recovered.current = true;
                    }
                });
        }
    }, []);

    useEffect(() => {
        setImages(images);
        setTexts(texts);
    }, [images, texts]);

    const webcamRef = useRef(null);

    const capture = useCallback(
        (purpose) => {
            const imageSrc = webcamRef.current.getScreenshot();
            if (purpose === "template") {
                // setAttributes({x: 0, y: 0, isTemplate: true});
                setToRenderTemplate(true);
            } else {
                // setAttributes({x: 0, y: 0});
                setToRenderImage(true);
            }
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
                <Button variant="primary" onClick={() => capture("template")}>
                    Set as Template
                </Button>
                <Button variant="primary" onClick={() => capture("insert")}>
                    Insert
                </Button>
            </>
        );
    };

    const TemplatePaint = () => {
        const [tool, setTool] = React.useState("pen");
        const [lines, setLines] = React.useState([]);

        const isDrawing = React.useRef(false);

        const paintRef = React.useRef(null);

        // id: UniqueId(),

        const handleMouseDown = (e) => {
            isDrawing.current = true;
            const pos = e.target.getStage().getPointerPosition();
            setLines([...lines, {tool, points: [pos.x, pos.y]}]);
        };

        const handleMouseMove = (e) => {
            // no drawing - skipping
            if (!isDrawing.current) {
                return;
            }
            const stage = e.target.getStage();
            const point = stage.getPointerPosition();
            let lastLine = lines[lines.length - 1];
            // add point
            lastLine.points = lastLine.points.concat([point.x, point.y]);

            // replace last
            lines.splice(lines.length - 1, 1, lastLine);
            setLines(lines.concat());
        };

        const handleMouseUp = () => {
            isDrawing.current = false;
        };

        const insertDrawing = useCallback(
            (purpose) => {
                const imageSrc = paintRef.current.toDataURL();
                if (purpose === "template")
                    setToRenderTemplate(true);
                else
                    setToRenderImage(true);
                setImageSrc(imageSrc);
                setShow(false);
            },
            [paintRef]
        );

        return (
            <>
                <div className={"paint"}>
                    <Stage
                        width={window.innerWidth}
                        height={300}
                        onMouseDown={handleMouseDown}
                        onMousemove={handleMouseMove}
                        onMouseup={handleMouseUp}
                        ref={paintRef}
                    >
                        <Layer>
                            {/*<Text text="Just start drawing" x={5} y={30} />*/}
                            {lines.map((line, i) => (
                                <Line
                                    key={i}
                                    points={line.points}
                                    stroke="#df4b26"
                                    strokeWidth={5}
                                    tension={0.5}
                                    lineCap="round"
                                    globalCompositeOperation={
                                        line.tool === "eraser" ? "destination-out" : "source-over"
                                    }
                                />
                            ))}
                        </Layer>
                    </Stage>
                </div>

                <select
                    // style={{ position: "absolute", top: "5px", left: "5px" }}
                    value={tool}
                    onChange={(e) => {
                        setTool(e.target.value);
                    }}
                >
                    <option value="pen">Pen</option>
                    <option value="eraser">Eraser</option>
                </select>
                <Button variant="primary" onClick={() => insertDrawing("template")}>
                    Set as Template
                </Button>
                <Button variant="primary" onClick={() => insertDrawing("insert")}>
                    Insert
                </Button>
            </>
        );
    };

    function PictureUpload() {
        const [file, setFile] = useState(null);

        const handleFileChange = (event) => {
            setFile(event.target.files[0]);
        };

        const handleSubmit = async (event, purpose) => {
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
                    headers: {"Authorization": localStorage.getItem('basicauthtoken')}
                });

                if (response.ok) {
                    // alert('File uploaded successfully.');
                    const result = await response.json();
                    const image_src = "http://localhost:3001/" + result.file.path.slice(7)
                    console.log(event.purpose)
                    if (purpose === "template")
                        setToRenderTemplate(true);
                    else
                        setToRenderImage(true);
                    setImageSrc(image_src);
                    setShow(false);
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
            <form>
                <FormControl
                    type="file"
                    onChange={handleFileChange}
                    accept=".jpg,.png,.jpeg,.gif"
                />
                <Button type="submit" variant="primary" purpose={"template"}
                        onClick={(e) => handleSubmit(e, "template")}>
                    Set as Template
                </Button>
                <Button type="submit" variant="primary" purpose={"insert"} onClick={(e) => handleSubmit(e, "insert")}>
                    Insert
                </Button>
            </form>
        );
    }


    const addTextOnTopOfImage = (textContent, x, y, fontSize=30, fontColor='#000000', fontFamily= "Arial", backgroundColor='none') => {
        setTexts(prevTexts => [...prevTexts, {
            id: crypto.randomUUID(),
            text: textContent,
            x: x,
            y: y,
            fontSize: fontSize,
            fontColor: fontColor,
            fontFamily: fontFamily,
            backgroundColor: backgroundColor
        }]);
        console.log(texts);
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
    const handleExport = React.useCallback(async () => {
        if (stageRef.current) {
            let url = stageRef.current.toDataURL();

            const response = await fetch(url);
            let file = await response.blob();
            const targetSize = parseInt(document.getElementById("size-input").value);

            const options = {
                maxSizeMB: targetSize / 1024,
                // useWebWorker: true,
                maxIteration: 30,
            }

            console.log(file.size / 1024, targetSize);

            if (file.size / 1024 > targetSize) {
                file = await imageCompression(file, options);
            }


            const anchor = document.createElement('a');
            const urlBlob = URL.createObjectURL(file);
            anchor.href = urlBlob;
            anchor.download = "meme.png";
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);

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
        // console.log(draft);
        if (stageRef.current) {
            // console.log(draft);
            const url = stageRef.current.toDataURL();
            fetch(url)
                .then(res => res.blob())
                .then(async blob => {
                    const formData = new FormData();
                    const date = new Date();
                    if (mid) {
                        formData.append('_id', mid);
                    }
                    formData.append('file', blob, localStorage.getItem("username") + '-' + date.toISOString().replace(/:/g, '-') + '.png');
                    // Add additional properties to formData
                    formData.append('title', title);
                    try {
                        formData.append('template', images.find(image => image.isTemplate).image.src);
                    } catch (e) {
                        alert('Please add a template image.');
                        return;
                    }
                    formData.append('description', description);
                    formData.append('private', false);
                    formData.append('draft', draft);
                    formData.append('date', date);

                    if (draft) {
                        // const draftState = {images, texts};
                        const draftState = {
                            images: images.map(image => ({
                                id: image.id,
                                src: image.image.src,
                                width: image.width,
                                height: image.height,
                                x: image.x,
                                y: image.y,
                                isTemplate: image.isTemplate
                            })),
                            texts: texts,
                            // count_element: count_element,
                            stageSize: stageSize
                        };
                        const draftStateSerialized = JSON.stringify(draftState);
                        // console.log(draftStateSerialized);

                        // Append the serialized meme state to the form data
                        formData.append('draftState', draftStateSerialized);
                    }

                    try {
                        const response = await fetch('http://localhost:3001/publish', {
                            method: 'POST',
                            body: formData,
                            headers: {"Authorization": localStorage.getItem('basicauthtoken')}
                        });

                        if (response.ok) {
                            // alert('Meme published successfully.');
                            console.error('Meme published successfully.');
                            window.location.href = "/";
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

    // const handleDraft = async () => {
    //     console.log("draft");
    //     if (stageRef.current) {
    //         // console.log(draft);
    //         const url = stageRef.current.toDataURL();
    //         // console.log(url)
    //         fetch(url)
    //             .then(res => res.blob())
    //             .then(async blob => {
    //                 const formData = new FormData();
    //                 const date = new Date();
    //                 formData.append('title', title);
    //                 formData.append('template', images.find(image => image.isTemplate).image.src);
    //                 formData.append('description', description);
    //                 formData.append('date', date);
    //
    //                 // let's convert the images and texts state to string so that it can be saved into database
    //                 const memeState = {images, texts};
    //                 const memeStateSerialized = JSON.stringify(memeState);
    //                 console.log(memeStateSerialized);
    //
    //                 // Append the serialized meme state to the form data
    //                 formData.append('memeState', memeStateSerialized);
    //                 console.log(formData)
    //
    //                 try {
    //                     const response = await fetch('http://localhost:3001/drafts/save', {
    //                         method: 'POST',
    //                         body: formData,
    //                         headers: {"Authorization": localStorage.getItem('basicauthtoken')}
    //                     });
    //
    //                     if (response.ok) {
    //                         console.error('Draft saved successfully.');
    //                     } else {
    //                         throw new Error('Draft saving failed.');
    //                     }
    //                 } catch (error) {
    //                     console.error(error);
    //                     alert('Draft saving failed.');
    //                 }
    //             });
    //     }
    // };


    const removeAllNonTemplateImagesAndTexts = () => {
        setImages(prevImages => prevImages.filter(image => image.isTemplate));
        setTexts([]);
    }


    return (
        <>
            <Container>
                <div className="meme-editor-container">
                    <Fragment>
                        <Button variant="primary" onClick={() => setShow(true)}>Gallery</Button>
                        <Button onClick={() => handlePublish(true)}>Save Draft</Button>
                        <Button onClick={() => handlePublish(false)}>Publish</Button>
                        {/*<Form.Group controlId="formFileSize">*/}
                        <label>File Size (KB)</label>
                        <input id={"size-input"} type="number" value={size} onChange={e => setSize(e.target.value)}
                               placeholder="Enter file size in KB"/>
                        {/*</Form.Group>*/}
                        <Button onClick={handleExport}>Download</Button>
                    </Fragment>
                </div>
                <Row>
                    <Col sm={3}>
                        <Form>
                            <FormControl type="text" placeholder="Enter Title" onChange={handleTitleChange}
                                         value={title}/>
                            <FormControl type="text" placeholder="Enter Description" onChange={handleDescriptionChange}
                                         value={description}/>
                        </Form>
                        <form onSubmit={event => {
                            event.preventDefault();
                            addTextOnTopOfImage(event.target.elements[0].value, 50, 50);
                        }}>
                            <FormControl type="text" placeholder="Text"/>
                            <Button type="submit" variant="primary">Add Text</Button>
                        </form>
                        <form>
                            {/*<FormControl type="text" placeholder="Text ID" value={selectedTextId} readOnly/>*/}
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
                            <Button onClick={() => updateBackgroundColor(selectedTextId, "none")}>Remove
                                Background</Button>

                            <Divider/>

                            <Button onClick={removeAllNonTemplateImagesAndTexts}>Clear</Button>
                            <Button onClick={deleteSelectedImage}>Delete Selected</Button>
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
                                    if (event.nativeEvent.submitter.name === "url-template")
                                        setToRenderTemplate(true);
                                    else
                                        setToRenderImage(true);
                                    setImageSrc(url);
                                    setShow(false);
                                }}>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Control type="text" placeholder="Enter URL"/>
                                    </Form.Group>
                                    <Button variant="primary" type="submit" name="url-template">
                                        Set as Template
                                    </Button>
                                    <Button variant="primary" type="submit" name="url-insert">
                                        Insert
                                    </Button>
                                </Form>
                            </Tab>
                            <Tab eventKey="webcam" title="From Webcam">
                                <WebcamCapture/>
                            </Tab>
                            {/*<Tab eventKey="screenshot" title="Screenshot from URL">*/}
                            {/*    <Form onSubmit={event => {*/}
                            {/*        event.preventDefault();*/}

                            {/*        const encodedParams = new URLSearchParams();*/}
                            {/*        encodedParams.set('html', '<REQUIRED>');*/}
                            {/*        const url = 'https://api.screenshotone.com/take?access_key=aXb8vQfDtLyFjA&url=https%3A%2F%2Fstripe.com&viewport_width=1920&viewport_height=1280&device_scale_factor=1&image_quality=80&format=jpg&block_ads=true&block_cookie_banners=true&full_page=false&block_trackers=true&block_banners_by_heuristics=false&delay=0&timeout=60';*/}
                            {/*        fetch(url, {*/}
                            {/*            method: 'POST',*/}
                            {/*            headers: {*/}
                            {/*                'content-type': 'application/x-www-form-urlencoded',*/}
                            {/*                'X-RapidAPI-Key': 'b1eab662f6msh2cffc30ce352155p118be9jsn41275070431e',*/}
                            {/*                'X-RapidAPI-Host': 'ApiLeapzakutynskyV1.p.rapidapi.com'*/}
                            {/*            },*/}
                            {/*            body: encodedParams*/}
                            {/*        })*/}
                            {/*            .then(response => {*/}
                            {/*                if (!response.ok) {*/}
                            {/*                    throw new Error('Network response was not ok');*/}
                            {/*                }*/}
                            {/*                console.log(response);*/}
                            {/*            })*/}
                            {/*            .catch(error => {*/}
                            {/*                console.error('There has been a problem with your fetch operation:', error);*/}
                            {/*            });*/}
                            {/*        // setImageSrc(url);*/}
                            {/*    }}>*/}
                            {/*        <Form.Group className="mb-3" controlId="formBasicEmail">*/}
                            {/*            <Form.Control type="text" placeholder="Enter URL"/>*/}
                            {/*        </Form.Group>*/}
                            {/*        <Button variant="primary" type="submit">*/}
                            {/*            Submit*/}
                            {/*        </Button>*/}
                            {/*    </Form>*/}
                            {/*</Tab>*/}
                            <Tab eventKey="imgflip" title="From Imgflip">
                                <ImgflipMasonry/>
                            </Tab>
                            <Tab eventKey="draw" title="Draw">
                                <TemplatePaint/>
                            </Tab>
                        </Tabs>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ImageEditor;