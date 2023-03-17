import Head from "next/head";
import React, { FormEvent, useState, useEffect, useRef } from "react";
import {
  Library,
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import axios from "axios";

interface Location {
  lat: number;
  lng: number;
}

interface Station {
  name: string;
  location: Location;
}

interface PlacesAutocompleteProps {
  id: string;
  label: string;
  value: string;
  onChange: (address: string) => void;
}

const libraries: Library[] = ["places"];

const NearestStationFinder: React.FC = () => {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [address1, setAddress1] = useState<string>("");
  const [address2, setAddress2] = useState<string>("");
  const [mapCenter, setMapCenter] = useState<Location>({ lat: 0, lng: 0 });
  const [nearestStation, setNearestStation] = useState<Station | null>(null);
  const [formVisible, setFormVisible] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter({ lat: latitude, lng: longitude });
      },
      () => {
        // Default to London if geolocation fails
        setMapCenter({ lat: 51.5072, lng: 0.1276 });
      }
    );
  }, []);

  const geocodeCallback = (
    url: string,
    address: string,
    callback: (err: Error | null, location: Location | null) => void
  ) => {
    axios
      .get(url, {
        params: { address, key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY },
      })
      .then((res) => callback(null, res.data.results[0].geometry.location))
      .catch((err) => callback(err, null));
  };

  const findNearestStation = () => {
    const corsProxy = "http://localhost:3001/api?url=";
    const placesUrl =
      corsProxy +
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    const geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json";

    geocodeCallback(geocodeUrl, address1, (err1, location1) => {
      if (err1) {
        console.error("Error geocoding address 1:", err1);
        alert("Error geocoding address 1. Please try again.");
        return;
      }

      geocodeCallback(geocodeUrl, address2, (err2, location2) => {
        if (err2) {
          console.error("Error geocoding address 2:", err2);
          alert("Error geocoding address 2. Please try again.");
          return;
        }

        const midpoint: Location = {
          lat: (location1!.lat + location2!.lat) / 2,
          lng: (location1!.lng + location2!.lng) / 2,
        };

        axios
          .get(placesUrl, {
            params: {
              location: `${midpoint.lat},${midpoint.lng}`,
              radius: 5000,
              type: "train_station",
              key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
            },
          })
          .then((res) => {
            if (res.data.results.length === 0) {
              alert("No stations found nearby");
              return;
            }

            const station = res.data.results[0];
            setNearestStation({
              name: station.name,
              location: station.geometry.location,
            });

            setMapCenter(midpoint);
          })
          .catch((error) => {
            console.error("Error finding the nearest station:", error);
            alert("Error finding the nearest station. Please try again.");
          });
      });
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Meetly</title>
      </Head>

      <main className="animate-fade-in opacity-0 z-10 flex w-full flex-1 flex-col items-center justify-center px-20 font-poppins">
        <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
          {formVisible && (
            <div className="w-96">
              <h1 className="text-8xl font-bold text-blue-500 font-rooney text-center">
                Meetly
              </h1>
              <p className="mt-10 text-2xl">Meetup at your nearest station!</p>
              <p className="mt-5 text-2xl w-96 text-left">
                Enter two locations to find your nearest meetup station.
              </p>
              <form
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  findNearestStation();
                  setFormVisible(false);
                }}
              >
                <PlacesAutocomplete
                  id="address1"
                  label="Address 1"
                  value={address1}
                  onChange={(address) => setAddress1(address)}
                />
                <PlacesAutocomplete
                  id="address2"
                  label="Address 2"
                  value={address2}
                  onChange={(address) => setAddress2(address)}
                />
                <button
                  className="w-full mt-5 border-solid border-2 border-black p-2 flex-none bg-blue-400 hover:bg-blue-500"
                  type="submit"
                >
                  Submit
                </button>
              </form>
            </div>
          )}

          {!formVisible && (
            <button
              className="mt-auto w-32 align-bottom border-solid border-2 border-black p-2 bg-blue-400 hover:bg-blue-500"
              onClick={() => setFormVisible(true)}
            >
              Back
            </button>
          )}

          <GoogleMap
            center={mapCenter}
            zoom={14}
            mapContainerStyle={{
              position: "absolute",
              left: "0",
              top: "0",
              height: "100vh",
              width: "100%",
              zIndex: "-10",
              filter: formVisible ? "blur(5px)" : "none",
            }}
          >
            {nearestStation && (
              <Marker
                position={nearestStation.location}
                title={nearestStation.name}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </main>
    </div>
  );
};

export const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  id,
  label,
  value,
  onChange,
}) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete>();

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocomplete.setFields(["address_components", "geometry", "icon", "name"]);
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    onChange(place.formatted_address || "");
  };

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={{ fields: ["formatted_address"] }}
      >
        <input
          id={id}
          className="w-full mt-5 border-solid border-2 border-black p-2"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label}
        />
      </Autocomplete>
    </div>
  );
};

export default NearestStationFinder;
