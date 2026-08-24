import { userRepository } from "../users/user.repository.js";
import {
  hashPassword,
  verifyPassword,
  DUMMY_PASSWORD_HASH,
} from "../../shared/security/password.js";
import { AppError } from "../../shared/errors/app-erros.js";

// registra um tipo, nesse caso, o qual deve conter essas informações com essas determinadas tipagens
type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

// registra agora o tipo de login
type LoginInput = {
  email: string;
  password: string;
};

export async function registerService(data: RegisterInput) {
  // verifica se um usuário existe
  const userAlreadyExists = await userRepository.findByEmail(data.email);

  // se o usuário não existir lança um erro
  if (userAlreadyExists) {
    throw new AppError("Não foi possível concluir o cadastro.", 409);
  }

  // se não houve erro, a senha é criptografada
  const passwordHash = await hashPassword(data.password);

  // registra o usuário
  const user = await userRepository.create({
    name: data.name,
    email: data.email,
    passwordHash: passwordHash,
  });

  // retorna um objeto do usuário
  return user;
}

export async function loginService(data: LoginInput) {
  const user = await userRepository.findByEmail(data.email);

  const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;

  const passwordIsValid = await verifyPassword(passwordHash, data.password);

  if (!user || !passwordIsValid) {
    throw new AppError("Email ou senha inválidos.", 401);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export async function meService(userId: string) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError("Usuário não encontrado.", 404);
  }

  return user;
}
