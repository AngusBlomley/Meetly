// Import necessary dependencies
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

// Define types for locations and stations
interface Location {
  lat: number;
  lng: number;
}

interface Station {
  name: string;
  location: Location;
}

// Define the properties for PlacesAutocomplete component
interface PlacesAutocompleteProps {
  id: string;
  label: string;
  value: string;
  onChange: (address: string) => void;
}

// Define the Google Maps libraries to be used
const libraries: Library[] = ["places"];

// Main component for finding the nearest station
const NearestStationFinder: React.FC = () => {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Set initial states for address and map information
  const [address1, setAddress1] = useState<string>("");
  const [address2, setAddress2] = useState<string>("");
  const [mapCenter, setMapCenter] = useState<Location>({ lat: 0, lng: 0 });
  const [nearestStation, setNearestStation] = useState<Station | null>(null);
  const [formVisible, setFormVisible] = useState(true);
  const [address1Location, setAddress1Location] = useState<Location | null>(
    null
  );
  const [address2Location, setAddress2Location] = useState<Location | null>(
    null
  );

  const mapRef = useRef<google.maps.Map>();

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const panTo = (center: Location) => {
    if (mapRef.current) {
      mapRef.current.panTo(center);
    }
  };

  // Get user's current location or default to London if geolocation fails
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

  // Geocode an address and handle errors
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

  // Find the nearest station based on two input addresses
  const findNearestStation = async () => {
    const apiRoute = "/api/google_api";

    const geocodeCallbackAsync = async (endpoint: string, address: string) => {
      try {
        const response = await axios.post(apiRoute, {
          endpoint,
          params: { address },
        });

        const location = response.data.results[0].geometry.location;
        return [location, null];
      } catch (error) {
        return [null, error];
      }
    };

    // Geocode the first address
    const [location1, err1] = await geocodeCallbackAsync("geocode", address1);

    if (err1) {
      console.error("Error geocoding address 1:", err1);
      alert("Error geocoding address 1. Please try again.");
      return;
    }

    setAddress1Location(location1);

    // Geocode the second address
    const [location2, err2] = await geocodeCallbackAsync("geocode", address2);

    if (err2) {
      console.error("Error geocoding address 2:", err2);
      alert("Error geocoding address 2. Please try again.");
      return;
    }

    setAddress2Location(location2);

    // Calculate the midpoint between two locations
    const midpoint: Location = {
      lat: (location1!.lat + location2!.lat) / 2,
      lng: (location1!.lng + location2!.lng) / 2,
    };

    // Find the nearest station using Google Places API
    try {
      const res = await axios.post(apiRoute, {
        endpoint: "place/nearbysearch",
        params: {
          location: `${midpoint.lat},${midpoint.lng}`,
          radius: 2000,
          type: "train_station|subway_station|light_rail_station",
        },
      });

      if (res.data.results.length === 0) {
        alert("No stations found nearby");
        return;
      }

      // Set the nearest station and center the map
      const station = res.data.results[0];
      setNearestStation({
        name: station.name,
        location: station.geometry.location,
      });

      panTo(midpoint);
    } catch (error) {
      console.error("Error finding the nearest station:", error);
      alert("Error finding the nearest station. Please try again.");
    }
  };

  const geocodeCallbackAsync = async (url: string, address: string) => {
    try {
      const response = await axios.get(url, {
        params: { address, key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY },
      });

      const location = response.data.results[0].geometry.location;
      return [location, null];
    } catch (error) {
      return [null, error];
    }
  };

  // Render the main component
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Meetly</title>
      </Head>

      <main className="animate-fade-in opacity-0 z-10 flex w-full flex-1 flex-col items-center justify-center px-20 font-poppins">
        <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
          {formVisible && (
            // Render the form for entering two addresses
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
            // Render the Back button to show the form again
            <>
              <div className="mt-10 lg:float-right lg:h-38 lg:align-top lg:border-solid lg:border-2 lg:border-black lg:p-2 lg:bg-white hidden lg:block sm:invisible xl:visible">
                <p className="text-center text-lg">
                  The best station to meet up between
                  <strong> {address1} </strong> and
                  <strong> {address2} </strong> is:
                  <br></br>
                  <strong>
                    {mapCenter ? ` ${nearestStation?.name}!` : ""}{" "}
                  </strong>
                </p>
              </div>
              <div className="fixed top-10 right-0 mr-20 lg:absolute lg:float-right lg:w-48 lg:h-38 lg:align-top lg:border-solid lg:border-2 lg:border-black lg:p-2 lg:bg-white hidden lg:block sm:invisible xl:visible">
                <h2 className="flex justify-center font-bold text-lg">
                  Legend
                </h2>
                <div className="mt-2">
                  <div className="inline-flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="#0448be"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <h3>Location one</h3>
                  </div>
                  <div className="inline-flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="#038c03"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <h3>Location two</h3>
                  </div>
                  <div className="inline-flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="#b90404"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <h3>Meetup Point</h3>
                  </div>
                </div>
              </div>
              <div className="mt-auto">
                <button
                  className="mb-4 w-32 align-bottom border-solid border-2 border-black p-2 bg-blue-400 hover:bg-blue-500"
                  onClick={() => setFormVisible(true)}
                >
                  Back
                </button>
              </div>
            </>
          )}

          {formVisible && (
            <footer className="fixed left-0 bottom-0 w-full p-5">
              <h6 className="opacity-75 font-rooney text-center">
                Created by Angus Blomley
              </h6>
            </footer>
          )}

          <GoogleMap // Render the Google Map with markers for entered addresses and the nearest station
            ref={mapRef}
            center={mapCenter}
            zoom={14}
            onLoad={onMapLoad}
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
            {address1Location && (
              // Render the marker for Address 1
              <Marker
                position={address1Location}
                title="Address 1"
                icon={{
                  url: "data:image/svg+xml;utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' fill='%230448be'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/></svg>",
                  scaledSize: new google.maps.Size(48, 48),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(12, 24),
                }}
              />
            )}
            {address2Location && (
              // Render the marker for Address 2
              <Marker
                position={address2Location}
                title="Address 2"
                icon={{
                  url: "data:image/svg+xml;utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' fill='%23038c03'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/></svg>",
                  scaledSize: new google.maps.Size(48, 48),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(12, 24),
                }}
              />
            )}
            {nearestStation && (
              // Render the marker for the nearest station
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

// Render the PlacesAutocomplete component for entering addresses
export const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  id,
  label,
  value,
  onChange,
}) => {
  // Create a ref to store the Google Places Autocomplete instance
  const autocompleteRef = useRef<google.maps.places.Autocomplete>();

  // Function to initialize the Autocomplete instance on load
  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocomplete.setFields(["address_components", "geometry", "icon", "name"]);
    autocompleteRef.current = autocomplete;
  };

  // Function to handle when the selected place changes in the Autocomplete input
  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    onChange(place.formatted_address || "");
  };

  //Return Autocomplete
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
