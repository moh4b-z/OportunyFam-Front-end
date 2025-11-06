"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../app/styles/SimpleAccountModal.module.css";

interface SimpleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    nome: string;
    email: string;
    telefone?: string | null;
    foto_perfil?: string | null;
  };
  childrenNames?: string[];
}

const SimpleAccountModal: React.FC<SimpleAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  childrenNames,
}) => {
  if (!isOpen) return null;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const storageKey = useMemo(
    () => `account_avatar_${(user.nome || "usuario").toLowerCase()}`,
    [user.nome]
  );
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const onPickAvatar = () => fileInputRef.current?.click();
  const onAvatarSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      try { localStorage.setItem(storageKey, dataUrl); } catch {}
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setAvatarUrl(saved);
    } catch {}
  }, [storageKey, isOpen]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Olá {user.nome.split(' ')[0]}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.profileBlock}>
            <div className={styles.profileAvatar}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" />
              ) : (
                <span>{(user.nome || "U").charAt(0).toUpperCase()}</span>
              )}
              <button className={styles.editBadge} aria-label="Editar foto" onClick={onPickAvatar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={onAvatarSelected}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className={styles.fields}>
            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>
                </svg>
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{maskEmail(user.email || "usuario@dominio.com")}</span>
              </div>
              <button className={styles.editBtn} aria-label="Editar email">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
              </button>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.26-1.26a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.label}>Numero:</span>
                <span className={styles.value}>{maskPhone(user.telefone || "11000000000")}</span>
              </div>
              <button className={styles.editBtn} aria-label="Editar número">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
              </button>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.leftIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172A2 2 0 0 0 11.414 16l.814-.814a6.5 6.5 0 1 0-4-4z"/>
                  <circle cx="16.5" cy="7.5" r=".5" fill="#f4a261"/>
                </svg>
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.label}>Senha:</span>
                <span className={styles.value}>****************</span>
              </div>
              <button className={styles.editBtn} aria-label="Editar senha">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.sectionHeader}>
            <span>Filhos:</span>
            <button className={styles.addBtn} aria-label="Adicionar filho">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="16" y1="11" x2="22" y2="11"/>
              </svg>
            </button>
          </div>

          <div className={styles.childrenList}>
            {(childrenNames && childrenNames.length ? childrenNames : ["Filho 1", "Filho 2"]).map((c, idx) => {
              const isOpenItem = expandedIndex === idx;
              return (
                <div className={styles.childCard} key={idx}>
                  <div className={styles.leftAccent} />
                  <div className={styles.childAvatar}>
                    <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt=""/>
                    <span className={styles.statusDot} />
                  </div>
                  <div className={styles.childName}>{c}</div>
                  <button className={styles.caret} onClick={() => setExpandedIndex(isOpenItem ? null : idx)} aria-label={isOpenItem ? "Recolher" : "Expandir"}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {isOpenItem ? (
                        <polyline points="8 15 12 11 16 15"/>
                      ) : (
                        <polyline points="8 9 12 13 16 9"/>
                      )}
                    </svg>
                  </button>

                  {isOpenItem && (
                    <div className={styles.childExpanded}>
                      <div className={styles.expandedHeader}>Instituições que faz parte:</div>
                      <div className={styles.institutionItem}>
                        <img className={styles.institutionIcon} alt="instituicoes" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJvb2stbWFya2VkLWljb24gbHVjaWRlLWJvb2stbWFya2VkIj48cGF0aCBkPSJNMTAgMnY4bDMtMyAzIDNWMiIvPjxwYXRoIGQ9Ik00IDE5LjV2LTE1QTIuNSAyLjUgMCAwIDEgNi41IDJIMTlhMSAxIDAgMCAxIDEgMXYxOGExIDEgMCAwIDEtMSAxSDYuNWExIDEgMCAwIDEgMC01SDIwIi8+PC9zdmc+" />
                        <div className={styles.institutionName}>CEU Parelheiros</div>
                      </div>
                      <div className={styles.institutionItem}>
                        <img className={styles.institutionIcon} alt="instituicoes" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJvb2stbWFya2VkLWljb24gbHVjaWRlLWJvb2stbWFya2VkIj48cGF0aCBkPSJNMTAgMnY4bDMtMyAzIDNWMiIvPjxwYXRoIGQ9Ik00IDE5LjV2LTE1QTIuNSAyLjUgMCAwIDEgNi41IDJIMTlhMSAxIDAgMCAxIDEgMXYxOGExIDEgMCAwIDEtMSAxSDYuNWExIDEgMCAwIDEgMC01SDIwIi8+PC9zdmc+" />
                        <div className={styles.institutionName}>CEU Butantã</div>
                      </div>

                      <div className={styles.childActions}>
                        <img className={styles.actionIcon} alt="remover-associacao" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIteC1pY29uIGx1Y2lkZS11c2VyLXgiPjxwYXRoIGQ9Ik0xNiAyMXYtMmE0IDQgMCAwIDAtNC00SDZhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iOSIgY3k9IjciIHI9IjQiLz48bGluZSB4MT0iMTciIHgyPSIyMiIgeTE9IjgiIHkyPSIxMyIvPjxsaW5lIHgxPSIyMiIgeDI9IjE3IiB5MT0iOCIgeTI9IjEzIi8+PC9zdmc+" />
                        <img className={styles.actionIcon} alt="config-associacao" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItY29nLWljb24gbHVjaWRlLXVzZXItY29nIj48cGF0aCBkPSJNMTAgMTVINmE0IDQgMCAwIDAtNCA0djIiLz48cGF0aCBkPSJtMTQuMzA1IDE2LjUzLjkyMy0uMzgyIi8+PHBhdGggZD0ibTE1LjIyOCAxMy44NTItLjkyMy0uMzgzIi8+PHBhdGggZD0ibTE2Ljg1MiAxMi4yMjgtLjM4My0uOTIzIi8+PHBhdGggZD0ibTE2Ljg1MiAxNy43NzItLjM4My45MjQiLz48cGF0aCBkPSJtMTkuMTQ4IDEyLjIyOC4zODMtLjkyMyIvPjxwYXRoIGQ9Im0xOS41MyAxOC42OTYtLjM4Mi0uOTI0Ii8+PHBhdGggZD0ibTIwLjc3MiAxMy44NTIuOTI0LS4zODMiLz48cGF0aCBkPSJtMjAuNzcyIDE2LjE0OC45MjQuMzgzIi8+PGNpcmNsZSBjeD0iMTgiIGN5PSIxNSIgcj0iMyIvPjxjaXJjbGUgY3g9IjkiIGN5PSI3IiByPSI0Ii8+PC9zdmc+" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAccountModal;

function maskEmail(e: string) {
  const [user, domain] = e.split("@");
  if (!user || !domain) return e;
  const maskedUser = user.length <= 2 ? "**" : user[0] + "*".repeat(Math.max(2, user.length - 2));
  const parts = domain.split(".");
  const maskedDomain = parts[0][0] + "*".repeat(Math.max(2, parts[0].length - 2)) + "." + parts.slice(1).join(".");
  return `${maskedUser}@${maskedDomain}`;
}

function maskPhone(p: string) {
  const digits = p.replace(/\D/g, "");
  const d = digits.padEnd(11, "0");
  return `11 ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}
