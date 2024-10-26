import jwt from 'jsonwebtoken';
type TokenRequest = {
  id: string;
  name: string;
  role: string;
};

export const CreateJwtToken = (payload: TokenRequest): string => {
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  });

  return token;
};
