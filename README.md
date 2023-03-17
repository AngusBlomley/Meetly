# Meetly

React Meetly is a web application that helps users find the nearest train station between two addresses. 
This app is perfect for planning meetups, allowing users to quickly discover a convenient location for both parties.

## Features

- Enter two addresses and the application will find the midpoint.
- Displays the nearest train station to the midpoint on a Google Map.
- The map is initially blurred and hidden, becoming visible and focused upon submitting the addresses.
- A back button allows users to return to the form and enter new addresses.

## Technologies Used

- React.js
- Next.js
- TypeScript
- Google Maps API
- Axios

## Setup and Installation

1. Clone the repository.
2. Install the dependencies using `npm install`.
3. Create a `.env.local` file in the project's root directory and add your Google Maps API key:

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

4. Run the development server using `npm run dev`.
5. Run the development CORS proxy server by opening a second terminal and entering the following two commands:

 cd my-cors-proxy
 node index.js
 
6. Open your browser and navigate to `http://localhost:3000`.

Start planning your meetups with React Meetly!
