const express = require('express')
const app = express()
const { faker } = require('@faker-js/faker');
// Get the client
const mysql = require('mysql2');
const path = require('path');
const methodOverride = require('method-override');

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"/views"));


let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
}

// Create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'practice_app',
  multipleStatements: true,
  password: 'Stupendous@0812'
});

//Inserting fake data using package faker...
// let q = "INSERT INTO user (id, username, email, password) VALUES ?";
// let data = [];
// for (let i=1;i<=10;i++) {
//   data.push(getRandomUser());
// };
// console.log(data);

// try {
//   connection.query(q, [data], (err, result) => {
//     if (err) throw err;
//     console.log(result);
//   })
// } catch (err) {
//   console.log(err);
// }
// connection.end();


app.get("/", (req,res) => {
  let q = `SELECT COUNT (*) FROM user; SELECT * FROM user LIMIT 100;`;
  try {
    connection.query(q, (err,result) => {
      if (err) throw err;
      let userCount = result[0][0]['COUNT (*)'];
      let users = result[1];
      res.render("home.ejs", {userCount, users});
    })
  } catch (err) {
    res.send("error occured in database");
  }
});

// Edit Route

app.get("/:id/edit", (req,res) => {
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err,result) => {
      if (err) throw err;
      let userData = result[0];
      res.render("edit.ejs", {userData});
    })
  } catch (err) {
    res.send("error occured in database", err);
  }
});

//Patch Request

app.patch("/:id", (req,res) => {
  let {id} = req.params;
  let { username: newUser, password: formPass} = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err,result) => {
      if (err) throw err;
      let userData = result[0];
      if (formPass != userData.password) {
        res.send("You entered a wrong password, please try again !");
      }
      else {
        let q2 = `UPDATE user SET username = '${newUser}' WHERE id = '${id}'`;
        try {
          connection.query(q2, (err,result) => {
            if (err) throw err;
            res.redirect("/");
          })
        } catch (err) {
          res.send("error occured in database", err);
        }
      }
    })
  } catch (err) {
    res.send("error occured in database", err);
  }
});

//Post Route
app.get("/add", (req,res) => {
  res.render("add.ejs");
})

app.post("/", (req,res) => {
  let id = faker.string.uuid();
  let {username: username, email: email, password: password} = req.body;
  console.log(req.body);
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}', '${username}', '${email}', '${password}')`;
  try {
    connection.query(q, (err,result) => {
      if (err) throw err;
      console.log(result);
      res.send(`<h2> User Data successfully added ! </h2> <br> <a href="http://localhost:8080/">Back to UserData Page...</a> <script> setInterval(()=> {window.location.replace("http://localhost:8080/");}, 5000);</script>`);
    })
  } catch (err) {
    res.send("error occured in database", err);
  }
}),

//Delete Route

app.get("/:id/delete", (req,res) => {
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err,result) => {
      if (err) throw err;
      let users =result[0];
      console.log(users);
      res.render("delete.ejs", {users});
    })
  } catch (err) {
    res.send("error occured in database");
  }
});

//Delete Request

app.delete("/:id", (req,res) => {
  let {id} = req.params;
  let {password: validatePass} = req.body;
  let q1= `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q1, (err,result) => {
      if (err) throw err;
      let userData = result[0];
      if (validatePass != userData.password) {
        res.send("You entered a wrong password, please try again !")
      }
      else {
        let q2 = `DELETE FROM user WHERE id = '${id}'`;
        try {
          connection.query(q2, (err,result) => {
            if (err) throw err;
            res.send(`<h2> User Data successfully deleted </h2> <br> <a href="http://localhost:8080/">Back to UserData Page...</a> <script> setInterval(()=> {window.location.replace("http://localhost:8080/");}, 5000);</script>`);
          })
        } catch (err) {
          res.send("No such data found, the userdata is already deleted:", err);
        }
      }
    })
  } catch (err) {
    res.send("error with the DB", err);
  }
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});