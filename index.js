require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');

const MONGO_URL = process.env['MONGO_URL'];

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port)
    })
  })
  .catch((err) => console.log(err));

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//function for converting date
const convertDate = (day) => {
  const newDate = new Date(day); // Replace this with your date object or date string

  // Convert the date to the desired format
  let result = newDate.toDateString()
  //console.log( "today we are on", result); // Output: "Sat Jul 22 2023"
  return result
};

today = Date.now();
//define log schema
const logSchema = new mongoose.Schema({
  description: {
    type: String,
  },
  duration: {
    type: Number,
  },
  date: {
    type: Date
  }
})

//define schema for users
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  log: {
    type: [logSchema],
  }
})

User = mongoose.model("User", userSchema);
app.post('/api/users', async (req, res) => {
  let body = req.body;
  // console.log("body of request: ", body);
  try {
    User.findOne(body)
      .then((foundUser) => {
        if (foundUser) {
          // console.log("user already registered: ", foundUser);
          res.json({ username: foundUser.username, _id: foundUser.id });
        } else {
          // console.log("user not yet created");
          //create new user
          let user = new User(body);
          user.save()
            .then((data) => {
              // console.log("new user was created", data);
              res.json({ username: data.username, _id: data.id });
            })
            .catch((err) => console.log("unable to create user: ", err))
        }
      }).catch(err => console.log("error in finding user: ", err));

  } catch (err) {
    console.log("error in try catch bloc", err);
  }
})

app.get("/api/users", (req, res) => {
  User.find().then((data) => {
    let users = [];
    data.forEach(item => {
      users.push({ username: item.username, _id: item.id })
    })
    res.json(users);
  }).catch(err => console.log("error in retrieving users:", err));

})

app.post("/api/users/:_id/exercises", (req, res) => {
  ID = req.params._id;
  body = req.body;
  //console.log("New user want to verify logs: ", ID);
  User.findById(ID)
    .then((user) => {
      if (user) {
        //  console.log("found user: ", user);
        let sentLogo;
        if (body.date) {
          sentLogo = {
            duration: body.duration * 1,
            date: convertDate(body.date),
            description: body.description
          }
          user.count++;
          user.log.push(sentLogo);
        } else {
          sentLogo = {
            duration: body.duration * 1,
            date: convertDate(today),
            description: body.description
          }
          user.count++;
          user.log.push(sentLogo);
        }
        user.save()
          .then(() => {
            res.json({
              _id: user._id,
              username: user.username,
              date: sentLogo.date,
              duration: sentLogo.duration,
              description: sentLogo.description
            });
          }).catch(err => console.log("there was an error while saving new user: ", err))
      } else {
        console.log("user is null", user);
        res.json({ Error: "user doesn't exist" });
      }
    })
    .catch((err) => {
      console.log("error in finding user", err);
      res.json({ Error: "User don't exist" });
    })
})

const convert = (dy) => {
  return new Date(dy)
};
app.get("/api/users/:_id/logs", (req, res) => {
  const ID = req.params._id;
  const { from, to, limit } = req.query;

  User.findById(ID)
    .then((user) => {
      if (!user) {
        return res.json({ Error: "User doesn't exist" });
      } else {
        // Unfiltered logs
        let logs = user.log.map((item) => {
          return {
            date: convertDate(item.date),
            duration: item.duration,
            description: item.description,
          };
        });
        let response = {
          _id: user._id,
          username: user.username,
          count: logs.length
        };
        if (from) {
          console.log("someone is testing from");
          response.from = convertDate(from);
          // Filter the logs based on the date range
          let filteredLogs = logs.filter((item) => {
            const itemDate = convert(item.date);
            const fromDate = convert(from);
            if (itemDate > fromDate) {
              console.log(itemDate, ">", fromDate);
              return true
            } else if (convertDate(item.date) === convertDate(from)) {
              console.log(itemDate, "===", fromDate);
              return true
            } else {
              console.log(itemDate >= fromDate);
              console.log(itemDate, "<", fromDate);
              return false
            }
          });
          let final = filteredLogs.map(asset => {
            return {
              description: asset.description,
              duration: asset.duration,
              date: convertDate(asset.date)
            }
          });
          logs = final;
          response.count = final.length;
        };
        if (to) {
          console.log("someone is testing to");
          response.to = convertDate(to);
          // Filter the logs based on the date range
          let filteredLogs = logs.filter((item) => {
            const itemDate = convert(item.date);
            const toDate = convert(to);
            if (itemDate <= toDate) {
              console.log(itemDate, "<=", toDate);
              return true
            } else if (convertDate(item.date) === convertDate(to)) {
              console.log(itemDate, "===", toDate);
              return true
            } else {
              console.log(itemDate <= toDate);
              console.log(itemDate, ">", toDate);
              return false
            };
          });
          let final = filteredLogs.map(asset => {
            return {
              description: asset.description,
              duration: asset.duration,
              date: convertDate(asset.date)
            }
          });
          logs = final;
          response.count = final.length;
        };
        if (limit) {
          // Apply the limit
          console.log("someone is testing limit");
          let limitedLogs = logs.slice(0, limit);
          logs = limitedLogs;
          response.count = limitedLogs.length;
        };
        response.log = logs;
        res.json(response);
      };
    })
    .catch((err) => {
      console.log("Error in finding user:", err);
      res.json({ Error: "User doesn't exist" });
    });
});


//?from=2022-11-11&to=2023-11-11&limit=3