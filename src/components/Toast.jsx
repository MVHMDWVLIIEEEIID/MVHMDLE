// components/Toast.jsx
import React from "react";

export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-lifecycle-bottom {
          0% { opacity: 0; transform: translateY(100%) scale(0.9); }
          10% { opacity: 1; transform: translateY(0) scale(1); }
          85% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(100%) scale(0.9); }
        }
        .animate-toast-lifecycle {
          animation: toast-lifecycle-bottom 2.5s ease-in-out forwards;
        }
      `}</style>

      <div className="toast toast-bottom toast-end z-[9999] flex flex-col items-end gap-2 mb-4 mr-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              alert shadow-lg flex flex-row items-center gap-2 p-3 rounded-lg 
              animate-toast-lifecycle pointer-events-auto min-w-60
              ${t.type === "success" ? "alert-success bg-green-500/95 text-white border-none" : ""}
              ${t.type === "error" ? "alert-error bg-red-500/95 text-white border-none" : ""}
              ${t.type === "info" ? "alert-info bg-blue-500/95 text-white border-none" : ""}
              ${t.type === "special" ? "bg-red-500 text-white border-none shadow-[0_0_15px_rgba(239,68,68,0.5)]" : ""}
            `}
          >
            {/* Clean Success Checkmark */}
            {t.type === "success" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}

            {/* Clean Error X-Circle */}
            {t.type === "error" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}

            {/* Clean Info Circle */}
            {t.type === "info" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
            )}

            {/* Special Floating Heart Trigger (Now Red) */}
            {t.type === "special" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="shrink-0 h-6 w-6"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            )}

            <span className="font-bold text-sm uppercase tracking-wide">
              {t.msg}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
