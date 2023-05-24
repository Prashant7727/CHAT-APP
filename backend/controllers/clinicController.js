const Clinic = require("../models/clinicModel");
//post clinic data
const postClinic = (req, res, next) => {
  const user = new Clinic(req.body);
  const result = user.save();
  res.send(result);
};
//get clinic data
const getClinicData = async (req, res, next) => {
  try {
    const users = await Clinic.find();
    if (users.length > 0) {
      res.send(users);
    } else {
      res.send({ result: "no ticket info. found" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postClinic,
  getClinicData,
};
