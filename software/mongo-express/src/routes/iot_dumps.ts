import express from 'express';
import { conn, db } from '../db_conn';
import dotenv from 'dotenv';
dotenv.config();

const collection = process.env.MONGODB_COLLECTION_IOT_FRAMES;

const router = express.Router();

// GET /
// GET /?limit=100
router.get("/", async (req, res) => {
    const limit = req?.query?.limit ? Number(req.query.limit) : 100;
    let results = await db.collection(collection)
        .find({})
        .limit(limit)
        .toArray();
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(results, null, 4)).status(200);
});

// GET /device_name_list
router.get("/device_name_list", async (req, res) => {
    let results = await db.collection(collection).aggregate([
        { $group: { _id: null, list_of_device_name: { $addToSet: "$device_name" } } },
        { $project: { _id: 0 } }
    ])
        .toArray();
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(results, null, 4)).status(200);
})

// GET /place_id_list
router.get("/place_id_list", async (req, res) => {
    let results = await db.collection(collection).aggregate([
        { $group: { _id: null, list_of_place_id: { $addToSet: "$place_id" } } },
        { $project: { _id: 0 } },
    ])
        .toArray();
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(results, null, 4)).status(200);
})

// GET /aggregate_by_sensor
// GET /aggregate_by_sensor?device_name=iot_sensor_3
// GET /aggregate_by_sensor?minutes=10
// GET /aggregate_by_sensor?device_name=iot_sensor_3&minutes=10
router.get("/aggregate_by_sensor", async (req, res) => {
    const minutes = req?.query?.minutes ? Number(req.query.minutes) : 10;
    const sensorName = req?.query?.device_name ?? null;
    const match_aggregator = sensorName ? { $match: { 'device_name': sensorName } } : { $match: { "device_name": { "$exists": true } } };

    const interval = minutes * 60 * 1000;

    let results = await db.collection(collection).aggregate([
        {
            $project: {
                device_id: 1,
                device_name: 1,
                place_id: 1,
                date: 1,
                payload: 1,
            }
        },
        match_aggregator,
        {
            $group: {
                _id: {
                    date: {
                        $toDate: {
                            $subtract: [
                                { $toLong: '$date' },
                                { $mod: [{ $toLong: '$date' }, interval] }
                            ]
                        }
                    },
                    device_name: '$device_name',
                },
                // temperature
                average_temperature: { $avg: '$payload.temperature' },
                min_temperature: { $min: '$payload.temperature' },
                max_temperature: { $max: '$payload.temperature' },
                // humidity
                average_humidity: { $avg: '$payload.humidity' },
                min_humidity: { $min: '$payload.humidity' },
                max_humidity: { $max: '$payload.humidity' },
                // led_status
                current_led_status: { $last: '$payload.led_status' },
                // luminosity
                average_luminosity: { $avg: '$payload.luminosity' },
                min_luminosity: { $min: '$payload.luminosity' },
                max_luminosity: { $max: '$payload.luminosity' },
                // proximity
                average_proximity: { $avg: '$payload.proximity' },
                min_proximity: { $min: '$payload.proximity' },
                max_proximity: { $max: '$payload.proximity' },
                // ldr
                // average_ldr: { $avg: '$payload.light_sensor_reading' },
                // min_ldr: { $min: '$payload.light_sensor_reading' },
                // max_ldr: { $max: '$payload.light_sensor_reading' },
                // count
                count: { $sum: 1 }, // Count of readings
            }
        },
        {
            $sort: {
                '_id.date': -1,
                '_id.device_name': 1,
            }
        },
        {
            $addFields: {
                average_temperature: { $round: ['$average_temperature', 2] }, // Round to 2 decimal places
                average_humidity: { $round: ['$average_humidity', 2] }, // Round to 2 decimal places
                average_proximity: { $round: ['$average_proximity', 2] }, // Round to 2 decimal places
                average_luminosity: { $round: ['$average_luminosity', 2] }, // Round to 2 decimal places
                // average_ldr: { $round: ['$average_ldr', 2] }, // Round to 2 decimal places
            }
        },
        {
            $group: {
                _id: '$_id.device_name',
                data: {
                    $push: {
                        date: '$_id.date',
                        // temperature
                        average_temperature: '$average_temperature',
                        min_temperature: '$min_temperature',
                        max_temperature: '$max_temperature',
                        // humidity
                        average_humidity: '$average_humidity',
                        min_humidity: '$min_humidity',
                        max_humidity: '$max_humidity',
                        // proximity
                        average_proximity: '$average_proximity',
                        min_proximity: '$min_proximity',
                        max_proximity: '$max_proximity',
                        // luminosity
                        average_luminosity: '$average_luminosity',
                        min_luminosity: '$min_luminosity',
                        max_luminosity: '$max_luminosity',
                        // led_status
                        current_led_status: '$current_led_status',
                        // ldr
                        // average_ldr: '$average_ldr',
                        // min_ldr: '$min_ldr',
                        // max_ldr: '$max_ldr',
                        // count
                        count: '$count' // Include count of readings
                    }
                }
            }
        },
        {
            $project: {
                name: '$_id',
                data: 1,
                _id: 0
            }
        }
    ])
        .toArray();

    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(results, null, 4)).status(200);
})

// GET /aggregate_by_place
// GET /aggregate_by_place?device_name=iot_sensor_3
// GET /aggregate_by_place?minutes=10
// GET /aggregate_by_place?device_name=iot_sensor_3&minutes=10
router.get("/aggregate_by_place", async (req, res) => {
    const minutes = req?.query?.minutes ? Number(req.query.minutes) : 10;
    const sensorName = req?.query?.device_name ?? null;
    const match_aggregator = sensorName ? { $match: { 'device_name': sensorName } } : { $match: { "device_name": { "$exists": true } } };

    const interval = minutes * 60 * 1000;

    let results = await db.collection(collection).aggregate([
        {
            $project: {
                device_id: 1,
                device_name: 1,
                place_id: 1,
                date: 1,
                payload: 1,
            }
        },
        match_aggregator,
        {
            $group: {
                _id: {
                    date: {
                        $toDate: {
                            $subtract: [
                                { $toLong: '$date' },
                                { $mod: [{ $toLong: '$date' }, interval] }
                            ]
                        }
                    },
                    name: '$place_id'
                },
                // temperature
                average_temperature: { $avg: '$payload.temperature_sensor_reading' },
                min_temperature: { $min: '$payload.temperature_sensor_reading' },
                max_temperature: { $max: '$payload.temperature_sensor_reading' },
                // proximity
                average_proximity: { $avg: '$payload.proximity_sensor_reading' },
                min_proximity: { $min: '$payload.proximity_sensor_reading' },
                max_proximity: { $max: '$payload.proximity_sensor_reading' },
                // luminosity
                average_luminosity: { $avg: '$payload.luminosity_reading' },
                min_luminosity: { $min: '$payload.luminosity_reading' },
                max_luminosity: { $max: '$payload.luminosity_reading' },
                // led_status
                current_led_status: { $last: '$payload.led_status_reading' },
                // ldr
                average_ldr: { $avg: '$payload.light_sensor_reading' },
                min_ldr: { $min: '$payload.light_sensor_reading' },
                max_ldr: { $max: '$payload.light_sensor_reading' },
                // count
                count: { $sum: 1 }, // Count of readings
            }
        },
        {
            $sort: {
                '_id.date': -1,
                '_id.place_id': 1,
            }
        },
        {
            $addFields: {
                average_temperature: { $round: ['$average_temperature', 2] }, // Round to 2 decimal places
                average_proximity: { $round: ['$average_proximity', 2] }, // Round to 2 decimal places
                average_luminosity: { $round: ['$average_luminosity', 2] }, // Round to 2 decimal places
                average_ldr: { $round: ['$average_ldr', 2] }, // Round to 2 decimal places
            }
        },
        {
            $group: {
                _id: '$_id.place_id',
                data: {
                    $push: {
                        date: '$_id.date',
                        // temperature
                        average_temperature: '$average_temperature',
                        min_temperature: '$min_temperature',
                        max_temperature: '$max_temperature',
                        // proximity
                        average_proximity: '$average_proximity',
                        min_proximity: '$min_proximity',
                        max_proximity: '$max_proximity',
                        // luminosity
                        average_luminosity: '$average_luminosity',
                        min_luminosity: '$min_luminosity',
                        max_luminosity: '$max_luminosity',
                        // led_status
                        current_led_status: '$current_led_status',
                        // ldr
                        average_ldr: '$average_ldr',
                        min_ldr: '$min_ldr',
                        max_ldr: '$max_ldr',
                        // count
                        count: '$count' // Include count of readings
                    }
                }
            }
        },
        {
            $project: {
                name: '$_id',
                data: 1,
                _id: 0
            }
        }
    ])
        .toArray();

    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(results, null, 4)).status(200);

})


export default router;