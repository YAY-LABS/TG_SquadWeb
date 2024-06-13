import fetchAPI from '../utils/fetchApi';

export default async function getSquads(query?: string) {
  try {
    const squads = await fetchAPI('GET', `/squads${query && `?${query}`}`);
    console.log(squads);
    return squads;
  } catch (error: any) {
    console.log(error);
  }
}
