FROM docker/compose:1.24.0

WORKDIR /app
COPY . /app

RUN

CMD yarn run prod