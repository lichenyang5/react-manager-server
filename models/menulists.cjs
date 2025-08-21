// models/usersList.cjs
const mongoose = require('mongoose')

const Schema = mongoose.Schema
const userPermissionSchema = new Schema({
    _id:String
}, { strict: false })

// 注意第一个参数会对应 collection 名称（自动转小写+复数）
// 这里就是 userslists
const cityDataModel = mongoose.model('menulists', userPermissionSchema)
module.exports = cityDataModel
console.log('usersList.cjs export =', module.exports)
