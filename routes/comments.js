const express = require("express");
const router = express.Router({
    mergeParams: true
});

// model requires
const Camp = require(`../models/camp`);
const Comment = require(`../models/comment`)

// middleware require
const middleware = require("../middleware")



//CREATE COMMENT
router.post(`/`, middleware.isLoggedIn, (req, res) => {
    Camp.findById(req.params.id, (err, foundCamp) => {
        if (err) {
            console.log(err);
            res.redirect(`/campgrounds`)

        } else {

            req.body.comment.text = req.sanitize(req.body.comment.text)

            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    console.log(err);
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    foundCamp.comments.push(comment);
                    foundCamp.save();

                    req.flash("success", "Comment created.")
                    res.redirect("/campgrounds/" + req.params.id);

                }
            })
        }
    })
})

//UPDATE
router.put("/:comment_id", middleware.isLoggedIn, middleware.checkCommentOwnership, (req, res) => {
    req.body.comment.text = req.sanitize(req.body.comment.text);

    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if (err) {
            res.redirect("back")
        } else {
            req.flash("success", "Comment updated.")
            res.redirect("/campgrounds/" + req.params.id);

        }
    })
})


//DESTROY
router.delete("/:comment_id", middleware.isLoggedIn, middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err, removedComment) => {
        if (err) {
            res.redirect("back")
        } else {
            req.flash("success", "Comment deleted.")
            res.redirect("/campgrounds/" + req.params.id);

        }
    })
})

module.exports = router;