FROM node:alpine
WORKDIR /user/app/server
COPY package.json yarn.lock ./
RUN yarn
COPY . .
ENV NODE_ENV=production
EXPOSE 8000
CMD [ "yarn","start" ]