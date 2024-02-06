const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");


const app=express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");

app.use(session({
    secret:"Our little secret",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://jayas9239:jayasharma@cluster0.aozsogp.mongodb.net/mydb"); //mongodb://localhost:27017/mydb

const bookSchema=new mongoose.Schema({
    name:String,
    author:String,
    pages:Number
  });

userSchema=new mongoose.Schema({
    email:String,
    password:String
});


userSchema.plugin(passportLocalMongoose); //
const Book=new mongoose.model("Book",bookSchema);
const book1= new Book({
    name:"Good Vibes",
    author:"Amber White",
    pages:250
  })
  const book2= new Book({
    name:"The Great Grand Story",
    author:"Tomy Pearl",
    pages:500
  })
  const book3= new Book({
    name:"The Last Wish",
    author:"Rose Creta",
    pages:345
  })
  const defaultBooks=[book1,book2,book3];

const User=new mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', (req,res) => {
    res.render("index");
});


app.get('/signup', (req,res) => {
    res.render("signup");
}); 

app.get("/directory",function(req,res){
    if(req.isAuthenticated()){
            Book.find({}).then((result)=>{
              if(result.length===0)
              {
          Book.insertMany(defaultBooks).then((result)=>{
            //console.log(result);
          }).catch((err) => {
            console.error(err);
          });
          res.redirect("/directory");
              }
              else{
              res.render("directory", {newListItems: result});} //sending newListItems to directory
              })
        }
    else{
        res.redirect("/login");
    }
})

app.post("/directory", function(req, res){

    const bookname = req.body.newBook;
    const authorname = req.body.newAuthor;
    const pagesname = req.body.newPages;
console.log(bookname);
    //const listname=req.body.list;
   
    const newdoc=new Book({
      name:bookname,
      author:authorname,
      pages:pagesname
    });
    newdoc.save();
    res.redirect("/directory");
  });

  app.post("/delete",function(req,res)
  {
   const id=req.body.newlname;
   Book.findByIdAndDelete(id).then((res)=>{
   });
    res.redirect("/directory");
   });

  app.get("/logout",function(req,res){
    req.logout(function(err){
        if(err){
            console.log(err);
        }
    });
    res.redirect("/");
});
app.post("/signup",function(req,res){
    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.send("Username already present");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/directory");
            })
        }
    })

})

app.get('/login', (req,res) => {
    res.render('login');
});
app.post("/login",function(req,res){
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/directory");
            });
            
        }
    })
    
});

app.get("/search",function(req,res){
    res.render("search");
})
app.post("/search",function(req,res){
    const bookname=req.body.bookname;
    Book.find({name:bookname}).then((result)=>{
        if(!result){
            res.send("No such book exists");
        }
        else
        {
        res.render("directory", {newListItems: result});}
    })
})

//app.get("/edit",function(req,res){
  //  res.render("edit");
//});

app.post('/edits', function(req,res){
    const id = req.body.editbook;
    Book.find({_id : id}).then((result) => {
        res.render('edit', {newname : result[0].name, newauthor: result[0].author, newpage: result[0].pages, id:id});
    });
});
    
app.post("/edit",function(req,res){
    Book.updateOne({_id: req.body.id},{$set:{name:req.body.newbookname,author:req.body.newauthorname,pages:req.body.newpages}}).then((result)=>{
        console.log(result.acknowledged);
        if(result.matchedCount>=1){res.redirect("/directory")}
        else{
            res.send("no such book found in the directory")
        }
    })
});


app.listen(3000, () => {
    console.log("Server listening at http://localhost:3000");
});