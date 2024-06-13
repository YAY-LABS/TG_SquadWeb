import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useUserStore from '../store/userUserStore';
import { Button, Spinner, Cell, Modal } from '@telegram-apps/telegram-ui';
import fetchAPI from '../lib/utils/fetchApi';
import { decodeBase62, getInviteUrl } from '../lib/utils/helpers';
import { getSquads, joinSquad } from '../lib/squad';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useUserStore();
  const [squads, setSquads] = useState<any>(null);
  const [openModalUsername, setOpenModalUsername] = useState<string>('');
  const [isLeaveLoading, setIsLeaveLoading] = useState<boolean>(false);
  const [isJoinLoading, setIsJoinLoading] = useState<boolean>(false);

  const fetchSquads = async () => {
    try {
      const squads = await getSquads('sortBy=score');
      setSquads(squads);
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleLeaveClick = async () => {
    if (!user) return;
    try {
      setIsLeaveLoading(true);
      await fetchAPI('POST', `/leave-squad`, { userId: user.userId });
      setUser({ ...user, squad: null });
      fetchSquads();
    } catch (error: any) {
    } finally {
      setIsLeaveLoading(false);
    }
  };

  const handleJoinClick = async (squadUsername: string) => {
    setIsJoinLoading(true);
    if (!user) return;
    try {
      const joinResult = await joinSquad(user.userId, squadUsername);
      setUser({
        ...user,
        squad: {
          ...joinResult,
          members: [...joinResult.members, user],
        },
      });
      navigate(`/squad/${joinResult.chatId}`);
    } catch (error: any) {
    } finally {
      setIsJoinLoading(false);
      setOpenModalUsername('');
    }
  };

  useEffect(() => {
    if (!user) return;
    // 스쿼드 초대 링크로 유입된 건지 확인
    const tgWebAppStartParam = new URLSearchParams(location.search).get(
      'tgWebAppStartParam'
    );
    if (tgWebAppStartParam) {
      const decodedInviteUrl = decodeBase62(tgWebAppStartParam);
      const [userId, chatUsername] = decodedInviteUrl.split(/_(.*)/);
      if (user?.userId === userId) {
        alert('can not invite yourself!');
      } else {
        setOpenModalUsername(chatUsername);
      }
    }
    fetchSquads();
  }, [user]);

  return (
    <main>
      {user && user.squad ? (
        <div>
          <p className='font-bold uppercase'>my squad</p>
          <p>Title: {user.squad.title}</p>
          <p>Username: {user.squad.username}</p>
          <p>Members: {user.squad.members.length}</p>
          <Link
            className='px-3 py-2 mt-5 mr-3 bg-blue-500 text-white font-bold rounded-3xl hover:text-white'
            to={getInviteUrl(user.userId, user.squad.username)}
          >
            Invite friend
          </Link>
          <Button
            className='mt-5 text-sm'
            size='s'
            onClick={handleLeaveClick}
            loading={isLeaveLoading}
            disabled={isLeaveLoading}
          >
            Leave squad
          </Button>
        </div>
      ) : (
        <Link
          className='px-3 py-2 bg-blue-500 text-white font-bold rounded-3xl'
          to='/squad/create'
        >
          Create squad
        </Link>
      )}
      <Link
        className='inline-block mt-2 ml-3 px-3 py-2 border border-blue-400 text-blue-400 rounded-3xl'
        to='/squads'
      >
        All squad
      </Link>
      <p className='mt-10 mb-2 uppercase font-bold'>Weekly Ranking</p>
      <section>
        {squads ? (
          squads.length ? (
            <div className='border border-gray-400 rounded-md'>
              {squads.map((squad: any, index: number) => (
                <Modal
                  className='py-10 border border-gray-400'
                  key={`modal-${squad.chatId}`}
                  open={openModalUsername === squad.username}
                  onOpenChange={(isOpen) => {
                    if (!isOpen) {
                      setOpenModalUsername('');
                    }
                  }}
                  trigger={
                    <Cell
                      className='border-b border-gray-400 last:border-b-0'
                      before={<span>{index + 1}</span>}
                      onClick={() => setOpenModalUsername(squad.username)}
                      key={squad.chatId}
                    >
                      {squad.title}
                    </Cell>
                  }
                >
                  <p className='mb-5 uppercase font-bold'>{squad.title}</p>
                  <p>Username: {squad.username}</p>
                  <p>Members: {squad.members.length}</p>
                  {user?.squad?.chatId !== squad.chatId && (
                    <Button
                      className='mt-5 w-[140px] uppercase'
                      onClick={() => handleJoinClick(squad.username)}
                      loading={isJoinLoading}
                      disabled={isJoinLoading}
                    >
                      join
                    </Button>
                  )}
                </Modal>
              ))}
            </div>
          ) : (
            <p>There are no squads yet.</p>
          )
        ) : (
          <Spinner className='flex justify-center' size='m' />
        )}
      </section>
    </main>
  );
}

export default Home;
