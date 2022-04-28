const mongoose = require("mongoose")

const url = process.env.MONGODB_URI

console.log("connecting to ", url);

mongoose.connect(url)
    .then(result => {
        console.log("connected to MongoDB");
    })
    .catch(error => {
        console.log("error connecting to MongoDB: ", error.message);
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true,
        unique: true
    },
    number: {
        type: String,
        minlength: 9,
        required: true,
        validate: {
            validator: v => {
                //at least 5 digits necessary after hypen and at most 13
                //minlength already handles 2 digit + 5 digit case
                //15 digits is the most phone numbers can have
                return /^(\d{2,3}[-])(\d{5,13})$/.test(v)
            },
            message: props => `${props.value} is not a valid phone number`
        }
    },
})

personSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model("Person", personSchema)