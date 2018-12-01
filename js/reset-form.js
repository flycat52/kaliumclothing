$(document).ready(function(){
  console.log("holaaa")
  $("#resetForm").validate({
          rules: {
          password: {
              required = true,
              minlength: 7
          },
          confirm_password: {
              required: true,
              minlength= 5,
              equalTo="#password"
          }
      },
      messages:{
          password:{
              required: "Please enter a password",
              minlength: "The password has to have at least 7 characters"
          },
          confirm_password: {
              required: "The password is required",
              equalTo: "Please enter the same password as above"
          }
      }
  })
});

$.validator.setDefaults({
  submitHandler: function() {
      alert("submitted!");
  }
});

