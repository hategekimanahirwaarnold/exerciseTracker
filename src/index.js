require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const router = express.Router();
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port)
    })
  })
  .catch((err) => console.log(err));

app.use(cors())
app.use(express.static('public'))
router.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//define schema for users
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  }
})

User = mongoose.model("User", userSchema);

router.post('/api/users', async (req, res) => {
  let body = req.body;
  // console.log("body of request: ", body);
  try {
    User.findOne(body)
      .then((foundUser) => {
        if (foundUser) {
          console.log("user already registered: ", foundUser);
          res.json({ username: foundUser.username, id: foundUser.id });
        } else {
          console.log("user not yet created");
          //create new user
          let user = new User(body);
          user.save()
            .then((data) => {
              console.log("new user was created", data);
              res.json({ username: data.username, id: data.id });
            })
            .catch((err) => console.log("unable to create user: ", err))
        }
      }).catch(err => console.log("error in finding user: ", err));

  } catch (err) {
    console.log("error in try catch bloc", err);
  }

})

app.use('/.netlify/functions/api', router)
module.exports.handler = serverless(app);