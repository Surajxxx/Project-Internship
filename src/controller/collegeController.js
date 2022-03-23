const { default: mongoose } = require('mongoose')
const CollegeModel = require('../models/collegeModel')
const InternModel = require('../models/internModel')

const isValid = function(value){
    if(typeof (value) === 'undefined' || value === null) return false
    if(typeof (value) === 'string' && value.trim().length == 0) return false
    return true
}

const isValidRequestBody = function(reqBody){
   return Object.keys(reqBody).length > 0
}


const registerCollege = async function(req, res){
    try {
        const requestBody = req.body

    // validation

    if(!isValidRequestBody(requestBody)){
        return res.status(400).send({status : false, message: "Please provide college data"})
    }

    // using destructuring 
    const {name , fullName, logoLink } = requestBody

    if(!isValid(name)){
        return res.status(400).send({status : false, message: "Name is required"})
    }

    if(!isValid(fullName)){
        return res.status(400).send({status : false, message: "fullName is required"})
    }

    if(!isValid(logoLink)){
        return res.status(400).send({status : false, message: "logoLink is required"})
    }
    
    const isNameUnique = await CollegeModel.findOne({name : name}) 

    if(isNameUnique) {
        return res.status(400).send({status : false, message : "name already exist"})
    }

    // validation ends here

    const newCollegeEntry =  await CollegeModel.create(requestBody)

    res.status(201).send({status: true, message: "new college entry done", data : newCollegeEntry })


    } catch (error){
        res.status(500).send({error : error.message})
    }
}

const getCollegeDetailsWithInterns = async function(req, res){
    try{    
        const queryParams = req.query
        const collegeName = queryParams.collegeName

        if(!isValidRequestBody(queryParams)){
            return res.status(400).send({status : false, message: "please provide inputs for getting college details"})
        }

        if(!isValid(collegeName)){
            return res.status(400).send({status : false, message: "please provide collegeName"})
        }

        const college = await CollegeModel.findOne({name : collegeName})
        console.log(college)

        if(!college) {
            return res.status(404).send({status: false, message: "invalid collegeName"})
        }

        const collegeID = college._id

        const getInternsByCollegeID = await InternModel.find({collegeId : collegeID }).select({_id: 1, email: 1, name: 1, mobile: 1})
        
        const collegeDetailsIncludingInterns = await CollegeModel.findById(collegeID).lean().select({name:1, fullName:1, logoLink: 1, _id: 0})
       
        collegeDetailsIncludingInterns.interns = getInternsByCollegeID    

        res.status(200).send({status: true, data: collegeDetailsIncludingInterns})

    } catch (error){
        res.status(500).send({error : error.message})
    }
}

module.exports.registerCollege = registerCollege
module.exports.getCollegeDetailsWithInterns = getCollegeDetailsWithInterns
