const Clinic = require("../models/clinicModel");
//post clinic data
const postClinic = (req, res, next) => {
  const user = new Clinic(req.body);
  user.save();
  res.send(req.body);
};
//get clinic data
const getClinicData = async (req, res, next) => {
  try {
    const users = await Clinic.find();
    if (users.length > 0) {
      res.json({
        message: "Success",
        data: users,
      });
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
