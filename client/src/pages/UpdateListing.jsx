import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const UpdateListing = () => {
  const apiBase = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { currentUser } = useSelector((s) => s.user);
  const params = useParams();

  const [files, setFiles] = useState([]); // File objects (new uploads)
  const [formData, setFormData] = useState({
    imageUrls: [], // mixture of objects {url, public_id} and blob strings
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      const res = await fetch(`${apiBase}/api/listing/getListing/${params.listingId}`);
      const data = await res.json();
      if (data.success === false) return console.error(data.message);

      setFormData((p) => ({
        ...p,
        ...data,
        imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
      }));
    };
    fetchListing();
  }, [params.listingId]);

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    if (id === "sale" || id === "rent")
      return setFormData((p) => ({ ...p, type: id }));
    if (id === "parking" || id === "furnished" || id === "offer")
      return setFormData((p) => ({ ...p, [id]: checked }));
    if (type === "number") setFormData((p) => ({ ...p, [id]: Number(value) }));
    else setFormData((p) => ({ ...p, [id]: value }));
  };

  const isBlob = (v) => typeof v === "string" && v.startsWith("blob:");

  // append selected files (so user can select multiple times)
  const handleFileInputChange = (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;
    setFiles((prev) => [...prev, ...picked]);
  };

  // create previews and append them to existing previews (don't replace)
  const handlePreview = () => {
    const existingStoredCount = (formData.imageUrls || []).filter(
      (it) => typeof it === "object" && it.url
    ).length;
    if (existingStoredCount + files.length > 6)
      return alert("Max 6 images allowed");
    if (!files.length) return alert("Please select images first");

    const previews = files.map((f) => URL.createObjectURL(f));
    setFormData((p) => ({
      ...p,
      imageUrls: [...(p.imageUrls || []), ...previews],
    }));
    alert("Images previewed (not uploaded yet)");
  };

  // remove image at index; if it's a blob preview, keep files in sync
  const removeImageAt = (index) => {
    const imgs = formData.imageUrls || [];
    const target = imgs[index];
    const src = typeof target === "string" ? target : target?.url || "";

    if (isBlob(src)) {
      // positions of blob previews in the imageUrls list
      const blobIndices = imgs
        .map((it, idx) => {
          const s = typeof it === "string" ? it : it?.url || "";
          return isBlob(s) ? idx : -1;
        })
        .filter((i) => i !== -1);

      const posInFiles = blobIndices.indexOf(index);
      if (posInFiles > -1) {
        setFiles((prev) => prev.filter((_, idx) => idx !== posInFiles));
      }
    }

    setFormData((p) => ({
      ...p,
      imageUrls: p.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      // stored images are objects with url/public_id; previews are blob strings
      const storedImages = (formData.imageUrls || []).filter(
        (it) => typeof it === "object" && it.url
      );
      const totalAfter = storedImages.length + files.length;
      if (totalAfter < 1) return setError("You must have at least one image.");
      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be less then regular price");
      if (totalAfter > 6) return setError("Max 6 images allowed");

      setLoading(true);

      let finalImageUrls = [...storedImages]; // keep objects with public_id

      // upload new files (if any) and append returned objects ({url, public_id})
      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append("images", f));
        const uploadRes = await fetch(`${apiBase}/api/listing/upload-images`, {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(uploadJson.message || "Upload failed");
        if (!Array.isArray(uploadJson.imageUrls))
          throw new Error("Upload did not return image urls");
        finalImageUrls = [...finalImageUrls, ...uploadJson.imageUrls];
      }

      // send update payload (imageUrls are objects with url & public_id)
      const payload = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        type: formData.type,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        regularPrice: Number(formData.regularPrice),
        discountPrice: Number(formData.discountPrice),
        offer: Boolean(formData.offer),
        parking: Boolean(formData.parking),
        furnished: Boolean(formData.furnished),
        imageUrls: finalImageUrls,
        userRef: currentUser?._id,
      };

      const res = await fetch(`${apiBase}/api/listing/update/${params.listingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);
      if (data.success === false) return setError(data.message);
      alert("Listing Updated Successfully");
      if (data._id) navigate(`/listing/${data._id}`);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <main className="p-3 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Update a Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            id="name"
            type="text"
            placeholder="Name"
            required
            onChange={handleChange}
            value={formData.name}
            className="border p-3 rounded-lg"
          />
          <textarea
            id="description"
            placeholder="Description"
            required
            onChange={handleChange}
            value={formData.description}
            className="border p-3 rounded-lg"
          />
          <input
            id="address"
            type="text"
            placeholder="Address"
            required
            onChange={handleChange}
            value={formData.address}
            className="border p-3 rounded-lg"
          />

          <div className="flex gap-6 flex-wrap">
            <label>
              <input
                id="sale"
                type="checkbox"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />{" "}
              Sell
            </label>
            <label>
              <input
                id="rent"
                type="checkbox"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />{" "}
              Rent
            </label>
            <label>
              <input
                id="parking"
                type="checkbox"
                onChange={handleChange}
                checked={!!formData.parking}
              />{" "}
              Parking spot
            </label>
            <label>
              <input
                id="furnished"
                type="checkbox"
                onChange={handleChange}
                checked={!!formData.furnished}
              />{" "}
              Furnished
            </label>
            <label>
              <input
                id="offer"
                type="checkbox"
                onChange={handleChange}
                checked={!!formData.offer}
              />{" "}
              Offer
            </label>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                id="bedrooms"
                type="number"
                min={1}
                max={10}
                required
                onChange={handleChange}
                value={formData.bedrooms}
                className="p-3 border rounded-lg"
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="bathrooms"
                type="number"
                min={1}
                max={10}
                required
                onChange={handleChange}
                value={formData.bathrooms}
                className="p-3 border rounded-lg"
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="regularPrice"
                type="number"
                min={50}
                max={1000000}
                required
                onChange={handleChange}
                value={formData.regularPrice}
                className="p-3 border rounded-lg"
              />
              <div>
                <p>Regular Price</p>
                <span className="text-xs">($ / Month)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="discountPrice"
                type="number"
                min={0}
                max={1000000}
                onChange={handleChange}
                value={formData.discountPrice}
                className="p-3 border rounded-lg"
              />
              <div>
                <p>Discount Price</p>
                <span className="text-xs">($ / Month)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:{" "}
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>

          <div className="flex gap-4">
            <input
              onChange={handleFileInputChange}
              type="file"
              id="images"
              accept="image/*"
              multiple
              className="p-3 border rounded w-full"
            />
            <button
              type="button"
              onClick={handlePreview}
              className="p-3 text-green-700 rounded border border-green-700 uppercase"
            >
              Preview
            </button>
          </div>

          {formData.imageUrls && formData.imageUrls.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {formData.imageUrls.map((img, i) => {
                const src = typeof img === "string" ? img : img?.url || "";
                return (
                  <div
                    key={i}
                    className="relative w-full h-28 rounded-lg overflow-hidden shadow"
                  >
                    <img
                      src={src}
                      alt={`preview-${i}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageAt(i)}
                      className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase"
          >
            {loading ? "Updating..." : "Update a Listing"}
          </button>

          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
};

export default UpdateListing;
