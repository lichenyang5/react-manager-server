// models/usersList.cjs
const mongoose = require('mongoose')

const Schema = mongoose.Schema
const usersSchema = new Schema({}, { strict: false })

// 注意第一个参数会对应 collection 名称（自动转小写+复数）
// 这里就是 userslists
const usersModel = mongoose.model('userslists', usersSchema)
module.exports = usersModel
console.log('usersList.cjs export =', module.exports)
