const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Student = require("./models/student");
const methodOverride = require("method-override");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

mongoose
  .connect("mongodb://localhost:27017/studentDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to mongoDB.");
  })
  .catch((e) => {
    console.log("Connection failed.");
    console.log(e);
  });

app.get("/students", async (req, res) => {
  try {
    let data = await Student.find();
    res.send(data);
  } catch {
    res.send({ message: "Erro with finding data." });
  }
});

app.get("/students/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.send(data);
    } else {
      res.status(404);
      res.send({ message: "Cannot find data." });
    }
  } catch (e) {
    res.send("Error!!");
    console.log(e);
  }
});

//將資訊放上去，並存取
app.post("/students", (req, res) => {
  let { id, name, age, merit, other } = req.body;
  let newStudent = new Student({
    id,
    name,
    age,
    scholarship: { merit, other },
  });
  newStudent
    .save()
    .then(() => {
      res.send({ message: "Successfully post a new student." });
    })
    .catch((e) => {
      res.status(404);
      res.send(e);
    });
});

app.put("/students/:id", async (req, res) => {
  let { id, name, age, merit, other } = req.body;
  try {
    let d = await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      {
        new: true,
        runValidators: true,
        overwrite: true,
      }
    );
    res.send("Successfully updated the data.");
  } catch (e) {
    res.status(404);
    res.send(e);
  }
});

class newData {
  constructor() {}
  setProperty(key, value) {
    if (key !== "merit" && key !== "other") {
      this[key] = value;
    } else {
      this[`scholarship.${key}`] = value;
    }
  }
}

app.patch("/students/:id", async (req, res) => {
  let { id } = req.params;
  let newObject = new newData();
  for (let property in req.body) {
    newObject.setProperty(property, req.body[property]);
  }
  console.log(newObject);
  try {
    let d = await Student.findOneAndUpdate({ id }, newObject, {
      new: true,
      runValidators: true,
    });
    console.log(d);
    res.send("Successfully updated the data.");
  } catch (e) {
    res.status(404);
    res.send(e);
  }
});

app.delete("/students/delete/:id", (req, res) => {
  let { id } = req.params;
  Student.deleteOne({ id })
    .then((meg) => {
      console.log(meg);
      res.send("Deleted successfully.");
    })
    .catch((e) => {
      console.log(e);
      res.send("Delete failed.");
    });
});

app.delete("/student/delete", (req, res) => {
  Student.deleteMany({})
    .then((meg) => {
      console.log(meg);
      res.send("Deleted all data successfully.");
    })
    .catch((e) => {
      console.log(e);
      res.send("Delete failed.");
    });
});

app.get("/*", (req, res) => {
  res.status(404);
  res.send("Not allowed.");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
