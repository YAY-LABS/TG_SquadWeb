export type SquadCreationRequest = {
  chatId: number;
  username: string;
  title: string;
  userId: string;
  photo: string;
};

export type SquadJoinRequest = {
  username: string;
  userId: string;
};
