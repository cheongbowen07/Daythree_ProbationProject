import React, { useState } from "react";
import { Modal } from "./Modal";
import { Btn } from "../ui";

export default function ProfileEditModal({ rec, onClose, onSave }) {
  const [phone, setPhone] = useState(rec?.phone || "");
  const [email, setEmail] = useState(rec?.email || "");

  return (
    <Modal title={`Edit Profile: ${rec?.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contact Number</label>
          <input className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Work Email</label>
          <input className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <Btn className="w-full" onClick={() => onSave({ phone, email })}>Update Profile</Btn>
      </div>
    </Modal>
  );
}
