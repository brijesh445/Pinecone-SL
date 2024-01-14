/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import axios from "axios";
import laurent from '../../assets/laurent.jpg';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
}));

const Overview = () => {

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [list, setList] = useState([]);
    const [header, setHeader] = useState("");

    const label = { inputProps: { "aria-label": "Switch demo" } };

    const serverURL = process.env.REACT_APP_SERVER_URL; // || "http://localhost:3000";

    const fetchPlaceList = async () => {
        try {
            const response = await axios.get(`${serverURL}/iot_dumps/place_id_list`);
            const data = response.data[0].list_of_place_id;
            setList(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setList([]);
        }
        return [];
    };

    const fetchDeviceList = async () => {
        try {
            const response = await axios.get(`${serverURL}/iot_dumps/device_name_list`);
            const data = response.data[0].list_of_device_name;
            setList(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setList([]);
        }
    };

    useEffect(() => {
        const value = searchParams.get('fetch')
            ? (searchParams.get('fetch') === "device" ? "device" : "place")
            : "place";

        if (value === "device") {
            fetchDeviceList();
        } else {
            fetchPlaceList();
        }

        setHeader(value);

    }, [searchParams, header]);


    return (
        <>
            <Box marginTop={5} />

            <Typography
                variant="h4"
                noWrap
                component="div"
                sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
            >
                {(header === "device") ? "List of Devices" : "List of Places"}
            </Typography>

            <Grid container spacing={3} marginTop={2}>
                {
                    list.map((item, index) => (
                        <Grid key={index} item xs={4}>
                            <Item>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <div style={{ marginRight: "20px" }}>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <h1 className="Header">{item}</h1>
                                            {/* <p className="DeviceID">Device ID: {device_name_list && device_name_list[index]}</p> */}
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <p className="Status">Status: </p>
                                                <Switch {...label} defaultChecked />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <img
                                            src={laurent}
                                            alt="Laurent"
                                            style={{ alignSelf: "flex-end" }}
                                        />
                                    </div>
                                </div>

                                <Button
                                    variant="outlined"
                                    className="ViewButton"
                                    onClick={() => navigate(`/room?type=${header}&filter=${item}`)}
                                >
                                    View
                                </Button>
                            </Item>
                        </Grid>
                    ))
                }
            </Grid>
        </>
    );
}

export default Overview;
