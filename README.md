# inflearn-docker_lecture
[인프런에서 도커 강의 따라하기](https://www.inflearn.com/course/%EB%94%B0%EB%9D%BC%ED%95%98%EB%A9%B0-%EB%B0%B0%EC%9A%B0%EB%8A%94-%EB%8F%84%EC%BB%A4-ci/dashboard)


# DockerFile
```
FROM node:10

COPY ./ ./

RUN npm install

CMD ["node", "server.js"]
```
- FROM
    - 베이스 레이어

- WORKDIR
    - 이미지안에서 app 소스 코드를 가지고 있을 디렉토리 생성하는 것
    - 어플리케이션에 working directory 가 된다
    - 필요성
        - 정돈 안됨
            - 만약 WORKDIR 를 지정하지 않고 그냥 COPY를 할 때는 ./ 루트 디렉토리 안에 다 복사되서 bin, etc, lib 등과 같은 시스템 파일들과 섞인다
        - 원래 이미지에 있는 파일과 이름이 같다면 덮어쓴다.
        - 

- COPY
    - COPY package.json ./
        - 컨테이너 안에 복사. 그래야 실행가능. 아니면 외부에 존재하므로 컨테이너 안에서 실행 못함
    - COPY ./ ./ 
        - 현재 디렉토리를 컨테이너의 root 디렉토리에 복사
        
- RUN
    - 필요한 여러 족송성 다운로드

- CMD
    - 컨테이너 시작시 실행되는 명령어

# 명령어
- 이미지 생성
    ```
    docker build -t highjune/nodejs ./
    ```
    - -t 는 이미지에 이름 붙이는 태그
    - 마지막의 ./ 는 현재 디렉토리. 즉 Dockerfile 이 존재하는 곳. 알아서 Dockerfile을 읽어들인다.

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

- 컨테이너 리스트 확인
    - 실행중인 컨테이너 리스트 확인
    ```
    docker ps
    ```
    - 상태 무관 모든 컨테이너 리스트 확인
    ```
    docker ps -a
    ```

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
