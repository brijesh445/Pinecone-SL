const { Kafka, logLevel, Partitioners, CompressionTypes } = require('kafkajs');
require('dotenv').config();

const kafka_pub_client_id = process.env.KAFKA_PUB_CLIENT_ID;
const kafka_broker = process.env.KAFKA_BROKER;

// Kafka broker
const kafka = new Kafka({
    clientId: kafka_pub_client_id,
    brokers: [kafka_broker], // Replace with your Kafka broker address
    logLevel: logLevel.ERROR,
});

// Create a producer
// const producer = kafka.producer();
const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner })

// Function to produce a message
const produceKafkaMessage = async (topic, message) => {
    await producer.connect();

    // Sending a message
    await producer.send({
        topic: topic,
        compression: CompressionTypes.GZIP,
        messages: [
            { key: "iot_frame", value: message },
        ],
    });

    await producer.disconnect();
};

module.exports = {
    produceKafkaMessage
};
