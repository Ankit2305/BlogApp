const express = require("express"),
      bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
      methodOverride = require("method-override"),
      expressSanitizer = require("express-sanitizer");
    
const app = express();

mongoose.connect("mongodb://localhost/blog_app", {useNewUrlParser: true, useUnifiedTopology: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

var blogSchema = mongoose.Schema({
    title: String, 
    image: String,
    body: String,
    create: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

app.get("/", (req, res) => {
    res.redirect("/blogs");
});

app.get("/blogs", (req, res) => {
    Blog.find({}).then((blogs) => {
        res.render("index", {blogs: blogs});
    }).catch(()=>{
        res.send("Error file fetching blog data");
    });
});

app.get("/blogs/new", (req, res) => {
    res.render("new");
});

app.post("/blogs", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog).then(() => {
        res.redirect("/blogs");
    }).catch(() => {
        res.redirect("/blogs/new");
    });
});

app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id).then((foundBlog) => {
        res.render("show", {blog: foundBlog});
    }).catch(() => {
        res.redirect("/blogs");
    });
});

app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id).then((foundBlog) => {
        res.render("edit", {blog: foundBlog});
    }).catch(() => {
        res.redirect("/blogs");
    });
});

app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog).then( () => {
        res.redirect("/blogs/" + req.params.id);
    }).catch(() => {
        res.redirect("/blogs");
    });
});

app.delete("/blogs/:id", (req,res) => {
    Blog.findByIdAndRemove(req.params.id).then(() => {
        res.redirect("/blogs");
    }).catch(() => {
        res.redirect("blogs");
    });
});

app.listen(3000, (req, res) => {
    console.log("Server started ...");
});