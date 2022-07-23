//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
var favicon = require('serve-favicon')
// const date = require(__dirname + "/date.js");
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-nishant:Test123@cluster0.zwedw.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hello, How are you?"
});

const item3 = new Item({
  name: "Hope you are doing good!"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

  // const day = date.getDate();
  Item.find({}, function (err, foundItems) {
    // console.log(foundItems);
    if (foundItems.length == 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved defaultItems");
        }
      });
      res.redirect("/");
    } else {

      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })


});

app.get("/:heading", function (req, res) {
  let Heading = _.capitalize(req.params.heading);
  List.findOne({ name: Heading }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //Creat a new list
        const list = new List({
          name: Heading,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + Heading);
      } else {
        //Show an existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }
    }
  })
});

app.post("/", function (req, res) {
  // console.log(req.body);
  const itemName = req.body.newItem;
  // console.log(itemName);
  const listName = req.body.list;
  // console.log(listName);
  // console.log(listName.trim() == "sed");
  // console.log(escape(listName) );
  // console.log(escape("sed"));

  const item = new Item({
    name: itemName
  });

  if (listName.trim() === "Today") {
    item.save();
    res.redirect("/");

  } else {
    List.findOne({ name: listName.trim() }, function (err, foundList) {
      // console.log(foundList.items.length);
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName.trim());
    });
    // List.find({name: "sed"}, function(err, result){
    //   if(!err){
    //     console.log(result);
    //   }
    // })
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName.trim() === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if(!err){
        console.log("Successfully deleted!!");
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name: listName.trim()},{$pull:{items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName.trim());
      }
    })
  }
})


app.get("/about", function (req, res) {
  res.render("about");
});
let port = process.env.PORT || 3000;
// if (port == null || port == "") {
//   port = 3000;
// }
app.listen(port, function () {
  console.log("Server started at "+port);
});
