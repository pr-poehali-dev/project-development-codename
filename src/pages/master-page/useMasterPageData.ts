import { useState, useEffect } from "react";
import { Master, Service, Review, PROFILE_URL } from "./masterPageTypes";

export function useMasterPageData() {
  const [master, setMaster] = useState<Master | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const masterId = new URLSearchParams(window.location.search).get("id");
    if (!masterId) { setNotFound(true); setLoading(false); return; }

    fetch(`${PROFILE_URL}?master_id=${masterId}`)
      .then((r) => r.json())
      .then((data) => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed.error) { setNotFound(true); return; }
        setMaster(parsed.master);
        setRating(parsed.rating);
        setReviewsTotal(parsed.reviews_total);
        setReviews(parsed.reviews || []);
        setServices(parsed.services || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return { master, rating, reviewsTotal, reviews, services, loading, notFound };
}
