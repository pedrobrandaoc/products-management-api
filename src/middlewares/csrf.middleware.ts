import type {
    Request,
    Response,
    NextFunction,
} from "express";

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionToken = req.session.csrfToken; // busca o token csrf armazenado na sessão

  const requestToken = req.header("x-csrf-token"); // estamos lendo um header HTTP que será enviado pelo frontend

  if (
    !sessionToken ||
    !requestToken ||
    sessionToken !== requestToken
  ) {
    return res.status(403).json({
      message: 'Token CSRF inválido.'
    });
  };

  next();

}
