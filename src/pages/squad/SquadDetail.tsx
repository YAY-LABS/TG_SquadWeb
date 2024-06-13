import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Spinner } from '@telegram-apps/telegram-ui';
import useUserStore from '../../store/userUserStore';
import fetchAPI from '../../lib/utils/fetchApi';
import { joinSquad } from '../../lib/squad';

type messageType = {
  message: string;
  error: boolean;
};

export default function Squad() {
  const { id } = useParams();
  const { user, setUser } = useUserStore();
  const [squad, setSquad] = useState<any>(null);
  const [isJoinLoading, setIsJoinLoading] = useState<boolean>(false);
  const [joinMessage, setJoinMessage] = useState<messageType>({
    message: '',
    error: false,
  });
  const [isLeaveLoading, setIsLeaveLoading] = useState<boolean>(false);
  const [leaveMessage, setLeaveMessage] = useState<messageType>({
    message: '',
    error: false,
  });

  const getSquad = async () => {
    try {
      const squad = await fetchAPI('GET', `/squads/${id}`);
      console.log(squad);
      setSquad(squad);
    } catch (error: any) {
      if (error.message.includes('squad not found')) {
        throw Error('Squad not found');
      } else {
        throw Error('Internal server error');
      }
    }
  };

  const handleJoinClick = async () => {
    setIsJoinLoading(true);
    setJoinMessage({ message: '', error: false });
    setLeaveMessage({ message: '', error: false });
    if (!user) return;
    try {
      await joinSquad(user.userId, squad.username);
      setUser({
        ...user,
        squad: {
          ...squad,
          members: [...squad.members, user],
        },
      });
      setJoinMessage({
        message: 'Squad joined successfully',
        error: false,
      });
      setSquad({ ...squad, members: [...squad.members, user] });
    } catch (error: any) {
      setJoinMessage({ message: error.message, error: true });
    } finally {
      setIsJoinLoading(false);
    }
  };

  const handleLeaveClick = async () => {
    setJoinMessage({ message: '', error: false });
    setLeaveMessage({ message: '', error: false });
    if (!user) return;
    try {
      setIsLeaveLoading(true);
      const userId = user.userId;
      await fetchAPI('POST', `/leave-squad`, { userId: userId });
      setUser({ ...user, squad: null });
      setLeaveMessage({ message: 'Squad left successfully', error: false });
      setSquad({
        ...squad,
        members: squad.members.filter(
          (member: any) => member.userId !== userId
        ),
      });
    } catch (error: any) {
      setLeaveMessage({ message: error.message, error: false });
    } finally {
      setIsLeaveLoading(false);
    }
  };

  useEffect(() => {
    getSquad();
  }, [id]);

  return (
    <main className='text-center'>
      {squad ? (
        <div>
          <p className='mb-5 uppercase font-bold'>{squad.title}</p>
          <p>Username: {squad.username}</p>
          <p>Members: {squad.members.length}</p>
          {leaveMessage.message && (
            <p
              className={leaveMessage.error ? 'text-red-500' : 'text-green-600'}
            >
              {leaveMessage.message}
            </p>
          )}
          {joinMessage.message && (
            <p
              className={joinMessage.error ? 'text-red-500' : 'text-green-600'}
            >
              {joinMessage.message}
            </p>
          )}
          {user?.squad?.chatId === squad.chatId ? (
            <Button
              className='mt-5 w-[140px] uppercase'
              onClick={handleLeaveClick}
              loading={isLeaveLoading}
              disabled={isLeaveLoading}
            >
              leave
            </Button>
          ) : (
            <Button
              className='mt-5 w-[140px] uppercase'
              onClick={handleJoinClick}
              loading={isJoinLoading}
              disabled={isJoinLoading}
            >
              join
            </Button>
          )}
        </div>
      ) : (
        <Spinner size='m' />
      )}
    </main>
  );
}
