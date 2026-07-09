import { useEffect, useState } from 'react';
import { IoLocationOutline } from 'react-icons/io5';

const Location = () => {
  const [latitude, setLatitude] = useState('');
  const [longitute, setLongitute] = useState('');

  const [place, setPlace] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position: any) => {
      setLatitude(position.coords.latitude);
      setLongitute(position.coords.longitude);
    });

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitute}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // console.log(data);
        setPlace(
          `${data.address.village || data.address.town || data.address.city || data.address.neighbourhood} ${data.address.postcode}`
        );
      })
      .catch(() => {
        // console.log('Could not find your location');
      });
  }, [longitute, latitude]);
  return (
    <div>
      {place ? (
        <p className="flex items-center mr-4 lg:text-[1.3rem]">
          <IoLocationOutline className="flex" />
          {place}
        </p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Location;
