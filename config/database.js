
const mongoose = require('mongoose');
const dbState = [{
    value: 0,
    label: "disconnected"
},
{
    value: 1,
    label: "connected"
},
{
    value: 2,
    label: "connecting"
},
{
    value: 3,
    label: "disconnecting"
}];

const connection = async () => {



    try {
        const options = {
            user: 'root',
            pass: '123456',
            dbName: 'asm'

        }
        await mongoose.connect('mongodb://localhost:27017/asm?authSource=admin', options);
        const state = Number(mongoose.connection.readyState);
        console.log(dbState.find(f => f.value == state).label, "to db"); // connected to db
    } catch (error) {
        console.log("error connect db ", error);

    }
}

module.exports = connection;