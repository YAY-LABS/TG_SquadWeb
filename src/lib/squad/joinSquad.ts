import fetchAPI from '../utils/fetchApi';
import type { SquadJoinRequest } from '../../types/squad';

export default async function joinSquad(userId: string, chatUsername: string) {
  try {
    const body: SquadJoinRequest = {
      username: chatUsername,
      userId,
    };
    const squad = await fetchAPI('POST', `/join-squad`, body);
    return squad;
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}
