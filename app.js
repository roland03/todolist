const express = require("express");
const bodyParser= require ("body-parser");
const mongoose= require("mongoose");
const _=require("lodash");

const app = express();
 app.set("view engine","ejs" );


mongoose.connect("mongodb+srv://admin-roland:Test123@sandbox1.lmgfsju.mongodb.net/todolistDB");
const itemsSchema = {
  name:String
}
const Item = mongoose.model ("Item", itemsSchema);

const item1 = new Item({
  name :"Welcome to my Todo-list project!"
});
const item2 = new Item ({
  name :"Hit the "+"button to add a new item ."
});
const item3 =new Item ({
  name :"<-- Hit this to delete an item."
});

const defaultItems =[item1, item2, item3];

const listSchema= {
  name:String,
  items:[itemsSchema]
}
const List= mongoose.model("List", listSchema);

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));

app.get("/",function(req, res ){
  Item.find({},function(err, foundItems){
    if(foundItems.length===0){
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      }
    });
    res.redirect("/");
  }else{
        res.render("list",{listTitle:"Today", newListItems:foundItems });
      }
    });
  });

  app.get("/:newPage",function(req,res){
  const customPageTitle= _.capitalize(req.params.newPage);
List.findOne({name:customPageTitle},function(err,foundList){
  if(!err){
    if(!foundList){
      const list= new List({
        name:customPageTitle,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customPageTitle);
  } else{
    res.render("list",{listTitle:customPageTitle, newListItems:foundList.items})
  }
}
});


  });

app.post("/",function(req, res ){
const itemName=req.body.newItem;
const listName=req.body.list;

const item = new Item({
  name :itemName
});

if(listName === "Today"){
item.save();
 res.redirect("/");
}else{
  List.findOne({name:listName},function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}
});

app.post("/delete",function(req,res){
const checkboxId=req.body.checkbox;
const listName =req.body.listName;

if(listName==="Today"){

  Item.findByIdAndRemove(checkboxId,function(err){
    if(err){
      console.log(err);
    }
  });
  res.redirect("/");
}else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkboxId}}},function(err, foundOne){
      if(!err){
        res.redirect("/"+listName);
      }
    })
}


});


app.get("/about", function(req, res){
  res.render("about");
})


app.listen(3000, function(){
  console.log("Todo-list server is running on port 3000 .");
});
