# inflearn-docker_lecture
[인프런에서 도커 강의 따라하기](https://www.inflearn.com/course/%EB%94%B0%EB%9D%BC%ED%95%98%EB%A9%B0-%EB%B0%B0%EC%9A%B0%EB%8A%94-%EB%8F%84%EC%BB%A4-ci/dashboard


# DockerFile
```
FROM node:10

WORDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY ./ ./

CMD ["node", "server.js"]
```
- FROM
    - 베이스 레이어

- WORKDIR
    - 이미지안에서 app 소스 코드를 가지고 있을 디렉토리 생성하는 것
    - 어플리케이션에 working directory 가 된다
    - 쉘로 접근하면 제일 처음 접근하게 되는 곳
    - 필요성
        - 정돈 안됨
            - 만약 WORKDIR 를 지정하지 않고 그냥 COPY를 할 때는 ./ 루트 디렉토리 안에 다 복사되서 bin, etc, lib 등과 같은 시스템 파일들과 섞인다
        - 원래 이미지에 있는 파일과 이름이 같다면 덮어쓴다.

- COPY
    - COPY package.json ./
        - 컨테이너 안에 복사. 그래야 실행가능. 아니면 외부에 존재하므로 컨테이너 안에서 실행 못함
        - 그런데 npm install 하기 전에 package.json 만 먼저 하는 이유
            - 소스코드만 수정한 경우, 의존성들을 다시 다운받을 필요 없어서 캐싱해서 사용할 수 있도록 '동일하다'는 것을 보여주기 위해
            - https://www.inflearn.com/questions/134764
            - 이렇게 하지 않으면 문제점
                - COPY ./ ./ 이 부분으로 인해서 소스를 변화시킨 부분은 아주 적지만(server.js) 모든 node_module 에 있는 종속성들까지 다시 다운받아줘야 한다.
                - 이미지를 다시 생성하고 다시 컨테이너를 실행시켜줘야 한다.
        
    - COPY ./ ./ 
        - 현재 디렉토리를 컨테이너의 root 디렉토리에 복사
        
- RUN
    - 필요한 여러 족송성 다운로드
    - 만약 도커에서 노드를 실행하려고 한다면, 로컬에 생성된 node_modules는 지워주는 것이 좋다.
        - RUN npm install 명령어로 인해 컨테이너 안에 node_modules가 설치될 것이고 그 다음의 `COPY ./ ./` 에서 로컬의 node_modules가 있다면 또 컨테이너의 ./ 로 복사가 됨.

- CMD
    - 컨테이너 시작시 실행되는 명령어


# docker volume
- 로컬의 소스 코드만 수정한 상태에서 도커 이미지를 다시 빌드하지 않고, 컨테이너 안의 파일들이 local 에 있는 파일들을 참조(매핑)하도록 하는 방법
- 도커 이미지 빌드 후에 아래처럼 실행하면 된다
    ```
    docker run -p 3000:3000 -v /usr/src/app/node_modules -v $(pwd):/usr/src/app <이미지 아이디>
    ```
    - `-v /usr/src/app/node_modules`
        - 참조하지 말라는 것
        - 컨테이너 안에서 npm install 로 생성되는 node_modules 는 로컬(호스트 디랙토리) 에 없으므로 참조하지 말고 그냥 컨테이너 안의 것 써라~
    - `-v $(pwd):/usr/src/app`
        - pwd(현재 디렉토리) 경로에 있는 디렉토리 혹은 파일을 /usr/src/app 경로에서 참조
        - /usr/src/app 은 참고로 컨테이너의 WORKDIR 위치.
```
docker run -d -p 5000:8000 -v /usr/src/app/node_modules -v $(pwd):/usr/src/app highjune/nodejs
```

# docker compose
- 컨테이너간 연결하기 위한 것
- docker-compose.yml 파일이 있는 위치에서 compose 명령어가 먹힌다.
    - docker-compose.yml 파일을 사용하면 docker run 을 할 떄 -v 옵션등을 길게 안 적어도 된다
- 이미지가 없을 떄 이미지를 빌드하고 컨테이너 시작
```
docker-compose up
```
- 이미지가 있든 없든 이미지를 빌드하고 컨테이너 시작
    - 그래서 소스코드 수정한 후에 변경된 사항을 반영해서 실행하려면 아래처럼.
```
docker-compose up --build
```
- 도커 컴포즈를 통해 작동시킨 컨테이너들을 중단하려면(docker-compose.yml 파일의 services 에 있는 컨테이너들 다 꺼짐)
```
docker compose down
```
- -d 옵션
    - detach. 즉 백그라운드에서 실행. 그래서 앱에서 나오는 output은 표출하지 않는다.
    ```
    docker-compose up -d
    ``` 
## docker-compose.yml 예시
```yml
version: "3"
services: 
    react: 
        build:
            context: .
            dockerfile: Dockerfile.dev
        ports:
            - "3000:3000"
        volumes: 
            - /usr/src/app/node_modules
            - ./:/usr/src/app
        stdin_open: true
    tests: 
        build:
            context: .
            dockerfile: Dockerfile.dev
        volumes: 
            - /usr/src/app/node_modules
            - ./:/usr/src/app
        command: ["npm", "run", "test"]
```
- version 
    - 도커 컴포즈의 버전
- services
    - 이곳에 실행하려는 컨테이너들을 정의
    - 위에서는 2개의 컨테이너(react, tests) 를 실행한 것임
- react 
    - 컨테이너 이름
- build
    - 현 디렉토리에 있는 Dockerfile 사용
- context
    - 도커 이미지를 구성하기 위한 파일과 폴더들이 있는 위
- dockerfile
    - 도커 파일 어떤 것인지 지정
- ports
    - 포트 맵핑. 로컬 포트:컨테이너 포트
- volumes
    - 로컬 머신에 있는 파일들 맵핑
    - `/usr/src/app/node_modules`
        - 컨테이너에서 로컬의 파일 중 참고 안하는 것
    - `./:/usr/src/app`
        - 컨테이너의 WORKDIR 인 /usr/src/app 여기에서 로컬의 ./ 현재 디렉터리를 참고하겠다.
- stdin_open
    - 리액트 앱을 끌 때 필요(버그 수정)

# 일반 명령어
- 이미지 생성
    ```
    docker build -t highjune/nodejs ./
    ```
    - -t 는 이미지에 이름 붙이는 태그
    - 마지막의 ./ 는 현재 디렉토리. 즉 Dockerfile 이 존재하는 곳. 알아서 Dockerfile을 읽어들인다.
    - Dockerfile 말고 Dockerfile.dev 와 같은 파일로 빌드할 때는 어느 파일을 Dockerfile로 사용할지 명시해줘야 한다.
        - `-f` 옵션 사용. 현재 디렉토리 안의 Dockerfile.dev 를 빌드해보자
        ```
        docker build -f Dockerfile.dev ./
        ```

- 생성한 이미지로 컨테이너 실행
    - 위에서 만든 이미지 실행 
    ```
    docker run highjune/nodejs  
    ```
    - 어플리케이셔 포트랑 컨테이너 포트 mapping 해서 실행
        - 네트워크도 로컬 네트워크에 있던 것을 컨테이너 내부에 있는 네트워크에 연결시켜줘야 한다.
        - 로컬 브라우저에서 http://localhost:5000 으로 하면 컨테이너 내부의 8000번과 연결
        ``` 
        docker run -p 5000:8000 highjune/nodejs
        ```
- 실행중인 컨테이너 중지
    ```
    docker stop <id>
    ```

- 컨테이너 리스트 확인
    - 실행중인 컨테이너 리스트 확인
    ```
    docker ps
    ```
    - 상태 무관 모든 컨테이너 리스트 확인
    ```
    docker ps -a
    ```

- 생성한 컨테이너에 쉘로 접근
    ```
    docker run -it <이미지 이름> sh
    ```
    - 쉘에 들어가서 ls 로 파일리스트 확인가능
    - 쉘에서 나올때는 ctrl + D
    - 그리고 쉘로 컨테이너에 들어가게 되는 첫 디렉토리는 WORKDIR 로 설치한 곳이다. ex) /usr/src/app 
        - WORKDIR 를 설정하면 /(루트) 부터 접근하는 것이 아니다.

- 삭제 
    - 컨테이너 삭제하기
        - 실행중인 컨테이너는 중지한 후에 삭제 가능
        - docker rm <아이디/이름>
        ```
        docker rm d663a7338315
        ```
        - 모든 컨테이너 삭제(실행중인 것들은 안 지워짐), 그리고 다시 확인
        ```
        docker rm `docker ps -a -q`
        docker ps
        ```

    - 이미지 삭제
    ```
    docker rmi <이미지id>
    ```

    - 한번에 컨테이너, 이미지, 네트워크 모두 삭제?
        - 실행중인 컨테이너는 안 지워짐
    ```
    docker system prune
    ```

# 에러 및 해결
- port is already allocated. 
    ```
    docker container ls
    docker rm -f <container-name>
    ```
