import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Cell, Spinner } from '@telegram-apps/telegram-ui';
import useUserStore from '../../store/userUserStore';
import fetchAPI from '../../lib/utils/fetchApi';

export default function SquadList() {
  const { user } = useUserStore();
  const [squads, setSquads] = useState<any>(null);

  const getSquads = async () => {
    try {
      const squads = await fetchAPI('GET', `/squads`);
      console.log(squads);
      setSquads(squads);
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSquads();
  }, []);

  return (
    <main>
      <p className='mt-10 mb-2 uppercase font-bold'>squad list</p>
      <section>
        {squads && user ? (
          squads.length ? (
            <div className='border border-gray-400 rounded-md'>
              {squads
                .filter(
                  (squad: any) =>
                    !user.squad || squad.chatId !== user.squad.chatId
                )
                .map((squad: any) => (
                  <Link className='text-black' to={`/squad/${squad.chatId}`}>
                    <Cell
                      className='border-b border-gray-400 last:border-b-0'
                      after={<ChevronRightIcon width={24} height={24} />}
                      // before={
                      //   <img
                      //     src={`https://squad-api.loca.lt/profile-photo?photo=${squad.photo}`}
                      //     width={48}
                      //     height={48}
                      //   />
                      // }
                      key={squad.chatId}
                    >
                      {squad.title}
                    </Cell>
                  </Link>
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
