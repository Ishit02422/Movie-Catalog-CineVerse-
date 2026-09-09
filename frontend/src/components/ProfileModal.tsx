"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Save,
  Loader2,
  Lock,
} from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateProfile, deleteAccount } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);

  // Sync user state to form fields when modal opens or user updates
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || (user.name ? user.name.split(" ")[0] : ""));
      setSurname(user.surname || (user.name && user.name.split(" ").length > 1 ? user.name.split(" ").slice(1).join(" ") : ""));
      setGender(user.gender || "Male");
      setPhone(user.phone || "");
      setEmail(user.email || "");
      setShowDeleteConfirm(false);
      setSuccessMessage(null);
      setErrorMessage(null);
      setIsSaved(false);
    }
  }, [user, isOpen]);

  // Strict Realistic Human Name Validator (Anti-spam & Anti-gibberish)
  const validateName = (raw: string, fieldLabel: "First Name" | "Last Name"): string | null => {
    const name = raw.trim();
    if (!name) return `Please enter your ${fieldLabel}.`;
    if (name.length < 2) return `${fieldLabel} must be at least 2 characters long.`;
    if (name.length > 20) return `${fieldLabel} must be 20 characters or less.`;
    if (!/^[A-Za-z]+$/.test(name)) {
      return `${fieldLabel} can only contain English letters (A-Z, a-z). Numbers and symbols are not allowed.`;
    }
    // Anti-spam: No 3+ consecutive identical characters (e.g. "aaaa" or "llllll")
    if (/(.)\1{2,}/i.test(name)) {
      return `${fieldLabel} contains repeated letters. Please enter a valid name.`;
    }
    // Realistic human name: Must contain at least one vowel (a, e, i, o, u, y)
    if (!/[aeiouyAEIOUY]/.test(name)) {
      return `Please enter a realistic ${fieldLabel} containing vowels.`;
    }
    return null;
  };

  if (!isOpen || !user) return null;

  const handleUpdate = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setErrorMessage(null);
    setSuccessMessage(null);

    const firstErr = validateName(firstName, "First Name");
    if (firstErr) {
      setErrorMessage(firstErr);
      return;
    }

    if (surname.trim()) {
      const lastErr = validateName(surname, "Last Name");
      if (lastErr) {
        setErrorMessage(lastErr);
        return;
      }
    }

    if (phone && phone.trim().replace(/\D/g, "").length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({
        first_name: firstName.trim(),
        surname: surname.trim(),
        gender,
        phone: phone ? phone.trim().replace(/\D/g, "") : undefined,
        email: email.trim() ? email.trim().toLowerCase() : undefined,
      });

      setIsSaved(true);
      setSuccessMessage("✅ Profile updated successfully! Closing...");
      
      // Auto-close modal after brief visual confirmation so dashboard is displayed immediately
      setTimeout(() => {
        setSuccessMessage(null);
        setIsSaved(false);
        onClose();
      }, 900);
    } catch (err: any) {
      console.error("Profile update error:", err);
      setErrorMessage(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setErrorMessage(null);
    setIsDeleting(true);
    try {
      await deleteAccount();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  const initials = firstName
    ? `${firstName[0]}${surname ? surname[0] : ""}`.toUpperCase()
    : user.name
    ? user.name[0].toUpperCase()
    : "U";

  const displayName = (firstName || surname)
    ? `${firstName} ${surname}`.trim()
    : user.name || "Member";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 px-6 pt-6 pb-5 border-b border-slate-800/80 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 p-0.5 shadow-lg shadow-rose-500/20">
              <div className="w-12 h-12 rounded-[14px] bg-slate-900 flex items-center justify-center text-rose-400 font-bold text-lg">
                {initials}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {displayName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {phone ? `+91 ${phone}` : "Manage account details & preferences"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-lg shadow-emerald-500/10 animate-in slide-in-from-top duration-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold shadow-lg shadow-rose-500/10 animate-in slide-in-from-top duration-300">
              <div className="w-6 h-6 rounded-full bg-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Edit Form */}
          <form id="profile-form" onSubmit={handleUpdate} autoComplete="off" className="space-y-4">
            {/* Name Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  First Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="cineverse_firstname"
                    id="profile-firstname"
                    autoComplete="given-name"
                    autoCorrect="off"
                    spellCheck={false}
                    data-lpignore="true"
                    value={firstName}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^A-Za-z]/g, "");
                      setFirstName(sanitized);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onKeyDown={(e) => {
                      if (
                        !/^[A-Za-z]$/.test(e.key) &&
                        !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Enter first name"
                    maxLength={20}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="cineverse_surname"
                    id="profile-surname"
                    autoComplete="family-name"
                    autoCorrect="off"
                    spellCheck={false}
                    data-lpignore="true"
                    value={surname}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^A-Za-z]/g, "");
                      setSurname(sanitized);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onKeyDown={(e) => {
                      if (
                        !/^[A-Za-z]$/.test(e.key) &&
                        !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Enter last name"
                    maxLength={20}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Male", "Female", "Other"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      gender === g
                        ? "bg-rose-500/15 border-rose-500 text-rose-300 shadow-sm shadow-rose-500/10 font-semibold"
                        : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs font-semibold">
                  +91
                </div>
                <input
                  type="tel"
                  name="cineverse_phone"
                  id="profile-phone"
                  inputMode="numeric"
                  autoComplete="off"
                  data-lpignore="true"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full pl-11 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Email Field (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="cineverse_email"
                  id="profile-email"
                  autoComplete="off"
                  data-lpignore="true"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                />
              </div>
            </div>
          </form>

          {/* Account Deletion / Danger Zone */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="bg-rose-950/15 border border-rose-900/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Danger Zone</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Permanently delete your profile and account data from CineVerse.
                  </p>
                </div>

                {!showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-medium transition-all active:scale-95 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </button>
                )}
              </div>

              {/* Confirmation prompt */}
              {showDeleteConfirm && (
                <div className="pt-2 border-t border-rose-900/30 space-y-2.5 animate-in fade-in duration-200">
                  <p className="text-xs font-semibold text-rose-300">
                    Are you sure you want to permanently delete your account? This action cannot be undone.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleDelete}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-md shadow-rose-600/25 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Yes, Delete My Account</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-950/80 px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-all cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating}
            className={`px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer ${
              isSaved
                ? "bg-emerald-600 shadow-emerald-600/25"
                : "bg-rose-600 hover:bg-rose-500 active:bg-rose-700 shadow-rose-600/25 disabled:opacity-50"
            }`}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
