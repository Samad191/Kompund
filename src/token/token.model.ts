import * as mongoose from 'mongoose';
const Int32 = require("mongoose-int32").loadType(mongoose);

export const TokenSchema = new mongoose.Schema({
    time: {
        required: true,
        type: String,
    },
    price: {
        required: true,
        type: String,
    },
    nonce: {
        required: true,
        type: String,
    },
})

export interface Token {
    time: String,
    price: String,
    nonce: String,
}