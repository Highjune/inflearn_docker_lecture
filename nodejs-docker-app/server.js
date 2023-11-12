const express = require('express');

const PORT = 8000;

//APP
const app = express(); // 새로운 Express 어플 생성
app.get('/', (req,res) => { // '/' 경로로 요청이 오면 Hello World 결과값으로 전달
    res.send("안녕하세요(축소됨)!!!!!!!!!!!")
});

app.listen(PORT); // 이 포트에서 앱이 실행됨 
console.log("Hi june, Server is running");