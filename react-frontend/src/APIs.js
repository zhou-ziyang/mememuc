import 'bootstrap/dist/css/bootstrap.min.css';
import {Container} from "react-bootstrap";
import React from "react";
import Table from 'react-bootstrap/Table';
import {useEffect, useState} from 'react';

function APIs() {
    const [jsonHTML, setJsonHTML] = useState(null);

    useEffect(() => {
        const jsonObj = {
            "imageUrl": "https://www.seo-kueche.de/wp-content/uploads/forever-alone-meme.jpg",
            "textSets": [
                [
                    { "text": "This is ...", "size": "40px", "position": { "x": 50, "y": 70 }, "color": "black" },
                    { "text": "Awesomeeeeee", "size": "80px", "position": { "x": 50, "y": 350 }, "color": "red" }
                ],
                [
                    { "text": "Are you", "size": "60px", "position": { "x": 50, "y": 70 }, "color": "green" },
                    { "text": "kidding me?", "size": "40px", "position": { "x": 40, "y": 120 }, "color": "black" },
                    { "text": "???", "size": "50px", "position": { "x": 400, "y": 60 }, "color": "red" }
                ]
            ]
        };
        setJsonHTML(JSON.stringify(jsonObj, null, 2).replace(/\\n/g, "<br/>").replace(/ /g, "&nbsp;"))
    }, []);

    return (
        <Container>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>API</th>
                    <th>URL</th>
                    <th>Headers</th>
                    <th>JSON</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>1</td>
                    <td>Generate Memes</td>
                    <td>http://localhost:3001/memes/generate</td>
                    <td>"Authorization": "Basic dGVzdDp0ZXN0"</td>
                    <td>
                    <pre dangerouslySetInnerHTML={{ __html: jsonHTML }}></pre>
                    </td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Retrieve Memes</td>
                    <td>http://localhost:3001/memes/?order=desc&n=4&sortBy=date&title=man</td>
                    <td>"Authorization": "Basic dGVzdDp0ZXN0"</td>
                    <td></td>
                </tr>
                </tbody>
            </Table>
        </Container>
    );
}

export default APIs;
