FROM node:10.13-alpine

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent && mv node_modules ../

RUN npm i --silent -g typescript sequelize-cli

COPY . .

RUN ["chmod", "+x", "./entrypoint.sh"]

RUN tsc

RUN cp -r src/config dist/

ENTRYPOINT [ "./entrypoint.sh" ]