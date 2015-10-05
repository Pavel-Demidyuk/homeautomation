FROM google/nodejs

  WORKDIR /app
  ADD package.json /app/
  RUN npm install
  RUN npm install -g nodemon

  CMD []
  ENTRYPOINT ["nodemon", "./bin/www"]
