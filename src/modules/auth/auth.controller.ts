import type { Request, Response } from "express";

import { SESSION_COOKIE_NAME } from "../../config/session.js";

import { generateCsrfToken } from "../../shared/security/csrf.js";

import { registerSchema, loginSchema } from "./auth.schema.js";
import { registerService, loginService, meService } from "./auth.service.js";

export async function registerController(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);

  const user = await registerService(data);

  return res.status(201).json({
    message: "Usuário registrado com sucesso.",
    user,
  });
}

export async function loginController(req: Request, res: Response) {

  const data = loginSchema.parse(req.body);

  const user = await loginService(data);

  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({
        message: "Não foi possível iniciar a sessão.",
      });
    }

    req.session.userId = user.id;
    req.session.csrfToken = generateCsrfToken();

    return res.status(200).json({
      message: "Login realizado com sucesso.",
      user,
    });
  });
}

export async function meController(req: Request, res: Response) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      message: "Não autenticado.",
    });
  }

  const user = await meService(userId);

  return res.status(200).json({
    user,
  });
}

export async function logoutController(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        message: "Não foi possível encerrar a sessão.",
      });
    }

    res.clearCookie(SESSION_COOKIE_NAME);

    return res.status(200).json({
      message: "Sessão encerrada com sucesso.",
    });
  });
};

export async function csrfTokenController(
  req: Request,
  res: Response
) {

  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  };

  return res.status(200).json({
    csrfToken: req.session.csrfToken,
  });



}
