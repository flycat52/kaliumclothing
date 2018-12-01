#!/bin/bash
echo 'Response Time of API: https://kaliumclothing.herokuapp.com/items'
for i in {1..50};do 
    curl -X GET 'https://kaliumclothing.herokuapp.com/items' \
         -H 'cache-control: no-store' \
         -s -o /dev/null -w "%{time_total}\n"
done

echo 'Response Time of API: https://kaliumclothing.herokuapp.com/item/1'
for i in {1..50};do 
    curl -X GET 'https://kaliumclothing.herokuapp.com/item/1' \
         -H 'cache-control: max-age=3600' \
         -s -o /dev/null -w "%{time_total}\n"
done

echo 'Response Time of API: https://kaliumclothing.herokuapp.com/sizes'
for i in {1..50};do
curl -X GET \
  https://kaliumclothing.herokuapp.com/sizes \
  -H 'cache-control: no-cache' \
  -s -o /dev/null -w "%{time_total}\n"
done

echo 'Response Time of API: https://kaliumclothing.herokuapp.com/orderhistory/8'
for i in {1..50};do
curl -X GET \
  https://kaliumclothing.herokuapp.com/orderhistory/8 \
  -H 'cache-control: no-cache' \
  -s -o /dev/null -w "%{time_total}\n"
done

echo 'Response Time of API: https://kaliumclothing.herokuapp.com/users'
for i in {1..50};do
curl -X GET \
  https://kaliumclothing.herokuapp.com/users \
  -H 'cache-control: no-cache' \
  -s -o /dev/null -w "%{time_total}\n"
done

echo 'Response Time of API: https://kaliumclothing.herokuapp.com/reset/:token'
for i in {1..50};do
curl -X POST 
-H 'Content-Type: application/json' 
-d '{"email": "hola@gmail.com", "password": "monkeys"}' 
-s -o /dev/null 
-w "%{time_total}\n" 
https://kaliumclothing.herokuapp.com/reset/:token
done

echo 'Response Time of API: https://kaliumclothing.herokuapp.com/user/create'
for i in {1..50};do
curl -X POST
 -H 'Content-Type: application/json' 
 -d '{"usernamesignup":"ariasl"i, "emailnamesignup": "hola@gmail.com", "passwordsignup": "monkeys"}'  
 -s -o /dev/null 
 -w "%{time_total}\n"  
 https://kaliumclothing.herokuapp.com/user/create;
done

echo 'Response Time of API: https://kaliumclothing.herokuapp.com/search-result?value=ac'
for i in {1..50};do
curl -X GET \
  https://kaliumclothing.herokuapp.com/search-result?value=ac \
  -H 'cache-control: no-cache' \
  -s -o /dev/null -w "%{time_total}\n"

done