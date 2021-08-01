import axios from "axios";

export async function uploadImage(file) {
  const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const API_KEY = process.env.REACT_APP_CLOUDINARY_API_KEY;

  const form = new FormData();
  form.append("file", file);

  const {
    data: { signature, timestamp },
  } = await axios.get("/api/image-upload");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload?api_key=${API_KEY}&timestamp=${timestamp}&signature=${signature}`,
    {
      method: "POST",
      body: form,
    }
  );

  const data = await res.json();
  return data.secure_url;
}
