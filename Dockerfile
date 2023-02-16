FROM denoland/deno:1.30.3

WORKDIR /app

COPY . .

ENV DENO_ENV=production

RUN deno cache deps.ts

CMD deno task start