import { Request, Response } from 'express';

export interface IAuthUser {
  user?: {
    id: string;
  };
}

export interface IContext {
  // req: Request & {
  //   user?: {
  //     id: string;
  //   };
  // };
  req: Request & IAuthUser;
  res: Response;
}
