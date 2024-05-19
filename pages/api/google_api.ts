<<<<<<< HEAD
// pages/api/google_api.ts
=======
>>>>>>> Meetly-Master/main
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { endpoint, params } = req.body;

  const apiUrl = `https://maps.googleapis.com/maps/api/${endpoint}/json`;

  try {
    const response = await axios.get(apiUrl, {
      params: {
        ...params,
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
}
