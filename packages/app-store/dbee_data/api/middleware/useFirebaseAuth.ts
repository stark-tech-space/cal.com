import { Request, Response } from 'express';
import { firestore, auth } from '../_accounts/firebase';
import { Account, Role } from '../_accounts/types/account';

/**
 * query.accountId: string
 *
 * 3 auth situations:
 * X-Apigateway-Api-Userinfo (google cloud Api Gateway)
 * req.headers.authorization = Bearer <token>
 * query.token = <token>
 */
const useFirebaseAuth = async (req: Request, res: Response, next: () => void) => {
  try {
    const base64AuthPayload: string = req.header('X-Apigateway-Api-Userinfo') || 'e30';
    const buffer = Buffer.from(base64AuthPayload, 'base64url');
    res.locals.auth = JSON.parse(buffer.toString('utf8'));
    if (!res.locals.auth.user_id) {
      const token = req.header('authorization')?.split(' ')[1] || '';
      try {
        res.locals.auth = await auth.verifyIdToken(token);
      } catch (error) {
        console.error(error)
      }
    }

    if (!res.locals.auth.user_id) {
      const token = (req.query?.token as string) || '';
      try {
        res.locals.auth = await auth.verifyIdToken(token);
      } catch (error) {
        console.error(error)
      }
    }

    const { accountId } = req.query;

    const accountSnap = await firestore.doc(`accounts/${accountId}`).get();

    if (!accountSnap.exists) {
      res.sendStatus(400);
      return;
    }

    const accountData = accountSnap.data() as Account;
    if (!Object.values(Role).includes(accountData.userRoles[res.locals.auth.user_id || ''])) {
      res.sendStatus(403);
      return;
    }

    res.locals.account = { ...accountData, id: accountId };
    next();
  } catch (error) {
    return res.sendStatus(400);
  }
};

export default useFirebaseAuth;
