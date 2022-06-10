//jshint esversion:6
// 7rUrfLfkYa4UXXi

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const { redirect } = require("express/lib/response");
const date = require(__dirname + "/date.js");

const app = express();

const day = date.getDate();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// database

mongoose.connect("mongodb://localhost:27017/todolistDB");
// {useNewUrlParser:true}

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Here is your to do list"
});

const item2 = new Item({
  name: "Click + to add new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  item: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems,(err)=>{
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("Default items saved successfully to database");
//   }
// })

app.get("/", function (req, res) {


  Item.find({}, (err, foundItems) => {
    // console.log(foundItems);
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Default items saved successfully to database");
        }
      });
      res.redirect("/");
      // res.redirect("/" + listName);
    }

    else {
      res.render("list", { listTitle: day, newListItems: foundItems });
    }

  });

  // res.render("list", {listTitle: day, newListItems: defaultItems});

});

app.get("/:customListName", function (req, res) {
  const listName = req.params.customListName;
  // console.log(listName);

  List.findOne({ name: listName }, function (err, listItem) {
    if (err) {
      console.log(err);
    }
    else if (!listItem) {
      const list = new List({
        name: listName,
        item: defaultItems
      });
      // listName.find({}, (err, foundItems) => {
      //   // console.log(foundItems);
      //   if (foundItems.length === 0) {
      //     Item.insertMany(defaultItems, (err) => {
      //       if (err) {
      //         console.log(err);
      //       }
      //       else {
      //         console.log("Default items saved successfully to database");
      //       }
      //     });
      //   }
      // });
      list.save();
      res.redirect("/" + listName);
    }
    else {
      res.render("list", { listTitle: listItem.name, newListItems: listItem.item });
      // console.log(listItem.name);
    }
  })
  // res.redirect("/");
})

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const currList = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (currList === day) {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: currList }, (err, foundList) => {
      foundList.item.push(item);
      foundList.save();
      res.redirect("/" + currList);
    })
    // currList.save();
    // res.redirect("/");
    // console.log(currList);

  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   defaultItems.push(item);
  //   res.redirect("/");
  // }
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.status;
  const listName = req.body.listName;
  // console.log(listName);
  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (err) {
        console.log(err);
      }
      else {
        console.log("successfully removed check item");
      }
    })
    res.redirect("/");
  }
  else {
    List.findOneAndUpdate({ name: listName }, { $pull: { item: { _id: checkedItemId } } }, (err, listToShow) => {
      if (!err) {
        console.log("successfully removed check item");
        res.redirect("/" + listName);
      }
    })
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

