import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Contact = ({ listing }) => {
  const [landloard, setLandloard] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchLandloard = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`);
        const data = await res.json();
        setLandloard(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLandloard();
  }, []);

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <>
      {landloard && (
        <div className="flex flex-col gap-2">
          <p>
            Contact <span className="font-semibold">{landloard.username}</span>{" "}
            for{" "}
            <span className="font-semibold">{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name="message"
            id="message"
            rows={2}
            placeholder="Enter your message here"
            className="w-full border p-3 rounded-lg"
            value={message}
            onChange={handleChange}
          ></textarea>
          <Link
            className="bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95"
            to={`mailto:${landloard.email}?subject=Regarding ${listing.name}&body=${message}`}
          >
            Send Message
          </Link>
        </div>
      )}
    </>
  );
};

export default Contact;
