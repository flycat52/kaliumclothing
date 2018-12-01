#!/bin/bash
# Expect successful response of product list
curl -X GET \
  https://kaliumclothing.herokuapp.com/items \
  -H 'cache-control: no-cache' \
  -w "\n"

# Expect successful response of item 1
curl -X GET \
  https://kaliumclothing.herokuapp.com/item/1 \
  -H 'cache-control: no-cache' \
  -w "\n"

# Expect successful response of sizes
curl -X GET \
  https://kaliumclothing.herokuapp.com/sizes \
  -H 'cache-control: no-cache' \
  -w "\n"

# Expect successful response of order history from userid=8
curl -X GET \
  https://kaliumclothing.herokuapp.com/orderhistory/8 \
  -H 'cache-control: no-cache' \
  -w "\n"

# Expect successful response of user list
curl -X GET \
  https://kaliumclothing.herokuapp.com/users \
  -H 'cache-control: no-cache' \
  -w "\n"

  # Expect successful response for reseting password of user with given email 
  curl -i -X POST 
  -H 'Content-Type: application/json' 
  -d '{"email": "hola@gmail.com", "password": "monkeys"}' 
  -w"\n" 
  https://kaliumclothing.herokuapp.com/reset/:token

  # Expect successful response of user registration
  curl -i -X POST 
  -H 'Content-Type: application/json' 
  -d '{"usernamesignup":"arias", 
      "emailnamesignup": "hola@gmail.com", 
      "passwordsignup": "monkeys"}' 
      https://kaliumclothing.herokuapp.com/user/create

  #Expect succesful responser from search
  curl -X GET \
  https://kaliumclothing.herokuapp.com/search-result?value=ac \
  -H 'cache-control: no-cache' \
  -s -o /dev/null -w "%{time_total}\n"