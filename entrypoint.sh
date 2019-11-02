#!/bin/sh

cd src && sequelize db:migrate
cd .. && npm start