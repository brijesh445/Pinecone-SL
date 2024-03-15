import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./component/NavBar/NavBar";
import Overview from "./component/Overview/Overview";
import NodeItem from "./component/NodeItem/NodeItem";
import IOTDumps from "./component/Iot_Dumps/Iot_Dumps";

import "./App.css";

export function App() {
    return (
        <>
            <NavBar />
            <BrowserRouter>
                <Routes>
                    <Route path="/overview" element={<Overview />}></Route>
                    <Route path="/room" element={<NodeItem />} />
                    <Route path="/iot_dumps" element={<IOTDumps />} />
                    <Route
                        path="*"
                        element={<Navigate to="/overview" />}
                    />
                </Routes>
            </BrowserRouter>
        </>
    );
}
