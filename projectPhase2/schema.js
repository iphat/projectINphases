//server side validation
//1- for listing
const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title : Joi.string().required(),
        description : Joi.string().required(),
        location : Joi.string().required(),
        country : Joi.string().required(),
        price : Joi.number().required().min(0),
        image : Joi.string().allow("",null)
    }).required(),
});

//2- for reviews
 // without server side validation we can send empty review from other source like hoppscotch or postman which will be saved directly in DB  
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        //without min & max value any no. is added and it will not show error but now it show err if no. less than 1 & more than 5
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});