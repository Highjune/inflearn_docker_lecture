FROM node:10
# COPY package.json ./   // 외부에 있는 package.json 을 현재 디렉토리(./) 안으로. 그러면 컨테이너 안에 생성이 됨
# 밑의 COPY ./ ./ 는 
COPY ./ ./

RUN npm install

CMD ["node", "server.js"]