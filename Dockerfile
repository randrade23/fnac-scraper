FROM node:10.13-alpine

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent && mv node_modules ../

RUN npm i --silent -g typescript

COPY . .

RUN tsc

RUN cp -r src/config dist/

CMD npm start