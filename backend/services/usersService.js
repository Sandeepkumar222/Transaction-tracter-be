//importing mongodb
const mongo = require("../shared/mongo");

const { ObjectId } = require("mongodb");

const serviceUser = {
  getUsers() {
    return mongo.db.collection("ExpenseUsers").find().toArray();
  },
  getUser(userid) {
      console.log(userid)
    return mongo.db.collection("ExpenseUsers").findOne({ _id: ObjectId(userid)});
  },
  addUsers(data) {
    return mongo.db.collection("ExpenseUsers").insert(data);
  },
  updateUsers(id, data) {
    return mongo.db
      .collection("ExpenseUsers")
      .findOneAndUpdate(
        { _id: ObjectId(id) },
        { $set: data },
        { returnDocument: "after" }
      );
  },
  deleteUser(id){
      return mongo.db.collection("ExpenseUsers").deleteOne({_id : ObjectId(id)});
  }
};

module.exports = serviceUser;
