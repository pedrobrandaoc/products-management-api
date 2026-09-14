import express from "express";
import helmet from "helmet";
import cors from "cors";

import { env } from "./config/env.js";
import { sessionMiddleware } from "./config/session.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

import { authRouter } from "./modules/auth/auth.routes.js";
import { productRouter } from "./modules/products/product.routes.js";
import { invoiceRouter } from "./modules/invoice/invoice.routes.js";

const app = express(); // cria a aplicação express por meio de um objeto

if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by"); // tira a visibilidade dos usuários para saberem que o app é express

app.use(helmet()); // aplica um conjunto de proteções HTTP comuns de forma centralizada
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true, // permite que o navegador trabalhe com credenciais em requisições cross-origin, incluindo nosso cookie de sessão
  }),
);
app.use(express.json()); // permite que o Express leia o JSON enviado no body
app.use(sessionMiddleware); // responsável pela configuração das sessions

// rotas, estrutura: app.METHOD(PATH, HANDLER)
app.get("/health", (req, res) => {
  return res.status(200).json({
    message: "Ok :)",
  });
});

app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/invoice", invoiceRouter);

// se houver algum erro, o express busca esse middleware para tratar
app.use(errorMiddleware);

export { app };
