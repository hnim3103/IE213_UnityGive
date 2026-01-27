import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, //
    trim: true //auto removing space
  },

  logo_url: {
    type: String,
    required: true
  }, 

  description: {
    type: String
  },

  website: String,

  email: String,
  //Trusted organization
  is_verified: {
    type: Boolean,
    default: false
  },
}, {
    //Auto add created and updated time
    timestamps: true,
});

const Organization = mongoose.model("Organization", OrganizationSchema);
export default Organization;