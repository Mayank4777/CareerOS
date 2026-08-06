FROM node:22-alpine

WORKDIR /app

COPY frontend/package.json frontend/

RUN cd frontend && npm install

COPY frontend frontend

EXPOSE 5173

CMD ["sh", "-c", "cd frontend && npm run dev -- --host 0.0.0.0"]
