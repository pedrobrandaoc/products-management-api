import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { env } from "./env.js";

const PgSession = connectPgSimple(session);

export const SESSION_COOKIE_NAME = "sid";

const isProduction = env.NODE_ENV === "production";

export const sessionMiddleware = session({
  name: SESSION_COOKIE_NAME,

  store: new PgSession({
    conString: env.DATABASE_URL, // conexão PostgreSQL
    createTableIfMissing: true, // cria automaticamente a tabela de sessão se ela ainda não existir
  }),

  secret: env.SESSION_SECRET, // protege/assina o identificador da sessão
  resave: false, // evita salvar novamente uma sessão que não sofreu alteração
  saveUninitialized: false, // evita criar sessão para usuários que ainda não têm nenhum dado nela

  cookie: {
    httpOnly: true, // impede JavaScript do frontend de acessar diretamente esse cookie.
    sameSite: "lax", // ajuda a restringir quando o navegador envia o cookie em requisições originadas de outros sites
    secure: isProduction, // por enquanto, isso permite envio de cookie via HTTP
    maxAge: 1000 * 60 * 60 * 24, // é o tempo de vida do cookie em milissegundos (24h total)
  },
});
