import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';

const Home: NextPage = () => {
  const [location1, setLocation1] = useState('');
  const [location2, setLocation2] = useState('');
  const [stations, setStations] = useState<{ lat: number; lng: number }[]>([]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Meelty</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://use.typekit.net/esy2wxi.css" />
        <script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script>
      </Head>

      <div className="absolute inset-0 w-full h-full opacity-50 object-cover">
        <img
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          src="/background.PNG"
          alt="background"
        ></img>
      </div>

      <main className="animate-fade-in opacity-0 z-10 flex w-full flex-1 flex-col items-center justify-center px-20 font-poppins">
        <div className="w-96">
          <h1 className="text-8xl font-bold text-blue-500 font-rooney text-center">
            Meetly
          </h1>

          <p className="mt-10 text-2xl">Meetup at your nearest station!</p>

          <p className="mt-5 text-2xl w-96 text-left">
            Enter two locations to find your nearest meetup station.
          </p>

          <form>
            <input
              className="w-full mt-5 border-solid border-2 border-black p-2"
              placeholder="First location"
              type="text"
              value={location1}
              onChange={(e) => setLocation1(e.target.value)}
              required
            />
            <input
              className="w-full mt-5 border-solid border-2 border-black p-2 flex-none" 
              placeholder="Second location" 
              type="text"
              value={location2}
              onChange={(e) => setLocation2(e.target.value)}
              required
            />
            <button className="w-full mt-5 border-solid border-2 border-black p-2 flex-none bg-blue-400 hover:bg-blue-500" type="submit">Submit</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Home;