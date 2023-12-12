const { Kafka, logLevel } = require('kafkajs');
const { processIOTFrames } = require('./mongodb_client');
require('dotenv').config();
var _ = require('lodash');

const kafka_sub_client_id = process.env.KAFKA_SUB_CLIENT_ID;
const kafka_broker = process.env.KAFKA_BROKER;
const kafka_topic = process.env.KAFKA_TOPIC;

// ADJUSTABLE PARAMETERS
const number_of_messages = process.env.BATCH_SIZE; // number of messages per batch expected
const payload_size = process.env.MESSAGE_SIZE; // average single payload size is 300 bytes
const topic_TTG = process.env.MQTT_PUB_INTERVAL; // TTG -> Time To Generate
// ADJUSTABLE PARAMETERS

// Kafka broker
const kafka = new Kafka({
    clientId: kafka_sub_client_id,
    brokers: [kafka_broker], // Replace with your Kafka broker address
    logLevel: logLevel.ERROR,
});

async function init() {
    const minBytes = number_of_messages * payload_size;
    const maxBytes = (number_of_messages) * payload_size;
    const maxWaitTimeInMs = number_of_messages * topic_TTG; // should be less than sessionTimeout
    const heartbeatInterval = 1 * maxWaitTimeInMs; // set as double of maxWaitTimeInMs
    const sessionTimeout = 3 * heartbeatInterval; // minimum 3 times heartbeatInterval

    console.log("minBytes=>", minBytes);
    console.log("maxBytes=>", maxBytes);
    console.log("maxWaitTimeInMs=>", maxWaitTimeInMs);
    console.log("heartbeatInterval=>", heartbeatInterval);
    console.log("sessionTimeout=>", sessionTimeout);

    const consumer = kafka.consumer({
        groupId: 'test-group',
        minBytes: minBytes,
        maxBytes: maxBytes,
        maxWaitTimeInMs: maxWaitTimeInMs,
        heartbeatInterval: heartbeatInterval,
        sessionTimeout: sessionTimeout,
    });

    await consumer.connect();
    await consumer.subscribe({ topic: kafka_topic, fromBeginning: true });

    await consumer.run({
        eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning }) => {
            console.log("batch size=>", batch.messages.length);
            try {
                const docList = _.map(batch.messages, (message) => JSON.parse(message.value.toString()));
                await processIOTFrames(docList);
            } catch (err) {
                console.log('parse error', err);
            }
            await heartbeat();
        },
        // eachMessage: async ({ topic, partition, message }) => {
        //     console.log(message.value.toString());
        //     try {
        //         const payload = JSON.parse(message.value.toString());
        //         await insertOne(payload);
        //     } catch (err) {
        //         console.log('parse error');
        //     }
        // }
    })

}

init().catch((err) => console.log(err));