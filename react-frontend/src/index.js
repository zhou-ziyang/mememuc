import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import AddMeme from "./AddMeme";
import Layout from "./Layout";
import MyMemes from "./MyMemes";
// import { registerLicense } from '@syncfusion/ej2-base'

// Registering Syncfusion license key
// registerLicense('Onpm run devRg4AjUWIQA/Gnt2VVhkQlFac15JXnxLe0x0RWFab19wflZDal1XVBYiSV9jS31TdEdnWXpcdHRSRmZcWQ==');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route index element={<App/>}/>
                    <Route path="add_meme" element={<AddMeme/>}/>
                    <Route path="my_memes" element={<MyMemes/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
