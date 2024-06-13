import { useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { Button, Input } from '@telegram-apps/telegram-ui';
import useUserStore from '../../store/userUserStore';
import fetchAPI from '../../lib/utils/fetchApi';
import type { Chat } from '../../types/chat';
import type { SquadCreationRequest } from '../../types/squad';

export default function CreateSquad() {
  const { user, setUser } = useUserStore();
  const [isCreationLoading, setIsCreationLoading] = useState<boolean>(false);
  const [creationMessage, setCreationMessage] = useState<{
    message: string;
    error: boolean;
  }>({ message: '', error: false });

  const isGroupLinkValid = (groupLink: string) => {
    return groupLink.startsWith('t.me/') || groupLink.startsWith('@');
  };

  const getUsername = (groupLink: string) => {
    let username: string = groupLink;
    if (groupLink.startsWith('t.me/')) {
      username = groupLink.replace('t.me/', '');
    } else {
      username = groupLink.replace('@', '');
    }
    return username;
  };

  const getChat = async (username: string) => {
    try {
      const { chat } = await fetchAPI('GET', `/chat?username=@${username}`);
      console.log(chat);
      return chat;
    } catch (error: any) {
      if (error.message.includes('chat not found')) {
        throw Error('Chat not found');
      } else {
        throw Error('Internal server error');
      }
    }
  };

  const createSquad = async (chat: Chat) => {
    const userId = user?.userId;
    if (!userId) {
      throw { message: 'User not found' };
    }

    const body: SquadCreationRequest = {
      chatId: chat.id,
      title: chat.title,
      username: chat.username,
      photo: chat.photo,
      userId,
    };

    try {
      const squad = await fetchAPI('POST', '/create-squad', body);
      return squad;
    } catch (error: any) {
      // TODO: 에러 처리
      console.log(error);
      throw error;
    }
  };

  const transferGroupLinkToUsername = (
    event: React.FormEvent<HTMLFormElement>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setMessage: React.Dispatch<
      React.SetStateAction<{ message: string; error: boolean }>
    >
  ) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ message: '', error: false });

    const target = event.target as typeof event.target & {
      groupLink: { value: string };
    };
    const groupLinkValue = target.groupLink.value;
    const isGroupLinkValidity = isGroupLinkValid(groupLinkValue);

    if (!isGroupLinkValidity) {
      setMessage({ message: 'Invalid chat id', error: true });
      setLoading(false);
      return null;
    }

    const username = getUsername(groupLinkValue);

    return username;
  };

  const handleCreationSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    if (!user) return;
    const username = transferGroupLinkToUsername(
      event,
      setIsCreationLoading,
      setCreationMessage
    );
    if (!username) return;

    try {
      const chat = await getChat(username);
      const squad = await createSquad(chat);
      setUser({ ...user, squad });
      setCreationMessage({
        message: 'Squad created successfully',
        error: false,
      });
    } catch (error: any) {
      setCreationMessage({ message: error.message, error: true });
    } finally {
      setIsCreationLoading(false);
    }
  };

  return (
    <main>
      <section>
        <div className='font-bold uppercase text-left rounded-md'>
          <span>{'squads > '}</span>
          <b>new squad</b>
        </div>
        <form onSubmit={handleCreationSubmit}>
          <p className='mt-4 mb-8 text-left'>
            Let's create new Squad. Insert public group or channel link from
            Telegram.
          </p>
          <Input
            className='w-full'
            header='Channel / Group Link'
            name='groupLink'
            placeholder='eg. t.me/group or @Group'
          ></Input>
          {creationMessage.message && (
            <p
              className={
                creationMessage.error ? 'text-red-500' : 'text-green-600'
              }
            >
              {creationMessage.message}
            </p>
          )}
          <Button
            className='mt-4 mx-5 w-[calc(100%-40px)]'
            type='submit'
            loading={isCreationLoading}
            disabled={isCreationLoading}
          >
            Add Squad
          </Button>
        </form>
      </section>
    </main>
  );
}
