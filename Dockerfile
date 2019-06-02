FROM docker

WORKDIR /app
COPY . /app

RUN apk update
RUN apk add py-pip python-dev libffi-dev openssl-dev gcc libc-dev make nodejs-current yarn
RUN pip install docker-compose
RUN yarn --prod --force
RUN yarn cache clean

CMD yarn run prod