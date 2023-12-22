
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
var _ = require('lodash');

const mongodb_username = process.env.MONGODB_USERNAME;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_collection_iot_frames = process.env.MONGODB_COLLECTION_IOT_FRAMES;
const mongodb_collection_temperature = process.env.MONGODB_COLLECTION_TEMPERATURE;
const mongodb_collection_led_status = process.env.MONGODB_COLLECTION_LED_STATUS;
const mongodb_collection_luminosity = process.env.MONGODB_COLLECTION_LUMINOSITY;
const mongodb_collection_proximity = process.env.MONGODB_COLLECTION_PROXIMITY;
const mongodb_collection_ldr = process.env.MONGODB_COLLECTION_LDR;


const uri = `mongodb+srv://${mongodb_username}:${mongodb_password}@cluster0.gjddfqy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function save_iot_frame_dumps(docList) {
    try {
        // Connect to the database
        const db = client.db(mongodb_database);
        // insert doc into collection
        const result = await db.collection(mongodb_collection_iot_frames).insertMany(docList, {
            ordered: false, // best practice for max throughput
        });
        // Print result
        console.log(`${result.insertedCount} documents were inserted`);
    } finally {
        // Close the MongoDB client connection
        // await client.close(true);
    }
}

async function save_time_series(payload, collection) {
    try {
        // Connect to the database
        const db = client.db(mongodb_database);
        // insert doc into collection
        const result = await db.collection(collection).insertMany(payload);
        // Print result
        console.log(`${result.insertedCount} documents were inserted into ${collection} collection`);
    } finally {
        // Close the MongoDB client connection
        // await client.close(true);
    }
}

async function save_temperature_time_series(docList) {
    const payload = _.map(docList, (obj) => {
        return {
            "metadata": { "sensorName": obj.device_name, "place_id": obj.place_id, "type": "temperature" },
            "timestamp": obj.date,
            "temperature": obj.payload.temperature_sensor_reading,
        }
    });
    save_time_series(payload, mongodb_collection_temperature);
}

async function save_led_status_time_series(docList) {
    const payload = _.map(docList, (obj) => {
        return {
            "metadata": { "sensorName": obj.device_name, "place_id": obj.place_id, "type": "led_status" },
            "timestamp": obj.date,
            "led_status": obj.payload.led_status_reading,
        }
    });
    save_time_series(payload, mongodb_collection_led_status);
}

async function save_luminosity_time_series(docList) {
    const payload = _.map(docList, (obj) => {
        return {
            "metadata": { "sensorName": obj.device_name, "place_id": obj.place_id, "type": "luminosity" },
            "timestamp": obj.date,
            "luminosity": obj.payload.luminosity_reading,
        }
    });
    save_time_series(payload, mongodb_collection_luminosity);
}

async function save_proximity_time_series(docList) {
    const payload = _.map(docList, (obj) => {
        return {
            "metadata": { "sensorName": obj.device_name, "place_id": obj.place_id, "type": "proximity" },
            "timestamp": obj.date,
            "proximity": obj.payload.proximity_sensor_reading,
        }
    });
    save_time_series(payload, mongodb_collection_proximity);
}

async function save_ldr_time_series(docList) {
    const payload = _.map(docList, (obj) => {
        return {
            "metadata": { "sensorName": obj.device_name, "place_id": obj.place_id, "type": "ldr" },
            "timestamp": obj.date,
            "ldr": obj.payload.light_sensor_reading,
        }
    });
    save_time_series(payload, mongodb_collection_ldr);
}


async function processIOTFrames(docList) {
    // preprocessing
    _.forEach(docList, (doc) => doc.date = new Date(doc.date));
    // save iot_dumps
    await save_iot_frame_dumps(docList);
    // save timeseries
    await save_temperature_time_series(docList);
    await save_led_status_time_series(docList);
    await save_luminosity_time_series(docList);
    await save_proximity_time_series(docList);
    await save_ldr_time_series(docList);
}

module.exports = {
    processIOTFrames,
};

async function run() {
    const db = client.db(mongodb_database);

    let collection_arr = [mongodb_collection_temperature, mongodb_collection_led_status, mongodb_collection_luminosity, mongodb_collection_proximity, mongodb_collection_ldr];

    for (let value of collection_arr) {
        const result = await db.createCollection(value, {
            timeseries: {
                timeField: "timestamp",
                metaField: "metadata",
                granularity: "seconds",
                // expireAfterSeconds: "86400", // 1 day
            }
        });
        console.log(`${value} collections created`);
    }
}

// run().catch((err) => console.log(err));