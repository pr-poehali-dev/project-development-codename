import { useState } from "react";
import type { Master } from "./useMasterProfile";

const PROFILE_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface UseMasterProfileEditProps {
  master: Master | null;
  setMaster: React.Dispatch<React.SetStateAction<Master | null>>;
  editName: string;
  setEditName: (v: string) => void;
  editCity: string;
  setEditCity: (v: string) => void;
  editAbout: string;
  setEditAbout: (v: string) => void;
  editCategories: string[];
  setEditCategories: (v: string[]) => void;
}

export function useMasterProfileEdit({
  master,
  setMaster,
  editName, setEditName,
  editCity, setEditCity,
  editAbout, setEditAbout,
  editCategories, setEditCategories,
}: UseMasterProfileEditProps) {
  const [pwOld, setPwOld] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true); setProfileSuccess("");
    try {
      const res = await fetch(PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_profile", master_id: master?.id, name: editName, city: editCity, about: editAbout, categories: editCategories }),
      });
      const data = await res.json();
      const d = typeof data === "string" ? JSON.parse(data) : data;
      if (d.success && d.master) {
        setMaster(d.master);
        setEditName(d.master.name || "");
        setEditCity(d.master.city || "");
        setEditAbout(d.master.about || "");
        setEditCategories(d.master.categories?.length ? d.master.categories : (d.master.category ? [d.master.category] : []));
        setProfileSuccess("Профиль сохранён!");
        setTimeout(() => setProfileSuccess(""), 3000);
      }
    } finally { setProfileLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwNew !== pwConfirm) { setPwError("Пароли не совпадают"); return; }
    if (pwNew.length < 6) { setPwError("Минимум 6 символов"); return; }
    setPwLoading(true); setPwError(""); setPwSuccess("");
    try {
      const res = await fetch(PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", master_id: master?.id, old_password: pwOld, new_password: pwNew }),
      });
      const data = await res.json();
      const d = typeof data === "string" ? JSON.parse(data) : data;
      if (d.error) { setPwError(d.error); return; }
      setPwSuccess("Пароль изменён!");
      setPwOld(""); setPwNew(""); setPwConfirm("");
      setTimeout(() => setPwSuccess(""), 3000);
    } finally { setPwLoading(false); }
  };

  return {
    profileLoading, profileSuccess,
    handleSaveProfile,
    pwOld, setPwOld,
    pwNew, setPwNew,
    pwConfirm, setPwConfirm,
    pwLoading, pwError, pwSuccess,
    handleChangePassword,
  };
}
