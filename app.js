
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Mosh:KycKTZ5RVjN5tFm@cluster1.usi6v.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todo list!"
});

const item2 = new Item ({
  name: "Hit the plus button to add a new item!"
});

const item3 = new Item ({
  name: "<-- Click this to the this item"
});

defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


// Item.deleteOne({_id: "600299c6ccc8f314044b4ab7"}, (err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Document deleted");
//   }
// });

// Item.find((items, err) => {
//   if (err) {
//     console.log(err);
//   } else {
//         console.log(items);
//   }
// });


app.get("/", function(req, res) {

  Item.find({}, (err, foundItem)=> {
    // this prevent documents from being inserted at every run
    if (foundItem.length === 0) {
      Item.insertMany(defaultItems, (err)=> {
        if (err) {
          console.log(err);
        } else {
          console.log(" Successfully added 3 documents.");
        }
    });
    // This redirects back to the app.get in order to render the items to the screen
    res.redirect("/");
    } else {
        res.render("list", {listTitle: "Today", newListItems: foundItem});
    }

    
  });

});

app.get("/:customListName", function(req,res){
  const customListItem = _.capitalize(req.params.customListName);

  List.findOne({name: {$eq: customListItem}}, (err, foundList) => {
    if (!err) {
      if(!foundList) {
        // create new list
        const list = new List ({
          name: customListItem,
          items: [defaultItems]
        });
      
        list.save();

        res.redirect("/" + customListItem);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
  
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if(listName === "Today"){
      item.save()
     res.redirect("/");
  } else {
      List.findOne({name: listName}, (err, foundList) =>{
        foundList.items.push(item);
        foundList.save()
        res.redirect("/" + listName);
      
      
    })
  }
  

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});


app.post("/delete", (req, res)=> {
  const deleteItem = req.body.button;
  const listName = req.body.list;

  if(listName === "Today"){
    Item.findByIdAndRemove(deleteItem, (err) => {
      if (!err) {
        console.log("Item successufully deleted");
      res.redirect("/");
      }
      
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteItem}}}, (err, foundList)=> {
      if (!err){
        res.redirect("/" + listName);
      }
    })
  }
  
}); 
  
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
