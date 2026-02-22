export interface IPLocation {
  latitude: number;
  longitude: number;
  city: string;
}

export const fetchIPLocation = async (): Promise<IPLocation> => {
  const res = await fetch("https://ipapi.co/json/");
  const data = await res.json();

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    city: data.city
  };
};
