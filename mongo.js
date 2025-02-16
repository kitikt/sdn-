// const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const Dishes = require('./models/dishes');
const url = 'mongodb://localhost:27017/conFusion'


// const url = 'mongodb://localhost:27017'; // URL của MongoDB
// const dbname = 'conFusion';

// (async () => {
//     const client = new MongoClient(url);

//     try {
//         // Kết nối đến MongoDB
//         await client.connect();
//         console.log('Kết nối đến server MongoDB thành công');

//         // Truy cập database và collection
//         const db = client.db(dbname);
//         const collection = db.collection('dishes');

//         // Thêm document vào collection
//         const insertResult = await collection.insertOne({
//             name: 'Uthappizza',
//             description: 'test',
//         });
//         console.log('Insert thành công');
//         console.log('Inserted ID:', insertResult.insertedId); // Hiển thị ID của document vừa thêm

//         // Tìm tất cả các document trong collection
//         const docs = await collection.find({}).toArray();
//         console.log('Tìm thấy: ');
//         console.log(docs);
//     } catch (err) {
//         console.error('Lỗi:', err);
//     } finally {
//         // Đóng kết nối
//         await client.close();
//     }
// })();

const connect = mongoose.connect(url);
connect.then((db) => {
    console.log('Connected correctly to server');
    var newDish = Dishes({
        name: 'Lobster',
        description: 'test'
    });


    newDish.save()
        .then((dish) => {
            console.log(dish);

            return Dishes.find({});

        })
        .then((dishes) => {
            console.log(dishes);
            return Dishes.deleteMany({ name: "Uthappizza" });
        })
        .then(() => {
            return mongoose.connection.close();
        })
        .catch((err) => {
            console.log(err);
        })

});