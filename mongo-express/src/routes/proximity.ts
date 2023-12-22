import express from 'express';
import { conn, db } from '../db_conn';
import dotenv from 'dotenv';
dotenv.config();

const collection = process.env.MONGODB_COLLECTION_PROXIMITY;

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

// GET /aggregate_by_sensor
// GET /aggregate_by_sensor?device_name=iot_sensor_3
// GET /aggregate_by_sensor?minutes=10
// GET /aggregate_by_sensor?device_name=iot_sensor_3&minutes=10
router.get("/aggregate_by_sensor", async (req, res) => {
    const minutes = req?.query?.minutes ? Number(req.query.minutes) : 10;
    const sensorName = req?.query?.device_name ?? null;
    const match_aggregator = sensorName ? { $match: { 'metadata.sensorName': sensorName } } : { $match: { "metadata.sensorName": { "$exists": true } } };

    const interval = minutes * 60 * 1000;

    let results = await db.collection(collection).aggregate([
        {
            $project: {
                timestamp: 1,
                proximity: 1,
                metadata: 1
            }
        },
        match_aggregator,
        {
            $group: {
                _id: {
                    date: {
                        $toDate: {
                            $subtract: [
                                { $toLong: '$timestamp' },
                                { $mod: [{ $toLong: '$timestamp' }, interval] }
                            ]
                        }
                    },
                    name: '$metadata.sensorName'
                },
                average_proximity: { $avg: '$proximity' },
                min_proximity: { $min: '$proximity' },
                max_proximity: { $max: '$proximity' },
                count: { $sum: 1 }, // Count of readings
            }
        },
        {
            $sort: {
                '_id.date': -1,
                '_id.name': 1,
            }
        },
        {
            $addFields: {
                average_proximity: { $round: ['$average_proximity', 2] } // Round to 2 decimal places
            }
        },
        {
            $group: {
                _id: '$_id.name',
                data: {
                    $push: {
                        date: '$_id.date',
                        average_proximity: '$average_proximity',
                        min_proximity: '$min_proximity',
                        max_proximity: '$max_proximity',
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
    const match_aggregator = sensorName ? { $match: { 'metadata.sensorName': sensorName } } : { $match: { "metadata.sensorName": { "$exists": true } } };

    const interval = minutes * 60 * 1000;

    let results = await db.collection(collection).aggregate([
        {
            $project: {
                timestamp: 1,
                proximity: 1,
                metadata: 1
            }
        },
        match_aggregator,
        {
            $group: {
                _id: {
                    date: {
                        $toDate: {
                            $subtract: [
                                { $toLong: '$timestamp' },
                                { $mod: [{ $toLong: '$timestamp' }, interval] }
                            ]
                        }
                    },
                    name: '$metadata.place_id'
                },
                average_proximity: { $avg: '$proximity' },
                min_proximity: { $min: '$proximity' },
                max_proximity: { $max: '$proximity' },
                count: { $sum: 1 }, // Count of readings
            }
        },
        {
            $sort: {
                '_id.date': -1,
                '_id.name': 1,
            }
        },
        {
            $addFields: {
                average_proximity: { $round: ['$average_proximity', 2] } // Round to 2 decimal places
            }
        },
        {
            $group: {
                _id: '$_id.name',
                data: {
                    $push: {
                        date: '$_id.date',
                        average_proximity: '$average_proximity',
                        min_proximity: '$min_proximity',
                        max_proximity: '$max_proximity',
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