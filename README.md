#run server
  1.cd project root 
  
  2.npm install 
  
  3.npm run dev/staging/prod
  
  3.http://localhost:8080/


#路由匹配：

product/:id 		--> product/111(yes)  product/name(yes)
product/:id(\\d+)	--> product/111(yes) product/name(no) 用于匹配数字

